# API Service Contract: Habit Service — Frequency Expansion

**Module**: `src/api/completionService.ts` (additions)
**Phase**: 1 — Design
**Date**: 2026-05-25
**Feature**: [spec.md](./spec.md) | [data-model.md](./data-model.md)

---

## Purpose

Documents the four new functions added to `completionService.ts` to support hourly and monthly completion counting. All existing exports are unchanged; these are purely additive.

---

## New Exports

### `countForDay(habitId: string, date: string): number`

Returns how many completions are stored for `habitId` on the given date.

**Parameters**:

- `habitId` — The habit's unique identifier.
- `date` — ISO date string `'YYYY-MM-DD'` representing the day to count.

**Returns**: `number` — count of matching entries (0 if none).

**Behaviour**:

- Counts all entries in the habit's completion array whose first 10 characters match `date` — handles both `'YYYY-MM-DD'` (monthly) and `'YYYY-MM-DDTHH:MM'` (hourly) strings transparently.
- Pure read; no side effects.

**Usage**:

```typescript
// On HabitCard for an hourly habit:
const todayCount = countForDay(habit.id, todayISO());
// Display: `${todayCount}/${dailyTarget} times`
```

---

### `countForMonth(habitId: string, year: number, month: number): number`

Returns how many completions are stored for `habitId` in the given calendar month.

**Parameters**:

- `habitId` — The habit's unique identifier.
- `year` — Full year (e.g., `2026`).
- `month` — 1-based month number (1 = January, 12 = December).

**Returns**: `number` — count of matching entries (0 if none).

**Behaviour**:

- Constructs the prefix `'YYYY-MM'` from `year` and `month` and counts all entries whose first 7 characters match that prefix.
- Pure read; no side effects.

**Usage**:

```typescript
// On HabitCard for a monthly habit:
const now = new Date();
const monthCount = countForMonth(
  habit.id,
  now.getFullYear(),
  now.getMonth() + 1,
);
// Display: `${monthCount}/${daysInMonth(...)} times`
```

---

### `addCompletion(habitId: string, entry: string): void`

Appends one completion entry for `habitId` without deduplication.

**Parameters**:

- `habitId` — The habit's unique identifier.
- `entry` — The entry string to append. Use `'YYYY-MM-DDTHH:MM'` for hourly habits (provides per-occurrence granularity); use `'YYYY-MM-DD'` for monthly habits.

**Behaviour**:

- Does NOT deduplicate — multiple calls with the same `entry` value are all stored. This is intentional to support counting more than one completion per day.
- Appends to the end of the existing array (or creates a new array if none exists).
- Writes the updated record to `localStorage`.
- Throws an `Error` if the write fails (consistent with existing `write()` error handling).

**Usage**:

```typescript
// Increment hourly count for current moment:
addCompletion(habit.id, new Date().toISOString().slice(0, 16)); // 'YYYY-MM-DDTHH:MM'

// Increment monthly count for today:
addCompletion(habit.id, todayISO()); // 'YYYY-MM-DD'
```

---

### `removeLastCompletion(habitId: string, date: string): void`

Removes the last completion entry for `habitId` whose date portion matches `date`.

**Parameters**:

- `habitId` — The habit's unique identifier.
- `date` — ISO date string `'YYYY-MM-DD'`. Matches entries whose first 10 characters equal `date`.

**Behaviour**:

- Removes exactly one entry — the last (most recently appended) entry whose date portion matches.
- No-op if no matching entry exists.
- Writes the updated record to `localStorage`.
- Throws an `Error` if the write fails.

**Usage**:

```typescript
// Decrement hourly or monthly count for today:
removeLastCompletion(habit.id, todayISO());
```

---

## Unchanged Exports (summary)

| Export                     | Used by                  | Notes                          |
| -------------------------- | ------------------------ | ------------------------------ |
| `getAll()`                 | stores                   | unchanged                      |
| `getForHabit(id)`          | streak utils             | unchanged                      |
| `isComplete(id, date)`     | HabitCard (daily/weekly) | unchanged                      |
| `markComplete(id, date)`   | HabitCard (daily/weekly) | unchanged; deduplicates        |
| `markIncomplete(id, date)` | HabitCard (daily/weekly) | unchanged                      |
| `deleteForHabit(id)`       | habitService.remove      | unchanged; deletes all entries |

---

## What This Contract Does NOT Cover

- `hourlyTarget` storage — owned by `habitService.ts` (passes through generically on create/update).
- `daysInMonth()` utility — owned by `src/utils/date.ts`.
- Rendering the count display or progress bar — owned by `HabitCard.tsx`.
