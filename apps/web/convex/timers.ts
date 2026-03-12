import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { advancePhaseInternal } from "./lib/advancePhase";

/**
 * Scheduled timer callback. Fires when a phase deadline expires.
 * Guard: only advances if the deadline still matches (prevents stale timers
 * from a phase that already ended via ALL_SUBMITTED).
 */
export const onTimerExpired = internalMutation({
  args: {
    roomId: v.id("rooms"),
    expectedDeadline: v.float64(),
  },
  handler: async (ctx, { roomId, expectedDeadline }) => {
    const room = await ctx.db.get(roomId);
    if (!room) return;
    if (room.phaseDeadline !== expectedDeadline) return; // stale timer
    if (room.status !== "playing") return;

    await advancePhaseInternal(ctx, room, "TIMER_EXPIRED");
  },
});
