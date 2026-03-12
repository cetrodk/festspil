export type RoomStatus = "lobby" | "playing" | "finished";

export interface Room {
  _id: string;
  code: string;
  hostId: string;
  gameType: string;
  status: RoomStatus;
  currentPhase?: string;
  phaseData?: unknown;
  phaseDeadline?: number;
  roundNumber?: number;
  totalRounds?: number;
  createdAt: number;
}

export interface Player {
  _id: string;
  roomId: string;
  name: string;
  sessionId: string;
  avatarColor: string;
  score: number;
  isConnected: boolean;
  lastSeen: number;
}

export interface Submission {
  _id: string;
  roomId: string;
  playerId: string;
  round: number;
  phase: string;
  content: unknown;
  createdAt: number;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  avatarColor: string;
  score: number;
  delta: number;
}
