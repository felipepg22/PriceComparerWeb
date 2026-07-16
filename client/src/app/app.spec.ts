import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import type { SupportedCurrency, SupportedLocale } from './models/localization';

type SearchCurrency = SupportedCurrency | '';

function setupStorage(locale?: string, currency?: string): void {
  localStorage.clear();
  if (locale) {
    localStorage.setItem('price-comparer.locale', locale);
  }
  if (currency) {
    localStorage.setItem('price-comparer.displayCurrency', currency);
  }
}

function submitSearch(fixture: ReturnType<typeof TestBed.createComponent<App>>, query: string, sourceCurrency: SearchCurrency = ''): void {
  const root = fixture.nativeElement as HTMLElement;
  const queryInput = root.querySelector('#query') as HTMLInputElement;
  const form = root.querySelector('form') as HTMLFormElement;
  queryInput.value = query;
  queryInput.dispatchEvent(new Event('input'));
  changeSearchCurrency(fixture, sourceCurrency);
  fixture.detectChanges();
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

function changeLocale(fixture: ReturnType<typeof TestBed.createComponent<App>>, locale: SupportedLocale): void {
  const root = fixture.nativeElement as HTMLElement;
  const option = root.querySelector<HTMLButtonElement>(`button[data-locale="${locale}"]`);
  if (!option) {
    throw new Error(`Expected locale option for ${locale}`);
  }
  option.click();
  fixture.detectChanges();
}

function offer(index: number, currency: SupportedCurrency = 'USD') {
  return {
    title: `Offer ${index}`,
    priceAmount: index * 100,
    currency,
    seller: `Seller ${index}`,
    url: `https://example.com/${index}`,
    sourceName: `Source ${index}`,
    extractionMethod: `method-${index}`,
    confidence: 0.9,
    fetchedAtUtc: '2026-05-11T12:00:00Z'
  };
}

function searchResponse(offers: ReturnType<typeof offer>[], query = 'phone') {
  return {
    query,
    currency: null,
    fetchedAtUtc: '2026-05-11T12:00:00Z',
    candidateCount: 1200,
    attemptedSourceCount: 900,
    offers,
    attemptedSources: [],
    warnings: []
  };
}

function changeProductCurrency(fixture: ReturnType<typeof TestBed.createComponent<App>>, currency: SearchCurrency): void {
  changeSearchCurrency(fixture, currency);
}

function changeSearchCurrency(fixture: ReturnType<typeof TestBed.createComponent<App>>, currency: SearchCurrency): void {
  const root = fixture.nativeElement as HTMLElement;
  const input = root.querySelector<HTMLInputElement>(`input[name="currency"][data-currency="${currency}"]`);
  if (!input) {
    throw new Error(`Expected currency input for ${currency || 'any currency'}`);
  }

  input.click();
  fixture.detectChanges();
}

describe('App localization and conversion', () => {
  let http: HttpTestingController;
  const originalNavigatorLanguage = navigator.language;
  const originalNavigatorLanguages = navigator.languages;

  beforeEach(async () => {
    setupStorage();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    Object.defineProperty(navigator, 'language', { value: originalNavigatorLanguage, configurable: true });
    Object.defineProperty(navigator, 'languages', { value: originalNavigatorLanguages, configurable: true });
  });

  it('restores a valid persisted locale and display currency', () => {
    setupStorage('pt-BR', 'EUR');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Encontre a melhor oferta');
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.title).toBe('Price Comparer');
    expect(root.querySelector('button[data-locale="pt-BR"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('select#displayCurrency')).toBeNull();
    expect(root.querySelector('select#currency')).toBeNull();
    expect(root.querySelector('#currency')?.getAttribute('role')).toBe('radiogroup');

    expect(root.querySelector('.language-switcher')?.getAttribute('aria-label')).toBe('Idioma');
    expect(root.querySelector('button[data-locale="pt-BR"]')?.getAttribute('aria-label')).toBe('Português (Brasil)');
  });

  it('falls back to en-US for invalid persisted locale and maps browser base language', () => {
    setupStorage('fr-FR', 'USD');
    Object.defineProperty(navigator, 'languages', { value: ['es-MX'], configurable: true });
    Object.defineProperty(navigator, 'language', { value: 'es-MX', configurable: true });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Encuentra la mejor oferta');
  });

  it('uses exact supported browser locale', () => {
    setupStorage(undefined, 'USD');
    Object.defineProperty(navigator, 'languages', { value: ['pt-BR'], configurable: true });
    Object.defineProperty(navigator, 'language', { value: 'pt-BR', configurable: true });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Encontre a melhor oferta');
  });

  it('falls back to en-US when browser locale is unsupported', () => {
    setupStorage(undefined, 'USD');
    Object.defineProperty(navigator, 'languages', { value: ['fr-FR'], configurable: true });
    Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Find the best offer');
  });

  it('keeps search payload semantics unchanged when language or product currency changes', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    changeLocale(fixture, 'pt-BR');
    changeProductCurrency(fixture, 'BRL');

    submitSearch(fixture, '  notebook gamer  ', 'USD');
    const req = http.expectOne('/api/products/search');
    expect(req.request.body).toEqual({ query: 'notebook gamer', currency: 'USD' });
    req.flush({ query: 'notebook gamer', currency: 'USD', fetchedAtUtc: '2026-05-11T12:00:00Z', candidateCount: 0, attemptedSourceCount: 0, offers: [], attemptedSources: [], warnings: [] });
  });

  it('renders localized ui copy in pt-BR and es-ES', () => {
    setupStorage('pt-BR', 'USD');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    let root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.topbar')?.getAttribute('aria-label')).toBe('Navegação principal');
    expect(root.querySelector('.brand')?.getAttribute('aria-label')).toBe('Início do Price Comparer');
    expect(root.querySelector('.suggestion-chips')?.getAttribute('aria-label')).toBe('Sugestões de busca');
    expect(root.textContent).toContain('Encontre a melhor oferta');
    expect(root.textContent).toContain('Notebook gamer');
    expect(root.textContent).toContain('Buscar ofertas');
    expect(root.querySelector('.trust-grid')).toBeNull();

    expect(root.querySelector('.language-switcher')?.getAttribute('aria-label')).toBe('Idioma');
    changeLocale(fixture, 'es-ES');
    root = fixture.nativeElement as HTMLElement;
    expect(document.documentElement.lang).toBe('es-ES');
    expect(root.querySelector('.topbar')?.getAttribute('aria-label')).toBe('Navegación principal');
    expect(root.querySelector('.brand')?.getAttribute('aria-label')).toBe('Inicio de Price Comparer');
    expect(root.querySelector('.language-switcher')?.getAttribute('aria-label')).toBe('Idioma');
    expect(root.querySelector('button[data-locale="es-ES"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('.suggestion-chips')?.getAttribute('aria-label')).toBe('Sugerencias de búsqueda');
    expect(root.textContent).toContain('Encuentra la mejor oferta');
    expect(root.textContent).toContain('Portátil gaming');
    expect(root.textContent).toContain('Buscar ofertas');
    expect(root.textContent).not.toContain('Panel de comparación de productos');
    expect(root.textContent).not.toContain('Preço claro. Loja confiável.');
  });

  it('shows field-level validation and result-shaped loading feedback while searching', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const form = root.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const queryInput = root.querySelector('#query') as HTMLInputElement;
    expect(queryInput.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('#query-error')?.textContent).toContain('Use a product name that is long enough to search.');

    submitSearch(fixture, 'phone');
    expect(root.querySelector('[data-kind="loading"]')?.getAttribute('role')).toBe('status');
    expect(root.querySelectorAll('.state-message__skeleton').length).toBe(3);

    http.expectOne('/api/products/search').flush(searchResponse([]));
  });

  it('shows converted price and original price without conversion freshness', () => {
    setupStorage('en-US', 'USD');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    submitSearch(fixture, 'camera');
    http.expectOne('/api/products/search').flush({
      query: 'camera',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 1,
      attemptedSourceCount: 1,
      offers: [{
        title: 'Camera X',
        priceAmount: 1000,
        currency: 'BRL',
        seller: 'Loja A',
        url: 'https://example.com/camera',
        sourceName: 'Example',
        extractionMethod: 'structured-data',
        confidence: 0.82,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [],
      warnings: []
    });

    http.expectOne('/api/conversion-rates').flush({
      targetCurrency: 'USD',
      rates: [{ sourceCurrency: 'BRL', targetCurrency: 'USD', rate: 0.2, status: 'success' }],
      freshness: { fetchedAtUtc: '2026-05-11T12:00:00Z', stale: false, maxAgeMinutes: 60 }
    });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('$200.00');
    expect(root.textContent).toContain('Original: R$1,000.00');
    expect(root.textContent).not.toContain('Rate updated');
  });

  it('preserves active form and results when language changes without product-search request', () => {
    setupStorage('en-US', 'USD');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    submitSearch(fixture, 'headphones');
    http.expectOne('/api/products/search').flush({
      query: 'headphones',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 1,
      attemptedSourceCount: 1,
      offers: [{
        title: 'Headphone A',
        priceAmount: 100,
        currency: 'USD',
        seller: 'Seller A',
        url: 'https://example.com/a',
        sourceName: 'Source A',
        extractionMethod: 'structured-data',
        confidence: 0.8,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [],
      warnings: []
    });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    changeLocale(fixture, 'pt-BR');

    http.expectNone('/api/products/search');
    expect((root.querySelector('#query') as HTMLInputElement).value).toBe('headphones');
    expect(root.textContent).toContain('Headphone A');
    expect(root.textContent).toContain('Encontre a melhor oferta');
  });

  it('product currency change preserves source filter and offer order without product search', () => {
    setupStorage('en-US', 'USD');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    submitSearch(fixture, 'keyboard', 'EUR');
    http.expectOne('/api/products/search').flush({
      query: 'keyboard',
      currency: 'EUR',
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 2,
      attemptedSourceCount: 2,
      offers: [{
        title: 'Offer One',
        priceAmount: 100,
        currency: 'USD',
        seller: 'S1',
        url: 'https://example.com/1',
        sourceName: 'A',
        extractionMethod: 'x',
        confidence: 0.6,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }, {
        title: 'Offer Two',
        priceAmount: 90,
        currency: 'BRL',
        seller: 'S2',
        url: 'https://example.com/2',
        sourceName: 'B',
        extractionMethod: 'y',
        confidence: 0.6,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [],
      warnings: []
    });
    http.expectOne('/api/conversion-rates').flush({
      targetCurrency: 'USD',
      rates: [
        { sourceCurrency: 'BRL', targetCurrency: 'USD', rate: 0.2, status: 'success' }
      ],
      freshness: { fetchedAtUtc: '2026-05-11T12:00:00Z', stale: false, maxAgeMinutes: 60 }
    });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    changeProductCurrency(fixture, 'BRL');
    http.expectOne('/api/conversion-rates').flush({
      targetCurrency: 'BRL',
      rates: [
        { sourceCurrency: 'USD', targetCurrency: 'BRL', rate: 5, status: 'success' }
      ],
      freshness: { fetchedAtUtc: '2026-05-11T12:00:00Z', stale: false, maxAgeMinutes: 60 }
    });
    fixture.detectChanges();

    http.expectNone('/api/products/search');
    expect(root.querySelector<HTMLInputElement>('input[name="currency"]:checked')?.dataset['currency']).toBe('BRL');
    const cards = Array.from(root.querySelectorAll('app-offer-card')).map(card => card.textContent ?? '');
    expect(cards[0]).toContain('Offer One');
    expect(cards[1]).toContain('Offer Two');
  });

  it('does not render operational metrics, confidence, source, extraction, or freshness', () => {
    setupStorage('en-US', 'USD');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    submitSearch(fixture, 'phone');
    http.expectOne('/api/products/search').flush({
      query: 'phone',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 1200,
      attemptedSourceCount: 900,
      offers: [{
        title: 'Phone',
        priceAmount: 1200,
        currency: 'USD',
        seller: 'Seller',
        url: 'https://example.com/p',
        sourceName: 'Src',
        extractionMethod: 'method',
        confidence: 0.95,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [],
      warnings: []
    });
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.results-summary')).toBeNull();
    expect(root.textContent).not.toContain('95%');
    expect(root.textContent).not.toContain('Src');
    expect(root.textContent).not.toContain('method');
    expect(root.textContent).not.toContain('Rate updated');
  });

  it('keeps external/backend content exactly as received', () => {
    setupStorage('es-ES', 'USD');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    submitSearch(fixture, 'monitor');
    http.expectOne('/api/products/search').flush({
      query: 'monitor',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 2,
      attemptedSourceCount: 2,
      offers: [{
        title: 'UNTOUCHED TITLE',
        priceAmount: 100,
        currency: 'USD',
        seller: 'UNTOUCHED SELLER',
        url: 'https://example.com/u',
        sourceName: 'UNTOUCHED SOURCE',
        extractionMethod: 'UNTOUCHED_METHOD',
        confidence: 0.6,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [{
        url: 'https://example.com/fail',
        sourceName: 'RAW BACKEND SOURCE',
        status: 'failed',
        reason: 'Candidate fetch timed out.',
        statusCode: null
      }],
      warnings: ['RAW WARNING']
    });
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('UNTOUCHED TITLE');
    expect(root.textContent).toContain('UNTOUCHED SELLER');
    expect(root.textContent).not.toContain('UNTOUCHED SOURCE');
    expect(root.textContent).not.toContain('UNTOUCHED_METHOD');
    expect(root.textContent).not.toContain('RAW WARNING');
    expect(root.textContent).not.toContain('RAW BACKEND SOURCE');
  });

  it('keeps offers and shows localized conversion-unavailable fallback when conversion fails', () => {
    setupStorage('pt-BR', 'USD');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    submitSearch(fixture, 'tablet');
    http.expectOne('/api/products/search').flush({
      query: 'tablet',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 1,
      attemptedSourceCount: 1,
      offers: [{
        title: 'Tablet Z',
        priceAmount: 400,
        currency: 'EUR',
        seller: 'Store B',
        url: 'https://example.com/tablet',
        sourceName: 'Example',
        extractionMethod: 'visible-text',
        confidence: 0.5,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [],
      warnings: []
    });
    http.expectOne('/api/conversion-rates').flush({ error: 'offline' }, { status: 503, statusText: 'Service Unavailable' });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Tablet Z');
    expect(root.textContent).not.toContain('Conversão indisponível');
  });

  it('shows only the first five offers with a count-free Show more offers control', () => {
    setupStorage('en-US', 'USD');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    submitSearch(fixture, 'phone');
    http.expectOne('/api/products/search').flush(searchResponse([offer(1), offer(2), offer(3), offer(4), offer(5), offer(6), offer(7)]));
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const cards = root.querySelectorAll('app-offer-card');
    expect(cards.length).toBe(5);
    expect(cards[0].textContent).toContain('Best overall');
    expect(cards[0].textContent).toContain('Highest-ranked based on reliability, price, and confidence.');
    expect(root.textContent).not.toContain('Offer 6');
    const showMore = root.querySelector<HTMLButtonElement>('button.show-more');
    expect(showMore?.textContent?.trim()).toBe('Show more offers');
    expect(showMore?.textContent).not.toMatch(/\d/);
  });

  it('reveals up to five more offers after each Show more offers selection', () => {
    setupStorage('en-US', 'USD');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    submitSearch(fixture, 'phone');
    http.expectOne('/api/products/search').flush(searchResponse(Array.from({ length: 12 }, (_, index) => offer(index + 1))));
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button.show-more')?.click();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('app-offer-card').length).toBe(10);
    expect(root.textContent).toContain('Offer 10');
    expect(root.textContent).not.toContain('Offer 11');
    expect(root.querySelector('button.show-more')).not.toBeNull();

    root.querySelector<HTMLButtonElement>('button.show-more')?.click();
    fixture.detectChanges();
    expect(root.querySelectorAll('app-offer-card').length).toBe(12);
    expect(root.textContent).toContain('Offer 12');
    expect(root.querySelector('button.show-more')).toBeNull();
  });

  it('resets expanded offers when a new search begins', () => {
    setupStorage('en-US', 'USD');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    submitSearch(fixture, 'phone');
    http.expectOne('/api/products/search').flush(searchResponse(Array.from({ length: 7 }, (_, index) => offer(index + 1))));
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button.show-more')?.click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-offer-card').length).toBe(7);

    submitSearch(fixture, 'tablet');
    http.expectOne('/api/products/search').flush(searchResponse([offer(5), offer(6), offer(7), offer(8), offer(9), offer(10), offer(11)], 'tablet'));
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('app-offer-card').length).toBe(5);
    expect(root.querySelector<HTMLButtonElement>('button.show-more')?.textContent?.trim()).toBe('Show more offers');
  });

  it('only shows original price when a currency conversion changes the displayed price', () => {
    setupStorage('en-US', 'USD');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    submitSearch(fixture, 'camera');
    http.expectOne('/api/products/search').flush(searchResponse([offer(1, 'USD'), offer(2, 'BRL')], 'camera'));
    http.expectOne('/api/conversion-rates').flush({
      targetCurrency: 'USD',
      rates: [{ sourceCurrency: 'BRL', targetCurrency: 'USD', rate: 0.2, status: 'success' }],
      freshness: { fetchedAtUtc: '2026-05-11T12:00:00Z', stale: false, maxAgeMinutes: 60 }
    });
    fixture.detectChanges();

    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('app-offer-card');
    expect(cards[0].textContent).not.toContain('Original:');
    expect(cards[1].textContent).toContain('Original: R$200.00');
  });
});
