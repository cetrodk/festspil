import { lazy, type ComponentType } from "react";

export interface PhaseComponentProps {
  room: any;
  sessionId: string;
}

interface GameComponents {
  host: Record<string, ComponentType<PhaseComponentProps>>;
  player: Record<string, ComponentType<PhaseComponentProps>>;
}

export const gameComponents: Record<string, GameComponents> = {
  duel: {
    host: {
      submit: lazy(() => import("./duel/HostSubmit")),
      vote: lazy(() => import("./duel/HostVote")),
      reveal: lazy(() => import("./duel/HostReveal")),
      scores: lazy(() => import("./duel/HostScores")),
    },
    player: {
      submit: lazy(() => import("./duel/PlayerSubmit")),
      vote: lazy(() => import("./duel/PlayerVote")),
      reveal: lazy(() => import("./duel/PlayerReveal")),
      scores: lazy(() => import("./duel/PlayerReveal")), // same passive view
    },
  },
};
