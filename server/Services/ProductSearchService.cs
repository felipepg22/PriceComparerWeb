using Microsoft.Extensions.Options;
using PriceComparerWeb.Api.Models;
using PriceComparerWeb.Api.Options;

namespace PriceComparerWeb.Api.Services;

public interface IProductSearchService
{
    Task<ProductSearchResponse> SearchAsync(ProductSearchRequest request, CancellationToken cancellationToken);
}

public sealed class ProductSearchService(
    IOptions<ProductSearchOptions> options,
    IProductSearchProvider searchProvider,
    IPageScraper pageScraper,
    IPriceExtractor priceExtractor) : IProductSearchService
{
    private const int MaxRankedOffers = 10;

    private static readonly string[] LowValueHosts =
    [
        "facebook.com",
        "instagram.com",
        "linkedin.com",
        "pinterest.com",
        "reddit.com",
        "tiktok.com",
        "vimeo.com",
        "wikipedia.org",
        "x.com",
        "youtube.com"
    ];

    public async Task<ProductSearchResponse> SearchAsync(ProductSearchRequest request, CancellationToken cancellationToken)
    {
        var requestedCurrency = NormalizeRequestedCurrency(request.Currency);
        var candidates = await searchProvider.FindCandidatesAsync(request.Query, cancellationToken);
        var maxConcurrency = options.Value.EffectiveMaxConcurrency(candidates.Count);
        var attemptedSources = new List<AttemptedSource>();
        var offers = new List<ProductOffer>();

        using var semaphore = new SemaphoreSlim(maxConcurrency);
        var tasks = candidates.Select(candidate => ProcessCandidateAsync(candidate, requestedCurrency, semaphore, cancellationToken));
        var results = await Task.WhenAll(tasks);

        foreach (var result in results)
        {
            attemptedSources.Add(result.AttemptedSource);
            if (result.Offer is not null)
            {
                offers.Add(result.Offer);
            }
        }

        var orderedOffers = offers
            .Select(offer => new RankedOffer(offer, ScoreReliability(offer)))
            .OrderByDescending(ranked => ranked.ReliabilityScore)
            .ThenBy(ranked => ranked.Offer.PriceAmount)
            .ThenByDescending(ranked => ranked.Offer.Confidence)
            .ThenBy(ranked => ranked.Offer.SourceName, StringComparer.OrdinalIgnoreCase)
            .ThenBy(ranked => ranked.Offer.Seller, StringComparer.OrdinalIgnoreCase)
            .ThenBy(ranked => ranked.Offer.Title, StringComparer.OrdinalIgnoreCase)
            .ThenBy(ranked => ranked.Offer.Url, StringComparer.OrdinalIgnoreCase)
            .Select(ranked => ranked.Offer)
            .Take(MaxRankedOffers)
            .ToArray();

        var warnings = attemptedSources
            .Where(source => source.Status != "success")
            .Select(source => $"{source.SourceName}: {source.Reason}")
            .Distinct()
            .ToArray();

        return new ProductSearchResponse(
            Query: request.Query.Trim(),
            Currency: requestedCurrency,
            FetchedAtUtc: DateTime.UtcNow,
            CandidateCount: candidates.Count,
            AttemptedSourceCount: attemptedSources.Count,
            Offers: orderedOffers,
            AttemptedSources: attemptedSources,
            Warnings: warnings);
    }

    private static double ScoreReliability(ProductOffer offer)
    {
        var score = 0d;
        if (Uri.TryCreate(offer.Url, UriKind.Absolute, out var uri))
        {
            if (uri.Scheme == Uri.UriSchemeHttps)
            {
                score += 0.35;
            }

            if (IsLowValueHost(uri.Host))
            {
                score -= 1.2;
            }
        }

        score += offer.ExtractionMethod switch
        {
            "structured-data" => 1.2,
            "metadata" => 0.8,
            "visible-text" => 0.4,
            _ => 0.5
        };

        score += Math.Clamp(offer.Confidence, 0d, 1d);

        return Math.Round(score, 6, MidpointRounding.AwayFromZero);
    }

    private static bool IsLowValueHost(string host)
    {
        return LowValueHosts.Any(knownHost =>
            host.Equals(knownHost, StringComparison.OrdinalIgnoreCase) ||
            host.EndsWith($".{knownHost}", StringComparison.OrdinalIgnoreCase));
    }

    private sealed record RankedOffer(ProductOffer Offer, double ReliabilityScore);

    private async Task<CandidateResult> ProcessCandidateAsync(
        ProductSearchCandidate candidate,
        string? requestedCurrency,
        SemaphoreSlim semaphore,
        CancellationToken cancellationToken)
    {
        await semaphore.WaitAsync(cancellationToken);
        try
        {
            if (!Uri.TryCreate(candidate.Url, UriKind.Absolute, out var uri))
            {
                return CandidateResult.Failed(candidate, "Invalid candidate URL.", null);
            }

            PageScrapeDocument page;
            try
            {
                page = await pageScraper.FetchDocumentAsync(uri, cancellationToken);
            }
            catch (HttpRequestException exception)
            {
                return CandidateResult.Failed(candidate, exception.Message, null);
            }
            catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                return CandidateResult.Failed(candidate, "Candidate fetch timed out.", null);
            }

            var offer = priceExtractor.ExtractOffer(page, candidate, requestedCurrency, out var exclusionReason);
            if (offer is null)
            {
                return CandidateResult.Excluded(candidate, exclusionReason ?? "No comparable offer found.", page.StatusCode);
            }

            return CandidateResult.Success(candidate, offer, page.StatusCode);
        }
        finally
        {
            semaphore.Release();
        }
    }

    private static string? NormalizeRequestedCurrency(string? currency)
    {
        if (string.IsNullOrWhiteSpace(currency))
        {
            return null;
        }

        return currency.Trim().ToUpperInvariant();
    }

    private sealed record CandidateResult(AttemptedSource AttemptedSource, ProductOffer? Offer)
    {
        public static CandidateResult Success(ProductSearchCandidate candidate, ProductOffer offer, int statusCode)
        {
            return new CandidateResult(
                new AttemptedSource(candidate.Url, candidate.SourceName, "success", null, statusCode),
                offer);
        }

        public static CandidateResult Excluded(ProductSearchCandidate candidate, string reason, int? statusCode)
        {
            return new CandidateResult(
                new AttemptedSource(candidate.Url, candidate.SourceName, "excluded", reason, statusCode),
                null);
        }

        public static CandidateResult Failed(ProductSearchCandidate candidate, string reason, int? statusCode)
        {
            return new CandidateResult(
                new AttemptedSource(candidate.Url, candidate.SourceName, "failed", reason, statusCode),
                null);
        }
    }
}
