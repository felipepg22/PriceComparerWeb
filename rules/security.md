# Security rules

## Keep sensitive configuration external — Gate

- **Trigger:** Credentials, SMTP, external providers, deployment endpoints, environment variables, or diagnostic logging.
- **Requirement:** Read secrets from environment or approved secret storage, keep committed defaults non-sensitive, redact sensitive values from errors and logs, and expose only the minimum configuration required by callers.
- **Reason:** Configuration and diagnostics are common paths for credential disclosure.
- **Verification:** Changed configuration and outputs contain names or placeholders, never usable secret values or private endpoints.

## Validate every outbound URL destination — Gate for changed fetching code

- **Trigger:** Server code fetches a user-supplied URL, discovered Search Candidate, redirect, webhook, or other externally influenced destination.
- **Requirement:** Permit only required schemes; resolve and reject loopback, private, link-local, cloud-metadata, multicast, and other non-public addresses; disable automatic redirects or validate each redirect destination before following it; enforce finite timeout and response-size limits. Do not weaken existing exclusions.
- **Reason:** Otherwise the server can become an SSRF client able to reach internal services or credentials unavailable to the requester.
- **Verification:** Tests cover direct private addresses, IPv4 and IPv6 loopback, malicious DNS results, and redirects to rejected destinations. Follow the OWASP SSRF Prevention Cheat Sheet when implementation details change.

## Treat external content as untrusted — Gate

- **Trigger:** Parsing seller pages, SearXNG responses, email fields, URLs, or other third-party data.
- **Requirement:** Validate structure and bounds before use, encode data for its output context, and preserve safe parser defaults. External content never becomes executable code, trusted markup, a filesystem path, or a log template without explicit validation.
- **Reason:** Third-party content can carry injection payloads or resource-exhaustion inputs.
- **Verification:** Tests cover malformed, oversized, and context-breaking input relevant to the changed parser or output.
