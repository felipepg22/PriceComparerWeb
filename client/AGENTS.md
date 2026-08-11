# Client instructions

## Scope

This directory contains the Angular 21 standalone frontend. Application code is in `src/app/`, global styles are in `src/styles.css`, and static assets are in `public/`.

## Workflow

- Use `npm install` only when dependencies need to be installed or changed.
- Run the development server with `npm start`, the production build with `npm run build`, and tests once with `npm run test -- --watch=false`.
- The development server proxies `/api` requests to the local API. Product search requires SearXNG JSON output at `http://localhost:8080` unless the API configuration overrides it.

## Implementation guidance

- Use 2-space indentation. Follow `client/.editorconfig`, including single quotes in TypeScript.
- Use standalone imports, signal-based state, and descriptive interface names.
- Keep UI components in `src/app/components/`, domain-facing types in `src/app/models/`, and client-side integrations in `src/app/services/`.
- Before changing visual UI, layout, interaction patterns, responsive behavior, typography, spacing, or component styling, read `DESIGN.md` and apply its design tokens.
- Before changing domain terminology or user-visible product-search concepts, read `CONTEXT.md` and the relevant backend context via `../CONTEXT-MAP.md`.

## Tests and completion

- Add or update `*.spec.ts` coverage for validation, API calls, rendered state, and error or partial-failure states when those behaviors change.
- Before completing a frontend change, run `npm run build` and the relevant tests.
