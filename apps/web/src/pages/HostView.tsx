import { useParams } from "react-router-dom";
import { da } from "@/lib/da";

export function HostView() {
  const { code } = useParams<{ code: string }>();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <p className="text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
        {da.roomCode}
      </p>
      <div className="text-7xl font-black tracking-[0.2em] font-mono">
        {code?.toUpperCase()}
      </div>
      <p className="text-lg text-[var(--color-text-muted)]">
        {da.waitingForHost}
      </p>
    </div>
  );
}
