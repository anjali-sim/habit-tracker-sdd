<!--
Sync Impact Report
==================
Version change: (none) → 1.0.0 (initial ratification)
Modified principles: N/A — initial setup
Added sections: Core Principles (4), Technology Stack, Development Conventions, Governance
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md — Constitution Check gates already reflect principle-driven checks; Testing field should reflect "No tests"
  ✅ spec-template.md — User Scenarios section already marked optional for tests; no changes needed
  ✅ tasks-template.md — Tests note already states optional; no changes needed
Follow-up TODOs: None — all placeholders resolved
-->

# Habit Tracker Constitution

## Core Principles

### I. Clean Code

Every source file MUST be readable and maintainable at a glance.

- Functions and components MUST do one thing only; extract when a unit exceeds a single
  clear responsibility.
- Naming MUST be unambiguous: prefer explicit descriptive names over abbreviations.
- Dead code, console.log statements, and commented-out blocks MUST NOT be committed.
- Files MUST stay under ~200 lines; split larger files into focused modules.

### II. Simple UX

The user interface MUST be intuitive without tooltips, onboarding flows, or documentation.

- Every interactive element MUST communicate its purpose through label, icon, or
  placement alone.
- Flows MUST require the fewest possible steps to complete a core action.
- Visual feedback (loading, error, success states) MUST be present for every async
  operation.
- No feature is added unless it removes friction or delivers clear user value.

### III. Mobile-First Responsive Design

All UI MUST be designed and verified at mobile viewport (≥320 px) before desktop.

- Layouts MUST use Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`) and MUST
  work correctly at every breakpoint.
- Touch targets MUST be at minimum 44×44 px.
- No horizontal scroll is permitted at any supported viewport width.
- Desktop enhancements are additive; they MUST NOT break the mobile baseline.

### IV. Minimal Dependencies

The production dependency tree MUST remain as small as possible.

- A new dependency MUST NOT be added if the required functionality can be implemented
  in under ~30 lines of idiomatic TypeScript.
- Every dependency introduction requires explicit justification in the PR description.
- Approved production dependencies: `react ^19.2.6`, `react-dom ^19.2.6`,
  `react-router-dom` (v6), `tailwindcss` (dev/build).
- No UI component libraries (e.g., MUI, Ant Design, Chakra) are permitted.

## Technology Stack

| Concern      | Choice                             | Version (package.json) |
| ------------ | ---------------------------------- | ---------------------- |
| UI framework | React (functional components only) | ^19.2.6                |
| Language     | TypeScript (strict mode)           | ~6.0.2                 |
| Build tool   | Vite                               | ^8.0.12                |
| Styling      | Tailwind CSS                       | per install            |
| Routing      | React Router                       | v6                     |
| State        | Custom store in `/src/store`       | —                      |
| API layer    | `/src/api` modules                 | —                      |

No UI libraries are permitted. All visual components MUST be built with Tailwind
utility classes and plain HTML elements.

## Development Conventions

- **No tests of any kind** — unit, integration, and e2e tests are explicitly excluded
  from this project. This rule supersedes any other guidance or template instruction.
- One component per file; file name MUST match the exported component name (PascalCase).
- Functional components only — class components are forbidden.
- TypeScript strict mode MUST be enabled (`"strict": true` in tsconfig).
- Folder structure:
  - `/src/components` — reusable UI components
  - `/src/pages` — route-level page components
  - `/src/store` — application state and reducers
  - `/src/api` — data-fetching and persistence modules
  - `/src/types` — shared TypeScript type and interface definitions
  - `/src/utils` — pure utility functions
- No file may import from a sibling folder it does not own; cross-cutting imports flow
  through `types` or `utils`.

## Governance

This constitution supersedes all other project guidance where conflicts exist.
Amendments MUST be documented with a version bump, rationale, and updated
`LAST_AMENDED_DATE` before merging.

- MAJOR bump: removal or redefinition of a principle, or a stack change.
- MINOR bump: new principle or section added.
- PATCH bump: clarifications, typo fixes, or non-semantic wording refinements.

All PRs MUST be reviewed against these principles before merge. Any deviation requires
an explicit exception note in the PR and a PATCH or higher constitution amendment.

**Version**: 1.0.0 | **Ratified**: 2026-05-21 | **Last Amended**: 2026-05-21
