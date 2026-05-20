## Context

Product search currently asks SearXNG for candidate pages, scrapes each candidate with a 15-second HTTP client timeout, extracts one comparable offer per page, and returns successful offers ordered mostly by price and extraction confidence. The candidate pool is capped at 5, so the API cannot return a top-10 result set today.

The requested change needs ranking that favors trustworthy offer pages while still surfacing lower prices. SearXNG remains the discovery provider, scraping remains best-effort, and unsupported currencies or failed candidate pages must continue to be reported through attempted sources and warnings instead of failing the whole search. The API should return up to 10 ranked offers and show fewer when fewer comparable offers are found.

## Goals / Non-Goals

**Goals:**

- Return up to 10 product offers per search, ordered by website reliability and price, without hiding valid offers just because fewer than 10 were found.
- Use the final scraped offer URL host as the website identity, not the SearXNG provider name.
- Keep cancellation tokens, HTTP timeouts, concurrency limits, partial failure reporting, and unsupported-currency filtering intact.
- Preserve the existing API response shape where possible; make ordering and result count the observable contract.
- Ensure the Angular UI renders offers in the API-provided ranked order without applying a second local sort.

**Non-Goals:**

- Add a new search provider or external website reputation dependency.
- Guarantee exactly 10 offers when fewer comparable pages can be discovered, scraped, or priced.
- Compare prices across currencies; unsupported currencies and mismatched requested currencies remain excluded.
- Bypass paywalls, authentication, anti-bot controls, robots constraints, or site terms.

## Decisions

- Keep `ProductSearchResponse` compatible and rank `Offers` server-side.
  Rationale: existing clients already consume `offers` as an ordered list, so changing order and limiting to 10 satisfies the user-visible behavior without adding score fields prematurely. Alternative considered: expose rank and reliability score fields; rejected for the initial change because it would couple clients to scoring internals before the score semantics are stable.

- Introduce an internal offer ranking step after scraping and price extraction.
  Rationale: final reliability should use facts only known after scraping, including final URL host, extraction confidence, HTTP result, and whether the page produced a comparable supported-currency price. Alternative considered: rank only SearXNG candidates before scraping; rejected because discovery metadata cannot prove that a page has a usable offer or reliable price.

- Use reliability first, then price, then extraction confidence as tie-breakers.
  Rationale: the user asked for top results based on website reliability and price, with reliability named as a quality gate. The ranking should prefer a more reliable website over a cheaper low-confidence page, while still ordering comparable reliability tiers by lower price. Alternative considered: weighted blended score; rejected because small weight changes can make ordering hard to explain.

- Calculate website reliability from deterministic local signals.
  Rationale: no external reputation service is currently part of the project. The initial score should be based on final URL host, HTTPS, known low-value informational/social/video hosts, configured host reliability overrides if added to `ProductSearchOptions`, and extraction method confidence. Unknown commerce hosts should receive a neutral score rather than being excluded. Alternative considered: hard-code a large trusted-store list; rejected because it would age quickly and be region-specific.

- Expand the candidate pool enough to produce up to 10 ranked offers.
  Rationale: the current `MaxCandidates` cap of 5 prevents returning 10 offers when 10 comparable offers exist. The provider should allow at least 10 candidates, return fewer offers when fewer comparable offers succeed, and keep `MaxConcurrency` plus scraper timeouts protecting runtime and remote sites. Alternative considered: scrape an unbounded pool until exactly 10 offers succeed; rejected because it risks slow searches, excessive remote requests, and still cannot guarantee 10 valid offers.

- Preserve partial failure semantics.
  Rationale: product search should still return useful offers when some candidates fail, time out, have no price, or use unsupported currencies. `AttemptedSources` and `Warnings` remain the place to report failures and exclusions. Search request cancellation should still stop queued and in-flight work through existing cancellation tokens.

- Keep UI sorting passive.
  Rationale: the server owns ranking because it has the full candidate, scrape, extraction, and reliability context. The Angular app should map `response.offers` to dashboard cards in order and may update copy to indicate these are top-ranked offers. Alternative considered: duplicate ranking in the client; rejected to avoid drift and exposing ranking internals.

## Risks / Trade-offs

- Reliability heuristics may not match user expectations for every website -> keep unknown hosts neutral, prefer configurable overrides, and add tests around ordering rules rather than hard-coded real-world opinions.
- Returning up to 10 offers requires scraping more candidates -> keep bounded candidate limits, existing concurrency control, 15-second HTTP timeouts, and cancellation propagation.
- Low-price offers from less reliable pages may appear lower than users expect -> use reliability tiers before price and document that ranking optimizes for trustworthy low prices, not absolute cheapest first.
- Partial failures can leave fewer than 10 offers -> preserve attempted source details and warnings so users can see why sources were skipped.
- Unsupported or mismatched currencies reduce comparability -> continue excluding unsupported currencies and currency mismatches before ranking.

## Migration Plan

- No data migration is required.
- Update backend ranking and candidate limits, then update frontend copy or tests that assume result counts or ordering.
- Deploy backend and frontend together so UI language matches ranked top-10 behavior.
- Rollback is limited to restoring the previous offer ordering and candidate cap.

## Open Questions

- Should future UI versions expose reliability labels or explanations, or is ranked order enough for the first release?
