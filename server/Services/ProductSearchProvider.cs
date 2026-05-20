using Microsoft.Extensions.Options;
using System.Text.Json.Serialization;
using PriceComparerWeb.Api.Models;
using PriceComparerWeb.Api.Options;

namespace PriceComparerWeb.Api.Services;

public interface IProductSearchProvider
{
    Task<IReadOnlyList<ProductSearchCandidate>> FindCandidatesAsync(string query, CancellationToken cancellationToken);
}

public sealed class SearXngProductSearchProvider(
    IOptions<ProductSearchOptions> options,
    IHttpClientFactory httpClientFactory) : IProductSearchProvider
{
    private static readonly string[] ShoppingIntentQuerySuffixes =
    [
        "",
        "comprar",
        "preco",
        "loja oficial comprar",
        "shop buy price"
    ];

    private static readonly string[] OfferIntentTerms =
    [
        "buy",
        "comprar",
        "deal",
        "deals",
        "loja",
        "offer",
        "oferta",
        "price",
        "preco",
        "precos",
        "shop",
        "store"
    ];

    private static readonly string[] OfferUrlHints =
    [
        "/buy-",
        "/dp/",
        "/p/",
        "/produto",
        "/product",
        "/shop/",
        "/smartphones/"
    ];

    private static readonly string[] InformationalHosts =
    [
        "wikipedia.org",
        "reddit.com",
        "youtube.com"
    ];

    public async Task<IReadOnlyList<ProductSearchCandidate>> FindCandidatesAsync(string query, CancellationToken cancellationToken)
    {
        var searchOptions = options.Value;
        var baseUri = ParseSearXngBaseUri(searchOptions);
        var client = httpClientFactory.CreateClient("searxng");
        var scoredCandidates = new Dictionary<string, ScoredCandidate>(StringComparer.OrdinalIgnoreCase);

        foreach (var expandedQuery in ExpandSearchQueries(query))
        {
            var searchUri = BuildSearchUri(baseUri, expandedQuery);
            using var response = await client.GetAsync(searchUri, cancellationToken);
            if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
            {
                throw new InvalidOperationException("SearXNG JSON API returned 403. Enable the json format in SearXNG settings.yml.");
            }

            response.EnsureSuccessStatusCode();

            var searchResponse = await response.Content.ReadFromJsonAsync<SearXngSearchResponse>(cancellationToken);
            var tokens = TextHelpers.QueryTokens(query);
            foreach (var (result, index) in (searchResponse?.Results ?? []).Select((result, index) => (result, index)))
            {
                var scoredCandidate = ToScoredCandidate(result, tokens, index);
                if (scoredCandidate is null)
                {
                    continue;
                }

                var normalizedUrl = NormalizeUrl(scoredCandidate.Candidate.Url);
                if (scoredCandidates.TryGetValue(normalizedUrl, out var existing))
                {
                    scoredCandidates[normalizedUrl] = existing with
                    {
                        Score = existing.Score + scoredCandidate.Score,
                        BestRank = Math.Min(existing.BestRank, scoredCandidate.BestRank)
                    };
                    continue;
                }

                scoredCandidates.Add(normalizedUrl, scoredCandidate);
            }
        }

        return scoredCandidates.Values
            .OrderByDescending(candidate => candidate.Score)
            .ThenBy(candidate => candidate.BestRank)
            .ThenBy(candidate => candidate.Candidate.SourceName)
            .Select(candidate => candidate.Candidate)
            .Take(Math.Max(1, searchOptions.MaxCandidates))
            .ToArray();
    }

    public static bool TryValidateOptions(ProductSearchOptions options, out string error)
    {
        if (!string.Equals(options.Provider, "SearXng", StringComparison.OrdinalIgnoreCase))
        {
            error = "Product search provider must be SearXng.";
            return false;
        }

        if (!Uri.TryCreate(options.SearXngBaseUrl, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            error = "SearXNG base URL is missing or invalid.";
            return false;
        }

        error = string.Empty;
        return true;
    }

    private static Uri ParseSearXngBaseUri(ProductSearchOptions options)
    {
        if (!TryValidateOptions(options, out var error))
        {
            throw new InvalidOperationException(error);
        }

        return new Uri(options.SearXngBaseUrl!, UriKind.Absolute);
    }

    private static IEnumerable<string> ExpandSearchQueries(string query)
    {
        var trimmedQuery = query.Trim();

        return ShoppingIntentQuerySuffixes
            .Select(suffix => string.IsNullOrWhiteSpace(suffix) ? trimmedQuery : $"{trimmedQuery} {suffix}")
            .Distinct(StringComparer.OrdinalIgnoreCase);
    }

    private static Uri BuildSearchUri(Uri baseUri, string query)
    {
        var builder = new UriBuilder(new Uri(baseUri, "search"));
        builder.Query = $"q={Uri.EscapeDataString(query.Trim())}&format=json";
        return builder.Uri;
    }

    private static ScoredCandidate? ToScoredCandidate(SearXngResult result, IReadOnlyList<string> tokens, int rank)
    {
        if (!Uri.TryCreate(result.Url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            return null;
        }

        var score = ScoreCandidate(result.Title, result.Content, result.Url, tokens);
        return score <= 0
            ? null
            : new ScoredCandidate(new ProductSearchCandidate(result.Url, "SearXNG", TextHelpers.NullIfBlank(result.Title)), score, rank);
    }

    private static int ScoreCandidate(string? title, string? content, string url, IReadOnlyList<string> tokens)
    {
        var haystack = TextHelpers.NormalizeForSearch($"{title} {content} {Uri.UnescapeDataString(url)}");
        var tokenScore = tokens.Count(token => haystack.Contains(token, StringComparison.OrdinalIgnoreCase)) * 10;
        if (tokenScore == 0)
        {
            return 0;
        }

        var offerIntentScore = OfferIntentTerms.Count(term => haystack.Contains(term, StringComparison.OrdinalIgnoreCase)) * 4;
        var offerUrlScore = OfferUrlHints.Count(hint => url.Contains(hint, StringComparison.OrdinalIgnoreCase)) * 8;
        var hostPenalty = IsInformationalHost(url) ? 20 : 0;

        return tokenScore + offerIntentScore + offerUrlScore - hostPenalty;
    }

    private static bool IsInformationalHost(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            return false;
        }

        return InformationalHosts.Any(host =>
            uri.Host.Equals(host, StringComparison.OrdinalIgnoreCase) ||
            uri.Host.EndsWith($".{host}", StringComparison.OrdinalIgnoreCase));
    }

    private static string NormalizeUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            return url;
        }

        return uri.GetLeftPart(UriPartial.Path).TrimEnd('/').ToLowerInvariant();
    }

    private sealed record ScoredCandidate(ProductSearchCandidate Candidate, int Score, int BestRank);

    private sealed class SearXngSearchResponse
    {
        [JsonPropertyName("results")]
        public SearXngResult[] Results { get; set; } = [];
    }

    private sealed class SearXngResult
    {
        [JsonPropertyName("url")]
        public string Url { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }
}
