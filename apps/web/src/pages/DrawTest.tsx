import { useRef, useState } from "react";
import { DrawingCanvas, type DrawingCanvasRef, type Stroke } from "@/games/tegn/DrawingCanvas";
import { DrawingDisplay } from "@/games/tegn/DrawingDisplay";

export function DrawTest() {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [submitted, setSubmitted] = useState<Stroke[] | null>(null);

  function handleSubmit() {
    const strokes = canvasRef.current?.getStrokes();
    if (strokes && strokes.length > 0) {
      setSubmitted(strokes);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Drawing Canvas Test</h1>

      <div className="w-full max-w-sm">
        <p className="mb-2 text-sm text-[var(--color-text-muted)]">Draw here:</p>
        <DrawingCanvas ref={canvasRef} width={400} height={300} showControls />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => canvasRef.current?.undo()}
          className="rounded-xl bg-[var(--color-surface)] px-4 py-2 text-sm font-medium cursor-pointer"
        >
          Undo
        </button>
        <button
          onClick={() => canvasRef.current?.clear()}
          className="rounded-xl bg-[var(--color-surface)] px-4 py-2 text-sm font-medium cursor-pointer"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          className="rounded-xl bg-[var(--color-primary)] px-6 py-2 text-sm font-bold cursor-pointer"
        >
          Submit
        </button>
      </div>

      {submitted ? (
        <div className="w-full max-w-md">
          <p className="mb-2 text-sm text-[var(--color-text-muted)]">
            DrawingDisplay (host view) — {submitted.length} stroke(s):
          </p>
          <DrawingDisplay strokes={submitted} />
        </div>
      ) : null}
    </div>
  );
}
