import { useRef, useEffect, useCallback } from "react";

interface CountdownTimerProps {
  deadline: number | null;
  onExpired?: () => void;
}

/**
 * High-performance countdown timer.
 * Uses useRef + rAF to update DOM directly — no useState re-renders at 10Hz.
 */
export function CountdownTimer({ deadline, onExpired }: CountdownTimerProps) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const expiredRef = useRef(false);

  const tick = useCallback(() => {
    if (!deadline || !displayRef.current) return;

    const remaining = Math.max(0, deadline - Date.now());
    const seconds = Math.ceil(remaining / 1000);
    displayRef.current.textContent = `${seconds}`;

    if (remaining <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpired?.();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [deadline, onExpired]);

  useEffect(() => {
    expiredRef.current = false;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  if (!deadline) return null;

  return <span ref={displayRef} />;
}
