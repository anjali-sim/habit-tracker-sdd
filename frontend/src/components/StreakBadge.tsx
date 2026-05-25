interface StreakBadgeProps {
  type: "current" | "longest";
  count: number;
}

function StreakBadge({ type, count }: StreakBadgeProps) {
  const label = `${count} ${count === 1 ? "day" : "days"}`;
  const ariaLabel =
    type === "current"
      ? `${count} ${count === 1 ? "day" : "days"} streak`
      : `${count} ${count === 1 ? "day" : "days"} personal best`;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-zinc-800 px-3 py-1 text-sm text-gray-700 dark:text-zinc-200"
      aria-label={ariaLabel}
    >
      <span aria-hidden="true">{type === "current" ? "🔥" : "🏆"}</span>
      {label}
    </span>
  );
}

export default StreakBadge;
