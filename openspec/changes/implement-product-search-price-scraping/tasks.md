## 1. Backend Contracts and Configuration

- [x] 1.1 Add product search request/response models for query, optional currency, offers, attempted sources, warnings, and metadata
- [x] 1.2 Add configuration models for SearXNG discovery, maximum candidates, fetch timeout, and scrape concurrency
- [x] 1.3 Register backend services and options in dependency injection without changing the existing `/api/scrape` contract

## 2. Product Discovery

- [x] 2.1 Create an `IProductSearchProvider` abstraction that returns candidate URLs and source metadata for a product query
- [x] 2.2 Implement SearXNG JSON API discovery with query matching and URL normalization
- [x] 2.3 Enforce validation for blank queries and return a clear configuration error when SearXNG is not configured
- [x] 2.4 Limit selected candidates to at most five pages per product search

## 3. Scraping and Price Extraction

- [x] 3.1 Move reusable page fetch, response-size limiting, final URL capture, and AngleSharp parsing behind a scraping service
- [x] 3.2 Implement structured-data offer extraction from JSON-LD/schema.org and common product metadata
- [x] 3.3 Implement conservative fallback extraction for visible price text with explicit extraction method and confidence metadata
- [x] 3.4 Accept only BRL, USD, and EUR offers; record exclusion reasons for unsupported or unknown currencies
- [x] 3.5 Record attempted-source failures for timeouts, oversized pages, HTTP errors, parse errors, and missing extractable offers

## 4. Product Search API

- [x] 4.1 Add `POST /api/products/search` endpoint with request validation and cancellation support
- [x] 4.2 Orchestrate discovery, limited-concurrency scraping, offer extraction, and attempted-source aggregation
- [x] 4.3 Sort comparable offers deterministically by requested currency match, price ascending, and confidence/source metadata
- [x] 4.4 Return partial results when some candidate pages fail while preserving successful offers

## 5. Frontend Product Comparison UI

- [x] 5.1 Replace the primary URL scrape form with a product query search form and optional BRL/USD/EUR currency control
- [x] 5.2 Add Angular response types and HTTP call for `POST /api/products/search`
- [x] 5.3 Render offer cards or rows with price, currency, seller/source, product URL, title, and fetched timestamp
- [x] 5.4 Show loading, validation, API error, empty result, and partial-failure states without hiding successful offers
- [x] 5.5 Keep the UI clear that results are found offers, not exhaustive market coverage

## 6. Tests and Verification

- [ ] 6.1 Manually verify backend request validation, missing SearXNG configuration, candidate limit, and supported currency filtering
- [ ] 6.2 Manually verify extraction with structured data, fallback price text, unsupported currency, and missing price cases
- [ ] 6.3 Manually verify backend orchestration for partial failures and deterministic offer ordering
- [x] 6.4 Add frontend tests for valid search submission, validation errors, rendered offers, and partial-failure display
- [ ] 6.5 Run frontend tests and final build checks when test execution is approved
