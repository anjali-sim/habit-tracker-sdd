# Data Model: Dark/Light Theme Toggle

**Phase**: 1 — Design
**Date**: 2026-05-25
**Feature**: [spec.md](./spec.md) | [research.md](./research.md) | [plan.md](../008-habit-reminders/plan.md)

---

## New Module: `themeService` — `src/api/themeService.ts`

Owns all reads and writes of the theme preference. Single source of truth for the `hf_theme` localStorage key and for applying the `dark` class to the document root.

```typescript
// Returns the current saved theme. Defaults to 'dark' if absent or invalid.
getTheme(): 'dark' | 'light'

// Writes the theme to localStorage and applies/removes the 'dark' class on <html>.
setTheme(theme: 'dark' | 'light'): void
```

**Implementation notes**:

- `getTheme()` wraps `localStorage.getItem('hf_theme')` in a `try/catch`; returns `'dark'` on any error or invalid value.
- `setTheme()` wraps both `localStorage.setItem` and `document.documentElement.classList.toggle` in a `try/catch`; DOM class is updated even if localStorage write fails.
- File stays under ~25 lines.

---

## New Component: `ThemeToggle` — `src/components/ThemeToggle.tsx`

A single accessible button that displays a sun or moon icon and invokes a toggle callback.

```typescript
interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}
```

**Render logic**:

- `theme === 'dark'` → renders sun icon, `aria-label="Switch to light mode"`
- `theme === 'light'` → renders moon icon, `aria-label="Switch to dark mode"`
- Button sized to minimum 44 × 44 px (constitution Gate III / FR-009).
- Pure presentational — receives all state via props; owns no local state.

---

## Changes to Existing Files

### `index.html` — ADD inline no-flash script

In `<head>`, immediately before the Vite entry `<script>` tag:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem("hf_theme");
      if (t !== "light") document.documentElement.classList.add("dark");
    } catch (_) {}
  })();
</script>
```

- Runs synchronously before first paint — prevents flash of wrong theme (FR-007).
- Applies `dark` class by default (absent/invalid preference = dark, FR-003, FR-008).

### `App.tsx` — ADD nav bar with ThemeToggle

```typescript
// New local state:
const [theme, setTheme] = useState<"dark" | "light">(() => getTheme());

const handleToggle = () => {
  const next: "dark" | "light" = theme === "dark" ? "light" : "dark";
  setTheme(theme, next); // writes localStorage + toggles <html> class
  setTheme(next); // updates React state
};
```

**New JSX structure**:

```tsx
<>
  <nav className="...">
    <ThemeToggle theme={theme} onToggle={handleToggle} />
  </nav>
  <Routes>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/habit/:id" element={<HabitDetailPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</>
```

The nav bar wraps `<Routes>` so the toggle is visible on both pages without duplication.

---

## Storage Schema

| Key        | Type     | Values                | Default                  |
| ---------- | -------- | --------------------- | ------------------------ |
| `hf_theme` | `string` | `'dark'` \| `'light'` | `'dark'` (absent = dark) |

No migration required — this is a new key. Existing `hf_habits`, `hf_completions`, and `hf_order` keys are untouched.

---

## State Transitions

```
Page loads
    │
    ▼
index.html inline script
    reads hf_theme → absent/invalid → adds 'dark' to <html>
                   → 'light'        → does NOT add 'dark' (stays light)
    │
    ▼
React mounts (App.tsx)
    useState initializer calls getTheme() → 'dark' | 'light'
    ThemeToggle renders with correct icon
    │
User clicks ThemeToggle
    │
    ├─ theme was 'dark'  → next = 'light'
    │                    → setTheme('light') removes 'dark' from <html>, writes localStorage
    │                    → setState('light') → re-render → moon icon shown
    │
    └─ theme was 'light' → next = 'dark'
                         → setTheme('dark') adds 'dark' to <html>, writes localStorage
                         → setState('dark') → re-render → sun icon shown
```
