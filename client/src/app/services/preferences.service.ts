import { Injectable, signal } from '@angular/core';
import {
  AppTranslations,
  CURRENCY_OPTIONS,
  CurrencyOption,
  LOCALE_OPTIONS,
  LocaleOption,
  SUPPORTED_CURRENCIES,
  SUPPORTED_LOCALES,
  SupportedCurrency,
  SupportedLocale,
  TRANSLATIONS
} from '../models/localization';

const STORAGE_LOCALE = 'price-comparer.locale';
const STORAGE_DISPLAY_CURRENCY = 'price-comparer.displayCurrency';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly localeOptions: readonly LocaleOption[] = LOCALE_OPTIONS;
  readonly currencyOptions: readonly CurrencyOption[] = CURRENCY_OPTIONS;

  readonly activeLocale = signal<SupportedLocale>(this.resolveInitialLocale());
  readonly displayCurrency = signal<SupportedCurrency>(this.resolveInitialDisplayCurrency());

  readonly translations = () => TRANSLATIONS[this.activeLocale()];

  setLocale(locale: SupportedLocale): void {
    this.activeLocale.set(locale);
    localStorage.setItem(STORAGE_LOCALE, locale);
  }

  setDisplayCurrency(currency: SupportedCurrency): void {
    this.displayCurrency.set(currency);
    localStorage.setItem(STORAGE_DISPLAY_CURRENCY, currency);
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

  formatFreshness(fetchedAtUtc: string | null): string {
    const translations = this.translations();
    if (!fetchedAtUtc) {
      return `${translations.rateFreshness}: -`;
    }

    const date = new Date(fetchedAtUtc);
    const formatted = new Intl.DateTimeFormat(this.activeLocale(), {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
    return `${translations.rateFreshness}: ${formatted}`;
  }

  private resolveInitialLocale(): SupportedLocale {
    const persisted = localStorage.getItem(STORAGE_LOCALE);
    if (this.isSupportedLocale(persisted)) {
      return persisted;
    }

    const detected = this.detectBrowserLocale();
    return detected ?? 'en-US';
  }

  private resolveInitialDisplayCurrency(): SupportedCurrency {
    const persisted = localStorage.getItem(STORAGE_DISPLAY_CURRENCY);
    if (this.isSupportedCurrency(persisted)) {
      return persisted;
    }

    return 'USD';
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

  private isSupportedCurrency(value: string | null): value is SupportedCurrency {
    return !!value && (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
  }
}
