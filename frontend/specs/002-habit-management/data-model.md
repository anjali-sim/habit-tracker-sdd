# Data Model: Habit Management — Frequency Expansion

**Phase**: 1 — Design
**Date**: 2026-05-25
**Feature**: [spec.md](./spec.md) | [plan.md](../008-habit-reminders/plan.md)

---

## Changes to Existing Types

### `Frequency` — `src/types/habit.ts`

```typescript
// Before:
export type Frequency = "daily" | "weekly";

// After:
export type Frequency = "daily" | "weekly" | "hourly" | "monthly";
```

### `Habit` — `src/types/habit.ts`

One optional field is added. Combined with the 008 reminders change, the final interface is:

```typescript
export interface Habit {
  id: string;
  name: string;
  category: Category;
  colorTag: ColorTag;
  frequency: Frequency; // now 4 values
  createdAt: string;
  hourlyTarget?: number; // ADD: positive integer; present only when frequency === 'hourly'
  reminderTime?: string; // ADD (008): 'HH:MM' | undefined
}
```

**Validation rules for `hourlyTarget`**:

- Present and a positive integer (≥ 1) when `frequency === 'hourly'`.
- Absent (`undefined`) for `'daily'`, `'weekly'`, and `'monthly'` habits.
- Defaults to `1` when not provided by a form submitting an hourly habit.

`CreateHabitInput` and `UpdateHabitInput` automatically include `hourlyTarget?` and `reminderTime?` via `Omit` / `Partial` — no alias changes needed.

---

## Changes to Completion Service — `src/api/completionService.ts`

The current `CompletionRecord` stores date strings (`'YYYY-MM-DD'`) per habit. For hourly and monthly habits, multiple completions per day/month are needed. The storage model extends to support ISO datetime strings (`'YYYY-MM-DDTHH:MM'`) for hourly completions, while daily/weekly completions continue to use date-only strings.

### New functions

```typescript
// Returns the number of completions logged for habitId on the given date ('YYYY-MM-DD').
// Counts entries whose date portion matches — supports both date-only and datetime strings.
countForDay(habitId: string, date: string): number

// Returns the number of completions logged for habitId in the given month.
// year: full year (e.g. 2026), month: 1-based (1 = January).
countForMonth(habitId: string, year: number, month: number): number

// Appends a completion entry. For hourly habits, pass a full ISO datetime string
// ('YYYY-MM-DDTHH:MM'). For monthly habits, pass a date string ('YYYY-MM-DD').
// Unlike markComplete(), does NOT deduplicate — multiple calls add multiple entries.
addCompletion(habitId: string, entry: string): void

// Removes the most recently added completion entry for habitId on the given date.
// Used to decrement an hourly or monthly count by one.
removeLastCompletion(habitId: string, date: string): void
```

### Unchanged functions (daily/weekly still use these)

- `isComplete(habitId, date)` — unchanged; works for daily/weekly
- `markComplete(habitId, date)` — unchanged (deduplicates by date; used for daily/weekly)
- `markIncomplete(habitId, date)` — unchanged; used for daily/weekly
- `deleteForHabit(habitId)` — unchanged; clears all entries regardless of frequency

---

## Changes to Date Utility — `src/utils/date.ts`

One new pure function:

```typescript
// Returns the number of days in the given month.
// year: full year (e.g. 2026), month: 1-based (1 = January).
// Correctly handles leap years.
daysInMonth(year: number, month: number): number
```

Implementation: `new Date(year, month, 0).getDate()` — standard JS idiom.

---

## Component Changes

### `HabitModal` — `src/components/HabitModal.tsx`

**Updated frequency selector**: Four options instead of two.

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

**New conditional field** — visible only when `frequency === 'hourly'`:

```tsx
{
  frequency === "hourly" && (
    <div>
      <label htmlFor="hourlyTarget">Target count per hour</label>
      <input
        id="hourlyTarget"
        type="number"
        min={1}
        step={1}
        value={hourlyTarget}
        onChange={(e) => setHourlyTarget(Number(e.target.value))}
      />
    </div>
  );
}
```

**Save logic addition**:

```typescript
if (
  frequency === "hourly" &&
  (!Number.isInteger(hourlyTarget) || hourlyTarget < 1)
) {
  setHourlyTargetError("Target must be a whole number of at least 1");
  return;
}
const input = {
  ...fields,
  hourlyTarget: frequency === "hourly" ? hourlyTarget : undefined,
};
```

### `HabitCard` — `src/components/HabitCard.tsx`

**Rendering branches by frequency**:

| `habit.frequency`       | Completion control rendered                                                           |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `'daily'` or `'weekly'` | Existing `<CompletionCheckbox>` (unchanged)                                           |
| `'hourly'`              | Count display: `"{countToday}/{dailyTarget} times"` + increment button                |
| `'monthly'`             | Count display: `"{countMonth}/{daysInMonth} times"` + progress bar + increment button |

```typescript
// Hourly daily target:
const dailyTarget = (habit.hourlyTarget ?? 1) * 24;

// Monthly denominator:
const now = new Date();
const monthDays = daysInMonth(now.getFullYear(), now.getMonth() + 1);
```

---

## Storage Schema

`hourlyTarget` is stored inline in each habit object in `hf_habits`. No new storage key.

**Hourly habit object**:

```json
{
  "id": "abc-123",
  "name": "Drink Water",
  "frequency": "hourly",
  "hourlyTarget": 2,
  "category": "Health",
  "colorTag": "blue",
  "createdAt": "2026-05-25"
}
```

**Monthly habit object** (no extra field):

```json
{
  "id": "def-456",
  "name": "Read Book",
  "frequency": "monthly",
  "category": "Personal",
  "colorTag": "purple",
  "createdAt": "2026-05-25"
}
```

**Hourly completions** in `hf_completions` (datetime strings to support multiple per day):

```json
{
  "abc-123": ["2026-05-25T08:00", "2026-05-25T10:30", "2026-05-25T14:00"]
}
```

**Monthly completions** in `hf_completions` (date strings, multiple per day allowed):

```json
{
  "def-456": ["2026-05-01", "2026-05-03", "2026-05-10"]
}
```

**Backward compatibility**: Existing daily/weekly habits stored with `frequency: 'daily'` or `'weekly'` continue to work unchanged. The absence of `hourlyTarget` is treated as `undefined` (no hourly target), which is only valid for non-hourly frequencies.
