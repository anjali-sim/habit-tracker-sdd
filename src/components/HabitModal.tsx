import { useEffect, useRef, useState } from "react";
import type { CreateHabitInput, Category, ColorTag, Frequency } from "../types";
import { requestPermission, getPermissionStatus } from "../api/reminderService";

const CATEGORIES: Category[] = [
  "Health",
  "Fitness",
  "Learning",
  "Mindfulness",
  "Work",
  "Personal",
];
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
  const [hourlyTarget, setHourlyTarget] = useState<number>(
    initialValues?.hourlyTarget ?? 1,
  );
  const [hourlyTargetError, setHourlyTargetError] = useState("");
  const [reminderTime, setReminderTime] = useState<string>(
    initialValues?.reminderTime ?? "",
  );
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required");
      nameRef.current?.focus();
      return;
    }
    setNameError("");
    if (
      frequency === "hourly" &&
      (!Number.isInteger(hourlyTarget) || hourlyTarget < 1)
    ) {
      setHourlyTargetError("Target must be a whole number ≥ 1");
      return;
    }
    setHourlyTargetError("");
    if (reminderTime && getPermissionStatus() === "default") {
      await requestPermission();
    }
    if (reminderTime && getPermissionStatus() === "denied") {
      setNotificationsBlocked(true);
    } else {
      setNotificationsBlocked(false);
    }
    onSubmit({
      name: trimmed,
      category,
      colorTag,
      frequency,
      hourlyTarget: frequency === "hourly" ? hourlyTarget : undefined,
      reminderTime: reminderTime || undefined,
    });
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
              onChange={(e) => {
                const f = e.target.value as Frequency;
                setFrequency(f);
                if (f !== "hourly") setHourlyTargetError("");
              }}
              className="rounded-lg bg-zinc-800 px-3 py-2 text-zinc-100 border border-zinc-700 focus:outline-none focus:border-violet-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="hourly">Hourly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {frequency === "hourly" && (
            <div className="flex flex-col gap-1">
              <label
                htmlFor="hourlyTarget"
                className="text-sm font-medium text-zinc-300"
              >
                Target completions per hour
              </label>
              <input
                id="hourlyTarget"
                type="number"
                min={1}
                step={1}
                value={hourlyTarget}
                onChange={(e) =>
                  setHourlyTarget(Math.floor(Number(e.target.value)))
                }
                className="rounded-lg bg-zinc-800 px-3 py-2 text-zinc-100 border border-zinc-700 focus:outline-none focus:border-violet-500"
              />
              {hourlyTargetError && (
                <span className="text-sm text-red-400">
                  {hourlyTargetError}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label
              htmlFor="reminderTime"
              className="text-sm font-medium text-zinc-300"
            >
              Reminder
            </label>
            <div className="flex items-center gap-2">
              <input
                id="reminderTime"
                type="time"
                value={reminderTime}
                onChange={(e) => {
                  setReminderTime(e.target.value);
                  if (!e.target.value) setNotificationsBlocked(false);
                }}
                className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-zinc-100 border border-zinc-700 focus:outline-none focus:border-violet-500"
              />
              {reminderTime && (
                <button
                  type="button"
                  onClick={() => {
                    setReminderTime("");
                    setNotificationsBlocked(false);
                  }}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  aria-label="No reminder"
                >
                  ✕
                </button>
              )}
            </div>
            {notificationsBlocked && (
              <p className="text-sm text-amber-400">
                Notifications are blocked. Enable them in browser settings to
                receive this reminder.
              </p>
            )}
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
