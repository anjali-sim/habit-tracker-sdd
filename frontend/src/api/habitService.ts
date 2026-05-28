import type { Habit, CreateHabitInput, UpdateHabitInput } from "../types";
import { api } from "./apiClient";

export function getAll(): Promise<Habit[]> {
  return api.get<Habit[]>("/api/habits");
}

export function getById(id: string): Promise<Habit | undefined> {
  return api.get<Habit>(`/api/habits/${id}`).catch(() => undefined);
}

export function create(input: CreateHabitInput): Promise<Habit> {
  return api.post<Habit>("/api/habits", input);
}

export function update(id: string, input: UpdateHabitInput): Promise<Habit> {
  return api.put<Habit>(`/api/habits/${id}`, input);
}

export function remove(id: string): Promise<void> {
  return api.delete(`/api/habits/${id}`);
}
