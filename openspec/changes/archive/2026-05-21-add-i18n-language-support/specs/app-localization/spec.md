## ADDED Requirements

### Requirement: Supported Application Locales
The system SHALL support `en-US`, `pt-BR`, and `es-ES` as application locales. The system MUST initialize the active locale from a valid persisted locale first, otherwise from browser language detection, otherwise from `en-US`.

#### Scenario: Valid persisted locale is restored
- **WHEN** the app starts and local storage contains a supported persisted locale
- **THEN** the app uses that persisted locale as the active locale

#### Scenario: Browser exact locale is detected
- **WHEN** the app starts without a valid persisted locale and the browser reports `pt-BR` or `es-ES`
- **THEN** the app uses the matching supported locale

#### Scenario: Browser base language is mapped
- **WHEN** the app starts without a valid persisted locale and the browser reports an unsupported regional variant with base language `en`, `pt`, or `es`
- **THEN** the app maps the base language to `en-US`, `pt-BR`, or `es-ES`

#### Scenario: Unsupported locale falls back
- **WHEN** the app starts without a valid persisted locale and browser detection is unavailable, empty, malformed, or unsupported
- **THEN** the app uses `en-US` as the active locale

### Requirement: Runtime Language Selection
The system SHALL provide a language selection control for `en-US`, `pt-BR`, and `es-ES`. Changing the active language MUST update localized client-owned UI text immediately, persist the selected locale, and preserve the active search form, current results, loading state, and API error state.

#### Scenario: User switches language with active results
- **WHEN** search results are displayed and the user selects a different supported language
- **THEN** localized UI labels update to the selected language
- **AND** the existing results remain visible without submitting a new product search

#### Scenario: User switches language during loading
- **WHEN** a product search is in progress and the user selects a different supported language
- **THEN** the loading UI updates to the selected language
- **AND** the in-flight product search is not canceled, retried, or replaced by the language change

#### Scenario: Selected language persists
- **WHEN** the user selects a supported language and later reloads the app
- **THEN** the app restores that selected language before applying browser language detection

### Requirement: Localized Client-Owned Copy
The system SHALL render client-owned UI copy from localized resources for every supported locale, including search controls, button states, validation feedback, empty states, loading states, error wrappers, result summaries, metrics, offer cards, confidence labels, conversion labels, and offer actions. The system MUST NOT translate product titles, seller names, source names, extraction method identifiers, backend diagnostics, or external-source content.

#### Scenario: Validation and state messages are localized
- **WHEN** the user triggers validation, loading, empty, or API error UI in any supported locale
- **THEN** all client-owned labels and explanatory text for those states are shown in the active locale

#### Scenario: External product content remains unchanged
- **WHEN** a product result includes title, seller, source, extraction method, warning, or backend diagnostic text
- **THEN** that external or backend-provided text is displayed as received

### Requirement: Locale-Aware Formatting
The system SHALL format original prices, converted prices, counts, and confidence percentages according to the active locale. The system MUST derive formatted display values from the current product result and active preferences at render time so locale changes do not require refetching product results.

#### Scenario: Prices and metrics reformat after locale change
- **WHEN** product results are visible and the user changes from one supported locale to another
- **THEN** displayed prices, counts, and confidence percentages use the new locale's formatting rules
- **AND** the product result data and offer ordering remain unchanged

#### Scenario: Formatted values use selected locale and ISO currency
- **WHEN** an offer price or converted price is rendered
- **THEN** the value is formatted with the active locale and the relevant ISO currency code

### Requirement: Display Currency Preference
The system SHALL support `BRL`, `USD`, and `EUR` as display currencies for converted offer prices. The display currency preference MUST be separate from the product search source-currency filter, MUST be persisted with application preferences, and MUST NOT alter source-currency filtering semantics.

#### Scenario: Display currency changes independently
- **WHEN** the user changes the display currency while a source-currency filter is selected
- **THEN** the selected source-currency filter remains unchanged
- **AND** no product search request is submitted because of the display-currency change

#### Scenario: Display currency persists
- **WHEN** the user selects a supported display currency and later reloads the app
- **THEN** the app restores that display currency preference

### Requirement: Conversion Rate Retrieval
The system SHALL provide a backend conversion-rate capability for supported currencies. The conversion-rate response MUST include enough rate and freshness metadata for the client to convert displayed offer prices and disclose rate freshness, and conversion-rate failures MUST be independent from product-search success.

#### Scenario: Client requests rates for current result currencies
- **WHEN** active results contain offers whose original currencies differ from the selected display currency
- **THEN** the client can request conversion rates for those original currencies to the selected display currency
- **AND** the response includes rate data and freshness metadata for available supported conversions

#### Scenario: Conversion-rate lookup fails
- **WHEN** conversion-rate lookup is unavailable, timed out, canceled, or unsupported
- **THEN** the product search result remains successful if product search itself succeeded
- **AND** the client can show original prices with localized conversion-unavailable messaging

### Requirement: Converted Price Display
The system SHALL display a converted offer price in the selected display currency when a supported conversion rate is available. The system MUST preserve and display the original extracted price and original currency alongside or near the converted value, and MUST NOT mutate the original product-search response values.

#### Scenario: Converted price is available
- **WHEN** an offer has an original price in a supported source currency and a rate is available for the selected display currency
- **THEN** the UI shows the converted price using the selected display currency
- **AND** the UI also keeps the original extracted price and currency visible
- **AND** the UI shows localized conversion context or freshness information

#### Scenario: Original currency matches display currency
- **WHEN** an offer's original currency matches the selected display currency
- **THEN** the UI may show the original price as the display price
- **AND** the UI does not imply that an exchange-rate conversion was applied

### Requirement: Conversion Fallback Display
The system SHALL keep offers visible and ranked according to the product-search response when conversion is unavailable. The system MUST show original prices and localized conversion-unavailable messaging instead of discarding offers, hiding results, or treating conversion failure as a product-search failure.

#### Scenario: Conversion unavailable with visible offers
- **WHEN** active product results are available but conversion rates cannot be obtained
- **THEN** all offers from the product-search response remain visible in their original ranking
- **AND** original prices are shown with localized conversion-unavailable context

### Requirement: Product Search Behavior Preservation
The system SHALL keep product discovery, product-search request semantics, SearXNG querying, scraping, extraction, candidate ranking, cancellation, timeout handling, unsupported-source-currency validation, and partial-failure handling unchanged by localization and display-currency preferences. The system MUST NOT localize product search queries or add locale-sensitive behavior to product discovery for this change.

#### Scenario: Product search request body is unchanged
- **WHEN** the user submits a product search after selecting any supported language or display currency
- **THEN** the product-search request body uses the same trimmed query and source-currency filter semantics as before this change
- **AND** it does not include the display currency as a source-currency filter replacement

#### Scenario: Preference changes do not reorder offers
- **WHEN** the user changes language or display currency with active results
- **THEN** offer ordering remains the ordering returned by the product-search API

#### Scenario: Search diagnostics remain backend-provided
- **WHEN** product search returns warnings, partial-failure details, unsupported source currency messages, or server diagnostics
- **THEN** those backend-provided values remain unchanged by localization
