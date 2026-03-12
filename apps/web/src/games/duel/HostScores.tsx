import { useEffect } from "react";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { sfxScore } from "@/lib/sounds";
import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function HostScores({ room, sessionId }: PhaseComponentProps) {
  const hostAdvance = useMutation(api.game.hostAdvance);
  const players = [...(room.players ?? [])].sort(
    (a: any, b: any) => b.score - a.score,
  );

  const isLastRound = (room.roundNumber ?? 1) >= (room.totalRounds ?? 1);

  useEffect(() => {
    // Staggered score sounds
    players.forEach((_, i) => {
      setTimeout(sfxScore, i * 150 + 100);
    });
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        {da.scores}
      </motion.h2>
      <p className="text-sm text-[var(--color-text-muted)]">
        {da.round} {room.roundNumber} {da.of} {room.totalRounds}
      </p>

      <div className="w-full max-w-lg flex flex-col gap-3">
        {players.map((player: any, i: number) => (
          <motion.div
            key={player._id}
            layout
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, type: "spring", stiffness: 200 }}
            className={`flex items-center gap-4 rounded-xl p-4 ${
              i === 0
                ? "bg-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]/30"
                : "bg-[var(--color-surface)]"
            }`}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.15 + 0.1, type: "spring" }}
              className={`text-2xl font-black w-8 ${
                i === 0 ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
              }`}
            >
              {i + 1}
            </motion.span>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: player.avatarColor }}
            >
              {player.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="flex-1 font-semibold">{player.name}</span>
            <motion.span
              key={player.score}
              initial={{ scale: 1.4, color: "#a78bfa" }}
              animate={{ scale: 1, color: "var(--color-primary)" }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-black"
            >
              {player.score}
            </motion.span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: players.length * 0.15 + 0.3 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => hostAdvance({ roomId: room._id, hostId: sessionId })}
          className="rounded-xl bg-[var(--color-primary)] px-10 py-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isLastRound ? da.gameOver : da.nextRound}
        </button>
        <span className="text-sm text-[var(--color-text-muted)]">
          <CountdownTimer deadline={room.phaseDeadline ?? null} />s
        </span>
      </motion.div>
    </div>
  );
}
