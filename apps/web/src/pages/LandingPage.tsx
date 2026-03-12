import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "@/providers/SessionProvider";
import { da } from "@/lib/da";

const GAMES = [
  { id: "duel", ...da.duel },
  { id: "bluff", ...da.bluff },
  { id: "tegn", ...da.tegn },
] as const;

export function LandingPage() {
  const navigate = useNavigate();
  const sessionId = useSessionId();
  const createRoom = useMutation(api.rooms.createRoom);

  async function handlePickGame(gameType: string) {
    const { code } = await createRoom({ gameType, hostId: sessionId });
    navigate(`/host/${code}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-6xl font-black tracking-tight">{da.title}</h1>
      <p className="text-lg text-[var(--color-text-muted)]">{da.subtitle}</p>
      <p className="text-sm text-[var(--color-text-muted)]">{da.pickGame}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => handlePickGame(game.id)}
            className="flex flex-col items-center gap-2 rounded-2xl bg-[var(--color-surface)] p-6 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="text-2xl font-bold">{game.name}</span>
            <span className="text-sm text-[var(--color-text-muted)]">
              {game.description}
            </span>
          </button>
        ))}
      </div>

      <a
        href="/play"
        className="text-sm text-[var(--color-primary-light)] underline"
      >
        {da.join}
      </a>
    </div>
  );
}
