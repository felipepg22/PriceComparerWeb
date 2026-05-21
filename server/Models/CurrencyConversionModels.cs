namespace PriceComparerWeb.Api.Models;

public sealed record CurrencyConversionRequest(
    IReadOnlyList<string> SourceCurrencies,
    string TargetCurrency);

public sealed record CurrencyConversionRate(
    string SourceCurrency,
    string TargetCurrency,
    decimal? Rate,
    string Status);

public sealed record CurrencyRateFreshness(
    DateTime? FetchedAtUtc,
    bool Stale,
    int MaxAgeMinutes);

public sealed record CurrencyConversionResponse(
    string TargetCurrency,
    IReadOnlyList<CurrencyConversionRate> Rates,
    CurrencyRateFreshness Freshness);
