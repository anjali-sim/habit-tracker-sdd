import type { Habit, CreateHabitInput, UpdateHabitInput } from "../types";
import { todayISO } from "../utils/date";

const KEY = "hf_habits";

function read(): Habit[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Habit[]) : [];
  } catch {
    return [];
  }
}

function write(habits: Habit[]): void {
  localStorage.setItem(KEY, JSON.stringify(habits));
}

export function getAll(): Habit[] {
  return read();
}

export function getById(id: string): Habit | undefined {
  return read().find((h) => h.id === id);
}

export function create(input: CreateHabitInput): Habit {
  const habits = read();
  const nameLower = input.name.trim().toLowerCase();
  if (!nameLower) throw new Error("Name is required");
  if (habits.some((h) => h.name.trim().toLowerCase() === nameLower)) {
    throw new Error("A habit with this name already exists");
  }
  const habit: Habit = {
    ...input,
    name: input.name.trim(),
    id: crypto.randomUUID(),
    createdAt: todayISO(),
  };
  write([...habits, habit]);
  return habit;
}

export function update(id: string, input: UpdateHabitInput): Habit {
  const habits = read();
  const index = habits.findIndex((h) => h.id === id);
  if (index === -1) throw new Error("Habit not found");
  if (input.name !== undefined) {
    const nameLower = input.name.trim().toLowerCase();
    if (!nameLower) throw new Error("Name is required");
    if (
      habits.some(
        (h) => h.id !== id && h.name.trim().toLowerCase() === nameLower,
      )
    ) {
      throw new Error("A habit with this name already exists");
    }
  }
  const updated: Habit = {
    ...habits[index],
    ...input,
    name: (input.name ?? habits[index].name).trim(),
  };
  const next = [...habits];
  next[index] = updated;
  write(next);
  return updated;
}

export function remove(id: string): void {
  write(read().filter((h) => h.id !== id));
}
