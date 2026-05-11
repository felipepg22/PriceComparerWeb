using PriceComparerWeb.Api.Models;
using PriceComparerWeb.Api.Options;
using PriceComparerWeb.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.Configure<ProductSearchOptions>(
    builder.Configuration.GetSection(ProductSearchOptions.SectionName));
builder.Services.AddSingleton<IPageScraper, PageScraper>();
builder.Services.AddSingleton<IProductSearchProvider, SearXngProductSearchProvider>();
builder.Services.AddSingleton<IPriceExtractor, PriceExtractor>();
builder.Services.AddSingleton<IProductSearchService, ProductSearchService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("client", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddHttpClient("scraper", client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("PriceComparerWeb/1.0");
});
builder.Services.AddHttpClient("searxng", client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("PriceComparerWeb/1.0");
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("client");
app.UseHttpsRedirection();

app.MapPost("/api/scrape", async (ScrapeRequest request, IPageScraper pageScraper, CancellationToken cancellationToken) =>
{
    if (!TryValidateUrl(request.Url, out var parsedUri, out var validationError))
    {
        return Results.BadRequest(new { error = validationError });
    }

    var page = await pageScraper.FetchDocumentAsync(parsedUri, cancellationToken);
    var result = pageScraper.ToScrapeResult(request.Url, page);

    return Results.Ok(result);
})
.WithName("ScrapePage");

app.MapPost("/api/products/search", async (
    ProductSearchRequest request,
    IProductSearchService productSearchService,
    Microsoft.Extensions.Options.IOptions<ProductSearchOptions> options,
    CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(request.Query))
    {
        return Results.BadRequest(new { error = "Query is required." });
    }

    var requestedCurrency = request.Currency?.Trim().ToUpperInvariant();
    if (!string.IsNullOrWhiteSpace(requestedCurrency) &&
        requestedCurrency is not ("BRL" or "USD" or "EUR"))
    {
        return Results.BadRequest(new { error = "Currency must be BRL, USD, or EUR." });
    }

    if (!SearXngProductSearchProvider.TryValidateOptions(options.Value, out var configurationError))
    {
        return Results.BadRequest(new { error = configurationError });
    }

    var normalizedRequest = request with { Currency = requestedCurrency };
    try
    {
        var result = await productSearchService.SearchAsync(normalizedRequest, cancellationToken);
        return Results.Ok(result);
    }
    catch (InvalidOperationException exception)
    {
        return Results.BadRequest(new { error = exception.Message });
    }
})
.WithName("SearchProducts");

app.Run();

static bool TryValidateUrl(string? input, out Uri uri, out string error)
{
    if (string.IsNullOrWhiteSpace(input))
    {
        uri = null!;
        error = "URL is required.";
        return false;
    }

    if (!Uri.TryCreate(input.Trim(), UriKind.Absolute, out var parsedUri) ||
        (parsedUri.Scheme != Uri.UriSchemeHttp && parsedUri.Scheme != Uri.UriSchemeHttps))
    {
        uri = null!;
        error = "URL must be a valid http or https address.";
        return false;
    }

    uri = parsedUri;

    error = string.Empty;
    return true;
}
