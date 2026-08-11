# Rule routing

This directory is the canonical source for repository rules. `AGENTS.md` files are discovery routers; plans and tool-specific adapters link here instead of copying rule text.

## Applicability matrix

| Rule file | Load when |
| --- | --- |
| `core.md` | Every task. |
| `architecture.md` | Changing production code in `client/` or `server/`. |
| `frontend.md` | Changing anything under `client/`. |
| `backend.md` | Changing anything under `server/`. |
| `verification.md` | Changing code, configuration, or tests; load before completion. |
| `domain.md` | Changing terminology, business rules, invariants, contracts, ranking, extraction, or user-visible product concepts. |
| `planning.md` | Creating or editing a plan, TDD, PRD, ADR, task brief, or similar implementation artifact. |
| `security.md` | Handling credentials, configuration, user input, outbound URLs, scraping, email, external integrations, or dependencies. |

Multiple rows may apply. Classify from both intended paths and task intent. Planning and implementation resolve applicability independently; an implementation agent does not assume the planner's list is exhaustive.

## Rule semantics

- **Gate**: mandatory for work within its trigger.
- **Guideline**: the default design direction; deviations require a concrete reason that still satisfies every gate.
- Repository rules are binding. If a request, originating artifact, context document, or ADR conflicts with a rule, warn the user and identify both sources. Stop for confirmation when the conflict affects behavior, architecture, security, a public contract, or scope; otherwise warn and follow the more specific instruction without violating a rule.
- Agents follow rules as written. They do not weaken or rewrite rules to make an implementation compliant.

Rules use Trigger, Requirement, Reason, and Verification so applicability and completion are observable.
