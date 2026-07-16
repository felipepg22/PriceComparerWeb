# Context Map

## Contexts

- [Price Comparison Experience](./client/CONTEXT.md) — presents product searches and comparable offers in the user's preferred language
- [Offer Discovery](./server/CONTEXT.md) — discovers, validates, and ranks product offers from online sources

## Relationships

- **Price Comparison Experience → Offer Discovery**: submits a Product Query with a required Search Currency
- **Offer Discovery → Price Comparison Experience**: returns ranked Product Offers, Attempted Sources, and Search Warnings
- **Price Comparison Experience ↔ Offer Discovery**: shares the meanings of Product Offer, Seller, Source, Original Price, and Supported Currency
