# Quickstart: HabitFlow Frontend

**Date**: 2026-05-22

---

## Prerequisites

- Node.js 20 or later
- npm 9 or later

---

## Install Dependencies

```bash
# From the project root
npm install

# Install Tailwind CSS v4 + Vite plugin
npm install tailwindcss @tailwindcss/vite

# Install React Router v6
npm install react-router-dom

# Install Zustand for state management
npm install zustand

# Type definitions for React Router (already included via @types/react-dom in devDeps)
# No extra @types needed for react-router-dom v6 or zustand
```

---

## Configure Tailwind CSS

**1. Update `vite.config.ts`**:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**2. Replace `src/index.css`**:

```css
@import "tailwindcss";
```

**3. Enable dark mode in `index.html`** — add `class="dark"` to `<html>`:

```html
<html lang="en" class="dark"></html>
```

---

## TypeScript Strict Mode

Verify `tsconfig.app.json` has:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

---

## Create Folder Structure

```bash
mkdir -p src/components src/pages src/store src/api src/types src/utils
```

---

## Run Development Server

```bash
npm run dev
# Opens at http://localhost:5173
```

---

## Build for Production

```bash
npm run build
# Output in dist/
```

---

## Project Folder Reference

```
src/
├── components/   Reusable UI components (HabitCard, Heatmap, Toast, etc.)
├── pages/        Route-level pages (DashboardPage, HabitDetailPage)
├── store/        Application state (habitStore, completionStore)
├── api/          localStorage service layer (habitService, completionService, orderService)
├── types/        Shared TypeScript types (re-exported from index.ts)
└── utils/        Pure utility functions (streak.ts, date.ts, heatmap.ts)
```

---

## Environment Notes

- All data is stored in `localStorage` under `hf_habits`, `hf_completions`, `hf_order`
- No backend, no network requests, no authentication
- To reset all app data during development: `localStorage.clear()` in the browser console
- Drag-and-drop works on desktop browsers only (mouse/trackpad); mobile users can add, edit, delete habits but cannot reorder cards via drag
