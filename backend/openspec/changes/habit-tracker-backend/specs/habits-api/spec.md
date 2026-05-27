## ADDED Requirements

### Requirement: Habit document has required and optional fields
The system SHALL store habits in a `habits` MongoDB collection using a Mongoose schema with the following fields:
- `title` (String, required)
- `description` (String, optional)
- `category` (String, required, enum: one of 6 categories)
- `colorTag` (String, required, enum: one of 6 colors)
- `frequency` (String, required, enum: `daily` | `weekly` | `hourly` | `monthly`)
- `reminder` (String, optional, format: `HH:MM`)
- `hourlyTarget` (Number, optional, only meaningful for `hourly` frequency)
- `createdAt` / `updatedAt` (auto-managed by Mongoose timestamps)

#### Scenario: Creating a habit with all required fields
- **WHEN** a POST request is made to `/api/habits` with `title`, `category`, `colorTag`, and `frequency`
- **THEN** a new habit document is created and returned with status 201

#### Scenario: Creating a habit without a required field fails
- **WHEN** a POST request is made to `/api/habits` missing `title`
- **THEN** the server returns status 400 with a validation error message

### Requirement: All habits can be listed
The system SHALL return all habit documents when a GET request is made to `/api/habits`.

#### Scenario: List habits returns array
- **WHEN** a GET request is made to `/api/habits`
- **THEN** the response is a JSON array of all habit documents with status 200

#### Scenario: No habits returns empty array
- **WHEN** no habits exist in the database
- **THEN** GET `/api/habits` returns status 200 with an empty array `[]`

### Requirement: A single habit can be retrieved by ID
The system SHALL return a single habit document by its MongoDB `_id`.

#### Scenario: Get existing habit
- **WHEN** a GET request is made to `/api/habits/:id` with a valid existing ID
- **THEN** the response is the matching habit document with status 200

#### Scenario: Get non-existent habit
- **WHEN** a GET request is made to `/api/habits/:id` with an ID that does not exist
- **THEN** the server returns status 404

### Requirement: A habit can be updated
The system SHALL update a habit document's fields when a PUT request is made to `/api/habits/:id`. Only provided fields SHALL be updated.

#### Scenario: Update habit title
- **WHEN** a PUT request is made to `/api/habits/:id` with `{ "title": "New Title" }`
- **THEN** the habit's title is updated and the updated document is returned with status 200

#### Scenario: Update non-existent habit
- **WHEN** a PUT request is made to `/api/habits/:id` with an ID that does not exist
- **THEN** the server returns status 404

### Requirement: A habit can be deleted
The system SHALL delete a habit document when a DELETE request is made to `/api/habits/:id`.

#### Scenario: Delete existing habit
- **WHEN** a DELETE request is made to `/api/habits/:id` with a valid existing ID
- **THEN** the habit is removed from the database and status 200 is returned

#### Scenario: Delete non-existent habit
- **WHEN** a DELETE request is made to `/api/habits/:id` with an ID that does not exist
- **THEN** the server returns status 404
