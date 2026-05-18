---
status: completed
title: Update Frontend Tests for Redesigned Search Flow
type: frontend
complexity: medium
dependencies:
  - task_01
  - task_02
  - task_03
  - task_04
---

# Task 5: Update Frontend Tests for Redesigned Search Flow

## Overview
Update the Angular/Vitest coverage so the redesigned dashboard is protected against regressions. The tests should verify the preserved product search workflow and the new trust-oriented display states without depending on brittle generic selectors.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST keep coverage for blank query validation, endpoint URL, POST method, query trimming, and empty currency mapping to `null`.
- MUST verify successful responses render metrics, offer cards, seller/source, formatted price, extraction method, confidence percentage, and confidence label.
- MUST verify non-success attempted sources do not render detailed failed-source names or failure reasons in the main dashboard.
- MUST verify empty response and API error states are distinct.
- MUST avoid brittle tests that click the wrong button or input after the dashboard adds more interactive elements.
- SHOULD add coverage for selected currency request body behavior if not already present.
</requirements>

## Subtasks
- [x] 5.1 Update existing app tests to target the redesigned dashboard structure and accessible labels.
- [x] 5.2 Add request-shape tests for trimmed queries, empty currency, and selected currency values.
- [x] 5.3 Add success-state tests for metrics, offer display fields, and confidence labels.
- [x] 5.4 Add partial-failure tests that ensure successful offers stay visible and failure details stay hidden.
- [x] 5.5 Add empty-result and API-error tests with distinct assertions.
- [x] 5.6 Run frontend tests and build, then address any failures.

## Implementation Details
Modify `client/src/app/app.spec.ts` and add component-level specs only if the presentational components contain meaningful conditional rendering that is awkward to cover through `App`. Follow the TechSpec "Testing Approach" section and keep tests focused on behavior rather than exact visual styling.

### Relevant Files
- `client/src/app/app.spec.ts` — Existing root test suite using `TestBed`, `HttpTestingController`, and standalone `App` imports.
- `client/src/app/app.ts` — Source for form state, search behavior, and display helper outputs under test.
- `client/src/app/app.html` — Rendered dashboard states under test.
- `client/src/app/components/**` — Component specs may be added if root-level coverage becomes too broad.

### Dependent Files
- `client/package.json` — Defines `npm run test` and `npm run build` scripts.
- `client/tsconfig.spec.json` — Test TypeScript configuration should remain compatible with any new specs.
- `client/angular.json` — Angular test/build configuration should remain unchanged unless new assets require configuration.

### Related ADRs
- [ADR-001: Prioritize Comparison Dashboard Experience](adrs/adr-001.md) — Tests should protect scan-friendly offer comparison and trust signals.
- [ADR-002: Split Dashboard Into Presentational Components](adrs/adr-002.md) — Tests should allow component boundaries while preserving root workflow behavior.

## Deliverables
- Updated frontend tests covering redesigned search, metrics, offers, empty state, API error state, and hidden failure details.
- Any necessary component-level tests for non-trivial presentational behavior.
- Passing frontend test command.
- Passing frontend production build.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for the complete redesigned frontend search flow **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Blank query shows `Enter at least 2 characters.` without issuing an HTTP request.
  - [x] Valid query posts to `http://localhost:5235/api/products/search` with POST.
  - [x] Empty currency posts `currency: null`, while selected `BRL` posts `currency: "BRL"`.
  - [x] Successful response renders `found offers`, `candidate pages`, `attempted sources`, offer price, seller/source, extraction method, and confidence label.
  - [x] Partial-failure response does not render failed source reason text or the old `Sources not compared` section.
  - [x] Empty response renders no-comparable-offers messaging, while API failure renders the API error messaging.
- Integration tests:
  - [x] Run `cd client && npm run test -- --watch=false` successfully.
  - [x] Run `cd client && npm run build` successfully.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Frontend build succeeds.
- Tests verify the redesigned dashboard behavior without depending on removed failed-source diagnostics.
