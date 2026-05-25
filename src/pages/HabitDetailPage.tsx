import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useHabitStore } from "../store/habitStore";
import { useCompletionStore } from "../store/completionStore";
import StreakBadge from "../components/StreakBadge";
import Heatmap from "../components/Heatmap";
import HabitCardSkeleton from "../components/HabitCardSkeleton";
import { todayISO } from "../utils/date";
import { currentStreak, longestStreak } from "../utils/streak";
import { buildHeatmapCells } from "../utils/heatmap";

const COLOR_CLASSES: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
  green: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-violet-500",
};

function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { habits, isLoading, error, loadHabits } = useHabitStore();
  const { completions, loadCompletions } = useCompletionStore();

  useEffect(() => {
    loadHabits();
    loadCompletions();
  }, [loadHabits, loadCompletions]);

  const habit = habits.find((h) => h.id === id);
  const today = todayISO();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-100 mb-6 sticky top-4"
        >
          ← Back
        </Link>
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <HabitCardSkeleton />
          <div className="h-40 rounded-xl bg-zinc-900 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <button
          type="button"
          onClick={loadHabits}
          className="rounded-lg bg-zinc-800 px-4 py-2 min-h-[44px] text-sm text-zinc-100 hover:bg-zinc-700 transition-colors"
        >
          Retry
        </button>
        <Link to="/" className="text-violet-400 hover:underline text-sm">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400 text-lg">Habit not found.</p>
        <Link
          to="/"
          className="rounded-lg bg-violet-600 px-4 py-2 min-h-[44px] text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const dates = new Set<string>(completions[habit.id] ?? []);
  const streakData = {
    current: currentStreak(dates, today),
    longest: longestStreak(dates, habit.createdAt, today),
  };
  const cells = buildHeatmapCells(dates, habit.createdAt, today);
  const completedCount = cells.filter((c) => c.state === "completed").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-4 py-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
        >
          ← Back
        </Link>
      </div>

      <main className="p-4 max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-100 leading-tight">
            {habit.name}
          </h1>
          <span
            className={`h-4 w-4 rounded-full ${COLOR_CLASSES[habit.colorTag] ?? "bg-blue-500"}`}
            aria-hidden="true"
          />
        </div>

        <p className="text-zinc-400 text-sm -mt-4">
          {habit.category} · {habit.frequency}
        </p>

        <div className="flex flex-wrap gap-3">
          <StreakBadge type="current" count={streakData.current} />
          <StreakBadge type="longest" count={streakData.longest} />
        </div>

        <div className="rounded-xl bg-zinc-900 p-4">
          <h2 className="text-sm font-medium text-zinc-400 mb-3">
            Last 365 days
          </h2>
          <Heatmap
            cells={cells}
            colorTag={habit.colorTag}
            completedCount={completedCount}
          />
        </div>
      </main>
    </div>
  );
}

export default HabitDetailPage;
