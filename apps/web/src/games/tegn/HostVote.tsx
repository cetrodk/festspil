import { useCallback } from "react";
import { motion } from "framer-motion";
import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { sfxTick, sfxUrgent } from "@/lib/sounds";
import { da } from "@/lib/da";
import { DrawingDisplay } from "./DrawingDisplay";
import type { PhaseComponentProps } from "../registry";

export default function HostVote({ room }: PhaseComponentProps) {
  const phaseData = room.phaseData ?? {};
  const answers = phaseData.answers ?? [];
  const drawingData = phaseData.drawingData ?? [];
  const drawingIndex = (phaseData.drawingIndex ?? 0) + 1;
  const totalDrawings = phaseData.totalDrawings ?? 1;
  const submittedCount = room.players?.filter((p: any) => p.hasSubmitted).length ?? 0;
  const totalPlayers = room.players?.length ?? 0;

  const handleTick = useCallback((s: number) => {
    if (s <= 5 && s > 0) sfxUrgent();
    else if (s <= 10 && s > 5) sfxTick();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
        {da.tegn.drawing} {drawingIndex} {da.of} {totalDrawings}
      </div>

      <div className="w-full max-w-xl">
        <DrawingDisplay data={drawingData} />
      </div>

      <div className="flex items-center gap-6">
        <div className="text-5xl font-mono font-bold text-[var(--color-primary)]">
          <CountdownTimer
            deadline={room.phaseDeadline ?? null}
            onTick={handleTick}
          />
        </div>
        <div className="text-sm text-[var(--color-text-muted)]">
          {submittedCount}/{totalPlayers} har stemt
        </div>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-2 gap-4">
        {answers.map((answer: any, i: number) => (
          <motion.div
            key={answer.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
            className="rounded-2xl bg-[var(--color-surface)] p-6 text-center text-xl font-medium"
          >
            {answer.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
