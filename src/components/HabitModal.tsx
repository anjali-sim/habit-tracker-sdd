import { useEffect, useRef, useState } from "react";
import type { CreateHabitInput, Category, ColorTag, Frequency } from "../types";

const CATEGORIES: Category[] = [
  "Health",
  "Fitness",
  "Learning",
  "Mindfulness",
  "Work",
  "Personal",
];
const FREQUENCIES: Frequency[] = ["daily", "weekly"];
const COLOR_TAGS: { value: ColorTag; bg: string }[] = [
  { value: "red", bg: "bg-red-500" },
  { value: "orange", bg: "bg-orange-500" },
  { value: "yellow", bg: "bg-yellow-400" },
  { value: "green", bg: "bg-emerald-500" },
  { value: "blue", bg: "bg-blue-500" },
  { value: "purple", bg: "bg-violet-500" },
];

interface HabitModalProps {
  mode: "add" | "edit";
  initialValues?: Partial<CreateHabitInput>;
  onSubmit: (input: CreateHabitInput) => void;
  onClose: () => void;
}

function HabitModal({
  mode,
  initialValues,
  onSubmit,
  onClose,
}: HabitModalProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [category, setCategory] = useState<Category>(
    initialValues?.category ?? "Health",
  );
  const [colorTag, setColorTag] = useState<ColorTag>(
    initialValues?.colorTag ?? "blue",
  );
  const [frequency, setFrequency] = useState<Frequency>(
    initialValues?.frequency ?? "daily",
  );
  const [nameError, setNameError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required");
      nameRef.current?.focus();
      return;
    }
    setNameError("");
    onSubmit({ name: trimmed, category, colorTag, frequency });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 flex flex-col gap-5">
        <h2 id="habit-modal-title" className="text-lg font-bold text-zinc-100">
          {mode === "add" ? "Add Habit" : "Edit Habit"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="habit-name"
              className="text-sm font-medium text-zinc-300"
            >
              Name
            </label>
            <input
              ref={nameRef}
              id="habit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Run"
              className="rounded-lg bg-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:border-violet-500"
            />
            {nameError && (
              <span className="text-sm text-red-400">{nameError}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="habit-category"
              className="text-sm font-medium text-zinc-300"
            >
              Category
            </label>
            <select
              id="habit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="rounded-lg bg-zinc-800 px-3 py-2 text-zinc-100 border border-zinc-700 focus:outline-none focus:border-violet-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-300">Colour</span>
            <div className="flex gap-3 flex-wrap">
              {COLOR_TAGS.map(({ value, bg }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColorTag(value)}
                  className={`h-8 w-8 min-h-[44px] min-w-[44px] rounded-full ${bg} flex items-center justify-center transition-transform ${colorTag === value ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110" : ""}`}
                  aria-label={`Select ${value} colour`}
                  aria-pressed={colorTag === value}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="habit-frequency"
              className="text-sm font-medium text-zinc-300"
            >
              Frequency
            </label>
            <select
              id="habit-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className="rounded-lg bg-zinc-800 px-3 py-2 text-zinc-100 border border-zinc-700 focus:outline-none focus:border-violet-500"
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 min-h-[44px] text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-4 py-2 min-h-[44px] text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
            >
              {mode === "add" ? "Add Habit" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HabitModal;
