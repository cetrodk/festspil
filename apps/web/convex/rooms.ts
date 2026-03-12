import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { generateRoomCode } from "./lib/roomCodes";

export const createRoom = mutation({
  args: {
    gameType: v.string(),
    hostId: v.string(),
  },
  handler: async (ctx, { gameType, hostId }) => {
    // Generate a unique room code
    let code: string;
    let attempts = 0;
    do {
      code = generateRoomCode();
      const existing = await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (!existing) break;
      attempts++;
    } while (attempts < 100);

    if (attempts >= 100) {
      throw new Error("Could not generate unique room code");
    }

    const roomId = await ctx.db.insert("rooms", {
      code,
      hostId,
      gameType,
      status: "lobby",
      createdAt: Date.now(),
    });

    return { roomId, code };
  },
});

export const getRoom = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();

    if (!room) return null;

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    // During submit/vote, check which players have submitted
    const phase = room.currentPhase;
    if (phase === "submit" || phase === "vote") {
      const submissions = await ctx.db
        .query("submissions")
        .withIndex("by_room_round_phase", (q) =>
          q
            .eq("roomId", room._id)
            .eq("round", room.roundNumber!)
            .eq("phase", phase),
        )
        .collect();

      const submittedPlayerIds = new Set(
        submissions.map((s) => s.playerId.toString()),
      );

      return {
        ...room,
        players: players.map((p) => ({
          ...p,
          hasSubmitted: submittedPlayerIds.has(p._id.toString()),
        })),
      };
    }

    return { ...room, players };
  },
});

export const getRoomForPlayer = query({
  args: {
    code: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { code, sessionId }) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();

    if (!room) return null;

    // Parallel reads: players + current player + submissions
    const [players, currentPlayer, submissions] = await Promise.all([
      ctx.db
        .query("players")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect(),
      ctx.db
        .query("players")
        .withIndex("by_session_room", (q) =>
          q.eq("sessionId", sessionId).eq("roomId", room._id),
        )
        .first(),
      room.roundNumber !== undefined
        ? ctx.db
            .query("submissions")
            .withIndex("by_room_round_phase", (q) =>
              q
                .eq("roomId", room._id)
                .eq("round", room.roundNumber!)
                .eq("phase", room.currentPhase ?? ""),
            )
            .collect()
        : Promise.resolve([]),
    ]);

    // Filter phaseData based on current phase
    let filteredPhaseData = room.phaseData;
    const phase = room.currentPhase;

    if (phase === "submit") {
      // During submit: show prompt but hide all answers
      // Only show if this player has already submitted
      const mySubmission = submissions.find(
        (s) => currentPlayer && s.playerId === currentPlayer._id,
      );
      filteredPhaseData = {
        ...room.phaseData,
        mySubmission: mySubmission?.content ?? null,
        submittedCount: submissions.length,
        totalPlayers: players.length,
      };
    } else if (phase === "vote") {
      // During vote: show anonymized answers, strip authorship
      const myVote = submissions.find(
        (s) =>
          currentPlayer &&
          s.playerId === currentPlayer._id &&
          s.phase === "vote",
      );
      filteredPhaseData = {
        ...room.phaseData,
        myVote: myVote?.content ?? null,
      };
    }
    // During reveal/scores: return everything

    return {
      _id: room._id,
      code: room.code,
      gameType: room.gameType,
      status: room.status,
      currentPhase: room.currentPhase,
      phaseData: filteredPhaseData,
      phaseDeadline: room.phaseDeadline,
      roundNumber: room.roundNumber,
      totalRounds: room.totalRounds,
      players: players.map((p) => ({
        _id: p._id,
        name: p.name,
        avatarColor: p.avatarColor,
        score: p.score,
        isConnected: p.isConnected,
        hasSubmitted: submissions.some((s) => s.playerId === p._id),
      })),
      currentPlayerId: currentPlayer?._id ?? null,
    };
  },
});

export const getRoomByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();
  },
});
