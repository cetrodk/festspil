import { useEffect } from "react";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { sfxReveal, sfxFanfare, sfxScore } from "@/lib/sounds";
import { GameAvatar } from "@/components/GameAvatar";
import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function HostReveal({ room, sessionId }: PhaseComponentProps) {
  const hostAdvance = useMutation(api.game.hostAdvance);
  const phaseData = room.phaseData ?? {};
  const results = phaseData.results ?? [];
  const promptText = phaseData.promptText ?? "";
  const isLastRound = (room.roundNumber ?? 1) >= (room.totalRounds ?? 1);

  const fakes = results.filter((r: any) => !r.isReal);
  const truth = results.find((r: any) => r.isReal);

  useEffect(() => {
    sfxReveal();
    const timers: ReturnType<typeof setTimeout>[] = [];
    fakes.forEach((_: any, i: number) => {
      timers.push(setTimeout(sfxScore, i * 400 + 200));
    });
    const truthDelay = (fakes.length * 0.4 + 0.5) * 1000;
    timers.push(setTimeout(sfxFanfare, truthDelay));
    return () => timers.forEach(clearTimeout);
  }, []);

  const truthDelay = fakes.length * 0.4 + 0.5;
  const buttonDelay = truthDelay + 0.6;

  return (
    <div className="flex flex-col items-center gap-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl text-center font-display text-4xl font-bold text-[var(--color-text-muted)]"
      >
        {promptText}
      </motion.div>

      <div className="flex w-full max-w-5xl flex-col gap-5">
        {fakes.map((result: any, i: number) => (
          <motion.div
            key={result.answerId}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.4, type: "spring", stiffness: 200 }}
            className="flex items-center gap-5 rounded-2xl bg-[var(--color-surface)] p-6"
          >
            <GameAvatar
              name={result.playerName}
              avatarColor={result.avatarColor}
              avatarImage={result.avatarImage}
              className="h-16 w-16"
            />
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold">{result.text}</p>
              <p className="text-base text-[var(--color-text-muted)]">
                {result.playerName} {da.bluff.wroteThis}
              </p>
              {result.voterNames.length > 0 ? (
                <p className="text-base text-[var(--color-primary-light)]">
                  {da.bluff.fooledBy}: {result.voterNames.join(", ")}
                </p>
              ) : null}
            </div>

            <div className="text-right min-w-[5rem]">
              {result.fooledCount > 0 ? (
                <motion.p
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.4 + 0.3, type: "spring" }}
                  className="font-display text-3xl font-bold text-[var(--color-primary)]"
                >
                  +{result.fooledCount * 500}
                </motion.p>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.4 + 0.3 }}
                  className="text-xl font-bold text-[var(--color-text-muted)]"
                >
                  +0
                </motion.p>
              )}
              <p className="text-sm text-[var(--color-text-muted)]">
                {result.fooledCount === 1
                  ? `narret 1 ${da.bluff.players.slice(0, -1)}`
                  : `narret ${result.fooledCount}`}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {truth ? (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [0, 1.05, 1] }}
          transition={{
            delay: truthDelay,
            duration: 0.5,
            type: "spring",
            stiffness: 120,
          }}
          className="w-full max-w-5xl rounded-2xl bg-[var(--color-primary)]/15 ring-2 ring-[var(--color-primary)] p-8 text-center"
        >
          <p className="text-base uppercase tracking-widest text-[var(--color-primary)]">
            {da.bluff.theRealAnswer}
          </p>
          <p className="mt-3 font-display text-5xl font-bold">{truth.text}</p>
          {truth.voterNames.length > 0 ? (
            <p className="mt-3 text-lg text-[var(--color-primary-light)]">
              {da.bluff.correctGuess} {truth.voterNames.join(", ")}
            </p>
          ) : (
            <p className="mt-3 text-lg text-[var(--color-text-muted)]">
              {da.bluff.noOneGuessed}
            </p>
          )}
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: buttonDelay }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => hostAdvance({ roomId: room._id, hostId: sessionId })}
          className="rounded-2xl bg-[var(--color-primary)] px-12 py-5 text-2xl font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isLastRound ? da.scores : da.nextRound}
        </button>
        <span className="text-base text-[var(--color-text-muted)]">
          <CountdownTimer deadline={room.phaseDeadline ?? null} />s
        </span>
      </motion.div>
    </div>
  );
}
