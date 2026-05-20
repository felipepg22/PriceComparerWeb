import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

function getSearchForm(fixture: ComponentFixture<App>): HTMLFormElement {
  const queryInput = getQueryInput(fixture);
  return queryInput.closest('form') as HTMLFormElement;
}

function getControlByLabel<T extends HTMLElement>(fixture: ComponentFixture<App>, labelText: string): T {
  const compiled = fixture.nativeElement as HTMLElement;
  const labels = Array.from(compiled.querySelectorAll('label'));
  const label = labels.find(item => item.textContent?.trim() === labelText);
  const controlId = label?.getAttribute('for');
  const control = controlId ? compiled.querySelector(`#${controlId}`) : null;

  if (!control) {
    throw new Error(`Could not find form control labelled "${labelText}".`);
  }

  return control as T;
}

function getQueryInput(fixture: ComponentFixture<App>): HTMLInputElement {
  return getControlByLabel<HTMLInputElement>(fixture, 'Product');
}

function getCurrencySelect(fixture: ComponentFixture<App>): HTMLSelectElement {
  return getControlByLabel<HTMLSelectElement>(fixture, 'Currency');
}

function getSubmitButton(fixture: ComponentFixture<App>): HTMLButtonElement {
  return getSearchForm(fixture).querySelector('button[type="submit"]') as HTMLButtonElement;
}

function setSearchQuery(fixture: ComponentFixture<App>, value: string): void {
  const input = getQueryInput(fixture);
  input.value = value;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function setCurrency(fixture: ComponentFixture<App>, value: string): void {
  const select = getCurrencySelect(fixture);
  select.value = value;
  select.dispatchEvent(new Event('change'));
  fixture.detectChanges();
}

function submitSearch(fixture: ComponentFixture<App>): void {
  const form = getSearchForm(fixture);
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('renders the dashboard shell and search controls', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Price Comparer');
    expect(getQueryInput(fixture).placeholder).toBe('iPhone 15 128GB');
    expect(getCurrencySelect(fixture).value).toBe('');
    expect(getSubmitButton(fixture).textContent).toContain('Search offers');
  });

  it('marks the form as touched and shows validation when the query is blank', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    submitSearch(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Enter at least 2 characters.');
    httpTesting.expectNone('/api/products/search');
  });

  it('posts a trimmed query with a null currency when the select is empty', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, '  iphone 15  ');

    submitSearch(fixture);

    const request = httpTesting.expectOne('/api/products/search');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ query: 'iphone 15', currency: null });

    request.flush({
      query: 'iphone 15',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 0,
      attemptedSourceCount: 0,
      offers: [],
      attemptedSources: [],
      warnings: []
    });

    fixture.detectChanges();
  });

  it('posts the selected currency value', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, 'iphone 15');
    setCurrency(fixture, 'BRL');

    submitSearch(fixture);

    const request = httpTesting.expectOne('/api/products/search');
    expect(request.request.body).toEqual({ query: 'iphone 15', currency: 'BRL' });

    request.flush({
      query: 'iphone 15',
      currency: 'BRL',
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 0,
      attemptedSourceCount: 0,
      offers: [],
      attemptedSources: [],
      warnings: []
    });

    fixture.detectChanges();
  });

  it('renders metrics and offer details from a successful response', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, 'notebook');

    submitSearch(fixture);

    const request = httpTesting.expectOne('/api/products/search');
    request.flush({
      query: 'notebook',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 3,
      attemptedSourceCount: 4,
      offers: [{
        title: 'Notebook Pro 14',
        priceAmount: 3500,
        currency: 'BRL',
        seller: 'Store A',
        url: 'https://example.com/notebook',
        sourceName: 'Example Market',
        extractionMethod: 'structured-data',
        confidence: 0.95,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [{
        url: 'https://example.com/notebook',
        sourceName: 'Example Market',
        status: 'success',
        reason: null,
        statusCode: 200
      }],
      warnings: []
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const summary = compiled.querySelector('[aria-label="Search summary"]') as HTMLElement;
    const results = compiled.querySelector('[aria-label="Top ranked offers"]') as HTMLElement;
    const card = results.querySelector('app-offer-card') as HTMLElement;
    const link = card.querySelector('a') as HTMLAnchorElement;

    expect(summary.textContent).toContain('1');
    expect(summary.textContent).toContain('found offers');
    expect(summary.textContent).toContain('3');
    expect(summary.textContent).toContain('candidate pages');
    expect(summary.textContent).toContain('4');
    expect(summary.textContent).toContain('attempted sources');
    expect(card.textContent).toContain('Notebook Pro 14');
    expect(card.textContent).toContain('Store A');
    expect(card.textContent).toContain('Example Market');
    expect(card.textContent).toContain('structured-data');
    expect(card.textContent).toContain('95%');
    expect(card.textContent).toContain('High');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });

  it('keeps long offer content queryable inside the responsive card structure', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, 'ultrawide monitor');

    submitSearch(fixture);

    const longTitle = 'Professional Ultrawide Monitor With Extra Long Product Name 49 Inch USB-C Docking KVM HDR';
    const longSeller = 'Very Long Seller Name Marketplace Authorized Distribution Partner';
    const request = httpTesting.expectOne('/api/products/search');
    request.flush({
      query: 'ultrawide monitor',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 8,
      attemptedSourceCount: 6,
      offers: [{
        title: longTitle,
        priceAmount: 123456.78,
        currency: 'USD',
        seller: longSeller,
        url: 'https://example.com/very-long-monitor-offer',
        sourceName: 'Example Market With Long Source Name',
        extractionMethod: 'structured-data-with-long-label',
        confidence: 0.83,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [],
      warnings: []
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('app-offer-card');
    const link = compiled.querySelector('app-offer-card a') as HTMLAnchorElement;
    expect(card?.textContent).toContain(longTitle);
    expect(card?.textContent).toContain(longSeller);
    expect(card?.textContent).toContain('$123,456.78');
    expect(card?.textContent).toContain('83% · High');
    expect(link.textContent).toContain('Open offer');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });

  it('shows the loading state while the request is in flight', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, 'monitor');

    submitSearch(fixture);

    const request = httpTesting.expectOne('/api/products/search');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Searching trusted sources...');
    expect(getSubmitButton(fixture).disabled).toBe(true);

    request.flush({
      query: 'monitor',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 0,
      attemptedSourceCount: 0,
      offers: [],
      attemptedSources: [],
      warnings: []
    });
  });

  it('falls back to the source name when seller is missing', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, 'tablet');

    submitSearch(fixture);

    const request = httpTesting.expectOne('/api/products/search');
    request.flush({
      query: 'tablet',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 1,
      attemptedSourceCount: 1,
      offers: [{
        title: 'Tablet 11',
        priceAmount: 2200,
        currency: 'USD',
        seller: '   ',
        url: 'https://example.com/tablet',
        sourceName: 'Fallback Source',
        extractionMethod: 'visible-text',
        confidence: 0.6,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [{
        url: 'https://example.com/tablet',
        sourceName: 'Fallback Source',
        status: 'success',
        reason: null,
        statusCode: 200
      }],
      warnings: []
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Fallback Source');
    expect(compiled.textContent).toContain('Medium');
    expect(compiled.textContent).toContain('60%');
  });

  it('renders confidence threshold labels through prepared dashboard offers', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, 'headphones');

    submitSearch(fixture);

    const request = httpTesting.expectOne('/api/products/search');
    request.flush({
      query: 'headphones',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 3,
      attemptedSourceCount: 3,
      offers: [{
        title: 'High Confidence Headphones',
        priceAmount: 100,
        currency: 'USD',
        seller: 'Store High',
        url: 'https://example.com/high',
        sourceName: 'Source High',
        extractionMethod: 'structured-data',
        confidence: 0.8,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }, {
        title: 'Medium Confidence Headphones',
        priceAmount: 90,
        currency: 'USD',
        seller: 'Store Medium',
        url: 'https://example.com/medium',
        sourceName: 'Source Medium',
        extractionMethod: 'visible-text',
        confidence: 0.5,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }, {
        title: 'Low Confidence Headphones',
        priceAmount: 80,
        currency: 'USD',
        seller: 'Store Low',
        url: 'https://example.com/low',
        sourceName: 'Source Low',
        extractionMethod: 'visible-text',
        confidence: 0.49,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [],
      warnings: []
    });

    fixture.detectChanges();

    const cards = Array.from(
      fixture.nativeElement.querySelectorAll('app-offer-card')
    ) as HTMLElement[];
    expect(cards).toHaveLength(3);
    expect(cards[0].textContent).toContain('80% · High');
    expect(cards[1].textContent).toContain('50% · Medium');
    expect(cards[2].textContent).toContain('49% · Low');
  });

  it('preserves API-ranked offer order without client sorting', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, 'keyboard');

    submitSearch(fixture);

    const request = httpTesting.expectOne('/api/products/search');
    request.flush({
      query: 'keyboard',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 6,
      attemptedSourceCount: 6,
      offers: [{
        title: 'Second Cheapest but Most Reliable',
        priceAmount: 300,
        currency: 'USD',
        seller: 'Store Reliable',
        url: 'https://example.com/offer-a',
        sourceName: 'Source A',
        extractionMethod: 'structured-data',
        confidence: 0.95,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }, {
        title: 'Cheapest but Less Reliable',
        priceAmount: 200,
        currency: 'USD',
        seller: 'Store Cheaper',
        url: 'https://example.com/offer-b',
        sourceName: 'Source B',
        extractionMethod: 'visible-text',
        confidence: 0.55,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }, {
        title: 'Most Expensive',
        priceAmount: 500,
        currency: 'USD',
        seller: 'Store Expensive',
        url: 'https://example.com/offer-c',
        sourceName: 'Source C',
        extractionMethod: 'metadata',
        confidence: 0.85,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [],
      warnings: []
    });

    fixture.detectChanges();

    const cards = Array.from(
      fixture.nativeElement.querySelectorAll('app-offer-card')
    ) as HTMLElement[];

    expect(cards).toHaveLength(3);
    expect(cards[0].textContent).toContain('Second Cheapest but Most Reliable');
    expect(cards[1].textContent).toContain('Cheapest but Less Reliable');
    expect(cards[2].textContent).toContain('Most Expensive');
  });

  it('renders fewer than ten ranked offers when API returns less', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, 'mouse');

    submitSearch(fixture);

    const request = httpTesting.expectOne('/api/products/search');
    request.flush({
      query: 'mouse',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 5,
      attemptedSourceCount: 5,
      offers: [{
        title: 'Mouse One',
        priceAmount: 50,
        currency: 'USD',
        seller: 'Store One',
        url: 'https://example.com/mouse-1',
        sourceName: 'Source One',
        extractionMethod: 'structured-data',
        confidence: 0.9,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }, {
        title: 'Mouse Two',
        priceAmount: 60,
        currency: 'USD',
        seller: 'Store Two',
        url: 'https://example.com/mouse-2',
        sourceName: 'Source Two',
        extractionMethod: 'metadata',
        confidence: 0.8,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }, {
        title: 'Mouse Three',
        priceAmount: 65,
        currency: 'USD',
        seller: 'Store Three',
        url: 'https://example.com/mouse-3',
        sourceName: 'Source Three',
        extractionMethod: 'visible-text',
        confidence: 0.6,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }, {
        title: 'Mouse Four',
        priceAmount: 70,
        currency: 'USD',
        seller: 'Store Four',
        url: 'https://example.com/mouse-4',
        sourceName: 'Source Four',
        extractionMethod: 'visible-text',
        confidence: 0.58,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [],
      warnings: []
    });

    fixture.detectChanges();

    const cards = Array.from(
      fixture.nativeElement.querySelectorAll('app-offer-card')
    ) as HTMLElement[];

    expect(cards).toHaveLength(4);
  });

  it('keeps successful offers visible while hiding partial-failure details', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, 'notebook');

    submitSearch(fixture);

    const request = httpTesting.expectOne('/api/products/search');
    request.flush({
      query: 'notebook',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 2,
      attemptedSourceCount: 2,
      offers: [{
        title: 'Notebook',
        priceAmount: 3500,
        currency: 'BRL',
        seller: 'Store A',
        url: 'https://example.com/notebook',
        sourceName: 'Example',
        extractionMethod: 'visible-text',
        confidence: 0.6,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [{
        url: 'https://example.com/notebook',
        sourceName: 'Example',
        status: 'success',
        reason: null,
        statusCode: 200
      }, {
        url: 'https://example.org/notebook',
        sourceName: 'Example 2',
        status: 'failed',
        reason: 'Candidate fetch timed out.',
        statusCode: null
      }],
      warnings: ['Example 2: Candidate fetch timed out.']
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Notebook');
    expect(compiled.textContent).toContain('found offers');
    expect(compiled.textContent).not.toContain('Example 2');
    expect(compiled.textContent).not.toContain('Sources not compared');
    expect(compiled.textContent).not.toContain('Candidate fetch timed out.');
  });

  it('shows the no-comparable-offers state for an empty successful response', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, 'camera');

    submitSearch(fixture);

    const request = httpTesting.expectOne('/api/products/search');
    request.flush({
      query: 'camera',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 0,
      attemptedSourceCount: 3,
      offers: [],
      attemptedSources: [],
      warnings: []
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No comparable offers found.');
    expect(compiled.textContent).toContain('Try another product name or adjust the currency filter.');
    expect(compiled.textContent).not.toContain('Search failed.');
  });

  it('shows API failure messaging without using the empty-result state', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setSearchQuery(fixture, 'camera');

    submitSearch(fixture);

    const request = httpTesting.expectOne('/api/products/search');
    request.flush(
      { error: 'Backend unavailable.' },
      { status: 500, statusText: 'Server Error' }
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Search failed.');
    expect(compiled.textContent).toContain('Backend unavailable.');
    expect(compiled.textContent).not.toContain('No comparable offers found.');
  });
});
