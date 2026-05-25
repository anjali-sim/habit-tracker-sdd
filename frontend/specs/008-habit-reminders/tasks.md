# Tasks: Frequency Expansion · Theme Toggle · Habit Reminders

**Plan**: [plan.md](./plan.md) | **Specs**: [002](../002-habit-management/spec.md) · [007](../007-theme-toggle/spec.md) · [008](./spec.md)
**Date**: 2026-05-25 | **Tests**: None — excluded by constitution

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel with other [P] tasks at the same phase stage (different files, no unresolved deps)
- **[USn]**: User story this task delivers — see story map below
- Setup and Foundational phases carry no story label

## User Story Map

| Label | Feature | Story                                                                                        | Priority |
| ----- | ------- | -------------------------------------------------------------------------------------------- | -------- |
| [US1] | 007     | Toggle the Application Theme (US1 + US2 combined — persist is inseparable from toggle)       | P1       |
| [US2] | 002     | Configure an Hourly Habit (US4)                                                              | P2       |
| [US3] | 002     | Track a Monthly Habit (US5)                                                                  | P3       |
| [US4] | 008     | Set / Clear a Daily Reminder (US1 + US3 combined — clear is part of the same time-picker UI) | P1       |
| [US5] | 008     | Notification Permission Gate (US2)                                                           | P2       |

---

## Phase 1: Setup

**Purpose**: Confirm the existing application is running and the working branch is correct

- [x] T001 Verify `git branch --show-current` returns `009-habit-reminders` and `npm run dev` starts without errors

**Checkpoint**: Dev server running on localhost; no TypeScript or build errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: All type changes and completion-counting helpers that every user story phase depends on. No user story work may begin until this phase is complete.

- [x] T002 Update `src/types/habit.ts` — expand `Frequency` union to `'daily' | 'weekly' | 'hourly' | 'monthly'`; add `hourlyTarget?: number` (positive integer, set only when `frequency === 'hourly'`); add `reminderTime?: string` (`'HH:MM'` 24-hour string, undefined = no reminder); `CreateHabitInput` and `UpdateHabitInput` pick up both new fields automatically via existing `Omit`/`Partial` aliases — no alias changes needed
- [x] T003 [P] Add `daysInMonth(year: number, month: number): number` to `src/utils/date.ts` — implementation: `return new Date(year, month, 0).getDate()` (month is 1-based; handles leap years correctly); export alongside existing date helpers
- [x] T004 [P] Add four new exports to `src/api/completionService.ts` — `countForDay(habitId, date): number` (count entries whose first 10 chars match `date`); `countForMonth(habitId, year, month): number` (count entries whose first 7 chars match `'YYYY-MM'` prefix built from year + zero-padded month); `addCompletion(habitId, entry): void` (append entry without deduplication, throw on write failure); `removeLastCompletion(habitId, date): void` (remove last entry whose date portion matches, no-op if none, throw on write failure); all four reuse the existing private `read()` and `write()` helpers already in the file

**Checkpoint**: `npx tsc --noEmit` passes with no errors after T002; `daysInMonth(2024, 2)` returns 29 (leap year check); `countForDay`, `countForMonth`, `addCompletion`, `removeLastCompletion` are importable

---

## Phase 3: User Story 1 — Dark/Light Theme Toggle (Priority: P1) 🎯

**Goal**: A sun/moon button in the nav bar switches between dark and light mode instantly. Preference persists to `localStorage` with key `hf_theme`. Dark is the default. Theme is applied before first paint (no flash).

**Independent Test**: Open the app — confirm it loads in dark mode (default). Click the toggle — confirm the entire UI switches to light mode and the icon becomes a moon. Refresh the page — confirm it reloads in light mode. Click again — confirm dark mode returns. Open a fresh incognito profile (no saved preference) — confirm it defaults to dark.

- [x] T005 [P] [US1] Add no-flash inline script to `index.html` — insert inside `<head>` immediately before the Vite `<script type="module">` entry tag: `<script>(function(){try{var t=localStorage.getItem('hf_theme');if(t!=='light')document.documentElement.classList.add('dark');}catch(_){}})()</script>`; the `dark` class is added by default (absent or invalid preference = dark); the script is self-contained and crash-safe
- [x] T006 [P] [US1] Create `src/api/themeService.ts` — export `getTheme(): 'dark' | 'light'` (reads `localStorage.getItem('hf_theme')`, returns `'light'` only when stored value is exactly `'light'`, returns `'dark'` for all other values including errors); export `setTheme(theme: 'dark' | 'light'): void` (writes to `localStorage` key `hf_theme` inside try/catch; calls `document.documentElement.classList.toggle('dark', theme === 'dark')` inside a separate try/catch so DOM update succeeds even if localStorage write fails); file < 25 lines
- [x] T007 [P] [US1] Create `src/components/ThemeToggle.tsx` — `interface ThemeToggleProps { theme: 'dark' | 'light'; onToggle: () => void }`; when `theme === 'dark'` render sun icon (`☀️`) with `aria-label="Switch to light mode"`; when `theme === 'light'` render moon icon (`🌙`) with `aria-label="Switch to dark mode"`; button must have `min-w-[44px] min-h-[44px]` (44 × 44 px touch target); no internal state — pure presentational component; dark Tailwind theme (hover state visible in both modes)
- [x] T008 [US1] Update `src/App.tsx` — add `import { useState } from 'react'`; import `ThemeToggle` from `'./components/ThemeToggle'`; import `{ getTheme, setTheme }` from `'./api/themeService'`; add `const [theme, setReactTheme] = useState<'dark' | 'light'>(() => getTheme())`; add `handleToggle` function that computes `next = theme === 'dark' ? 'light' : 'dark'`, calls `setTheme(next)` (persists + applies DOM class), then calls `setReactTheme(next)` (triggers re-render); wrap existing `<Routes>` in a fragment with a `<nav>` element above it that contains `<ThemeToggle theme={theme} onToggle={handleToggle} />`; nav bar Tailwind classes: `flex items-center justify-end px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`

**Checkpoint**: Theme toggle visible in nav bar on both dashboard and detail pages; clicking switches the full UI; refreshing the page loads the saved theme; sun shown in dark mode; moon shown in light mode; no flash of wrong theme on load

---

## Phase 4: User Story 2 — Hourly Habits (Priority: P2)

**Goal**: The habit modal frequency selector has four options (Daily / Weekly / Hourly / Monthly). Selecting Hourly reveals a "target count per hour" field (default 1, min 1, integer). An hourly habit card shows today's completion count vs. the daily target (e.g. "3/48 times") with + and − buttons instead of a checkbox.

**Independent Test**: Create a habit with Hourly frequency and target 2. Verify the card shows "0/48 times". Click + three times — card shows "3/48 times". Refresh — count is 3/48. Click − once — shows "2/48". Edit the habit — hourlyTarget pre-fills as 2. Create a daily habit — verify no hourlyTarget field appears. Verify TypeScript compiles.

- [x] T009 [P] [US2] Update frequency `<select>` in `src/components/HabitModal.tsx` — change from two options to four: `<option value="daily">Daily</option>`, `<option value="weekly">Weekly</option>`, `<option value="hourly">Hourly</option>`, `<option value="monthly">Monthly</option>`; add local state `const [hourlyTarget, setHourlyTarget] = useState<number>(habit?.hourlyTarget ?? 1)` and `const [hourlyTargetError, setHourlyTargetError] = useState<string>('')`; add a conditional block rendered immediately below the frequency selector only when `frequency === 'hourly'`: a labelled `<input type="number" id="hourlyTarget" min={1} step={1}>` bound to `hourlyTarget` and `setHourlyTarget`, plus an error paragraph when `hourlyTargetError` is non-empty; add validation in the submit handler: if `frequency === 'hourly'` and (`!Number.isInteger(hourlyTarget) || hourlyTarget < 1`) set `hourlyTargetError` and return early; set `hourlyTarget: frequency === 'hourly' ? hourlyTarget : undefined` in the submitted input object; clear `hourlyTargetError` when frequency changes away from hourly
- [x] T010 [US2] Add hourly display branch to `src/components/HabitCard.tsx` — import `{ countForDay, addCompletion, removeLastCompletion }` from `'../api/completionService'`; import `{ todayISO }` from `'../utils/date'`; in the completion-control area of the card, add a conditional block: when `habit.frequency === 'hourly'` render a `<div>` containing: (1) a `<span>` with `"{countForDay(habit.id, todayISO())}/{(habit.hourlyTarget ?? 1) * 24} times"` (use `tabular-nums` class for stable width); (2) a `+` button with `aria-label="Log one completion"`, `min-w-[44px] min-h-[44px]`, calls `addCompletion(habit.id, new Date().toISOString().slice(0, 16))`; (3) a `−` button (visible only when count > 0), `aria-label="Remove last completion"`, calls `removeLastCompletion(habit.id, todayISO())`; both +/− buttons must trigger a re-render — wrap the count read in component state or derive from store completions if available; the existing `<CompletionCheckbox>` renders only for daily/weekly habits (add `habit.frequency === 'daily' || habit.frequency === 'weekly'` guard to its existing render)

**Checkpoint**: Hourly habit card shows live count; + increments, − decrements, refresh persists; daily/weekly habits still show their checkbox unchanged; TypeScript compiles

---

## Phase 5: User Story 3 — Monthly Habits (Priority: P3)

**Goal**: A monthly habit card shows the current-month completion count as "[count]/[days-in-month] times" with a proportional progress bar and + / − buttons. The denominator reflects the actual number of days in the current calendar month (including leap-year February). No extra modal field is needed for monthly habits.

**Independent Test**: Create a habit with Monthly frequency. Verify the card shows "0/31 times" (or correct count for current month). Click + twelve times — shows "12/31 times" and progress bar is ~39% full. Refresh — count persists. Navigate to February of a leap year (by temporarily mocking the date) — denominator shows 29.

- [x] T011 [US3] Add monthly display branch to `src/components/HabitCard.tsx` — import `{ countForMonth }` from `'../api/completionService'` and `{ daysInMonth }` from `'../utils/date'`; in the completion-control area (after the hourly branch from T010), add a conditional block: when `habit.frequency === 'monthly'` render a `<div className="space-y-1">` containing: (1) a flex row with `<span>` showing `"{countForMonth(habit.id, now.getFullYear(), now.getMonth() + 1)}/{daysInMonth(now.getFullYear(), now.getMonth() + 1)} times"` where `now = new Date()`, plus a `+` button (`aria-label="Log one completion"`, min 44×44px, calls `addCompletion(habit.id, todayISO())`) and a `−` button (visible when count > 0, calls `removeLastCompletion(habit.id, todayISO())`); (2) a minimal progress bar: `<div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">` containing an inner `<div>` with `className="h-1.5 rounded-full bg-indigo-500 transition-all"` and `style={{ width: \`${Math.min((count / days) \* 100, 100)}%\` }}`; both buttons must be 44×44px minimum; count and bar update reactively on + / −

**Checkpoint**: Monthly habit card shows correct count and denominator for current month; progress bar proportional fill is visually correct; February 2024 shows denominator 29; +/− buttons work; TypeScript compiles

---

## Phase 6: User Story 4 — Set / Clear a Daily Reminder (Priority: P1) 🎯

**Goal**: The add/edit habit modal has a Reminder time-picker field (default "No reminder"). Selecting a time saves it as `reminderTime` on the habit. On each page load the app schedules a browser notification for each habit's saved time via `setTimeout`. On the next occurrence of that time each day, a notification fires with the habit name. The "No reminder" clear button removes the saved time and stops future notifications.

**Independent Test**: Create a habit with a reminder set to 1 minute in the future. Verify the habit is saved with `reminderTime` in localStorage. Wait — notification fires with the habit name. Refresh — reminder persists, scheduler re-arms. Edit the habit and click "No reminder" — verify `reminderTime` is removed from the saved habit. No further notifications should fire.

- [x] T012 [P] [US4] Create `src/api/reminderService.ts` — export `getPermissionStatus(): NotificationPermission` (returns `'denied'` if `window.Notification` is undefined, else returns `Notification.permission`); export `canNotify(): boolean` (returns `getPermissionStatus() === 'granted'`); export `requestPermission(): Promise<NotificationPermission>` (if Notification unsupported return `'denied'`; if `Notification.permission !== 'default'` return current status; else return `Notification.requestPermission()`); export `sendNotification(habitName: string): void` (no-op if `!canNotify()`; fires `new Notification(habitName, { body: 'Time to complete your habit!', tag: habitName })`); file < 40 lines
- [x] T013 [P] [US4] Create `src/utils/reminder.ts` — import `useEffect`, `useRef` from `'react'`; import `Habit` type from `'../types'`; import `{ canNotify, sendNotification }` from `'../api/reminderService'`; export `msUntilTime(hhmm: string): number` (splits on `':'`, builds a `Date` for today at H:M:0.0, if target ≤ now adds 1 day, returns `target.getTime() - Date.now()`); export `useReminderScheduler(habits: Habit[]): void` (hook: holds `timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())`; `useEffect` with `habits` dep: clears all existing timers, returns early if `!canNotify()`, iterates habits — for each with a `reminderTime` schedules `setTimeout(() => sendNotification(habit.name), msUntilTime(habit.reminderTime))` and stores the ID; cleanup function clears all timers); file < 45 lines
- [x] T014 [US4] Add reminder time-picker to `src/components/HabitModal.tsx` — add state: `const [reminderTime, setReminderTime] = useState<string>(habit?.reminderTime ?? '')`; add below the frequency block: a `<label htmlFor="reminderTime">Reminder</label>` and a flex row containing an `<input type="time" id="reminderTime">` bound to `reminderTime` / `setReminderTime`, and (when `reminderTime` is non-empty) a clear button with `aria-label="No reminder"` and `min-w-[44px] min-h-[44px]` that calls `setReminderTime('')`; in the submit input object set `reminderTime: reminderTime || undefined` (empty string must not be persisted); input styling must match the existing form inputs in the file
- [x] T015 [US4] Update `src/pages/DashboardPage.tsx` — import `{ useReminderScheduler }` from `'../utils/reminder'`; add the call `useReminderScheduler(habits)` inside the component body (after `habits` is derived from the store); the hook handles its own effect lifecycle — no other changes to DashboardPage are required

**Checkpoint**: Time picker visible in modal (defaulting to no selection); saved `reminderTime` appears in the habit's localStorage entry; notification fires within 60 s of the scheduled time while the tab is open; refreshing re-arms the scheduler; clearing the reminder removes `reminderTime` from storage; no TypeScript errors

---

## Phase 7: User Story 5 — Notification Permission Gate (Priority: P2)

**Goal**: The first time a user saves a habit with a reminder time set (and `Notification.permission === 'default'`), the browser permission prompt is triggered from inside the save handler. If denied, the habit is still saved but an inline message in the modal explains notifications are blocked. Habits with a saved reminder but denied permission show an amber badge on their dashboard card.

**Independent Test**: In a fresh browser profile, set a reminder on a habit and click Save — the browser permission prompt must appear. Grant permission — habit is saved normally. In a separate fresh profile, deny permission — habit is saved and a blocked message is shown in the modal. Visit the dashboard — an amber badge appears on the card for that habit.

- [x] T016 [P] [US5] Add blocked-notification badge to `src/components/HabitCard.tsx` — import `{ getPermissionStatus }` from `'../api/reminderService'`; inside the card, add a conditional render: when `habit.reminderTime && getPermissionStatus() === 'denied'`, render a `<span className="text-amber-400 text-xs" title="Notifications blocked — reminder will not fire" aria-label="Notifications blocked">🔕</span>`; this is a synchronous read of `Notification.permission` — no state or effect needed; position the badge near the habit name or alongside the reminder time
- [x] T017 [US5] Add permission request flow to `src/components/HabitModal.tsx` save handler — import `{ requestPermission, getPermissionStatus }` from `'../api/reminderService'`; in the submit handler, before calling `onSubmit(input)`, check: if `reminderTime` is non-empty AND `getPermissionStatus() === 'default'`, then `await requestPermission()` (save handler must be `async`); after the `requestPermission()` call (or if already decided), check: if `reminderTime` is non-empty AND `getPermissionStatus() === 'denied'`, render an inline amber warning paragraph below the time-picker: `"Notifications are blocked. Enable them in browser settings to receive this reminder."` — store this as a boolean state `notificationsBlocked` set after the permission check; the habit is saved regardless of permission outcome (do not return early on denial); clear `notificationsBlocked` when `reminderTime` is cleared

**Checkpoint**: Permission prompt appears exactly once on first save with a reminder; second save on same profile shows no prompt; denial shows inline warning; card badge appears when `Notification.permission === 'denied'` and habit has a `reminderTime`; granting permission removes the badge on next render; TypeScript compiles

---

## Phase 8: Polish & Cross-Cutting

**Purpose**: Constitutional compliance, accessibility audit, and visual consistency across all three features

- [x] T018 [P] Verify TypeScript strict mode — run `npx tsc --noEmit`; fix any type errors introduced by the new `Frequency` values, `hourlyTarget`, or `reminderTime` fields; confirm no `console.log` statements, commented-out blocks, or unused imports remain in any modified or new file; confirm all new and modified files are under 200 lines (constitution Principle I)
- [x] T019 [P] Verify touch targets and mobile layout — confirm `ThemeToggle` button, hourly +/− buttons, monthly +/− buttons, reminder time-picker clear button, and the blocked notification badge container all meet the ≥ 44 × 44 px minimum (constitution Principle III); test at 320 px viewport width that no horizontal scroll appears on either the dashboard or the detail page; confirm Tailwind `dark:` classes are applied correctly to all new UI elements (progress bar, badge, time-picker, nav bar)

---

## Dependencies & Execution Order

```
Phase 1 (Setup)
  └─ Phase 2 (Foundational: T002, T003, T004 in parallel)
       │
       ├─ Phase 3 [US1] Theme Toggle (T005, T006 parallel → T007)
       │
       ├─ Phase 4 [US2] Hourly Habits (T009 parallel after T002/T003 → T010)
       │    └─ Phase 5 [US3] Monthly Habits (T011 depends on T010)
       │
       └─ Phase 6 [US4] Set/Clear Reminder (T012, T013 parallel → T014 → T015)
            └─ Phase 7 [US5] Permission Gate (T016, T017)
                  └─ Phase 8 Polish (T018, T019 parallel)
```

**Phase 2 internal ordering**:

```
T002 [P]  T003 [P]   ← parallel (different files)
    └─────┘
    both unblock T010, T011
T004 [P]              ← parallel to T002/T003 (different file)
    unblocks T009
```

**Within Phase 3** (all parallel then sequential):

```
T005 [P]  T006 [P]   T005 [P] can start alongside T006 [P]
    └──────────────┐
                  T007  ← needs T005 (import themeService) + T006 (import ThemeToggle)
```

**Within Phase 6**:

```
T012 [P]  T013 [P]   ← parallel (different files, T002 complete)
    └────┘
    T012 unblocks T013 (reminder.ts imports reminderService)
    T014 depends on T012+T013
    T015 depends on T014
```

---

## Parallel Execution Examples

**Phase 2 + Phase 3 kickoff** (can run simultaneously after Phase 1):

- Session A: T002, T003 → unblocks Phase 4 and 5
- Session B: T004 → T005 [P], T006 [P] → T007 (theme, no deps on T002/T003)

**Phase 4 + Phase 6 kickoff** (after Phase 2):

- Session A: T009 → T010 → T011 (002 frequency work)
- Session B: T012 [P], T013 [P] → T014 → T015 (008 reminder work)

**Phase 8** (after all stories):

- T018 [P] and T019 [P] fully parallel

---

## Implementation Strategy

**MVP scope** (delivers maximum user value first):

- Phase 1 → Phase 2 → Phase 3 (theme toggle) — fully usable with just 4 tasks after foundational

**Full delivery order**:

1. Phase 1–2: Setup + Foundational types (unblocks everything)
2. Phase 3: Theme toggle (independent, high-visibility change)
3. Phase 4–5: Frequency expansion (hourly then monthly)
4. Phase 6–7: Reminders (set/clear then permission gate)
5. Phase 8: Polish
