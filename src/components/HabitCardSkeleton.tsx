function HabitCardSkeleton() {
  return (
    <div
      className="rounded-xl bg-zinc-900 p-4 animate-pulse flex flex-col gap-3"
      aria-hidden="true"
    >
      <div className="h-5 w-2/3 rounded bg-zinc-700" />
      <div className="flex gap-2">
        <div className="h-4 w-16 rounded bg-zinc-700" />
        <div className="h-4 w-4 rounded-full bg-zinc-700" />
      </div>
      <div className="flex gap-3 mt-1">
        <div className="h-6 w-20 rounded-full bg-zinc-700" />
        <div className="h-6 w-20 rounded-full bg-zinc-700" />
      </div>
      <div className="mt-1 h-10 w-10 rounded-full bg-zinc-700 self-end" />
    </div>
  );
}

export default HabitCardSkeleton;
