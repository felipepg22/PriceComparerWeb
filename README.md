# PriceComparerWeb

Monorepo with:
- `backend/`: ASP.NET Core Web API (.NET 10)
- `frontend/`: Angular 21 standalone app

## First feature

Screen to scrape one URL and show structured JSON data.

Backend endpoint:
- `POST /api/scrape`
- body: `{ "url": "https://example.com" }`

Returns:
- final URL
- status code
- title
- meta description
- headings (h1/h2/h3)
- links
- text preview

## Run backend

```bash
dotnet run --project backend/PriceComparerWeb.Api.csproj
```

Default HTTPS URL usually: `https://localhost:7168`

## Run frontend

Angular 21 needs Node >= 20.19.

If local Node is older, run with temporary Node:

```bash
cd frontend
npx -y node@20.19.0 ./node_modules/@angular/cli/bin/ng serve
```

Open: `http://localhost:4200`
