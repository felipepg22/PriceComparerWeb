import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

function setupStorage(locale?: string, currency?: string): void {
  localStorage.clear();
  if (locale) {
    localStorage.setItem('price-comparer.locale', locale);
  }
  if (currency) {
    localStorage.setItem('price-comparer.displayCurrency', currency);
  }
}

function submitSearch(fixture: ReturnType<typeof TestBed.createComponent<App>>, query: string, sourceCurrency = ''): void {
  const root = fixture.nativeElement as HTMLElement;
  const queryInput = root.querySelector('#query') as HTMLInputElement;
  const currencySelect = root.querySelector('#currency') as HTMLSelectElement;
  const form = root.querySelector('form') as HTMLFormElement;
  queryInput.value = query;
  queryInput.dispatchEvent(new Event('input'));
  currencySelect.value = sourceCurrency;
  currencySelect.dispatchEvent(new Event('change'));
  fixture.detectChanges();
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
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

    expect(root.textContent).toContain('Painel de comparação de produtos');
  });

  it('falls back to en-US for invalid persisted locale and maps browser base language', () => {
    setupStorage('fr-FR', 'USD');
    Object.defineProperty(navigator, 'languages', { value: ['es-MX'], configurable: true });
    Object.defineProperty(navigator, 'language', { value: 'es-MX', configurable: true });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Panel de comparación de productos');
  });

  it('uses exact supported browser locale', () => {
    setupStorage(undefined, 'USD');
    Object.defineProperty(navigator, 'languages', { value: ['pt-BR'], configurable: true });
    Object.defineProperty(navigator, 'language', { value: 'pt-BR', configurable: true });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Painel de comparação de produtos');
  });

  it('falls back to en-US when browser locale is unsupported', () => {
    setupStorage(undefined, 'USD');
    Object.defineProperty(navigator, 'languages', { value: ['fr-FR'], configurable: true });
    Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Product comparison dashboard');
  });

  it('keeps search payload semantics unchanged when language or display currency changes', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    (root.querySelector('#locale') as HTMLSelectElement).value = 'pt-BR';
    (root.querySelector('#locale') as HTMLSelectElement).dispatchEvent(new Event('change'));
    (root.querySelector('#displayCurrency') as HTMLSelectElement).value = 'BRL';
    (root.querySelector('#displayCurrency') as HTMLSelectElement).dispatchEvent(new Event('change'));

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
    expect(root.textContent).toContain('Buscar ofertas');

    (root.querySelector('#locale') as HTMLSelectElement).value = 'es-ES';
    (root.querySelector('#locale') as HTMLSelectElement).dispatchEvent(new Event('change'));
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Buscar ofertas');
    expect(root.textContent).toContain('Panel de comparación de productos');
  });

  it('shows converted price with original visibility and freshness', () => {
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
    expect(root.textContent).toContain('Rate updated');
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
    const locale = root.querySelector('#locale') as HTMLSelectElement;
    locale.value = 'pt-BR';
    locale.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    http.expectNone('/api/products/search');
    expect((root.querySelector('#query') as HTMLInputElement).value).toBe('headphones');
    expect(root.textContent).toContain('Headphone A');
    expect(root.textContent).toContain('Painel de comparação de produtos');
  });

  it('display currency change preserves source filter and offer order without product search', () => {
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
    const displayCurrency = root.querySelector('#displayCurrency') as HTMLSelectElement;
    displayCurrency.value = 'EUR';
    displayCurrency.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    http.expectOne('/api/conversion-rates').flush({
      targetCurrency: 'EUR',
      rates: [
        { sourceCurrency: 'USD', targetCurrency: 'EUR', rate: 0.9, status: 'success' },
        { sourceCurrency: 'BRL', targetCurrency: 'EUR', rate: 0.18, status: 'success' }
      ],
      freshness: { fetchedAtUtc: '2026-05-11T12:00:00Z', stale: false, maxAgeMinutes: 60 }
    });
    fixture.detectChanges();

    http.expectNone('/api/products/search');
    expect((root.querySelector('#currency') as HTMLSelectElement).value).toBe('EUR');
    const cards = Array.from(root.querySelectorAll('app-offer-card')).map(card => card.textContent ?? '');
    expect(cards[0]).toContain('Offer One');
    expect(cards[1]).toContain('Offer Two');
  });

  it('reformats counts and confidence percentages when locale changes', () => {
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
    let root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('1,200');
    expect(root.textContent).toContain('95%');

    const locale = root.querySelector('#locale') as HTMLSelectElement;
    locale.value = 'pt-BR';
    locale.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('1.200');
    expect(root.textContent).toContain('95%');
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
    expect(root.textContent).toContain('UNTOUCHED SOURCE');
    expect(root.textContent).toContain('UNTOUCHED_METHOD');
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
    expect(root.textContent).toContain('Conversão indisponível');
  });
});
