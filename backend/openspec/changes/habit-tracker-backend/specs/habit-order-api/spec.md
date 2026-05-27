## ADDED Requirements

### Requirement: A single order document stores the ordered array of habit IDs
The system SHALL maintain exactly one document in an `order` MongoDB collection containing a `habitIds` array of ObjectIds representing the user's desired display sequence. If no document exists, GET SHALL return an empty array.

#### Scenario: Get order when document exists
- **WHEN** a GET request is made to `/api/order` and an order document exists
- **THEN** the response is `{ "order": [habitId1, habitId2, ...] }` with status 200

#### Scenario: Get order when no document exists
- **WHEN** a GET request is made to `/api/order` and no order document exists
- **THEN** the response is `{ "order": [] }` with status 200

### Requirement: The full order can be replaced in one operation
The system SHALL replace the entire `habitIds` array when a PUT request is made to `/api/order` with a new ordered array. If no order document exists, it SHALL be created.

#### Scenario: Set order replaces the full array
- **WHEN** a PUT request is made to `/api/order` with `{ "order": [id1, id2, id3] }`
- **THEN** the order document's `habitIds` is set to `[id1, id2, id3]` and status 200 is returned

### Requirement: A single habit ID can be appended to the order
The system SHALL add a habitId to the end of the `habitIds` array when a POST request is made to `/api/order/append/:habitId`.

#### Scenario: Append adds habitId to end of order
- **WHEN** POST `/api/order/append/:habitId` is called
- **THEN** the habitId is added to the end of the order array and status 200 is returned

#### Scenario: Append creates order document if none exists
- **WHEN** POST `/api/order/append/:habitId` is called with no existing order document
- **THEN** a new order document is created with the single habitId and status 200 is returned

### Requirement: A single habit ID can be removed from the order
The system SHALL remove a habitId from the `habitIds` array when a DELETE request is made to `/api/order/:habitId`.

#### Scenario: Remove pulls habitId from order array
- **WHEN** DELETE `/api/order/:habitId` is called with a habitId present in the array
- **THEN** the habitId is removed from the order array and status 200 is returned

#### Scenario: Remove with non-existent habitId is no-op
- **WHEN** DELETE `/api/order/:habitId` is called with a habitId not in the array
- **THEN** no error is thrown and status 200 is returned
