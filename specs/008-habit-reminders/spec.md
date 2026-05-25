# Feature Specification: Habit Reminders

**Feature Branch**: `009-habit-reminders`

**Created**: 2026-05-25

**Status**: Draft

**Input**: User description: "add reminders feature — each habit can have an optional daily reminder time (HH:MM) set in the add/edit habit modal via a time picker field. Uses browser Notification API to trigger reminder at set time. User prompted for notification permission on first reminder is set. Reminder time saved as part of the habit object in localStorage via api service layer. A 'No reminder' option clears the reminder time."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Set a Daily Reminder for a Habit (Priority: P1)

A user wants to be nudged to complete a habit at a specific time each day. When creating or editing a habit, they use a time picker in the modal form to choose the hour and minute they want to be reminded. After saving, a browser notification appears at that time each day to prompt them to complete the habit.

**Why this priority**: Setting a reminder is the core action of this feature. All other behaviours (permission flow, clearing a reminder) are supplementary. A working reminder notification is the primary value delivered to the user.

**Independent Test**: Create a habit with a reminder set to one minute in the future. Wait for the notification to fire and confirm it contains the habit name. Verify the reminder persists after a page refresh.

**Acceptance Scenarios**:

1. **Given** the add or edit habit modal is open, **When** the user views the form, **Then** a time picker field labelled "Reminder" is visible with a default state of "No reminder".
2. **Given** the reminder time picker is visible, **When** the user selects a time (e.g., 08:00), **Then** the selected time is shown in the field.
3. **Given** the user has set a reminder time and saves the habit, **When** the saved time arrives on any subsequent day, **Then** a browser notification is sent containing the habit name and a prompt to complete it.
4. **Given** a habit with a reminder has been saved, **When** the user refreshes the page, **Then** the reminder time is still set and the notification will still fire at the scheduled time.
5. **Given** the edit modal is opened for a habit that already has a reminder set, **When** the modal opens, **Then** the time picker is pre-filled with the habit's current reminder time.

---

### User Story 2 - Grant Notification Permission (Priority: P2)

A user sets a reminder time for the first habit that has a reminder. Because the app needs permission to send browser notifications, the user is presented with the browser's permission prompt before the reminder is saved. They grant permission and their reminder is set. If they deny permission, they are informed that notifications are blocked and shown how to enable them.

**Why this priority**: The notification permission gate controls whether the core feature (notifications) can work at all. Without handling this correctly, reminders silently fail for users who have never granted permission.

**Independent Test**: In a fresh browser profile (no prior permission), set a reminder on any habit. Verify the browser permission prompt appears. Grant permission and verify the reminder is saved and notifications subsequently fire. Repeat, this time denying permission, and verify an informative message is shown.

**Acceptance Scenarios**:

1. **Given** the user has not previously been asked for notification permission, **When** they save a habit with a reminder time set for the first time, **Then** the browser's notification permission prompt is displayed before the reminder is confirmed.
2. **Given** the permission prompt is shown, **When** the user grants permission, **Then** the habit is saved with the reminder time and notifications will fire at the scheduled time.
3. **Given** the permission prompt is shown, **When** the user denies permission, **Then** an informative message is shown explaining that notifications are blocked and that the reminder time has been saved but notifications will not fire until permission is granted via browser settings.
4. **Given** the user has previously granted notification permission, **When** they set a reminder on another habit, **Then** no permission prompt is shown again; the reminder is saved directly.
5. **Given** the user has previously denied notification permission and later visits the app, **When** they view a habit that has a saved reminder time, **Then** a visible indicator or message on the habit card or in the edit modal informs them that notifications are currently blocked.

---

### User Story 3 - Clear a Reminder (Priority: P3)

A user no longer wants to receive a daily reminder for a habit. They open the edit modal and select the "No reminder" option from the time picker. After saving, the notification for that habit stops firing.

**Why this priority**: Users must be able to remove reminders they no longer want. Without a clear mechanism, unwanted notifications continue indefinitely, degrading the experience.

**Independent Test**: On a habit with a reminder set, open the edit modal, select "No reminder", save, and confirm the reminder time is cleared. Verify no notification fires at the previously scheduled time.

**Acceptance Scenarios**:

1. **Given** the edit modal is open for a habit with a reminder set, **When** the user selects "No reminder" from the time picker, **Then** the time picker reverts to showing "No reminder" with no time value.
2. **Given** the user has selected "No reminder" and saves the habit, **When** the previously scheduled reminder time arrives, **Then** no notification is sent for that habit.
3. **Given** the edit modal is open for a habit with no reminder, **When** the user views the time picker, **Then** the default "No reminder" state is shown (no time is pre-selected).
4. **Given** the user saves a habit with "No reminder" selected, **When** they subsequently open the edit modal for that habit, **Then** the time picker still shows "No reminder" (the cleared state is persisted).

---

### Edge Cases

- What if the user sets a reminder time that has already passed for today (e.g., sets 07:00 at 09:00)? The notification fires the following day; no retroactive notification is sent for the current day.
- What if multiple habits have the same reminder time? Each habit sends its own separate notification at that time.
- What if the app tab is closed when the reminder time arrives? Notification delivery when the app is not open in a browser tab is not guaranteed and is treated as a best-effort behaviour; no missed-notification recovery mechanism is provided.
- What if the user has many habits with reminders all set to the same time? All corresponding notifications are queued and sent; no deduplication or bundling is applied in this version.
- What if the user clears a reminder but then re-sets it to the same time? The reminder is re-saved and will fire as if newly created.
- What if the user's device is in a different timezone to where they originally set the reminder? Reminder times are interpreted using the device's current local time at the point of notification delivery.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The add habit modal and the edit habit modal MUST both include a "Reminder" time picker field. The field MUST default to a "No reminder" state (no time selected) for new habits and for existing habits that have no reminder saved.
- **FR-002**: The reminder time picker MUST allow the user to select any valid hour and minute in 24-hour (HH:MM) format.
- **FR-003**: The reminder time picker MUST include a clearly labelled "No reminder" option that, when selected, removes any previously set reminder time.
- **FR-004**: When the edit modal is opened for a habit that already has a reminder time saved, the time picker MUST be pre-filled with that habit's saved reminder time.
- **FR-005**: When the user saves a habit (new or edited) with a reminder time set, the reminder time MUST be saved as part of that habit's data and MUST persist across page refreshes and browser session restarts.
- **FR-006**: When the user saves a habit with "No reminder" selected, any previously saved reminder time for that habit MUST be cleared and the cleared state MUST persist.
- **FR-007**: The first time a user attempts to save a habit with a reminder time (and notification permission has not yet been granted or denied), the application MUST trigger the browser's native notification permission prompt before completing the save.
- **FR-008**: If the user grants notification permission, the habit MUST be saved with the reminder time and the notification scheduling MUST proceed.
- **FR-009**: If the user denies notification permission, the habit reminder time MUST still be saved, AND the application MUST display an informative message explaining that notifications are currently blocked and will not fire until the user enables them in their browser settings.
- **FR-010**: If notification permission has already been granted in a prior session, setting new reminders MUST NOT trigger a second permission prompt.
- **FR-011**: Each day, at the time saved for a habit's reminder, the application MUST send a browser notification that identifies the habit by name and prompts the user to complete it.
- **FR-012**: When a reminder time is cleared ("No reminder"), the daily notification for that habit MUST stop firing from the next scheduled occurrence.
- **FR-013**: Reminder notifications MUST be delivered using the device's local time at the moment of delivery.
- **FR-014**: For habits that have a saved reminder time but notification permission is currently denied, a visible indicator MUST be shown on the habit (either on its dashboard card or in its edit modal) informing the user that notifications are blocked.

### Key Entities

- **Habit Reminder Time**: An optional attribute on a habit storing the daily time (hour and minute) at which a reminder notification should fire. Absent when "No reminder" is selected. Persists with the habit's data across sessions.
- **Reminder Time Picker**: A form control in the add/edit habit modal. Allows selection of a time in HH:MM format or the "No reminder" state. Pre-filled with the habit's current reminder time when editing.
- **Daily Reminder Notification**: A browser notification sent to the user at the habit's saved reminder time each day. Contains the habit name and a prompt to complete the habit. Fires only while the browser is open; delivery is best-effort when the app tab is closed.
- **Notification Permission State**: A browser-level flag (granted, denied, or not yet requested) that controls whether the application can send notifications. Checked and requested the first time a user saves a habit with a reminder time.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can set a reminder on a habit in under 30 seconds from opening the add/edit modal to saving.
- **SC-002**: 100% of reminder notifications include the correct habit name and are sent at the correct scheduled time (within a 60-second tolerance).
- **SC-003**: Reminder times persist correctly across 100% of page refreshes and session restarts — no saved reminder is silently lost.
- **SC-004**: The notification permission prompt is shown exactly once per user (the first time they save a habit with a reminder), never more.
- **SC-005**: Users who deny notification permission receive a clear, actionable message — 90% of usability test participants understand that they need to update browser settings to enable notifications.
- **SC-006**: Clearing a reminder ("No reminder") prevents any further notifications for that habit — verified across 100% of cleared reminders in testing.

## Assumptions

- The add and edit habit modal components already exist; this feature adds the reminder time picker field to those modals, not the modals themselves.
- Notification delivery relies on the browser's native notification system; the app does not implement a service worker or push notification infrastructure in this version. Notifications fire only while a browser tab with the app is open.
- Reminder times are always interpreted in the user's local device timezone; no timezone conversion or server-side scheduling is performed.
- A habit can have at most one reminder time; multiple daily reminder times per habit are out of scope.
- Snooze, dismiss-and-reschedule, and interactive notification actions (buttons inside the notification) are out of scope for this version.
- Notification bundling (grouping multiple same-time reminders into one notification) is out of scope; each habit sends its own notification.
- The reminder time picker field is optional; habits without a reminder time are not affected by this feature and behave exactly as before.
- Reading and writing the reminder time as part of the habit object is handled by the existing api service layer; the specific storage mechanism is an implementation detail outside this spec.
