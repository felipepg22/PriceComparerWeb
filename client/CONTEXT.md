# Price Comparison Experience

The user-facing context for searching for a product and comparing ranked offers across online sellers in a preferred language and currency.

## Search

**Product Query**:
The product description entered by the user to find comparable offers; it may include a product name, model, or SKU.
_Avoid_: Search term, keyword

**Search Currency**:
An optional currency constraint applied when looking for offers.
_Avoid_: Display currency, preferred currency

**Product Search**:
One attempt to find offers matching a Product Query and optional Search Currency.
_Avoid_: Scrape, lookup

## Offers

**Product Offer**:
A seller's purchasable product listing with a title, price, currency, seller, and destination URL.
_Avoid_: Product, search result, deal

**Ranked Offer**:
A Product Offer positioned relative to other offers by comparability, reliability, and price.
_Avoid_: Cheapest product, best product

**Seller**:
The merchant offering the product for purchase.
_Avoid_: Source, website, provider

**Source**:
The discovery channel through which a Product Offer was found.
_Avoid_: Seller, store

**Original Price**:
The Product Offer's price and currency as published by the Seller.
_Avoid_: Base price, source price

**Display Price**:
The Original Price presented in the user's Display Currency, when conversion is available.
_Avoid_: Original price, offer price

**Confidence**:
The degree of trust that the extracted price accurately represents the Product Offer.
_Avoid_: Rank, quality score

## Preferences

**Display Currency**:
The Supported Currency in which the user prefers to compare prices; it does not alter an offer's Original Price.
_Avoid_: Search currency, original currency

**Supported Currency**:
One of the currencies the product recognizes for searching and comparison: BRL, USD, or EUR.
_Avoid_: Any currency, locale

**Locale**:
The user's language and regional presentation preference.
_Avoid_: Currency, country
