export const SUPPORTED_LOCALES = ['en-US', 'pt-BR', 'es-ES'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const SUPPORTED_CURRENCIES = ['BRL', 'USD', 'EUR'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

export interface LocaleOption {
  code: SupportedLocale;
  label: string;
}

export interface CurrencyOption {
  code: SupportedCurrency;
  label: string;
}

export interface AppTranslations {
  heroEyebrow: string;
  heroSubtitle: string;
  searchProductLabel: string;
  searchProductPlaceholder: string;
  searchCurrencyFilterLabel: string;
  searchAnyCurrency: string;
  searchButton: string;
  searchingButton: string;
  languageLabel: string;
  displayCurrencyLabel: string;
  summaryAriaLabel: string;
  foundOffers: string;
  candidatePages: string;
  attemptedSources: string;
  topOffersAriaLabel: string;
  openOffer: string;
  sellerUnknownFallback: string;
  conversionUnavailable: string;
  originalPrice: string;
  rateFreshness: string;
  confidenceHigh: string;
  confidenceMedium: string;
  confidenceLow: string;
  loadingTitle: string;
  loadingDescription: string;
  emptyTitle: string;
  emptyDescription: string;
  validationTitle: string;
  validationDescription: string;
  errorTitle: string;
  errorDescription: string;
}

export const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'es-ES', label: 'Español (España)' }
];

export const CURRENCY_OPTIONS: readonly CurrencyOption[] = [
  { code: 'BRL', label: 'BRL' },
  { code: 'USD', label: 'USD' },
  { code: 'EUR', label: 'EUR' }
];

export const TRANSLATIONS: Record<SupportedLocale, AppTranslations> = {
  'en-US': {
    heroEyebrow: 'Product comparison dashboard',
    heroSubtitle: 'Search trusted sources and review top ranked offers (up to 10) in one place.',
    searchProductLabel: 'Product',
    searchProductPlaceholder: 'iPhone 15 128GB',
    searchCurrencyFilterLabel: 'Currency',
    searchAnyCurrency: 'Any currency',
    searchButton: 'Search offers',
    searchingButton: 'Searching...',
    languageLabel: 'Language',
    displayCurrencyLabel: 'Display currency',
    summaryAriaLabel: 'Search summary',
    foundOffers: 'found offers',
    candidatePages: 'candidate pages',
    attemptedSources: 'attempted sources',
    topOffersAriaLabel: 'Top ranked offers',
    openOffer: 'Open offer',
    sellerUnknownFallback: 'Unknown seller',
    conversionUnavailable: 'Conversion unavailable',
    originalPrice: 'Original',
    rateFreshness: 'Rate updated',
    confidenceHigh: 'High',
    confidenceMedium: 'Medium',
    confidenceLow: 'Low',
    loadingTitle: 'Searching trusted sources...',
    loadingDescription: 'We are checking configured retailers and comparing what comes back.',
    emptyTitle: 'No comparable offers found.',
    emptyDescription: 'Try another product name or adjust the currency filter.',
    validationTitle: 'Enter at least 2 characters.',
    validationDescription: 'Use a product name that is long enough to search.',
    errorTitle: 'Search failed.',
    errorDescription: 'Check backend status and configured search sources.'
  },
  'pt-BR': {
    heroEyebrow: 'Painel de comparação de produtos',
    heroSubtitle: 'Pesquise em fontes confiáveis e analise as melhores ofertas (até 10) em um só lugar.',
    searchProductLabel: 'Produto',
    searchProductPlaceholder: 'iPhone 15 128GB',
    searchCurrencyFilterLabel: 'Moeda',
    searchAnyCurrency: 'Qualquer moeda',
    searchButton: 'Buscar ofertas',
    searchingButton: 'Buscando...',
    languageLabel: 'Idioma',
    displayCurrencyLabel: 'Moeda de exibição',
    summaryAriaLabel: 'Resumo da busca',
    foundOffers: 'ofertas encontradas',
    candidatePages: 'páginas candidatas',
    attemptedSources: 'fontes tentadas',
    topOffersAriaLabel: 'Ofertas melhor ranqueadas',
    openOffer: 'Abrir oferta',
    sellerUnknownFallback: 'Vendedor não informado',
    conversionUnavailable: 'Conversão indisponível',
    originalPrice: 'Original',
    rateFreshness: 'Cotação atualizada',
    confidenceHigh: 'Alta',
    confidenceMedium: 'Média',
    confidenceLow: 'Baixa',
    loadingTitle: 'Buscando em fontes confiáveis...',
    loadingDescription: 'Estamos verificando varejistas configurados e comparando os resultados.',
    emptyTitle: 'Nenhuma oferta comparável encontrada.',
    emptyDescription: 'Tente outro nome de produto ou ajuste o filtro de moeda.',
    validationTitle: 'Digite pelo menos 2 caracteres.',
    validationDescription: 'Use um nome de produto com tamanho suficiente para a busca.',
    errorTitle: 'Falha na busca.',
    errorDescription: 'Verifique o backend e as fontes de busca configuradas.'
  },
  'es-ES': {
    heroEyebrow: 'Panel de comparación de productos',
    heroSubtitle: 'Busca en fuentes confiables y revisa las mejores ofertas (hasta 10) en un solo lugar.',
    searchProductLabel: 'Producto',
    searchProductPlaceholder: 'iPhone 15 128GB',
    searchCurrencyFilterLabel: 'Moneda',
    searchAnyCurrency: 'Cualquier moneda',
    searchButton: 'Buscar ofertas',
    searchingButton: 'Buscando...',
    languageLabel: 'Idioma',
    displayCurrencyLabel: 'Moneda de visualización',
    summaryAriaLabel: 'Resumen de búsqueda',
    foundOffers: 'ofertas encontradas',
    candidatePages: 'páginas candidatas',
    attemptedSources: 'fuentes intentadas',
    topOffersAriaLabel: 'Ofertas mejor clasificadas',
    openOffer: 'Abrir oferta',
    sellerUnknownFallback: 'Vendedor no informado',
    conversionUnavailable: 'Conversión no disponible',
    originalPrice: 'Original',
    rateFreshness: 'Tipo de cambio actualizado',
    confidenceHigh: 'Alta',
    confidenceMedium: 'Media',
    confidenceLow: 'Baja',
    loadingTitle: 'Buscando en fuentes confiables...',
    loadingDescription: 'Estamos revisando comercios configurados y comparando los resultados.',
    emptyTitle: 'No se encontraron ofertas comparables.',
    emptyDescription: 'Prueba otro nombre de producto o ajusta el filtro de moneda.',
    validationTitle: 'Introduce al menos 2 caracteres.',
    validationDescription: 'Usa un nombre de producto lo suficientemente largo para buscar.',
    errorTitle: 'La búsqueda falló.',
    errorDescription: 'Revisa el backend y las fuentes de búsqueda configuradas.'
  }
};
