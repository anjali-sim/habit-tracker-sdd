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
