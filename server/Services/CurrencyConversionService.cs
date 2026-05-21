using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Options;
using PriceComparerWeb.Api.Models;
using PriceComparerWeb.Api.Options;

namespace PriceComparerWeb.Api.Services;

public interface ICurrencyConversionService
{
    Task<CurrencyConversionResponse> GetRatesAsync(CurrencyConversionRequest request, CancellationToken cancellationToken);
}

public sealed class CurrencyConversionService(
    IHttpClientFactory httpClientFactory,
    IOptions<CurrencyConversionOptions> options) : ICurrencyConversionService
{
    private readonly CurrencyConversionOptions _options = options.Value;
    private readonly SemaphoreSlim _cacheLock = new(1, 1);
    private DateTime _cacheFetchedAtUtc = DateTime.MinValue;
    private Dictionary<string, decimal>? _cachedBaseRates;
    private string _cachedBaseCurrency = "USD";

    public async Task<CurrencyConversionResponse> GetRatesAsync(CurrencyConversionRequest request, CancellationToken cancellationToken)
    {
        var targetCurrency = request.TargetCurrency.Trim().ToUpperInvariant();
        var sourceCurrencies = request.SourceCurrencies
            .Select(currency => currency.Trim().ToUpperInvariant())
            .Where(currency => !string.IsNullOrWhiteSpace(currency))
            .Distinct()
            .ToArray();
        var supported = _options.SupportedCurrencies.Select(currency => currency.ToUpperInvariant()).ToHashSet();

        var freshness = new CurrencyRateFreshness(_cacheFetchedAtUtc == DateTime.MinValue ? null : _cacheFetchedAtUtc, false, _options.MaxFreshnessMinutes);
        if (!supported.Contains(targetCurrency))
        {
            return new CurrencyConversionResponse(
                targetCurrency,
                sourceCurrencies.Select(source => new CurrencyConversionRate(source, targetCurrency, null, "unsupported")).ToArray(),
                freshness);
        }

        var rates = await GetOrFetchRatesAsync(cancellationToken);
        if (rates is null)
        {
            return new CurrencyConversionResponse(
                targetCurrency,
                sourceCurrencies.Select(source => new CurrencyConversionRate(source, targetCurrency, null, "unavailable")).ToArray(),
                freshness with { Stale = true });
        }

        var nowUtc = DateTime.UtcNow;
        var stale = _cacheFetchedAtUtc == DateTime.MinValue || (nowUtc - _cacheFetchedAtUtc) > TimeSpan.FromMinutes(_options.MaxFreshnessMinutes);
        var responseRates = sourceCurrencies.Select(source =>
        {
            if (!supported.Contains(source))
            {
                return new CurrencyConversionRate(source, targetCurrency, null, "unsupported");
            }

            var rate = ComputeRate(rates, source, targetCurrency);
            return rate is null
                ? new CurrencyConversionRate(source, targetCurrency, null, "unavailable")
                : new CurrencyConversionRate(source, targetCurrency, rate.Value, "success");
        }).ToArray();

        return new CurrencyConversionResponse(
            targetCurrency,
            responseRates,
            new CurrencyRateFreshness(_cacheFetchedAtUtc, stale, _options.MaxFreshnessMinutes));
    }

    private static decimal? ComputeRate(Dictionary<string, decimal> rates, string sourceCurrency, string targetCurrency)
    {
        if (sourceCurrency == targetCurrency)
        {
            return 1m;
        }

        if (!rates.TryGetValue(sourceCurrency, out var sourceToBase) ||
            !rates.TryGetValue(targetCurrency, out var targetToBase) ||
            sourceToBase == 0)
        {
            return null;
        }

        return targetToBase / sourceToBase;
    }

    private async Task<Dictionary<string, decimal>?> GetOrFetchRatesAsync(CancellationToken cancellationToken)
    {
        var nowUtc = DateTime.UtcNow;
        if (_cachedBaseRates is not null && nowUtc - _cacheFetchedAtUtc < TimeSpan.FromMinutes(_options.CacheDurationMinutes))
        {
            return _cachedBaseRates;
        }

        await _cacheLock.WaitAsync(cancellationToken);
        try
        {
            if (_cachedBaseRates is not null && nowUtc - _cacheFetchedAtUtc < TimeSpan.FromMinutes(_options.CacheDurationMinutes))
            {
                return _cachedBaseRates;
            }

            var client = httpClientFactory.CreateClient("exchange-rates");
            using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(_options.TimeoutSeconds));
            using var linked = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeout.Token);
            using var response = await client.GetAsync(_options.ProviderEndpoint, linked.Token);
            if (!response.IsSuccessStatusCode)
            {
                return _cachedBaseRates;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(linked.Token);
            var payload = await JsonSerializer.DeserializeAsync<ExchangeRatesPayload>(stream, cancellationToken: linked.Token);
            if (payload?.Rates is null || string.IsNullOrWhiteSpace(payload.BaseCode))
            {
                return _cachedBaseRates;
            }

            _cachedBaseCurrency = payload.BaseCode.ToUpperInvariant();
            _cachedBaseRates = payload.Rates
                .Where(pair => decimal.TryParse(pair.Value.ToString(), NumberStyles.Float, CultureInfo.InvariantCulture, out _))
                .ToDictionary(
                    pair => pair.Key.ToUpperInvariant(),
                    pair => decimal.Parse(pair.Value.ToString(), NumberStyles.Float, CultureInfo.InvariantCulture));
            _cachedBaseRates[_cachedBaseCurrency] = 1m;
            _cacheFetchedAtUtc = DateTime.UtcNow;
            return _cachedBaseRates;
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return _cachedBaseRates;
        }
        catch
        {
            return _cachedBaseRates;
        }
        finally
        {
            _cacheLock.Release();
        }
    }

    private sealed record ExchangeRatesPayload(
        string BaseCode,
        Dictionary<string, JsonElement> Rates);
}
