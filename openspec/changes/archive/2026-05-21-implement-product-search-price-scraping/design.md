## Context

The app currently exposes `POST /api/scrape`, which fetches one URL and returns generic page metadata. The product vision requires a higher-level flow: accept a product query, discover relevant pages, scrape candidate pages, extract prices, and present comparable offers.

The existing backend is a minimal ASP.NET Core API using `HttpClient` and AngleSharp. The existing frontend is a single Angular standalone component focused on URL scraping. This change crosses backend API shape, scraping logic, external search integration, and the user-facing workflow.

## Goals / Non-Goals

**Goals:**

- Add a product comparison flow that starts from a product query rather than a known URL.
- Keep discovery, scraping, extraction, and ranking as separate backend responsibilities.
- Return partial results when some candidate pages fail or do not contain extractable prices.
- Normalize extracted offers into a consistent contract for the Angular client.
- Preserve bounded fetch behavior: timeouts, response-size limits, URL validation, and cancellation support.

**Non-Goals:**

- Do not guarantee complete web coverage or exact real-time market pricing.
- Do not implement checkout, cart, price alerts, account state, or persistence.
- Do not bypass robots, authentication, paywalls, anti-bot protections, or site terms.
- Do not build site-specific integrations for every retailer in the first pass.
- Do not convert prices across currencies; compare values only within extracted currency context.

## Decisions

1. Introduce `POST /api/products/search` as the user-facing comparison endpoint.

   The request accepts `query`, optional `currency`, and optional result limits. The response returns normalized offers, attempted sources, warnings, and timestamps. This keeps `/api/scrape` available as low-level page inspection while giving the client a product-specific API.

   Alternative considered: extend `/api/scrape` to accept product queries. Rejected because URL scraping and product comparison have different validation, orchestration, and response contracts.

2. Use a provider abstraction for web discovery.

   Add an interface such as `IProductSearchProvider` that returns candidate URLs and titles for a query. The initial implementation should be configurable so it can use a search API when credentials are present, and fail clearly when no provider is configured.

   Alternative considered: scrape search engine result pages directly. Rejected because markup and blocking behavior are unstable, and it creates unnecessary legal and reliability risk.

3. Split scraping and price extraction into reusable services.

   Move current page-fetching and parsing logic behind a service that returns final URL, status, document, and page metadata. Add a price extractor that checks structured data first (`application/ld+json`, Open Graph/product metadata, common schema.org offers) and then falls back to conservative DOM/text heuristics.

   Alternative considered: extract prices in the endpoint handler. Rejected because extraction needs focused tests and will evolve independently from endpoint orchestration.

4. Normalize offers with explicit confidence and failure metadata.

   Each successful offer should include product title, price amount, currency, seller/source, URL, extraction method, and confidence when available. 

   Alternative considered: return only successful offers. Rejected because silent failures make debugging and user trust worse.

5. Rank offers deterministically in the API.

   Sort primarily by currency match when a currency filter is requested, then by numeric price ascending, then by confidence/source metadata. The frontend may offer display sorting later, but the API should return a stable default order.

   Alternative considered: leave all ordering to the client. Rejected because consistent default ordering belongs with normalized comparison semantics.

6. Keep concurrency limited and cancellation-aware.

   The search endpoint should fetch candidate pages concurrently with a small configurable limit. It should respect request cancellation, per-request timeout, maximum candidate count, and maximum response body size.

   Alternative considered: sequential scraping. Rejected because product comparison would feel slow, but unbounded concurrency would risk noisy traffic and resource spikes.

## Risks / Trade-offs

- Search provider dependency unavailable or unconfigured -> return a clear configuration error and keep `/api/scrape` usable.
- Candidate pages block scraping or render prices client-side -> report per-source failures and rely on structured-data extraction where possible.
- Price extraction false positives -> prefer structured metadata, include extraction method/confidence, and avoid returning ambiguous text matches as high-confidence offers.
- Currency ambiguity -> extract explicit currency when present; otherwise mark currency as unknown instead of guessing.
- Slow or large pages -> enforce timeout, response-size limit, max candidates, and limited concurrency.
- Retailer terms or robots restrictions -> use standard HTTP behavior, identify user agent, and do not attempt bypasses.
- UI could imply exhaustive comparison -> label results as found offers and show source/failure metadata where useful.

## Migration Plan

- Add backend models and services alongside the existing scrape endpoint.
- Keep `POST /api/scrape` unchanged for compatibility and debugging.
- Add `POST /api/products/search` and wire it to discovery, scraping, extraction, and ranking services.
- Update the Angular app to call the new endpoint from a product query form and render offer results.
- Add tests around validation, extraction fixtures, partial failure response shape, and client result states.
- Rollback by hiding the product search UI and leaving `/api/scrape` intact.

## Open Questions

- Which search provider should be used for the first implementation: a paid search API, a self-hosted/search-proxy option, or a manually configured seed list for development? -> manually configured seed
- Should the first release include a domain allowlist/denylist, or remain open as stated in the product vision? -> remain open
- What maximum candidate count and concurrency limit should be default for local development? -> max of 5 searches
- Should unknown-currency offers be shown by default or separated from comparable offers? Only BRL, USD and EUR.
