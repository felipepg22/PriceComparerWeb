# feat(search): exclude configured non-commerce Search Candidates

Status: implemented locally

## What to build

Make Product Search silently omit configured non-commerce Search Candidates before they are evaluated. The slice must deliver a default, deployment-configurable hostname blocklist; keep eligible Seller listings available; and document the source policy.

## Acceptance criteria

- [x] Product Search provides an ExcludedHosts configuration collection, seeded in the base configuration with the agreed non-commerce domains; deployments can override it, and blank or malformed entries are ignored.
- [x] A shared, case-insensitive hostname policy matches each configured root hostname and its subdomains, but not lookalike hosts.
- [x] SearXNG discovery silently removes blocked URLs before scoring, deduplication, and the candidate cap; SearXNG queries do not receive negative site operators.
- [x] Blocked root and subdomain URLs are never fetched and do not contribute to CandidateCount, AttemptedSourceCount, Attempted Sources, Search Warnings, or Product Offers.
- [x] Eligible retailer URLs remain available as Search Candidates and Product Offers.
- [x] Regression checks use the existing backend harness to cover direct blocked roots, blocked subdomains, allowed stores, and candidate-cap behavior.
- [x] Documentation describes the default excluded-host policy and its configuration override.
- [x] No store allowlist or client/API-shape change is introduced.

## Blocked by

None - can start immediately
