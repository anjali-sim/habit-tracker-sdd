# Research: Habit Reminders

**Phase**: 0 — Unknowns resolved before design
**Date**: 2026-05-25
**Feature**: [spec.md](./spec.md) | [plan.md](./plan.md)

---

## 1. Web Notifications API — Browser Built-in

**Decision**: Use `window.Notification` directly — no library wrapper required.

**Key API surface**:

```
Notification.permission            // 'default' | 'granted' | 'denied' (read-only)
Notification.requestPermission()   // Promise<NotificationPermission>
new Notification(title, options)   // fires immediately; options: { body, icon, tag }
```

- `requestPermission()` must be called from a user-gesture handler (e.g., the save button callback) to avoid being silently blocked by browsers.
- The `tag` option deduplicates notifications with the same key — useful to prevent a habit from stacking multiple notifications if the scheduler fires more than once.
- Notification objects are fire-and-forget; no cleanup is needed.

**Browser support**: Chrome 20+, Firefox 22+, Safari 16.4+ (desktop + PWA), Edge 14+ — all targets covered.

**Rationale**: The built-in API covers all requirements (title, body, tag, permission flow). No library adds value over the ~8-line wrapper we need.

**Alternatives considered**:

- `push-js` / `web-push`: Requires a server-side key and a service worker for push; over-engineered for client-only scheduling. Rejected.
- `react-notifications` component library: UI notifications (toasts), not OS-level notifications. Wrong layer. Rejected.

---

## 2. Client-Side Daily Scheduling — setTimeout Approach

**Decision**: Schedule each reminder with a single `setTimeout` per habit, recalculated on every page load and after every habit save.

**Algorithm** (fits in ~25 lines):

```
function msUntilTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  const now = new Date()
  const target = new Date(now)
  target.setHours(h, m, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)  // already passed → next day
  return target.getTime() - now.getTime()
}
```

- If the target time has already passed today, the timeout fires tomorrow (next occurrence).
- `setTimeout` IDs are stored in a `Map<habitId, timeoutId>` ref so they can be cancelled individually when a habit is updated or removed.
- A `useEffect` in `DashboardPage` (or a `useReminderScheduler` hook) sets up all timeouts on mount and tears them down on unmount via the cleanup return.

**Rationale**: Simple, zero-dependency, handles the ≤50-habit scale trivially. Fits the "`< 30 lines`" threshold in Gate IV.

**Alternatives considered**:

- `setInterval` polling every minute: Wastes cycles; imprecise by up to 59 seconds. Rejected — SC-002 requires ≤60 s precision which `setTimeout` meets exactly.
- Service Worker `sync` or `push`: Requires HTTPS, a SW file, and a backend key. Constitution explicitly rules out new infrastructure. Rejected.
- `cron-parser` npm library: Adds a dependency for functionality achievable in 5 lines. Rejected.

---

## 3. Permission Request Timing — User Gesture Requirement

**Decision**: Call `Notification.requestPermission()` inside the modal's save handler (the `onClick` of the Save button), which is a user gesture, before persisting the habit.

**Flow**:

1. User clicks **Save** in the habit modal with a reminder time set.
2. Save handler checks `Notification.permission`.
   - `'granted'`: proceed to persist immediately.
   - `'denied'`: persist the habit (reminder time saved), show inline blocked message, skip scheduling.
   - `'default'`: await `Notification.requestPermission()`, then branch as granted/denied above.
3. Habit is written to localStorage regardless of permission outcome (FR-009).

**Rationale**: Attaching the prompt to an explicit save click satisfies the browser's user-gesture requirement across all major browsers. Prompting on page load would be silently ignored by Chrome and Firefox.

**Alternatives considered**:

- Prompt on page load: Browsers block `requestPermission()` calls outside user gestures. Rejected.
- Prompt in a `useEffect`: Not a user gesture — blocked in Chrome/Firefox. Rejected.

---

## 4. "No Reminder" Representation in the Data Model

**Decision**: `reminderTime` is an optional field on `Habit` — `undefined` when no reminder is set, a `"HH:MM"` string when set. The `<input type="time">` empty-value state maps to `undefined` on save.

**Rationale**:

- Keeping `undefined` (omit the field) rather than `null` or `""` keeps the stored JSON clean and avoids type-narrowing noise.
- The existing `CreateHabitInput = Omit<Habit, 'id' | 'createdAt'>` and `UpdateHabitInput = Partial<CreateHabitInput>` typings automatically include the optional field — no changes to those type aliases required.
- `habitService.ts` `create()` and `update()` pass through all fields generically — no logic change needed there.

**Alternatives considered**:

- `null`: Requires `string | null` typing; extra null checks everywhere. Rejected.
- Empty string `""`: Ambiguous — can't distinguish "not set" from "set to midnight". Rejected.

---

## 5. Blocked-Notification Indicator Placement

**Decision**: Show a small amber warning badge/icon on the `HabitCard` when `Notification.permission === 'denied'` AND the habit has a `reminderTime` set. Also surface the same state inline inside `HabitModal` when editing such a habit.

**Rationale**:

- The card is the primary surface users scan; an indicator there ensures visibility.
- The modal indicator provides context at the point of editing (FR-014).
- Reading `Notification.permission` is synchronous and free — no state management needed; it can be read directly on render.
- No need to persist the denied state to localStorage — the browser property is always current.

**Alternatives considered**:

- Toast on page load: Intrusive for users who deliberately denied permission. Rejected.
- Settings page / dedicated notifications section: Over-engineered for one feature. Rejected.

---

## Summary Table

| Question                | Decision                                             | Rationale                                                    |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| Notifications mechanism | `window.Notification` built-in                       | No library needed; full browser support                      |
| Scheduling              | `setTimeout` per habit, recalculated on load         | ~25 lines; zero dependencies; ≤60 s precision                |
| Permission timing       | Inside save button handler (user gesture)            | Browser requirement; only path that works cross-browser      |
| "No reminder" storage   | `reminderTime?: string` (undefined = no reminder)    | Clean JSON; no extra null handling; existing types unchanged |
| Blocked indicator       | Amber badge on HabitCard + inline note in HabitModal | Visible at scan; actionable at edit                          |
