import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MetricsSummaryComponent } from './components/metrics-summary.component';
import { OfferCardComponent } from './components/offer-card.component';
import { SearchPanelComponent } from './components/search-panel.component';
import { StateMessageComponent } from './components/state-message.component';
import {
  DashboardOffer,
  DashboardConfidenceLabel,
  getConfidenceLabel,
  getConfidencePercent,
  getSellerLabel,
  ProductOffer,
  ProductSearchResponse,
  formatPriceAmount
} from './models/product-search';

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
  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly result = signal<ProductSearchResponse | null>(null);
  protected readonly hasSearched = signal(false);
  protected readonly dashboardOffers = computed(() => this.result()?.offers.map(offer => this.dashboardOffer(offer)) ?? []);

  protected readonly form = new FormGroup({
    query: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    currency: new FormControl('', { nonNullable: true })
  });

  protected search(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiError.set(null);
    this.result.set(null);
    this.hasSearched.set(true);

    const currency = this.form.controls.currency.value;
    const body = {
      query: this.form.controls.query.value.trim(),
      currency: currency || null
    };

    this.http.post<ProductSearchResponse>('/api/products/search', body)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.result.set(response),
        error: (error) => {
          const message = error?.error?.error || 'Product search failed. Check backend status and configured search sources.';
          this.apiError.set(message);
        }
      });
  }

  protected hasQueryError(): boolean {
    const control = this.form.controls.query;
    return control.touched && control.invalid;
  }

  protected formatPrice(offer: ProductOffer): string {
    return formatPriceAmount(offer.priceAmount, offer.currency);
  }

  protected sellerLabel(offer: ProductOffer): string {
    return getSellerLabel(offer);
  }

  protected confidencePercent(offer: ProductOffer): string {
    return getConfidencePercent(offer.confidence);
  }

  protected confidenceLabel(offer: ProductOffer): DashboardConfidenceLabel {
    return getConfidenceLabel(offer.confidence);
  }

  protected dashboardOffer(offer: ProductOffer): DashboardOffer {
    return {
      title: offer.title,
      formattedPrice: this.formatPrice(offer),
      sellerLabel: this.sellerLabel(offer),
      sourceName: offer.sourceName,
      extractionMethod: offer.extractionMethod,
      confidencePercent: this.confidencePercent(offer),
      confidenceLabel: this.confidenceLabel(offer),
      url: offer.url
    };
  }
}
