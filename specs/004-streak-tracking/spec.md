# Feature Specification: HabitFlow Streak Tracking

**Feature Branch**: `004-streak-tracking`

**Created**: 2026-05-22

**Status**: Draft

**Input**: User description: "streak tracking - current streak increments if habit was completed yesterday, resets to 1 if a day was missed, stays at 0 if never completed. Longest streak updates whenever current streak exceeds it. Both values displayed on each habit card and habit detail page."

## Clarifications

### Session 2026-05-22

- Q: How should current streak and longest streak be labeled and formatted on the habit card? → A: Icon + number + unit — current streak as a flame icon + "N days"; longest streak as a trophy/star icon + "N days"; both with screen-reader accessible labels.
- Q: Should the streak display show a visual warning when a streak is active but today's habit is not yet completed? → A: No at-risk state — streak value and icon display the same regardless of whether today is pending; the unchecked checkbox is the only signal.
- Q: What happens to streak data when a habit is deleted? → A: Deleted with the habit — all streak data and the completion history used to calculate it are permanently removed together with the habit.
- Q: Beyond the two streak numbers, does the detail page show any additional streak context (dates, history)? → A: Numbers only — the detail page shows the same two values as the card with no additional date or history context.
- Q: Should a celebratory signal appear when the user hits a significant streak milestone (e.g., 7, 30 days)? → A: No milestones — no special celebration or animation at any streak count; milestone celebrations are explicitly out of scope.
- Q: What is displayed for current streak on page load when yesterday was missed and today is also not yet completed? → A: Show 0 — if neither yesterday nor today has a completion, the current streak displays as 0 immediately on page load, reflecting the broken chain.
- Q: Should the "days" unit be singular when the count is 1? → A: Yes — display "1 day" (singular) when count = 1; "N days" (plural) for all other values including 0.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Streak Counts at a Glance (Priority: P1)

A returning user opens HabitFlow and checks their dashboard. On each habit card they can see two streak numbers: their current active streak (how many consecutive days they have kept the habit) and their longest streak ever (their personal best). At a glance, they know both where they are right now and what their best run has been.

**Why this priority**: Streak visibility is the primary motivational mechanism of a habit tracker. Users need both numbers — the current streak drives daily commitment; the personal best drives long-term ambition. Without these being visible on the card, the tracker loses its core feedback loop.

**Independent Test**: Can be tested by seeding habits with known completion histories and verifying the correct current streak and longest streak values appear on each card. Delivers the complete streak display experience.

**Acceptance Scenarios**:

1. **Given** a habit exists with a completion history, **When** the user views the dashboard, **Then** each habit card displays the current streak count and the longest streak count.
2. **Given** a habit has never been completed, **When** the user views its card, **Then** the current streak displays as 0 and the longest streak displays as 0.
3. **Given** a habit was completed today but not yesterday (or the day before), **When** the user views its card, **Then** the current streak displays as 1.
4. **Given** a habit has been completed for 7 consecutive days, **When** the user views its card, **Then** the current streak displays as 7.
5. **Given** a habit card is visible, **When** the user reads the streak display, **Then** the current streak is shown with a flame icon and the unit "days" (e.g., flame + "7 days") and the longest streak is shown with a trophy or star icon and the unit "days" (e.g., trophy + "12 days").

---

### User Story 2 - Streak Increments on Consecutive Completion (Priority: P2)

A user has been completing their "Meditate" habit every day for the past five days. Today they mark it complete. The current streak on the card immediately updates from 5 to 6. Because this is also their new longest run, the longest streak updates from 5 to 6 as well.

**Why this priority**: Streak progression on completion is the core feedback moment — the reward signal that makes habit trackers motivating. This must work correctly and instantly on every completion.

**Independent Test**: Can be tested by checking a habit with a known streak and verifying both the current and longest streak values update correctly in the same interaction.

**Acceptance Scenarios**:

1. **Given** a habit was completed yesterday and the user marks it complete today, **When** the completion is saved, **Then** the current streak increments by 1 immediately.
2. **Given** the incremented current streak now exceeds the stored longest streak, **When** the completion is saved, **Then** the longest streak updates to match the new current streak value immediately.
3. **Given** the incremented current streak does not exceed the stored longest streak, **When** the completion is saved, **Then** the longest streak value is unchanged.
4. **Given** a user unchecks a habit that was completed today, **When** the completion is removed, **Then** the current streak recalculates based on the updated completion history and the card reflects the corrected value.

---

### User Story 3 - Streak Resets After a Missed Day (Priority: P3)

A user missed completing their "Read" habit yesterday. Today they open the app and mark it complete. The current streak on the card shows 1 — a fresh start. Their longest streak (previously 12) remains intact, reminding them of their best run and motivating them to beat it again.

**Why this priority**: Honest streak reset behaviour builds trust. Users must know the system is accurate. Importantly, the longest streak surviving a reset provides emotional continuity and a goal to chase.

**Independent Test**: Can be tested by creating a habit with a gap in completions (yesterday not completed), checking it today, and verifying current streak = 1 while longest streak is unchanged.

**Acceptance Scenarios**:

1. **Given** a habit was not completed yesterday, **When** the user marks it complete today, **Then** the current streak is set to 1 (not carried forward from any previous run).
2. **Given** a streak resets to 1, **When** the user views the card, **Then** the longest streak retains its previous value — it does not reset or decrease.
3. **Given** a habit has never been completed, **When** the user marks it complete for the first time, **Then** the current streak becomes 1 and the longest streak becomes 1.
4. **Given** a habit had a previous run of N consecutive days before a miss, **When** the user resumes and builds a new run exceeding N, **Then** the longest streak updates to the new record.

---

### User Story 4 - View Streak Details on Habit Detail Page (Priority: P4)

A user taps on a habit card to open its detail page. In addition to full habit information, they see their current streak and longest streak displayed prominently — the same values that appear on the card, presented in a more detailed context.

**Why this priority**: The detail page provides a dedicated space for habit statistics. Users who want more than a card-level glance should find the same streak data available and accurate here.

**Independent Test**: Can be tested independently by navigating to a habit's detail page and verifying both streak values match those shown on the dashboard card for the same habit.

**Acceptance Scenarios**:

1. **Given** a user opens a habit's detail page, **When** the page loads, **Then** the current streak and longest streak for that habit are displayed.
2. **Given** the user completes a habit from the detail page, **When** the completion is recorded, **Then** both streak values on the detail page update immediately to reflect the new state.
3. **Given** a user navigates from the dashboard card to the detail page, **When** they compare the values, **Then** the current streak and longest streak shown on the detail page exactly match the values shown on the dashboard card.

---

### Edge Cases

- What if the user has never missed a day since creating the habit? The current streak and longest streak are equal and reflect the total number of days completed.
- What if a user completes a habit, then unchecks it (removes today's completion)? The current streak recalculates: if yesterday was completed, the streak reverts to yesterday's value; if yesterday was not completed, the streak returns to 0.
- What is the current streak when a habit was last completed yesterday but not yet today? The streak remains at yesterday's count — it is "active" and not yet broken (FR-008).
- What is the current streak on page load when yesterday was also missed? The current streak displays as 0 immediately — the break is reflected on load, before any completion is recorded for today (FR-019).
- What if a habit's completion history includes a very long unbroken chain (e.g., 365 days)? The streak display must handle large numbers without truncation or layout overflow.
- What if the longest streak and current streak are both 0 (never completed)? Both display as 0; no special label or indicator is required beyond the numeric value.
- What about weekly habits? Streak tracking as defined here (consecutive calendar days) applies only to daily habits. Weekly habit streak semantics are out of scope for this feature.
- What happens to streak data when a habit is deleted? All streak values and the completion history used to calculate them are permanently removed when the habit is deleted — no orphaned streak records are retained.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Each habit card on the dashboard MUST display the habit's current streak count.
- **FR-002**: Each habit card on the dashboard MUST display the habit's longest streak count.
- **FR-003**: The habit detail page MUST display the habit's current streak count using the same icon + number + unit format as the habit card (flame icon + "N days").
- **FR-004**: The habit detail page MUST display the habit's longest streak count using the same icon + number + unit format as the habit card (trophy/star icon + "N days"). No additional date context, history strip, or extended analytics are required on the detail page for this feature.
- **FR-005**: A habit that has never been completed MUST have a current streak of 0 and a longest streak of 0.
- **FR-006**: When a habit is completed today and was also completed on every preceding consecutive calendar day, the current streak MUST equal the total length of that unbroken chain of days.
- **FR-007**: When a habit is completed today but was not completed yesterday (i.e., at least one calendar day was missed), the current streak MUST be set to 1.
- **FR-008**: When a habit was last completed yesterday (and has not yet been completed today), the current streak MUST remain at its most recent active value — it does not reset until a full calendar day is missed without completion. The streak icon and value display MUST NOT change colour, show a warning indicator, or otherwise signal an "at risk" state; the streak is presented identically regardless of whether today's completion is still pending.
- **FR-009**: The longest streak MUST store the highest current streak value ever reached for a habit. It MUST only increase and MUST NOT decrease under any circumstance.
- **FR-010**: Whenever a completion causes the current streak to exceed the stored longest streak, the longest streak MUST update to the new current streak value as part of the same interaction — no separate action or page reload is required.
- **FR-011**: Both streak values MUST update immediately on the habit card when a completion checkbox is toggled, without requiring a page reload.
- **FR-012**: When a completion is removed (checkbox unchecked), the current streak MUST recalculate based on the revised completion history. If the removal causes the current streak to decrease, the card MUST reflect the corrected value immediately. The longest streak MUST NOT decrease as a result of a completion being removed.
- **FR-013**: Streak values MUST persist across page loads and browser sessions — streak data MUST survive closing and reopening the browser.
- **FR-014**: Streak calculations MUST be based on calendar date only (not time of day), using the local date on the user's device.
- **FR-015**: Streak tracking as defined in this specification applies to daily habits only. Streak behaviour for weekly habits is not defined by this feature.
- **FR-016**: On both the habit card and the habit detail page, the current streak MUST be displayed using a flame icon followed by the count and the unit label (e.g., "🔥 7 days"). The longest streak MUST be displayed using a trophy or star icon followed by the count and the unit label (e.g., "⭐ 12 days"). The unit label MUST use the singular form "day" when the count is exactly 1 (e.g., "1 day") and the plural form "days" for all other values including 0 (e.g., "0 days", "7 days"). Both values MUST include accessible labels readable by screen readers that clearly identify which value is current and which is longest (e.g., "Current streak: 1 day", "Longest streak: 12 days").
- **FR-017**: When a habit is deleted, all associated streak data and the completion history used to derive it MUST be permanently removed. No orphaned streak records for the deleted habit MUST remain in storage after deletion.
- **FR-018**: Streak milestone celebrations, special animations, badges, or any indicator triggered by reaching a specific streak count are explicitly out of scope for this feature. The incrementing streak value is the only reward signal.
- **FR-019**: When a habit was not completed yesterday AND has not yet been completed today, the current streak MUST display as 0 on page load. The break in the chain is reflected immediately — the display does not wait for a completion event to show the reset value.

### Key Entities

- **Current Streak**: The count of consecutive calendar days on which a habit has been completed, ending on the most recent completion day. A missed day breaks the chain: if neither yesterday nor today has a completion, the current streak is 0 immediately on page load. If yesterday was completed but today is not yet done, the streak remains at yesterday's active value. Resets to 1 on the next completion after a break.
- **Longest Streak**: The all-time personal best current streak value ever recorded for a habit. Increases whenever the current streak exceeds it; never decreases, including when a completion is removed.
- **Habit Detail Page**: A dedicated page or view displaying full information for a single habit, including both streak values. Its overall layout and navigation are defined separately; this feature defines only that both streak values appear there.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Current streak and longest streak values displayed on every habit card are accurate 100% of the time — they match the values derived from the stored completion history on every page load.
- **SC-002**: Both streak values update and are visible on the habit card within 200 milliseconds of a checkbox interaction — no page reload required.
- **SC-003**: The longest streak value never decreases across any user interaction, including unchecking a completion.
- **SC-004**: Streak values persist with 100% fidelity across page refreshes and browser restarts under normal operating conditions.
- **SC-005**: A habit completing its 1st day always shows current streak = 1 and longest streak = 1; a habit with a missed day always shows current streak = 1 after the next completion (regardless of prior streak length).
- **SC-006**: Streak display handles values of any length (including 3+ digit streaks) without truncation or layout overflow on the habit card or detail page.

## Assumptions

- Streak calculation is performed by the application's data service layer (consistent with the architectural boundary established in the Daily Completion spec); the dashboard and detail page UI only read and display the results.
- "Yesterday" and "today" are determined by the local calendar date on the user's device, consistent with the Daily Completion spec.
- Completion history is stored with sufficient fidelity (habit ID + calendar date) to allow streak calculation; this structure is defined in the Daily Completion spec.
- When an uncheck causes the current streak to decrease (but the habit was previously on a longer streak this session), the longest streak retains the higher value — it reflects the all-time best, not the current session best.
- The habit detail page exists or will be created as part of the application; this spec defines only that both streak values are displayed there. The page's overall design, navigation, and other content are out of scope.
- Streak tracking for weekly habits (consecutive weeks) is explicitly out of scope for this feature and will require a separate specification if needed.
- Streak history is not retroactively recalculated if a user edits a habit's frequency (daily → weekly); completion records prior to the edit are preserved, and streak logic continues from the current state.
- When a habit is deleted, all its streak data and completion history are permanently removed (FR-017); this is consistent with the Habit Management spec which states deletion removes all associated data.
