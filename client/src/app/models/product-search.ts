import { SupportedCurrency } from './localization';

export interface ProductSearchResponse {
  query: string;
  currency: string | null;
  fetchedAtUtc: string;
  candidateCount: number;
  attemptedSourceCount: number;
  offers: ProductOffer[];
  attemptedSources: AttemptedSource[];
  warnings: string[];
}

export interface ProductOffer {
  title: string;
  priceAmount: number;
  currency: SupportedCurrency;
  seller: string;
  url: string;
  sourceName: string;
  extractionMethod: string;
  confidence: number;
  fetchedAtUtc: string;
}

export interface AttemptedSource {
  url: string;
  sourceName: string;
  status: 'success' | 'failed' | 'excluded';
  reason: string | null;
  statusCode: number | null;
}

export interface DashboardOffer {
  title: string;
  displayPrice: string;
  originalPrice: string;
  sellerLabel: string;
  sourceLabel: string;
  extractionLabel: string;
  sourceName: string;
  extractionMethod: string;
  confidencePercent: string;
  confidenceLabel: string;
  conversionUnavailable: boolean;
  conversionUnavailableLabel: string;
  freshnessLabel: string;
  openOfferLabel: string;
  originalPriceLabel: string;
  url: string;
}
