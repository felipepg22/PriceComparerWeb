---
status: completed
title: Apply Wise-Inspired Responsive Visual System
type: frontend
complexity: medium
dependencies:
  - task_02
  - task_03
---

# Task 4: Apply Wise-Inspired Responsive Visual System

## Overview
Apply the visual language from `client/DESIGN.md` to the composed dashboard. The redesigned frontend should feel calm, credible, and scan-friendly on mobile, tablet, and desktop while keeping product comparison as the first-screen experience.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST use the `client/DESIGN.md` direction: sage-tinted canvas, white cards, near-black ink, lime primary actions, heavy display typography, and 24px rounded cards/buttons.
- MUST maintain comfortable touch targets for inputs, selects, buttons, and offer links.
- MUST keep metrics visually secondary to offer prices and source credibility.
- MUST support mobile layouts without horizontal scrolling, text overlap, or cramped offer cards.
- SHOULD update global typography to an open-source font fallback consistent with the design reference.
- SHOULD avoid adding a separate marketing landing page or extra pre-search step.
</requirements>

## Subtasks
- [x] 4.1 Update global typography and base document styles to align with the design reference.
- [x] 4.2 Add dashboard design tokens for color, spacing, typography, borders, and focus states.
- [x] 4.3 Style the search surface, metrics summary, offer cards, state messages, and primary actions.
- [x] 4.4 Add responsive rules for mobile, tablet, and desktop dashboard layouts.
- [x] 4.5 Verify that long product titles, prices, seller names, and button text do not overlap or cause horizontal scrolling.
- [x] 4.6 Add or update tests that assert key state text remains visible after the style/layout changes.

## Implementation Details
Modify component-scoped styles and global styles to reflect `client/DESIGN.md`. Use the TechSpec "Impact Analysis" and "Technical Considerations" sections to keep styling scoped to the frontend redesign and avoid backend or routing changes.

### Relevant Files
- `client/DESIGN.md` — Source of visual tokens and design language.
- `client/src/styles.css` — Current global font import and document base styles.
- `client/src/app/app.css` — Current root-scoped styles and likely home for dashboard layout tokens.
- `client/src/app/components/**` — Component styles may be needed depending on how task 02 structures files.

### Dependent Files
- `client/src/app/app.html` — Class names and layout structure from task 03 determine styling targets.
- `client/src/app/app.spec.ts` — Rendered text assertions should continue to pass after visual changes.
- `client/angular.json` — Build configuration should remain unchanged unless style asset configuration is needed.

### Related ADRs
- [ADR-001: Prioritize Comparison Dashboard Experience](adrs/adr-001.md) — Visual hierarchy must serve offer comparison and trust.
- [ADR-002: Split Dashboard Into Presentational Components](adrs/adr-002.md) — Styles should respect the new component boundaries.

## Deliverables
- Wise-inspired dashboard styling for search, metrics, offers, and state messages.
- Responsive mobile, tablet, and desktop layouts without horizontal overflow.
- Updated global font/base styling consistent with `client/DESIGN.md`.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for responsive dashboard rendering **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Search form, metrics, offer cards, empty state, and API error text remain queryable in the DOM after styling changes.
  - [ ] Loading state still disables the submit action while preserving visible progress text.
  - [ ] Offer link remains accessible and retains external-link attributes after styling.
- Integration tests:
  - [ ] Run the Angular build and inspect the redesigned dashboard manually at mobile and desktop widths for no horizontal scrolling or overlapping text.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- The app visibly matches the `client/DESIGN.md` Wise-inspired visual system.
- Mobile users can search and compare offers without horizontal scrolling or overlapping content.
