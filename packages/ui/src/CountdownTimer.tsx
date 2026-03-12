import { useRef, useEffect, useCallback } from "react";

interface CountdownTimerProps {
  deadline: number | null;
  onExpired?: () => void;
  /** Called each time the displayed second changes, with seconds remaining */
  onTick?: (secondsLeft: number) => void;
}

/**
 * High-performance countdown timer.
 * Uses useRef + rAF to update DOM directly — no useState re-renders at 10Hz.
 */
export function CountdownTimer({ deadline, onExpired, onTick }: CountdownTimerProps) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const expiredRef = useRef(false);
  const lastSecondRef = useRef<number>(-1);

  const tick = useCallback(() => {
    if (!deadline || !displayRef.current) return;

    const remaining = Math.max(0, deadline - Date.now());
    const seconds = Math.ceil(remaining / 1000);
    displayRef.current.textContent = `${seconds}`;

    if (seconds !== lastSecondRef.current) {
      lastSecondRef.current = seconds;
      onTick?.(seconds);
    }

    if (remaining <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpired?.();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [deadline, onExpired, onTick]);

  useEffect(() => {
    expiredRef.current = false;
    lastSecondRef.current = -1;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  if (!deadline) return null;

  return <span ref={displayRef} />;
}
