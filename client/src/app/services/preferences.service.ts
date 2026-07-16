import { Injectable, signal } from '@angular/core';
import {
  AppTranslations,
  CURRENCY_OPTIONS,
  CurrencyOption,
  LOCALE_OPTIONS,
  LocaleOption,
  SUPPORTED_LOCALES,
  SupportedCurrency,
  SupportedLocale,
  TRANSLATIONS
} from '../models/localization';

const STORAGE_LOCALE = 'price-comparer.locale';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly localeOptions: readonly LocaleOption[] = LOCALE_OPTIONS;
  readonly currencyOptions: readonly CurrencyOption[] = CURRENCY_OPTIONS;

  readonly activeLocale = signal<SupportedLocale>(this.resolveInitialLocale());

  readonly translations = () => TRANSLATIONS[this.activeLocale()];

  constructor() {
    this.applyDocumentMetadata(this.activeLocale());
  }

  setLocale(locale: SupportedLocale): void {
    if (!this.isSupportedLocale(locale)) {
      return;
    }

    this.activeLocale.set(locale);
    localStorage.setItem(STORAGE_LOCALE, locale);
    this.applyDocumentMetadata(locale);
  }

  formatCurrency(amount: number, currency: SupportedCurrency): string {
    return new Intl.NumberFormat(this.activeLocale(), { style: 'currency', currency }).format(amount);
  }

  formatCount(value: number): string {
    return new Intl.NumberFormat(this.activeLocale()).format(value);
  }

  formatConfidence(value: number): string {
    return new Intl.NumberFormat(this.activeLocale(), { style: 'percent', maximumFractionDigits: 0 }).format(value);
  }

  confidenceLabel(value: number): string {
    const translations = this.translations();
    if (value >= 0.8) {
      return translations.confidenceHigh;
    }

    if (value >= 0.5) {
      return translations.confidenceMedium;
    }

    return translations.confidenceLow;
  }

  private resolveInitialLocale(): SupportedLocale {
    const persisted = localStorage.getItem(STORAGE_LOCALE);
    if (this.isSupportedLocale(persisted)) {
      return persisted;
    }

    const detected = this.detectBrowserLocale();
    return detected ?? 'en-US';
  }

  private detectBrowserLocale(): SupportedLocale | null {
    const languageCandidates = [
      ...(navigator.languages ?? []),
      navigator.language ?? ''
    ]
      .filter(Boolean)
      .map(language => language.trim())
      .filter(Boolean);

    for (const language of languageCandidates) {
      if (this.isSupportedLocale(language)) {
        return language;
      }
    }

    for (const language of languageCandidates) {
      const base = language.split('-')[0]?.toLowerCase();
      if (base === 'en') {
        return 'en-US';
      }

      if (base === 'pt') {
        return 'pt-BR';
      }

      if (base === 'es') {
        return 'es-ES';
      }
    }

    return null;
  }

  private isSupportedLocale(value: string | null): value is SupportedLocale {
    return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
  }

  private applyDocumentMetadata(locale: SupportedLocale): void {
    document.documentElement.lang = locale;
    document.title = TRANSLATIONS[locale].documentTitle;
  }
}
