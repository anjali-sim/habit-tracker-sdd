# Research: HabitFlow Frontend

**Date**: 2026-05-22 | **Phase**: 0 — Pre-Design Research

All unknowns from Technical Context and spec constraints resolved below.

---

## 1. Drag-and-Drop Implementation

**Decision**: HTML5 Drag and Drop API

**Rationale**: The spec constrains drag-and-drop to desktop mouse/trackpad only (FR-010) and forbids external DnD libraries (FR-017). The HTML5 DnD API is purpose-built for exactly this use case: it fires drag events on mouse interaction, provides built-in ghost rendering, and requires no polyfills for supported desktop browsers.

**Implementation pattern**:

- Set `draggable="true"` on each `HabitCard`
- `onDragStart`: record the dragged habit ID in `dataTransfer`, create an off-screen ghost clone element, call `e.dataTransfer.setDragImage(ghostEl, offset, offset)` to use it as the preview, set original card to low opacity
- `onDragOver`: call `e.preventDefault()` to allow the drop; derive the target insertion index from the event's Y coordinate relative to the card list; update `dragOverIndex` React state (drives the insertion line render)
- `onDrop`: read habit ID from `dataTransfer`, reorder the habit array, persist via `orderService`, clear drag state
- `onDragEnd`: restore source card opacity, remove ghost element from DOM
- Insertion line: a slim `<div>` rendered absolutely between cards when `dragOverIndex` matches that gap; surrounding cards do not move (FR-005)

**Ghost card**: a `cloneNode(true)` of the card element, appended to `document.body` with `position: fixed; opacity: 0.6; pointer-events: none; z-index: 9999`, removed on `dragend`

**Alternatives considered**:

- Pointer Events API — works on both mouse and touch, but touch is out of scope; significantly more code (~200 extra lines) for no benefit given the constraint
- External DnD library (e.g., `@dnd-kit/core`) — banned by FR-017 and constitution Minimal Dependencies principle

---

## 2. Tailwind CSS v4 Setup with Vite

**Decision**: `@tailwindcss/vite` plugin (Tailwind v4 CSS-first approach)

**Rationale**: The project uses Vite ^8. Tailwind v4 ships a first-party Vite plugin that replaces the PostCSS pipeline. Zero config file required — all customisation is in CSS with `@theme`.

**Install**:

```bash
npm install tailwindcss @tailwindcss/vite
```

**`vite.config.ts`** — add plugin:

```typescript
import tailwindcss from "@tailwindcss/vite";
// in defineConfig → plugins: [react(), tailwindcss()]
```

**`src/index.css`** — replace existing content with:

```css
@import "tailwindcss";
```

**Dark theme**: Use Tailwind's `dark:` variant driven by a `class="dark"` on `<html>`; the app is always dark so `<html class="dark">` in `index.html` is sufficient — no toggle needed.

**Alternatives considered**:

- Tailwind v3 with PostCSS — requires `tailwind.config.js` + `autoprefixer` + `postcss.config.js`; more boilerplate; v4 is the current version

---

## 3. React Router v6 Setup

**Decision**: `react-router-dom` v6 with `BrowserRouter` + `Routes`

**Install**:

```bash
npm install react-router-dom
```

**Route structure**:

```tsx
// main.tsx
<BrowserRouter>
  <App />
</BrowserRouter>

// App.tsx
<Routes>
  <Route path="/" element={<DashboardPage />} />
  <Route path="/habit/:id" element={<HabitDetailPage />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

**Navigation**: `useNavigate()` in components; `useParams<{ id: string }>()` in HabitDetailPage; `<Link>` for the back button in HabitDetailPage.

---

## 4. State Store — Zustand

**Decision**: Zustand for reactive state management

**Rationale**: User explicitly requested Zustand for implementation. Zustand is minimal (~2KB gzipped), unopinionated, and purpose-built for React. It provides a hook-based API with no boilerplate, supports selectors for fine-grained re-render control, and aligns with the project's Minimal Dependencies principle.

**Pattern** (applied to both `habitStore.ts` and `completionStore.ts`):

```typescript
import { create } from "zustand";

interface HabitState {
  habits: Habit[];
  order: HabitOrder;
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => void;
  removeHabit: (id: string) => void;
  reorderHabits: (newOrder: HabitOrder) => void;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  order: [],
  setHabits: (habits) => set({ habits }),
  addHabit: (habit) =>
    set((state) => ({
      habits: [...state.habits, habit],
      order: [...state.order, habit.id],
    })),
  removeHabit: (id) =>
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
      order: state.order.filter((hid) => hid !== id),
    })),
  reorderHabits: (newOrder) => set({ order: newOrder }),
}));
```

**Component usage**: `const habits = useHabitStore(state => state.habits)` — selector prevents re-renders on unrelated state changes

**Alternatives considered**:

- Custom `useSyncExternalStore` — requires ~60 lines boilerplate vs Zustand's streamlined API
- Redux — overkill for single-user, offline-first app
- Context API — no built-in async/optimistic update patterns

---

## 5. Streak Calculation Algorithm

**Decision**: Backward scan from today over sorted completion date strings

**Rationale**: Completion data is stored as `string[]` of `YYYY-MM-DD` dates per habit. Converting to a `Set<string>` gives O(1) membership checks. The scan is O(n) where n ≤ 365.

**Current streak logic** (per spec 004 clarifications):

```
function currentStreak(dates: Set<string>, today: string): number
  if dates.has(today):
    scan = today
  else if dates.has(yesterday(today)):
    scan = yesterday(today)
  else:
    return 0
  count = 0
  while dates.has(scan):
    count++
    scan = previousDay(scan)
  return count
```

**Longest streak logic**:

```
function longestStreak(dates: Set<string>, createdAt: string, today: string): number
  best = 0, running = 0
  for each day from createdAt to today (inclusive):
    if dates.has(day): running++; best = max(best, running)
    else: running = 0
  return best
```

**Singular/plural** (spec 004): `"1 day"` when count === 1; `"N days"` for all other values including 0.

---

## 6. CSS Grid Heatmap

**Decision**: Native CSS Grid with `grid-auto-flow: column`

**Rationale**: FR-012 (spec 005) explicitly requires native browser layout only. A CSS grid with `grid-template-rows: repeat(7, 1fr)` and `grid-auto-flow: column` auto-stacks days into weekly columns exactly like GitHub's contribution graph.

**Grid setup**:

```css
.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  grid-auto-flow: column;
  grid-auto-columns: minmax(12px, 14px);
  gap: 3px;
}
```

**Cell count**: Exactly 365 cells, ordered oldest-to-newest so the most recent week is at the right.

**Padding cells**: The first week may not start on Sunday (or Monday). Prepend empty filler cells (with `visibility: hidden`) so the first real day aligns to the correct row.

**Month labels**: A parallel array computed from the data — for each week column that contains the 1st of a month, render the abbreviated month name above that column. Implemented as a separate `<div>` row with matching column widths, positioned via CSS Grid.

**Responsive**: Wrap the grid and labels in a `overflow-x: auto` container. On mobile the grid scrolls horizontally; the weekly structure is preserved at all widths (spec 005 FR-016).

**Accessibility**: Single `aria-label` on the container (e.g., `"Completion history: X of 365 days completed in the last year"`); individual cells have `aria-hidden="true"` (spec 005 FR-017).

---

## 7. localStorage Schema

**Decision**: Namespaced flat keys, JSON-serialised values

**Rationale**: Namespacing (`hf_` prefix) prevents collisions with other apps on the same origin. Flat keys keep reads/writes atomic per concern. No complex query patterns are needed.

```
hf_habits      → JSON: Habit[]
hf_completions → JSON: Record<habitId: string, dates: string[]>
hf_order       → JSON: string[]   (habit IDs in display order)
```

**Read/write pattern**: Each service module has a private `read()` / `write()` pair:

```typescript
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
```

**Error handling**: `read()` returns the fallback on parse error (corrupted data). `write()` wrapped in try/catch — callers receive a thrown error so the store can trigger the optimistic-revert + toast flow.

---

## Post-Research Constitution Check (Re-evaluation)

| Gate                      | Status                                                                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I — Clean Code            | **PASS** — module-per-concern, single-responsibility functions, no new dead code                                                                           |
| II — Simple UX            | **PASS** — all error/loading states covered; toast pattern consistent across features                                                                      |
| III — Mobile-First        | **PASS** — Tailwind responsive utilities; heatmap horizontal scroll permitted                                                                              |
| IV — Minimal Dependencies | **PASS** (Zustand approved) — 3 new runtime deps: `react-router-dom`, `tailwindcss`, `zustand`; Zustand ratified as exception per plan's Gate IV Amendment |

All gates pass with Zustand approved. No unresolved NEEDS CLARIFICATION items remain.
