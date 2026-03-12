import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-5xl font-bold glow-text"
      >
        {da.title}
      </motion.h1>

      <AnimatePresence>
        {existingSession && !dismissedRejoin ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card-glow flex w-full max-w-xs flex-col gap-3 rounded-xl bg-[var(--color-surface)] p-4"
          >
            <p className="text-center text-sm">
              Du er allerede i et spil som{" "}
              <strong className="text-[var(--color-primary-light)]">{existingSession.playerName}</strong>
            </p>
            <button
              onClick={() => navigate(`/play/${existingSession.roomCode}`)}
              className="rounded-xl bg-[var(--color-primary)] p-3 font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Vend tilbage ({existingSession.roomCode})
            </button>
            <button
              onClick={() => setDismissedRejoin(true)}
              className="text-sm text-[var(--color-text-muted)] underline underline-offset-4 cursor-pointer"
            >
              Deltag i et nyt spil i stedet
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleJoin}
        className="flex w-full max-w-xs flex-col gap-4"
      >
        <input
          type="text"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
          placeholder={da.enterCode}
          className="rounded-xl bg-[var(--color-surface)] p-4 text-center font-display text-3xl font-bold uppercase tracking-[0.3em] placeholder:text-[var(--color-text-muted)] placeholder:text-base placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-shadow"
          autoComplete="off"
          autoFocus
        />
        <input
          type="text"
          maxLength={16}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={da.enterName}
          className="rounded-xl bg-[var(--color-surface)] p-4 text-center text-xl placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-shadow"
          autoComplete="off"
        />

        <AnimatePresence>
          {name.trim() ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="mb-2 text-center text-xs font-medium text-[var(--color-text-muted)]">
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
                    className={`rounded-lg p-1 transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                      avatar.name === selectedAvatar
                        ? "ring-2 ring-[var(--color-primary)] bg-[var(--color-primary)]/20 scale-105"
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
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error ? (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center text-sm font-medium text-[var(--color-danger)]"
          >
            {error}
          </motion.p>
        ) : null}

        <motion.button
          type="submit"
          disabled={code.length !== 4 || !name.trim() || joining}
          whileHover={code.length === 4 && name.trim() ? { scale: 1.03 } : undefined}
          whileTap={code.length === 4 && name.trim() ? { scale: 0.97 } : undefined}
          className="rounded-xl bg-[var(--color-primary)] p-4 text-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={code.length === 4 && name.trim() ? { boxShadow: "0 0 20px #8b6eff30" } : undefined}
        >
          {joining ? "..." : da.join}
        </motion.button>
      </motion.form>
    </div>
  );
}
