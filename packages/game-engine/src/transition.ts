import { createActor } from "xstate";
import { gameMachine, type GameContext, type GameEvent } from "./machines/gameMachine";

/**
 * Pure transition function: given current phase + event, returns next phase.
 * Used by Convex mutations to compute state transitions without running an actor.
 */
export function getNextPhase(
  currentPhase: string,
  event: GameEvent,
  context: GameContext,
): string {
  const resolvedState = gameMachine.resolveState({
    value: currentPhase,
    context,
  });
  const actor = createActor(gameMachine, { snapshot: resolvedState });
  actor.start();
  actor.send(event);
  const next = actor.getSnapshot().value as string;
  actor.stop();
  return next;
}
