# Implementation Plan: HabitFlow Frontend — Full Application Build

**Branch**: `006-drag-drop-reorder` | **Date**: 2026-05-22

**Feature Specs**:

- [001 Dashboard Page](../001-dashboard-page/spec.md)
- [002 Habit Management](../002-habit-management/spec.md)
- [003 Daily Completion](../003-daily-completion/spec.md)
- [004 Streak Tracking](../004-streak-tracking/spec.md)
- [005 Habit Detail Page](../005-habit-detail-page/spec.md)
- [006 Drag-and-Drop Reorder](./spec.md)

## Summary

Build the complete HabitFlow single-page application: a dark-themed habit tracker with a responsive card dashboard, habit CRUD via modals, daily completion tracking, streak display, a 365-day CSS-grid heatmap detail page, and mouse-driven drag-and-drop card reordering. All state persists to localStorage through a typed service layer. No UI component libraries, no chart/DnD libraries — React + TypeScript + Tailwind CSS + React Router v6 only.

**Build order** (9 steps, each independently deployable):

1. Project setup + folder structure + Tailwind CSS + React Router
2. localStorage API service layer + shared TypeScript types
3. State store (`/src/store`)
4. Dashboard page — card grid + empty state + skeleton loading
5. Add/edit habit modal — name, category, colour tag, frequency
6. Daily completion checkbox — optimistic update + revert on failure
7. Streak calculation — `/src/utils/streak.ts`
8. Habit detail page — habit info + streaks + 365-day CSS-grid heatmap
9. Drag-and-drop card reordering — HTML5 DnD API, desktop only

## Technical Context

**Language/Version**: TypeScript ~6.0.2 (strict mode), React ^19.2.6

**Primary Dependencies**:

- `react` ^19.2.6, `react-dom` ^19.2.6 _(installed)_
- `react-router-dom` v6 _(to install)_
- `tailwindcss` + `@tailwindcss/vite` _(to install)_
- `vite` ^8.0.12 _(installed)_

**Storage**: `localStorage` exclusively — accessed only via `/src/api` service modules; no component or store writes directly to storage

**Testing**: None — explicitly excluded by constitution and user request

**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), mobile viewport ≥ 320 px; drag-and-drop desktop only (mouse/trackpad)

**Project Type**: Single-page web application (SPA)

**Performance Goals**: < 100 ms ghost card + drop placeholder on drag start; < 2 s detail page render with full 365-day heatmap; streak updates synchronous/instant

**Constraints**: Offline-capable (localStorage only); no UI component libraries; no chart, canvas, SVG or DnD libraries; all layout via Tailwind CSS utility classes; files < 200 lines

**Scale/Scope**: Single user; ~50 habits; up to 365 completion records per habit; 2 routed pages

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate | Principle                                                                                              | Status       | Notes                                                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------ |
| I    | Clean Code — one responsibility per component/function, no dead code, files < 200 lines                | **PASS**     | File-per-component enforced; utils split by domain                                                     |
| II   | Simple UX — visual feedback for every async op, fewest steps for core actions                          | **PASS**     | Skeleton, toast, error states specified in all 6 specs                                                 |
| III  | Mobile-First Responsive — Tailwind responsive prefixes, touch targets ≥ 44×44 px, no horizontal scroll | **PASS**     | Tailwind `sm:`/`md:`/`lg:` required; heatmap horizontal scroll explicitly permitted by spec 005 FR-016 |
| IV   | Minimal Dependencies — new dep justified if functionality requires > ~30 lines                         | **APPROVED** | Zustand: explicit user request for state management; compact, purpose-built; approved for this project |

### Gate IV Amendment: Zustand Approved

Zustand is explicitly requested for this implementation and has been approved as an exception to the constitution's default "custom store in `/src/store`" pattern. The rationale: Zustand is a minimal (~2KB gzipped), single-purpose state library that fits well within the project's Minimal Dependencies principle when compared to the ~60 lines of `useSyncExternalStore` boilerplate per store module.

**Installation**: `npm install zustand`

Store usage pattern will be idiomatic Zustand with hooks: `const { habits, order, setHabits } = useHabitStore()`

## Project Structure

### Documentation

```text
specs/006-drag-drop-reorder/
├── plan.md         ← this file
├── research.md     ← Phase 0 output
├── data-model.md   ← Phase 1 output
├── quickstart.md   ← Phase 1 output
├── contracts/
│   └── api-service.md  ← Phase 1 output
└── tasks.md        ← Phase 2 output (via /speckit.tasks)
```

### Source Code

```text
src/
├── components/
│   ├── HabitCard.tsx          # Card for one habit — checkbox, streaks, drag handle
│   ├── HabitCardSkeleton.tsx  # Shimmer placeholder matching HabitCard layout
│   ├── HabitModal.tsx         # Add / edit modal form
│   ├── ConfirmModal.tsx       # Delete confirmation dialog
│   ├── CompletionCheckbox.tsx # Accessible checkbox for daily completion
│   ├── StreakBadge.tsx        # Flame/trophy icon + "N day(s)" label
│   ├── Heatmap.tsx            # 365-day CSS grid — pure layout, no library
│   ├── EmptyState.tsx         # Dashboard empty state with CTA
│   └── Toast.tsx              # Auto-dismissing toast / snackbar
├── pages/
│   ├── DashboardPage.tsx      # "/" — card grid, drag-drop, toolbar
│   └── HabitDetailPage.tsx    # "/habit/:id" — detail + heatmap
├── store/
│   ├── habitStore.ts          # Habits + order — Zustand store
│   └── completionStore.ts     # Completions — Zustand store
├── api/
│   ├── habitService.ts        # CRUD + order persistence for habits
│   ├── completionService.ts   # Mark/unmark + query completions
│   └── orderService.ts        # Read/write habit display order
├── types/
│   ├── habit.ts               # Habit, CreateHabitInput, UpdateHabitInput, enums
│   ├── completion.ts          # CompletionRecord type
│   └── index.ts               # Re-exports everything from types/
└── utils/
    ├── streak.ts              # currentStreak(), longestStreak()
    ├── date.ts                # todayISO(), dateRange(), isoToDate()
    └── heatmap.ts             # buildHeatmapCells(), getMonthLabels()
```

**Routing**:

```text
/             → DashboardPage
/habit/:id    → HabitDetailPage
*             → redirect to /
```

## Complexity Tracking

| Item        | Rationale                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Zustand** | Approved exception to custom store pattern (see Gate IV Amendment above). Minimal, purpose-built, reduces boilerplate by ~120 lines vs `useSyncExternalStore` setup. |

## Artifacts

| Artifact      | Path                                                   | Status                     |
| ------------- | ------------------------------------------------------ | -------------------------- |
| Research      | [research.md](./research.md)                           | Phase 0                    |
| Data Model    | [data-model.md](./data-model.md)                       | Phase 1                    |
| API Contracts | [contracts/api-service.md](./contracts/api-service.md) | Phase 1                    |
| Quickstart    | [quickstart.md](./quickstart.md)                       | Phase 1                    |
| Tasks         | tasks.md                                               | Phase 2 (`/speckit.tasks`) |
