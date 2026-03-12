import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { sfxTick, sfxUrgent } from "@/lib/sounds";
import { da } from "@/lib/da";
import { DrawingDisplay } from "./DrawingDisplay";
import type { PhaseComponentProps } from "../registry";

export default function HostGuess({ room }: PhaseComponentProps) {
  const phaseData = room.phaseData ?? {};
  const drawingData = phaseData.drawingData ?? [];
  const artistName = phaseData.currentArtistName ?? "???";
  const drawingIndex = (phaseData.drawingIndex ?? 0) + 1;
  const totalDrawings = phaseData.totalDrawings ?? 1;
  const submittedCount = room.players?.filter((p: any) => p.hasSubmitted).length ?? 0;
  // Artist doesn't guess, so total is players - 1
  const totalGuessers = (room.players?.length ?? 1) - 1;

  const handleTick = useCallback((s: number) => {
    if (s <= 5 && s > 0) sfxUrgent();
    else if (s <= 10 && s > 5) sfxTick();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
        {da.tegn.drawing} {drawingIndex} {da.of} {totalDrawings}
      </div>

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-[var(--color-text-muted)]"
      >
        {da.tegn.whatIsBeingDrawn}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-full max-w-2xl"
      >
        <DrawingDisplay strokes={drawingData} />
      </motion.div>

      <div className="flex items-center gap-6">
        <div className="text-5xl font-mono font-bold text-[var(--color-primary)]">
          <CountdownTimer
            deadline={room.phaseDeadline ?? null}
            onTick={handleTick}
          />
        </div>
        <div className="text-sm text-[var(--color-text-muted)]">
          {submittedCount}/{totalGuessers} har gættet
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence>
          {room.players?.map((p: any) => {
            const isArtist = p._id === phaseData.currentArtistId;
            return (
              <motion.div
                key={p._id}
                layout
                animate={{
                  backgroundColor: isArtist
                    ? p.avatarColor
                    : p.hasSubmitted
                      ? p.avatarColor
                      : "var(--color-surface)",
                  opacity: isArtist ? 0.6 : p.hasSubmitted ? 1 : 0.4,
                  scale: !isArtist && p.hasSubmitted ? [1, 1.15, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 rounded-full px-3 py-1"
              >
                <span className="text-sm font-medium text-white">{p.name}</span>
                {isArtist ? (
                  <span className="text-xs">✏️</span>
                ) : p.hasSubmitted ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs"
                  >
                    ✓
                  </motion.span>
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
