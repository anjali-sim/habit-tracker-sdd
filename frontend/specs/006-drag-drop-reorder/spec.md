# Feature Specification: HabitFlow Dashboard Drag-and-Drop Reorder

**Feature Branch**: `006-drag-drop-reorder`

**Created**: 2026-05-22

**Status**: Draft

**Input**: User description: "drag and drop - habits on the dashboard can be reordered by dragging and dropping cards. Dragging shows a ghost card and highlights the drop target position. Order persists on page refresh."

## Clarifications

### Session 2026-05-22

- Q: Should touch/mobile drag-and-drop be supported in this version? → A: Desktop only — drag-and-drop is scoped to mouse/trackpad input; touch devices cannot reorder cards in v1.
- Q: What should happen if saving the new card order fails after a drop? → A: Optimistic update with revert — the card moves visually on drop immediately; if the save fails, the order reverts to the last successfully saved state and a toast/snackbar notification is shown.
- Q: Should the keyboard reordering interaction announce state changes to screen readers via ARIA? → A: Yes — an ARIA live region announces move mode, current position as the card shifts, and confirmation on drop (e.g., "Habit moved to position 2 of 5").
- Q: What visual form should the drop target placeholder take? → A: Slim insertion line — a thin highlighted line or narrow gap at the insertion point; surrounding cards do not shift or reflow during the drag.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Reorder Habits by Dragging (Priority: P1)

A user has several habits on their dashboard and wants to arrange them in a personally meaningful order — for example, placing their most important habits at the top. They pick up a habit card by clicking and holding it, drag it to the desired position, and drop it there. The cards reflow immediately to reflect the new arrangement.

**Why this priority**: Reordering is the core capability of this feature. Without it, the drag-and-drop feature delivers no value. All other stories depend on this one working correctly.

**Independent Test**: Can be tested independently by starting with a known card order, performing a drag-and-drop to a new position, and verifying the grid reflects the new order correctly.

**Acceptance Scenarios**:

1. **Given** the dashboard has two or more habit cards, **When** the user clicks and holds a card then drags it to a new position, **Then** the card moves to that position and the remaining cards reflow.
2. **Given** the user drops a card in a new position, **When** the drop completes, **Then** the grid layout immediately reflects the updated order without requiring a page refresh.
3. **Given** the user starts dragging a card, **When** they release it over its original position, **Then** the card returns to its original position unchanged.
4. **Given** the dashboard has exactly one habit card, **When** the user attempts to drag it, **Then** the drag interaction is allowed but dropping it results in no order change.

---

### User Story 2 - Visual Feedback During Drag (Priority: P2)

A user picks up a habit card and drags it across the dashboard. As they drag, a semi-transparent ghost copy of the card follows their cursor so they can see what they are moving. A visual placeholder gap appears in the grid at the position the card would land if released, so the user always knows exactly where the card will go.

**Why this priority**: Visual feedback is essential to a usable drag-and-drop experience. Without the ghost card and drop indicator, the interaction is disorienting and error-prone. This story cannot be meaningfully tested without Story 1 working.

**Independent Test**: Can be tested independently by initiating a drag and observing the ghost card and drop target placeholder — without completing the drop — to verify the visual feedback is correct.

**Acceptance Scenarios**:

1. **Given** the user begins dragging a habit card, **When** the drag starts, **Then** a semi-transparent ghost copy of the card appears and follows the cursor/pointer.
2. **Given** a drag is in progress, **When** the cursor moves over a valid drop position between two existing cards, **Then** a visual gap or placeholder highlights that insertion point.
3. **Given** a drag is in progress, **When** the cursor moves to the beginning or end of the card list, **Then** a drop target placeholder appears at that boundary position.
4. **Given** a drag is in progress and the user presses Escape, **When** the key is received, **Then** the drag is cancelled and the ghost disappears with no change to card order.
5. **Given** a drag is in progress and the user releases the pointer outside any valid drop zone, **When** the pointer is released, **Then** the drag is cancelled and the card returns to its original position.

---

### User Story 3 - Order Persists After Refresh (Priority: P3)

After reordering their habits, a user closes the browser tab and returns later (or simply refreshes the page). Their habits appear in the same order they left them, not the default creation order.

**Why this priority**: Persistence makes the reordering permanent and useful. Without it, any arrangement the user makes is lost on refresh, making the drag-and-drop feature cosmetically useful only within a single session.

**Independent Test**: Can be tested independently by reordering cards, reloading the page, and verifying the persisted order is restored exactly.

**Acceptance Scenarios**:

1. **Given** the user has reordered habit cards, **When** they refresh the page, **Then** the habits appear in the same order as before the refresh.
2. **Given** the user reorders habits, **When** the drop completes, **Then** the new order is saved immediately without requiring any additional user action (no save button).
3. **Given** the user has a persisted custom order and adds a new habit, **When** the dashboard loads after creation, **Then** the new habit appears at the end of the custom order and all existing habits remain in their persisted positions.

---

### Edge Cases

- What if the user refreshes the page mid-drag? The drag is a client-side gesture; refreshing cancels it and the page restores the last persisted order.
- What if a habit is deleted? The remaining habits retain their relative persisted order; no position gaps are introduced.
- What if all habits are deleted and then new habits are created? New habits are appended in creation order, starting fresh with no prior persisted order.
- What if the persisted order references a habit ID that no longer exists (e.g., data inconsistency)? The missing habit is silently skipped; remaining habits render in their persisted relative order.
- What if the dashboard has only one habit card? Dragging is technically possible but results in no order change. No visual affordance is required to block it.
- What if the user drags very quickly between positions? The drop target placeholder MUST follow the cursor at interactive speed without flickering or lag.
- What if saving the new order fails after a successful drop? The visual card order MUST revert to the last successfully saved state and a toast/snackbar notification MUST be shown to inform the user (see FR-018).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Each habit card on the dashboard MUST be individually draggable by the user.
- **FR-002**: When a drag operation begins, a ghost card — a semi-transparent visual copy of the dragged card — MUST appear and follow the cursor/pointer for the duration of the drag.
- **FR-003**: The ghost card opacity MUST be visually distinct from the original card to clearly communicate that it is a drag preview and not the card in its final position.
- **FR-004**: While a card is being dragged, the original card's position in the grid MUST be replaced by a placeholder that visually indicates the card is absent (e.g., empty gap or dimmed slot).
- **FR-005**: As the cursor/pointer moves over a valid drop position, a drop target placeholder MUST be rendered at that insertion point as a slim highlighted line or narrow gap between cards. Surrounding cards MUST NOT shift or reflow during the drag — they remain in place until the drop is confirmed.
- **FR-006**: When the user releases the pointer over a valid drop target, the dragged card MUST be inserted at the indicated position and all other cards MUST reflow to accommodate it.
- **FR-007**: Pressing the Escape key during an active drag MUST cancel the operation and return the dragged card to its original position with no order change.
- **FR-008**: Releasing the pointer outside any valid drop target MUST cancel the drag and return the card to its original position.
- **FR-009**: The mouse-based drag-and-drop interaction MUST work on all supported desktop browsers.
- **FR-010**: The drag-and-drop interaction is scoped to mouse/trackpad input on desktop browsers only. Touch-based drag-and-drop on mobile and tablet devices is explicitly out of scope for this version.
- **FR-011**: After a successful drop, the new card order MUST be persisted immediately via the data service layer — no explicit save action is required from the user.
- **FR-012**: Habit card order MUST be stored and retrieved through the data service layer; no component or store MUST write order data directly to storage.
- **FR-013**: On page load, habit cards MUST be rendered in the persisted order. If no persisted order exists, habits MUST be displayed in creation order.
- **FR-014**: When a new habit is created, it MUST be appended to the end of the current persisted order.
- **FR-015**: When a habit is deleted, the remaining habits MUST retain their relative persisted order; the deleted habit's position is simply removed.
- **FR-016**: The keyboard MUST provide an accessible alternative for reordering: a user MUST be able to select a card using the keyboard and move it to an adjacent position using keyboard controls (e.g., Tab to focus, key combination to enter move mode, arrow keys to shift, Enter/Space to confirm, Escape to cancel).
- **FR-017**: The drag-and-drop interaction MUST be implemented using native browser capabilities only — no external drag-and-drop or interaction libraries are permitted.
- **FR-018**: The order update after a drop MUST be applied optimistically — the visual order updates immediately on drop. If the save fails, the card order MUST revert to the previously saved state and a toast/snackbar notification MUST be displayed and auto-dismiss to inform the user of the failure.
- **FR-019**: The keyboard reordering interaction (FR-016) MUST include an `aria-live` region that announces state changes to screen readers: entry into move mode, the card's current position as it shifts (e.g., "Habit 'Morning Run' moving to position 2 of 5"), and confirmation when the move is committed or cancelled.

### Key Entities

- **Habit Card (Draggable)**: A habit card on the dashboard grid that can be picked up and repositioned. Each card has an associated order index that determines its display position.
- **Ghost Card**: The semi-transparent visual copy of a habit card that follows the cursor/pointer during an active drag operation. It is a read-only preview and never represents the card's final position.
- **Drop Target Placeholder**: The visual indicator rendered in the card grid during a drag to show the insertion point where the dragged card will land if released. Appears as a slim highlighted line or narrow gap between cards; surrounding cards do not shift during the drag.
- **Habit Order**: The persisted sequence of habit IDs that defines the display order of cards on the dashboard. Stored and retrieved via the data service layer.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can reorder any two habit cards in a single drag-and-drop gesture with no more than one attempt needed on first use.
- **SC-002**: The ghost card and drop target placeholder appear within 100ms of drag initiation — the interaction feels instantaneous.
- **SC-003**: The new card order is persisted within 500ms of a successful drop, before the user can navigate away.
- **SC-004**: On page refresh, habits always appear in the last saved order with 100% fidelity — no regressions to creation order.
- **SC-005**: Pressing Escape during a drag always returns the card to its exact original position with no visible glitch or delay.
- **SC-006**: Keyboard reordering is operable without a mouse — 100% of reorder operations completable via keyboard alone.
- **SC-007**: When a save failure occurs after a drop, the visual card order reverts to the last saved state and a toast/snackbar notification is shown and auto-dismisses.

## Assumptions

- The drag-and-drop interaction is implemented using only native browser capabilities; no external drag-and-drop library is introduced (see FR-017).
- The data service layer already supports storing and retrieving an ordered list of habit IDs; if not, this feature requires extending the service layer with an order-storage API.
- The ghost card is a visual clone of the card and does not require interaction (no buttons active on ghost).
- "Valid drop target" means any insertion gap between cards or at either end of the card list — dropping on top of another card inserts before it.
- The existing card grid layout from the Dashboard Page spec accommodates reordering without structural changes to the grid container.
- Drag handles (a dedicated grab icon) are not required; the full card surface is the drag target.
- Drag state is entirely client-side; no server calls are made during the drag gesture — only on drop.
