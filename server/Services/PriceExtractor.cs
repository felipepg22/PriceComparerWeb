using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using AngleSharp.Dom;
using PriceComparerWeb.Api.Models;

namespace PriceComparerWeb.Api.Services;

public interface IPriceExtractor
{
    ProductOffer? ExtractOffer(PageScrapeDocument page, ProductSearchCandidate candidate, string? requestedCurrency, out string? exclusionReason);
}

public sealed partial class PriceExtractor : IPriceExtractor
{
    private static readonly string[] SupportedCurrencies = ["BRL", "USD", "EUR"];

    public ProductOffer? ExtractOffer(PageScrapeDocument page, ProductSearchCandidate candidate, string? requestedCurrency, out string? exclusionReason)
    {
        var title = TextHelpers.NullIfBlank(page.Document.QuerySelector("meta[property='og:title']")?.GetAttribute("content")) ??
            TextHelpers.NullIfBlank(page.Document.Title) ??
            candidate.Title ??
            "Untitled product";

        var seller = SellerFromUrl(page.FinalUrl);
        var structured = ExtractStructuredOffer(page.Document);
        if (structured is not null)
        {
            return BuildOffer(structured.Value, title, seller, page, candidate, requestedCurrency, "structured-data", 0.95, out exclusionReason);
        }

        var meta = ExtractMetaOffer(page.Document);
        if (meta is not null)
        {
            return BuildOffer(meta.Value, title, seller, page, candidate, requestedCurrency, "metadata", 0.85, out exclusionReason);
        }

        var fallback = ExtractVisibleTextOffer(page.Document.Body?.TextContent);
        if (fallback is not null)
        {
            return BuildOffer(fallback.Value, title, seller, page, candidate, requestedCurrency, "visible-text", 0.6, out exclusionReason);
        }

        exclusionReason = "No extractable price found.";
        return null;
    }

    private static ProductOffer? BuildOffer(
        PriceCandidate price,
        string title,
        string seller,
        PageScrapeDocument page,
        ProductSearchCandidate candidate,
        string? requestedCurrency,
        string method,
        double confidence,
        out string? exclusionReason)
    {
        exclusionReason = null;
        var currency = NormalizeCurrency(price.Currency);
        if (currency is null)
        {
            exclusionReason = "Currency is unknown or unsupported.";
            return null;
        }

        if (!string.IsNullOrWhiteSpace(requestedCurrency) &&
            !string.Equals(currency, requestedCurrency, StringComparison.OrdinalIgnoreCase))
        {
            exclusionReason = $"Currency {currency} does not match requested currency {requestedCurrency}.";
            return null;
        }

        return new ProductOffer(
            Title: title,
            PriceAmount: price.Amount,
            Currency: currency,
            Seller: seller,
            Url: page.FinalUrl,
            SourceName: candidate.SourceName,
            ExtractionMethod: method,
            Confidence: confidence,
            FetchedAtUtc: page.FetchedAtUtc);
    }

    private static PriceCandidate? ExtractStructuredOffer(IDocument document)
    {
        foreach (var script in document.QuerySelectorAll("script[type='application/ld+json']"))
        {
            var json = TextHelpers.NullIfBlank(script.TextContent);
            if (json is null)
            {
                continue;
            }

            try
            {
                var node = JsonNode.Parse(json);
                var offer = FindOffer(node);
                if (offer is not null)
                {
                    return offer;
                }
            }
            catch (JsonException)
            {
            }
        }

        return null;
    }

    private static PriceCandidate? FindOffer(JsonNode? node)
    {
        if (node is null)
        {
            return null;
        }

        if (node is JsonArray array)
        {
            foreach (var item in array)
            {
                var offer = FindOffer(item);
                if (offer is not null)
                {
                    return offer;
                }
            }
        }

        if (node is not JsonObject obj)
        {
            return null;
        }

        var priceNode = obj["price"] ?? obj["lowPrice"] ?? obj["highPrice"];
        var currencyNode = obj["priceCurrency"];
        if (TryReadAmount(priceNode?.ToString(), out var amount))
        {
            return new PriceCandidate(amount, currencyNode?.ToString());
        }

        var offers = obj["offers"];
        if (offers is not null)
        {
            var offer = FindOffer(offers);
            if (offer is not null)
            {
                return offer;
            }
        }

        foreach (var property in obj)
        {
            var offer = FindOffer(property.Value);
            if (offer is not null)
            {
                return offer;
            }
        }

        return null;
    }

    private static PriceCandidate? ExtractMetaOffer(IDocument document)
    {
        var amountText = document.QuerySelector("meta[property='product:price:amount']")?.GetAttribute("content") ??
            document.QuerySelector("meta[itemprop='price']")?.GetAttribute("content");
        var currency = document.QuerySelector("meta[property='product:price:currency']")?.GetAttribute("content") ??
            document.QuerySelector("meta[itemprop='priceCurrency']")?.GetAttribute("content");

        return TryReadAmount(amountText, out var amount) ? new PriceCandidate(amount, currency) : null;
    }

    private static PriceCandidate? ExtractVisibleTextOffer(string? text)
    {
        var normalized = TextHelpers.NullIfBlank(text);
        if (normalized is null)
        {
            return null;
        }

        var match = PriceRegex().Matches(normalized)
            .Where(match => TryReadAmount(match.Groups["amount"].Value, out _))
            .OrderBy(match => match.Index)
            .FirstOrDefault();

        if (match is null || !TryReadAmount(match.Groups["amount"].Value, out var amount))
        {
            return null;
        }

        return new PriceCandidate(amount, CurrencyFromSymbol(match.Groups["currency"].Value));
    }

    private static string SellerFromUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uri) ? uri.Host.Replace("www.", "", StringComparison.OrdinalIgnoreCase) : "Unknown seller";
    }

    private static string? NormalizeCurrency(string? currency)
    {
        if (string.IsNullOrWhiteSpace(currency))
        {
            return null;
        }

        var normalized = currency.Trim().ToUpperInvariant();
        return SupportedCurrencies.Contains(normalized) ? normalized : null;
    }

    private static string? CurrencyFromSymbol(string symbol)
    {
        return symbol.Trim().ToUpperInvariant() switch
        {
            "R$" => "BRL",
            "$" => "USD",
            "US$" => "USD",
            "€" => "EUR",
            _ => null
        };
    }

    private static bool TryReadAmount(string? value, out decimal amount)
    {
        amount = 0;
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var cleaned = value.Trim();
        cleaned = Regex.Replace(cleaned, "[^0-9,.]", string.Empty);
        if (string.IsNullOrWhiteSpace(cleaned))
        {
            return false;
        }

        var lastComma = cleaned.LastIndexOf(',');
        var lastDot = cleaned.LastIndexOf('.');
        var decimalSeparator = lastComma > lastDot ? ',' : '.';
        var normalized = decimalSeparator == ','
            ? cleaned.Replace(".", string.Empty).Replace(',', '.')
            : cleaned.Replace(",", string.Empty);

        return decimal.TryParse(normalized, NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out amount) && amount > 0;
    }

    [GeneratedRegex(@"(?<currency>R\$|US\$|\$|€)\s*(?<amount>\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})|\d+(?:[.,]\d{2}))", RegexOptions.Compiled)]
    private static partial Regex PriceRegex();

    private readonly record struct PriceCandidate(decimal Amount, string? Currency);
}
