import { useRef, useState, useLayoutEffect } from "react";
import type { HeatmapCell, ColorTag } from "../types";
import { getMonthLabels } from "../utils/heatmap";

const COLOR_COMPLETED: Record<ColorTag, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
  green: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-violet-500",
};

const COLOR_MISSED: Record<ColorTag, string> = {
  red: "bg-red-100 dark:bg-red-950",
  orange: "bg-orange-100 dark:bg-orange-950",
  yellow: "bg-yellow-100 dark:bg-yellow-950",
  green: "bg-emerald-100 dark:bg-emerald-950",
  blue: "bg-blue-100 dark:bg-blue-950",
  purple: "bg-violet-100 dark:bg-violet-950",
};

const TOTAL_COLS = 53;
const GAP = 2;
const MIN_CELL = 3;
const MAX_CELL = 10;

interface HeatmapProps {
  cells: HeatmapCell[];
  colorTag: ColorTag;
  completedCount: number;
}

function Heatmap({ cells, colorTag, completedCount }: HeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(MAX_CELL);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = (width: number) => {
      const size = Math.max(
        MIN_CELL,
        Math.min(
          MAX_CELL,
          Math.floor((width - (TOTAL_COLS - 1) * GAP) / TOTAL_COLS),
        ),
      );
      setCellSize(size);
    };
    update(el.offsetWidth);
    const ro = new ResizeObserver((entries) => {
      update(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const firstDate = cells[0]
    ? new Date(cells[0].date + "T00:00:00")
    : new Date();
  const fillerCount = firstDate.getDay();
  const monthLabels = getMonthLabels(cells, fillerCount, cellSize, GAP);
  const completedClass = COLOR_COMPLETED[colorTag] ?? "bg-blue-500";
  const missedClass = COLOR_MISSED[colorTag] ?? "bg-blue-100 dark:bg-blue-950";

  return (
    <div
      ref={containerRef}
      aria-label={`Completion history: ${completedCount} of 365 days completed in the last year`}
    >
      <div className="flex flex-col gap-2">
        <div className="relative h-6 flex items-start" aria-hidden="true">
          {monthLabels.map(({ label, left }) => (
            <span
              key={`${label}-${left}`}
              className="absolute text-xs text-zinc-500 whitespace-nowrap"
              style={{ left: `${left}px` }}
            >
              {label}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateRows: `repeat(7, ${cellSize}px)`,
            gridAutoFlow: "column",
            gridAutoColumns: `${cellSize}px`,
            gap: `${GAP}px`,
          }}
          aria-hidden="true"
        >
          {Array.from({ length: fillerCount }).map((_, i) => (
            <div key={`filler-${i}`} style={{ visibility: "hidden" }} />
          ))}
          {cells.map((cell) => (
            <div
              key={cell.date}
              title={cell.date}
              className={`rounded-sm transition-all duration-100 ${
                cell.state === "completed"
                  ? completedClass
                  : cell.state === "missed"
                    ? missedClass
                    : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Heatmap;
