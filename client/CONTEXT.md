# Price Comparison Experience

The user-facing context for searching for a product and comparing ranked offers across online sellers in a preferred language.

## Search

**Product Query**:
The product description entered by the user to find comparable offers; it may include a product name, model, or SKU.
_Avoid_: Search term, keyword

**Search Currency**:
The required Supported Currency submitted with a Product Search to constrain it to offers whose Original Price uses that currency; other currencies are excluded rather than converted. Changing a prospective selection does not alter a completed Product Search.
_Avoid_: Display currency, preferred currency

**Product Search**:
One attempt to find offers matching a Product Query and its required Search Currency.
_Avoid_: Scrape, lookup

## Offers

**Product Offer**:
A seller's purchasable product listing with a title, price, currency, seller, and destination URL.
_Avoid_: Product, search result, deal

**Canonical Product**:
The distinct product model identified across seller listings by reliable attributes such as a model, SKU, or GTIN.
_Avoid_: Product offer, listing, search result

**Ranked Offer**:
A Product Offer positioned relative to other offers by comparability, reliability, and price.
_Avoid_: Cheapest product, best product

**Price History**:
The time-ordered record of prices for one Product Offer in one Search Currency.
_Avoid_: Product price history, price trend

**Seller**:
The merchant offering the product for purchase.
_Avoid_: Source, website, provider

**Source**:
The discovery channel through which a Product Offer was found.
_Avoid_: Seller, store

**Original Price**:
The Product Offer's price and currency as published by the Seller.
_Avoid_: Base price, source price

**Confidence**:
The degree of trust that the extracted price accurately represents the Product Offer.
_Avoid_: Rank, quality score

**Recipient Email**:
An email address entered by the user as the destination for an individual Product Offer; it must pass basic syntactic validation but is not verified for ownership or deliverability.
_Avoid_: User account email, verified email

**Offer Email**:
An app-branded email containing one Product Offer's title, Original Price, Seller, and destination URL, sent to a Recipient Email.
_Avoid_: Search digest, marketing email

## Preferences

**Supported Currency**:
One of the currencies the product recognizes for Product Searches: BRL, USD, or EUR.
_Avoid_: Any currency, locale

**Locale**:
The user's language and regional presentation preference.
_Avoid_: Currency, country
