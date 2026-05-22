# Feature Specification: HabitFlow Habit Management

**Feature Branch**: `002-habit-management`

**Created**: 2026-05-22

**Status**: Draft

**Input**: User description: "habit management - clicking 'Add Habit' opens a modal form with fields: habit name, category (Health, Work, Personal, Fitness), color tag picker (6 color options), and frequency (daily/weekly). Editing opens same modal pre-filled. Deleting shows a confirmation prompt before removing."

## Clarifications

### Session 2026-05-22

- Q: When the Add Habit modal opens, are category, colour, and frequency required fields and do they have pre-selected defaults? → A: Required with defaults — category defaults to 'Health', frequency defaults to 'Daily', and the first colour is pre-selected; all three are required and cannot be submitted as blank.
- Q: What should happen if saving a new or edited habit fails? → A: Modal stays open with error — the modal remains open, the user's input is preserved, and an error message is displayed prompting them to retry.
- Q: What form should the delete confirmation take? → A: Modal dialog — a dedicated modal overlay showing the habit name with explicit Confirm and Cancel buttons.
- Q: Can a user create two habits with the same name? → A: Names must be unique — case-insensitive uniqueness enforced; an error is shown if a duplicate name is detected on submission.
- Q: Should the habit modal be keyboard-navigable and screen-reader compatible? → A: Full modal accessibility — focus trap while open, Escape to dismiss, ARIA role and label, all controls keyboard-operable.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Add a New Habit (Priority: P1)

A user wants to start tracking a new habit. They click the "Add Habit" button on the dashboard and a modal form appears. They fill in the habit name, choose a category from a predefined list, pick a colour tag, and set how often they intend to do the habit. On submitting, the new habit appears on the dashboard.

**Why this priority**: Creating habits is the foundational action of the entire app — without it, no other features (dashboard, streaks, check-ins) can function. This is the entry point for all user value.

**Independent Test**: Can be tested independently by clicking "Add Habit", completing the form with valid data, and confirming the new habit card appears in the dashboard grid. Delivers a fully usable add-habit experience.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard, **When** they click "Add Habit", **Then** a modal form opens containing fields for habit name, category, colour tag, and frequency.
2. **Given** the modal is open, **When** the user fills in all fields and submits, **Then** the modal closes and the new habit appears on the dashboard.
3. **Given** the modal is open with all fields filled, **When** the user submits, **Then** the habit is saved and persisted (present after a page refresh).
4. **Given** the modal is open, **When** the user clicks Cancel or dismisses the modal (e.g., pressing Escape or clicking outside), **Then** the modal closes without saving any data.
5. **Given** the user submits the form with the habit name left blank, **When** the form validates, **Then** an error message is shown on the name field and the form is not submitted.
6. **Given** the Add Habit modal opens for a new habit, **When** the user views the form without touching any selector, **Then** category is pre-selected to 'Health', frequency is pre-selected to 'Daily', and the first colour option is pre-selected.
7. **Given** a habit named 'Morning Run' already exists, **When** the user submits a new habit with the name 'morning run' (any casing), **Then** a validation error is shown on the name field indicating the name is already in use and the form is not submitted.

---

### User Story 2 - Edit an Existing Habit (Priority: P2)

A user wants to update the details of an existing habit — perhaps changing its name, category, colour, or frequency. They trigger the edit action on the habit card. The same modal form opens, already populated with the habit's current values. They make their changes and save.

**Why this priority**: Habits evolve over time. Users must be able to correct mistakes or update habits without deleting and recreating them. This is essential for a trustworthy habit management experience.

**Independent Test**: Can be tested independently by editing any existing habit — verifying the modal pre-fills correctly and that saved changes are reflected on the dashboard card.

**Acceptance Scenarios**:

1. **Given** a habit card is displayed on the dashboard, **When** the user triggers the edit action on that card, **Then** the modal form opens with all fields pre-filled with the habit's current values.
2. **Given** the edit modal is open, **When** the user changes one or more fields and saves, **Then** the modal closes and the habit card on the dashboard reflects the updated values.
3. **Given** the edit modal is open, **When** the user saves without changing anything, **Then** the habit is unchanged and the modal closes normally.
4. **Given** the edit modal is open, **When** the user clears the habit name and tries to save, **Then** a validation error is shown and the form is not submitted.
5. **Given** the edit modal is open, **When** the user cancels or dismisses the modal, **Then** the habit retains its original values with no changes applied.

---

### User Story 3 - Delete a Habit (Priority: P3)

A user decides they no longer want to track a habit and chooses to delete it. Before the deletion is finalised, a confirmation prompt appears asking the user to confirm their intent. Only upon confirmation is the habit permanently removed.

**Why this priority**: Deletion is irreversible and destructive. A confirmation step prevents accidental data loss, protecting users from losing streaks and history they care about.

**Independent Test**: Can be tested independently by triggering the delete action on any habit card — verifying the confirmation prompt appears and that confirming removes the habit while cancelling does not.

**Acceptance Scenarios**:

1. **Given** a habit card is displayed, **When** the user triggers the delete action, **Then** a confirmation modal opens displaying the habit's name and asking the user to confirm the deletion, with explicit Confirm and Cancel buttons.
2. **Given** the confirmation prompt is shown, **When** the user confirms the deletion, **Then** the habit is permanently removed and its card no longer appears on the dashboard.
3. **Given** the confirmation prompt is shown, **When** the user cancels or dismisses the prompt, **Then** the habit is not deleted and the dashboard remains unchanged.
4. **Given** the confirmation prompt is shown, **When** the user confirms, **Then** any streak and completion history associated with the habit is also removed.

---

### Edge Cases

- What if the user submits the habit form with only whitespace in the name field? Whitespace-only names should fail validation, same as a blank name.
- What if the user rapidly double-clicks the submit button? The form should guard against duplicate submissions — only one habit should be created.
- What if a habit has a very long name? The form field should enforce a reasonable character limit (e.g., 100 characters) to prevent display issues on cards.
- What if all 6 colour options are already in use by existing habits? The colour picker still shows all 6 options; colours are not unique per habit and may be reused.
- What happens to a habit's streak and history when it is edited (e.g., frequency changed from daily to weekly)? Historical completion data is preserved; streak recalculation is handled by the data layer.
- What if the modal is opened and the device loses connectivity before submission? The user receives an error message and the form data is preserved so they can retry.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The dashboard MUST provide an "Add Habit" control that, when activated, opens a modal form for creating a new habit.
- **FR-002**: The habit modal form MUST include a text input field for the habit name.
- **FR-003**: The habit name field MUST be required — the form MUST NOT submit if this field is empty or contains only whitespace.
- **FR-004**: The habit name field MUST enforce a maximum length of 100 characters.
- **FR-005**: The habit modal form MUST include a category selector with exactly four options: Health, Work, Personal, and Fitness. When opening for a new habit, the selector MUST default to 'Health'. The category field is required — the form MUST NOT submit without a category selected.
- **FR-006**: The habit modal form MUST include a colour tag picker presenting exactly six colour options. When opening for a new habit, the first colour option MUST be pre-selected. The colour field is required — the form MUST NOT submit without a colour selected.
- **FR-007**: The habit modal form MUST include a frequency selector with exactly two options: Daily and Weekly. When opening for a new habit, the selector MUST default to 'Daily'. The frequency field is required — the form MUST NOT submit without a frequency selected.
- **FR-008**: The habit modal form MUST provide a way to submit (save) and a way to cancel/dismiss without saving.
- **FR-009**: On successful submission of a new habit, the modal MUST close and the new habit MUST appear on the dashboard immediately without a full page reload.
- **FR-010**: Each habit card on the dashboard MUST provide an edit action that opens the habit modal pre-filled with that habit's current name, category, colour tag, and frequency.
- **FR-011**: On successful submission of an edited habit, the modal MUST close and the habit card MUST reflect the updated values immediately.
- **FR-012**: Each habit card on the dashboard MUST provide a delete action.
- **FR-013**: Activating the delete action MUST open a confirmation modal displaying the name of the habit to be deleted and offering two explicit controls: one to confirm the deletion and one to cancel it.
- **FR-014**: The habit MUST only be permanently deleted after the user explicitly confirms the deletion in the confirmation prompt.
- **FR-015**: Cancelling or dismissing the confirmation prompt MUST leave the habit completely unchanged.
- **FR-016**: The form MUST prevent duplicate submissions (e.g., by disabling the submit control after the first activation).
- **FR-017**: If saving a new or edited habit fails, the modal MUST remain open, all user-entered values MUST be preserved, and an inline error message MUST be displayed informing the user that the save failed and prompting them to retry.
- **FR-018**: Habit names MUST be unique across all of the user's habits, compared case-insensitively. On submission, the form MUST check for a name conflict and display a validation error on the name field if a duplicate is found. When editing an existing habit, the uniqueness check MUST exclude that habit's own current name so an unchanged name does not trigger a false conflict.
- **FR-019**: The habit modal (both the form modal and the delete confirmation modal) MUST be fully keyboard-accessible: keyboard focus MUST move into the modal when it opens, focus MUST be trapped within the modal while it is open, the Escape key MUST dismiss the modal (equivalent to Cancel), and all interactive controls MUST be operable via keyboard. The modal MUST have an appropriate ARIA role and accessible label so screen readers announce its purpose when it opens.

### Key Entities

- **Habit**: The core data object a user creates and manages. User-facing attributes: name (text, required, max 100 chars, must be unique case-insensitively across all habits), category (one of: Health, Work, Personal, Fitness), colour tag (one of 6 options), frequency (Daily or Weekly).
- **Habit Modal**: The shared form UI used for both creating and editing habits. Behaviour differs by context: empty for creation, pre-filled for editing.
- **Confirmation Modal**: A dedicated modal overlay shown before any deletion is processed. Displays the name of the habit to be deleted and provides explicit Confirm and Cancel controls. Requires active user confirmation before the deletion proceeds.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a new habit in under 60 seconds from clicking "Add Habit" to seeing the new card on the dashboard.
- **SC-002**: Users can edit an existing habit in under 30 seconds — the pre-filled modal removes the need to re-enter unchanged fields.
- **SC-003**: Zero habits are deleted without explicit user confirmation — the confirmation prompt is shown 100% of the time before any deletion is processed.
- **SC-004**: Form validation catches all invalid submissions (blank name, whitespace-only name) and provides a clear error message without losing the user's other entered data.
- **SC-005**: The modal opens and is fully interactive within 500 milliseconds of the triggering action.
- **SC-006**: 95% of usability test participants can successfully add, edit, and delete a habit without guidance.
- **SC-007**: No duplicate habits are created from double-tap or rapid repeated submissions.

## Assumptions

- The "Add Habit" trigger control exists on the dashboard page (established in the Dashboard Page spec); this spec defines the modal and management behaviour, not the placement of the trigger.
- The four category options (Health, Work, Personal, Fitness) are fixed for this version; dynamic or user-defined categories are out of scope.
- The six colour options in the colour picker are predefined by the design; the specific colour values are a design-time decision, not a requirement of this spec.
- Frequency selection (Daily / Weekly) determines how the app tracks completion and streaks; the exact calculation logic is handled by the data layer and is out of scope for this spec.
- Habit creation and editing do not require a separate confirmation step — only deletion does.
- Existing completion history and streak data are preserved when a habit is edited; this spec does not require streak recalculation on frequency change.
- Bulk creation, import, or templated habits are out of scope for this feature.
