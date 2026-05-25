# Quickstart: Dark/Light Theme Toggle

**Phase**: 1 — Design
**Date**: 2026-05-25
**Feature**: [spec.md](./spec.md) | [plan.md](../008-habit-reminders/plan.md) | [data-model.md](./data-model.md)

---

## What Is Being Built

A sun/moon toggle button in the app's top nav bar. Switches the entire app between dark and light mode. Preference persists to `localStorage` and is applied before first paint to prevent a flash of the wrong theme. No new npm packages.

---

## Files to Create

### 1. `src/api/themeService.ts` — NEW

```typescript
const KEY = "hf_theme";

export function getTheme(): "dark" | "light" {
  try {
    return localStorage.getItem(KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function setTheme(theme: "dark" | "light"): void {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore write failure */
  }
  try {
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {
    /* ignore in non-browser environments */
  }
}
```

### 2. `src/components/ThemeToggle.tsx` — NEW

```tsx
interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="min-w-[44px] min-h-[44px] flex items-center justify-center
                 rounded-full text-xl
                 text-yellow-400 dark:text-yellow-300
                 hover:bg-white/10 transition-colors"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
```

---

## Files to Modify

### 3. `index.html` — ADD no-flash inline script

Insert inside `<head>`, **before** the `<script type="module">` Vite entry tag:

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

### 4. `src/App.tsx` — ADD nav bar with ThemeToggle

```tsx
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import HabitDetailPage from "./pages/HabitDetailPage";
import ThemeToggle from "./components/ThemeToggle";
import { getTheme, setTheme } from "./api/themeService";

function App() {
  const [theme, setReactTheme] = useState<"dark" | "light">(() => getTheme());

  const handleToggle = () => {
    const next: "dark" | "light" = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setReactTheme(next);
  };

  return (
    <>
      <nav
        className="flex items-center justify-end px-4 py-2
                       bg-white dark:bg-gray-900 border-b
                       border-gray-200 dark:border-gray-700"
      >
        <ThemeToggle theme={theme} onToggle={handleToggle} />
      </nav>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/habit/:id" element={<HabitDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
```

---

## Tailwind Config Verification

Ensure `tailwind.config.js` (or `vite.config.ts` plugin options) has:

```js
darkMode: "class";
```

If `darkMode` is not set to `'class'`, the `dark:` utilities will not respond to the `<html class="dark">` toggle and must be updated before implementation.

---

## Key Constraints Reminder

- The inline `<script>` in `index.html` MUST precede the Vite `<script type="module">` entry — order matters for no-flash guarantee.
- `setTheme()` updates the DOM class AND `localStorage`; `setReactTheme()` updates React state. Both calls are needed on every toggle.
- `ThemeToggle` is purely presentational — it receives `theme` and `onToggle` as props; it owns no internal state.
- The `aria-label` on the toggle button MUST describe the resulting action ("Switch to light mode") not the current state, so screen-reader users know what clicking will do (FR-009).
- All new files < 200 lines (constitution Gate I).
