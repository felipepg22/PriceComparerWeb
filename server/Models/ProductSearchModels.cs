namespace PriceComparerWeb.Api.Models;

public sealed record ProductSearchRequest(
    string Query,
    string? Currency);

public sealed record ProductSearchResponse(
    string Query,
    string? Currency,
    DateTime FetchedAtUtc,
    int CandidateCount,
    int AttemptedSourceCount,
    IReadOnlyList<ProductOffer> Offers,
    IReadOnlyList<AttemptedSource> AttemptedSources,
    IReadOnlyList<string> Warnings);

public sealed record ProductOffer(
    string Title,
    decimal PriceAmount,
    string Currency,
    string Seller,
    string Url,
    string SourceName,
    string ExtractionMethod,
    double Confidence,
    DateTime FetchedAtUtc);

public sealed record AttemptedSource(
    string Url,
    string SourceName,
    string Status,
    string? Reason,
    int? StatusCode);

public sealed record ProductSearchCandidate(
    string Url,
    string SourceName,
    string? Title);
