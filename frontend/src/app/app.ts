import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

interface ScrapeResponse {
  requestedUrl: string;
  finalUrl: string;
  statusCode: number;
  title: string | null;
  metaDescription: string | null;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  links: Array<{
    text: string;
    href: string;
  }>;
  textPreview: string;
  fetchedAtUtc: string;
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
  protected readonly result = signal<ScrapeResponse | null>(null);
  protected readonly prettyJson = signal('');

  protected readonly form = new FormGroup({
    url: new FormControl('https://example.com', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]
    })
  });

  protected scrape(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiError.set(null);
    this.result.set(null);
    this.prettyJson.set('');

    const body = { url: this.form.controls.url.value.trim() };

    this.http.post<ScrapeResponse>('https://localhost:7168/api/scrape', body)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.result.set(response);
          this.prettyJson.set(JSON.stringify(response, null, 2));
        },
        error: (error) => {
          const message = error?.error?.error || 'Scrape failed. Check URL and backend status.';
          this.apiError.set(message);
        }
      });
  }

  protected hasUrlError(): boolean {
    const control = this.form.controls.url;
    return control.touched && control.invalid;
  }
}
