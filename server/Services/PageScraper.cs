using System.Net;
using AngleSharp.Dom;
using AngleSharp.Html.Parser;
using PriceComparerWeb.Api.Models;

namespace PriceComparerWeb.Api.Services;

public interface IPageScraper
{
    Task<PageScrapeDocument> FetchDocumentAsync(Uri uri, CancellationToken cancellationToken);

    ScrapeResult ToScrapeResult(string requestedUrl, PageScrapeDocument page);
}

public sealed record PageScrapeDocument(
    string RequestedUrl,
    string FinalUrl,
    int StatusCode,
    IDocument Document,
    DateTime FetchedAtUtc);

public sealed class PageScraper(IHttpClientFactory httpClientFactory) : IPageScraper
{
    public async Task<PageScrapeDocument> FetchDocumentAsync(Uri uri, CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient("scraper");

        using var response = await client.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        var finalUrl = response.RequestMessage?.RequestUri?.ToString() ?? uri.ToString();
        var html = await ReadResponseBodyAsync(response, cancellationToken);

        var parser = new HtmlParser();
        var document = await parser.ParseDocumentAsync(html, cancellationToken);

        return new PageScrapeDocument(
            RequestedUrl: uri.ToString(),
            FinalUrl: finalUrl,
            StatusCode: (int)response.StatusCode,
            Document: document,
            FetchedAtUtc: DateTime.UtcNow);
    }

    public ScrapeResult ToScrapeResult(string requestedUrl, PageScrapeDocument page)
    {
        return new ScrapeResult(
            RequestedUrl: requestedUrl,
            FinalUrl: page.FinalUrl,
            StatusCode: page.StatusCode,
            Title: TextHelpers.NullIfBlank(page.Document.Title),
            MetaDescription: TextHelpers.NullIfBlank(page.Document.QuerySelector("meta[name='description']")?.GetAttribute("content")),
            Headings: new HeadingsResult(
                H1: SelectText(page.Document, "h1"),
                H2: SelectText(page.Document, "h2"),
                H3: SelectText(page.Document, "h3")),
            Links: SelectLinks(page.Document, page.FinalUrl),
            TextPreview: BuildTextPreview(page.Document.Body?.TextContent),
            FetchedAtUtc: page.FetchedAtUtc);
    }

    private static async Task<string> ReadResponseBodyAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        const int maxBytes = 2_000_000;
        using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var memory = new MemoryStream();

        var buffer = new byte[8192];
        var totalRead = 0;

        while (true)
        {
            var bytesRead = await stream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken);
            if (bytesRead == 0)
            {
                break;
            }

            totalRead += bytesRead;
            if (totalRead > maxBytes)
            {
                throw new HttpRequestException("Response body too large (max 2MB).", null, HttpStatusCode.RequestEntityTooLarge);
            }

            await memory.WriteAsync(buffer.AsMemory(0, bytesRead), cancellationToken);
        }

        memory.Position = 0;
        using var reader = new StreamReader(memory);
        return await reader.ReadToEndAsync(cancellationToken);
    }

    private static IReadOnlyList<string> SelectText(IDocument document, string selector)
    {
        return document.QuerySelectorAll(selector)
            .Select(element => TextHelpers.NullIfBlank(element.TextContent))
            .OfType<string>()
            .Distinct()
            .Take(10)
            .ToArray();
    }

    private static IReadOnlyList<ScrapedLink> SelectLinks(IDocument document, string baseUrl)
    {
        var baseUri = Uri.TryCreate(baseUrl, UriKind.Absolute, out var parsedBaseUri) ? parsedBaseUri : null;

        return document.QuerySelectorAll("a[href]")
            .Select(element =>
            {
                var hrefValue = element.GetAttribute("href");
                var absoluteHref = ResolveHref(baseUri, hrefValue);
                if (absoluteHref is null)
                {
                    return null;
                }

                return new ScrapedLink(TextHelpers.NullIfBlank(element.TextContent) ?? "(no text)", absoluteHref);
            })
            .OfType<ScrapedLink>()
            .DistinctBy(link => link.Href)
            .Take(50)
            .ToArray();
    }

    public static string? ResolveHref(Uri? baseUri, string? rawHref)
    {
        if (string.IsNullOrWhiteSpace(rawHref))
        {
            return null;
        }

        if (Uri.TryCreate(rawHref, UriKind.Absolute, out var absolute) &&
            (absolute.Scheme == Uri.UriSchemeHttp || absolute.Scheme == Uri.UriSchemeHttps))
        {
            return absolute.ToString();
        }

        if (baseUri is not null && Uri.TryCreate(baseUri, rawHref, out var relative) &&
            (relative.Scheme == Uri.UriSchemeHttp || relative.Scheme == Uri.UriSchemeHttps))
        {
            return relative.ToString();
        }

        return null;
    }

    private static string BuildTextPreview(string? rawText)
    {
        var normalized = TextHelpers.NullIfBlank(rawText);
        if (normalized is null)
        {
            return string.Empty;
        }

        var compact = string.Join(' ', normalized.Split(default(string[]), StringSplitOptions.RemoveEmptyEntries));
        return compact.Length <= 500 ? compact : $"{compact[..500]}...";
    }
}
