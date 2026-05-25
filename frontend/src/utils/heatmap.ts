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
  dayOffset = 0,
  cellSize: number = 10,
  gap: number = 2,
): Array<{ label: string; left: number }> {
  const labels: Array<{ label: string; left: number }> = [];
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
  if (cells.length === 0) return labels;

  const stride = cellSize + gap;
  const MIN_COL_GAP = 3;

  // A 365-day view always starts and ends in the same calendar month (e.g. May→May).
  // Detect this so we can skip the first partial-month occurrence during collection,
  // which lets the intervening month (Jun) get a fair gap check and prevents a
  // duplicate label while keeping all 12 months naturally spaced.
  const startMonth = new Date(cells[0].date + "T00:00:00").getMonth();
  const endMonth = new Date(
    cells[cells.length - 1].date + "T00:00:00",
  ).getMonth();
  const wrapsSameMonth = startMonth === endMonth;
  let firstOccurrenceSkipped = false;

  let prevMonth = -1;
  let lastColIndex = -MIN_COL_GAP;

  cells.forEach((cell, i) => {
    const month = new Date(cell.date + "T00:00:00").getMonth();
    if (month === prevMonth) return;

    // Skip the very first occurrence of the repeated month (partial start month)
    if (wrapsSameMonth && month === startMonth && !firstOccurrenceSkipped) {
      firstOccurrenceSkipped = true;
      prevMonth = month;
      return;
    }

    const colIndex = Math.floor((i + dayOffset) / 7);
    if (colIndex - lastColIndex >= MIN_COL_GAP) {
      labels.push({ label: months[month], left: colIndex * stride });
      lastColIndex = colIndex;
    }
    prevMonth = month;
  });

  // Align the last label to today's column so it sits directly above the most-recent dot.
  if (labels.length > 0 && cells.length > 0) {
    const lastCol = Math.floor((cells.length - 1 + dayOffset) / 7);
    labels[labels.length - 1] = {
      ...labels[labels.length - 1],
      left: lastCol * stride,
    };
  }

  return labels;
}
