## Why

PriceComparerWeb currently presents the user experience in a single hard-coded language, which limits usability for shoppers who expect English, Brazilian Portuguese, or Spanish interface text. Adding explicit localization support now establishes a durable path for translated UI copy, locale-aware formatting, display currency conversion, and future language expansion.

## What Changes

- Add application language support for `en-US`, `pt-BR`, and `es-ES`.
- Detect the browser language on first visit when no saved language exists, using `en-US` as the fallback when detection is unavailable or unsupported.
- Provide localized user-facing UI text across the Angular app, including search controls, status messages, summaries, result cards, validation feedback, and error states.
- Format prices, counts, and other locale-sensitive values according to the selected application locale.
- Convert displayed offer prices into a selected supported display currency when exchange rates are available, while preserving the original extracted price and currency.
- Provide a language selection experience that lets users switch languages without losing the active search state.
- Persist the selected language so the app reuses the user's preference on later visits.
- Keep product discovery, SearXNG queries, and scraping behavior unchanged for this change; backend API changes should be limited to currency conversion inputs/outputs and rate metadata.

## Capabilities

### New Capabilities

- `app-localization`: Defines supported application locales, browser-language auto-detection, localized UI copy, user language selection, preference persistence, locale-aware display formatting, and display currency conversion.

### Modified Capabilities

None.

## Impact

- Affects Angular UI components, templates, tests, and client-side formatting helpers under `client/src/app/`.
- May add client-side localization assets or translation dictionaries for `en-US`, `pt-BR`, and `es-ES`.
- May add backend currency conversion options, services, rate metadata, and API contract fields needed to convert display prices.
- Does not change SearXNG configuration, scraping constraints, anti-bot behavior, or product discovery ranking.
