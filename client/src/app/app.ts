import { HttpClient } from '@angular/common/http';
import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { OfferCardComponent } from './components/offer-card.component';
import { SearchPanelComponent } from './components/search-panel.component';
import { StateMessageComponent } from './components/state-message.component';
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
  private static readonly offersPerBatch = 5;
  protected readonly visibleOfferCount = signal(App.offersPerBatch);
  protected readonly labels = computed(() => this.preferences.translations());
  protected readonly dashboardOffers = computed(() => this.result()?.offers.map(offer => this.dashboardOffer(offer)) ?? []);
  protected readonly visibleOffers = computed(() => this.dashboardOffers().slice(0, this.visibleOfferCount()));
  protected readonly hasMoreOffers = computed(() => this.dashboardOffers().length > this.visibleOfferCount());
  protected readonly localeOptions = this.preferences.localeOptions;
  protected readonly currencyOptions = this.preferences.currencyOptions;
  protected readonly emailOffer = signal<DashboardOffer | null>(null);
  protected readonly emailPending = signal(false);
  protected readonly emailStatus = signal<'idle' | 'success' | 'failure'>('idle');
  protected readonly emailForm = new FormGroup({
    recipientEmail: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] })
  });
  private emailReturnFocus: HTMLElement | null = null;

  protected readonly form = new FormGroup({
    query: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    currency: new FormControl<SupportedCurrency | ''>('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  protected search(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.visibleOfferCount.set(App.offersPerBatch);
    this.apiError.set(null);
    this.result.set(null);
    this.hasSearched.set(true);

    const currency = this.form.controls.currency.value;
    const body = {
      query: this.form.controls.query.value.trim(),
      currency
    };

    this.http.post<ProductSearchResponse>('/api/products/search', body)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.result.set(response);
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

  protected showMoreOffers(): void {
    this.visibleOfferCount.update(count => count + App.offersPerBatch);
  }

  protected applySuggestion(suggestion: string): void {
    this.form.controls.query.setValue(suggestion);
    this.form.controls.query.markAsTouched();
    this.search();
  }

  protected openEmailDialog(offer: DashboardOffer): void {
    this.emailReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.emailOffer.set(offer);
    this.emailStatus.set('idle');
    this.emailForm.reset();
    queueMicrotask(() => document.getElementById('recipient-email')?.focus());
  }

  protected closeEmailDialog(): void {
    if (!this.emailPending()) {
      this.emailOffer.set(null);
      const returnFocus = this.emailReturnFocus;
      this.emailReturnFocus = null;
      queueMicrotask(() => returnFocus?.focus());
    }
  }

  @HostListener('document:keydown.escape')
  protected dismissEmailDialogWithEscape(): void {
    if (this.emailOffer()) {
      this.closeEmailDialog();
    }
  }

  protected sendOfferEmail(): void {
    if (this.emailForm.invalid || !this.emailOffer() || this.emailPending()) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const offer = this.emailOffer()!;
    this.emailPending.set(true);
    this.emailStatus.set('idle');
    this.http.post('/api/offers/email', {
      recipientEmail: this.emailForm.controls.recipientEmail.value.trim(),
      locale: this.preferences.activeLocale(),
      offer: { title: offer.title, priceAmount: offer.priceAmount, currency: offer.currency, seller: offer.seller, url: offer.url }
    }).pipe(finalize(() => this.emailPending.set(false))).subscribe({
      next: () => this.emailStatus.set('success'),
      error: () => this.emailStatus.set('failure')
    });
  }

  private sellerLabel(offer: ProductOffer): string {
    return offer.seller.trim() || offer.sourceName;
  }

  private dashboardOffer(offer: ProductOffer): DashboardOffer {
    const labels = this.labels();

    return {
      title: offer.title,
      displayPrice: this.preferences.formatCurrency(offer.priceAmount, offer.currency),
      sellerLabel: this.sellerLabel(offer),
      sourceLabel: labels.offerSourceLabel,
      extractionLabel: labels.offerExtractionLabel,
      sourceName: offer.sourceName,
      extractionMethod: offer.extractionMethod,
      confidencePercent: this.preferences.formatConfidence(offer.confidence),
      confidenceLabel: this.preferences.confidenceLabel(offer.confidence),
      openOfferLabel: labels.openOffer,
      url: offer.url,
      priceAmount: offer.priceAmount,
      currency: offer.currency,
      seller: offer.seller
    };
  }

}
