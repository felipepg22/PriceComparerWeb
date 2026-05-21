namespace PriceComparerWeb.Api.Options;

public sealed class CurrencyConversionOptions
{
    public const string SectionName = "CurrencyConversion";

    public string ProviderEndpoint { get; init; } = "https://open.er-api.com/v6/latest";
    public int TimeoutSeconds { get; init; } = 3;
    public int CacheDurationMinutes { get; init; } = 15;
    public int MaxFreshnessMinutes { get; init; } = 60;
    public string[] SupportedCurrencies { get; init; } = ["BRL", "USD", "EUR"];
}
