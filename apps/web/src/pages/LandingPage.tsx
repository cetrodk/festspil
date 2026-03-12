import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    gradient: "from-blue-500/20 to-blue-600/5",
  },
  {
    id: "bluff",
    ...da.bluff,
    icon: "🎭",
    color: "var(--color-bluff)",
    glow: "var(--color-bluff-glow)",
    gradient: "from-amber-500/20 to-amber-600/5",
  },
  {
    id: "tegn",
    ...da.tegn,
    icon: "🎨",
    color: "var(--color-tegn)",
    glow: "var(--color-tegn-glow)",
    gradient: "from-pink-500/20 to-pink-600/5",
  },
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
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="font-display text-7xl font-bold tracking-tight glow-text sm:text-8xl">
          {da.title}
        </h1>
        <p className="mt-3 text-lg text-[var(--color-text-muted)]">
          {da.subtitle}
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text-muted)]"
      >
        {da.pickGame}
      </motion.p>

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handlePickGame(game.id)}
            className={`card-glow group relative flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-b ${game.gradient} bg-[var(--color-surface)] p-8 cursor-pointer transition-shadow hover:shadow-lg`}
            style={{ "--tw-shadow-color": game.glow } as any}
          >
            <motion.span
              className="text-5xl"
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
              transition={{ duration: 0.4 }}
            >
              {game.icon}
            </motion.span>
            <span
              className="font-display text-2xl font-bold"
              style={{ color: game.color }}
            >
              {game.name}
            </span>
            <span className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {game.description}
            </span>
          </motion.button>
        ))}
      </div>

      <motion.a
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        href="/play"
        className="rounded-2xl bg-[var(--color-primary)] px-10 py-4 text-xl font-bold cursor-pointer"
        style={{ boxShadow: "0 0 25px #8b6eff30" }}
      >
        {da.join}
      </motion.a>
    </div>
  );
}
