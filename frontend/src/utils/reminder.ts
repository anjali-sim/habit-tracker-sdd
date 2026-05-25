import { useEffect, useRef } from "react";
import type { Habit } from "../types";
import { canNotify, sendNotification } from "../api/reminderService";

export function msUntilTime(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

export function useReminderScheduler(habits: Habit[]): void {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();

    if (!canNotify()) return;

    habits.forEach((habit) => {
      if (!habit.reminderTime) return;
      const id = setTimeout(
        () => sendNotification(habit.name),
        msUntilTime(habit.reminderTime),
      );
      timers.current.set(habit.id, id);
    });

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    };
  }, [habits]);
}
