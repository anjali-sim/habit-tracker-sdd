# API Service Contracts: HabitFlow Frontend

**Date**: 2026-05-22 | **Phase**: 1 — Design

These contracts define the public interface of every module in `/src/api`. Components and stores MUST interact with persistence exclusively through these functions — no direct `localStorage` calls elsewhere.

---

## `habitService` — `/src/api/habitService.ts`

Manages the `hf_habits` key in localStorage.

```typescript
import type { Habit, CreateHabitInput, UpdateHabitInput } from "../types";

/** Return all persisted habits. Returns [] if none exist. */
function getAll(): Habit[];

/** Return a single habit by ID, or undefined if not found. */
function getById(id: string): Habit | undefined;

/**
 * Create a new habit.
 * Assigns a new UUID and today's date as createdAt.
 * Throws if a habit with the same name already exists (case-insensitive).
 */
function create(input: CreateHabitInput): Habit;

/**
 * Update an existing habit's mutable fields.
 * Throws if the new name conflicts with another habit (case-insensitive, excluding self).
 * Throws if the habit ID is not found.
 */
function update(id: string, input: UpdateHabitInput): Habit;

/**
 * Delete a habit by ID.
 * Does NOT remove completions or order — callers must call completionService.deleteForHabit()
 * and orderService.remove() separately.
 * No-op if the ID is not found.
 */
function remove(id: string): void;
```

---

## `completionService` — `/src/api/completionService.ts`

Manages the `hf_completions` key in localStorage.

```typescript
import type { CompletionRecord } from "../types";

/** Return the full completion record for all habits. */
function getAll(): CompletionRecord;

/**
 * Return the sorted array of YYYY-MM-DD date strings for one habit.
 * Returns [] if no completions exist for that habit.
 */
function getForHabit(habitId: string): string[];

/** Return true if the habit was completed on the given date. */
function isComplete(habitId: string, date: string): boolean;

/**
 * Mark a habit as complete on a given date.
 * No-op if already marked.
 * Throws on write failure.
 */
function markComplete(habitId: string, date: string): void;

/**
 * Mark a habit as incomplete on a given date.
 * No-op if not currently marked.
 * Throws on write failure.
 */
function markIncomplete(habitId: string, date: string): void;

/**
 * Remove all completion records for a habit (called on habit deletion).
 * No-op if no records exist.
 */
function deleteForHabit(habitId: string): void;
```

---

## `orderService` — `/src/api/orderService.ts`

Manages the `hf_order` key in localStorage.

```typescript
/**
 * Return the persisted display order as an array of habit IDs.
 * Returns [] if no order has been saved.
 */
function getOrder(): string[];

/**
 * Persist a new order.
 * Throws on write failure.
 */
function setOrder(habitIds: string[]): void;

/**
 * Append a habit ID to the end of the persisted order.
 * Called when a new habit is created.
 */
function append(habitId: string): void;

/**
 * Remove a habit ID from the persisted order.
 * Called when a habit is deleted.
 * No-op if the ID is not in the order.
 */
function remove(habitId: string): void;
```

---

## Route Contracts

```
GET /               → DashboardPage — lists all habits in persisted order
GET /habit/:id      → HabitDetailPage — shows detail + heatmap for habit with id
*                   → Redirect to /
```

URL parameter: `:id` is the `Habit.id` (UUID string)

---

## Key Component Prop Interfaces

These define the boundary contracts between parent pages and shared components.

### `HabitCard`

```typescript
interface HabitCardProps {
  habit: Habit;
  completedToday: boolean;
  streakData: StreakData;
  isDragging: boolean; // true when this card is being dragged
  onToggleComplete: () => void; // called when checkbox is toggled
  onEdit: () => void; // called to open edit modal
  onDelete: () => void; // called to open confirm-delete modal
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}
```

### `HabitModal`

```typescript
interface HabitModalProps {
  mode: "add" | "edit";
  initialValues?: Partial<CreateHabitInput>; // populated in edit mode
  onSubmit: (input: CreateHabitInput) => void;
  onClose: () => void;
}
```

### `Heatmap`

```typescript
interface HeatmapProps {
  cells: HeatmapCell[]; // exactly 365 cells, oldest first
  colorTag: ColorTag; // habit's colour — used for 'completed' cell fill
  completedCount: number; // used in the aria-label summary
}
```

### `Toast`

```typescript
interface ToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}
```

---

## Error Contract

All service functions that write to localStorage throw a plain `Error` on failure. Callers (stores) MUST catch, trigger the optimistic revert, and dispatch a toast notification. No service function swallows errors silently.
