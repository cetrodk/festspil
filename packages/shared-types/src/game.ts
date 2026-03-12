export interface PhaseDefinition {
  id: string;
  name: string;
  durationSeconds: (playerCount: number) => number;
}

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  phases: PhaseDefinition[];
  totalRounds: (playerCount: number) => number;
}
