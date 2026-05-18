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
  currency: 'BRL' | 'USD' | 'EUR';
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

export type DashboardConfidenceLabel = 'High' | 'Medium' | 'Low';

export interface DashboardOffer {
  title: string;
  formattedPrice: string;
  sellerLabel: string;
  sourceName: string;
  extractionMethod: string;
  confidencePercent: string;
  confidenceLabel: DashboardConfidenceLabel;
  url: string;
}

export function formatPriceAmount(amount: number, currency: ProductOffer['currency']): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

export function getSellerLabel(offer: Pick<ProductOffer, 'seller' | 'sourceName'>): string {
  return offer.seller.trim() || offer.sourceName;
}

export function getConfidencePercent(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function getConfidenceLabel(confidence: number): DashboardConfidenceLabel {
  if (confidence >= 0.8) {
    return 'High';
  }

  if (confidence >= 0.5) {
    return 'Medium';
  }

  return 'Low';
}
