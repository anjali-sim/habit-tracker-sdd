# API Service Contract: Reminder Service

**Module**: `src/api/reminderService.ts`
**Phase**: 1 — Design
**Date**: 2026-05-25
**Feature**: [spec.md](../spec.md) | [data-model.md](../data-model.md)

---

## Purpose

`reminderService` is the single point of contact between the application and the browser Notifications API. It owns permission queries, permission requests, and notification dispatch. No component or hook calls `window.Notification` directly.

---

## Exports

### `getPermissionStatus(): NotificationPermission`

Returns the current browser notification permission status without triggering any prompt.

**Returns**: `'default' | 'granted' | 'denied'`

**Behaviour**:

- If the browser does not support the Notifications API, returns `'denied'` (treat as unsupported = cannot notify).
- Pure read — no side effects.

**Usage**:

```typescript
import { getPermissionStatus } from "../api/reminderService";

const status = getPermissionStatus();
if (status === "denied") {
  /* show blocked indicator */
}
```

---

### `canNotify(): boolean`

Convenience predicate. Returns `true` only when `getPermissionStatus() === 'granted'`.

**Returns**: `boolean`

**Usage**:

```typescript
if (canNotify()) sendNotification(habit.name);
```

---

### `requestPermission(): Promise<NotificationPermission>`

Asks the browser to show the native permission prompt.

**Returns**: `Promise<NotificationPermission>` — resolves to the user's decision (`'granted'` or `'denied'`).

**Preconditions**:

- MUST be called from a user-gesture handler (e.g., a button `onClick` callback). Calling from `useEffect` or on page load will be silently blocked by Chrome and Firefox.
- If `Notification.permission` is already `'granted'` or `'denied'`, the browser will not re-prompt; the existing status is returned immediately.

**Error handling**: If the browser does not support `Notification.requestPermission`, resolves to `'denied'`.

**Usage**:

```typescript
// Inside a save button handler:
const permission = await requestPermission();
if (permission === "denied") {
  /* inform user */
}
```

---

### `sendNotification(habitName: string): void`

Fires a single browser notification for the given habit.

**Parameters**:

- `habitName` — The display name of the habit to remind. Used as the notification title and as the deduplication `tag`.

**Behaviour**:

- No-op if `canNotify()` is `false`.
- Constructs a `Notification` with:
  - `title`: `habitName`
  - `body`: `"Time to complete your habit!"`
  - `tag`: `habitName` — prevents duplicate stacking if called more than once for the same habit before the previous notification is dismissed.
- Fire-and-forget; no return value.

**Usage**:

```typescript
// Called by the reminder scheduler at the scheduled time:
sendNotification("Morning Run");
```

---

## Error Handling Policy

| Condition                                                    | Behaviour                                                                                                                                             |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `window.Notification` not defined (unsupported browser)      | All functions degrade gracefully: `getPermissionStatus` returns `'denied'`; `requestPermission` resolves to `'denied'`; `sendNotification` is a no-op |
| `requestPermission()` called outside user gesture            | Browser silently ignores the prompt; the Promise resolves with the existing permission status                                                         |
| `sendNotification` called when permission is not `'granted'` | No-op — no error thrown, no notification fired                                                                                                        |

---

## What This Module Does NOT Own

- Scheduling (when to call `sendNotification`) — owned by `src/utils/reminder.ts`.
- Permission state in React component state — components read `getPermissionStatus()` directly on render; no subscription needed.
- Persisting the `reminderTime` field — owned by `src/api/habitService.ts` via the standard `create`/`update` path.
