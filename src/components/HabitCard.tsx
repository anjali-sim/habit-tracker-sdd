import { Link } from "react-router-dom";
import type { Habit, StreakData } from "../types";
import StreakBadge from "./StreakBadge";
import CompletionCheckbox from "./CompletionCheckbox";
import { useCompletionStore } from "../store/completionStore";
import { todayISO } from "../utils/date";
import { currentStreak, longestStreak } from "../utils/streak";

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
  const { completions, toggleComplete } = useCompletionStore();
  const dates = new Set<string>(completions[habit.id] ?? []);
  const completedToday = dates.has(today);
  const streakData: StreakData = {
    current: currentStreak(dates, today),
    longest: longestStreak(dates, habit.createdAt, today),
  };

  return (
    <div
      className={`rounded-xl bg-zinc-900 p-4 flex flex-col gap-3 transition-opacity ${isDragging ? "opacity-40" : completedToday ? "opacity-55" : "opacity-100"}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-label={`${habit.name} habit card`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/habit/${habit.id}`}
          className="text-lg font-semibold text-zinc-100 hover:text-violet-400 transition-colors leading-tight"
        >
          {habit.name}
        </Link>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(habit.id)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            aria-label={`Edit ${habit.name}`}
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={() => onDelete(habit.id)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
            aria-label={`Delete ${habit.name}`}
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">{habit.category}</span>
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
        <CompletionCheckbox
          habitId={habit.id}
          habitName={habit.name}
          date={today}
          checked={completedToday}
          onChange={() => toggleComplete(habit.id, today)}
        />
      </div>
    </div>
  );
}

export default HabitCard;
