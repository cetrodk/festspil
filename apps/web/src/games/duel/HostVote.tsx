import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function HostVote({ room }: PhaseComponentProps) {
  const phaseData = room.phaseData ?? {};
  const matchups = phaseData.matchups ?? [];

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
        {da.duel.voteForBest}
      </div>

      <div className="text-6xl font-mono font-bold text-[var(--color-primary)]">
        <CountdownTimer deadline={room.phaseDeadline ?? null} />
      </div>

      <div className="flex w-full max-w-3xl flex-col gap-6">
        {matchups.map((matchup: any) => (
          <div key={matchup.id} className="flex gap-4">
            {matchup.answers.map((answer: any) => (
              <div
                key={answer.id}
                className="flex-1 rounded-2xl bg-[var(--color-surface)] p-6 text-center text-xl font-medium"
              >
                {answer.text}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
