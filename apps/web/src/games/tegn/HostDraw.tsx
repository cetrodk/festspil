import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { sfxTick, sfxUrgent } from "@/lib/sounds";
import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function HostDraw({ room }: PhaseComponentProps) {
  const submittedCount = room.players?.filter((p: any) => p.hasSubmitted).length ?? 0;
  const totalPlayers = room.players?.length ?? 0;

  const handleTick = useCallback((s: number) => {
    if (s <= 5 && s > 0) sfxUrgent();
    else if (s <= 10 && s > 5) sfxTick();
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold"
      >
        {da.tegn.draw}
      </motion.h2>

      <p className="text-lg text-[var(--color-text-muted)]">
        Alle tegner deres hemmelige ord...
      </p>

      <div className="text-6xl font-mono font-bold text-[var(--color-primary)]">
        <CountdownTimer
          deadline={room.phaseDeadline ?? null}
          onTick={handleTick}
        />
      </div>

      <div className="text-lg text-[var(--color-text-muted)]">
        {submittedCount}/{totalPlayers} har tegnet
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence>
          {room.players?.map((p: any) => (
            <motion.div
              key={p._id}
              layout
              animate={{
                backgroundColor: p.hasSubmitted
                  ? p.avatarColor
                  : "var(--color-surface)",
                opacity: p.hasSubmitted ? 1 : 0.4,
                scale: p.hasSubmitted ? [1, 1.15, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 rounded-full px-3 py-1"
            >
              <span className="text-sm font-medium text-white">{p.name}</span>
              {p.hasSubmitted ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs"
                >
                  ✓
                </motion.span>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
