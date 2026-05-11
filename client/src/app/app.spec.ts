import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { App } from './app';

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

  it('should render product search form', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Price Comparer');
    expect(compiled.querySelector('input[type="search"]')).toBeTruthy();
    expect(compiled.querySelector('select')).toBeTruthy();
  });

  it('should show validation for blank query', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Enter at least 2 characters.');
  });

  it('should call product search endpoint and render offers', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'iphone 15';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    const request = httpTesting.expectOne('http://localhost:5235/api/products/search');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ query: 'iphone 15', currency: null });

    request.flush({
      query: 'iphone 15',
      currency: null,
      fetchedAtUtc: '2026-05-11T12:00:00Z',
      candidateCount: 1,
      attemptedSourceCount: 1,
      offers: [{
        title: 'iPhone 15 128GB',
        priceAmount: 4999.9,
        currency: 'BRL',
        seller: 'Example Store',
        url: 'https://example.com/iphone',
        sourceName: 'Example',
        extractionMethod: 'structured-data',
        confidence: 0.95,
        fetchedAtUtc: '2026-05-11T12:00:00Z'
      }],
      attemptedSources: [{
        url: 'https://example.com/iphone',
        sourceName: 'Example',
        status: 'success',
        reason: null,
        statusCode: 200
      }],
      warnings: []
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('iPhone 15 128GB');
    expect(compiled.textContent).toContain('Example Store');
    expect(compiled.textContent).toContain('found offers');
  });

  it('should show partial failures without hiding offers', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'notebook';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    const request = httpTesting.expectOne('http://localhost:5235/api/products/search');
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
    expect(compiled.textContent).toContain('Some sources could not be compared');
    expect(compiled.textContent).toContain('Candidate fetch timed out.');
  });
});
