# Feature Specification: HabitFlow Habit Detail Page

**Feature Branch**: `005-habit-detail-page`

**Created**: 2026-05-22

**Status**: Draft

**Input**: User description: "habit detail page - clicking a habit name opens a detail page showing habit name, category, color tag, current streak, longest streak, and a GitHub-style heatmap of last 365 days. Completed days shown in habit's color tag, missed days in muted tone, future days empty. Include back button to dashboard. No chart libraries — pure CSS grid."

## Clarifications

### Session 2026-05-22

- Q: How should the 365-cell heatmap be handled for screen reader accessibility? → A: Summary label — the heatmap container has a single ARIA label summarising total completed days (e.g., "Completion history: X of 365 days completed"); individual cells are hidden from the accessibility tree.
- Q: Should the detail page show a loading/skeleton state while data loads? → A: Yes — render a skeleton layout while habit data and completion history are read, consistent with the dashboard skeleton loading pattern.
- Q: What should happen when the detail page is opened for a habit that no longer exists? → A: Graceful not-found message — display a clear "Habit not found" message with a link/button back to the dashboard; no crash or blank page.
- Q: What should happen if the data store fails to return habit data on the detail page? → A: Inline error state with retry — replace skeleton/content with an error message and a retry button, consistent with the dashboard's error handling pattern.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Navigate to and View Habit Detail (Priority: P1)

A user is on the dashboard and wants to see a full history of how consistently they have been keeping a particular habit. They click the habit's name on its card. A detail page opens showing the habit's name, category, colour tag, current streak, and longest streak — plus a heatmap grid of the last 365 days of completion history.

**Why this priority**: The detail page is the primary historical view in the app. It delivers on the promise of streak tracking by giving users a visual record of their consistency over the past year. Without it, streaks are numbers without context.

**Independent Test**: Can be tested independently by navigating from the dashboard to a habit detail page for a habit with known completion history and verifying all information elements are present and accurate.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard, **When** they click a habit's name, **Then** the detail page for that habit opens.
2. **Given** the detail page is open, **When** the user reads the page, **Then** the habit name, category, and colour tag are displayed.
3. **Given** the detail page is open, **When** the user reads the page, **Then** the current streak and longest streak are displayed in the same icon and format as on the dashboard card (flame icon + "N day(s)"; trophy/star icon + "N day(s)").
4. **Given** the detail page is open, **When** the user views the heatmap, **Then** a grid of day cells representing the last 365 calendar days is visible.
5. **Given** the detail page is open, **When** the user reads the heatmap column headers, **Then** month labels are visible so they can orientate themselves within the year.

---

### User Story 2 - Read Completion History from the Heatmap (Priority: P2)

A user glances at the heatmap and immediately understands their completion pattern across the past year. Cells for days they completed the habit are filled in the habit's own colour, making strong periods visually obvious. Missed days appear in a muted tone. Days that haven't happened yet are empty, so the heatmap never shows phantom data.

**Why this priority**: The heatmap is the visual centrepiece of the detail page. Its colour coding must be unambiguous so users can self-evaluate their consistency at a glance.

**Independent Test**: Can be tested with a seeded completion history by verifying that specific known completed, missed, and future dates each render in the correct visual state.

**Acceptance Scenarios**:

1. **Given** a day in the heatmap corresponds to a date on which the habit was completed, **When** the user views that cell, **Then** it is filled with the habit's assigned colour tag colour.
2. **Given** a day in the heatmap corresponds to a past date on which the habit was not completed, **When** the user views that cell, **Then** it is filled with a muted, neutral tone visually distinct from both the completed colour and an empty cell.
3. **Given** a day in the heatmap corresponds to a future date (or today if today is not yet completed), **When** the user views that cell, **Then** it appears empty with no fill colour.
4. **Given** the user scans the heatmap, **When** they compare a run of completed days with a run of missed days, **Then** the visual distinction between the two states is immediately apparent without a legend.
5. **Given** a habit was created less than 365 days ago, **When** the user views the heatmap, **Then** days before the habit's creation date are shown as empty cells — not as missed days.

---

### User Story 3 - Navigate Back to the Dashboard (Priority: P3)

A user has finished reviewing their habit history. They click the back button on the detail page and return to the dashboard, finding it exactly as they left it.

**Why this priority**: Navigation continuity is fundamental. Users must have a clear, reliable way to return to the dashboard from any detail page without losing their place or context.

**Independent Test**: Can be tested independently by navigating to a detail page and clicking the back control — verifying the user returns to the dashboard.

**Acceptance Scenarios**:

1. **Given** the user is on the habit detail page, **When** they click the back button, **Then** they are returned to the dashboard.
2. **Given** the user returns to the dashboard via the back button, **When** the dashboard loads, **Then** the dashboard displays in the same state as before navigation — no data changes or scroll position loss.
3. **Given** the detail page is open, **When** the user uses the browser's native back action (e.g., browser back button or swipe), **Then** they are also returned to the dashboard.

---

### Edge Cases

- What if the habit has no completions at all? The heatmap shows all 365 past/present cells as either empty (habit created within the last 365 days, days before creation are empty) or muted/missed (days since creation that were not completed). No completed cells appear.
- What if the habit was created today? The heatmap shows only today's cell (empty or muted, depending on whether completed today), and all prior cells are empty.
- What if the habit name is very long? The name MUST truncate or wrap gracefully without breaking the page layout or overflowing its container.
- What if the colour tag colour is very similar to the muted missed-day tone? The muted tone MUST be sufficiently distinct from all six colour tag options to ensure completed and missed states are never visually ambiguous.
- What if the detail page is viewed on a small mobile screen? The heatmap grid MUST remain readable — either scrolling horizontally or condensing to fit without losing the weekly structure.
- What if the user navigates directly to a detail page URL for a habit that no longer exists? The page MUST display a graceful "Habit not found" message and offer a link back to the dashboard (see FR-019).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Clicking a habit's name on the dashboard MUST navigate the user to the detail page for that habit.
- **FR-002**: The detail page MUST display the habit's name, category, and colour tag.
- **FR-003**: The detail page MUST display the habit's current streak in the same icon and unit format defined by the Streak Tracking spec (flame icon + "N day" / "N days").
- **FR-004**: The detail page MUST display the habit's longest streak in the same icon and unit format defined by the Streak Tracking spec (trophy/star icon + "N day" / "N days").
- **FR-005**: The detail page MUST display a heatmap grid covering the last 365 calendar days from today (inclusive).
- **FR-006**: The heatmap MUST be organised in a GitHub-style weekly structure: each column represents one week and each row represents one day of the week (Sunday through Saturday, or Monday through Sunday), with the most recent week at the rightmost position.
- **FR-007**: The heatmap MUST include month labels positioned above or below the grid so users can identify which month each section of the grid corresponds to.
- **FR-008**: Each cell in the heatmap that corresponds to a date on which the habit was completed MUST be filled with the habit's assigned colour tag colour.
- **FR-009**: Each cell in the heatmap that corresponds to a past date on which the habit was not completed MUST be filled with a muted, neutral tone. This tone MUST be visually distinct from both the completed colour and an empty cell.
- **FR-010**: Each cell in the heatmap that corresponds to a future date, or to today if the habit has not yet been completed today, MUST be rendered as an empty cell with no fill colour.
- **FR-011**: Days before the habit's creation date MUST be rendered as empty cells — they MUST NOT be shown as missed days.
- **FR-012**: The heatmap MUST be implemented using native browser layout capabilities only — no external chart or data-visualisation libraries are permitted.
- **FR-013**: The detail page MUST include a back navigation control that returns the user to the dashboard.
- **FR-014**: The back navigation control MUST be visible without scrolling (always accessible in the viewport) when the page loads.
- **FR-015**: The detail page MUST be accessible from the dashboard and MUST support the browser's native back navigation in addition to the in-page back control.
- **FR-016**: The detail page MUST function correctly on mobile, tablet, and desktop screen widths. The heatmap MUST remain readable at all supported widths — either through horizontal scrolling of the heatmap alone or through a condensed but structurally correct layout.
- **FR-017**: The heatmap container MUST have a single accessible label (readable by screen readers) summarising the completion data in plain language — for example, "Completion history: X of 365 days completed in the last year". Individual heatmap cells MUST be hidden from the accessibility tree so screen reader users are not forced to navigate 365 individual cells.
- **FR-018**: The detail page MUST display a skeleton loading state while habit data and completion history are being read. The skeleton MUST mirror the layout of the loaded page (name/category/streak placeholders + heatmap grid placeholder) and transition to the real content without a full-page flash.
- **FR-019**: If the requested habit ID does not exist in the data store, the detail page MUST display a "Habit not found" message and provide a clearly labelled link or button that navigates the user back to the dashboard. The page MUST NOT render a blank view or throw an unhandled error.
- **FR-020**: If the data store fails to return habit data (e.g., read error), the detail page MUST replace the skeleton with an inline error message and a retry button. Activating the retry button MUST re-attempt the data load. This state is distinct from the "habit not found" state (FR-019).

### Key Entities

- **Habit Detail Page**: The dedicated full-page view for a single habit. Displays habit metadata (name, category, colour tag), streak values (current and longest), and a 365-day completion heatmap. Navigated to by clicking the habit's name on the dashboard; exited via the back control or browser navigation.
- **Heatmap**: A 365-cell grid visualising the habit's daily completion history. Cells are coloured by state: completed (habit colour), missed (muted tone), or empty (future / before creation / today-not-yet-done). Organised in weekly columns with month labels. Accessible via a single summary ARIA label on the container; individual cells are hidden from the accessibility tree.
- **Heatmap Cell**: A single day's unit in the heatmap grid. Three possible visual states: completed, missed, or empty. State is derived from the completion history and the habit's creation date.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can navigate from any habit card on the dashboard to the habit detail page in a single interaction (one click on the habit name).
- **SC-002**: The detail page loads and displays the heatmap within 2 seconds, including for habits with a full 365-day completion history.
- **SC-003**: 100% of heatmap cells display the correct visual state (completed / missed / empty) for every day in the 365-day window, verified against known completion data.
- **SC-004**: The muted missed-day colour is visually distinguishable from all six colour tag options and from empty cells in all supported dark-theme environments.
- **SC-005**: 90% of usability test participants can correctly identify at least one completed day, one missed day, and one empty day in the heatmap without a legend or additional explanation.
- **SC-006**: The back control is visible without scrolling on every supported screen size, and activating it always returns the user to the dashboard.
- **SC-007**: The heatmap remains readable and structurally correct (weekly columns preserved) at mobile, tablet, and desktop screen widths.
- **SC-008**: A skeleton loading placeholder is visible immediately on navigation to the detail page, and transitions to the fully rendered content without a blank/white flash.
- **SC-009**: When a data load error occurs, an error state with a retry button is displayed and activating the retry successfully re-attempts the load.

## Assumptions

- The habit detail page is a separate routed page, not a modal overlay — navigation changes the URL/view and the browser back action is supported.
- The heatmap uses only native browser layout capabilities (CSS grid or equivalent); no external chart, SVG, or canvas visualisation libraries are used. This is a deliberate technical design constraint specified by the product owner.
- The dark theme established in the Dashboard Page spec applies to the detail page as well; the muted missed-day colour is a design-time choice that must pass contrast requirements against the dark background.
- The streak values displayed on the detail page are the same values defined and calculated by the Streak Tracking spec; this feature only defines their placement and display context on the detail page.
- "Today" is determined by the local calendar date on the user's device, consistent with the Daily Completion and Streak Tracking specs.
- The heatmap shows exactly the last 365 days ending today; it does not extend to a full calendar year (Jan–Dec) — the window is rolling and always ends on the current date.
- The first day of the week in the heatmap (Sunday or Monday) is a design-time decision; either is acceptable as long as it is consistent throughout the grid.
- Habit creation date is stored and accessible via the data service layer; the detail page uses it only to distinguish pre-creation empty cells from post-creation missed cells.
- No interactive tooltip or hover state on heatmap cells is required for this version; cells are read-only visual indicators.
