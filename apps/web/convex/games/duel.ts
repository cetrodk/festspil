import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { registerGameHandlers } from "../gameHandlers";

registerGameHandlers("duel", {
  async setupRound(ctx, room, players) {
    // Pick a random prompt
    const allPrompts = await ctx.db
      .query("prompts")
      .withIndex("by_game", (q) => q.eq("gameType", "duel"))
      .collect();

    if (allPrompts.length === 0) {
      // Fallback prompt if none seeded
      return {
        promptText: "Hvad er det bedste ved at være dansk?",
        promptId: null,
      };
    }

    const prompt = allPrompts[Math.floor(Math.random() * allPrompts.length)];
    return {
      promptText: prompt.text,
      promptId: prompt._id,
    };
  },

  async onSubmission(ctx, room, player, content) {
    const text = String(content).trim().slice(0, 280);
    if (!text) throw new Error("Tomt svar");

    // Check for duplicate submission
    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_player_round", (q) =>
        q.eq("playerId", player._id).eq("round", room.roundNumber!),
      )
      .first();

    if (existing && existing.phase === "submit") {
      // Update existing submission
      await ctx.db.patch(existing._id, { content: text });
      return;
    }

    await ctx.db.insert("submissions", {
      roomId: room._id,
      playerId: player._id,
      round: room.roundNumber!,
      phase: "submit",
      content: text,
      createdAt: Date.now(),
    });
  },

  async buildVoteData(ctx, room, players) {
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_room_round_phase", (q) =>
        q
          .eq("roomId", room._id)
          .eq("round", room.roundNumber!)
          .eq("phase", "submit"),
      )
      .collect();

    // Build matchup pairs (all answers compete, presented as pairs)
    // Simple approach: create one matchup per pair of adjacent answers
    const shuffled = [...submissions].sort(() => Math.random() - 0.5);
    const matchups: Array<{
      id: string;
      answers: Array<{ id: string; text: string; playerId: string }>;
    }> = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        matchups.push({
          id: `matchup-${i}`,
          answers: [
            {
              id: shuffled[i]._id,
              text: String(shuffled[i].content),
              playerId: shuffled[i].playerId,
            },
            {
              id: shuffled[i + 1]._id,
              text: String(shuffled[i + 1].content),
              playerId: shuffled[i + 1].playerId,
            },
          ],
        });
      }
    }

    // If odd number, last person gets added to last matchup
    if (shuffled.length % 2 === 1 && matchups.length > 0) {
      const last = shuffled[shuffled.length - 1];
      matchups[matchups.length - 1].answers.push({
        id: last._id,
        text: String(last.content),
        playerId: last.playerId,
      });
    }

    return {
      ...room.phaseData,
      matchups,
      // Anonymized version for players (strip playerIds)
      matchupsAnonymized: matchups.map((m) => ({
        id: m.id,
        answers: m.answers.map((a) => ({ id: a.id, text: a.text })),
      })),
    };
  },

  async onVote(ctx, room, player, content) {
    const vote = String(content); // submission ID they voted for

    // Check for duplicate vote
    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_player_round", (q) =>
        q.eq("playerId", player._id).eq("round", room.roundNumber!),
      )
      .filter((q) => q.eq(q.field("phase"), "vote"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { content: vote });
      return;
    }

    await ctx.db.insert("submissions", {
      roomId: room._id,
      playerId: player._id,
      round: room.roundNumber!,
      phase: "vote",
      content: vote,
      createdAt: Date.now(),
    });
  },

  async computeResults(ctx, room, players) {
    const [submissions, votes] = await Promise.all([
      ctx.db
        .query("submissions")
        .withIndex("by_room_round_phase", (q) =>
          q
            .eq("roomId", room._id)
            .eq("round", room.roundNumber!)
            .eq("phase", "submit"),
        )
        .collect(),
      ctx.db
        .query("submissions")
        .withIndex("by_room_round_phase", (q) =>
          q
            .eq("roomId", room._id)
            .eq("round", room.roundNumber!)
            .eq("phase", "vote"),
        )
        .collect(),
    ]);

    // Tally votes per answer
    const voteCounts = new Map<string, number>();
    for (const vote of votes) {
      const answerId = String(vote.content);
      voteCounts.set(answerId, (voteCounts.get(answerId) ?? 0) + 1);
    }

    // Calculate scores: 1000 points per vote received
    const scoreDeltas = new Map<Id<"players">, number>();
    const results: Array<{
      answerId: string;
      text: string;
      playerId: string;
      playerName: string;
      avatarColor: string;
      votes: number;
    }> = [];

    for (const sub of submissions) {
      const voteCount = voteCounts.get(sub._id) ?? 0;
      const delta = voteCount * 1000;
      const player = players.find((p) => p._id === sub.playerId);

      if (delta > 0) {
        scoreDeltas.set(
          sub.playerId,
          (scoreDeltas.get(sub.playerId) ?? 0) + delta,
        );
      }

      results.push({
        answerId: sub._id,
        text: String(sub.content),
        playerId: sub.playerId,
        playerName: player?.name ?? "???",
        avatarColor: player?.avatarColor ?? "#888",
        votes: voteCount,
      });
    }

    // Sort by votes descending
    results.sort((a, b) => b.votes - a.votes);

    return {
      phaseData: {
        ...room.phaseData,
        results,
        totalVotes: votes.length,
      },
      scoreDeltas,
    };
  },
});
