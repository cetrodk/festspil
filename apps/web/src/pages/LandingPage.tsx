import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "@/providers/SessionProvider";
import { da } from "@/lib/da";

const GAMES = [
  {
    id: "duel",
    ...da.duel,
    icon: "⚔️",
    color: "var(--color-duel)",
    glow: "var(--color-duel-glow)",
  },
  {
    id: "bluff",
    ...da.bluff,
    icon: "🎭",
    color: "var(--color-bluff)",
    glow: "var(--color-bluff-glow)",
  },
  {
    id: "tegn",
    ...da.tegn,
    icon: "🎨",
    color: "var(--color-tegn)",
    glow: "var(--color-tegn-glow)",
  },
  {
    id: "telefon",
    ...da.telefon,
    icon: "📞",
    color: "var(--color-telefon)",
    glow: "var(--color-telefon-glow)",
  },
] as const;

type Game = (typeof GAMES)[number];

export function LandingPage() {
  const navigate = useNavigate();
  const sessionId = useSessionId();
  const createRoom = useMutation(api.rooms.createRoom);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  async function handleStartRoom(gameType: string) {
    const { code } = await createRoom({ gameType, hostId: sessionId });
    navigate(`/host/${code}`);
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {selectedGame ? (
          <GameDetailSplash
            key="detail"
            game={selectedGame}
            onBack={() => setSelectedGame(null)}
            onStart={() => handleStartRoom(selectedGame.id)}
          />
        ) : (
          <GameGrid
            key="grid"
            onSelect={setSelectedGame}
          />
        )}
      </AnimatePresence>

      {/* Join link — always visible */}
      <motion.a
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        href="/play"
        className="mt-8 text-sm text-[var(--color-text-muted)] underline underline-offset-4 decoration-[var(--color-text-muted)]/30 hover:decoration-[var(--color-text-muted)] transition-colors"
      >
        {da.join} →
      </motion.a>
    </div>
  );
}

/* ── Game Grid (Step 1) ────────────────────────────────── */

function GameGrid({ onSelect }: { onSelect: (game: Game) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
      className="flex w-full max-w-lg flex-col items-center gap-6 sm:gap-8"
    >
      {/* Title */}
      <div className="text-center">
        <h1 className="font-display text-5xl font-bold tracking-tight glow-text sm:text-7xl">
          {da.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)] sm:text-base">
          {da.subtitle}
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
        {da.pickGame}
      </p>

      {/* 2x2 grid */}
      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(game)}
            className="card-glow group relative flex flex-col items-center gap-2 rounded-2xl bg-[var(--color-surface)] p-5 sm:p-6 cursor-pointer transition-shadow hover:shadow-lg"
            style={{ "--tw-shadow-color": game.glow } as any}
          >
            <span className="text-4xl sm:text-5xl">{game.icon}</span>
            <span
              className="font-display text-lg font-bold sm:text-xl"
              style={{ color: game.color }}
            >
              {game.name}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] leading-relaxed sm:text-sm">
              {game.description}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Game Detail Splash (Step 2) ──────────────────────── */

function GameDetailSplash({
  game,
  onBack,
  onStart,
}: {
  game: Game;
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25 }}
      className="flex w-full max-w-sm flex-col items-center gap-6"
    >
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="self-start flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
      >
        ← {da.back}
      </motion.button>

      {/* Game icon + name */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-7xl">{game.icon}</span>
        <h2
          className="font-display text-4xl font-bold"
          style={{ color: game.color }}
        >
          {game.name}
        </h2>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center text-lg text-[var(--color-text-muted)]"
      >
        {game.description}
      </motion.p>

      {/* How to play */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full rounded-2xl bg-[var(--color-surface)] p-5"
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          {da.howToPlay}
        </p>
        <p className="text-sm leading-relaxed text-[var(--color-text)]">
          {game.howToPlay}
        </p>
      </motion.div>

      {/* Player count / expectations */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs font-medium text-[var(--color-text-muted)]"
      >
        {game.expects}
      </motion.p>

      {/* Start button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="w-full rounded-2xl py-4 text-xl font-bold cursor-pointer"
        style={{
          backgroundColor: game.color,
          boxShadow: `0 0 30px ${game.glow}, 0 4px 20px ${game.glow}`,
        }}
      >
        {da.startRoom}
      </motion.button>
    </motion.div>
  );
}
