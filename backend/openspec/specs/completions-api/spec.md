## ADDED Requirements

### Requirement: Completion document stores habitId, normalized date, and count

The system SHALL store completions in a `completions` MongoDB collection with the following fields:

- `habitId` (ObjectId, required, ref: Habit)
- `date` (Date, required, normalized to `00:00:00.000 UTC` of the target day)
- `count` (Number, required, default: 1)
- `createdAt` (auto-managed)

#### Scenario: Completion date is normalized on write

- **WHEN** a completion is created with any time component in the date
- **THEN** the stored `date` value is set to `00:00:00.000 UTC` of that day

### Requirement: All completions for a habit can be retrieved

The system SHALL return all completion documents for a given habitId when a GET request is made to `/api/completions/:habitId`.

#### Scenario: Get completions for a habit

- **WHEN** a GET request is made to `/api/completions/:habitId`
- **THEN** all completion documents for that habit are returned with status 200

#### Scenario: No completions returns empty array

- **WHEN** no completions exist for the given habitId
- **THEN** the response is status 200 with an empty array `[]`

### Requirement: All completions can be retrieved globally

The system SHALL return all completion documents across all habits when a GET request is made to `/api/completions`.

#### Scenario: Get all completions

- **WHEN** a GET request is made to `/api/completions`
- **THEN** all completion documents are returned with status 200

### Requirement: Check if a habit is done today

The system SHALL return a boolean indicating whether a habit has been completed today when a GET request is made to `/api/completions/:habitId/check`.

#### Scenario: Daily/weekly habit done today

- **WHEN** at least one completion document exists for the habit with today's normalized date
- **THEN** `/api/completions/:habitId/check` returns `{ "done": true }` with status 200

#### Scenario: Daily/weekly habit not done today

- **WHEN** no completion document exists for the habit with today's normalized date
- **THEN** `/api/completions/:habitId/check` returns `{ "done": false }` with status 200

#### Scenario: Hourly habit meets target

- **WHEN** the sum of `count` values for today's completions is greater than or equal to the habit's `hourlyTarget`
- **THEN** `/api/completions/:habitId/check` returns `{ "done": true }` with status 200

#### Scenario: Hourly habit below target

- **WHEN** the sum of `count` values for today's completions is less than the habit's `hourlyTarget`
- **THEN** `/api/completions/:habitId/check` returns `{ "done": false }` with status 200

### Requirement: Mark a habit complete (daily/weekly toggle)

The system SHALL create a completion document with `count: 1` for today when a POST request is made to `/api/completions/:habitId/mark-complete`. If a completion already exists for today, it SHALL be a no-op (idempotent).

#### Scenario: Mark complete for the first time today

- **WHEN** POST `/api/completions/:habitId/mark-complete` is called with no existing completion today
- **THEN** a new completion document is created for today and status 200 is returned

#### Scenario: Mark complete when already done is idempotent

- **WHEN** POST `/api/completions/:habitId/mark-complete` is called when a completion already exists today
- **THEN** no duplicate document is created and status 200 is returned

### Requirement: Mark a habit incomplete (undo daily/weekly completion)

The system SHALL delete the completion document for today when a POST request is made to `/api/completions/:habitId/mark-incomplete`.

#### Scenario: Mark incomplete removes today's completion

- **WHEN** POST `/api/completions/:habitId/mark-incomplete` is called with an existing completion today
- **THEN** the completion document is deleted and status 200 is returned

#### Scenario: Mark incomplete with no completion is no-op

- **WHEN** POST `/api/completions/:habitId/mark-incomplete` is called with no existing completion today
- **THEN** no error is thrown and status 200 is returned

### Requirement: Add one completion count (hourly/monthly)

The system SHALL create a new completion document with `count: 1` for today when a POST request is made to `/api/completions/:habitId/add`.

#### Scenario: Add count creates a new document

- **WHEN** POST `/api/completions/:habitId/add` is called
- **THEN** a new completion document with `count: 1` and today's normalized date is created, and status 200 is returned

### Requirement: Remove the last completion count (hourly/monthly)

The system SHALL delete the most recently created completion document for today when a POST request is made to `/api/completions/:habitId/remove-last`.

#### Scenario: Remove last deletes most recent completion

- **WHEN** POST `/api/completions/:habitId/remove-last` is called with at least one completion today
- **THEN** the completion document with the latest `createdAt` for today is deleted and status 200 is returned

#### Scenario: Remove last with no completions today is no-op

- **WHEN** POST `/api/completions/:habitId/remove-last` is called with no completions today
- **THEN** no error is thrown and status 200 is returned

### Requirement: Get total completion count for a specific day

The system SHALL return the sum of all `count` values for a habit on a given date when a GET request is made to `/api/completions/:habitId/count-day`.

#### Scenario: Count by day returns sum

- **WHEN** GET `/api/completions/:habitId/count-day?date=YYYY-MM-DD` is called
- **THEN** the response is `{ "count": <sum> }` with status 200

#### Scenario: Count by day with no completions returns zero

- **WHEN** no completions exist for the habit on the given date
- **THEN** the response is `{ "count": 0 }` with status 200

### Requirement: Get total completion count for a given month

The system SHALL return the sum of all `count` values for a habit within a given calendar month when a GET request is made to `/api/completions/:habitId/count-month`.

#### Scenario: Count by month returns sum

- **WHEN** GET `/api/completions/:habitId/count-month?year=YYYY&month=MM` is called
- **THEN** the response is `{ "count": <sum> }` with status 200

### Requirement: All completions for a habit can be deleted

The system SHALL delete all completion documents for a given habitId when a DELETE request is made to `/api/completions/:habitId`.

#### Scenario: Delete all completions clears history

- **WHEN** DELETE `/api/completions/:habitId` is called
- **THEN** all completion documents for that habit are removed and status 200 is returned
