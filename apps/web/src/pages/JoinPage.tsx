import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "@/providers/SessionProvider";
import { AVATARS } from "@/lib/avatars";
import { da } from "@/lib/da";

export function JoinPage() {
  const navigate = useNavigate();
  const sessionId = useSessionId();
  const joinRoom = useMutation(api.players.joinRoom);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [dismissedRejoin, setDismissedRejoin] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  // Check for existing active session
  const existingSession = useQuery(api.players.rejoinRoom, { sessionId });

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
        ...(selectedAvatar ? { avatarImage: selectedAvatar } : {}),
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

      {existingSession && !dismissedRejoin ? (
        <div className="flex w-full max-w-xs flex-col gap-3 rounded-xl bg-[var(--color-surface)] p-4">
          <p className="text-center text-sm">
            Du er allerede i et spil som{" "}
            <strong>{existingSession.playerName}</strong>
          </p>
          <button
            onClick={() => navigate(`/play/${existingSession.roomCode}`)}
            className="rounded-lg bg-[var(--color-primary)] p-3 font-bold transition-transform hover:scale-105 active:scale-95"
          >
            Vend tilbage ({existingSession.roomCode})
          </button>
          <button
            onClick={() => setDismissedRejoin(true)}
            className="text-sm text-[var(--color-text-muted)] underline"
          >
            Deltag i et nyt spil i stedet
          </button>
        </div>
      ) : null}

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
        {name.trim() ? (
          <div>
            <p className="mb-2 text-center text-xs text-[var(--color-text-muted)]">
              Vælg avatar (valgfrit)
            </p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.name}
                  type="button"
                  onClick={() =>
                    setSelectedAvatar(
                      selectedAvatar === avatar.name ? null : avatar.name,
                    )
                  }
                  className={`rounded-lg p-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                    avatar.name === selectedAvatar
                      ? "ring-2 ring-[var(--color-primary)] bg-[var(--color-primary)]/20"
                      : "bg-[var(--color-surface)]"
                  }`}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : null}

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
