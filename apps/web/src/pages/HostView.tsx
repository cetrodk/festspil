import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "@/providers/SessionProvider";
import { gameComponents } from "@/games/registry";
import { sfxFanfare } from "@/lib/sounds";
import { GameAvatar } from "@/components/GameAvatar";
import { da } from "@/lib/da";

const TIMER_OPTIONS = [
  { key: "submitTime", label: "Svartid", defaultMs: 60_000, min: 15, max: 180 },
  { key: "voteTime", label: "Stemmetid", defaultMs: 30_000, min: 10, max: 90 },
  { key: "revealTime", label: "Afsløring", defaultMs: 10_000, min: 5, max: 30 },
  { key: "scoresTime", label: "Pointvisning", defaultMs: 8_000, min: 3, max: 20 },
  { key: "drawTime", label: "Tegnetid", defaultMs: 90_000, min: 30, max: 180 },
  { key: "guessTime", label: "Gættetid", defaultMs: 45_000, min: 15, max: 90 },
] as const;

function HostSettingsOverlay({
  room,
  sessionId,
  onClose,
}: {
  room: any;
  sessionId: string;
  onClose: () => void;
}) {
  const updateSettings = useMutation(api.game.updateSettings);
  const restartGame = useMutation(api.game.restartGame);
  const settings = room.settings ?? {};

  const handleChange = useCallback(
    (key: string, seconds: number) => {
      updateSettings({
        roomId: room._id,
        hostId: sessionId,
        settings: { [key]: seconds * 1000 },
      });
    },
    [room._id, sessionId, updateSettings],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-[var(--color-bg)] p-6 shadow-2xl border border-[var(--color-surface)]"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Indstillinger</h3>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {TIMER_OPTIONS.map(({ key, label, defaultMs, min, max }) => {
            const currentMs = typeof settings[key] === "number" ? settings[key] : defaultMs;
            const currentSec = Math.round(currentMs / 1000);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-sm font-mono text-[var(--color-primary)]">
                    {currentSec}s
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={currentSec}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  className="w-full accent-[var(--color-primary)] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                  <span>{min}s</span>
                  <span>{max}s</span>
                </div>
              </div>
            );
          })}
        </div>

        {room.status !== "lobby" ? (
          <button
            onClick={() => {
              if (confirm("Er du sikker? Spillet nulstilles til lobbyen.")) {
                restartGame({ roomId: room._id, hostId: sessionId });
                onClose();
              }
            }}
            className="mt-6 w-full rounded-xl border border-red-500/30 p-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            Genstart spil
          </button>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

export function HostView() {
  const { code } = useParams<{ code: string }>();
  const sessionId = useSessionId();
  const room = useQuery(api.rooms.getRoom, code ? { code } : "skip");
  const startGame = useMutation(api.game.startGame);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
    const basePhase = room.currentPhase.split("_")[0];
    const PhaseComponent = components?.host[basePhase];

    if (PhaseComponent) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
          <div className="absolute top-4 right-4 flex items-center gap-4">
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-3xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              title="Indstillinger"
            >
              ⚙
            </button>
            <span className="font-mono text-sm text-[var(--color-text-muted)]">
              {room.code}
            </span>
          </div>
          <AnimatePresence>
            {settingsOpen ? (
              <HostSettingsOverlay
                room={room}
                sessionId={sessionId}
                onClose={() => setSettingsOpen(false)}
              />
            ) : null}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={room.currentPhase + "-" + room.roundNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex w-full flex-col items-center gap-8"
            >
              <Suspense
                fallback={
                  <div className="text-[var(--color-text-muted)]">
                    Indlæser...
                  </div>
                }
              >
                <PhaseComponent room={room} sessionId={sessionId} />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      );
    }
  }

  if (room.status === "finished") {
    return <FinishedScreen room={room} sessionId={sessionId} />;
  }

  // Lobby view
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setSettingsOpen(true)}
          className="text-3xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          title="Indstillinger"
        >
          ⚙
        </button>
      </div>
      <AnimatePresence>
        {settingsOpen ? (
          <HostSettingsOverlay
            room={room}
            sessionId={sessionId}
            onClose={() => setSettingsOpen(false)}
          />
        ) : null}
      </AnimatePresence>
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
              <GameAvatar name={player.name} avatarColor={player.avatarColor} avatarImage={player.avatarImage} />
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
        disabled={room.players.length < 3}
        onClick={() => startGame({ roomId: room._id, hostId: sessionId })}
        className="rounded-xl bg-[var(--color-primary)] px-12 py-4 text-2xl font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
      >
        {room.players.length < 3
          ? `${da.needMorePlayers} (${room.players.length}/3)`
          : da.startGame}
      </button>
    </div>
  );
}

function FinishedScreen({ room, sessionId }: { room: any; sessionId: string }) {
  const restartGame = useMutation(api.game.restartGame);
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

    sfxFanfare();

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
                <div className="mx-auto"><GameAvatar name={w.name} avatarColor={w.avatarColor} avatarImage={w.avatarImage} className="h-20 w-20" /></div>
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
          <div className="mx-auto"><GameAvatar name={winners[0].name} avatarColor={winners[0].avatarColor} avatarImage={winners[0].avatarImage} className="h-20 w-20" /></div>
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
              <GameAvatar name={player.name} avatarColor={player.avatarColor} avatarImage={player.avatarImage} />
              <span className="flex-1 font-semibold">{player.name}</span>
              <span className="font-bold text-[var(--color-primary)]">
                {player.score}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => restartGame({ roomId: room._id, hostId: sessionId })}
        className="rounded-xl bg-[var(--color-primary)] px-10 py-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        {da.playAgain}
      </button>
    </div>
  );
}
