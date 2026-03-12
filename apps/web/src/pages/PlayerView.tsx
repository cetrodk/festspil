import { useParams } from "react-router-dom";
import { da } from "@/lib/da";

export function PlayerView() {
  const { code } = useParams<{ code: string }>();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-3xl font-bold">{da.youreIn}</h2>
      <p className="font-mono text-xl tracking-widest text-[var(--color-text-muted)]">
        {code?.toUpperCase()}
      </p>
      <p className="text-[var(--color-text-muted)]">{da.waitingForHost}</p>
    </div>
  );
}
