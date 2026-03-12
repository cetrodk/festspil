import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function HostSubmit({ room }: PhaseComponentProps) {
  const phaseData = room.phaseData ?? {};
  const submittedCount = room.players?.filter((p: any) => p.hasSubmitted).length ?? 0;
  const totalPlayers = room.players?.length ?? 0;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
        {da.round} {room.roundNumber} {da.of} {room.totalRounds}
      </div>

      <div className="max-w-2xl text-center text-4xl font-bold leading-tight">
        {phaseData.promptText}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-6xl font-mono font-bold text-[var(--color-primary)]">
          <CountdownTimer deadline={room.phaseDeadline ?? null} />
        </div>
      </div>

      <div className="text-lg text-[var(--color-text-muted)]">
        {submittedCount}/{totalPlayers} har svaret
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {room.players?.map((p: any) => (
          <div
            key={p._id}
            className="flex items-center gap-2 rounded-full px-3 py-1"
            style={{
              backgroundColor: p.hasSubmitted
                ? p.avatarColor
                : "var(--color-surface)",
              opacity: p.hasSubmitted ? 1 : 0.4,
            }}
          >
            <span className="text-sm font-medium text-white">{p.name}</span>
            {p.hasSubmitted ? (
              <span className="text-xs">✓</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
