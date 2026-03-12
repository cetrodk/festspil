import { useMemo } from "react";
import { strokeToPath } from "./strokePath";
import type { Stroke } from "./DrawingCanvas";

interface Props {
  strokes: Stroke[];
  className?: string;
  width?: number;
  height?: number;
}

export function DrawingDisplay({ strokes, className = "", width = 400, height = 300 }: Props) {
  const paths = useMemo(
    () => strokes.map((stroke) => ({
      d: strokeToPath(stroke),
      color: stroke.color,
    })),
    [strokes],
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full rounded-xl bg-[var(--color-surface)] ${className}`}
    >
      {paths.map((path, i) => (
        <path key={i} d={path.d} fill={path.color} />
      ))}
    </svg>
  );
}
