import { Suspense, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import confetti from "canvas-confetti";
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
    return <FinishedScreen room={room} />;
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

function FinishedScreen({ room }: { room: any }) {
  const players = [...(room.players ?? [])].sort(
    (a: any, b: any) => b.score - a.score,
  );

  const topScore = players[0]?.score ?? 0;
  const winners = players.filter((p: any) => p.score === topScore);
  const isTie = winners.length > 1;
  const rest = players.filter((p: any) => p.score < topScore);

  useEffect(() => {
    // Initial burst
    const end = Date.now() + 3000;

    const colors = ["#7c3aed", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6"];

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }

    frame();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h2 className="text-3xl font-bold">{da.gameOver}</h2>

      {isTie ? (
        <div className="text-center">
          <p className="mb-4 text-lg text-[var(--color-text-muted)]">
            Uafgjort!
          </p>
          <div className="flex justify-center gap-6">
            {winners.map((w: any) => (
              <div key={w._id} className="text-center">
                <div
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white text-2xl font-bold"
                  style={{ backgroundColor: w.avatarColor }}
                >
                  {w.name.slice(0, 2).toUpperCase()}
                </div>
                <p className="mt-2 text-2xl font-black">{w.name}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-lg text-[var(--color-text-muted)]">
            {topScore} point
          </p>
        </div>
      ) : (
        <div className="text-center">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white text-2xl font-bold"
            style={{ backgroundColor: winners[0].avatarColor }}
          >
            {winners[0].name.slice(0, 2).toUpperCase()}
          </div>
          <p className="mt-3 text-4xl font-black">{winners[0].name}</p>
          <p className="text-lg text-[var(--color-text-muted)]">
            {topScore} point
          </p>
        </div>
      )}

      {rest.length > 0 && (
        <div className="w-full max-w-lg flex flex-col gap-2">
          {rest.map((player: any, i: number) => (
            <div
              key={player._id}
              className="flex items-center gap-4 rounded-xl bg-[var(--color-surface)] p-3"
            >
              <span className="text-lg font-black text-[var(--color-text-muted)] w-6">
                {winners.length + i + 1}
              </span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-white font-bold text-xs"
                style={{ backgroundColor: player.avatarColor }}
              >
                {player.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="flex-1 font-semibold">{player.name}</span>
              <span className="font-bold text-[var(--color-primary)]">
                {player.score}
              </span>
            </div>
          ))}
        </div>
      )}

      <a
        href="/"
        className="rounded-xl bg-[var(--color-primary)] px-10 py-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        {da.playAgain}
      </a>
    </div>
  );
}
