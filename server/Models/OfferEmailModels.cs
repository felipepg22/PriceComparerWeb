namespace PriceComparerWeb.Api.Models;

public sealed record OfferEmailRequest(
    string RecipientEmail,
    OfferEmailOffer Offer,
    string? Locale);

public sealed record OfferEmailOffer(
    string Title,
    decimal PriceAmount,
    string Currency,
    string Seller,
    string Url);

public sealed record OfferEmailMessage(
    string RecipientEmail,
    string Subject,
    string HtmlBody,
    string PlainTextBody);
