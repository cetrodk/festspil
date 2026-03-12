import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "@/providers/SessionProvider";
import { gameComponents } from "@/games/registry";
import { da } from "@/lib/da";

export function PlayerView() {
  const { code } = useParams<{ code: string }>();
  const sessionId = useSessionId();
  const room = useQuery(
    api.rooms.getRoomForPlayer,
    code ? { code, sessionId } : "skip",
  );

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Indlæser...</p>
      </div>
    );
  }

  // Phase routing: if game is playing, show the player phase component
  if (room.status === "playing" && room.currentPhase) {
    const components = gameComponents[room.gameType];
    const PhaseComponent = components?.player[room.currentPhase];

    if (PhaseComponent) {
      return (
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center text-[var(--color-text-muted)]">
              Indlæser...
            </div>
          }
        >
          <PhaseComponent room={room} sessionId={sessionId} />
        </Suspense>
      );
    }
  }

  if (room.status === "finished") {
    const currentPlayer = room.players?.find(
      (p: any) => p._id === room.currentPlayerId,
    );
    const sorted = [...(room.players ?? [])].sort(
      (a: any, b: any) => b.score - a.score,
    );
    const rank = sorted.findIndex(
      (p: any) => p._id === room.currentPlayerId,
    ) + 1;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
        <p className="text-3xl font-bold">{da.gameOver}</p>
        {currentPlayer ? (
          <>
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-white text-2xl font-bold"
              style={{ backgroundColor: currentPlayer.avatarColor }}
            >
              {currentPlayer.name.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-4xl font-black text-[var(--color-primary)]">
              #{rank}
            </p>
            <p className="text-xl text-[var(--color-text-muted)]">
              {currentPlayer.score} point
            </p>
          </>
        ) : null}
        <a
          href="/play"
          className="rounded-xl bg-[var(--color-primary)] px-8 py-3 font-bold transition-transform hover:scale-105 active:scale-95"
        >
          {da.playAgain}
        </a>
      </div>
    );
  }

  // Lobby view
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h2 className="text-4xl font-bold">{da.youreIn}</h2>
      <p className="font-mono text-2xl tracking-widest text-[var(--color-text-muted)]">
        {room.code}
      </p>

      <div className="w-full max-w-xs">
        <p className="mb-3 text-center text-sm text-[var(--color-text-muted)]">
          {room.players.length} {da.playersJoined}
        </p>
        <ul className="flex flex-col gap-2">
          {room.players.map((player: any) => (
            <li
              key={player._id}
              className="flex items-center gap-3 rounded-lg bg-[var(--color-surface)] p-2"
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: player.avatarColor }}
              >
                {player.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{player.name}</span>
              {player._id === room.currentPlayerId ? (
                <span className="ml-auto text-xs text-[var(--color-primary-light)]">
                  dig
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-[var(--color-text-muted)]">
        {da.waitingForHost}
      </p>
    </div>
  );
}
