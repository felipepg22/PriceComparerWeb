import { SupportedCurrency } from './localization';

export type ConversionStatus = 'success' | 'unsupported' | 'unavailable';

export interface ConversionRateRequest {
  sourceCurrencies: SupportedCurrency[];
  targetCurrency: SupportedCurrency;
}

export interface ConversionRateItem {
  sourceCurrency: SupportedCurrency;
  targetCurrency: SupportedCurrency;
  rate: number | null;
  status: ConversionStatus;
}

export interface RateFreshnessMetadata {
  fetchedAtUtc: string | null;
  stale: boolean;
  maxAgeMinutes: number;
}

export interface ConversionRateResponse {
  targetCurrency: SupportedCurrency;
  rates: ConversionRateItem[];
  freshness: RateFreshnessMetadata;
}
