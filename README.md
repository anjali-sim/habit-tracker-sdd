# HabitFlow

A full-stack habit tracking application built with a modern TypeScript stack. Track daily habits, monitor streaks, reorder habits via drag-and-drop, and toggle between dark and light themes.

**Live App**: [https://habit-tracker-sdd.vercel.app/](https://habit-tracker-sdd.vercel.app/)

---

## Tech Stack

### Frontend

Built with **[Spec Kit](https://github.com/github/spec-kit)** — a specification-driven development workflow that drives feature design, clarification, planning, and implementation from structured specs.

| Technology            | Purpose                 |
| --------------------- | ----------------------- |
| React 19 + TypeScript | UI framework            |
| Vite                  | Build tool & dev server |
| Tailwind CSS v4       | Styling                 |
| Zustand               | State management        |
| React Router v7       | Client-side routing     |

### Backend

Built with **[OpenSpec](https://openspec.dev)** — a spec-driven approach for designing and implementing REST APIs from OpenAPI-style specifications before writing a single line of code.

| Technology          | Purpose           |
| ------------------- | ----------------- |
| Node.js + Express 5 | HTTP server       |
| TypeScript          | Type safety       |
| MongoDB + Mongoose  | Database          |
| Zod                 | Schema validation |

---

## Features

- **Dashboard** — Responsive habit card grid with name, category, colour tag, daily checkbox, and streak count
- **Habit Management** — Create, edit, and delete habits with custom categories and colours
- **Daily Completions** — Mark habits complete each day with per-day toggle support
- **Streak Tracking** — Live current streak and personal-best longest streak per habit
- **Habit Detail Page** — Full history and stats for individual habits
- **Drag-and-Drop Reorder** — Rearrange habit cards with persistent ordering
- **Dark / Light Theme** — System-aware theme toggle with user preference persistence
- **Habit Reminders** — Scheduled reminders for daily habit check-ins

---

## Project Structure

```
habit-tracker/
├── frontend/          # React app (Spec Kit)
│   ├── src/           # Components, pages, store, API clients
│   └── specs/         # Feature specifications (001–008)
└── backend/           # Express API (OpenSpec)
    ├── src/           # Controllers, services, models, routes
    └── openspec/      # API specs and change history
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)

### Backend

```bash
cd backend
npm install
# Create a .env file with your MONGODB_URI and PORT
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# Create a .env file: VITE_API_BASE_URL=http://localhost:5000
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Development Methodology

This project was developed using a **specification-driven development** workflow:

- **Frontend specs** live in `frontend/specs/` — each feature has its own folder with a spec, clarifications, tasks, and implementation checklist, generated and managed by Spec Kit.
- **Backend API specs** live in `backend/openspec/` — each API surface is defined before implementation using OpenSpec, ensuring the contract is established first.
