import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CountdownTimer } from "@festspil/ui/CountdownTimer";
import { da } from "@/lib/da";
import type { PhaseComponentProps } from "../registry";

export default function PlayerSubmit({ room, sessionId }: PhaseComponentProps) {
  const submitAnswer = useMutation(api.game.submitAnswer);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const phaseData = room.phaseData ?? {};

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;

    await submitAnswer({
      roomId: room._id,
      sessionId,
      content: answer.trim(),
    });
    setSubmitted(true);
  }

  if (submitted || phaseData.mySubmission) {
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

      <p className="max-w-sm text-center text-xl font-bold">
        {phaseData.promptText}
      </p>

      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-4">
        <input
          type="text"
          maxLength={280}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={da.duel.writeAnswer}
          className="rounded-xl bg-[var(--color-surface)] p-4 text-center text-lg placeholder:text-[var(--color-text-muted)]"
          autoComplete="off"
          autoFocus
        />
        <button
          type="submit"
          disabled={!answer.trim()}
          className="rounded-xl bg-[var(--color-primary)] p-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {da.submit}
        </button>
      </form>
    </div>
  );
}
