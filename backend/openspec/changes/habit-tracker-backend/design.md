## Context

The habit tracker frontend is a complete single-page application that expects a REST API backend. There is currently no backend — the frontend is either using localStorage or no persistence. This design covers building the Node.js + TypeScript + Express backend from scratch, connecting it to MongoDB, and implementing all four API modules (Habits, Completions, Habit Order, Preferences) as explored.

## Goals / Non-Goals

**Goals:**

- Scaffold a production-ready TypeScript + Express project structure
- Connect to MongoDB via Mongoose with environment-based config
- Implement all 22 endpoints across 4 modules matching the frontend's API contract exactly
- Use Zod for request body validation on all write operations
- Use a feature-based folder structure for maintainability
- Provide `.env` and `.env.example` for environment configuration

**Non-Goals:**

- User authentication / multi-user support (single-user app for now)
- Streak calculation endpoints (not in the frontend's API contract)
- Push notification delivery for reminders (frontend handles reminder display; backend only stores the time string)
- Pagination on list endpoints (habit counts are small)
- Rate limiting or advanced security hardening

## Decisions

### 1. Framework: Express over Fastify or Hono

Express is the most battle-tested choice with the widest ecosystem and TypeScript support. The app is not performance-critical. Fastify would be overkill; Hono is newer with less community precedent.

### 2. ODM: Mongoose over native MongoDB driver

Mongoose provides schema enforcement, TypeScript type generation via `mongoose.InferSchemaType`, and middleware hooks. The schema validation layer is worth the abstraction for a data-model-heavy app like this.

### 3. Completion document model: Unified with `count` field

Rather than separate collections for boolean and count-based completions, a single `completions` collection with a `count: Number` field handles both:

- Daily/weekly: `count = 1` means done, absent/0 means not done
- Hourly/monthly: `count` is the actual accumulated count (each `add` call creates one doc with `count: 1`; aggregation sums them)

Alternatives considered: Two separate collections (`BooleanCompletions`, `CountCompletions`) — rejected because it doubles the collection surface and complicates routing without meaningful benefit.

### 4. Each `add` creates a new document (count=1), not incrementing existing

This keeps completion records immutable and auditable. `count-day` and `count-month` sum `count` across all documents for that habit+period. `remove-last` deletes the most recently created document.

Alternatives considered: Incrementing a single document's `count` field — rejected because it makes `remove-last` ambiguous (decrement vs delete) and loses the timestamp trail.

### 5. Habit Order: Single document with array field

One `order` document holds `habitIds: [ObjectId]`. Reorder = replace array. Append = `$push`. Remove = `$pull`. This avoids touching N habit documents on every drag-drop reorder.

Alternatives considered: `order: Number` field on each Habit — rejected because bulk reorders require N writes instead of 1.

### 6. Preferences: Single document, upsert on PUT

One `preferences` document. `GET` returns it (with a default if missing). `PUT` uses `findOneAndUpdate` with `upsert: true`. No ID needed in the URL — there's only ever one.

### 7. Validation: Zod over Joi or class-validator

Zod is TypeScript-first — schema types can be inferred directly as TypeScript types, eliminating duplication between runtime validation and compile-time types. Joi requires separate type definitions; class-validator requires decorators and is coupled to class syntax.

### 8. Folder structure: Feature-based

Each module (`habits/`, `completions/`, `order/`, `preferences/`) contains its own model, service, controller, and routes. Cross-cutting concerns (`config/`, `middleware/`) live at the top level.

```
src/
├── config/
│   └── db.ts
├── habits/
│   ├── habit.model.ts
│   ├── habit.service.ts
│   ├── habit.controller.ts
│   └── habit.routes.ts
├── completions/
│   ├── completion.model.ts
│   ├── completion.service.ts
│   ├── completion.controller.ts
│   └── completion.routes.ts
├── order/
│   ├── order.model.ts
│   ├── order.service.ts
│   ├── order.controller.ts
│   └── order.routes.ts
├── preferences/
│   ├── preferences.model.ts
│   ├── preferences.service.ts
│   ├── preferences.controller.ts
│   └── preferences.routes.ts
├── middleware/
│   └── errorHandler.ts
├── app.ts
└── server.ts
```

### 9. Date normalization: UTC midnight

All completion dates are normalized to `00:00:00.000 UTC` before storing. This ensures `count-day` queries work correctly regardless of the client's timezone. The `check` endpoint compares against today's UTC midnight.

### 10. `check` endpoint semantics

- Daily/weekly habits: returns `true` if any completion document exists for today (count sum >= 1)
- Hourly habits: returns `true` if sum of today's `count` values >= `hourlyTarget` on the Habit
- Monthly habits: treated same as count-based (any completion = done)

## Risks / Trade-offs

- **No auth means no data isolation** → Acceptable for a personal single-user tool; `userId` fields can be added later without breaking the schema
- **Completion date normalization to UTC** → If frontend users are in non-UTC timezones, "today's" completions may straddle midnight unexpectedly → Mitigation: document this clearly; can add timezone support later via a query param
- **Single order/preferences document** → Works perfectly for single-user; will need a `userId` field when multi-user is added → Mitigation: `upsert` pattern is already multi-user-ready by adding a `userId` filter
- **No pagination on completions** → For a personal habit tracker, months/years of data are manageable. If history grows large, `GET /api/completions` (all) could become slow → Mitigation: `GET /api/completions` should accept optional `?habitId` and `?date` query params to filter at the DB level

## Open Questions

- Should `GET /api/completions` support query params (`?habitId`, `?from`, `?to`) for filtering, or is the frontend always using the per-habit endpoint?
- What are the 6 exact category names and 6 color tag values expected by the frontend? (Backend should enforce the same enum values.)
