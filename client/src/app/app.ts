import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

interface ProductSearchResponse {
  query: string;
  currency: string | null;
  fetchedAtUtc: string;
  candidateCount: number;
  attemptedSourceCount: number;
  offers: ProductOffer[];
  attemptedSources: AttemptedSource[];
  warnings: string[];
}

interface ProductOffer {
  title: string;
  priceAmount: number;
  currency: 'BRL' | 'USD' | 'EUR';
  seller: string;
  url: string;
  sourceName: string;
  extractionMethod: string;
  confidence: number;
  fetchedAtUtc: string;
}

interface AttemptedSource {
  url: string;
  sourceName: string;
  status: 'success' | 'failed' | 'excluded';
  reason: string | null;
  statusCode: number | null;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly http = inject(HttpClient);
  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly result = signal<ProductSearchResponse | null>(null);
  protected readonly hasSearched = signal(false);
  protected readonly failedSources = computed(() =>
    this.result()?.attemptedSources.filter(source => source.status !== 'success') ?? []);

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

    this.http.post<ProductSearchResponse>('http://localhost:5235/api/products/search', body)
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

  protected formatPrice(offer: ProductOffer): string | null {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: offer.currency
    }).format(offer.priceAmount);
  }
}
