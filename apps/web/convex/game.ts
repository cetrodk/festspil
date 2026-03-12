import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getGameHandlers } from "./gameHandlers";
import { advancePhaseInternal, PHASE_DURATIONS } from "./lib/advancePhase";

// Ensure game handlers are registered
import "./games/duel";

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

export const hostAdvance = mutation({
  args: {
    roomId: v.id("rooms"),
    hostId: v.string(),
  },
  handler: async (ctx, { roomId, hostId }) => {
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");
    if (room.hostId !== hostId) throw new Error("Only the host can advance");
    if (room.status !== "playing") return;

    await advancePhaseInternal(ctx, room, "HOST_ADVANCE");
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
        .withIndex("by_session_room", (q) =>
          q.eq("sessionId", sessionId).eq("roomId", roomId),
        )
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
