# Task Memory: task_05.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Update Angular/Vitest coverage for the redesigned comparison dashboard without changing product search behavior.

## Important Decisions
- Keep coverage in `client/src/app/app.spec.ts`; presentational components are currently simple input-only components and can be covered through the root workflow.

## Learnings
- `CLAUDE.md` is not present in the repository.
- `rg` is not installed in this environment; use `find` for file discovery.
- Angular unit-test builder accepts `--coverage`, not `--code-coverage`; baseline coverage before edits was above 80%.
- Use label-based helpers for the search controls (`Product`, `Currency`) and scoped `aria-label` queries for dashboard regions to avoid selecting the wrong control as the dashboard grows.

## Files / Surfaces
- `client/src/app/app.spec.ts`
- `.compozy/tasks/adapt-frontend-design/task_05.md`
- `.compozy/tasks/adapt-frontend-design/_tasks.md`

## Errors / Corrections
- Baseline `npm run test -- --watch=false --code-coverage` failed with `Unknown argument: code-coverage`; corrected to `--coverage`.

## Ready for Next Run
- Test coverage was kept at the root workflow level; no component specs were added because presentational components have no independent conditional behavior beyond inputs rendered through `App`.
