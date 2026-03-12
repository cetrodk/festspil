import { da } from "@/lib/da";

export function JoinPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-4xl font-black">{da.title}</h1>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <input
          type="text"
          maxLength={4}
          placeholder={da.enterCode}
          className="rounded-xl bg-[var(--color-surface)] p-4 text-center text-3xl font-mono uppercase tracking-[0.3em] placeholder:text-[var(--color-text-muted)] placeholder:text-base placeholder:tracking-normal"
          autoComplete="off"
        />
        <input
          type="text"
          maxLength={16}
          placeholder={da.enterName}
          className="rounded-xl bg-[var(--color-surface)] p-4 text-center text-xl placeholder:text-[var(--color-text-muted)]"
          autoComplete="off"
        />
        <button className="rounded-xl bg-[var(--color-primary)] p-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95">
          {da.join}
        </button>
      </div>
    </div>
  );
}
