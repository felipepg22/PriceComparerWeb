import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MetricsSummaryComponent } from './components/metrics-summary.component';
import { OfferCardComponent } from './components/offer-card.component';
import { SearchPanelComponent } from './components/search-panel.component';
import { StateMessageComponent } from './components/state-message.component';
import { ConversionRateResponse } from './models/conversion-rate';
import { SupportedCurrency, SupportedLocale } from './models/localization';
import {
  DashboardOffer,
  ProductOffer,
  ProductSearchResponse
} from './models/product-search';
import { PreferencesService } from './services/preferences.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SearchPanelComponent,
    MetricsSummaryComponent,
    OfferCardComponent,
    StateMessageComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly http = inject(HttpClient);
  protected readonly preferences = inject(PreferencesService);
  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly result = signal<ProductSearchResponse | null>(null);
  protected readonly hasSearched = signal(false);
  protected readonly conversionRates = signal<Map<SupportedCurrency, number>>(new Map());
  protected readonly conversionFreshness = signal<string | null>(null);
  protected readonly conversionLoading = signal(false);
  protected readonly conversionUnavailable = signal(false);
  protected readonly labels = computed(() => this.preferences.translations());
  protected readonly dashboardOffers = computed(() => this.result()?.offers.map(offer => this.dashboardOffer(offer)) ?? []);
  protected readonly localeOptions = this.preferences.localeOptions;
  protected readonly currencyOptions = this.preferences.currencyOptions;
  protected readonly trustHighlights = computed(() => this.labels().trustCards.slice(0, 2));

  protected readonly form = new FormGroup({
    query: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    currency: new FormControl('', { nonNullable: true })
  });

  constructor() {
    this.form.controls.currency.valueChanges.subscribe(currency => {
      if (!this.isSupportedCurrency(currency) || currency === this.preferences.displayCurrency()) {
        return;
      }

      this.preferences.setDisplayCurrency(currency);
      this.refreshConversionRates();
    });
  }

  protected search(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiError.set(null);
    this.result.set(null);
    this.conversionRates.set(new Map());
    this.conversionUnavailable.set(false);
    this.conversionFreshness.set(null);
    this.conversionLoading.set(false);
    this.hasSearched.set(true);

    const currency = this.form.controls.currency.value;
    const body = {
      query: this.form.controls.query.value.trim(),
      currency: currency || null
    };

    this.http.post<ProductSearchResponse>('/api/products/search', body)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.result.set(response);
          this.refreshConversionRates();
        },
        error: (error) => {
          const message = error?.error?.error || this.labels().errorDescription;
          this.apiError.set(message);
        }
      });
  }

  protected onLocaleChange(locale: string): void {
    this.preferences.setLocale(locale as SupportedLocale);
  }

  protected applySuggestion(suggestion: string): void {
    this.form.controls.query.setValue(suggestion);
    this.form.controls.query.markAsTouched();
    this.search();
  }

  protected hasQueryError(): boolean {
    const control = this.form.controls.query;
    return control.touched && control.invalid;
  }

  private refreshConversionRates(): void {
    const response = this.result();
    if (!response) {
      return;
    }

    const targetCurrency = this.preferences.displayCurrency();
    const sourceCurrencies = Array.from(new Set(response.offers.map(offer => offer.currency)))
      .filter(currency => currency !== targetCurrency);

    if (sourceCurrencies.length === 0) {
      this.conversionRates.set(new Map());
      this.conversionUnavailable.set(false);
      this.conversionFreshness.set(null);
      this.conversionLoading.set(false);
      return;
    }

    this.conversionLoading.set(true);
    this.http.post<ConversionRateResponse>('/api/conversion-rates', {
      sourceCurrencies,
      targetCurrency
    }).subscribe({
      next: (conversion) => {
        const rates = new Map<SupportedCurrency, number>();
        for (const item of conversion.rates) {
          if (item.status === 'success' && typeof item.rate === 'number') {
            rates.set(item.sourceCurrency, item.rate);
          }
        }

        this.conversionRates.set(rates);
        this.conversionFreshness.set(conversion.freshness.fetchedAtUtc);
        this.conversionUnavailable.set(rates.size === 0);
        this.conversionLoading.set(false);
      },
      error: () => {
        this.conversionRates.set(new Map());
        this.conversionUnavailable.set(true);
        this.conversionLoading.set(false);
      }
    });
  }

  private sellerLabel(offer: ProductOffer): string {
    return offer.seller.trim() || offer.sourceName;
  }

  private dashboardOffer(offer: ProductOffer): DashboardOffer {
    const targetCurrency = this.preferences.displayCurrency();
    const conversionRate = this.conversionRates().get(offer.currency);
    const hasConversion = offer.currency === targetCurrency || typeof conversionRate === 'number';
    const displayAmount = offer.currency === targetCurrency ? offer.priceAmount : (conversionRate ? offer.priceAmount * conversionRate : offer.priceAmount);
    const displayCurrency = offer.currency === targetCurrency ? offer.currency : targetCurrency;
    const labels = this.labels();

    return {
      title: offer.title,
      displayPrice: this.preferences.formatCurrency(displayAmount, displayCurrency),
      originalPrice: this.preferences.formatCurrency(offer.priceAmount, offer.currency),
      sellerLabel: this.sellerLabel(offer),
      sourceLabel: labels.offerSourceLabel,
      extractionLabel: labels.offerExtractionLabel,
      sourceName: offer.sourceName,
      extractionMethod: offer.extractionMethod,
      confidencePercent: this.preferences.formatConfidence(offer.confidence),
      confidenceLabel: this.preferences.confidenceLabel(offer.confidence),
      conversionUnavailable: !hasConversion,
      conversionUnavailableLabel: labels.conversionUnavailable,
      freshnessLabel: this.preferences.formatFreshness(this.conversionFreshness()),
      openOfferLabel: labels.openOffer,
      originalPriceLabel: labels.originalPrice,
      url: offer.url
    };
  }

  protected summaryFoundOffers(): string {
    return this.preferences.formatCount(this.result()?.offers.length ?? 0);
  }

  protected summaryCandidatePages(): string {
    return this.preferences.formatCount(this.result()?.candidateCount ?? 0);
  }

  protected summaryAttemptedSources(): string {
    return this.preferences.formatCount(this.result()?.attemptedSourceCount ?? 0);
  }

  private isSupportedCurrency(currency: string): currency is SupportedCurrency {
    return this.currencyOptions.some(option => option.code === currency);
  }
}
