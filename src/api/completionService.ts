import type { CompletionRecord } from "../types";

const KEY = "hf_completions";

function read(): CompletionRecord {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CompletionRecord) : {};
  } catch {
    return {};
  }
}

function write(record: CompletionRecord): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    throw new Error("Failed to save completion");
  }
}

export function getAll(): CompletionRecord {
  return read();
}

export function getForHabit(habitId: string): string[] {
  return read()[habitId] ?? [];
}

export function isComplete(habitId: string, date: string): boolean {
  return getForHabit(habitId).includes(date);
}

export function markComplete(habitId: string, date: string): void {
  const record = read();
  const dates = record[habitId] ?? [];
  if (dates.includes(date)) return;
  const sorted = [...dates, date].sort();
  write({ ...record, [habitId]: sorted });
}

export function markIncomplete(habitId: string, date: string): void {
  const record = read();
  const dates = (record[habitId] ?? []).filter((d) => d !== date);
  write({ ...record, [habitId]: dates });
}

export function deleteForHabit(habitId: string): void {
  const record = read();
  const { [habitId]: _, ...rest } = record;
  write(rest);
}

export function countForDay(habitId: string, date: string): number {
  return (read()[habitId] ?? []).filter((e) => e.slice(0, 10) === date).length;
}

export function countForMonth(
  habitId: string,
  year: number,
  month: number,
): number {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return (read()[habitId] ?? []).filter((e) => e.slice(0, 7) === prefix).length;
}

export function addCompletion(habitId: string, entry: string): void {
  const record = read();
  const entries = record[habitId] ?? [];
  write({ ...record, [habitId]: [...entries, entry] });
}

export function removeLastCompletion(habitId: string, date: string): void {
  const record = read();
  const entries = record[habitId] ?? [];
  const idx = entries.map((e) => e.slice(0, 10)).lastIndexOf(date);
  if (idx === -1) return;
  const next = [...entries.slice(0, idx), ...entries.slice(idx + 1)];
  write({ ...record, [habitId]: next });
}
