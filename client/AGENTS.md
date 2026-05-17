# Repository Guidelines

## Project Structure & Module Organization

PriceComparerWeb is split into two main apps. `../server/` contains the ASP.NET Core Web API targeting .NET 10, with request/response records in `../server/Models/`, configuration types in `../server/Options/`, and scraping/search logic in `../server/Services/`. This directory contains the Angular 21 standalone app; main UI files live in `src/app/`, global styles in `src/styles.css`, and static assets in `public/`. OpenSpec change artifacts live under `../openspec/changes/`.

## Design Guidance

Use `DESIGN.md` as the source of truth for visual design, layout, interaction patterns, and UI polish decisions. Before making frontend UI changes, read the relevant parts of `DESIGN.md` and align new components, styling, spacing, typography, states, and responsive behavior with it.

## Build, Test, and Development Commands

- `npm install`: install frontend dependencies.
- `npm start`: run Angular dev server at `http://localhost:4200`.
- `npm run build`: create a production frontend build.
- `npm run test -- --watch=false`: run frontend tests once.
- `dotnet build ../server/PriceComparerWeb.Api.csproj`: build the backend from this directory.
- `dotnet run --project ../server/PriceComparerWeb.Api.csproj`: run the API locally from this directory.

Product search expects SearXNG at `http://localhost:8080` with JSON output enabled.

## Coding Style & Naming Conventions

Use 4-space indentation for C# and 2-space indentation for TypeScript, HTML, and CSS. C# uses nullable reference types, records for DTOs, PascalCase types/methods, and camelCase locals. Angular components use standalone imports, signal-based state, and descriptive interface names. Keep API models in `Models`, runtime settings in `Options`, and business logic in focused services.

## Testing Guidelines

Frontend tests use Vitest through Angular CLI. Test files follow `*.spec.ts` and should cover validation, API calls, rendered state, and error/partial-failure states. Backend currently has no test project; verify backend changes with `dotnet build` and manual API checks until a test project is added.

## Commit & Pull Request Guidelines

Use Conventional Commits in English, matching existing history: `feat: add product search with SearXNG`, `docs(readme): update project paths`, `feat(scraper): scaffold Angular app and .NET scraping API`. Pull requests should include a short summary, verification commands run, linked issue/change when applicable, and screenshots for UI changes. Mention any required local services, especially SearXNG.

## Security & Configuration Tips

Do not commit credentials or private endpoints. Keep local overrides in development settings or environment variables. Do not bypass paywalls, authentication, anti-bot controls, or site terms when scraping.
