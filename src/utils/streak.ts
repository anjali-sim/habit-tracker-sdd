import { previousDay } from "./date";

export function currentStreak(dates: Set<string>, today: string): number {
  if (dates.size === 0) return 0;
  const yesterday = previousDay(today);
  let cursor = dates.has(today)
    ? today
    : dates.has(yesterday)
      ? yesterday
      : null;
  if (!cursor) return 0;
  let count = 0;
  while (cursor && dates.has(cursor)) {
    count++;
    cursor = previousDay(cursor);
  }
  return count;
}

export function longestStreak(
  dates: Set<string>,
  createdAt: string,
  today: string,
): number {
  if (dates.size === 0) return 0;
  let best = 0;
  let running = 0;
  const start = new Date(createdAt + "T00:00:00");
  const end = new Date(today + "T00:00:00");
  const cursor = new Date(start);
  while (cursor <= end) {
    const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (dates.has(dateStr)) {
      running++;
      if (running > best) best = running;
    } else {
      running = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return best;
}
