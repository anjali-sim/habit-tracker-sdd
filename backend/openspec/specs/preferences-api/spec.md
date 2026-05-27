## ADDED Requirements

### Requirement: A single preferences document stores the user's theme

The system SHALL maintain exactly one document in a `preferences` MongoDB collection with a `theme` field (enum: `dark` | `light`, default: `light`). If no document exists, GET SHALL return the default theme.

#### Scenario: Get theme when document exists

- **WHEN** a GET request is made to `/api/preferences/theme` and a preferences document exists
- **THEN** the response is `{ "theme": "dark" | "light" }` with status 200

#### Scenario: Get theme when no document exists returns default

- **WHEN** a GET request is made to `/api/preferences/theme` and no preferences document exists
- **THEN** the response is `{ "theme": "light" }` with status 200

### Requirement: The theme preference can be saved

The system SHALL update the `theme` field using an upsert when a PUT request is made to `/api/preferences/theme`. If no preferences document exists, it SHALL be created.

#### Scenario: Set theme saves the choice

- **WHEN** a PUT request is made to `/api/preferences/theme` with `{ "theme": "dark" }`
- **THEN** the preferences document's `theme` is set to `"dark"` and status 200 is returned

#### Scenario: Set theme with invalid value fails validation

- **WHEN** a PUT request is made to `/api/preferences/theme` with `{ "theme": "blue" }`
- **THEN** the server returns status 400 with a validation error

#### Scenario: Set theme creates document if none exists

- **WHEN** a PUT request is made to `/api/preferences/theme` with no existing preferences document
- **THEN** a new document is created with the provided theme and status 200 is returned
