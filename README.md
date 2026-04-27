# PriceComparerWeb

PriceComparerWeb is a web app to compare prices for any kind of product across online stores.

## Stack

- `server/`: ASP.NET Core Web API (.NET 10)
- `client/`: Angular 21 standalone app

## Product vision

- The user types a product name.
- The app searches the web for matching offers.
- Matching can use product model, SKU, and/or product name.
- Supported currencies: BRL (Brazilian Real), USD (US Dollar), and EUR (Euro).
- No website is explicitly excluded as a data source.

## Offer data shown

- price
- seller
- product URL

## Current base feature

The first implemented backend capability is generic page scraping through:

- `POST /api/scrape`
- body: `{ "url": "https://example.com" }`

It returns structured page metadata such as final URL, status code, title, headings, links, and text preview.

## Run server

```bash
dotnet run --project server/PriceComparerWeb.Api.csproj
```

Default HTTPS URL is usually `https://localhost:7168`.

## Run client

Angular 21 needs Node >= 20.19.

From `client/`:

```bash
npm install
npm start
```

Open `http://localhost:4200`.
