namespace PriceComparerWeb.Api.Models;

public sealed record ScrapeResult(
    string RequestedUrl,
    string FinalUrl,
    int StatusCode,
    string? Title,
    string? MetaDescription,
    HeadingsResult Headings,
    IReadOnlyList<ScrapedLink> Links,
    string TextPreview,
    DateTime FetchedAtUtc);

public sealed record HeadingsResult(
    IReadOnlyList<string> H1,
    IReadOnlyList<string> H2,
    IReadOnlyList<string> H3);

public sealed record ScrapedLink(string Text, string Href);
