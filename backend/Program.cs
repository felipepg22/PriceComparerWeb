using System.Net;
using AngleSharp.Html.Parser;
using PriceComparerWeb.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("frontend");
app.UseHttpsRedirection();

app.MapPost("/api/scrape", async (ScrapeRequest request, IHttpClientFactory httpClientFactory, CancellationToken cancellationToken) =>
{
    if (!TryValidateUrl(request.Url, out var parsedUri, out var validationError))
    {
        return Results.BadRequest(new { error = validationError });
    }

    var client = httpClientFactory.CreateClient("scraper");

    using var response = await client.GetAsync(parsedUri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
    var finalUrl = response.RequestMessage?.RequestUri?.ToString() ?? request.Url;
    var html = await ReadResponseBodyAsync(response, cancellationToken);

    var parser = new HtmlParser();
    var document = await parser.ParseDocumentAsync(html, cancellationToken);

    var result = new ScrapeResult(
        RequestedUrl: request.Url,
        FinalUrl: finalUrl,
        StatusCode: (int)response.StatusCode,
        Title: NullIfBlank(document.Title),
        MetaDescription: NullIfBlank(document.QuerySelector("meta[name='description']")?.GetAttribute("content")),
        Headings: new HeadingsResult(
            H1: SelectText(document, "h1"),
            H2: SelectText(document, "h2"),
            H3: SelectText(document, "h3")),
        Links: SelectLinks(document, finalUrl),
        TextPreview: BuildTextPreview(document.Body?.TextContent),
        FetchedAtUtc: DateTime.UtcNow);

    return Results.Ok(result);
})
.WithName("ScrapePage");

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

static async Task<string> ReadResponseBodyAsync(HttpResponseMessage response, CancellationToken cancellationToken)
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

static IReadOnlyList<string> SelectText(AngleSharp.Dom.IDocument document, string selector)
{
    return document.QuerySelectorAll(selector)
        .Select(element => NullIfBlank(element.TextContent))
        .OfType<string>()
        .Distinct()
        .Take(10)
        .ToArray();
}

static IReadOnlyList<ScrapedLink> SelectLinks(AngleSharp.Dom.IDocument document, string baseUrl)
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

            return new ScrapedLink(NullIfBlank(element.TextContent) ?? "(no text)", absoluteHref);
        })
        .OfType<ScrapedLink>()
        .DistinctBy(link => link.Href)
        .Take(50)
        .ToArray();
}

static string? ResolveHref(Uri? baseUri, string? rawHref)
{
    if (string.IsNullOrWhiteSpace(rawHref))
    {
        return null;
    }

    if (Uri.TryCreate(rawHref, UriKind.Absolute, out var absolute))
    {
        return absolute.ToString();
    }

    if (baseUri is not null && Uri.TryCreate(baseUri, rawHref, out var relative))
    {
        return relative.ToString();
    }

    return null;
}

static string BuildTextPreview(string? rawText)
{
    var normalized = NullIfBlank(rawText);
    if (normalized is null)
    {
        return string.Empty;
    }

    var compact = string.Join(' ', normalized.Split(default(string[]), StringSplitOptions.RemoveEmptyEntries));
    return compact.Length <= 500 ? compact : $"{compact[..500]}...";
}

static string? NullIfBlank(string? value)
{
    if (string.IsNullOrWhiteSpace(value))
    {
        return null;
    }

    return value.Trim();
}
