# Implementation Plan: Habit Frequency Expansion · Theme Toggle · Reminders

**Branch**: `009-habit-reminders` | **Date**: 2026-05-25

**Feature Specs**:

- [002 Habit Management (frequency update)](../002-habit-management/spec.md)
- [007 Dark/Light Theme Toggle](../007-theme-toggle/spec.md)
- [008 Habit Reminders](./spec.md)

## Summary

Three incremental feature additions to the existing HabitFlow SPA:

1. **002 Frequency expansion** — extend `Frequency` from 2 to 4 values (`daily | weekly | hourly | monthly`). Hourly habits store a `hourlyTarget` per-hour count and display a tally card; monthly habits display a count + progress bar. Changes: `Habit` type, `HabitModal`, `HabitCard`, `completionService`.

2. **007 Theme toggle** — a sun/moon button in the app nav bar persists dark/light preference to `localStorage`. A no-flash inline script in `index.html` applies the saved class before first paint. New: `themeService.ts`, `ThemeToggle.tsx`. Changes: `App.tsx`, `index.html`.

3. **008 Habit reminders** — optional per-habit daily reminder time (HH:MM) stored on the `Habit` object. Browser Notification API fires at scheduled time via `setTimeout`. Permission requested once on first save with a reminder. Blocked-permission indicator on `HabitCard`. New: `reminderService.ts`, `reminder.ts` util. Changes: `Habit` type, `HabitModal`, `HabitCard`, `DashboardPage`.

**Shared type file — coordination required**: all three features modify `src/types/habit.ts`; changes must be applied in a single edit.

**Build order** (8 steps, each independently deployable):

1. Types — `src/types/habit.ts`: add `'hourly' | 'monthly'` to `Frequency`, add `hourlyTarget?: number`, `reminderTime?: string`
2. Theme — `themeService.ts` + `ThemeToggle.tsx` + `index.html` inline script + `App.tsx` nav bar
3. Date util — add `daysInMonth()` to `src/utils/date.ts`
4. Completion service — add `countForDay()`, `countForMonth()`, `addCompletion()`, `removeLastCompletion()` to `completionService.ts`
5. Reminder API — `reminderService.ts` (permission + dispatch)
6. Reminder util — `reminder.ts` (`msUntilTime`, `useReminderScheduler`)
7. Modal — update `HabitModal.tsx`: frequency selector (4 options), conditional `hourlyTarget` field, reminder time picker + permission flow
8. Card + Dashboard — update `HabitCard.tsx` (hourly/monthly display variants, notification badge) + `DashboardPage.tsx` (mount scheduler)

## Technical Context

**Language/Version**: TypeScript ~6.0.2 (strict mode), React ^19.2.6

**Primary Dependencies**:

- `react` ^19.2.6, `react-dom` ^19.2.6 _(installed)_
- `react-router-dom` v6 _(installed)_
- `tailwindcss` _(installed)_
- `vite` ^8.0.12 _(installed)_
- **Web Notifications API** — browser built-in, zero npm install
- **`localStorage`** — browser built-in, accessed only via `/src/api` modules

**Storage**: `localStorage` exclusively. Existing keys unchanged; `hourlyTarget` and `reminderTime` fields added inline to habit objects in `hf_habits`. Theme preference stored in new key `hf_theme`. Hourly/monthly completions use ISO datetime strings in existing `hf_completions` key.

**Testing**: None — explicitly excluded by constitution

**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge); mobile viewport ≥ 320 px; native `<input type="time">` for reminder picker; Notifications API targets same browser matrix

**Project Type**: SPA incremental feature additions (existing React + TypeScript + Vite app)

**Performance Goals**: Theme switch < 100 ms; notifications fire within 60 s of scheduled time; hourly/monthly count reads < 5 ms (localStorage, ≤ 50 habits × 365 dates)

**Constraints**: No new npm dependencies; files < 200 lines; offline-capable; touch targets ≥ 44 × 44 px; no FOUC on theme load

**Scale/Scope**: Single user; ≤ 50 habits; one reminder per habit; one theme preference

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate | Principle                                                                                     | Status   | Notes                                                                                                                                                                   |
| ---- | --------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I    | Clean Code — one responsibility per file, files < 200 lines                                   | **PASS** | Each new file has a single domain (`themeService`, `reminderService`, `reminder` util); `HabitModal` additions are cohesive with existing form responsibility           |
| II   | Simple UX — visual feedback for async ops, fewest steps                                       | **PASS** | Theme: instant class toggle, no async; Reminders: inline blocked indicator + permission message; Frequency: conditional `hourlyTarget` field only appears when relevant |
| III  | Mobile-First — Tailwind responsive prefixes, touch targets ≥ 44 × 44 px, no horizontal scroll | **PASS** | `<input type="time">` is native mobile control; `ThemeToggle` button sized to ≥ 44 × 44 px; progress bar is full-width, no overflow                                     |
| IV   | Minimal Dependencies — new dep justified only if > ~30 lines of TS                            | **PASS** | Theme: DOM + localStorage, ~20 lines; Reminders: built-in `Notification` API + `setTimeout`, ~25 lines; Frequency: count helpers, ~15 lines — no new npm packages       |

_Post-Phase 1 re-check: all gates still pass. No new abstractions introduced; changes are additive and localised._

## Project Structure

### Documentation

```text
specs/002-habit-management/
├── data-model.md      ← Phase 1 output (frequency type expansion)
├── quickstart.md      ← Phase 1 output
└── contracts/
    └── habit-service.md  ← Phase 1 output

specs/007-theme-toggle/
├── research.md        ← Phase 0 output
├── data-model.md      ← Phase 1 output
├── quickstart.md      ← Phase 1 output
└── contracts/
    └── theme-service.md  ← Phase 1 output

specs/008-habit-reminders/
├── plan.md            ← this file
├── research.md        ← Phase 0 output (complete)
├── data-model.md      ← Phase 1 output (complete)
├── quickstart.md      ← Phase 1 output (complete)
└── contracts/
    └── reminder-service.md  ← Phase 1 output (complete)
```

### Source Code

```text
index.html                        # ADD: no-flash inline theme script in <head>

src/
├── types/
│   └── habit.ts                  # ADD: 'hourly'|'monthly' to Frequency; hourlyTarget?; reminderTime?
├── api/
│   ├── completionService.ts      # ADD: countForDay(), countForMonth(), addCompletion(), removeLastCompletion()
│   ├── habitService.ts           # NO CHANGE — generics pass new fields through automatically
│   ├── themeService.ts           # NEW — getTheme(), setTheme()
│   └── reminderService.ts        # NEW — permission, canNotify(), sendNotification()
├── utils/
│   ├── date.ts                   # ADD: daysInMonth(year, month)
│   └── reminder.ts               # NEW — msUntilTime(), useReminderScheduler()
└── components/
    ├── HabitModal.tsx             # MODIFY — 4-option frequency, hourlyTarget field, reminder time picker
    ├── HabitCard.tsx              # MODIFY — hourly tally, monthly count+bar, notification badge
    ├── ThemeToggle.tsx            # NEW — sun/moon button
    └── (no other component changes)

src/
└── App.tsx                       # ADD: <nav> with <ThemeToggle>, initialize theme on mount
```

**Structure Decision**: Single-project SPA (existing). All additions slot into the established folder conventions from the constitution. No new folders, no new routing.

## Artifacts

| Feature | Artifact   | Path                                                                                                        | Status                     |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------- | -------------------------- |
| 002     | Data Model | [specs/002-habit-management/data-model.md](../002-habit-management/data-model.md)                           | Phase 1                    |
| 002     | Contract   | [specs/002-habit-management/contracts/habit-service.md](../002-habit-management/contracts/habit-service.md) | Phase 1                    |
| 002     | Quickstart | [specs/002-habit-management/quickstart.md](../002-habit-management/quickstart.md)                           | Phase 1                    |
| 007     | Research   | [specs/007-theme-toggle/research.md](../007-theme-toggle/research.md)                                       | Phase 0                    |
| 007     | Data Model | [specs/007-theme-toggle/data-model.md](../007-theme-toggle/data-model.md)                                   | Phase 1                    |
| 007     | Contract   | [specs/007-theme-toggle/contracts/theme-service.md](../007-theme-toggle/contracts/theme-service.md)         | Phase 1                    |
| 007     | Quickstart | [specs/007-theme-toggle/quickstart.md](../007-theme-toggle/quickstart.md)                                   | Phase 1                    |
| 008     | Research   | [research.md](./research.md)                                                                                | ✅ Complete                |
| 008     | Data Model | [data-model.md](./data-model.md)                                                                            | ✅ Complete                |
| 008     | Contract   | [contracts/reminder-service.md](./contracts/reminder-service.md)                                            | ✅ Complete                |
| 008     | Quickstart | [quickstart.md](./quickstart.md)                                                                            | ✅ Complete                |
| All     | Tasks      | tasks.md                                                                                                    | Phase 2 (`/speckit.tasks`) |

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
