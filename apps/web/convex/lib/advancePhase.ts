import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { getGameHandlers } from "../gameHandlers";

// Ensure game handlers are registered before any phase advancement
import "../games/duel";
import "../games/bluff";

/** Default phase durations in ms */
export const DEFAULT_DURATIONS: Record<string, number> = {
  submit: 60_000,
  vote: 30_000,
  reveal: 10_000,
  scores: 8_000,
};

const SETTINGS_KEY: Record<string, string> = {
  submit: "submitTime",
  vote: "voteTime",
  reveal: "revealTime",
  scores: "scoresTime",
};

/** Get phase duration, respecting room settings overrides */
export function getPhaseDuration(phase: string, settings?: Record<string, unknown>): number {
  const key = SETTINGS_KEY[phase];
  if (key && settings && typeof settings[key] === "number") {
    return settings[key] as number;
  }
  return DEFAULT_DURATIONS[phase] ?? 0;
}


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

  const duration = getPhaseDuration(nextPhase, room.settings as Record<string, unknown> | undefined);
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
