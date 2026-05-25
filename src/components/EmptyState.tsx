interface EmptyStateProps {
  onAddHabit: () => void;
}

function EmptyState({ onAddHabit }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h2 className="text-2xl font-bold text-zinc-100">No habits yet</h2>
      <p className="text-zinc-400 max-w-xs">
        Start building your routine by adding your first habit.
      </p>
      <button
        type="button"
        onClick={onAddHabit}
        className="mt-2 rounded-lg bg-violet-600 px-6 py-3 min-h-[44px] min-w-[44px] text-white font-semibold hover:bg-violet-500 transition-colors"
      >
        Add your first habit
      </button>
    </div>
  );
}

export default EmptyState;
