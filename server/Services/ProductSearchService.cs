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
    public async Task<ProductSearchResponse> SearchAsync(ProductSearchRequest request, CancellationToken cancellationToken)
    {
        var requestedCurrency = NormalizeRequestedCurrency(request.Currency);
        var candidates = await searchProvider.FindCandidatesAsync(request.Query, cancellationToken);
        var maxConcurrency = Math.Clamp(options.Value.MaxConcurrency, 1, Math.Clamp(options.Value.MaxCandidates, 1, 5));
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
            .OrderBy(offer => !string.IsNullOrWhiteSpace(requestedCurrency) && offer.Currency != requestedCurrency)
            .ThenBy(offer => offer.PriceAmount)
            .ThenByDescending(offer => offer.Confidence)
            .ThenBy(offer => offer.SourceName)
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
