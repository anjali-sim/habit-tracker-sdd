## 1. Project Scaffolding

- [x] 1.1 Initialize Node.js project with `npm init -y` and install all dependencies (`express`, `mongoose`, `dotenv`, `cors`, `zod`)
- [x] 1.2 Install dev dependencies (`typescript`, `ts-node-dev`, `@types/express`, `@types/cors`, `@types/node`)
- [x] 1.3 Create `tsconfig.json` with strict mode, `target: ES2020`, `module: commonjs`, `outDir: dist`, `rootDir: src`
- [x] 1.4 Add `scripts` to `package.json`: `"dev": "ts-node-dev --respawn src/server.ts"`, `"build": "tsc"`, `"start": "node dist/server.js"`
- [x] 1.5 Create `.env` file with `MONGODB_URI`, `PORT=5000`, `NODE_ENV=development`, `CORS_ORIGIN=http://localhost:3000`
- [x] 1.6 Create `.env.example` with the same four keys but no values
- [x] 1.7 Add `.env` to `.gitignore`

## 2. Project Structure

- [x] 2.1 Create `src/` directory with subdirectories: `config/`, `habits/`, `completions/`, `order/`, `preferences/`, `middleware/`
- [x] 2.2 Create `src/server.ts` — imports app, connects to MongoDB via `config/db.ts`, starts listening on PORT
- [x] 2.3 Create `src/app.ts` — creates Express app, registers `cors`, `express.json()`, mounts all four routers, registers error handler

## 3. Database Configuration

- [x] 3.1 Create `src/config/db.ts` — exports a `connectDB()` function using `mongoose.connect(process.env.MONGODB_URI)` with error handling that exits the process on failure

## 4. Error Handler Middleware

- [x] 4.1 Create `src/middleware/errorHandler.ts` — Express error handler that catches Zod errors (returns 400) and all other errors (returns 500) as JSON `{ message: string }`

## 5. Habits Module

- [x] 5.1 Create `src/habits/habit.model.ts` — Mongoose schema with fields: `title` (required), `description`, `category` (enum), `colorTag` (enum), `frequency` (enum: daily/weekly/hourly/monthly), `reminder` (HH:MM string), `hourlyTarget` (number), timestamps enabled
- [x] 5.2 Create `src/habits/habit.service.ts` — functions: `getAllHabits`, `getHabitById`, `createHabit`, `updateHabit`, `deleteHabit`
- [x] 5.3 Create `src/habits/habit.controller.ts` — Express request handlers calling habit service functions, passing errors to `next()`
- [x] 5.4 Create `src/habits/habit.routes.ts` — register routes: `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`

## 6. Completions Module

- [x] 6.1 Create `src/completions/completion.model.ts` — Mongoose schema with fields: `habitId` (ObjectId ref Habit, required), `date` (Date, required), `count` (Number, default 1), `createdAt` timestamp
- [x] 6.2 Create `src/completions/completion.service.ts` — functions: `getAllCompletions`, `getCompletionsByHabit`, `checkToday`, `markComplete`, `markIncomplete`, `addCount`, `removeLastCount`, `countByDay`, `countByMonth`, `deleteAllForHabit`; include date normalization helper (`toUTCMidnight`)
- [x] 6.3 Create `src/completions/completion.controller.ts` — Express handlers for all 10 completion operations
- [x] 6.4 Create `src/completions/completion.routes.ts` — register all routes: `GET /`, `GET /:habitId`, `GET /:habitId/check`, `POST /:habitId/mark-complete`, `POST /:habitId/mark-incomplete`, `POST /:habitId/add`, `POST /:habitId/remove-last`, `GET /:habitId/count-day`, `GET /:habitId/count-month`, `DELETE /:habitId`

## 7. Habit Order Module

- [x] 7.1 Create `src/order/order.model.ts` — Mongoose schema with single field: `habitIds` (array of ObjectId refs)
- [x] 7.2 Create `src/order/order.service.ts` — functions: `getOrder`, `setOrder`, `appendToOrder`, `removeFromOrder`; `getOrder` returns empty array if no document exists
- [x] 7.3 Create `src/order/order.controller.ts` — Express handlers for get, set, append, and remove operations
- [x] 7.4 Create `src/order/order.routes.ts` — register routes: `GET /`, `PUT /`, `POST /append/:habitId`, `DELETE /:habitId`

## 8. Preferences Module

- [x] 8.1 Create `src/preferences/preferences.model.ts` — Mongoose schema with field: `theme` (enum: `dark` | `light`, default: `light`)
- [x] 8.2 Create `src/preferences/preferences.service.ts` — functions: `getTheme` (returns default `light` if no document), `setTheme` (upsert)
- [x] 8.3 Create `src/preferences/preferences.controller.ts` — Express handlers for get and set theme
- [x] 8.4 Create `src/preferences/preferences.routes.ts` — register routes: `GET /theme`, `PUT /theme`

## 9. Zod Validation

- [x] 9.1 Add Zod schema for habit create/update request body in `habit.routes.ts` or a separate `habit.schema.ts` — validate `title`, `category`, `colorTag`, `frequency`, `reminder`, `hourlyTarget`
- [x] 9.2 Add Zod schema for completion `add` and `mark-complete` request bodies (if body params are used)
- [x] 9.3 Add Zod schema for order `setOrder` body — validate that `order` is an array of strings
- [x] 9.4 Add Zod schema for preferences `setTheme` body — validate `theme` is `"dark"` or `"light"`

## 10. Route Mounting & Final Wiring

- [x] 10.1 Mount habit router at `/api/habits` in `app.ts`
- [x] 10.2 Mount completions router at `/api/completions` in `app.ts`
- [x] 10.3 Mount order router at `/api/order` in `app.ts`
- [x] 10.4 Mount preferences router at `/api/preferences` in `app.ts`
- [x] 10.5 Register `errorHandler` as the last middleware in `app.ts`

## 11. Verification

- [ ] 11.1 Run `npm run dev` and confirm server starts on port 5000 and MongoDB connects
- [ ] 11.2 Test habit CRUD endpoints manually (create, list, get, update, delete)
- [ ] 11.3 Test completion endpoints: mark-complete, check, add count, count-day, remove-last
- [ ] 11.4 Test order endpoints: append, get, set, remove
- [ ] 11.5 Test preferences endpoints: set theme to dark, get theme
- [ ] 11.6 Confirm validation errors return 400 for invalid request bodies
- [x] 11.7 Run `npm run build` and confirm TypeScript compiles without errors
