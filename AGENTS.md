# Repository rule router

PriceComparerWeb contains an Angular client and an ASP.NET Core API. Repository rules live under `rules/`; this file only routes agents to them.

## Required loading

1. Read `rules/README.md` to classify the task.
2. Read `rules/core.md` for every task.
3. Read every additional rule file whose trigger matches the task. More than one may apply.
4. When working from a plan, TDD, PRD, ADR, issue, or task brief, follow its `Applicable rules` links and recalculate applicability if the actual scope differs. Do not edit the originating artifact during implementation.

## Operational references

- GitHub issue, PRD, or triage work: `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`.
- Product and domain background: `PRODUCT.md`, `CONTEXT-MAP.md`, and the context documents routed by `rules/domain.md`.

OpenSpec is no longer a project workflow. Treat existing `openspec/` content as historical artifacts, not implementation authority.
