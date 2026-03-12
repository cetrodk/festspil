import { useEffect } from "react";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { sfxReveal, sfxFanfare } from "@/lib/sounds";
import { GameAvatar } from "@/components/GameAvatar";
import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function HostReveal({ room, sessionId }: PhaseComponentProps) {
  const hostAdvance = useMutation(api.game.hostAdvance);
  const phaseData = room.phaseData ?? {};
  const results = phaseData.results ?? [];
  const promptText = phaseData.promptText ?? "";
  const hasWinner = results.length > 0 && results[0].votes > 0;
  const isLastRound = (room.roundNumber ?? 1) >= (room.totalRounds ?? 1);

  useEffect(() => {
    sfxReveal();
    if (hasWinner) {
      const t = setTimeout(sfxFanfare, results.length * 300 + 500);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl text-center text-2xl font-bold text-[var(--color-text-muted)]"
      >
        {promptText}
      </motion.div>

      <div className="flex w-full max-w-3xl flex-col gap-4">
        {results.map((result: any, i: number) => {
          const isTop = i === 0 && result.votes > 0;
          return (
            <motion.div
              key={result.answerId}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.4, type: "spring", stiffness: 200 }}
              className={`flex items-center gap-4 rounded-2xl p-5 ${
                isTop
                  ? "bg-[var(--color-primary)]/15 ring-2 ring-[var(--color-primary)]"
                  : "bg-[var(--color-surface)]"
              }`}
            >
              <GameAvatar
                name={result.playerName}
                avatarColor={result.avatarColor}
                avatarImage={result.avatarImage}
                className="h-12 w-12"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xl font-semibold">{result.text}</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {result.playerName}
                </p>
              </div>

              {/* Vote bar */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="h-8 rounded-full bg-[var(--color-primary)]"
                  initial={{ width: 0 }}
                  animate={{ width: Math.max(result.votes * 40, 8) }}
                  transition={{ delay: i * 0.4 + 0.2, duration: 0.5 }}
                />
                <div className="text-right min-w-[3rem]">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.4 + 0.4 }}
                    className="text-3xl font-black text-[var(--color-primary)]"
                  >
                    {result.votes}
                  </motion.p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {result.votes === 1 ? "stemme" : "stemmer"}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {hasWinner ? (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: results.length * 0.4 + 0.5, type: "spring", stiffness: 150 }}
          className="text-center"
        >
          <p className="text-sm text-[var(--color-text-muted)]">{da.duel.winner}</p>
          <p className="text-3xl font-black">{results[0].playerName}</p>
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: results.length * 0.4 + 1 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => hostAdvance({ roomId: room._id, hostId: sessionId })}
          className="rounded-xl bg-[var(--color-primary)] px-10 py-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isLastRound ? da.scores : da.nextRound}
        </button>
        <span className="text-sm text-[var(--color-text-muted)]">
          <CountdownTimer deadline={room.phaseDeadline ?? null} />s
        </span>
      </motion.div>
    </div>
  );
}
