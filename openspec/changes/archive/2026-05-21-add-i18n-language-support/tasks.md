## 1. Localization Preferences Foundation

- [x] 1.1 Add typed supported locale and display-currency metadata for `en-US`, `pt-BR`, `es-ES`, `BRL`, `USD`, and `EUR` under `client/src/app/`.
- [x] 1.2 Add typed translation dictionaries for all client-owned dashboard, search, state, metrics, offer, confidence, conversion, language, and display-currency labels.
- [x] 1.3 Implement an Angular preferences service with signal-based active locale and display currency state.
- [x] 1.4 Implement local-storage restoration that accepts only supported persisted locale and display-currency values.
- [x] 1.5 Implement browser-language detection with exact locale matching, supported base-language mapping, and `en-US` fallback.
- [x] 1.6 Add locale-aware formatting helpers for original prices, converted prices, counts, and confidence percentages.

## 2. Backend Conversion Rate API

- [x] 2.1 Decide and configure the display-only exchange-rate provider and acceptable freshness window in backend options.
- [x] 2.2 Add currency conversion request and response records with supported source currencies, target currency, rates, status, and freshness metadata.
- [x] 2.3 Add currency conversion options under `server/Options/` with provider endpoint, timeout, cache duration, and supported currencies.
- [x] 2.4 Implement a focused conversion-rate service under `server/Services/` with successful-rate caching, short timeout handling, cancellation support, and unsupported-currency validation.
- [x] 2.5 Register the conversion service and HTTP client in `server/Program.cs`.
- [x] 2.6 Add a minimal API endpoint for conversion-rate retrieval that does not alter product search, scraping, extraction, ranking, or diagnostics behavior.

## 3. Client Conversion Integration

- [x] 3.1 Add TypeScript models for conversion-rate requests, conversion-rate responses, rate freshness metadata, and conversion status.
- [x] 3.2 Add a client-side conversion-rate flow that requests rates only for currencies present in current results that differ from the selected display currency.
- [x] 3.3 Ensure display-currency changes refresh conversion display data without submitting a product search, changing the source-currency filter, clearing results, or reordering offers.
- [x] 3.4 Keep conversion-rate failures independent from product-search success and expose localized conversion-unavailable state for affected offers.
- [x] 3.5 Derive dashboard offer view models from the current product result, active locale, display currency, and conversion-rate state at render time.
- [x] 3.6 Preserve original extracted price and currency in each offer while showing converted prices only when supported rates are available.

## 4. Localized UI Wiring

- [x] 4.1 Replace hard-coded client-owned copy in `app.html`, `App`, and presentational components with localized labels or prepared localized view models.
- [x] 4.2 Pass localized labels and messages into `SearchPanelComponent`, `MetricsSummaryComponent`, `OfferCardComponent`, and `StateMessageComponent` without making child components own global translation dictionaries.
- [x] 4.3 Add language and display-currency selectors outside the product search form so they are visually separate from the source-currency filter.
- [x] 4.4 Ensure language switching updates UI text and formatting immediately without canceling in-flight searches, retrying requests, clearing the form, clearing results, or clearing API errors.
- [x] 4.5 Ensure product titles, seller names, source names, extraction method identifiers, backend diagnostics, warnings, and external-source content render exactly as received.
- [x] 4.6 Update component styles so the added selectors, converted prices, original prices, freshness text, and fallback messages fit cleanly on mobile and desktop.

## 5. Frontend Tests

- [x] 5.1 Add tests for valid persisted locale restoration, invalid persisted locale fallback, browser exact-locale detection, base-language mapping, and unsupported-language fallback to `en-US`.
- [x] 5.2 Add tests for display-currency persistence and separation from the product search source-currency filter.
- [x] 5.3 Update rendering tests to verify representative `en-US`, `pt-BR`, and `es-ES` UI copy across search controls, validation, loading, empty, error, metrics, offer cards, confidence labels, and offer actions.
- [x] 5.4 Add tests proving language changes preserve the active form, visible results, loading state, and API error state without issuing a product-search request.
- [x] 5.5 Add tests proving display-currency changes preserve source-currency filtering, do not submit product search, and do not reorder offers.
- [x] 5.6 Add tests for locale-aware price, count, and percentage formatting after locale changes.
- [x] 5.7 Add tests for converted price display with original price visibility, rate freshness context, matching-currency behavior, and conversion-unavailable fallback.
- [x] 5.8 Add tests proving product titles, seller names, source names, extraction methods, warnings, and backend diagnostics are not translated or string-matched.

## 6. Verification

- [x] 6.1 Run `dotnet build server/PriceComparerWeb.Api.csproj` and fix any backend build issues.
- [x] 6.2 Run `cd client && npm run test -- --watch=false` and fix any frontend test failures.
- [x] 6.3 Run `cd client && npm run build` and fix any frontend production build issues.
- [x] 6.4 Run `openspec validate add-i18n-language-support --strict` and fix any OpenSpec validation issues.
- [x] 6.5 Call `openspec-implementation-auditor` as a subagent and resolve any reported gaps before marking the implementation complete.
