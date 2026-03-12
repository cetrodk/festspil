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
  const isLastRound = (room.roundNumber ?? 1) >= (room.totalRounds ?? 1);

  // Separate fakes from truth
  const fakes = results.filter((r: any) => !r.isReal);
  const truth = results.find((r: any) => r.isReal);
  const totalItems = results.length;

  useEffect(() => {
    sfxReveal();
    const t = setTimeout(sfxFanfare, totalItems * 400 + 500);
    return () => clearTimeout(t);
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

      {/* Fakes */}
      <div className="flex w-full max-w-3xl flex-col gap-4">
        {fakes.map((result: any, i: number) => (
          <motion.div
            key={result.answerId}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.4, type: "spring", stiffness: 200 }}
            className="flex items-center gap-4 rounded-2xl bg-[var(--color-surface)] p-5"
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
                {result.playerName} {da.bluff.wroteThis}
              </p>
              {result.voterNames.length > 0 ? (
                <p className="text-sm text-[var(--color-primary)]">
                  {da.bluff.fooledBy}: {result.voterNames.join(", ")}
                </p>
              ) : null}
            </div>

            <div className="text-right min-w-[3rem]">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.4 + 0.3 }}
                className="text-2xl font-black text-[var(--color-text-muted)]"
              >
                {result.fooledCount}
              </motion.p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {da.bluff.players}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Truth reveal */}
      {truth ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: fakes.length * 0.4 + 0.5,
            type: "spring",
            stiffness: 150,
          }}
          className="w-full max-w-3xl rounded-2xl bg-[var(--color-primary)]/15 ring-2 ring-[var(--color-primary)] p-6 text-center"
        >
          <p className="text-sm uppercase tracking-widest text-[var(--color-primary)]">
            {da.bluff.theRealAnswer}
          </p>
          <p className="mt-2 text-3xl font-black">{truth.text}</p>
          {truth.voterNames.length > 0 ? (
            <p className="mt-2 text-sm text-[var(--color-primary)]">
              {da.bluff.correctGuess} {truth.voterNames.join(", ")}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {da.bluff.noOneGuessed}
            </p>
          )}
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: totalItems * 0.4 + 1 }}
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
