# Repository rule router

PriceComparerWeb is a product-offer comparison application. It has an Angular 21 client, an ASP.NET Core API on .NET 10, a self-hosted SearXNG discovery dependency, and backend and frontend verification harnesses.

Repository rules live under `rules/`. Use this file to orient the task and route to the binding guidance; do not copy routed rules into plans or implementation notes.

## Essential workflow

1. Read `rules/README.md` to classify the task by affected paths and concerns.
2. Read `rules/core.md` for every task.
3. Read every additional rule file whose trigger matches. More than one may apply.
4. Inspect the relevant implementation, tests, configuration, and documentation before editing.
5. Preserve unrelated worktree changes and keep generated output out of the authored diff.
6. Before completion, run the checks required by `rules/verification.md` for every changed area.

When implementing from a plan, TDD, PRD, ADR, issue, or task brief, follow its `Applicable rules` links and recalculate applicability from the actual scope. Do not edit the originating artifact during implementation.

## Project layout

- `client/`: Angular application, presentation modules, client integrations, and frontend tests. Its nested `AGENTS.md` also applies.
- `server/`: ASP.NET Core API, product search, page extraction, ranking, and offer-email behavior. Its nested `AGENTS.md` also applies.
- `tests/`: executable backend verification harness.
- `searxng/`: local search-service configuration.
- `rules/`: canonical repository gates and guidelines.
- `docs/agents/`: issue-tracker and triage operating guidance.

## Canonical commands

- Backend build: `dotnet build server/PriceComparerWeb.Api.csproj`
- Backend verification: `dotnet run --project tests/PriceComparerWeb.Api.Tests/PriceComparerWeb.Api.Tests.csproj`
- Frontend build: run `npm run build` from `client/`.
- Frontend tests: run `npm run test -- --watch=false` from `client/`.
- Harness or repository-rule work: `npx harness-score`
- Final hygiene: `git diff --check` and `git status --short`

Product Search requires a SearXNG instance with JSON output. The local default is `http://localhost:8080`; keep deployment endpoints configurable and never commit private endpoints or credentials.

## Task routes

- Production code in `client/` or `server/`: read `rules/architecture.md`.
- Any change under `client/`: read `rules/frontend.md` and `client/AGENTS.md`.
- Any change under `server/`: read `rules/backend.md` and `server/AGENTS.md`.
- Code, configuration, tests, harness, or rule changes: read `rules/verification.md` before completion.
- Terminology, business rules, invariants, contracts, ranking, extraction, or user-visible product concepts: read `rules/domain.md`, then its routed context and ADR documents.
- Plans, TDDs, PRDs, ADRs, issues, or task briefs: read `rules/planning.md`.
- Credentials, configuration, user input, outbound URLs, scraping, email, external integrations, or dependencies: read `rules/security.md`.
- GitHub issue, PRD, or triage work: read `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`.

## Critical constraints

- Ask before adding a production dependency or making a breaking cross-tier contract change.
- Keep secrets, populated environment files, private endpoints, generated output, and secret-bearing logs out of Git.
- Treat `PRODUCT.md`, `CONTEXT-MAP.md`, and the context documents routed by `rules/domain.md` as the product and domain authorities.
- Treat existing `openspec/` content as historical artifacts, not implementation authority; OpenSpec is no longer a project workflow.
