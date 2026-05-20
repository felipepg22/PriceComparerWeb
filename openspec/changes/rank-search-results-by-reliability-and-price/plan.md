# Implementation Plan

## Approach

Use heuristic-only website reliability scoring. Do not add configurable host overrides in this change.

## Backend

1. Increase bounded candidate collection so search can return up to 10 ranked offers when enough comparable offers exist.
2. Remove existing hard clamps that cap candidate processing at 5.
3. Keep scraping concurrency, HTTP client timeouts, and request cancellation propagation intact.
4. Add an internal server-side ranked offer selection step after scraping and price extraction.
5. Return at most 10 offers after ranking.
6. Return all comparable offers when fewer than 10 are found.
7. Return an empty `offers` list when no comparable offers are found while preserving attempted source and warning details.

## Reliability Scoring

1. Score reliability from the final scraped offer URL host, not from the SearXNG provider name.
2. Apply an HTTPS reliability boost.
3. Penalize known low-value informational, social, or video hosts.
4. Include extraction method and confidence as reliability signals.
5. Treat unknown commerce hosts as neutral instead of excluding or penalizing them.
6. Keep scoring deterministic and local, with no external reputation service.

## Ranking

Order comparable offers by:

1. Website reliability, highest first.
2. Price, lowest first.
3. Extraction confidence, highest first.
4. Stable source metadata for deterministic ties.

## Partial Failures

Preserve existing behavior for:

1. Failed candidates.
2. Timed-out candidates.
3. Missing prices.
4. Unsupported currencies.
5. Requested-currency mismatches.

Continue reporting exclusions and failures through `attemptedSources` and `warnings` without blocking valid offers.

## Frontend

1. Confirm Angular renders `response.offers` in API-provided order.
2. Do not add client-side sorting.
3. Update UI copy if needed to describe results as ranked or top offers, up to 10.
4. Add or update tests for preserving API-ranked order.
5. Add or update tests for rendering fewer than 10 returned offers.

## Verification

1. Run `dotnet build server/PriceComparerWeb.Api.csproj`.
2. Run `cd client && npm run test -- --watch=false`.
3. Run `cd client && npm run build`.
4. Run `openspec-implementation-auditor` before marking OpenSpec tasks complete.
