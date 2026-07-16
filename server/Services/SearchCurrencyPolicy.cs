namespace PriceComparerWeb.Api.Services;

public static class SearchCurrencyPolicy
{
    public static bool TryNormalize(string? currency, out string normalized, out string error)
    {
        normalized = currency?.Trim().ToUpperInvariant() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            error = "Currency is required. Choose BRL, USD, or EUR.";
            return false;
        }

        if (normalized is not ("BRL" or "USD" or "EUR"))
        {
            error = "Currency must be BRL, USD, or EUR.";
            return false;
        }

        error = string.Empty;
        return true;
    }

    public static string NormalizeOrThrow(string? currency)
    {
        if (TryNormalize(currency, out var normalized, out var error))
        {
            return normalized;
        }

        throw new InvalidOperationException(error);
    }
}
