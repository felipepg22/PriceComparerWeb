---
status: completed
title: Create Presentational Dashboard Components
type: frontend
complexity: medium
dependencies:
  - task_01
---

# Task 2: Create Presentational Dashboard Components

## Overview
Create standalone Angular presentational components for the redesigned dashboard regions. This keeps the root component focused on API state and form ownership while giving search, metrics, offers, and state messages clear rendering boundaries.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create standalone Angular components for the search surface, metrics summary, offer card, and state messages described in the TechSpec Component Overview.
- MUST keep child components input-driven and side-effect free, with no direct HTTP calls.
- MUST keep the parent-owned reactive form binding compatible with validation and submit behavior.
- MUST render offer cards from prepared dashboard offer values rather than duplicating API mapping logic inside child components.
- SHOULD keep each component small enough that it can be tested through `App` unless it gains non-trivial conditional behavior.
</requirements>

## Subtasks
- [x] 2.1 Create the search panel component for the dashboard entry surface and form controls.
- [x] 2.2 Create the metrics summary component for found offers, candidate pages, and attempted sources.
- [x] 2.3 Create the offer card component for price, title, seller/source, extraction method, confidence, and external link.
- [x] 2.4 Create the state message component for loading, empty, validation, and API error states.
- [x] 2.5 Add focused tests or parent-level assertions that prove component inputs render correctly.

## Implementation Details
Create component files under `client/src/app/components/` using Angular 21 standalone component patterns already used by `App`. Follow the TechSpec "Component Overview" section and keep API state, request submission, response state, and display helpers outside the child components.

### Relevant Files
- `client/src/app/app.ts` — Must import the new standalone components after this task.
- `client/src/app/app.html` — Current markup is the source for the component split.
- `client/src/app/app.spec.ts` — Existing root tests can cover the presentational rendering after composition.
- `client/src/app/models/product-search.ts` — Shared model types from task 01 should be used for component inputs.

### Dependent Files
- `client/src/app/app.css` — Later styling will target the new dashboard structure.
- `client/src/styles.css` — Later global typography changes should complement component rendering.
- `client/DESIGN.md` — Visual component states should match the Wise-inspired design direction in later styling.

### Related ADRs
- [ADR-001: Prioritize Comparison Dashboard Experience](adrs/adr-001.md) — Components should support fast offer scanning and dashboard comparison.
- [ADR-002: Split Dashboard Into Presentational Components](adrs/adr-002.md) — Directly requires small presentational dashboard components.

## Deliverables
- Standalone search panel, metrics summary, offer card, and state message components.
- Component inputs and outputs wired for parent-owned state without backend calls in children.
- Rendering paths ready for dashboard composition in `App`.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for component rendering through the root app **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Search panel renders product search input, currency select, and a disabled/loading submit state when loading is true.
  - [x] Metrics summary renders offer count, candidate page count, and attempted source count from inputs.
  - [x] Offer card renders title, formatted price, seller/source label, extraction method, confidence percentage, confidence label, and an external link with `target="_blank"` and `rel="noopener"`.
  - [x] State message renders distinct loading, empty, validation, and API error messages.
- Integration tests:
  - [x] Root app renders the new components after a successful API response without changing the search endpoint call.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Presentational components contain no direct `HttpClient` usage.
- Components can render the dashboard sections using only parent-provided inputs and emitted submit events.
