# Reveal Ranked Offers in Batches of Five

## Problem Statement

A Product Search currently returns no more than ten Ranked Offers, even when Offer Discovery finds additional comparable Product Offers. The Price Comparison Experience also reveals only three offers before switching directly to every remaining offer. This prevents users from progressively reviewing a broader, consistently ranked set and makes the “Show more offers” action unsuitable for longer result lists.

## Solution

A Product Search will return every Ranked Offer found within the existing configurable Search Candidate safety limit. The Price Comparison Experience will initially render five Ranked Offers and provide the existing localized, count-free “Show more offers” action when additional offers exist. Each action reveals up to five more already-fetched Ranked Offers. The action disappears after all available offers are visible.

## User Stories

1. As a price-comparison user, I want a Product Search to retain all Ranked Offers discovered within its configured safety limit, so that I can compare more than ten credible offers.
2. As a price-comparison user, I want to see the first five Ranked Offers immediately, so that the initial results remain focused and easy to scan.
3. As a price-comparison user, I want to reveal up to five more Ranked Offers at a time, so that I can progressively inspect a longer comparison without being overwhelmed.
4. As a price-comparison user, I want the reveal action to be labeled only “Show more offers” in my Locale, so that the action is concise and consistent with the existing interface.
5. As a price-comparison user, I want the action to remain count-free, so that it stays accurate when fewer than five offers remain.
6. As a price-comparison user, I want the next Ranked Offers to preserve the original ranking order, so that later offers are comparable with the first five.
7. As a price-comparison user, I want a final partial batch to reveal every remaining offer, so that no Ranked Offer is inaccessible.
8. As a price-comparison user, I want the action to disappear after every Ranked Offer is visible, so that the interface does not suggest more results exist.
9. As a price-comparison user, I want searches with five or fewer Ranked Offers to omit the action, so that the interface contains no unnecessary control.
10. As a price-comparison user, I want a new Product Search to start by showing its first five Ranked Offers, so that expansion from a prior query does not carry into the new result set.
11. As a price-comparison user, I want changing my Display Currency or Locale to preserve the loaded Product Offers and current visible batch, so that presentation changes do not repeat Product Search work.
12. As a price-comparison user, I want “Show more offers” to reveal already loaded results instantly, so that I do not wait for the same Search Candidates to be scraped again.
13. As a price-comparison user, I want the best-overall indication to remain attached to the first Ranked Offer, so that progressive revelation does not change the primary comparison guidance.
14. As a price-comparison user, I want empty and error Product Search states to remain unchanged, so that progressive reveal does not obscure search feedback.
15. As an operator, I want the existing configurable Search Candidate limit to remain in force, so that returning all Ranked Offers does not remove the service’s workload safeguard.
16. As an operator, I want one Product Search request to produce the complete ranked result set, so that repeated reveal actions do not cause repeated scraping, ranking drift, or avoidable load.

## Implementation Decisions

- Offer Discovery will remove the fixed limit that truncates Ranked Offers to ten after low-price-outlier filtering and ranking. It will continue to apply the existing configurable maximum number of Search Candidates before scraping.
- The Product Search response contract remains a single complete response containing its Ranked Offers; no page number, cursor, total, or follow-up endpoint will be added.
- The Price Comparison Experience will fetch the complete Product Search response once and retain its complete list of Ranked Offers locally.
- Progressive reveal will be client-side state: the initial visible limit is five, and each “Show more offers” action increases that limit by five.
- The visible list will always be the leading portion of the complete, already-ranked offer list. No reordering, re-ranking, or filtering occurs when more offers are revealed.
- The existing localized “Show more offers” label will be retained without an embedded count, remaining count, or final-batch variant.
- The action is rendered only when at least one loaded Ranked Offer is not visible. It reveals the final remainder when that remainder is fewer than five, then is removed.
- Starting a new Product Search resets progressive reveal to the initial five-offer limit. Existing behavior for Locale and Display Currency changes remains unchanged.
- Server-side pagination and repeat requests are intentionally excluded: Offer Discovery must evaluate and rank the available Search Candidates to establish the ranked set, and pagination would require a cached snapshot/cursor lifecycle to avoid repeat scraping and result drift.

## Testing Decisions

- Test external behavior at the existing app-level Product Search HTTP seam: submit a Product Query, provide a Product Search response with Ranked Offers, and assert the rendered offer cards and availability of the user action.
- Update the established progressive-reveal tests to cover five initial offers, five additional offers per activation, order and rank preservation, final partial batches, and removal of the action after the full list is visible.
- Cover boundaries of zero offers, one to five offers, six to ten offers, and more than ten offers. Assert that no action appears when every offer is visible.
- Cover that a new Product Search resets the visible list to five offers.
- Confirm that the Product Search response can carry more than ten Ranked Offers without truncation. Use the highest available existing seam; the backend currently has no separate test project, so the backend change is also verified by the project build until such a test seam exists.
- Tests should assert rendered cards, ordering, rank labels, and user-visible action behavior—not component implementation signals or private state.

## Out of Scope

- Changing the configurable Search Candidate maximum or the concurrency policy.
- Introducing server-side pagination, cursors, cached search snapshots, or a new follow-up Product Search endpoint.
- Loading more Search Candidates on demand.
- Changing ranking, low-price-outlier filtering, price extraction, conversion behavior, or Product Offer presentation.
- Changing the wording of the localized action beyond retaining its existing “Show more offers” equivalent.
- Virtualized rendering or performance work for result volumes beyond the current Search Candidate safety limit.

## Further Notes

The current Search Candidate safety limit is 20, so a single Product Search can return at most that many successful Product Offers under the present configuration. Fetching that bounded result set once and revealing it in batches avoids repeated scraping, inconsistent subsequent results, and unnecessary latency. If the candidate limit is increased substantially in the future, rendering and response size should be profiled before considering a server-side pagination design.
