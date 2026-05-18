---
status: completed
title: Compose Dashboard Layout and Hide Failed-Source Details
type: frontend
complexity: medium
dependencies:
  - task_01
  - task_02
---

# Task 3: Compose Dashboard Layout and Hide Failed-Source Details

## Overview
Replace the root template with the comparison dashboard composition while preserving the current search workflow. This task removes detailed failed-source diagnostics from the main experience and keeps successful offers, summary metrics, empty states, and errors easy to scan.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST keep `App` as the owner of `HttpClient`, reactive form state, signals, request lifecycle, response state, and API error state.
- MUST preserve `POST http://localhost:5235/api/products/search`, request body shape, backend error display behavior, and API offer order.
- MUST show found offers, candidate pages, and attempted sources after a search response.
- MUST render successful offers even when some attempted sources fail.
- MUST not render the detailed "Sources not compared" list, failed source names, or failed source reasons in the main dashboard.
- SHOULD distinguish "no comparable offers found" from API failure using redesigned state messages.
</requirements>

## Subtasks
- [x] 3.1 Replace the root template with a dashboard composition using the presentational components.
- [x] 3.2 Wire parent-owned form submission, validation state, loading state, result state, and API error state into the dashboard.
- [x] 3.3 Render summary metrics for found offers, candidate pages, and attempted sources after successful responses.
- [x] 3.4 Render empty, loading, and API error states through the shared state message component.
- [x] 3.5 Remove the detailed failed-source section and any failed reason text from the main user experience.
- [x] 3.6 Add tests that prove offers remain visible when attempted sources include failures but failure details are hidden.

## Implementation Details
Modify `App` and its template to compose the presentational dashboard components created in task 02. Follow the TechSpec "Development Sequencing" and "Key Decisions" sections: preserve result order, hide partial-failure details, and avoid backend or service-layer changes.

### Relevant Files
- `client/src/app/app.ts` — Root orchestration for API state, display helpers, and component imports.
- `client/src/app/app.html` — Main dashboard composition and conditional rendering live here.
- `client/src/app/app.spec.ts` — Must update partial-failure assertions to expect hidden details.
- `client/src/app/components/**` — Presentational components receive all data needed for the dashboard layout.

### Dependent Files
- `client/src/app/app.css` — Dashboard composition will need matching layout and responsive styles in task 04.
- `client/src/styles.css` — Global typography updates should support the new layout.
- `client/DESIGN.md` — Provides the visual language constraints used by the composed dashboard.

### Related ADRs
- [ADR-001: Prioritize Comparison Dashboard Experience](adrs/adr-001.md) — Requires the dashboard-first offer comparison surface.
- [ADR-002: Split Dashboard Into Presentational Components](adrs/adr-002.md) — Requires root composition with presentational children and hidden partial-failure details.

## Deliverables
- Root dashboard composition that preserves current search behavior.
- Summary metrics and offer cards rendered from successful responses.
- Empty, loading, validation, and API error states integrated into the dashboard.
- Detailed failed-source names and reasons removed from the main UI.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for partial-failure and empty-result flows **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Successful response with one offer renders offer title, seller/source label, metrics, and confidence display.
  - [x] Response with zero offers renders the redesigned "no comparable offers" state and no offer cards.
  - [x] API failure renders the backend error message when provided.
  - [x] Partial-failure response renders successful offers and attempted source count but does not render failed source reason text such as `"Candidate fetch timed out."`.
- Integration tests:
  - [x] Full root flow from entering a query to flushed API response renders dashboard metrics and offer cards without changing endpoint behavior.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- The main dashboard no longer exposes detailed failed-source diagnostics.
- Search, validation, loading, success, empty, and error flows remain usable through the redesigned composition.
