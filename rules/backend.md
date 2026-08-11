# Backend rules

## Follow the API application shape — Gate

- **Trigger:** Any change under `server/`.
- **Requirement:** Target .NET 10 with nullable reference types. Use 4-space indentation, PascalCase types and methods, and camelCase locals. Keep request and response records in `server/Models/`, configuration types in `server/Options/`, and focused domain implementations in `server/Services/`.
- **Reason:** Stable ownership makes server behavior easy to locate and review.
- **Verification:** Changed types live with their responsibility and preserve nullable correctness.

## Coordinate client and server contracts — Gate

- **Trigger:** Changing a request, response, status, or cross-tier semantic.
- **Requirement:** Update backend models, frontend types, callers, behavior tests, and affected domain or design documentation together. A breaking change requires explicit authorization from the user or originating artifact.
- **Reason:** Independently edited contracts compile in one tier while failing at runtime in the other.
- **Verification:** Both tiers agree on field names, optionality, values, errors, and behavior, and their focused checks pass.

## Make external failure semantics explicit — Gate

- **Trigger:** Changing HTTP, SMTP, scraping, search-provider, or other external integration behavior.
- **Requirement:** Propagate caller cancellation, configure finite timeouts, distinguish expected external failures from programmer errors, and preserve documented partial-success behavior. Do not add broad catch-all handling that hides defects.
- **Reason:** External dependencies fail routinely and their outcomes are part of the module interface.
- **Verification:** Relevant tests cover timeout, cancellation, malformed responses, and partial failure where applicable.

## Preserve Product Search prerequisites — Gate

- **Trigger:** Running or changing Product Search discovery.
- **Requirement:** Use the configured SearXNG endpoint; local defaults require JSON output at `http://localhost:8080`. Keep this service requirement visible in run and verification instructions without committing private deployment endpoints.
- **Reason:** Product Search cannot be evaluated reliably without its discovery adapter.
- **Verification:** Configuration remains deployment-overridable and local instructions state the required service.
