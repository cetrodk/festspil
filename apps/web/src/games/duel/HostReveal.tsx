import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function HostReveal({ room, sessionId }: PhaseComponentProps) {
  const hostAdvance = useMutation(api.game.hostAdvance);
  const phaseData = room.phaseData ?? {};
  const results = phaseData.results ?? [];
  const promptText = phaseData.promptText ?? "";

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="max-w-2xl text-center text-2xl font-bold text-[var(--color-text-muted)]">
        {promptText}
      </div>

      <div className="flex w-full max-w-3xl flex-col gap-4">
        {results.map((result: any, i: number) => (
          <motion.div
            key={result.answerId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3 }}
            className="flex items-center gap-4 rounded-2xl bg-[var(--color-surface)] p-5"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-white font-bold"
              style={{ backgroundColor: result.avatarColor }}
            >
              {result.playerName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-xl font-semibold">{result.text}</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {result.playerName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-[var(--color-primary)]">
                {result.votes}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {result.votes === 1 ? "stemme" : "stemmer"}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {results.length > 0 && results[0].votes > 0 ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: results.length * 0.3 + 0.5, type: "spring" }}
          className="text-center"
        >
          <p className="text-sm text-[var(--color-text-muted)]">{da.duel.winner}</p>
          <p className="text-3xl font-black">{results[0].playerName}</p>
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: results.length * 0.3 + 1 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => hostAdvance({ roomId: room._id, hostId: sessionId })}
          className="rounded-xl bg-[var(--color-primary)] px-10 py-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {da.nextRound}
        </button>
        <span className="text-sm text-[var(--color-text-muted)]">
          <CountdownTimer deadline={room.phaseDeadline ?? null} />s
        </span>
      </motion.div>
    </div>
  );
}
