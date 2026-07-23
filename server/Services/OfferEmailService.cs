using System.Net;
using System.Net.Mail;
using System.Text;
using System.Globalization;
using Microsoft.Extensions.Options;
using PriceComparerWeb.Api.Models;
using PriceComparerWeb.Api.Options;

namespace PriceComparerWeb.Api.Services;

public interface IOfferEmailSender
{
    Task SendAsync(OfferEmailMessage message, CancellationToken cancellationToken);
}

public sealed class SmtpOfferEmailSender(IOptions<SmtpOptions> options) : IOfferEmailSender
{
    private readonly SmtpOptions options = options.Value;

    public async Task SendAsync(OfferEmailMessage message, CancellationToken cancellationToken)
    {
        if (!options.IsConfigured)
        {
            throw new InvalidOperationException("SMTP email delivery is not configured.");
        }

        using var client = new SmtpClient(options.Host, options.Port)
        {
            EnableSsl = options.EnableSsl,
            Credentials = new NetworkCredential(options.Username, options.Password)
        };
        using var mail = new MailMessage
        {
            From = new MailAddress(options.FromAddress, options.FromName),
            Subject = message.Subject,
            Body = message.PlainTextBody,
            IsBodyHtml = false,
            SubjectEncoding = Encoding.UTF8,
            BodyEncoding = Encoding.UTF8
        };
        mail.To.Add(new MailAddress(message.RecipientEmail));
        mail.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(
            message.HtmlBody, Encoding.UTF8, "text/html"));

        cancellationToken.ThrowIfCancellationRequested();
        await client.SendMailAsync(mail, cancellationToken);
    }
}

public static class OfferEmailTemplate
{
    public static OfferEmailMessage Create(OfferEmailRequest request)
    {
        var title = WebUtility.HtmlEncode(request.Offer.Title.Trim());
        var seller = WebUtility.HtmlEncode(request.Offer.Seller.Trim());
        var currency = WebUtility.HtmlEncode(request.Offer.Currency.Trim().ToUpperInvariant());
        var url = WebUtility.HtmlEncode(request.Offer.Url.Trim());
        var price = $"{request.Offer.PriceAmount.ToString("0.##", CultureInfo.InvariantCulture)} {currency}";
        var copy = LocalizedOfferEmailCopy.For(request.Locale);
        var subject = $"{copy.SubjectPrefix}: {request.Offer.Title.Trim()}";
        var plainText = $"{request.Offer.Title.Trim()}\n\n{copy.PriceLabel}: {price}\n{copy.SellerLabel}: {request.Offer.Seller.Trim()}\n{copy.LinkLabel}: {request.Offer.Url.Trim()}\n";
        var html = $"""
            <!doctype html><html lang="{copy.Locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
            <body style="margin:0;background:#e8ebe6;color:#0e0f0c;font-family:Inter,Arial,sans-serif;padding:32px 16px">
              <div style="max-width:620px;margin:auto;background:#fff;border-radius:24px;overflow:hidden">
                <div style="background:#0e0f0c;color:#9fe870;padding:24px 28px;font-size:22px;font-weight:800">PriceComparer</div>
                <div style="padding:28px"><p style="margin:0 0 8px;color:#626560;font-size:14px">{copy.OfferFoundLabel}</p>
                  <h1 style="margin:0 0 24px;font-size:28px;line-height:1.15">{title}</h1>
                  <div style="background:#f7f9f5;border:1px solid #d5d9d2;border-radius:12px;padding:18px">
                    <p style="margin:0 0 8px;color:#626560">{copy.PriceLabel}</p><p style="margin:0 0 16px;font-size:26px;font-weight:800">{WebUtility.HtmlEncode(price)}</p>
                    <p style="margin:0;color:#454745">{copy.SellerLabel}: <strong>{seller}</strong></p>
                  </div>
                  <p style="margin:24px 0 0"><a href="{url}" style="display:inline-block;background:#9fe870;color:#0e0f0c;text-decoration:none;border-radius:12px;padding:13px 18px;font-weight:800">{copy.ViewOfferLabel}</a></p>
                </div>
              </div>
            </body></html>
            """;
        return new OfferEmailMessage(request.RecipientEmail.Trim(), subject, html, plainText);
    }
}

internal sealed record LocalizedOfferEmailCopy(string Locale, string OfferFoundLabel, string PriceLabel, string SellerLabel, string LinkLabel, string ViewOfferLabel, string SubjectPrefix)
{
    public static LocalizedOfferEmailCopy For(string? locale) => locale switch
    {
        "pt-BR" => new("pt-BR", "Oferta encontrada", "Preço", "Vendedor", "Link", "Ver oferta", "Oferta encontrada"),
        "es-ES" => new("es-ES", "Oferta encontrada", "Precio", "Vendedor", "Enlace", "Ver oferta", "Oferta encontrada"),
        _ => new("en-US", "Offer found", "Price", "Seller", "Link", "View offer", "Offer found")
    };
}

public static class OfferEmailValidation
{
    public static bool TryValidate(OfferEmailRequest request, out string error)
    {
        if (string.IsNullOrWhiteSpace(request.RecipientEmail) ||
            !MailAddress.TryCreate(request.RecipientEmail.Trim(), out var address) ||
            !string.Equals(address.Address, request.RecipientEmail.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            error = "Recipient email must be a valid email address.";
            return false;
        }

        if (request.Offer is null || string.IsNullOrWhiteSpace(request.Offer.Title) || request.Offer.Title.Length > 300 ||
            string.IsNullOrWhiteSpace(request.Offer.Seller) || request.Offer.Seller.Length > 200)
        {
            error = "Offer title and seller are required.";
            return false;
        }

        if (request.Offer.PriceAmount < 0 || string.IsNullOrWhiteSpace(request.Offer.Currency) || request.Offer.Currency.Length > 10)
        {
            error = "Offer price and currency are invalid.";
            return false;
        }

        if (!Uri.TryCreate(request.Offer.Url?.Trim(), UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            error = "Offer URL must be a valid http or https address.";
            return false;
        }

        error = string.Empty;
        return true;
    }
}
