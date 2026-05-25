# Data Model: HabitFlow Frontend

**Date**: 2026-05-22 | **Phase**: 1 — Design

---

## Core Entities

### 1. Habit

The primary domain object. Represents a single tracked behaviour.

| Field       | Type        | Constraints                                          |
| ----------- | ----------- | ---------------------------------------------------- |
| `id`        | `string`    | UUID v4; immutable after creation                    |
| `name`      | `string`    | Non-empty; case-insensitive unique across all habits |
| `category`  | `Category`  | Required; default `'Health'`                         |
| `colorTag`  | `ColorTag`  | Required; default `'blue'` (first in list)           |
| `frequency` | `Frequency` | Required; default `'daily'`                          |
| `createdAt` | `string`    | ISO date `YYYY-MM-DD`; set at creation; immutable    |

**State transitions**:

- _Created_ → stored in `hf_habits`; appended to `hf_order`
- _Updated_ → name/category/colorTag/frequency may change; `id` and `createdAt` are immutable
- _Deleted_ → removed from `hf_habits`, from `hf_order`, and all entries removed from `hf_completions`

---

### 2. Completion

A record that a specific habit was completed on a specific calendar date.

Completions are not stored as individual objects. They are stored as a map of `habitId → YYYY-MM-DD[]` in `hf_completions`. This avoids an O(n) scan to look up all completions for a habit.

| Concept            | Type                       | Notes                                                            |
| ------------------ | -------------------------- | ---------------------------------------------------------------- |
| `CompletionRecord` | `Record<string, string[]>` | Key: `habitId`; Value: sorted array of `YYYY-MM-DD` date strings |
| Date format        | `string` — `YYYY-MM-DD`    | Local calendar date on the user's device                         |

**State transitions**:

- _Marked complete_: date string appended to the habit's array (no duplicates)
- _Marked incomplete_: date string removed from the array
- _Habit deleted_: entire key removed from the record

---

### 3. Habit Order

The persisted display sequence of habits on the dashboard.

| Concept      | Type       | Notes                                                    |
| ------------ | ---------- | -------------------------------------------------------- |
| `HabitOrder` | `string[]` | Array of `habitId` strings; defines card rendering order |

**Rules**:

- New habits are appended to the end
- Deleted habits are removed; remaining relative order preserved
- If a stored order references a non-existent habit ID, that ID is silently skipped
- If no order is persisted, habits display in creation order (ascending `createdAt`)

---

### 4. Streak Data (derived — not persisted)

Computed on-demand from `CompletionRecord`. Never written to storage.

| Field     | Type     | Description                                                                  |
| --------- | -------- | ---------------------------------------------------------------------------- |
| `current` | `number` | Consecutive completed days ending today (or yesterday if today not yet done) |
| `longest` | `number` | All-time personal best streak length                                         |

---

### 5. Heatmap Cell (derived — not persisted)

One element in the 365-cell heatmap grid for the habit detail page.

| Field   | Type                                 | Description                                          |
| ------- | ------------------------------------ | ---------------------------------------------------- |
| `date`  | `string`                             | `YYYY-MM-DD`                                         |
| `state` | `'completed' \| 'missed' \| 'empty'` | Derived from completion record, createdAt, and today |

**Derivation rules**:

- `date < habit.createdAt` → `'empty'`
- `date > today` → `'empty'`
- `date === today` AND not in completions → `'empty'`
- `date` in completions → `'completed'`
- otherwise (past date, post-creation, not completed) → `'missed'`

---

## Enumeration Types

```typescript
type Category =
  | "Health"
  | "Fitness"
  | "Learning"
  | "Mindfulness"
  | "Work"
  | "Personal";

// Displayed in this order in the category selector; 'Health' is default

type ColorTag = "red" | "orange" | "yellow" | "green" | "blue" | "purple";

// 'blue' is the default (first pre-selected per spec 002 clarifications)
// Each value maps to a Tailwind CSS colour class in the component layer

type Frequency = "daily" | "weekly";
// 'daily' is the default
```

---

## TypeScript Type Definitions

### `/src/types/habit.ts`

```typescript
export type Category =
  | "Health"
  | "Fitness"
  | "Learning"
  | "Mindfulness"
  | "Work"
  | "Personal";
export type ColorTag =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple";
export type Frequency = "daily" | "weekly";

export interface Habit {
  id: string;
  name: string;
  category: Category;
  colorTag: ColorTag;
  frequency: Frequency;
  createdAt: string; // YYYY-MM-DD
}

export type CreateHabitInput = Omit<Habit, "id" | "createdAt">;
export type UpdateHabitInput = Partial<CreateHabitInput>;
```

### `/src/types/completion.ts`

```typescript
// Key: habitId  Value: sorted YYYY-MM-DD date strings
export type CompletionRecord = Record<string, string[]>;
```

### `/src/types/index.ts`

```typescript
export type {
  Habit,
  CreateHabitInput,
  UpdateHabitInput,
  Category,
  ColorTag,
  Frequency,
} from "./habit";
export type { CompletionRecord } from "./completion";
export type HabitOrder = string[];

export interface StreakData {
  current: number;
  longest: number;
}

export type HeatmapCellState = "completed" | "missed" | "empty";

export interface HeatmapCell {
  date: string; // YYYY-MM-DD
  state: HeatmapCellState;
}

export interface Toast {
  id: string;
  message: string;
  type: "error" | "success" | "info";
}

export type ModalState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; habitId: string }
  | { type: "confirm-delete"; habitId: string };
```

---

## Store State Shapes

### `habitStore.ts` state

```typescript
interface HabitState {
  habits: Habit[];
  order: HabitOrder;
  isLoading: boolean;
  error: string | null;
}
```

**Actions**: `loadHabits()`, `addHabit(input)`, `updateHabit(id, input)`, `deleteHabit(id)`, `reorderHabits(newOrder)`

### `completionStore.ts` state

```typescript
interface CompletionState {
  completions: CompletionRecord;
  isLoading: boolean;
  error: string | null;
}
```

**Actions**: `loadCompletions()`, `markComplete(habitId, date)`, `markIncomplete(habitId, date)`

---

## localStorage Persistence Schema

```
Key               Value type                    Notes
─────────────────────────────────────────────────────────
hf_habits         JSON: Habit[]                 All habits; order NOT stored here
hf_completions    JSON: CompletionRecord        Full completion history
hf_order          JSON: string[]                Habit IDs in display order
```

All keys are namespaced with `hf_` to avoid collisions on the same origin.

---

## Entity Relationship Summary

```
Habit ──[1:many]──> HeatmapCell        (derived from CompletionRecord + Habit.createdAt)
Habit ──[1:many]──> Completion entries (stored in CompletionRecord[habit.id])
Habit ──[1:1]────> position in HabitOrder
Habit ──[1:1]────> StreakData          (derived, not persisted)
```
