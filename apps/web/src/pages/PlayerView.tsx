import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "@/providers/SessionProvider";
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

  // For now, always show lobby. Phase routing comes in Phase 2.
  return <PlayerLobby room={room} />;
}

function PlayerLobby({
  room,
}: {
  room: NonNullable<
    ReturnType<typeof useQuery<typeof api.rooms.getRoomForPlayer>>
  >;
}) {
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
          {room.players.map((player) => (
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
