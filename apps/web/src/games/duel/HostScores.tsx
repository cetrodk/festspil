import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function HostScores({ room, sessionId }: PhaseComponentProps) {
  const hostAdvance = useMutation(api.game.hostAdvance);
  const players = [...(room.players ?? [])].sort(
    (a: any, b: any) => b.score - a.score,
  );

  const isLastRound = (room.roundNumber ?? 1) >= (room.totalRounds ?? 1);

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-3xl font-bold">{da.scores}</h2>
      <p className="text-sm text-[var(--color-text-muted)]">
        {da.round} {room.roundNumber} {da.of} {room.totalRounds}
      </p>

      <div className="w-full max-w-lg flex flex-col gap-3">
        {players.map((player: any, i: number) => (
          <motion.div
            key={player._id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-4 rounded-xl bg-[var(--color-surface)] p-4"
          >
            <span className="text-2xl font-black text-[var(--color-text-muted)] w-8">
              {i + 1}
            </span>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm"
              style={{ backgroundColor: player.avatarColor }}
            >
              {player.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="flex-1 font-semibold">{player.name}</span>
            <motion.span
              key={player.score}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-2xl font-black text-[var(--color-primary)]"
            >
              {player.score}
            </motion.span>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => hostAdvance({ roomId: room._id, hostId: sessionId })}
          className="rounded-xl bg-[var(--color-primary)] px-10 py-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isLastRound ? da.gameOver : da.nextRound}
        </button>
        <span className="text-sm text-[var(--color-text-muted)]">
          <CountdownTimer deadline={room.phaseDeadline ?? null} />s
        </span>
      </div>
    </div>
  );
}
