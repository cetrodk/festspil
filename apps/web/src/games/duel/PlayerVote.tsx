import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function PlayerVote({ room, sessionId }: PhaseComponentProps) {
  const submitAnswer = useMutation(api.game.submitAnswer);
  const [voted, setVoted] = useState(false);

  const phaseData = room.phaseData ?? {};
  const matchups = phaseData.matchupsAnonymized ?? [];

  async function handleVote(answerId: string) {
    await submitAnswer({
      roomId: room._id,
      sessionId,
      content: answerId,
    });
    setVoted(true);
  }

  if (voted || phaseData.myVote) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-2xl font-bold">{da.waiting}</p>
        <div className="text-4xl font-mono text-[var(--color-primary)]">
          <CountdownTimer deadline={room.phaseDeadline ?? null} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <div className="text-4xl font-mono text-[var(--color-primary)]">
        <CountdownTimer deadline={room.phaseDeadline ?? null} />
      </div>

      <p className="text-lg font-bold">{da.duel.voteForBest}</p>

      <div className="flex w-full max-w-xs flex-col gap-3">
        {matchups.flatMap((matchup: any) =>
          matchup.answers.map((answer: any) => (
            <button
              key={answer.id}
              onClick={() => handleVote(answer.id)}
              className="rounded-xl bg-[var(--color-surface)] p-4 text-lg font-medium transition-transform hover:scale-105 active:scale-95 text-left"
            >
              {answer.text}
            </button>
          )),
        )}
      </div>
    </div>
  );
}
