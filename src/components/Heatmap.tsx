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

interface HeatmapProps {
  cells: HeatmapCell[];
  colorTag: ColorTag;
  completedCount: number;
}

function Heatmap({ cells, colorTag, completedCount }: HeatmapProps) {
  const monthLabels = getMonthLabels(cells);
  const firstDate = cells[0]
    ? new Date(cells[0].date + "T00:00:00")
    : new Date();
  const fillerCount = firstDate.getDay();
  const completedClass = COLOR_COMPLETED[colorTag] ?? "bg-blue-500";

  return (
    <div
      className="overflow-x-auto"
      aria-label={`Completion history: ${completedCount} of 365 days completed in the last year`}
    >
      <div className="inline-flex flex-col gap-1 min-w-max">
        <div className="relative flex h-5" aria-hidden="true">
          {monthLabels.map(({ label, colIndex }) => (
            <span
              key={`${label}-${colIndex}`}
              className="absolute text-xs text-zinc-500"
              style={{ left: `${colIndex * 14}px` }}
            >
              {label}
            </span>
          ))}
        </div>

        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateRows: "repeat(7, 10px)",
            gridAutoFlow: "column",
            gridAutoColumns: "10px",
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
              className={`rounded-sm ${
                cell.state === "completed"
                  ? completedClass
                  : cell.state === "missed"
                    ? "bg-zinc-700"
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
