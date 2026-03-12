import { motion } from "framer-motion";
import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function HostScores({ room }: PhaseComponentProps) {
  const players = [...(room.players ?? [])].sort(
    (a: any, b: any) => b.score - a.score,
  );

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-3xl font-bold">{da.scores}</h2>

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
    </div>
  );
}
