import type { CompletionRecord } from "../types";
import { api } from "./apiClient";

export function getAll(): Promise<CompletionRecord> {
  return api.get<CompletionRecord>("/api/completions");
}

export function getForHabit(habitId: string): Promise<string[]> {
  return api.get<string[]>(`/api/completions/${habitId}`);
}

export async function isComplete(
  habitId: string,
  date: string,
): Promise<boolean> {
  const { completed } = await api.get<{ completed: boolean }>(
    `/api/completions/${habitId}/check?date=${encodeURIComponent(date)}`,
  );
  return completed;
}

export function markComplete(habitId: string, date: string): Promise<void> {
  return api.post(`/api/completions/${habitId}/mark-complete`, { date });
}

export function markIncomplete(habitId: string, date: string): Promise<void> {
  return api.post(`/api/completions/${habitId}/mark-incomplete`, { date });
}

export function deleteForHabit(habitId: string): Promise<void> {
  return api.delete(`/api/completions/${habitId}`);
}

export async function countForDay(
  habitId: string,
  date: string,
): Promise<number> {
  const { count } = await api.get<{ count: number }>(
    `/api/completions/${habitId}/count-day?date=${encodeURIComponent(date)}`,
  );
  return count;
}

export async function countForMonth(
  habitId: string,
  year: number,
  month: number,
): Promise<number> {
  const { count } = await api.get<{ count: number }>(
    `/api/completions/${habitId}/count-month?year=${year}&month=${month}`,
  );
  return count;
}

export function addCompletion(habitId: string, entry: string): Promise<void> {
  return api.post(`/api/completions/${habitId}/add`, { entry });
}

export function removeLastCompletion(
  habitId: string,
  date: string,
): Promise<void> {
  return api.post(`/api/completions/${habitId}/remove-last`, { date });
}
