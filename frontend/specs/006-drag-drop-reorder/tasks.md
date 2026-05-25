# Tasks: HabitFlow Frontend — Full Application Build

**Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/api-service.md](./contracts/api-service.md)
**Date**: 2026-05-25 | **Tests**: None — excluded by constitution and user request

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel with other [P] tasks at the same stage (different files, no unresolved dependencies within that group)
- **[USn]**: Which user story this task delivers (US1–US6 map to specs 001–006 respectively)
- Setup and Foundational phases carry no story label

---

## Phase 1: Setup

**Purpose**: Install dependencies, configure toolchain, scaffold folder structure, wire routing

- [X] T001 Install npm dependencies: `react-router-dom`, `tailwindcss`, `@tailwindcss/vite`, `zustand`
- [X] T002 [P] Configure Tailwind CSS v4 — add `@tailwindcss/vite` plugin to `vite.config.ts` alongside the React plugin
- [X] T003 [P] Configure Tailwind CSS entry point — replace contents of `src/index.css` with `@import "tailwindcss";`; add `class="dark"` to `<html>` in `index.html`
- [X] T004 [P] Create empty folder structure: `src/components/`, `src/pages/`, `src/store/`, `src/api/`, `src/types/`, `src/utils/`
- [X] T005 Wire React Router — wrap `<App />` in `<BrowserRouter>` in `src/main.tsx`; add `<Routes>` with `<Route path="/" element={<DashboardPage />} />`, `<Route path="/habit/:id" element={<HabitDetailPage />} />`, and catch-all `<Navigate to="/" replace />` in `src/App.tsx`

**Checkpoint**: `npm run dev` opens without errors; routes `/` and `/habit/test` are resolved (pages can be empty stubs)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared TypeScript types, localStorage service layer, Zustand stores — all user story work depends on this phase

⚠️ **No user story phase may begin until this phase is complete**

### 2a — Types (parallel group)

- [X] T006 [P] Create `src/types/habit.ts` — export `Habit` interface (`id`, `name`, `category`, `colorTag`, `frequency`, `createdAt`); export `Category`, `ColorTag`, `Frequency` union types; export `CreateHabitInput` (`Omit<Habit, 'id' | 'createdAt'>`); export `UpdateHabitInput` (`Partial<CreateHabitInput>`)
- [X] T007 [P] Create `src/types/completion.ts` — export `CompletionRecord` type (`Record<string, string[]>`, key = habitId, value = sorted YYYY-MM-DD date array)
- [X] T008 Create `src/types/index.ts` — re-export everything from `habit.ts` and `completion.ts`; export `HabitOrder` (`string[]`), `StreakData` (`{ current: number; longest: number }`), `HeatmapCellState` (`'completed' | 'missed' | 'empty'`), `HeatmapCell` (`{ date: string; state: HeatmapCellState }`), `Toast` (`{ id: string; message: string; type: 'error' | 'success' | 'info' }`), `ModalState` discriminated union

### 2b — Date Utilities (parallel with 2a)

- [X] T009 [P] Implement `src/utils/date.ts` — export `todayISO(): string` (YYYY-MM-DD local date), `yesterdayISO(): string`, `previousDay(date: string): string`, `dateRange(from: string, to: string): string[]` (inclusive, ascending order)

### 2c — Service Layer (depends on T008)

- [X] T010 [P] Implement `src/api/habitService.ts` — private `read<T>()` / `write<T>()` helpers with try/catch over `localStorage`; export `getAll(): Habit[]`, `getById(id): Habit | undefined`, `create(input): Habit` (generates UUID with `crypto.randomUUID()`, sets `createdAt` to `todayISO()`; throws on duplicate name case-insensitively), `update(id, input): Habit` (throws on name conflict excluding self), `remove(id): void`
- [X] T011 [P] Implement `src/api/completionService.ts` — export `getAll(): CompletionRecord`, `getForHabit(habitId): string[]`, `isComplete(habitId, date): boolean`, `markComplete(habitId, date): void` (no-op if already marked; throws on write failure), `markIncomplete(habitId, date): void`, `deleteForHabit(habitId): void`
- [X] T012 [P] Implement `src/api/orderService.ts` — export `getOrder(): string[]`, `setOrder(ids: string[]): void` (throws on write failure), `append(habitId: string): void`, `remove(habitId: string): void`

### 2d — Zustand Stores (depends on T010–T012)

- [X] T013 [P] Implement `src/store/habitStore.ts` — Zustand store with state `{ habits: Habit[], order: HabitOrder, isLoading: boolean, error: string | null }`; actions: `loadHabits()` (reads from `habitService` + `orderService`, resolves missing IDs), `addHabit(input)` (creates via `habitService`, appends via `orderService`, updates store optimistically), `updateHabit(id, input)`, `removeHabit(id)` (removes from both `habitService`, `completionService`, and `orderService`), `reorderHabits(newOrder)` (optimistic; reverts + sets error on `orderService` failure), `clearError()`
- [X] T014 [P] Implement `src/store/completionStore.ts` — Zustand store with state `{ completions: CompletionRecord, isLoading: boolean, error: string | null }`; actions: `loadCompletions()`, `toggleComplete(habitId, date)` (optimistic toggle; reverts + sets error on `completionService` failure), `clearError()`

**Checkpoint**: No TypeScript errors across `src/types/`, `src/api/`, `src/store/` (`npx tsc --noEmit`)

---

## Phase 3: User Story 1 — Dashboard Page (Priority: P1) 🎯 MVP

**Goal**: Render the habit dashboard — card grid in persisted order, skeleton loading, empty state, error state

**Independent Test**: Seed `localStorage` with `hf_habits` and `hf_order` data manually, open `/`, verify cards render in seeded order; clear storage and verify empty state; can navigate to `/habit/:id` from a card

- [X] T015 [P] [US1] Implement `src/components/EmptyState.tsx` — "No habits yet" heading, short descriptor, "Add your first habit" CTA button (calls `onAddHabit` prop); dark Tailwind theme; centred layout
- [X] T016 [P] [US1] Implement `src/components/HabitCardSkeleton.tsx` — shimmer placeholder matching the HabitCard layout (name bar, category/color row, two streak badge placeholders, checkbox area); shimmer animation via Tailwind `animate-pulse`; dark theme
- [X] T017 [P] [US1] Implement `src/components/StreakBadge.tsx` — accepts `type: 'current' | 'longest'` and `count: number`; renders flame emoji (current) or trophy emoji (longest) + `"N day"` / `"N days"` (singular when count === 1); `aria-label` format `"N day streak"` / `"N day personal best"`; dark Tailwind theme
- [X] T018 [US1] Implement `src/components/HabitCard.tsx` — renders habit `name` as `<Link>` to `/habit/:id`; category text; colour tag swatch (maps `colorTag` value to Tailwind bg colour class); two `<StreakBadge>` instances (accepts `streakData: StreakData` prop, shows placeholder 0 values initially); checkbox placeholder area (non-functional, replaced in US3); edit and delete icon buttons; `aria-label` on card; keyboard-focusable interactive elements; 44×44 px minimum touch targets; dark Tailwind theme
- [X] T019 [US1] Implement `src/pages/DashboardPage.tsx` — calls `habitStore.loadHabits()` and `completionStore.loadCompletions()` on mount; during `isLoading`: renders grid of 3 `<HabitCardSkeleton>` components; when `habits.length === 0`: renders `<EmptyState onAddHabit={...} />`; when `error`: renders inline error message with "Retry" button that re-calls `loadHabits()`; otherwise renders responsive Tailwind card grid (1 col mobile, 2 col `sm:`, 3 col `lg:`) of `<HabitCard>` in `order` sequence; "Add habit" `<button>` in page header (no modal yet — wired in US2)

**Checkpoint**: Dashboard renders correctly for empty, loading, error, and populated states

---

## Phase 4: User Story 2 — Habit Management (Priority: P2)

**Goal**: Add, edit, and delete habits via accessible modals; changes persist across refreshes

**Independent Test**: Add a habit, verify it appears on dashboard; edit it, verify name/category/color updates; delete it with confirmation, verify it disappears

- [X] T020 [US2] Implement `src/components/ConfirmModal.tsx` — accepts `habitName: string`, `onConfirm()`, `onCancel()`; renders modal overlay; shows `"Delete '{habitName}'?"` message; Confirm and Cancel buttons; focus trap (focus cycles within modal); Escape key calls `onCancel`; `role="dialog"`, `aria-modal="true"`, `aria-labelledby`; dark Tailwind theme
- [X] T021 [US2] Implement `src/components/HabitModal.tsx` — accepts `mode: 'add' | 'edit'`, `initialValues?: Partial<CreateHabitInput>`, `onSubmit(input)`, `onClose()`; form fields: name (text input, required, trimmed), category (`<select>`, default `'Health'`), colorTag (visual colour picker with 6 options, default `'blue'`), frequency (`<select>`, default `'daily'`); inline error shown below name input on save failure (modal stays open, inputs preserved); case-insensitive unique name validation (self-exclusion in edit mode); focus trap; Escape calls `onClose`; `role="dialog"`, `aria-modal="true"`, `aria-labelledby`; dark Tailwind theme
- [X] T022 [US2] Integrate modals into `src/pages/DashboardPage.tsx` — wire `ModalState` local state; "Add habit" button opens `{ type: 'add' }` modal; HabitCard edit button opens `{ type: 'edit', habitId }` modal; HabitCard delete button opens `{ type: 'confirm-delete', habitId }` modal; `HabitModal` `onSubmit` calls `habitStore.addHabit` or `habitStore.updateHabit`; `ConfirmModal` `onConfirm` calls `habitStore.removeHabit`; `onClose`/`onCancel` resets modal state; show inline form error on habitStore error

**Checkpoint**: Full habit CRUD works; refresh retains changes; modal focus trap and Escape key work

---

## Phase 5: User Story 3 — Daily Completion (Priority: P3)

**Goal**: Toggle today's completion on each habit card; optimistic update with revert on failure; toast on error

**Independent Test**: Toggle checkbox on a habit, refresh page — completion state is retained; disconnect storage (force error) and verify visual revert + toast

- [X] T023 [US3] Implement `src/components/Toast.tsx` — accepts `toasts: Toast[]` and `onDismiss(id)` prop; renders fixed-position toast stack (bottom-right); each toast shows message + dismiss button; auto-dismisses after 4 seconds via `useEffect`; `role="status"`, `aria-live="polite"` for info/success; `aria-live="assertive"` for error; dark Tailwind theme
- [X] T024 [US3] Implement `src/components/CompletionCheckbox.tsx` — accessible `<button role="checkbox">` (or `<input type="checkbox">`); accepts `habitId: string`, `date: string`, `checked: boolean`, `onChange()`; `aria-checked`, `aria-label` includes habit name (e.g., `"Mark Morning Run as complete"`); Tab + Space keyboard interaction; visual: filled circle (completed) / empty circle (incomplete); dark Tailwind theme
- [X] T025 [US3] Wire `CompletionCheckbox` into `src/components/HabitCard.tsx` — replace static checkbox placeholder with `<CompletionCheckbox>`; derive `checked` from `completionStore` (`isComplete(habit.id, todayISO())`); `onChange` calls `completionStore.toggleComplete(habit.id, todayISO())`; completed card renders at 55% opacity (`opacity-55`); `completedToday` drives opacity class
- [X] T026 [US3] Add `<Toast>` to `src/pages/DashboardPage.tsx` — render `<Toast>` component at page root; manage `toasts: Toast[]` state; watch `habitStore.error` and `completionStore.error` with `useEffect` — on new error append toast to list and call `clearError()`; `onDismiss` removes toast by id

**Checkpoint**: Completion toggles instantly (optimistic); refresh retains state; simulated storage failure shows toast and reverts checkbox

---

## Phase 6: User Story 4 — Streak Tracking (Priority: P4)

**Goal**: Real streak values (current and longest) computed from completion history and displayed on cards and detail page

**Independent Test**: Seed known completion history in localStorage for a habit, open dashboard, verify current and longest streak values match expected counts; toggle today's completion and verify current streak updates in real-time

- [X] T027 [US4] Implement `src/utils/streak.ts` — export `currentStreak(dates: Set<string>, today: string): number` (if today completed: scan backwards from today; if yesterday completed but not today: scan backwards from yesterday; else 0); export `longestStreak(dates: Set<string>, createdAt: string, today: string): number` (scan all days from createdAt to today, track running and best streak); handle all spec 004 edge cases: never completed returns 0; broken streak (neither yesterday nor today) returns 0 for current; singular/plural is handled by `StreakBadge`, not here
- [X] T028 [P] [US4] Implement `src/utils/heatmap.ts` — export `buildHeatmapCells(completions: Set<string>, createdAt: string, today: string): HeatmapCell[]` (exactly 365 cells oldest-to-newest; state: `'empty'` if before createdAt or after today or today-not-yet-done; `'completed'` if in completions set; `'missed'` otherwise); export `getMonthLabels(cells: HeatmapCell[]): Array<{ label: string; colIndex: number }>` (abbreviated month name and the 0-based week column index where each month's 1st falls)
- [X] T029 [US4] Wire streak calculation into `src/components/HabitCard.tsx` — derive `completionSet` from `completionStore.completions[habit.id]`; compute `streakData: StreakData` using `currentStreak` and `longestStreak` from `src/utils/streak.ts`; pass real values to both `<StreakBadge>` instances; values update reactively when `completionStore` changes

**Checkpoint**: Streak numbers on cards are accurate for seeded data; toggling completion updates streaks in real time without page refresh

---

## Phase 7: User Story 5 — Habit Detail Page (Priority: P5)

**Goal**: Full detail page — habit metadata, streak badges, 365-day CSS-grid heatmap; skeleton, not-found, and error states; back navigation

**Independent Test**: Navigate from dashboard to a habit's detail page; verify name/category/colour/streaks shown correctly; inspect heatmap cells against known completion history; verify back button and browser back both return to dashboard

- [X] T030 [US5] Implement `src/components/Heatmap.tsx` — accepts `cells: HeatmapCell[]` (365 items), `colorTag: ColorTag`, `completedCount: number`; renders CSS grid: `grid-template-rows: repeat(7, 1fr)`, `grid-auto-flow: column`, `grid-auto-columns` fixed cell width, `gap-[3px]`; prepends filler cells (`visibility: hidden`) so day-0 aligns to correct weekday row; cell colours: `'completed'` → habit colour Tailwind class, `'missed'` → muted neutral (`bg-zinc-700`), `'empty'` → transparent; above the grid: month label row using `getMonthLabels()` output, positioned by column index; wraps grid + labels in `overflow-x-auto` container for mobile scroll; container has `aria-label="Completion history: {completedCount} of 365 days completed in the last year"`; individual cells have `aria-hidden="true"`; pure Tailwind + CSS, no chart library
- [X] T031 [US5] Implement `src/pages/HabitDetailPage.tsx` — reads `id` from `useParams()`; on mount: calls `habitStore.loadHabits()` if not yet loaded; during loading: renders full-page skeleton (name bar, category row, two streak badge placeholders, heatmap grid placeholder); if habit not found after load: renders "Habit not found" message with `<Link to="/">Back to dashboard</Link>` (FR-019); if `habitStore.error`: renders error message + "Retry" button; otherwise: renders habit name (`<h1>`), category, colour tag swatch, two `<StreakBadge>` instances with real streak values (from `streak.ts` + `completionStore`), `<Heatmap>` with 365 cells from `buildHeatmapCells()`; back button (`<Link to="/">← Back</Link>`) sticky at top of page, always visible without scrolling (FR-014); browser back works via React Router; responsive Tailwind layout (mobile-first)

**Checkpoint**: Detail page loads correctly with real data; heatmap cell states match known history; back button and browser back both navigate to dashboard

---

## Phase 8: User Story 6 — Drag-and-Drop Reorder (Priority: P6)

**Goal**: Mouse drag-and-drop to reorder habit cards; ghost card + slim insertion line during drag; optimistic order persist with revert on failure; keyboard alternative with ARIA announcements

**Independent Test**: With 3+ habits, drag card from position 1 to position 3; verify immediate visual reorder; refresh and verify order persisted; drag and press Escape; verify order unchanged

- [X] T032 [P] [US6] Add drag source behaviour to `src/components/HabitCard.tsx` — add `draggable` prop (`boolean`), `onDragStart`, `onDragEnd` props; when `draggable`: set `draggable="true"`; `onDragStart`: write `habit.id` to `e.dataTransfer.setData('text/plain', habit.id)`, call prop; `onDragEnd`: call prop; add `isDragging: boolean` prop — when true apply `opacity-40` to card; card surface is the drag target (no dedicated handle icon)
- [X] T033 [P] [US6] Implement ghost card and insertion line in `src/pages/DashboardPage.tsx` — `dragState` local state: `{ draggingId: string | null; overIndex: number | null }`; `onDragStart`: clone dragged card DOM node, append to `document.body` as fixed ghost (`position: fixed; opacity: 0.6; pointer-events: none; z-index: 9999; width: cardWidth; top: -200px` — off-screen so `setDragImage` uses it), call `e.dataTransfer.setDragImage(ghostEl, halfWidth, halfHeight)`, set `draggingId`; `onDragEnd`: remove ghost element, clear `dragState`; between each pair of adjacent cards (and at list boundaries) render a slim `<div>` insertion line (2px height, accent colour, full width, `transition-opacity`) visible only when `overIndex` matches that gap index
- [X] T034 [US6] Wire `dragover` and `drop` in `src/pages/DashboardPage.tsx` — card list container `onDragOver`: `e.preventDefault()`; compute `overIndex` by comparing `e.clientY` against each card's bounding rect midpoint; update `dragState.overIndex`; container `onDrop`: `e.preventDefault()`; read `habitId` from `e.dataTransfer.getData('text/plain')`; compute new order: remove `habitId` from current order array, insert at `overIndex`; call `habitStore.reorderHabits(newOrder)` (store handles optimistic update + `orderService.setOrder` + revert + toast error per FR-018); clear `dragState`
- [X] T035 [US6] Implement drag cancellation in `src/pages/DashboardPage.tsx` — `useEffect` adds `keydown` listener while `draggingId` is set; Escape key: calls `e.dataTransfer.clearData()` programmatically where possible, then clears `dragState` — do NOT call `reorderHabits` on Escape, as no optimistic update has been applied yet (the drop has not completed); handle `dragend` outside any valid drop zone: use a `didDrop` ref (initialised `false`, set to `true` inside `onDrop` before clearing `dragState`); in `onDragEnd`, if `didDrop.current` is `false`, clear `dragState` only — no `reorderHabits` call needed because no order mutation has occurred; reset `didDrop` to `false` on every `onDragStart`; single-card drag allowed — drop at same position is a no-op
- [X] T036 [US6] Implement keyboard reordering in `src/pages/DashboardPage.tsx` — add `aria-live="polite"` region (visually hidden, `sr-only`) for announcements; each `<HabitCard>` gets `aria-grabbed` attribute; keyboard flow: card is focused (Tab); `Alt+ArrowUp` / `Alt+ArrowDown` (or `Space` to enter move mode + Arrow keys) shifts card one position; Enter confirms (calls `habitStore.reorderHabits`), Escape cancels (restores original position); announce on activate: `"Move mode: {name}, position {n} of {total}"`; on each shift: `"{name} moving to position {n} of {total}"`; on confirm: `"{name} moved to position {n}"`; on cancel: `"Move cancelled"`

- [X] T041 [US6] Extract drag-and-drop logic from `src/pages/DashboardPage.tsx` into `src/utils/useDragDrop.ts` custom hook — move `dragState` (`{ draggingId, overIndex }`), the `didDrop` ref, all HTML5 DnD event handlers (`onDragStart`, `onDragOver`, `onDrop`, `onDragEnd`), the Escape `keydown` `useEffect`, and keyboard-reorder handlers into a single hook with signature `useDragDrop(order: HabitOrder, reorderHabits: (newOrder: HabitOrder) => void)`; hook returns `{ dragState, dragHandlers, keyboardHandlers, ariaRegionRef }`; `DashboardPage.tsx` destructures the hook and passes handlers to the card grid and `<HabitCard>` instances; verify `DashboardPage.tsx` stays under 200 lines after extraction (constitution Principle I)

**Checkpoint**: Mouse drag reorders and persists; Escape cancels without side effects; keyboard reordering announces correctly to screen reader; `DashboardPage.tsx` is under 200 lines

---

## Phase 9: Polish & Cross-Cutting

**Goal**: Verify constitutional compliance, accessibility, and visual consistency across all screens

- [X] T037 [P] Verify mobile responsiveness — test all interactive elements at 320px, 375px, and 768px viewports; confirm no horizontal scroll on any page (except inside the heatmap `overflow-x-auto` container); confirm all touch targets ≥ 44×44 px; verify heatmap scrolls within its container without affecting page scroll
- [X] T038 [P] Verify dark theme consistency — confirm all components render correctly with `class="dark"` on `<html>`; confirm muted missed-day colour (`bg-zinc-700`) is visually distinct from all six colour tag options and from empty cells; confirm colour contrast on text elements passes WCAG AA
- [X] T039 [P] Verify constitution compliance — check every file in `src/` is under 200 lines; split any that exceed the limit into focused sub-modules; remove any `console.log`, commented-out code, or unused imports; confirm TypeScript strict mode passes with `npx tsc --noEmit`
- [X] T040 [P] Verify navigation — test all routes: `/` loads dashboard, `/habit/:id` loads detail, unknown path redirects to `/`; test browser back from detail page returns to dashboard; test browser forward after back; verify no React Router warnings in console

---

## Dependencies

```
Phase 1 (Setup)
  └─ Phase 2 (Foundational)
       ├─ Phase 3 [US1] Dashboard Page
       │    ├─ Phase 4 [US2] Habit Management (modals integrate into DashboardPage)
       │    ├─ Phase 5 [US3] Daily Completion (checkbox integrates into HabitCard)
       │    │    └─ Phase 6 [US4] Streak Tracking (streak wires into HabitCard + completions)
       │    │         └─ Phase 7 [US5] Habit Detail Page (heatmap + streak on detail page)
     └─ Phase 8 [US6] Drag-and-Drop (extends DashboardPage + HabitCard)
       │    └─ T041 (hook extraction — depends on T032–T036 complete)
       └─ Phase 9 (Polish — cross-cutting, runs after all stories)
```

**Within Phase 2** (internal ordering):

```
T006 [P]  T007 [P]  T009 [P]   ← all parallel (no deps within phase)
    └───────┘
        T008                   ← depends on T006 + T007
        ├── T010 [P]
        ├── T011 [P]           ← all parallel to each other, depend on T008
        └── T012 [P]
             ├── T013 [P]
             └── T014 [P]      ← parallel to each other, depend on T010/T011/T012
```

---

## Parallel Execution Examples

**Phase 2 kickoff** (can be done simultaneously by one LLM or split across sessions):

- Session A: T006, T007, T009 → then T008 → then T010, T011, T012
- Session B: T013, T014 after T010–T012 complete

**Phase 3 kickoff** (after Phase 2):

- Session A: T015, T016, T017 (all [P]) → then T018 → then T019
- (Single session preferred — 5 tasks, small scope)

**Phase 9 Polish** (all [P] — run simultaneously after T036):

- T037, T038, T039, T040 in parallel

---

## Implementation Strategy

**MVP** (minimum demonstrable product): Complete Phases 1–3 (T001–T019)

- App runs, shows dashboard with cards, skeleton, empty state, and navigation to stubbed detail page
- Provides the foundation for all remaining stories

**Increment 1**: Add Phase 4 (T020–T022) — full habit CRUD via modals
**Increment 2**: Add Phase 5 (T023–T026) — completion toggles with persistence
**Increment 3**: Add Phase 6 (T027–T029) — real streak numbers
**Increment 4**: Add Phase 7 (T030–T031) — full detail page + heatmap
**Increment 5**: Add Phase 8 (T032–T036) — drag-and-drop reordering
**Final**: Phase 9 (T037–T040) — polish and compliance pass
