# TechSpec: Adapt Frontend Design

## Executive Summary

The frontend will be redesigned as a Wise-inspired comparison dashboard by splitting the current single Angular root component into small standalone presentational components. The root `App` component will continue to own API state, reactive form state, request submission, and derived display helpers. Child components will render the search surface, metrics, offer cards, and state messages from inputs.

The primary trade-off is accepting a few more frontend files in exchange for clearer dashboard boundaries and easier focused tests. The implementation will not change backend behavior, endpoint paths, request payloads, response fields, or result ordering.

## System Architecture

### Component Overview

- `App`: owns `HttpClient`, search form, signals, request lifecycle, response state, error state, and display helper methods.
- `SearchPanelComponent`: presentational search/dashboard entry surface. Receives form/loading/error inputs and emits submit through the parent-owned form binding.
- `MetricsSummaryComponent`: renders found offers, candidate pages, and attempted sources.
- `OfferCardComponent`: renders price, title, seller/source, extraction method, confidence percentage, confidence label, and external link.
- `StateMessageComponent`: renders loading, empty, validation, and API error states using the dashboard visual system.

Data flow remains one-way: `App` posts to the backend, stores the response, derives display values, and passes data into presentational components. Child components do not call the backend or mutate shared state.

## Implementation Design

### Core Interfaces

The implementation uses TypeScript interfaces because the frontend is Angular. No Go runtime exists in this repository.

```ts
interface DashboardOffer {
  title: string;
  formattedPrice: string;
  sellerLabel: string;
  sourceName: string;
  extractionMethod: string;
  confidencePercent: string;
  confidenceLabel: 'High' | 'Medium' | 'Low';
  url: string;
}
```

`App` will derive `DashboardOffer` values from existing `ProductOffer` responses. Confidence thresholds:

- `High`: `confidence >= 0.8`
- `Medium`: `confidence >= 0.5 && confidence < 0.8`
- `Low`: `confidence < 0.5`

### Data Models

Existing API response models stay unchanged:

- `ProductSearchResponse`
- `ProductOffer`
- `AttemptedSource`

No storage, database schema, or backend DTO changes are required. The frontend may add local view-model interfaces inside `app.ts` or a colocated model file only if the component inputs become noisy; the default plan keeps derived helpers in `App`.

### API Endpoints

No API changes.

- `POST http://localhost:5235/api/products/search`
- Request: `{ query: string, currency: 'BRL' | 'USD' | 'EUR' | null }`
- Success response: existing `ProductSearchResponse`
- Error response: existing `{ error: string }`

## Integration Points

The frontend continues to integrate with the local ASP.NET Core API. Product search still depends on backend search providers and local SearXNG configuration, but the redesign does not add new integrations, authentication, retries, or source configuration.

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|----------------------|-----------------|
| `client/src/app/app.ts` | modified | Keeps state and API workflow; adds display helpers and component imports. Medium risk because it owns the workflow. | Preserve request body, endpoint, validation, and error behavior. |
| `client/src/app/app.html` | modified | Replaced by dashboard composition. Medium risk for conditional states. | Cover result, empty, loading, API error, and validation states. |
| `client/src/app/app.css` | modified | Applies Wise-inspired dashboard layout and responsive styling. Medium visual risk. | Use `DESIGN.md` tokens and verify mobile layout. |
| `client/src/styles.css` | modified | May update font import/global base styles. Low risk. | Prefer open-source font fallback instead of proprietary Wise Sans. |
| `client/src/app/*` presentational components | new | Adds small standalone UI components. Low behavioral risk. | Keep components input-driven and side-effect free. |
| `client/src/app/app.spec.ts` | modified | Existing text and partial-failure assertions will change. Medium risk. | Update tests for redesigned copy and hidden failure details. |

## Testing Approach

### Unit Tests

Update Angular/Vitest tests to cover:

- Search form renders inside the redesigned dashboard.
- Blank query still shows validation.
- Submit still posts to `http://localhost:5235/api/products/search`.
- Request body still trims query and maps empty currency to `null`.
- Successful response renders metrics and offer cards.
- Confidence renders as percentage plus High/Medium/Low label.
- Non-success attempted sources do not render a detailed failed-source list.
- Empty response distinguishes no comparable offers from API failure.
- API error uses the redesigned error state.

Presentational components can be tested through `App` unless a component gains non-trivial conditional rendering.

### Integration Tests

No backend integration tests are required for this frontend-only change. Manual integration should run the API and Angular app together and perform one product search against the configured local services.

## Development Sequencing

### Build Order

1. Define component boundaries and create standalone presentational components - no dependencies.
2. Move search, metrics, offer, and state markup into child components - depends on step 1.
3. Add root display helpers for price, seller/source fallback, confidence percentage, and confidence label - depends on step 2.
4. Apply `client/DESIGN.md` tokens and responsive dashboard CSS - depends on steps 1 and 2.
5. Remove detailed partial-failure UI from the main page - depends on step 2.
6. Update unit tests for new copy, component structure, confidence display, and hidden failure details - depends on steps 2 through 5.
7. Run frontend build and tests - depends on step 6.

### Technical Dependencies

- Angular 21 standalone component support already exists.
- Existing backend endpoint must remain available for manual verification.
- No new npm package is required.

## Monitoring and Observability

No production monitoring changes are required. The frontend should keep existing API error display behavior. During manual verification, inspect browser console errors and failed network requests.

## Technical Considerations

### Key Decisions

- Decision: split the dashboard into presentational Angular components.
- Rationale: the redesign has clear UI regions and would make the root template dense if kept as one file.
- Trade-off: more files and input wiring.
- Alternatives rejected: single-component implementation and service/facade-first refactor.

- Decision: keep API state and derived helpers in `App`.
- Rationale: the current app is small and the workflow is local to one page.
- Trade-off: root component remains the orchestration point.
- Alternatives rejected: per-component formatting and a dedicated mapper layer.

- Decision: hide partial-failure details from the main UI.
- Rationale: the PRD prioritizes a calmer shopper experience and removes failed-source diagnostics from the main surface.
- Trade-off: less diagnostic transparency.
- Alternatives rejected: high-level partial-failure notice and collapsible details.

- Decision: preserve API offer order.
- Rationale: the frontend should not imply a ranking algorithm that the backend does not provide.
- Trade-off: users may need to scan the list rather than seeing a sorted best price first.
- Alternatives rejected: lowest-price sorting and confidence-based highlighting.

### Known Risks

- Visual density could increase on mobile. Mitigation: use a single-column layout below the existing mobile breakpoint and keep metrics compact.
- Component splitting could over-abstract a small app. Mitigation: keep child components presentational and avoid shared services unless implementation proves necessary.
- Hidden failure details could reduce transparency. Mitigation: keep attempted-source count visible and retain clear API error states.

## Architecture Decision Records

- [ADR-001: Prioritize Comparison Dashboard Experience](adrs/adr-001.md) — The frontend redesign centers result analysis and fast offer scanning while adopting the `DESIGN.md` visual language.
- [ADR-002: Split Dashboard Into Presentational Components](adrs/adr-002.md) — The Angular redesign uses small presentational components while keeping API state and derived display logic in `App`.
