# Data Model: Habit Reminders

**Phase**: 1 — Design
**Date**: 2026-05-25
**Feature**: [spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md)

---

## Changes to Existing Types

### `Habit` — `src/types/habit.ts`

One optional field is added to the existing `Habit` interface. All other fields are unchanged.

```typescript
export interface Habit {
  id: string;
  name: string;
  category: Category;
  colorTag: ColorTag;
  frequency: Frequency;
  createdAt: string;
  reminderTime?: string; // ADD: "HH:MM" (24-hour) | undefined = no reminder
}
```

**Validation rules**:

- When present, `reminderTime` MUST match the pattern `^([01]\d|2[0-3]):[0-5]\d$` (valid 24-hour HH:MM).
- When absent (`undefined`), no reminder is scheduled and no notification badge is shown.
- An empty string MUST NOT be persisted — callers must set to `undefined` when clearing.

**Downstream type aliases** — no changes required:

- `CreateHabitInput = Omit<Habit, 'id' | 'createdAt'>` — automatically includes `reminderTime?`.
- `UpdateHabitInput = Partial<CreateHabitInput>` — automatically includes `reminderTime?`.

---

## New Module: `reminderService` — `src/api/reminderService.ts`

Owns all direct interaction with the browser Notifications API. No state; pure functions.

```typescript
// Returns the current browser notification permission status.
getPermissionStatus(): NotificationPermission
// → 'default' | 'granted' | 'denied'

// Requests notification permission from the browser.
// Must be called from a user-gesture handler.
// Returns the resulting permission status.
requestPermission(): Promise<NotificationPermission>

// Fires a single browser notification for the given habit name.
// No-op if permission is not 'granted'.
sendNotification(habitName: string): void

// Returns true only when notifications are both supported and permitted.
canNotify(): boolean
```

**Constraints**:

- No internal state — permission status is always read from `Notification.permission`.
- `sendNotification` uses `tag: habitName` to prevent duplicate stacking.
- File stays under ~40 lines.

---

## New Utility: `reminder` — `src/utils/reminder.ts`

Owns scheduling math and the `useReminderScheduler` React hook. No direct Notification calls — delegates to `reminderService`.

```typescript
// Returns milliseconds from now until the next occurrence of the given "HH:MM" time.
// If the time has already passed today, returns ms until tomorrow at that time.
msUntilTime(hhmm: string): number

// React hook. On mount, schedules a setTimeout for each habit that has a reminderTime
// and permission is 'granted'. Cancels all timeouts on unmount or when habits change.
// deps: habits array + permission status.
useReminderScheduler(habits: Habit[]): void
```

**State transitions**:

```
App mounts / habits change
        │
        ▼
useReminderScheduler runs
        │
        ├─ for each habit with reminderTime AND canNotify() ──► setTimeout(msUntilTime)
        │                                                            │
        │                                                     time elapses
        │                                                            │
        │                                                     sendNotification(habit.name)
        │
        └─ cleanup: clearTimeout for all scheduled IDs
```

---

## Storage Schema

`reminderTime` is stored inline in the existing `hf_habits` localStorage key as part of each habit object. No new key is introduced.

**Before** (existing habit object shape):

```json
{
  "id": "abc-123",
  "name": "Morning Run",
  "category": "Fitness",
  "colorTag": "green",
  "frequency": "daily",
  "createdAt": "2026-05-01"
}
```

**After** (habit with reminder):

```json
{
  "id": "abc-123",
  "name": "Morning Run",
  "category": "Fitness",
  "colorTag": "green",
  "frequency": "daily",
  "createdAt": "2026-05-01",
  "reminderTime": "07:30"
}
```

**After** (habit with reminder cleared — field omitted, not null):

```json
{
  "id": "abc-123",
  "name": "Morning Run",
  "category": "Fitness",
  "colorTag": "green",
  "frequency": "daily",
  "createdAt": "2026-05-01"
}
```

**Backward compatibility**: Habits saved before this feature (no `reminderTime` key) are treated as having no reminder. No migration is required — optional field defaults to `undefined` in TypeScript.

---

## Component Changes

### `HabitModal` — `src/components/HabitModal.tsx`

**New local state**:

```typescript
const [reminderTime, setReminderTime] = useState<string>("");
// '' maps to undefined (no reminder) on save
```

**New UI elements**:

- `<input type="time">` bound to `reminderTime` — labelled "Reminder".
- A clear ("No reminder") button that sets `reminderTime` to `''`.
- Inline blocked-notification message shown when `getPermissionStatus() === 'denied'` and the current `reminderTime` is non-empty.

**Save handler addition** (before persisting):

```
if reminderTime is non-empty AND Notification.permission === 'default':
  await requestPermission()
persist habit with reminderTime: reminderTime || undefined
```

### `HabitCard` — `src/components/HabitCard.tsx`

**New conditional render**:

- When `habit.reminderTime` is set AND `getPermissionStatus() === 'denied'`:
  render a small amber bell-slash badge.
- No other layout changes.
