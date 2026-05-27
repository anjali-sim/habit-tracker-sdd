## Why

The habit tracker frontend is complete but has no backend to persist data. All habits, completions, ordering, and user preferences need to be stored in a database and served through a REST API so the frontend can function beyond a single session.

## What Changes

- Initialize a new Node.js + TypeScript + Express project in the `backend/` workspace
- Connect to MongoDB via Mongoose using environment-based configuration
- Implement 4 REST API modules: Habits, Completions, Habit Order, and Preferences
- Add Zod-based request validation on all write endpoints
- Add global error handling middleware
- Provide `.env.example` documenting all required environment variables

## Capabilities

### New Capabilities

- `habits-api`: Full CRUD for habit documents — create, read, update, delete habits with category, color tag, frequency, reminder time, and hourly target fields
- `completions-api`: Track habit completions with boolean (daily/weekly) and count-based (hourly/monthly) semantics; endpoints for marking done/undone, adding/removing counts, querying by day and month
- `habit-order-api`: Maintain a single ordered array of habit IDs to support drag-and-drop reordering; append, remove, and full-replace operations
- `preferences-api`: Store and retrieve a single preferences document for theme (dark/light)
- `project-setup`: Node.js + TypeScript + Express project scaffolding, MongoDB connection, environment configuration, and error handling middleware

### Modified Capabilities

## Impact

- **New project**: All code is new — no existing backend files modified
- **APIs exposed**: `/api/habits`, `/api/completions`, `/api/order`, `/api/preferences`
- **New dependencies**: `express`, `mongoose`, `dotenv`, `cors`, `zod`, `typescript`, `ts-node-dev`, `@types/express`, `@types/cors`, `@types/node`
- **Environment variables required**: `MONGODB_URI`, `PORT`, `NODE_ENV`, `CORS_ORIGIN`
- **Database**: MongoDB — 4 collections: `habits`, `completions`, `order`, `preferences`
