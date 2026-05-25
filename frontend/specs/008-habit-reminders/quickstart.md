# Quickstart: Habit Reminders

**Phase**: 1 — Design
**Date**: 2026-05-25
**Feature**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md)

---

## What Is Being Built

A per-habit optional daily reminder system. Users set a reminder time (HH:MM) on any habit via the add/edit modal. The app schedules a browser notification for that time each day. Permission is requested once on the first save with a reminder. Habits with a saved reminder time but denied permission show an amber indicator on their dashboard card.

No new npm packages. No service worker. No backend changes.

---

## Files to Create

### 1. `src/api/reminderService.ts` — NEW

```typescript
const UNSUPPORTED: NotificationPermission = "denied";

export function getPermissionStatus(): NotificationPermission {
  if (!("Notification" in window)) return UNSUPPORTED;
  return Notification.permission;
}

export function canNotify(): boolean {
  return getPermissionStatus() === "granted";
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return UNSUPPORTED;
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export function sendNotification(habitName: string): void {
  if (!canNotify()) return;
  new Notification(habitName, {
    body: "Time to complete your habit!",
    tag: habitName,
  });
}
```

### 2. `src/utils/reminder.ts` — NEW

```typescript
import { useEffect, useRef } from "react";
import type { Habit } from "../types";
import { canNotify, sendNotification } from "../api/reminderService";

export function msUntilTime(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

export function useReminderScheduler(habits: Habit[]): void {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    // Cancel any previously scheduled timers
    timers.current.forEach(clearTimeout);
    timers.current.clear();

    if (!canNotify()) return;

    habits.forEach((habit) => {
      if (!habit.reminderTime) return;
      const delay = msUntilTime(habit.reminderTime);
      const id = setTimeout(() => sendNotification(habit.name), delay);
      timers.current.set(habit.id, id);
    });

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    };
  }, [habits]);
}
```

---

## Files to Modify

### 3. `src/types/habit.ts` — ADD one field

```typescript
export interface Habit {
  id: string;
  name: string;
  category: Category;
  colorTag: ColorTag;
  frequency: Frequency;
  createdAt: string;
  reminderTime?: string; // ← ADD: "HH:MM" 24-hour | undefined = no reminder
}
```

`CreateHabitInput` and `UpdateHabitInput` pick up the field automatically — no other type changes.

### 4. `src/components/HabitModal.tsx` — ADD reminder time picker

**Add to local state**:

```typescript
const [reminderTime, setReminderTime] = useState<string>(
  habit?.reminderTime ?? "",
);
```

**Add to JSX form** (below the frequency selector):

```tsx
<label htmlFor="reminderTime" className="block text-sm font-medium">
  Reminder
</label>
<div className="flex items-center gap-2">
  <input
    id="reminderTime"
    type="time"
    value={reminderTime}
    onChange={(e) => setReminderTime(e.target.value)}
    className="..."   // match existing input styling
  />
  {reminderTime && (
    <button
      type="button"
      onClick={() => setReminderTime('')}
      className="min-w-[44px] min-h-[44px] ..."
      aria-label="No reminder"
    >
      ✕
    </button>
  )}
</div>
{reminderTime && getPermissionStatus() === 'denied' && (
  <p className="text-amber-500 text-sm mt-1">
    Notifications are blocked. Enable them in browser settings to receive this reminder.
  </p>
)}
```

**Modify save handler** (before calling `habitService.create` / `update`):

```typescript
if (reminderTime && Notification.permission === "default") {
  await requestPermission();
}
const input = {
  ...otherFields,
  reminderTime: reminderTime || undefined,
};
```

### 5. `src/components/HabitCard.tsx` — ADD blocked-notification badge

```tsx
{
  habit.reminderTime && getPermissionStatus() === "denied" && (
    <span
      className="text-amber-400 text-xs"
      title="Notifications blocked — reminder will not fire"
      aria-label="Notifications blocked"
    >
      🔕
    </span>
  );
}
```

### 6. `src/pages/DashboardPage.tsx` — MOUNT scheduler

```typescript
import { useReminderScheduler } from "../utils/reminder";

// Inside the component, after loading habits:
useReminderScheduler(habits);
```

---

## Integration Sequence

```
User saves habit with reminderTime set
        │
        ▼
HabitModal save handler
  1. Notification.permission === 'default'?
     └─ yes → await requestPermission()
  2. Persist habit via habitService.create / update
        │
        ▼
DashboardPage re-renders with updated habits list
        │
        ▼
useReminderScheduler fires
  - Clears old timeouts
  - For each habit with reminderTime + canNotify():
      schedules setTimeout(sendNotification, msUntilTime)
        │
                ┌────── time elapses ──────┐
                │                          ▼
                │              sendNotification(habitName)
                │              → new Notification(...)
                └──────────────────────────┘
```

---

## Key Constraints Reminder

- `requestPermission()` MUST be called inside a user-gesture handler — never from `useEffect`.
- `reminderTime` stored as `undefined` (omit field) when cleared — never `null` or `""`.
- `useReminderScheduler` re-runs whenever `habits` reference changes — ensure the habits array from the store is stable (not recreated on every render).
- `HabitCard` reads `getPermissionStatus()` synchronously on render — no extra state needed.
- All new files < 200 lines (constitution Gate I).
