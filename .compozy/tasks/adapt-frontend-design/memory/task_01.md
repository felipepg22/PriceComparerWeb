# Task Memory: task_01.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Extract/shared frontend search response types and dashboard offer view-model helpers while preserving the root-owned search workflow and backend API contract.

## Important Decisions
- Keep API/form ownership in `App`; expose prepared `DashboardOffer` values through a computed signal without changing response order.
- Use deterministic `en-US` currency formatting for display helper output and threshold confidence labels (`High` >= 0.8, `Medium` >= 0.5, else `Low`).

## Learnings
- `rg` is unavailable in this environment; use `find`/`sed` fallbacks for repository inspection.
- Workspace already contained uncommitted frontend redesign/model/component changes at task start; continue from them without reverting.
- `npm run test -- --watch=false` passed before additional edits with 9 tests passing.
- `npm run test -- --watch=false --coverage` initially failed because `@vitest/coverage-v8` was missing; adding the dev dependency enabled coverage reporting.

## Files / Surfaces
- `client/package.json`
- `client/package-lock.json`
- `client/src/app/app.ts`
- `client/src/app/app.html`
- `client/src/app/app.spec.ts`
- `client/src/app/models/product-search.ts`
- `client/src/app/components/*`

## Errors / Corrections
- Added explicit confidence-threshold display coverage for 0.8/0.5/0.49 after noticing the existing passing tests only covered 0.95 and 0.6.
- Removed an extra exported model-level dashboard mapper during self-review so offer view-model derivation remains owned by `App`.

## Ready for Next Run
- Frontend verification after edits: `npm run test -- --watch=false --coverage` passed with 10 tests and 99.5% statements / 99.13% lines; `npm run build` passed.
- Build/test commands emit a `NO_COLOR`/`FORCE_COLOR` warning. `npm install` also reported current shell `node` v20.18.1 engine warnings, while project scripts invoke `node@20.19.0`.
