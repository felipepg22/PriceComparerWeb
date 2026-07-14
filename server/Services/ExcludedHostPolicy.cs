using System.Net;

namespace PriceComparerWeb.Api.Services;

public sealed class ExcludedHostPolicy
{
    private readonly string[] excludedRoots;

    private ExcludedHostPolicy(IEnumerable<string> excludedRoots)
    {
        this.excludedRoots = excludedRoots.ToArray();
    }

    public static ExcludedHostPolicy From(IEnumerable<string>? configuredHosts)
    {
        var validHosts = (configuredHosts ?? [])
            .Select(NormalizeConfiguredHost)
            .Where(host => host is not null)
            .Select(host => host!)
            .Distinct(StringComparer.OrdinalIgnoreCase);

        return new ExcludedHostPolicy(validHosts);
    }

    public bool IsExcluded(Uri uri)
    {
        var host = uri.Host.TrimEnd('.');
        return excludedRoots.Any(root =>
            host.Equals(root, StringComparison.OrdinalIgnoreCase) ||
            host.EndsWith($".{root}", StringComparison.OrdinalIgnoreCase));
    }

    private static string? NormalizeConfiguredHost(string? configuredHost)
    {
        if (string.IsNullOrWhiteSpace(configuredHost))
        {
            return null;
        }

        var host = configuredHost.Trim().TrimEnd('.');
        return host.Length > 0 &&
               !host.Any(char.IsWhiteSpace) &&
               IPAddress.TryParse(host, out _) is false &&
               Uri.CheckHostName(host) == UriHostNameType.Dns
            ? host.ToLowerInvariant()
            : null;
    }
}
