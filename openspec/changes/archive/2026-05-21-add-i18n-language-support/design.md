## Context

PriceComparerWeb currently ships a single Angular dashboard with hard-coded English UI text in the root template and child components. The client formats prices through `Intl.NumberFormat` in `client/src/app/models/product-search.ts`, but that helper is fixed to `en-US`, and confidence labels/status messages are also fixed English strings.

The backend product-search contract returns locale-neutral product data: product titles, numeric prices, ISO currency codes, counts, attempted-source details, warnings, and error strings. It does not currently expose exchange rates, converted prices, or rate freshness metadata.

Search orchestration, SearXNG querying, scraping, extraction, cancellation, timeout handling, partial-failure warnings, and unsupported-source-currency validation are product-search concerns and should remain behaviorally unchanged. Currency conversion is a display concern layered on top of extracted offer prices.

## Goals / Non-Goals

**Goals:**

- Support `en-US`, `pt-BR`, and `es-ES` as selectable application locales in the Angular app.
- Detect the browser language on first visit when no persisted language preference exists, selecting a supported locale when possible and falling back to `en-US` when detection is unavailable or unsupported.
- Localize all client-owned UI copy, including hero text, form labels, button states, validation messages, empty/loading/error states, summary labels, confidence labels, conversion labels, and offer actions.
- Let users select a supported display currency for converted offer prices and persist that preference with the selected language.
- Convert displayed offer prices into the selected display currency when exchange rates are available, while preserving the original extracted price and currency.
- Format original prices, converted prices, counts, and percentages with the selected locale.
- Allow language and display-currency switching without clearing the active search form, current results, loading state, or API error state.
- Keep localization and conversion formatting typed and discoverable so future UI copy and display values do not drift back into hard-coded template strings.

**Non-Goals:**

- No changes to SearXNG provider queries, ranking, scraping, extraction methods, anti-bot behavior, or source filtering.
- No translation of product titles, seller names, source names, extraction method identifiers, backend diagnostics, or external-source content.
- No checkout-grade financial guarantees, historical exchange rates, arbitrary custom currencies, or currency conversion beyond the supported app currencies.
- No change to the existing search currency filter semantics; filtering by `BRL`, `USD`, or `EUR` remains distinct from display currency conversion.
- No route-based locale prefixes or server-side rendering.

## Decisions

### 1. Use a client-side preferences service with typed dictionaries

Add an Angular service under `client/src/app/` that owns supported locale metadata, supported display-currency metadata, active preference signals, persistence, browser-language detection, translation lookup, and locale-aware formatting helpers. Store translations in TypeScript dictionaries rather than adding Angular compile-time i18n extraction.

Initialize the active locale in this order:

1. Use a valid persisted locale when one exists.
2. Otherwise inspect `navigator.languages` and `navigator.language`, matching exact supported locales first and then supported base languages such as `en`, `pt`, and `es`.
3. Fall back to `en-US` when browser detection is unavailable, empty, malformed, or unsupported.

Rationale: the app is a small standalone Angular surface with runtime language and display-currency switching as explicit requirements. Angular compile-time i18n is strong for build-per-locale deployments, but it makes in-session switching heavier and would require more build configuration for little benefit here.

Alternatives considered:

- Angular built-in i18n: rejected because it is build-oriented and less ergonomic for switching languages without losing active state.
- Third-party i18n dependency: rejected until the app has enough translation complexity to justify another dependency.
- Ad hoc object literals in components: rejected because it would spread localization concerns across templates and make test coverage weaker.
- Use only explicit language selection with no browser-language detection: rejected because first-time users should get the best supported language automatically when the browser exposes one.

### 2. Separate search currency filtering from display currency conversion

Keep the existing product search request `currency` field as a source-currency filter. Add a separate display-currency preference for conversion, shown outside the product search form or clearly separated from search filters. Changing display currency may fetch conversion rates, but it must not submit a new product search or change API-ranked offer order.

Rationale: users can reasonably want to search all offers while seeing comparable converted prices, or filter source prices while still viewing converted values. Reusing one control for both jobs would make the search behavior ambiguous.

Alternatives considered:

- Reuse the existing currency selector as both filter and display currency: rejected because it would silently change product discovery semantics.
- Remove source-currency filtering and only convert display prices: rejected because the existing API and UI already expose source-currency filtering.

### 3. Add a backend conversion-rate service, not conversion inside scraping

Add a focused backend currency conversion capability with options under `server/Options/` and service logic under `server/Services/`. The service should provide rates for the supported currencies, include `FetchedAtUtc`/freshness metadata, cache successful rate lookups briefly, and use short timeouts. The Angular app can request rates for the currencies present in the current result set and compute display prices while preserving each offer's original `PriceAmount` and `Currency`.

If rates are unavailable, timed out, canceled, or unsupported, product search should still succeed and the UI should show original prices with a localized conversion-unavailable state.

Rationale: exchange rates are not a property of scraped product pages. Keeping conversion in a separate backend service avoids coupling scraping reliability to rate-provider reliability and gives the UI enough metadata to be honest about converted values.

Alternatives considered:

- Hard-code exchange rates in the client: rejected because rates become stale and unverifiable.
- Convert prices during scraping/extraction: rejected because it mixes source data extraction with unrelated market data.
- Call a third-party rate provider directly from Angular: rejected because provider details, credentials, caching, and timeout policy belong on the backend.

### 4. Keep product-search data locale-neutral

Continue sending the same core product-search body: trimmed `query` and source `currency` filter or `null`. Product titles, seller names, source names, extraction method identifiers, warnings, and server errors should be displayed as received. API changes for this feature should be limited to a conversion-rate contract and any explicit conversion metadata required by the client; they should not introduce locale-specific product-search behavior.

Rationale: localization changes presentation, and conversion changes price display. Neither should alter which candidates are discovered, scraped, extracted, ranked, canceled, timed out, or partially failed.

Alternatives considered:

- Send `Accept-Language` or a locale field to product search: deferred because backend search behavior is not locale-sensitive in this change.
- Translate backend `error` strings into UI messages by string matching: rejected because it is brittle. The client should localize its fallback wrapper text and display backend-provided details as received.

### 5. Format display values from active preferences at render time

Move `formatPriceAmount` to accept a locale, or wrap it in the preferences service, and compute dashboard offers from `result()`, `activeLocale()`, `displayCurrency()`, and the current conversion-rate state. Use `Intl.NumberFormat(locale, { style: 'currency', currency })` for original and converted prices, `Intl.NumberFormat(locale)` for counts, and `Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })` for confidence percentages.

Rationale: formatting is presentation logic and should react to preference changes without refetching product results. Recomputing prepared dashboard offers from active preferences keeps existing API-ranked ordering intact.

Alternatives considered:

- Store formatted values when the response arrives: rejected because switching language or display currency would require mutating or rebuilding stored response state.
- Use Angular pipes directly in templates: viable, but a service helper keeps all locale-sensitive formatting in one place and avoids relying on process-wide `LOCALE_ID` for runtime switching.

### 6. Pass localized view models into presentational components

Keep child components presentational. The root component should provide localized labels/messages as inputs or prepared view models to `SearchPanelComponent`, `MetricsSummaryComponent`, `OfferCardComponent`, and `StateMessageComponent`. Components should not import translation dictionaries directly unless they own the relevant copy.

Rationale: the root already orchestrates search state and prepares dashboard offers. Keeping locale and conversion derivation near that state minimizes duplicated translation calls and makes tests easier to assert.

Alternatives considered:

- Inject the preferences service into every child component: acceptable for larger feature areas, but unnecessary for the current shallow component tree.
- Convert every component to own its translation keys internally: rejected because it makes state-specific messages harder to coordinate from the root.

### 7. Add state-preserving language and display-currency selectors

Add compact selectors to the dashboard header/hero area with labels for English, Portuguese, Spanish, and supported display currencies. Changing either preference should update signals and local storage only. Language changes must not make network requests. Display-currency changes may refresh conversion rates, but must not submit the search form, clear controls, cancel in-flight product searches, or reset results.

Rationale: language and display currency are application preferences, not product search inputs. Treating them separately avoids accidental product searches and preserves the active shopping workflow.

Alternatives considered:

- Put language and display currency inside the existing search form: rejected because it suggests both affect backend search behavior.
- Use browser language and locale-derived currency only: rejected because browser detection should only choose the first language default. The proposal still requires explicit selection, persistence, and an independent display-currency preference because language does not always imply the user's desired display currency.

### 8. Preserve provider, scraping, and failure semantics

Provider/search behavior remains unchanged: the same query goes to SearXNG, the same candidate limit and ranking are used, and cancellation still flows through the existing request `CancellationToken`.

Scraping/extraction behavior remains unchanged: page fetch timeouts, unsupported source currencies, unknown source currencies, extraction methods, candidate exclusions, and partial failures still originate from the backend. The UI should localize only the surrounding state labels and generic explanatory text. If a search returns offers plus warnings, continue showing successful offers while hiding partial-failure diagnostics unless a future requirement adds a localized diagnostics view.

Conversion failures should be partial display failures, not product-search failures. A conversion timeout or unsupported rate should not discard offers, change counts, or alter ranking.

Rationale: this change improves user-facing language and price comparability without changing product discovery quality, legal/scraping boundaries, or backend search reliability behavior.

Alternatives considered:

- Localize search queries or source-specific parsing: rejected as a product-search behavior change outside this proposal.
- Surface localized partial-failure details now: deferred because the current UI intentionally hides product-search diagnostics while preserving successful offers.

## Risks / Trade-offs

- [Risk] Translation keys drift or a new hard-coded string is added later -> Mitigation: centralize dictionaries, type translation keys, and add tests that switch locales and verify representative text across root, search controls, states, metrics, conversion labels, and offer cards.
- [Risk] Users may treat converted prices as checkout-final values -> Mitigation: show original price/currency, include rate freshness metadata when converted prices are shown, and avoid implying taxes, fees, shipping, or payment-card FX are included.
- [Risk] Exchange-rate provider timeout or outage could make results look broken -> Mitigation: treat conversion as optional display enrichment, cache recent successful rates, and fall back to original prices with localized conversion-unavailable messaging.
- [Risk] Runtime locale formatting differs from user expectations for mixed locale/currency combinations -> Mitigation: use `Intl.NumberFormat` with the selected locale and selected ISO currency; keep conversion separate from locale selection.
- [Risk] Backend error strings remain English while the rest of the UI is localized -> Mitigation: localize the client-owned error title/fallback text and display backend details as technical details until the API exposes structured error codes.
- [Risk] Browser language detection may return regional variants or unsupported values -> Mitigation: match exact supported locales first, map supported base languages to app locales, and fall back to `en-US`.
- [Risk] Local storage may contain an unsupported or stale locale/display-currency value -> Mitigation: validate persisted values against supported lists, ignore invalid stored values, then use browser-language detection with `en-US` as the final fallback.
- [Risk] Language or display-currency switching during an in-flight product search could make loading and results use different labels/prices -> Mitigation: derive all displayed labels and formatted prices from active signals, while keeping the HTTP request lifecycle unchanged.
- [Risk] Unsupported source currencies, unsupported target currencies, and candidate timeout messages could be mistaken for translated UI copy -> Mitigation: limit selectors to supported currencies, keep server diagnostics unchanged, and avoid string matching.

## Migration Plan

1. Add supported locale/display-currency types, metadata, translation dictionaries, and a preferences service with browser-language detection and local-storage persistence.
2. Add backend currency conversion options, a conversion-rate service, and a small conversion-rate API contract with rate freshness/status metadata.
3. Replace hard-coded UI copy in the Angular root and child components with typed localized labels or localized view models.
4. Update original price, converted price, count, and confidence formatting to use active preferences.
5. Add language and display-currency selectors outside the search form and wire them to the preferences/conversion flow.
6. Extend frontend tests to cover browser-language detection, `en-US` fallback behavior, default locale rendering, switching to `pt-BR` and `es-ES`, persistence restoration, state preservation, localized formatting, conversion display/fallbacks, validation/error/empty/loading states, and unchanged product-search request bodies.
7. Verify backend changes with `dotnet build server/PriceComparerWeb.Api.csproj`.
8. Verify frontend changes with `cd client && npm run test -- --watch=false` and `cd client && npm run build`.

Rollback is limited to the Angular preference/UI changes and the backend conversion-rate API/service. Product search, scraping, and SearXNG behavior do not require rollback because they remain unchanged.

## Open Questions

- Which exchange-rate provider should supply rates, and what freshness window is acceptable for display-only conversion?
- Should converted price be primary with original price secondary, or should original price remain primary with converted price as supporting context?
- Should backend diagnostic strings eventually become structured error/warning codes so the client can localize them without string matching?
