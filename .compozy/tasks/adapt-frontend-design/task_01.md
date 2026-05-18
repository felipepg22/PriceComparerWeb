---
status: completed
title: Extract Shared Search Models and Dashboard View Helpers
type: frontend
complexity: medium
dependencies: []
---

# Task 1: Extract Shared Search Models and Dashboard View Helpers

## Overview
Create shared frontend model definitions and root-level dashboard display helpers so the redesigned components can receive clean, prepared inputs. This task preserves the existing backend contract while giving the dashboard a stable view model for price, seller/source fallback, extraction method, and confidence display.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST preserve the existing `ProductSearchResponse`, `ProductOffer`, and `AttemptedSource` response shapes used by the backend.
- MUST expose a dashboard offer view model that includes title, formatted price, seller label, source name, extraction method, confidence percentage, confidence label, and URL.
- MUST derive confidence labels as High for confidence >= 0.8, Medium for confidence >= 0.5 and < 0.8, and Low for confidence < 0.5.
- MUST keep request submission state, validation state, and API ownership in the root `App` component.
- SHOULD keep formatting helpers deterministic and easy to cover through existing Angular component tests.
</requirements>

## Subtasks
- [x] 1.1 Move or export frontend search response interfaces so presentational components can import them.
- [x] 1.2 Add dashboard view-model typing for offer display values described in the TechSpec Core Interfaces section.
- [x] 1.3 Add derived helpers in `App` for formatted price, seller/source fallback, confidence percentage, and confidence label.
- [x] 1.4 Preserve the existing API endpoint, request body shape, query trimming, currency null mapping, and error extraction behavior.
- [x] 1.5 Add or update tests that verify confidence labels and request body behavior for the derived display path.

## Implementation Details
Create or modify the smallest set of frontend files needed to share API response models and prepare dashboard display values. Follow the TechSpec "Core Interfaces" and "Data Models" sections for the view-model shape, but do not change backend DTOs, endpoint paths, or result ordering.

### Relevant Files
- `client/src/app/app.ts` — Currently owns local interfaces, signals, the search form, API lifecycle, and `formatPrice`.
- `client/src/app/app.spec.ts` — Existing Vitest coverage should verify request shape and rendered display values.
- `client/src/app/models/product-search.ts` — Likely place for shared product search and dashboard view-model interfaces if extracting from `app.ts`.
- `.compozy/tasks/adapt-frontend-design/_techspec.md` — Defines dashboard offer display fields and confidence thresholds.

### Dependent Files
- `client/src/app/app.html` — Will consume prepared dashboard values after later composition work.
- `client/src/app/components/**` — New presentational components from later tasks will import or receive these models.
- `client/src/app/app.css` — Later visual work may depend on stable class and data boundaries.

### Related ADRs
- [ADR-002: Split Dashboard Into Presentational Components](adrs/adr-002.md) — Requires shared inputs and root-owned display logic for child components.

## Deliverables
- Shared frontend model definitions for product search responses and dashboard offers.
- Root-level dashboard display helpers that preserve existing search behavior.
- Confidence percentage and High/Medium/Low labels available to the redesigned offer UI.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for the root search-to-display flow **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Blank query marks the form as touched and keeps the validation message visible.
  - [x] Submitting `"  iphone 15  "` posts `{ query: "iphone 15", currency: null }` to `http://localhost:5235/api/products/search`.
  - [x] Confidence values `0.8`, `0.5`, and `0.49` render as High, Medium, and Low respectively through the display path.
  - [x] Missing seller falls back to the source name in the prepared offer display.
- Integration tests:
  - [x] Successful API response renders a formatted price, seller/source label, extraction method, confidence percentage, and confidence label for an offer.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Existing backend request and response contracts are unchanged.
- Dashboard display helpers produce all fields needed by the TechSpec offer card design.
