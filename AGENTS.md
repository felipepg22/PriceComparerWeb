# Repository instructions

## Scope

PriceComparerWeb contains an Angular 21 client, an ASP.NET Core API targeting .NET 10, a backend regression-test harness, and OpenSpec artifacts. Keep changes within the affected app and preserve unrelated worktree changes.

## Essential workflow

- Build the API with `dotnet build server/PriceComparerWeb.Api.csproj`.
- Run backend regression checks with `dotnet run --project tests/PriceComparerWeb.Api.Tests/PriceComparerWeb.Api.Tests.csproj`.
- From `client/`, build with `npm run build` and run tests once with `npm run test -- --watch=false`.
- Run the API locally with `dotnet run --project server/PriceComparerWeb.Api.csproj`; product search requires SearXNG JSON output at `http://localhost:8080` unless configuration overrides it.

## Critical constraints

- Do not commit credentials, private endpoints, or populated `.env` files. Do not bypass paywalls, authentication, anti-bot controls, or site terms when scraping.
- Use 4-space indentation for C# and 2-space indentation for TypeScript, HTML, and CSS. Use nullable reference types, PascalCase types and methods, and camelCase C# locals.
- Keep API request/response models in `server/Models/`, configuration types in `server/Options/`, and focused business logic in `server/Services/`.
- Use Conventional Commits in English. Pull requests must include a summary, verification performed, the related issue/change, UI screenshots when applicable, and required local services.

## Task routes

- For frontend changes, read `client/AGENTS.md`; it covers Angular commands, standalone and signal-based conventions, tests, and UI-design routing.
- Before changing domain terminology, business rules, or invariants, read `CONTEXT-MAP.md` and the relevant `client/CONTEXT.md` or `server/CONTEXT.md`. Follow `docs/agents/domain.md` for domain-documentation and ADR routing.
- For GitHub Issues, PRDs, or triage work, follow `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`.
- For OpenSpec work, use artifacts under `openspec/changes/`. Before considering implementation complete, call `openspec-implementation-auditor` as a subagent to verify tasks are implemented correctly, completely, and traceably.

## Completion checks

Run the focused checks that cover the changed area. For backend behavior, run the regression-test harness in addition to building the API; for frontend behavior, run the Angular build and relevant tests.
