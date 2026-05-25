# API Service Contract: Theme Service

**Module**: `src/api/themeService.ts`
**Phase**: 1 — Design
**Date**: 2026-05-25
**Feature**: [spec.md](../spec.md) | [data-model.md](../data-model.md)

---

## Purpose

`themeService` is the single point of contact between the application and the `hf_theme` localStorage key. It owns reading, writing, and applying the theme class to the document root. No component manipulates `localStorage` or `document.documentElement.classList` for theme directly.

---

## Exports

### `getTheme(): 'dark' | 'light'`

Returns the user's saved theme preference.

**Returns**: `'dark' | 'light'`

**Behaviour**:

- Reads `localStorage.getItem('hf_theme')`.
- Returns `'light'` only if the stored value is exactly `'light'`.
- Returns `'dark'` for any other value: absent (`null`), unrecognised string, or if `localStorage` throws (e.g., private browsing restrictions).

**Usage**:

```typescript
import { getTheme } from "../api/themeService";

// In App.tsx useState initializer:
const [theme, setTheme] = useState(() => getTheme());
```

---

### `setTheme(theme: 'dark' | 'light'): void`

Persists the theme preference and applies the corresponding class to `<html>`.

**Parameters**:

- `theme` — The theme to activate: `'dark'` or `'light'`.

**Behaviour**:

- Writes `theme` to `localStorage` under key `hf_theme`.
- Calls `document.documentElement.classList.toggle('dark', theme === 'dark')` — adds the class for dark, removes it for light.
- Both operations are wrapped in a `try/catch`; the DOM class update still proceeds even if the `localStorage` write fails.
- No return value; no thrown errors.

**Usage**:

```typescript
import { setTheme } from "../api/themeService";

const handleToggle = () => {
  const next = theme === "dark" ? "light" : "dark";
  setTheme(next); // persists + applies class
  setReactTheme(next); // updates React state to trigger re-render
};
```

---

## Error Handling Policy

| Condition                                                     | Behaviour                                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `localStorage` unavailable (e.g., private browsing)           | `getTheme()` returns `'dark'`; `setTheme()` skips the write but still updates the DOM class |
| Stored value is unrecognised (e.g., `'blue'`)                 | `getTheme()` returns `'dark'`                                                               |
| `document.documentElement` is `null` (SSR / test environment) | `setTheme()` catches the error; no crash                                                    |

---

## What This Module Does NOT Own

- React state — `App.tsx` owns the `useState` call initialized from `getTheme()`.
- The no-flash inline script — that lives in `index.html` and runs before React mounts.
- Rendering the toggle button — owned by `src/components/ThemeToggle.tsx`.
