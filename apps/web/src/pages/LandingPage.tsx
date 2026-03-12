import { da } from "@/lib/da";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-6xl font-black tracking-tight">{da.title}</h1>
      <p className="text-lg text-[var(--color-text-muted)]">{da.subtitle}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { id: "duel", ...da.duel },
          { id: "bluff", ...da.bluff },
          { id: "tegn", ...da.tegn },
        ].map((game) => (
          <button
            key={game.id}
            className="flex flex-col items-center gap-2 rounded-2xl bg-[var(--color-surface)] p-6 transition-transform hover:scale-105"
          >
            <span className="text-2xl font-bold">{game.name}</span>
            <span className="text-sm text-[var(--color-text-muted)]">
              {game.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
