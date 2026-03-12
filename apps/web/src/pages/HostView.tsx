import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "@/providers/SessionProvider";
import { gameComponents } from "@/games/registry";
import { da } from "@/lib/da";

export function HostView() {
  const { code } = useParams<{ code: string }>();
  const sessionId = useSessionId();
  const room = useQuery(api.rooms.getRoom, code ? { code } : "skip");
  const startGame = useMutation(api.game.startGame);

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Indlæser...</p>
      </div>
    );
  }

  // Phase routing: if game is playing, show the game phase component
  if (room.status === "playing" && room.currentPhase) {
    const components = gameComponents[room.gameType];
    const PhaseComponent = components?.host[room.currentPhase];

    if (PhaseComponent) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
          <div className="absolute top-4 right-4 font-mono text-sm text-[var(--color-text-muted)]">
            {room.code}
          </div>
          <Suspense
            fallback={
              <div className="text-[var(--color-text-muted)]">Indlæser...</div>
            }
          >
            <PhaseComponent room={room} sessionId={sessionId} />
          </Suspense>
        </div>
      );
    }
  }

  if (room.status === "finished") {
    const components = gameComponents[room.gameType];
    const ScoresComponent = components?.host.scores;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        {ScoresComponent ? (
          <Suspense fallback={null}>
            <ScoresComponent room={room} sessionId={sessionId} />
          </Suspense>
        ) : null}
        <p className="text-2xl font-bold">{da.gameOver}</p>
      </div>
    );
  }

  // Lobby view
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <p className="text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
        {da.roomCode}
      </p>
      <div className="text-8xl font-black tracking-[0.2em] font-mono">
        {room.code}
      </div>

      <p className="text-lg text-[var(--color-text-muted)]">
        Gå til <span className="font-bold text-[var(--color-text)]">/play</span>{" "}
        og indtast koden
      </p>

      <div className="w-full max-w-md">
        <p className="mb-4 text-center text-sm text-[var(--color-text-muted)]">
          {room.players.length} {da.playersJoined}
        </p>
        <ul className="flex flex-col gap-2">
          {room.players.map((player: any) => (
            <li
              key={player._id}
              className="flex items-center gap-3 rounded-xl bg-[var(--color-surface)] p-3"
            >
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: player.avatarColor }}
              >
                {player.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-semibold">{player.name}</span>
              {!player.isConnected ? (
                <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                  afbrudt
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <button
        disabled={room.players.length < 2}
        onClick={() => startGame({ roomId: room._id, hostId: sessionId })}
        className="rounded-xl bg-[var(--color-primary)] px-12 py-4 text-2xl font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
      >
        {room.players.length < 2
          ? `${da.needMorePlayers} (${room.players.length}/2)`
          : da.startGame}
      </button>
    </div>
  );
}
