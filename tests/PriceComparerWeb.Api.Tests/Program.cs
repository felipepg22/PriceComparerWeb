using System.Net;
using System.Text;
using AngleSharp.Html.Parser;
using Microsoft.Extensions.Options;
using PriceComparerWeb.Api.Models;
using PriceComparerWeb.Api.Options;
using PriceComparerWeb.Api.Services;

await ProductSearchServiceAttemptsAllCandidatesWhenConcurrencyIsLower();
await ProductSearchServiceClampsInvalidConcurrencyToOne();
await ProductSearchServiceExcludesLowPriceOutliersWithinSameCurrency();
await SearXngProviderHonorsMaxCandidates();

Console.WriteLine("Product search configuration regression checks passed.");

static async Task ProductSearchServiceAttemptsAllCandidatesWhenConcurrencyIsLower()
{
    var candidates = Enumerable.Range(1, 20)
        .Select(index => new ProductSearchCandidate($"https://store.example/products/{index}", "test", $"Product {index}"))
        .ToArray();
    var scraper = new TrackingPageScraper();
    var service = new ProductSearchService(
        Options.Create(new ProductSearchOptions { MaxCandidates = 20, MaxConcurrency = 5 }),
        new FixedProductSearchProvider(candidates),
        scraper,
        new NoOfferPriceExtractor());

    var response = await service.SearchAsync(new ProductSearchRequest("phone", null), CancellationToken.None);

    AssertEqual(20, response.CandidateCount, "CandidateCount should reflect all returned candidates.");
    AssertEqual(20, response.AttemptedSourceCount, "MaxConcurrency must not reduce attempted candidates.");
    AssertEqual(20, scraper.FetchCount, "Every candidate should be fetched.");
    AssertEqual(5, scraper.MaxObservedConcurrency, "MaxConcurrency should cap simultaneous fetches.");
}

static async Task ProductSearchServiceClampsInvalidConcurrencyToOne()
{
    var candidates = Enumerable.Range(1, 3)
        .Select(index => new ProductSearchCandidate($"https://store.example/products/{index}", "test", $"Product {index}"))
        .ToArray();
    var scraper = new TrackingPageScraper();
    var service = new ProductSearchService(
        Options.Create(new ProductSearchOptions { MaxCandidates = 3, MaxConcurrency = 0 }),
        new FixedProductSearchProvider(candidates),
        scraper,
        new NoOfferPriceExtractor());

    var response = await service.SearchAsync(new ProductSearchRequest("phone", null), CancellationToken.None);

    AssertEqual(3, response.AttemptedSourceCount, "Invalid MaxConcurrency should still process every candidate.");
    AssertEqual(1, scraper.MaxObservedConcurrency, "Invalid MaxConcurrency should clamp to one worker.");
}

static async Task SearXngProviderHonorsMaxCandidates()
{
    var provider = new SearXngProductSearchProvider(
        Options.Create(new ProductSearchOptions
        {
            Provider = "SearXng",
            SearXngBaseUrl = "https://search.example",
            MaxCandidates = 5,
            MaxConcurrency = 20
        }),
        new FixedHttpClientFactory(new HttpClient(new SearXngResponseHandler())
        {
            BaseAddress = new Uri("https://search.example")
        }));

    var candidates = await provider.FindCandidatesAsync("phone", CancellationToken.None);

    AssertEqual(5, candidates.Count, "Provider should use MaxCandidates as the candidate cap.");
}

static async Task ProductSearchServiceExcludesLowPriceOutliersWithinSameCurrency()
{
    var candidates = new[]
    {
        new ProductSearchCandidate("https://store.example/usd-low", "test", "USD Low"),
        new ProductSearchCandidate("https://store.example/usd-mid", "test", "USD Mid"),
        new ProductSearchCandidate("https://store.example/usd-high", "test", "USD High"),
        new ProductSearchCandidate("https://store.example/brl-normal", "test", "BRL Normal"),
        new ProductSearchCandidate("https://store.example/brl-high", "test", "BRL High")
    };

    var offersByUrl = new Dictionary<string, ProductOffer>(StringComparer.OrdinalIgnoreCase)
    {
        ["https://store.example/usd-low"] = NewOffer("USD Low", 30m, "USD", "https://store.example/usd-low"),
        ["https://store.example/usd-mid"] = NewOffer("USD Mid", 90m, "USD", "https://store.example/usd-mid"),
        ["https://store.example/usd-high"] = NewOffer("USD High", 110m, "USD", "https://store.example/usd-high"),
        ["https://store.example/brl-normal"] = NewOffer("BRL Normal", 1000m, "BRL", "https://store.example/brl-normal"),
        ["https://store.example/brl-high"] = NewOffer("BRL High", 1200m, "BRL", "https://store.example/brl-high")
    };

    var service = new ProductSearchService(
        Options.Create(new ProductSearchOptions { MaxCandidates = 10, MaxConcurrency = 5 }),
        new FixedProductSearchProvider(candidates),
        new TrackingPageScraper(),
        new OfferMapPriceExtractor(offersByUrl));

    var response = await service.SearchAsync(new ProductSearchRequest("phone", null), CancellationToken.None);

    AssertTrue(
        response.Offers.All(offer => !string.Equals(offer.Url, "https://store.example/usd-low", StringComparison.OrdinalIgnoreCase)),
        "Low USD outlier should be excluded from offers.");
    AssertTrue(
        response.Offers.Any(offer => string.Equals(offer.Url, "https://store.example/usd-mid", StringComparison.OrdinalIgnoreCase)),
        "USD offer above/equal cutoff should be retained.");
    AssertTrue(
        response.Offers.Any(offer => string.Equals(offer.Url, "https://store.example/brl-normal", StringComparison.OrdinalIgnoreCase)),
        "BRL offers should be evaluated in their own currency group and retained here.");

    var lowAttempt = response.AttemptedSources.FirstOrDefault(source => string.Equals(source.Url, "https://store.example/usd-low", StringComparison.OrdinalIgnoreCase));
    AssertTrue(lowAttempt is not null, "Low outlier attempted source should be present.");
    AssertEqual("excluded", lowAttempt!.Status, "Low outlier attempted source should be marked as excluded.");
    AssertTrue(
        string.Equals(lowAttempt.Reason, "Price is below 50% of the average USD offer price.", StringComparison.Ordinal),
        "Low outlier exclusion reason should be explicit and deterministic.");

    AssertEqual(candidates.Length, response.CandidateCount, "CandidateCount should remain unchanged after outlier filtering.");
    AssertEqual(candidates.Length, response.AttemptedSourceCount, "AttemptedSourceCount should remain unchanged after outlier filtering.");
    AssertTrue(
        response.Warnings.Any(warning => warning.Contains("Price is below 50% of the average USD offer price.", StringComparison.Ordinal)),
        "Warnings should include low outlier exclusion reason.");
}

static void AssertEqual<T>(T expected, T actual, string message)
{
    if (!EqualityComparer<T>.Default.Equals(expected, actual))
    {
        throw new InvalidOperationException($"{message} Expected {expected}, got {actual}.");
    }
}

static void AssertTrue(bool condition, string message)
{
    if (!condition)
    {
        throw new InvalidOperationException(message);
    }
}

static ProductOffer NewOffer(string title, decimal priceAmount, string currency, string url)
{
    return new ProductOffer(
        Title: title,
        PriceAmount: priceAmount,
        Currency: currency,
        Seller: "store.example",
        Url: url,
        SourceName: "test",
        ExtractionMethod: "structured-data",
        Confidence: 0.95,
        FetchedAtUtc: DateTime.UtcNow);
}

sealed class FixedProductSearchProvider(IReadOnlyList<ProductSearchCandidate> candidates) : IProductSearchProvider
{
    public Task<IReadOnlyList<ProductSearchCandidate>> FindCandidatesAsync(string query, CancellationToken cancellationToken)
    {
        return Task.FromResult(candidates);
    }
}

sealed class TrackingPageScraper : IPageScraper
{
    private readonly object syncRoot = new();
    private readonly HtmlParser parser = new();
    private int currentConcurrency;

    public int FetchCount { get; private set; }

    public int MaxObservedConcurrency { get; private set; }

    public async Task<PageScrapeDocument> FetchDocumentAsync(Uri uri, CancellationToken cancellationToken)
    {
        var active = Interlocked.Increment(ref currentConcurrency);
        lock (syncRoot)
        {
            MaxObservedConcurrency = Math.Max(MaxObservedConcurrency, active);
            FetchCount++;
        }

        try
        {
            await Task.Delay(10, cancellationToken);
            var document = await parser.ParseDocumentAsync("<html><head><title>Product</title></head><body></body></html>", cancellationToken);

            return new PageScrapeDocument(
                RequestedUrl: uri.ToString(),
                FinalUrl: uri.ToString(),
                StatusCode: 200,
                Document: document,
                FetchedAtUtc: DateTime.UtcNow);
        }
        finally
        {
            Interlocked.Decrement(ref currentConcurrency);
        }
    }

    public ScrapeResult ToScrapeResult(string requestedUrl, PageScrapeDocument page)
    {
        throw new NotSupportedException();
    }
}

sealed class NoOfferPriceExtractor : IPriceExtractor
{
    public ProductOffer? ExtractOffer(PageScrapeDocument page, ProductSearchCandidate candidate, string? requestedCurrency, out string? exclusionReason)
    {
        exclusionReason = "No test offer.";
        return null;
    }
}

sealed class OfferMapPriceExtractor(IReadOnlyDictionary<string, ProductOffer> offersByUrl) : IPriceExtractor
{
    public ProductOffer? ExtractOffer(PageScrapeDocument page, ProductSearchCandidate candidate, string? requestedCurrency, out string? exclusionReason)
    {
        exclusionReason = null;
        return offersByUrl.TryGetValue(candidate.Url, out var offer) ? offer : null;
    }
}

sealed class FixedHttpClientFactory(HttpClient client) : IHttpClientFactory
{
    public HttpClient CreateClient(string name)
    {
        return client;
    }
}

sealed class SearXngResponseHandler : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var results = string.Join(
            ",",
            Enumerable.Range(1, 10)
                .Select(index => $$"""{"url":"https://store.example/product-{{index}}","title":"phone product price {{index}}","content":"phone price shop"}"""));
        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent($$"""{"results":[{{results}}]}""", Encoding.UTF8, "application/json")
        };

        return Task.FromResult(response);
    }
}
