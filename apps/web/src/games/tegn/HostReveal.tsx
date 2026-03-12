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
    <div className="flex flex-col items-center gap-6">
      <div className="text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
        {da.tegn.drawing} {drawingIndex + 1} {da.of} {totalDrawings}
      </div>

      <div className="w-full max-w-md">
        <DrawingDisplay data={drawingData} />
      </div>

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
                {result.playerName}
              </p>
              {result.voterNames.length > 0 ? (
                <p className="text-sm text-[var(--color-primary)]">
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
                  className="text-2xl font-black text-[var(--color-primary)]"
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
      </div>

      {/* Truth + word reveal */}
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
          className="w-full max-w-3xl rounded-2xl bg-[var(--color-primary)]/15 ring-2 ring-[var(--color-primary)] p-6 text-center"
        >
          <p className="text-sm uppercase tracking-widest text-[var(--color-primary)]">
            {da.tegn.theWordWas}
          </p>
          <p className="mt-2 text-3xl font-black">{theWord}</p>
          {truth.voterNames.length > 0 ? (
            <p className="mt-2 text-sm text-[var(--color-primary)]">
              {da.bluff.correctGuess} {truth.voterNames.join(", ")}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {da.bluff.noOneGuessed}
            </p>
          )}
          {artistBonus ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: truthDelay + 0.3 }}
              className="mt-2 text-sm font-bold text-[var(--color-primary)]"
            >
              {da.tegn.artistBonus} {artistName} +1000
            </motion.p>
          ) : null}
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
          className="rounded-xl bg-[var(--color-primary)] px-10 py-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isLastDrawing ? da.scores : da.tegn.nextDrawing}
        </button>
        <span className="text-sm text-[var(--color-text-muted)]">
          <CountdownTimer deadline={room.phaseDeadline ?? null} />s
        </span>
      </motion.div>
    </div>
  );
}
