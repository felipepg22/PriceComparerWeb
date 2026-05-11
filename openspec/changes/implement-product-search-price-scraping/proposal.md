## Why

Users currently need to provide a specific page URL before the app can scrape anything, but the product vision is to compare prices from a product name. This change lets users search for a product and receive structured offers with prices from discovered shopping pages.

## What Changes

- Add product search by free-text product name, model, or SKU.
- Discover candidate product and offer pages from search results instead of requiring the user to paste each URL.
- Scrape discovered pages and extract comparable offer data: price, currency, seller, product URL, and product title when available.
- Return normalized offer results with enough metadata to show source, scrape status, and failures without blocking the whole search.
- Update the client from a URL scraper UI to a product price comparison UI.
- Keep the existing generic page scraping capability available for internal reuse or debugging.

## Capabilities

### New Capabilities

- `product-search`: Covers accepting a product query, discovering candidate web pages, and returning search-scoped metadata.
- `price-extraction`: Covers scraping candidate pages and extracting normalized offer price data from supported page structures.
- `price-comparison`: Covers presenting comparable offer results to the user, including sorting/filtering basics and partial failure handling.

### Modified Capabilities

None.

## Impact

- Backend API: new product search/compare endpoint, request/response models, validation, and orchestration around discovery plus scraping.
- Backend scraping: extend current AngleSharp-based scraping into price/offer extraction while preserving bounded timeouts and response-size limits.
- External dependencies/systems: likely requires a search provider or configurable search mechanism; may require rate limiting, user-agent policy, and per-site failure handling.
- Frontend: Angular form, service calls, loading/error states, and results view will shift from page metadata to product offer comparison.
- Tests: backend unit/integration coverage for query validation, offer extraction, partial failures, and frontend component behavior for search results.
