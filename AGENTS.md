# Repository Guidelines

## Project Structure & Module Organization

PriceComparerWeb is split into two main apps. `server/` contains the ASP.NET Core Web API targeting .NET 10, with request/response records in `server/Models/`, configuration types in `server/Options/`, and scraping/search logic in `server/Services/`. `client/` contains the Angular 21 standalone app; main UI files live in `client/src/app/`, global styles in `client/src/styles.css`, and static assets in `client/public/`. OpenSpec change artifacts live under `openspec/changes/`.

## Build, Test, and Development Commands

- `dotnet build server/PriceComparerWeb.Api.csproj`: build the backend.
- `dotnet run --project server/PriceComparerWeb.Api.csproj`: run the API locally.
- `cd client && npm install`: install frontend dependencies.
- `cd client && npm start`: run Angular dev server at `http://localhost:4200`.
- `cd client && npm run build`: create a production frontend build.
- `cd client && npm run test -- --watch=false`: run frontend tests once.

Product search expects SearXNG at `http://localhost:8080` with JSON output enabled.

## Coding Style & Naming Conventions

Use 4-space indentation for C# and 2-space indentation for TypeScript, HTML, and CSS. C# uses nullable reference types, records for DTOs, PascalCase types/methods, and camelCase locals. Angular components use standalone imports, signal-based state, and descriptive interface names. Keep API models in `Models`, runtime settings in `Options`, and business logic in focused services.

## Testing Guidelines

Frontend tests use Vitest through Angular CLI. Test files follow `*.spec.ts` and should cover validation, API calls, rendered state, and error/partial-failure states. Backend currently has no test project; verify backend changes with `dotnet build` and manual API checks until a test project is added.

## Commit & Pull Request Guidelines

Use Conventional Commits in English, matching existing history: `feat: add product search with SearXNG`, `docs(readme): update project paths`, `feat(scraper): scaffold Angular app and .NET scraping API`. Pull requests should include a short summary, verification commands run, linked issue/change when applicable, and screenshots for UI changes. Mention any required local services, especially SearXNG.

## Security & Configuration Tips

Do not commit credentials or private endpoints. Keep local overrides in development settings or environment variables. Do not bypass paywalls, authentication, anti-bot controls, or site terms when scraping.

## OpenSpec Verification Policy

Before considering OpenSpec work complete, always call `openspec-implementation-auditor` as a subagent to verify all OpenSpec tasks were implemented correctly, completely, and traceably.
