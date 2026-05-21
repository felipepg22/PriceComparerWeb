## ADDED Requirements

### Requirement: Product query search endpoint
The system SHALL provide a product search endpoint that accepts a free-text product query and returns search-scoped metadata for price comparison.

#### Scenario: Valid product query is accepted
- **WHEN** a client submits a non-empty product query to the product search endpoint
- **THEN** the system SHALL validate the query and start discovery for candidate product pages

#### Scenario: Blank product query is rejected
- **WHEN** a client submits a blank or whitespace-only product query
- **THEN** the system SHALL reject the request with a validation error

### Requirement: Manual candidate discovery
The system SHALL discover candidate product pages from manually configured open web sources for the first implementation.

#### Scenario: Configured sources return candidates
- **WHEN** product discovery runs with configured sources
- **THEN** the system SHALL return candidate URLs and source metadata for pages matching the product query

#### Scenario: No discovery source is configured
- **WHEN** product discovery runs without any configured source
- **THEN** the system SHALL return a clear configuration error instead of attempting unsupported discovery

### Requirement: Candidate limits
The system SHALL limit each product search to at most five candidate pages.

#### Scenario: More than five candidates are available
- **WHEN** discovery finds more than five candidate pages
- **THEN** the system SHALL select no more than five candidates for scraping

#### Scenario: Fewer than five candidates are available
- **WHEN** discovery finds fewer than five candidate pages
- **THEN** the system SHALL scrape only the discovered candidates

### Requirement: Search metadata
The system SHALL include metadata describing the product search execution.

#### Scenario: Search completes with candidates
- **WHEN** a product search completes
- **THEN** the response SHALL include the original query, fetched timestamp, candidate count, and attempted source count
