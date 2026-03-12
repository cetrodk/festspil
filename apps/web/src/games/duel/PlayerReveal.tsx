import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function PlayerReveal({ room }: PhaseComponentProps) {
  // Find this player's score
  const currentPlayer = room.players?.find(
    (p: any) => p._id === room.currentPlayerId,
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <p className="text-2xl font-bold">{da.lookAtScreen}</p>
      {currentPlayer ? (
        <p className="text-4xl font-black text-[var(--color-primary)]">
          {currentPlayer.score} {da.scores.toLowerCase()}
        </p>
      ) : null}
    </div>
  );
}
