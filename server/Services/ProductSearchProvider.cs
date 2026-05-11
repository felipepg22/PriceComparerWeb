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
    public async Task<IReadOnlyList<ProductSearchCandidate>> FindCandidatesAsync(string query, CancellationToken cancellationToken)
    {
        var searchOptions = options.Value;
        var baseUri = ParseSearXngBaseUri(searchOptions);
        var searchUri = BuildSearchUri(baseUri, query);
        var client = httpClientFactory.CreateClient("searxng");

        using var response = await client.GetAsync(searchUri, cancellationToken);
        if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
        {
            throw new InvalidOperationException("SearXNG JSON API returned 403. Enable the json format in SearXNG settings.yml.");
        }

        response.EnsureSuccessStatusCode();

        var searchResponse = await response.Content.ReadFromJsonAsync<SearXngSearchResponse>(cancellationToken);
        var tokens = TextHelpers.QueryTokens(query);

        return (searchResponse?.Results ?? [])
            .Select(result => ToScoredCandidate(result, tokens))
            .OfType<ScoredCandidate>()
            .OrderByDescending(candidate => candidate.Score)
            .ThenBy(candidate => candidate.Candidate.SourceName)
            .DistinctBy(candidate => NormalizeUrl(candidate.Candidate.Url))
            .Select(candidate => candidate.Candidate)
            .Take(Math.Clamp(searchOptions.MaxCandidates, 1, 5))
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

    private static Uri BuildSearchUri(Uri baseUri, string query)
    {
        var builder = new UriBuilder(new Uri(baseUri, "search"));
        builder.Query = $"q={Uri.EscapeDataString(query.Trim())}&format=json";
        return builder.Uri;
    }

    private static ScoredCandidate? ToScoredCandidate(SearXngResult result, IReadOnlyList<string> tokens)
    {
        if (!Uri.TryCreate(result.Url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            return null;
        }

        var score = ScoreCandidate(result.Title, result.Content, result.Url, tokens);
        return score <= 0
            ? null
            : new ScoredCandidate(new ProductSearchCandidate(result.Url, "SearXNG", TextHelpers.NullIfBlank(result.Title)), score);
    }

    private static int ScoreCandidate(string? title, string? content, string url, IReadOnlyList<string> tokens)
    {
        var haystack = TextHelpers.NormalizeForSearch($"{title} {content} {Uri.UnescapeDataString(url)}");
        return tokens.Count(token => haystack.Contains(token, StringComparison.OrdinalIgnoreCase));
    }

    private static string NormalizeUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            return url;
        }

        return uri.GetLeftPart(UriPartial.Path).TrimEnd('/').ToLowerInvariant();
    }

    private sealed record ScoredCandidate(ProductSearchCandidate Candidate, int Score);

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
