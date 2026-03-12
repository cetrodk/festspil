import { setup } from "xstate";

export type GameEvent =
  | { type: "START_GAME" }
  | { type: "ALL_SUBMITTED" }
  | { type: "TIMER_EXPIRED" }
  | { type: "ALL_VOTED" }
  | { type: "REVEAL_DONE" }
  | { type: "NEXT_ROUND" }
  | { type: "GAME_OVER" };

export interface GameContext {
  gameType: string;
  roundNumber: number;
  totalRounds: number;
  playerCount: number;
}

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  guards: {
    hasMoreRounds: ({ context }) => context.roundNumber < context.totalRounds,
  },
}).createMachine({
  id: "game",
  initial: "lobby",
  states: {
    lobby: {
      on: { START_GAME: "submit" },
    },
    submit: {
      on: {
        ALL_SUBMITTED: "vote",
        TIMER_EXPIRED: "vote",
      },
    },
    vote: {
      on: {
        ALL_VOTED: "reveal",
        TIMER_EXPIRED: "reveal",
      },
    },
    reveal: {
      on: {
        REVEAL_DONE: [
          { guard: "hasMoreRounds", target: "scores" },
          { target: "finished" },
        ],
      },
    },
    scores: {
      on: {
        NEXT_ROUND: "submit",
      },
    },
    finished: {
      type: "final",
    },
  },
});
