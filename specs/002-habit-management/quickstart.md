# Quickstart: Habit Management — Frequency Expansion

**Phase**: 1 — Design
**Date**: 2026-05-25
**Feature**: [spec.md](./spec.md) | [plan.md](../008-habit-reminders/plan.md) | [data-model.md](./data-model.md)

---

## What Is Being Built

Expanding habit frequency from 2 options (daily/weekly) to 4 (daily/weekly/hourly/monthly). Hourly habits store a per-hour target count and display today's tally on the dashboard card. Monthly habits display the current-month count with a progress bar. No new npm packages.

---

## Files to Modify

### 1. `src/types/habit.ts` — EXPAND frequency + ADD hourlyTarget

> **Note**: Also apply the `reminderTime?: string` addition from 008-habit-reminders in the same edit.

```typescript
export type Frequency = "daily" | "weekly" | "hourly" | "monthly"; // ← ADD hourly, monthly

export interface Habit {
  id: string;
  name: string;
  category: Category;
  colorTag: ColorTag;
  frequency: Frequency;
  createdAt: string;
  hourlyTarget?: number; // ← ADD: positive integer; only set when frequency === 'hourly'
  reminderTime?: string; // ← ADD (from 008): 'HH:MM' | undefined
}
```

### 2. `src/utils/date.ts` — ADD daysInMonth helper

```typescript
// Add alongside existing exports:
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
```

### 3. `src/api/completionService.ts` — ADD four new counting functions

```typescript
export function countForDay(habitId: string, date: string): number {
  return getForHabit(habitId).filter((e) => e.startsWith(date)).length;
}

export function countForMonth(
  habitId: string,
  year: number,
  month: number,
): number {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return getForHabit(habitId).filter((e) => e.startsWith(prefix)).length;
}

export function addCompletion(habitId: string, entry: string): void {
  const record = read();
  const entries = record[habitId] ?? [];
  write({ ...record, [habitId]: [...entries, entry] });
}

export function removeLastCompletion(habitId: string, date: string): void {
  const record = read();
  const entries = record[habitId] ?? [];
  const idx = entries
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.startsWith(date))
    .pop()?.i;
  if (idx === undefined) return;
  const next = [...entries];
  next.splice(idx, 1);
  write({ ...record, [habitId]: next });
}
```

### 4. `src/components/HabitModal.tsx` — ADD hourlyTarget field + update frequency selector

**Update frequency selector** to include all four options:

```tsx
<select
  value={frequency}
  onChange={(e) => setFrequency(e.target.value as Frequency)}
>
  <option value="daily">Daily</option>
  <option value="weekly">Weekly</option>
  <option value="hourly">Hourly</option>
  <option value="monthly">Monthly</option>
</select>
```

**Add hourlyTarget state** (initialised from habit prop when editing):

```typescript
const [hourlyTarget, setHourlyTarget] = useState<number>(
  habit?.hourlyTarget ?? 1,
);
const [hourlyTargetError, setHourlyTargetError] = useState("");
```

**Add conditional field** (rendered only when `frequency === 'hourly'`):

```tsx
{
  frequency === "hourly" && (
    <div>
      <label htmlFor="hourlyTarget" className="block text-sm font-medium">
        Target count per hour
      </label>
      <input
        id="hourlyTarget"
        type="number"
        min={1}
        step={1}
        value={hourlyTarget}
        onChange={(e) => {
          setHourlyTargetError("");
          setHourlyTarget(Number(e.target.value));
        }}
        className="..." // match existing input styling
      />
      {hourlyTargetError && (
        <p className="text-red-500 text-sm mt-1">{hourlyTargetError}</p>
      )}
    </div>
  );
}
```

**Add validation before save**:

```typescript
if (frequency === "hourly") {
  if (!Number.isInteger(hourlyTarget) || hourlyTarget < 1) {
    setHourlyTargetError("Must be a whole number of at least 1");
    return;
  }
}
const input = {
  name,
  category,
  colorTag,
  frequency,
  hourlyTarget: frequency === "hourly" ? hourlyTarget : undefined,
  reminderTime: reminderTime || undefined,
};
```

### 5. `src/components/HabitCard.tsx` — ADD hourly/monthly display variants

**Import new utils and service functions**:

```typescript
import {
  countForDay,
  countForMonth,
  addCompletion,
  removeLastCompletion,
} from "../api/completionService";
import { todayISO, daysInMonth } from "../utils/date";
```

**Render branching** (add inside the card's completion area):

```tsx
{
  habit.frequency === "hourly" &&
    (() => {
      const today = todayISO();
      const count = countForDay(habit.id, today);
      const total = (habit.hourlyTarget ?? 1) * 24;
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm tabular-nums">
            {count}/{total} times
          </span>
          <button
            onClick={() =>
              addCompletion(habit.id, new Date().toISOString().slice(0, 16))
            }
            className="min-w-[44px] min-h-[44px] ..."
            aria-label="Log one completion"
          >
            +
          </button>
          {count > 0 && (
            <button
              onClick={() => removeLastCompletion(habit.id, today)}
              className="min-w-[44px] min-h-[44px] ..."
              aria-label="Remove last completion"
            >
              −
            </button>
          )}
        </div>
      );
    })();
}

{
  habit.frequency === "monthly" &&
    (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const count = countForMonth(habit.id, year, month);
      const days = daysInMonth(year, month);
      const pct = Math.min((count / days) * 100, 100);
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm tabular-nums">
              {count}/{days} times
            </span>
            <button
              onClick={() => addCompletion(habit.id, todayISO())}
              className="min-w-[44px] min-h-[44px] ..."
              aria-label="Log one completion"
            >
              +
            </button>
            {count > 0 && (
              <button
                onClick={() => removeLastCompletion(habit.id, todayISO())}
                className="min-w-[44px] min-h-[44px] ..."
                aria-label="Remove last completion"
              >
                −
              </button>
            )}
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-1.5 rounded-full bg-indigo-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      );
    })();
}
```

---

## Key Constraints Reminder

- `addCompletion` does NOT deduplicate — intentional for hourly/monthly multi-completion support.
- `hourlyTarget` must be set to `undefined` (not `0` or `null`) when frequency is not `'hourly'` — the habitService passes it through generically.
- `countForDay` and `countForMonth` use string prefix matching — this works for both `'YYYY-MM-DD'` and `'YYYY-MM-DDTHH:MM'` entries.
- The `HabitCard` must import from `../utils/date` (not directly reference `new Date()` inline for `daysInMonth`) to stay consistent with the `date.ts` utility module.
- Existing `markComplete` / `markIncomplete` / `isComplete` functions remain unchanged and are still used by daily/weekly habits.
