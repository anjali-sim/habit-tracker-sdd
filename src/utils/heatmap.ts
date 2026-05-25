import type { HeatmapCell, HeatmapCellState } from "../types";

export function buildHeatmapCells(
  completions: Set<string>,
  createdAt: string,
  today: string,
): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  const end = new Date(today + "T00:00:00");
  const start = new Date(end);
  start.setDate(end.getDate() - 364);

  const created = new Date(createdAt + "T00:00:00");
  const todayDate = new Date(today + "T00:00:00");
  const cursor = new Date(start);

  while (cursor <= end) {
    const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    let state: HeatmapCellState;
    if (cursor < created || cursor > todayDate) {
      state = "empty";
    } else if (completions.has(dateStr)) {
      state = "completed";
    } else {
      state = "missed";
    }
    cells.push({ date: dateStr, state });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

export function getMonthLabels(
  cells: HeatmapCell[],
): Array<{ label: string; colIndex: number }> {
  const labels: Array<{ label: string; colIndex: number }> = [];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let lastMonth = -1;
  cells.forEach((cell, i) => {
    const month = new Date(cell.date + "T00:00:00").getMonth();
    if (month !== lastMonth) {
      labels.push({ label: months[month], colIndex: Math.floor(i / 7) });
      lastMonth = month;
    }
  });
  return labels;
}
