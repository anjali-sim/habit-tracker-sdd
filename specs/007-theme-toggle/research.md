# Research: Dark/Light Theme Toggle

**Phase**: 0 — Unknowns resolved before design
**Date**: 2026-05-25
**Feature**: [spec.md](./spec.md) | [plan.md](../008-habit-reminders/plan.md)

---

## 1. No-Flash Theme Application on Page Load

**Decision**: Apply the saved theme class via a tiny inline `<script>` in `index.html`'s `<head>`, executed synchronously before any React render.

**Pattern**:

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

- Runs before the browser paints any content — prevents the flash of wrong theme (FR-007, SC-002).
- Wraps in `try/catch` to handle private-browsing `localStorage` restrictions gracefully (FR-008).
- Default is dark: if `hf_theme` is absent, `null`, or invalid, the `dark` class is added (FR-003).

**Rationale**: This is the only reliable cross-browser technique for zero-flash theme init in a Vite/React SPA. CSS-only approaches (prefers-color-scheme) don't honour a saved user override. A `useLayoutEffect` fires too late — the browser already painted once.

**Alternatives considered**:

- `useLayoutEffect` in React: Still after first paint; causes a one-frame flash. Rejected.
- CSS `prefers-color-scheme` only: Ignores saved user preference. Rejected.
- Server-side rendering cookie: No server exists; this is a pure SPA. Rejected.

---

## 2. Theme State Management in React

**Decision**: Manage theme as local React state in `App.tsx` using `useState`, initialized from `themeService.getTheme()`. Pass `toggle` down to `ThemeToggle` as a prop.

**Rationale**:

- Theme is a single boolean-equivalent value (`'dark' | 'light'`). React Context or a store would be over-engineered for propagating one value to one component.
- `ThemeToggle` is the only consumer; `App.tsx` → `ThemeToggle` prop is the shortest path.
- The inline `<script>` in `index.html` already handles the DOM class on load; React state initialization reads the same `localStorage` value to stay in sync.

**Alternatives considered**:

- React Context + ThemeProvider: Adds indirection for a single consumer. Rejected.
- Zustand store: Over-engineered for one boolean state. Rejected.
- Module-level mutable variable: Not reactive — toggle wouldn't re-render `ThemeToggle`. Rejected.

---

## 3. Tailwind Dark Mode Strategy — Class-Based

**Decision**: Use Tailwind's `class` dark-mode strategy (`darkMode: 'class'` in `tailwind.config`). Toggle the `dark` class on `<html>` (the root element) via `document.documentElement.classList`.

**Rationale**: The existing codebase already uses `dark:` utility classes throughout (per the constitution). Tailwind's class strategy requires a `dark` class on a root ancestor; `<html>` is the standard target. This approach is fully compatible with the no-flash inline script (both read/write the same class on the same element).

**Verification**: `tailwind.config.js` / `vite.config.ts` must have `darkMode: 'class'` — this should be confirmed during implementation.

**Alternatives considered**:

- `data-theme` attribute: Non-standard with Tailwind; requires custom CSS. Rejected.
- `darkMode: 'media'`: Ignores user's saved preference. Rejected.

---

## 4. ThemeToggle Icon — Sun vs Moon

**Decision**: Display a **sun icon** (☀) when the current theme is **dark** (invite the user to switch to light), and a **moon icon** (🌙) when the current theme is **light** (invite to switch to dark). Use Unicode/SVG characters — no icon library.

**Rationale**:

- This is the conventional pattern (sun = daytime = light; moon = nighttime = dark).
- Inline SVG or Unicode avoids any new library (constitution Gate IV).
- Accessible label must describe the action: `aria-label="Switch to light mode"` / `"Switch to dark mode"` (FR-009).

---

## 5. localStorage Key and Fallback

**Decision**: Use `hf_theme` as the storage key (consistent with the app's `hf_` namespace). Valid values: `'dark'` and `'light'`. Any other value (absent, `null`, corrupted) falls back to `'dark'`.

**Rationale**: Consistent key naming. Defensive fallback matches FR-003 (default dark) and FR-008 (silent fallback).

---

## Summary Table

| Question           | Decision                                       | Rationale                                     |
| ------------------ | ---------------------------------------------- | --------------------------------------------- |
| No-flash technique | Inline `<script>` in `index.html` `<head>`     | Only reliable zero-flash method in a Vite SPA |
| React state        | `useState` in `App.tsx`, prop to `ThemeToggle` | Single consumer; no context needed            |
| Tailwind strategy  | `darkMode: 'class'` on `<html>`                | Matches existing `dark:` classes in codebase  |
| Toggle icon        | Sun in dark mode, moon in light mode           | Standard convention; Unicode, no library      |
| Storage key        | `hf_theme` (`'dark'` / `'light'`)              | Consistent `hf_` namespace; dark default      |
