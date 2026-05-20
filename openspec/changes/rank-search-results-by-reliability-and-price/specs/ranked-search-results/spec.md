## ADDED Requirements

### Requirement: Search returns up to ten ranked offers
The product search API SHALL return no more than 10 offers for a search response. When fewer than 10 comparable offers are found, the API SHALL return every comparable offer found instead of failing the search or padding the result set.

#### Scenario: More than ten comparable offers exist
- **WHEN** product search finds more than 10 comparable offers for a query
- **THEN** the response `offers` list contains exactly the 10 highest-ranked offers

#### Scenario: Fewer than ten comparable offers exist
- **WHEN** product search finds fewer than 10 comparable offers for a query
- **THEN** the response `offers` list contains all comparable offers found

#### Scenario: No comparable offers exist
- **WHEN** product search cannot extract any comparable offers for a query
- **THEN** the response `offers` list is empty and the response still reports attempted sources and warnings where applicable

### Requirement: Offers are ranked by website reliability and price
The product search API SHALL order returned offers by website reliability and price. Website reliability MUST be evaluated from the offer website, including the final scraped URL host, rather than from the SearXNG provider name.

#### Scenario: Offers have different website reliability
- **WHEN** two comparable offers have different website reliability values
- **THEN** the offer from the more reliable website appears earlier in the response `offers` list

#### Scenario: Offers have equivalent website reliability
- **WHEN** two comparable offers have equivalent website reliability and the same currency
- **THEN** the lower-priced offer appears earlier in the response `offers` list

#### Scenario: Offers need deterministic tie breaking
- **WHEN** two comparable offers have equivalent website reliability and equivalent price
- **THEN** the API orders them deterministically using extraction confidence and stable source metadata

### Requirement: Ranking preserves partial search results
The product search API SHALL preserve existing partial-failure behavior while ranking results. Candidate failures, timeouts, missing prices, unsupported currencies, and requested-currency mismatches MUST NOT prevent valid comparable offers from being returned.

#### Scenario: Some candidates fail while others succeed
- **WHEN** at least one candidate fails or times out and at least one candidate produces a comparable offer
- **THEN** the response includes the comparable offer in `offers` and reports failed candidates through `attemptedSources` and `warnings`

#### Scenario: Candidate has unsupported currency
- **WHEN** a candidate page exposes a price in an unsupported currency
- **THEN** that candidate is excluded from `offers` and the exclusion is reported through `attemptedSources`

#### Scenario: Candidate does not match requested currency
- **WHEN** a search request includes a supported currency and a candidate page exposes a different supported currency
- **THEN** that candidate is excluded from `offers` and the exclusion is reported through `attemptedSources`

### Requirement: UI preserves API-ranked order
The Angular UI SHALL render offer cards in the same order provided by the product search API. The UI MUST NOT apply a separate client-side sort that changes the ranked order.

#### Scenario: API returns ranked offers
- **WHEN** the product search API returns an ordered `offers` list
- **THEN** the UI displays offer cards in that same order
