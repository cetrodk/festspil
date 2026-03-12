import { useEffect } from "react";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { sfxReveal, sfxFanfare, sfxScore } from "@/lib/sounds";
import { GameAvatar } from "@/components/GameAvatar";
import { da } from "@/lib/da";
import { DrawingDisplay } from "./DrawingDisplay";
import type { PhaseComponentProps } from "../registry";

export default function HostReveal({ room, sessionId }: PhaseComponentProps) {
  const hostAdvance = useMutation(api.game.hostAdvance);
  const phaseData = room.phaseData ?? {};
  const results = phaseData.results ?? [];
  const drawingData = phaseData.drawingData ?? [];
  const theWord = phaseData.theWord ?? "???";
  const artistBonus = phaseData.artistBonus ?? false;
  const artistName = phaseData.artistName ?? "???";
  const drawingIndex = phaseData.drawingIndex ?? 0;
  const totalDrawings = phaseData.totalDrawings ?? 1;
  const isLastDrawing = drawingIndex >= totalDrawings - 1;

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
    <div className="fixed inset-0 flex p-6 pt-14 gap-8">
      {/* Left: drawing fills available space */}
      <div className="flex-[3] flex flex-col min-h-0">
        <div className="text-sm uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
          {da.tegn.drawing} {drawingIndex + 1} {da.of} {totalDrawings}
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <DrawingDisplay data={drawingData} className="max-h-full max-w-full w-auto h-full" />
        </div>
      </div>

      {/* Right: results */}
      <div className="flex-[2] flex flex-col justify-center gap-5 overflow-y-auto">
        {/* Fakes */}
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
              className="h-14 w-14"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold">{result.text}</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {result.playerName}
              </p>
              {result.voterNames.length > 0 ? (
                <p className="text-sm text-[var(--color-primary-light)]">
                  {da.bluff.fooledBy}: {result.voterNames.join(", ")}
                </p>
              ) : null}
            </div>
            <div className="text-right min-w-[4rem]">
              {result.fooledCount > 0 ? (
                <motion.p
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.4 + 0.3, type: "spring" }}
                  className="font-display text-2xl font-bold text-[var(--color-primary)]"
                >
                  +{result.fooledCount * 500}
                </motion.p>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.4 + 0.3 }}
                  className="text-lg font-bold text-[var(--color-text-muted)]"
                >
                  +0
                </motion.p>
              )}
            </div>
          </motion.div>
        ))}

        {/* Truth reveal */}
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
            className="rounded-2xl bg-[var(--color-primary)]/15 ring-2 ring-[var(--color-primary)] p-6 text-center"
          >
            <p className="text-sm uppercase tracking-widest text-[var(--color-primary)]">
              {da.tegn.theWordWas}
            </p>
            <p className="mt-2 font-display text-4xl font-bold">{theWord}</p>
            {truth.voterNames.length > 0 ? (
              <p className="mt-2 text-base text-[var(--color-primary-light)]">
                {da.bluff.correctGuess} {truth.voterNames.join(", ")}
              </p>
            ) : (
              <p className="mt-2 text-base text-[var(--color-text-muted)]">
                {da.bluff.noOneGuessed}
              </p>
            )}
            {artistBonus ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: truthDelay + 0.3 }}
                className="mt-2 text-base font-bold text-[var(--color-primary)]"
              >
                {da.tegn.artistBonus} {artistName} +1000
              </motion.p>
            ) : null}
          </motion.div>
        ) : null}

        {/* Advance button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: buttonDelay }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={() => hostAdvance({ roomId: room._id, hostId: sessionId })}
            className="rounded-2xl bg-[var(--color-primary)] px-10 py-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isLastDrawing ? da.scores : da.tegn.nextDrawing}
          </button>
          <span className="text-base text-[var(--color-text-muted)]">
            <CountdownTimer deadline={room.phaseDeadline ?? null} />s
          </span>
        </motion.div>
      </div>
    </div>
  );
}
