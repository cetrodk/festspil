import { Suspense, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "@/providers/SessionProvider";
import { gameComponents } from "@/games/registry";
import { AVATARS } from "@/lib/avatars";
import { GameAvatar } from "@/components/GameAvatar";
import { da } from "@/lib/da";

function AvatarPickerGrid({
  roomId,
  sessionId,
  currentImage,
  onClose,
}: {
  roomId: any;
  sessionId: string;
  currentImage?: string;
  onClose: () => void;
}) {
  const changeAvatar = useMutation(api.players.changeAvatar);

  return (
    <div className="grid grid-cols-6 gap-2 rounded-lg bg-[var(--color-surface)] p-3">
      {AVATARS.map((avatar) => (
        <button
          key={avatar.name}
          onClick={() => {
            changeAvatar({ roomId, sessionId, avatarImage: avatar.name });
            onClose();
          }}
          className={`rounded-lg p-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
            avatar.name === currentImage
              ? "ring-2 ring-[var(--color-primary)] bg-[var(--color-primary)]/20"
              : ""
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
  );
}

function LeaveButton({ roomId, sessionId }: { roomId: any; sessionId: string }) {
  const leaveRoom = useMutation(api.players.leaveRoom);
  const navigate = useNavigate();

  async function handleLeave() {
    await leaveRoom({ roomId, sessionId });
    navigate("/play");
  }

  return (
    <button
      onClick={handleLeave}
      className="text-sm text-[var(--color-text-muted)] underline cursor-pointer"
    >
      Forlad spil
    </button>
  );
}

export function PlayerView() {
  const { code } = useParams<{ code: string }>();
  const sessionId = useSessionId();
  const room = useQuery(
    api.rooms.getRoomForPlayer,
    code ? { code, sessionId } : "skip",
  );

  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

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

  const currentPlayer = room.players?.find(
    (p: any) => p._id === room.currentPlayerId,
  );

  if (room.status === "finished") {
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
            <GameAvatar name={currentPlayer.name} avatarColor={currentPlayer.avatarColor} avatarImage={currentPlayer.avatarImage} className="h-20 w-20" />
            <p className="text-4xl font-black text-[var(--color-primary)]">
              #{rank}
            </p>
            <p className="text-xl text-[var(--color-text-muted)]">
              {currentPlayer.score} point
            </p>
          </>
        ) : null}
        <p className="text-sm text-[var(--color-text-muted)]">
          {da.waitingForHost}
        </p>
        <LeaveButton roomId={room._id} sessionId={sessionId} />
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
          {room.players.map((player: any) => {
            const isMe = player._id === room.currentPlayerId;
            return (
              <li key={player._id}>
                <div
                  onClick={isMe ? () => setAvatarPickerOpen(!avatarPickerOpen) : undefined}
                  className={`flex items-center gap-3 rounded-lg bg-[var(--color-surface)] p-2 ${
                    isMe ? "cursor-pointer ring-1 ring-[var(--color-primary)]/30 hover:ring-[var(--color-primary)]/60 transition-all" : ""
                  }`}
                >
                  <GameAvatar name={player.name} avatarColor={player.avatarColor} avatarImage={player.avatarImage} className="h-8 w-8" />
                  <span className="text-sm font-medium">{player.name}</span>
                  {isMe ? (
                    <span className="ml-auto text-xs text-[var(--color-primary-light)]">
                      dig
                    </span>
                  ) : null}
                </div>
                {isMe && avatarPickerOpen ? (
                  <div className="mt-2">
                    <AvatarPickerGrid
                      roomId={room._id}
                      sessionId={sessionId}
                      currentImage={currentPlayer?.avatarImage}
                      onClose={() => setAvatarPickerOpen(false)}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-sm text-[var(--color-text-muted)]">
        {da.waitingForHost}
      </p>
      <LeaveButton roomId={room._id} sessionId={sessionId} />
    </div>
  );
}
