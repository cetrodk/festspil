import { mutation, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { getGameHandlers } from "./gameHandlers";

// Import game handlers so they register themselves
import "./games/duel";

/** Phase durations in ms, keyed by phase name */
const PHASE_DURATIONS: Record<string, (playerCount: number) => number> = {
  submit: () => 60_000,
  vote: () => 30_000,
  reveal: () => 0, // auto-advance, no timer
  scores: () => 8_000,
};

// ── Public mutations ──────────────────────────────────────────────────

export const startGame = mutation({
  args: {
    roomId: v.id("rooms"),
    hostId: v.string(),
  },
  handler: async (ctx, { roomId, hostId }) => {
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");
    if (room.hostId !== hostId) throw new Error("Only the host can start");
    if (room.status !== "lobby") throw new Error("Game already started");

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();

    if (players.length < 2) throw new Error("Need at least 2 players");

    const totalRounds = Math.min(players.length, 3);
    const handlers = getGameHandlers(room.gameType);
    const roundData = await handlers.setupRound(
      ctx,
      { ...room, roundNumber: 1, totalRounds },
      players,
    );

    const deadline = Date.now() + PHASE_DURATIONS.submit(players.length);
    await ctx.db.patch(roomId, {
      status: "playing",
      currentPhase: "submit",
      roundNumber: 1,
      totalRounds,
      phaseData: roundData,
      phaseDeadline: deadline,
    });

    await ctx.scheduler.runAt(
      deadline,
      internal.timers.onTimerExpired,
      { roomId, expectedDeadline: deadline },
    );
  },
});

export const submitAnswer = mutation({
  args: {
    roomId: v.id("rooms"),
    sessionId: v.string(),
    content: v.any(),
  },
  handler: async (ctx, { roomId, sessionId, content }) => {
    const [room, player] = await Promise.all([
      ctx.db.get(roomId),
      ctx.db
        .query("players")
        .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
        .first(),
    ]);

    if (!room || !player) throw new Error("Not found");
    if (room.currentPhase !== "submit" && room.currentPhase !== "vote") {
      throw new Error("Not accepting submissions");
    }

    // Check deadline (2s grace for network latency)
    if (room.phaseDeadline && Date.now() > room.phaseDeadline + 2000) {
      return; // silently drop late submissions
    }

    const phase = room.currentPhase;
    const handlers = getGameHandlers(room.gameType);

    if (phase === "submit") {
      await handlers.onSubmission(ctx, room, player, content);
    } else if (phase === "vote") {
      await handlers.onVote(ctx, room, player, content);
    }

    // Check if all players have submitted
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_room_round_phase", (q) =>
        q
          .eq("roomId", roomId)
          .eq("round", room.roundNumber!)
          .eq("phase", phase),
      )
      .collect();

    if (submissions.length >= players.length) {
      await advancePhaseInternal(ctx, room, "ALL_SUBMITTED");
    }
  },
});

// ── Internal phase advancement ────────────────────────────────────────

export async function advancePhaseInternal(
  ctx: MutationCtx,
  room: Doc<"rooms">,
  _event: string,
) {
  const currentPhase = room.currentPhase;
  if (!currentPhase) return;

  const players = await ctx.db
    .query("players")
    .withIndex("by_room", (q) => q.eq("roomId", room._id))
    .collect();

  const handlers = getGameHandlers(room.gameType);
  let nextPhase: string;
  let nextPhaseData: Record<string, unknown> = room.phaseData ?? {};

  if (currentPhase === "submit") {
    nextPhase = "vote";
    nextPhaseData = await handlers.buildVoteData(ctx, room, players);
  } else if (currentPhase === "vote") {
    nextPhase = "reveal";
    const { phaseData, scoreDeltas } = await handlers.computeResults(
      ctx,
      room,
      players,
    );
    nextPhaseData = phaseData;

    // Apply score deltas
    for (const [playerId, delta] of scoreDeltas) {
      const player = players.find((p) => p._id === playerId);
      if (player) {
        await ctx.db.patch(playerId, { score: player.score + delta });
      }
    }
  } else if (currentPhase === "reveal") {
    const roundNumber = room.roundNumber ?? 1;
    const totalRounds = room.totalRounds ?? 1;

    if (roundNumber >= totalRounds) {
      nextPhase = "finished";
      await ctx.db.patch(room._id, {
        currentPhase: "finished",
        status: "finished",
        phaseDeadline: undefined,
      });
      return;
    }

    nextPhase = "scores";
  } else if (currentPhase === "scores") {
    // Start next round
    nextPhase = "submit";
    const nextRound = (room.roundNumber ?? 1) + 1;
    nextPhaseData = await handlers.setupRound(
      ctx,
      { ...room, roundNumber: nextRound },
      players,
    );
    await ctx.db.patch(room._id, { roundNumber: nextRound });
  } else {
    return;
  }

  const durationFn = PHASE_DURATIONS[nextPhase];
  const duration = durationFn ? durationFn(players.length) : 0;
  const deadline = duration > 0 ? Date.now() + duration : undefined;

  await ctx.db.patch(room._id, {
    currentPhase: nextPhase,
    phaseData: nextPhaseData,
    phaseDeadline: deadline,
  });

  if (deadline) {
    await ctx.scheduler.runAt(
      deadline,
      internal.timers.onTimerExpired,
      { roomId: room._id, expectedDeadline: deadline },
    );
  }
}
