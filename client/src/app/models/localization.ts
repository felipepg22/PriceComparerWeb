export const SUPPORTED_LOCALES = ['en-US', 'pt-BR', 'es-ES'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const SUPPORTED_CURRENCIES = ['BRL', 'USD', 'EUR'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

export interface LocaleOption {
  code: SupportedLocale;
  label: string;
  shortLabel: string;
  flag: string;
}

export interface CurrencyOption {
  code: SupportedCurrency;
  label: string;
}

export interface AppTranslations {
  documentTitle: string;
  mainNavigationAriaLabel: string;
  brandHomeAriaLabel: string;
  topbarNote: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSupport: string;
  searchIntroTitle: string;
  searchIntroDescription: string;
  searchProductLabel: string;
  searchProductPlaceholder: string;
  searchCurrencyFilterLabel: string;
  searchCurrencyRequired: string;
  searchButton: string;
  searchingButton: string;
  languageLabel: string;
  summaryAriaLabel: string;
  foundOffers: string;
  candidatePages: string;
  attemptedSources: string;
  topOffersAriaLabel: string;
  bestOffersTitle: string;
  bestOverall: string;
  bestOverallExplanation: string;
  showMoreOffers: string;
  resultHelpExtraction: string;
  offerSourceLabel: string;
  offerExtractionLabel: string;
  openOffer: string;
  emailOffer: string;
  emailDialogTitle: string;
  emailRecipientLabel: string;
  emailRecipientPlaceholder: string;
  emailRequired: string;
  emailInvalid: string;
  emailCancel: string;
  emailSend: string;
  emailSending: string;
  emailSuccess: string;
  emailFailure: string;
  sellerUnknownFallback: string;
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
  searchSuggestionsAriaLabel: string;
  searchSuggestions: readonly string[];
  trustGridAriaLabel: string;
  trustCards: readonly {
    icon: string;
    title: string;
    description: string;
  }[];
}

export const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { code: 'en-US', label: 'English (US)', shortLabel: 'EN', flag: '🇺🇸' },
  { code: 'pt-BR', label: 'Português (Brasil)', shortLabel: 'PT', flag: '🇧🇷' },
  { code: 'es-ES', label: 'Español (España)', shortLabel: 'ES', flag: '🇪🇸' }
];

export const CURRENCY_OPTIONS: readonly CurrencyOption[] = [
  { code: 'BRL', label: 'BRL' },
  { code: 'USD', label: 'USD' },
  { code: 'EUR', label: 'EUR' }
];

export const TRANSLATIONS: Record<SupportedLocale, AppTranslations> = {
  'en-US': {
    documentTitle: 'Price Comparer',
    mainNavigationAriaLabel: 'Main navigation',
    brandHomeAriaLabel: 'Price Comparer home',
    topbarNote: 'Clear price. Trusted store.',
    heroEyebrow: 'Product comparison dashboard',
    heroTitle: 'Find the best offer',
    heroSubtitle: 'Search trusted sources and review top ranked offers (up to 10) in one place.',
    heroSupport: 'Compare price, shipping, delivery time, and store trust signals in a clean, focused experience.',
    searchIntroTitle: 'Product search',
    searchIntroDescription: 'Start with a name, model, or category.',
    searchProductLabel: 'Product',
    searchProductPlaceholder: 'iPhone 15 128GB',
    searchCurrencyFilterLabel: 'Currency',
    searchCurrencyRequired: 'Select a currency before searching for offers.',
    searchButton: 'Search offers',
    searchingButton: 'Searching...',
    languageLabel: 'Language',
    summaryAriaLabel: 'Search summary',
    foundOffers: 'found offers',
    candidatePages: 'candidate pages',
    attemptedSources: 'attempted sources',
    topOffersAriaLabel: 'Top ranked offers',
    bestOffersTitle: 'Best offers',
    bestOverall: 'Best overall',
    bestOverallExplanation: 'Highest-ranked based on reliability, price, and confidence.',
    showMoreOffers: 'Show more offers',
    resultHelpExtraction: 'Extraction shows how the price was read from each page.',
    offerSourceLabel: 'Source',
    offerExtractionLabel: 'Extraction',
    openOffer: 'Open offer',
    emailOffer: 'Email offer', emailDialogTitle: 'Email this offer', emailRecipientLabel: 'Recipient email', emailRecipientPlaceholder: 'name@example.com', emailRequired: 'Enter an email address.', emailInvalid: 'Enter a valid email address.', emailCancel: 'Cancel', emailSend: 'Send offer', emailSending: 'Sending...', emailSuccess: 'Offer sent successfully.', emailFailure: 'We could not send this offer. Please try again.',
    sellerUnknownFallback: 'Unknown seller',
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
    errorDescription: 'Check backend status and configured search sources.',
    searchSuggestionsAriaLabel: 'Search suggestions',
    searchSuggestions: ['iPhone 15', 'Gaming laptop', 'Running shoes', 'Bluetooth headphones'],
    trustGridAriaLabel: 'How comparison works',
    trustCards: [
      {
        icon: '$',
        title: 'Compare real price',
        description: 'See the difference between offers without visual noise from marketplaces or coupons.'
      },
      {
        icon: '✓',
        title: 'Trust the store',
        description: 'Combine price with reputation signals to avoid risky choices.'
      },
      {
        icon: '↗',
        title: 'Consider shipping and delivery',
        description: 'A low price matters less when delivery and extra costs make the purchase worse.'
      },
      {
        icon: '★',
        title: 'Choose better',
        description: 'Prioritize the whole offer, not just the lowest number on the shelf.'
      }
    ]
  },
  'pt-BR': {
    documentTitle: 'Price Comparer',
    mainNavigationAriaLabel: 'Navegação principal',
    brandHomeAriaLabel: 'Início do Price Comparer',
    topbarNote: 'Preço claro. Loja confiável.',
    heroEyebrow: 'Painel de comparação de produtos',
    heroTitle: 'Encontre a melhor oferta',
    heroSubtitle: 'Pesquise em fontes confiáveis e analise as melhores ofertas (até 10) em um só lugar.',
    heroSupport: 'Compare preço, frete, prazo e sinais de confiabilidade da loja em uma experiência limpa e objetiva.',
    searchIntroTitle: 'Busca de produto',
    searchIntroDescription: 'Comece por nome, modelo ou categoria.',
    searchProductLabel: 'Produto',
    searchProductPlaceholder: 'iPhone 15 128GB',
    searchCurrencyFilterLabel: 'Moeda',
    searchCurrencyRequired: 'Selecione uma moeda antes de buscar ofertas.',
    searchButton: 'Buscar ofertas',
    searchingButton: 'Buscando...',
    languageLabel: 'Idioma',
    summaryAriaLabel: 'Resumo da busca',
    foundOffers: 'ofertas encontradas',
    candidatePages: 'páginas candidatas',
    attemptedSources: 'fontes tentadas',
    topOffersAriaLabel: 'Ofertas melhor ranqueadas',
    bestOffersTitle: 'Melhores ofertas',
    bestOverall: 'Melhor oferta geral',
    bestOverallExplanation: 'Melhor classificação com base em confiabilidade, preço e confiança.',
    showMoreOffers: 'Mostrar mais ofertas',
    resultHelpExtraction: 'Extração mostra como o preço foi lido em cada página.',
    offerSourceLabel: 'Fonte',
    offerExtractionLabel: 'Extração',
    openOffer: 'Abrir oferta',
    emailOffer: 'Enviar oferta', emailDialogTitle: 'Enviar esta oferta', emailRecipientLabel: 'E-mail do destinatário', emailRecipientPlaceholder: 'nome@exemplo.com', emailRequired: 'Digite um endereço de e-mail.', emailInvalid: 'Digite um endereço de e-mail válido.', emailCancel: 'Cancelar', emailSend: 'Enviar oferta', emailSending: 'Enviando...', emailSuccess: 'Oferta enviada com sucesso.', emailFailure: 'Não foi possível enviar esta oferta. Tente novamente.',
    sellerUnknownFallback: 'Vendedor não informado',
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
    errorDescription: 'Verifique o backend e as fontes de busca configuradas.',
    searchSuggestionsAriaLabel: 'Sugestões de busca',
    searchSuggestions: ['iPhone 15', 'Notebook gamer', 'Tênis corrida', 'Fone bluetooth'],
    trustGridAriaLabel: 'Como a comparação funciona',
    trustCards: [
      {
        icon: 'R$',
        title: 'Compare preço real',
        description: 'Veja a diferença entre ofertas sem ruído visual de marketplace ou cupom.'
      },
      {
        icon: '✓',
        title: 'Confie na loja',
        description: 'Combine preço com sinais de reputação para evitar escolhas arriscadas.'
      },
      {
        icon: '↗',
        title: 'Considere frete e prazo',
        description: 'Preço baixo perde força quando entrega e custos extras pioram a compra.'
      },
      {
        icon: '★',
        title: 'Escolha melhor',
        description: 'Priorize o conjunto da oferta, não apenas o menor número na vitrine.'
      }
    ]
  },
  'es-ES': {
    documentTitle: 'Price Comparer',
    mainNavigationAriaLabel: 'Navegación principal',
    brandHomeAriaLabel: 'Inicio de Price Comparer',
    topbarNote: 'Precio claro. Tienda confiable.',
    heroEyebrow: 'Panel de comparación de productos',
    heroTitle: 'Encuentra la mejor oferta',
    heroSubtitle: 'Busca en fuentes confiables y revisa las mejores ofertas (hasta 10) en un solo lugar.',
    heroSupport: 'Compara precio, envío, plazo y señales de confianza de la tienda en una experiencia limpia y directa.',
    searchIntroTitle: 'Búsqueda de producto',
    searchIntroDescription: 'Empieza con un nombre, modelo o categoría.',
    searchProductLabel: 'Producto',
    searchProductPlaceholder: 'iPhone 15 128GB',
    searchCurrencyFilterLabel: 'Moneda',
    searchCurrencyRequired: 'Selecciona una moneda antes de buscar ofertas.',
    searchButton: 'Buscar ofertas',
    searchingButton: 'Buscando...',
    languageLabel: 'Idioma',
    summaryAriaLabel: 'Resumen de búsqueda',
    foundOffers: 'ofertas encontradas',
    candidatePages: 'páginas candidatas',
    attemptedSources: 'fuentes intentadas',
    topOffersAriaLabel: 'Ofertas mejor clasificadas',
    bestOffersTitle: 'Mejores ofertas',
    bestOverall: 'Mejor oferta general',
    bestOverallExplanation: 'La mejor clasificación según fiabilidad, precio y confianza.',
    showMoreOffers: 'Mostrar más ofertas',
    resultHelpExtraction: 'Extracción indica cómo se leyó el precio en cada página.',
    offerSourceLabel: 'Fuente',
    offerExtractionLabel: 'Extracción',
    openOffer: 'Abrir oferta',
    emailOffer: 'Enviar oferta', emailDialogTitle: 'Enviar esta oferta', emailRecipientLabel: 'Correo del destinatario', emailRecipientPlaceholder: 'nombre@ejemplo.com', emailRequired: 'Introduce una dirección de correo.', emailInvalid: 'Introduce una dirección de correo válida.', emailCancel: 'Cancelar', emailSend: 'Enviar oferta', emailSending: 'Enviando...', emailSuccess: 'Oferta enviada correctamente.', emailFailure: 'No pudimos enviar esta oferta. Inténtalo de nuevo.',
    sellerUnknownFallback: 'Vendedor no informado',
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
    errorDescription: 'Revisa el backend y las fuentes de búsqueda configuradas.',
    searchSuggestionsAriaLabel: 'Sugerencias de búsqueda',
    searchSuggestions: ['iPhone 15', 'Portátil gaming', 'Zapatillas running', 'Auriculares Bluetooth'],
    trustGridAriaLabel: 'Cómo funciona la comparación',
    trustCards: [
      {
        icon: '€',
        title: 'Compara el precio real',
        description: 'Ve la diferencia entre ofertas sin ruido visual de marketplaces o cupones.'
      },
      {
        icon: '✓',
        title: 'Confía en la tienda',
        description: 'Combina el precio con señales de reputación para evitar decisiones arriesgadas.'
      },
      {
        icon: '↗',
        title: 'Considera envío y plazo',
        description: 'Un precio bajo pierde fuerza cuando la entrega y los costes extra empeoran la compra.'
      },
      {
        icon: '★',
        title: 'Elige mejor',
        description: 'Prioriza el conjunto de la oferta, no solo el número más bajo del escaparate.'
      }
    ]
  }
};
