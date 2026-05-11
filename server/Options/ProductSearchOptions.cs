namespace PriceComparerWeb.Api.Options;

public sealed class ProductSearchOptions
{
    public const string SectionName = "ProductSearch";

    public string Provider { get; set; } = "SearXng";

    public string? SearXngBaseUrl { get; set; } = "http://localhost:8080";

    public int MaxCandidates { get; set; } = 5;

    public int MaxConcurrency { get; set; } = 3;
}
