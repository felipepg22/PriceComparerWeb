using System.Net.Mail;
using System.Net.Sockets;
using System.Security.Authentication;
using System.IO;
using PriceComparerWeb.Api.Configuration;
using PriceComparerWeb.Api.Models;
using PriceComparerWeb.Api.Options;
using PriceComparerWeb.Api.Services;
using Microsoft.Extensions.Options;

DotEnvLoader.LoadFromAncestors(Directory.GetCurrentDirectory(), AppContext.BaseDirectory);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.Configure<ProductSearchOptions>(
    builder.Configuration.GetSection(ProductSearchOptions.SectionName));
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection(SmtpOptions.SectionName));
builder.Services.AddSingleton<IPageScraper, PageScraper>();
builder.Services.AddSingleton<IProductSearchProvider, SearXngProductSearchProvider>();
builder.Services.AddSingleton<IPriceExtractor, PriceExtractor>();
builder.Services.AddSingleton<IProductSearchService, ProductSearchService>();
builder.Services.AddSingleton<IOfferEmailSender, SmtpOfferEmailSender>();
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
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

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

    if (!SearchCurrencyPolicy.TryNormalize(request.Currency, out var requestedCurrency, out var currencyError))
    {
        return Results.BadRequest(new { error = currencyError });
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

app.MapPost("/api/offers/email", async (
    OfferEmailRequest request,
    IOfferEmailSender sender,
    CancellationToken cancellationToken) =>
{
    if (!OfferEmailValidation.TryValidate(request, out var validationError))
    {
        return Results.BadRequest(new { error = validationError });
    }

    try
    {
        await sender.SendAsync(OfferEmailTemplate.Create(request), cancellationToken);
        return Results.Ok(new { message = "Offer email sent successfully." });
    }
    catch (InvalidOperationException)
    {
        return Results.Json(
            new { error = "SMTP email delivery is not configured. Set the Smtp__Host, Smtp__Username, Smtp__Password, and Smtp__FromAddress settings before sending." },
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }
    catch (Exception exception) when (exception is SmtpException or AuthenticationException or SocketException or IOException)
    {
        return Results.Json(
            new { error = "The SMTP server could not accept the email. Check the SMTP host, port, TLS, and credentials." },
            statusCode: StatusCodes.Status502BadGateway);
    }
})
.WithName("EmailOffer");

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
