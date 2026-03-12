import { useRef, useState, useCallback, useImperativeHandle, forwardRef, useMemo } from "react";
import { getSvgPathFromStroke, strokeToPath } from "./strokePath";
import getStroke from "perfect-freehand";

export interface Stroke {
  points: number[][];
  color: string;
  size: number;
}

export interface DrawingCanvasRef {
  getStrokes(): Stroke[];
  clear(): void;
  undo(): void;
}

interface CachedStroke {
  stroke: Stroke;
  path: string;
}

interface Props {
  width?: number;
  height?: number;
  disabled?: boolean;
  color?: string;
  size?: number;
  onColorChange?: (color: string) => void;
  onSizeChange?: (size: number) => void;
  showControls?: boolean;
}

const COLORS = ["#ffffff", "var(--color-primary)"];
const SIZES = [
  { value: 6, dot: 6 },
  { value: 16, dot: 16 },
];

export const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>(
  function DrawingCanvas(
    {
      width = 400,
      height = 300,
      disabled = false,
      color: colorProp,
      size: sizeProp,
      onColorChange,
      onSizeChange,
      showControls = false,
    },
    ref,
  ) {
    const [cachedStrokes, setCachedStrokes] = useState<CachedStroke[]>([]);
    const [renderTick, setRenderTick] = useState(0);
    const [internalColor, setInternalColor] = useState(COLORS[0]);
    const [internalSize, setInternalSize] = useState(SIZES[0].value);
    const svgRef = useRef<SVGSVGElement>(null);
    const pointsRef = useRef<number[][] | null>(null);

    const activeColor = colorProp ?? internalColor;
    const activeSize = sizeProp ?? internalSize;

    const strokes = useMemo(() => cachedStrokes.map((c) => c.stroke), [cachedStrokes]);

    useImperativeHandle(ref, () => ({
      getStrokes: () => strokes,
      clear: () => { setCachedStrokes([]); pointsRef.current = null; setRenderTick((t) => t + 1); },
      undo: () => setCachedStrokes((s) => s.slice(0, -1)),
    }));

    const getPoint = useCallback(
      (e: React.PointerEvent): [number, number, number] => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return [0, 0, 0.5];
        return [
          (e.clientX - rect.left) / rect.width * width,
          (e.clientY - rect.top) / rect.height * height,
          e.pressure || 0.5,
        ];
      },
      [width, height],
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        if (disabled) return;
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        pointsRef.current = [getPoint(e)];
        setRenderTick((t) => t + 1);
      },
      [disabled, getPoint],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!pointsRef.current || disabled) return;
        e.preventDefault();
        pointsRef.current.push(getPoint(e));
        setRenderTick((t) => t + 1);
      },
      [disabled, getPoint],
    );

    const handlePointerUp = useCallback(() => {
      const pts = pointsRef.current;
      if (!pts || pts.length < 2) {
        pointsRef.current = null;
        setRenderTick((t) => t + 1);
        return;
      }
      const stroke: Stroke = { points: [...pts], color: activeColor, size: activeSize };
      const path = strokeToPath(stroke);
      setCachedStrokes((s) => [...s, { stroke, path }]);
      pointsRef.current = null;
      setRenderTick((t) => t + 1);
    }, [activeColor, activeSize]);

    const currentPoints = pointsRef.current;
    const currentPath = currentPoints && currentPoints.length >= 2
      ? getSvgPathFromStroke(
          getStroke(currentPoints, {
            size: activeSize,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
            simulatePressure: true,
          }),
        )
      : null;

    return (
      <div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full rounded-xl bg-[var(--color-surface)]"
          style={{ touchAction: "none", aspectRatio: `${width}/${height}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {cachedStrokes.map((cached, i) => (
            <path key={i} d={cached.path} fill={cached.stroke.color} />
          ))}
          {currentPath ? <path d={currentPath} fill={activeColor} /> : null}
        </svg>
        {showControls ? (
          <div className="mt-3 flex items-center justify-center gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setInternalColor(c); onColorChange?.(c); }}
                className="h-9 w-9 rounded-full cursor-pointer transition-all hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: c,
                  boxShadow: activeColor === c
                    ? "0 0 0 3px var(--color-bg), 0 0 0 5px var(--color-primary)"
                    : "0 0 0 2px var(--color-text-muted)",
                }}
              />
            ))}
            <div className="mx-1 h-6 w-px bg-[var(--color-text-muted)]/30" />
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => { setInternalSize(s.value); onSizeChange?.(s.value); }}
                className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: activeSize === s.value
                    ? "var(--color-primary)"
                    : "var(--color-surface)",
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: s.dot,
                    height: s.dot,
                    backgroundColor: activeSize === s.value ? "#fff" : "var(--color-text-muted)",
                  }}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);
