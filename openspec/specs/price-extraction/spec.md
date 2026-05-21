# price-extraction Specification

## Purpose
TBD - created by archiving change implement-product-search-price-scraping. Update Purpose after archive.
## Requirements
### Requirement: Offer price extraction
The system SHALL extract offer data from candidate product pages when supported page data is available.

#### Scenario: Structured offer data is present
- **WHEN** a candidate page contains structured product offer data
- **THEN** the system SHALL extract product title, price amount, currency, seller or source, and product URL

#### Scenario: No extractable offer data is present
- **WHEN** a candidate page does not contain extractable offer data
- **THEN** the system SHALL record the candidate as attempted without returning a successful offer for that page

### Requirement: Supported currencies
The system SHALL support only BRL, USD, and EUR currencies for extracted offers.

#### Scenario: Supported currency is extracted
- **WHEN** an extracted offer uses BRL, USD, or EUR
- **THEN** the system SHALL include the offer with its currency code

#### Scenario: Unsupported currency is extracted
- **WHEN** an extracted offer uses a currency other than BRL, USD, or EUR
- **THEN** the system SHALL exclude the offer from comparable results and record the reason

#### Scenario: Currency cannot be determined
- **WHEN** an offer price is found but currency cannot be determined
- **THEN** the system SHALL exclude the offer from comparable results and record the reason

### Requirement: Extraction confidence and method
The system SHALL include extraction metadata for each successful offer.

#### Scenario: Offer is extracted
- **WHEN** the system extracts an offer from a candidate page
- **THEN** the offer SHALL include extraction method and confidence metadata when available

### Requirement: Bounded page fetching
The system SHALL enforce bounded fetching while scraping candidate pages.

#### Scenario: Candidate page exceeds fetch limits
- **WHEN** a candidate page exceeds timeout or response-size limits
- **THEN** the system SHALL stop processing that page and record a failure for that candidate

#### Scenario: Request is cancelled
- **WHEN** the client cancels the product search request
- **THEN** the system SHALL stop outstanding candidate fetches where cancellation is supported

