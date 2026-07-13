# Offer Discovery

The context responsible for finding candidate product pages, determining whether they contain comparable offers, and returning a trustworthy ranked set.

## Search

**Product Query**:
A product description used to discover potentially matching offers; it may include a product name, model, or SKU.
_Avoid_: URL, keyword list

**Search Currency**:
An optional constraint requiring discovered Product Offers to use a specified Supported Currency.
_Avoid_: Target currency, display currency

**Search Candidate**:
A discovered page that may contain a Product Offer matching the Product Query.
_Avoid_: Offer, result, seller

**Attempted Source**:
The recorded outcome of evaluating one Search Candidate, whether successful, excluded, or failed.
_Avoid_: Offer, search result

**Search Warning**:
A non-fatal condition that may reduce the completeness or reliability of a Product Search.
_Avoid_: Failure, exclusion reason

## Offers

**Product Offer**:
A comparable seller listing with a product title, Original Price, Seller, destination URL, Source, Extraction Method, and Confidence.
_Avoid_: Search candidate, product, deal

**Comparable Offer**:
A Product Offer whose price and currency are sufficiently credible and relevant for comparison with other offers.
_Avoid_: Any priced page, search candidate

**Ranked Offer**:
A Comparable Offer ordered relative to others using reliability and price, with the most useful offers presented first.
_Avoid_: Cheapest offer, sponsored result

**Low-price Outlier**:
A Product Offer whose price is implausibly low relative to comparable offers in the same currency and is therefore excluded from ranking.
_Avoid_: Cheapest offer, discount

**Seller**:
The merchant offering the product for purchase.
_Avoid_: Source, search provider, website

**Source**:
The discovery channel through which a Search Candidate was found.
_Avoid_: Seller, store

**Original Price**:
The amount and currency published for a Product Offer by its Seller.
_Avoid_: Converted price, display price

**Extraction Method**:
The category of evidence from which a Product Offer's price was identified.
_Avoid_: Source, confidence

**Confidence**:
The degree of trust that the identified price accurately represents the Product Offer.
_Avoid_: Rank, relevance

## Currency Conversion

**Supported Currency**:
One of the currencies recognized for offer comparison and conversion: BRL, USD, or EUR.
_Avoid_: Any currency, locale

**Conversion Rate**:
The multiplier relating an Original Price's currency to a requested Display Currency.
_Avoid_: Price, fee

**Rate Freshness**:
The age and staleness status of the Conversion Rates used for display.
_Avoid_: Offer freshness, search freshness
