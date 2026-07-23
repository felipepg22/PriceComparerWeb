# Offer Discovery

The context responsible for finding candidate product pages, determining whether they contain comparable offers, and returning a trustworthy ranked set.

## Search

**Product Query**:
A product description used to discover potentially matching offers; it may include a product name, model, or SKU.
_Avoid_: URL, keyword list

**Search Currency**:
The required constraint requiring discovered Product Offers to have an Original Price in the user-selected Supported Currency for that Product Search; other currencies are excluded rather than converted.
_Avoid_: Target currency, display currency

**Supported Currency**:
One of the currencies recognized for Product Searches: BRL, USD, or EUR.
_Avoid_: Any currency, locale

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

**Canonical Product**:
The distinct product model identified across seller listings by reliable attributes such as a model, SKU, or GTIN.
_Avoid_: Product offer, listing, search result

**Comparable Offer**:
A Product Offer whose price and currency are sufficiently credible and relevant for comparison with other offers.
_Avoid_: Any priced page, search candidate

**Ranked Offer**:
A Comparable Offer ordered relative to others using reliability and price, with the most useful offers presented first.
_Avoid_: Cheapest offer, sponsored result

**Price History**:
The time-ordered record of prices for one Product Offer in one Search Currency.
_Avoid_: Product price history, price trend

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

**Recipient Email**:
An email address entered by the user as the destination for an individual Product Offer; it must pass basic syntactic validation but is not verified for ownership or deliverability.
_Avoid_: User account email, verified email

**Offer Email**:
An app-branded email containing one Product Offer's title, Original Price, Seller, and destination URL, sent to a Recipient Email.
_Avoid_: Search digest, marketing email
