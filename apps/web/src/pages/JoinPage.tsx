import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "@/providers/SessionProvider";
import { da } from "@/lib/da";

export function JoinPage() {
  const navigate = useNavigate();
  const sessionId = useSessionId();
  const joinRoom = useMutation(api.players.joinRoom);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  // Check for existing session to auto-rejoin
  const existingSession = useQuery(api.players.rejoinRoom, { sessionId });

  if (existingSession) {
    navigate(`/play/${existingSession.roomCode}`, { replace: true });
    return null;
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 4 || !name.trim()) return;

    setError("");
    setJoining(true);
    try {
      const result = await joinRoom({
        code: code.toUpperCase(),
        name: name.trim(),
        sessionId,
      });
      navigate(`/play/${result.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fejl");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-4xl font-black">{da.title}</h1>

      <form
        onSubmit={handleJoin}
        className="flex w-full max-w-xs flex-col gap-4"
      >
        <input
          type="text"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
          placeholder={da.enterCode}
          className="rounded-xl bg-[var(--color-surface)] p-4 text-center text-3xl font-mono uppercase tracking-[0.3em] placeholder:text-[var(--color-text-muted)] placeholder:text-base placeholder:tracking-normal"
          autoComplete="off"
          autoFocus
        />
        <input
          type="text"
          maxLength={16}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={da.enterName}
          className="rounded-xl bg-[var(--color-surface)] p-4 text-center text-xl placeholder:text-[var(--color-text-muted)]"
          autoComplete="off"
        />
        {error ? (
          <p className="text-center text-sm text-red-400">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={code.length !== 4 || !name.trim() || joining}
          className="rounded-xl bg-[var(--color-primary)] p-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          {joining ? "..." : da.join}
        </button>
      </form>
    </div>
  );
}
