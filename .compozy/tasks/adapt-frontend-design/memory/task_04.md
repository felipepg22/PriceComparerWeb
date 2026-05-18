# Task Memory: task_04.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Apply the Wise-inspired visual system from `client/DESIGN.md` to the already-composed Angular dashboard without changing backend contracts, routing, or search behavior.
- Baseline before task-specific edits: `npm run test -- --watch=false` and `npm run build` both pass; visual task remains unfinished because CSS uses scattered hard-coded values and lacks full tokenized responsive overflow safeguards.
- Task implementation complete after verification: Wise-inspired tokens and responsive CSS are applied, long-content unit coverage was added, and mobile/desktop Playwright inspection found no horizontal overflow.

## Important Decisions
- Keep visual-system tokens in root-scoped CSS custom properties and consume them from presentational component CSS to avoid TypeScript or API changes.
- The search panel submit button spans its own row because a three-column form squeezed the product input inside the desktop hero side panel.

## Learnings
- `rg` is unavailable in this environment; use `find`/`sed` for discovery.
- Shared workflow memory was an empty template at task start; no prior durable constraints were present.
- Temporary Playwright browser cache was used for responsive inspection at 390x844 and 1280x900 with a mocked API response containing long title, seller, source, extraction label, and price.

## Files / Surfaces
- Expected task surfaces: `client/src/styles.css`, `client/src/app/app.css`, component CSS/HTML under `client/src/app/components/`, and focused assertions in `client/src/app/app.spec.ts`.
- Touched task surfaces: `client/src/styles.css`, `client/src/app/app.css`, `client/src/app/components/search-panel.component.css`, `client/src/app/components/metrics-summary.component.css`, `client/src/app/components/offer-card.component.css`, `client/src/app/components/state-message.component.css`, and `client/src/app/app.spec.ts`.

## Errors / Corrections
- Initial desktop responsive screenshot showed the product input squeezed to roughly 76px in the hero side panel; corrected by changing the search panel grid to two columns plus a full-width submit row.

## Ready for Next Run
- Verification evidence: `npm run test -- --watch=false` passed with 11 tests; `npm run test -- --watch=false --coverage` passed with 99.5% statements / 99.13% lines; `npm run build` passed; Playwright responsive inspection reported mobile and desktop scroll widths equal to viewport widths and 48px offer link height.
