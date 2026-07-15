# feat(search): exclude blocked redirect targets from Product Search

Status: implemented locally

## What to build

Prevent an initially eligible Search Candidate from becoming a Product Offer when page fetching resolves its final URL to a configured non-commerce host. Reuse the source-policy behavior introduced by the direct-candidate slice and keep the redirect exclusion silent in the Product Search response.

## Acceptance criteria

- [x] After a Search Candidate is fetched and redirects resolve, the final hostname is evaluated against the configured exclusion policy before Product Offer extraction.
- [x] An initially eligible URL that redirects to a blocked hostname may perform its initial fetch, but it is not passed to price extraction.
- [x] A redirect-blocked page does not appear in CandidateCount, AttemptedSourceCount, Attempted Sources, Search Warnings, or Product Offers.
- [x] Eligible final destinations continue through normal Product Offer extraction and ranking.
- [x] Regression checks use the existing backend harness to verify a redirect to a blocked final hostname and a permitted final destination.
- [x] No store allowlist, visible exclusion diagnostic, or client/API-shape change is introduced.
