## Why

Search results can include noisy, duplicate, or low-confidence offers, making it harder for users to identify trustworthy low-price options. Ranking and limiting results by website reliability and price improves result quality and reduces decision friction.

## What Changes

- Rank product search results using website reliability and extracted price as primary quality signals.
- Return up to 10 ranked results for a search response, showing fewer when fewer comparable offers are found.
- Preserve SearXNG discovery and scraping constraints while improving how discovered offers are prioritized.
- Ensure the UI presents results in the API-provided ranked order.

## Capabilities

### New Capabilities

- `ranked-search-results`: Search responses provide up to 10 ranked results ordered by website reliability and price quality.

### Modified Capabilities

None. No existing OpenSpec specs are present for this repository.

## Impact

- Backend search orchestration, scraping, price extraction, and response ordering in `server/Services/`.
- API response behavior for product search consumers, because result ordering and maximum count change.
- Angular result rendering in `client/src/app/`, which should preserve the ranked order returned by the API.
- SearXNG-backed discovery remains required and must continue respecting configured search and scraping limits.
