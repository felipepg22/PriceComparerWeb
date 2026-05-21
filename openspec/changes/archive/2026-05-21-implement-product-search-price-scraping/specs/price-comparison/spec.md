## ADDED Requirements

### Requirement: Comparable offer response
The system SHALL return normalized comparable offers for product searches.

#### Scenario: Offers are extracted from candidates
- **WHEN** one or more candidate pages produce supported extracted offers
- **THEN** the response SHALL include normalized offers with product title, price amount, currency, seller or source, URL, and fetched timestamp

#### Scenario: Some candidates fail
- **WHEN** one or more candidate pages fail during scraping or extraction
- **THEN** the response SHALL still include successful offers and SHALL include attempted-source failure metadata

### Requirement: Deterministic offer ordering
The system SHALL return offers in deterministic comparison order.

#### Scenario: Offers share a supported currency
- **WHEN** multiple offers are returned for the same supported currency
- **THEN** the system SHALL order those offers by price amount ascending

#### Scenario: Currency filter is requested
- **WHEN** a client requests BRL, USD, or EUR filtering
- **THEN** the system SHALL prioritize offers matching the requested currency and exclude unsupported currencies

### Requirement: Product comparison UI
The client SHALL provide a product search interface and display comparable offer results.

#### Scenario: User submits product query
- **WHEN** the user enters a product query and submits the search form
- **THEN** the client SHALL call the product search endpoint and show loading state until the request completes

#### Scenario: Search returns offers
- **WHEN** the product search endpoint returns offers
- **THEN** the client SHALL display price, currency, seller or source, and product URL for each offer

#### Scenario: Search returns partial failures
- **WHEN** the product search response includes attempted-source failures
- **THEN** the client SHALL expose that some sources could not be compared without hiding successful offers

#### Scenario: Search fails validation
- **WHEN** the product search endpoint returns a validation error
- **THEN** the client SHALL display the validation message near the search form
