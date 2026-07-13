# Context Map

## Contexts

- [Price Comparison Experience](./client/CONTEXT.md) — presents product searches and comparable offers in the user's preferred language and currency
- [Offer Discovery](./server/CONTEXT.md) — discovers, validates, and ranks product offers from online sources

## Relationships

- **Price Comparison Experience → Offer Discovery**: submits a Product Query with an optional Search Currency
- **Offer Discovery → Price Comparison Experience**: returns ranked Product Offers, Attempted Sources, and Search Warnings
- **Price Comparison Experience ↔ Offer Discovery**: shares the meanings of Product Offer, Seller, Source, Original Price, and Supported Currency
- **Offer Discovery → Price Comparison Experience**: provides Conversion Rates so Original Prices can be presented as Display Prices
