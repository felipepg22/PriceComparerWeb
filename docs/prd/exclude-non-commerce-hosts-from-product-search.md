# Exclude Non-Commerce Hosts from Product Search

## Problem Statement

Product Search can discover non-commerce pages such as YouTube videos, social posts, forum discussions, encyclopedia pages, editorial reviews, and search-engine result pages. These pages can be selected as Search Candidates, fetched, and in some cases returned as Product Offers even though they do not represent a Seller listing. This makes comparison results less trustworthy and wastes discovery and scraping capacity.

## Solution

Product Search will use a configurable, default blocklist of non-commerce hostnames. A Search Candidate whose discovered URL belongs to a blocked hostname will be silently omitted before candidate selection and fetching. The same policy will be applied to the final URL after redirects, so a permitted-looking short URL cannot resolve to a blocked destination and become a Product Offer.

The product will retain a blocklist approach only. It will not introduce a store allowlist.

## User Stories

1. As a shopper, I want Product Search to omit YouTube pages, so that comparison results contain purchasable Product Offers rather than videos.
2. As a shopper, I want social-media posts excluded from Product Search, so that I can compare Seller listings instead of informal recommendations.
3. As a shopper, I want forums and community discussions excluded, so that the ranked results focus on comparable offers.
4. As a shopper, I want encyclopedia and reference pages excluded, so that factual product information is not mistaken for a purchasable listing.
5. As a shopper, I want editorial review and news pages excluded, so that comparison results favor direct purchase pages.
6. As a shopper, I want search-engine result pages excluded, so that the product does not surface a second layer of search results.
7. As a shopper, I want an eligible retail site to remain searchable, so that the blocklist improves relevance without preventing legitimate Seller listings.
8. As a shopper, I want blocked subdomains to be treated like their blocked parent hostname, so that mobile and regional variants of non-commerce sites cannot leak into results.
9. As a shopper, I want a redirected URL to be checked at its final destination, so that a redirect to a blocked host cannot appear as a Product Offer.
10. As a shopper, I want excluded pages to be invisible in search counts, Attempted Sources, Search Warnings, and Product Offers, so that the Product Search response represents only sources evaluated for comparison.
11. As an operator, I want to change excluded hostnames through Product Search configuration, so that the source policy can evolve without a code change.
12. As an operator, I want malformed blocklist entries to be ignored, so that a non-critical configuration typo does not prevent Product Search from running.
13. As an operator, I want a documented default blocklist and override mechanism, so that local and deployed environments apply the intended source policy consistently.
14. As a maintainer, I want regression checks for direct, subdomain, eligible, and redirected hosts, so that later search changes do not reintroduce blocked sources.

## Implementation Decisions

- Add a Product Search configuration collection for excluded hostnames. Ship the initial default in the base server configuration so the policy applies outside development and can be overridden by deployments.
- Seed the default collection with: youtube.com, youtu.be, facebook.com, instagram.com, tiktok.com, x.com, twitter.com, linkedin.com, pinterest.com, reddit.com, discord.com, wikipedia.org, wikidata.org, fandom.com, quora.com, google.com, bing.com, duckduckgo.com, yahoo.com, cnet.com, techradar.com, theverge.com, wired.com, gizmodo.com, canaltech.com.br, tecmundo.com.br, and olhardigital.com.br.
- Treat a configured root hostname and all its subdomains as excluded, case-insensitively. Valid entries are plain hostnames; blank or malformed entries are ignored.
- Implement the matching rule once as a shared backend policy and apply it at two points: after SearXNG discovery but before Search Candidate aggregation/capping, and after page redirects but before Product Offer extraction.
- Silently omit excluded hosts. They must not be fetched when the discovered URL is blocked. A blocked final redirect destination is discarded after the unavoidable initial fetch and before extraction.
- Do not modify SearXNG query text with negative site operators. Enforcement remains deterministic in the backend regardless of search-engine operator behavior.
- Preserve public Product Search response contracts. CandidateCount, AttemptedSourceCount, Attempted Sources, Search Warnings, and ranked Product Offers will only reflect eligible Search Candidates.
- Keep marketplaces and retailer-owned sites eligible. This change is not a store allowlist and does not claim to classify every unlisted hostname as a store.
- Update user-facing setup documentation to replace the statement that no sites are excluded and to document the default source policy and configuration override.

## Testing Decisions

- Test observable Product Search behavior rather than private matching implementation details.
- Use one high-level existing backend seam: ProductSearchService.SearchAsync with the existing in-memory regression harness, a fake SearXNG response, and a fake page fetcher.
- Assert that a blocked root hostname and blocked subdomain do not contribute to candidate counts, Attempted Sources, Search Warnings, or Product Offers.
- Assert that an eligible store hostname remains available for product comparison.
- Assert that an initially eligible URL whose final redirect host is blocked is omitted before Product Offer extraction and does not appear in the response.
- Follow the existing program-based backend regression checks that already use fake product-search providers, HTTP handlers, and page scrapers; do not require live SearXNG traffic.

## Out of Scope

- A store allowlist or a guarantee that every unlisted hostname is an ecommerce site.
- SearXNG engine configuration, credentials, or negative site-query operators.
- Changes to price extraction logic, Product Offer ranking, currency conversion, or the client API contract.
- Reporting excluded hostnames as diagnostics, warnings, or visible UI elements.
- Bypassing paywalls, authentication, anti-bot controls, or source site terms.

## Further Notes

The blocklist reduces known non-commerce noise but is intentionally not a universal store-classification system. Operators can add newly observed non-commerce hostnames through Product Search configuration.
