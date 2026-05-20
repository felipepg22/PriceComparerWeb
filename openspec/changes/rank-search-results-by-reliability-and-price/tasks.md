## 1. Backend Ranking

- [ ] 1.1 Add a server-side ranked offer selection step that returns at most 10 offers and returns all found offers when fewer than 10 comparable offers exist.
- [ ] 1.2 Implement deterministic website reliability scoring from the final offer URL host, HTTPS status, low-value host penalties, extraction method confidence, and neutral handling for unknown commerce hosts.
- [ ] 1.3 Order offers by reliability first, then price, then extraction confidence and stable source metadata for deterministic ties.
- [ ] 1.4 Ensure ranking uses the offer website identity from the scraped final URL rather than the SearXNG provider name.

## 2. Candidate Limits And Search Behavior

- [ ] 2.1 Increase bounded candidate collection so the backend can return up to 10 ranked offers when enough comparable offers exist.
- [ ] 2.2 Keep scraping concurrency, HTTP timeouts, and request cancellation propagation intact while processing the larger candidate pool.
- [ ] 2.3 Preserve partial result behavior for failed candidates, timed-out candidates, missing prices, unsupported currencies, and requested-currency mismatches.
- [ ] 2.4 Ensure `attemptedSources` and `warnings` still explain excluded or failed candidates without blocking valid offers.

## 3. Frontend Behavior

- [ ] 3.1 Confirm the Angular app renders `response.offers` in API order without applying a client-side sort.
- [ ] 3.2 Update UI copy if needed to describe results as ranked offers shown up to a maximum of 10.

## 4. Verification

- [ ] 4.1 Add or update frontend tests to cover preserving API-ranked order and fewer-than-10 offer rendering.
- [ ] 4.2 Verify backend behavior with `dotnet build server/PriceComparerWeb.Api.csproj`.
- [ ] 4.3 Verify frontend behavior with `cd client && npm run test -- --watch=false`.
- [ ] 4.4 Verify frontend build with `cd client && npm run build`.
- [ ] 4.5 Run `openspec-implementation-auditor` to confirm all OpenSpec tasks and requirements are implemented completely and traceably before marking the change done.
