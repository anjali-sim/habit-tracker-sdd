import { useState } from "react";
import { Link } from "react-router-dom";
import type { Habit, StreakData } from "../types";
import StreakBadge from "./StreakBadge";
import CompletionCheckbox from "./CompletionCheckbox";
import { useCompletionStore } from "../store/completionStore";
import { todayISO, daysInMonth } from "../utils/date";
import { currentStreak, longestStreak } from "../utils/streak";
import {
  countForDay,
  countForMonth,
  addCompletion,
  removeLastCompletion,
} from "../api/completionService";
import { getPermissionStatus } from "../api/reminderService";

const COLOR_CLASSES: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
  green: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-violet-500",
};

interface HabitCardProps {
  habit: Habit;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
}

function HabitCard({
  habit,
  onEdit,
  onDelete,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: HabitCardProps) {
  const today = todayISO();
  const now = new Date();
  const { completions, toggleComplete } = useCompletionStore();
  const dates = new Set<string>(completions[habit.id] ?? []);
  const completedToday = dates.has(today);
  const streakData: StreakData = {
    current: currentStreak(dates, today),
    longest: longestStreak(dates, habit.createdAt, today),
  };

  const [hourlyCount, setHourlyCount] = useState(() =>
    habit.frequency === "hourly" ? countForDay(habit.id, today) : 0,
  );
  const [monthlyCount, setMonthlyCount] = useState(() =>
    habit.frequency === "monthly"
      ? countForMonth(habit.id, now.getFullYear(), now.getMonth() + 1)
      : 0,
  );

  const monthDays = daysInMonth(now.getFullYear(), now.getMonth() + 1);
  const hourlyTarget = (habit.hourlyTarget ?? 1) * 24;
  const notificationsBlocked =
    !!habit.reminderTime && getPermissionStatus() === "denied";

  function handleAddHourly() {
    addCompletion(habit.id, new Date().toISOString().slice(0, 16));
    setHourlyCount((c) => c + 1);
  }

  function handleRemoveHourly() {
    removeLastCompletion(habit.id, today);
    setHourlyCount((c) => Math.max(0, c - 1));
  }

  function handleAddMonthly() {
    addCompletion(habit.id, today);
    setMonthlyCount((c) => c + 1);
  }

  function handleRemoveMonthly() {
    removeLastCompletion(habit.id, today);
    setMonthlyCount((c) => Math.max(0, c - 1));
  }

  return (
    <div
      className={`rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-transparent p-4 flex flex-col gap-3 transition-opacity ${isDragging ? "opacity-40" : completedToday ? "opacity-55" : "opacity-100"}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-label={`${habit.name} habit card`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to={`/habit/${habit.id}`}
            className="text-lg font-semibold text-gray-900 dark:text-zinc-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors leading-tight"
          >
            {habit.name}
          </Link>
          {notificationsBlocked && (
            <span
              className="text-amber-400 text-xs shrink-0"
              title="Notifications blocked — reminder will not fire"
              aria-label="Notifications blocked"
            >
              🔕
            </span>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(habit.id)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={`Edit ${habit.name}`}
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={() => onDelete(habit.id)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={`Delete ${habit.name}`}
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-zinc-400">
          {habit.category}
        </span>
        <span
          className={`h-3 w-3 rounded-full ${COLOR_CLASSES[habit.colorTag] ?? "bg-blue-500"}`}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <StreakBadge type="current" count={streakData.current} />
        <StreakBadge type="longest" count={streakData.longest} />
      </div>

      <div className="flex items-center justify-end">
        {habit.frequency === "hourly" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-zinc-300 tabular-nums">
              {hourlyCount}/{hourlyTarget} times
            </span>
            <button
              type="button"
              onClick={handleAddHourly}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-lg"
              aria-label="Log one completion"
            >
              +
            </button>
            {hourlyCount > 0 && (
              <button
                type="button"
                onClick={handleRemoveHourly}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-lg"
                aria-label="Remove last completion"
              >
                −
              </button>
            )}
          </div>
        )}

        {habit.frequency === "monthly" && (
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm text-gray-600 dark:text-zinc-300 tabular-nums">
                {monthlyCount}/{monthDays} times
              </span>
              <button
                type="button"
                onClick={handleAddMonthly}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-lg"
                aria-label="Log one completion"
              >
                +
              </button>
              {monthlyCount > 0 && (
                <button
                  type="button"
                  onClick={handleRemoveMonthly}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-lg"
                  aria-label="Remove last completion"
                >
                  −
                </button>
              )}
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-1.5 rounded-full bg-indigo-500 transition-all"
                style={{
                  width: `${Math.min((monthlyCount / monthDays) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {(habit.frequency === "daily" || habit.frequency === "weekly") && (
          <CompletionCheckbox
            habitId={habit.id}
            habitName={habit.name}
            date={today}
            checked={completedToday}
            onChange={() => toggleComplete(habit.id, today)}
          />
        )}
      </div>
    </div>
  );
}

export default HabitCard;
