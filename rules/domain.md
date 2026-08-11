# Domain rules

## Load the relevant domain context — Gate

- **Trigger:** Changing terminology, business rules, invariants, contracts, ranking, extraction, or user-visible product concepts.
- **Requirement:** Read `CONTEXT-MAP.md`, then `client/CONTEXT.md` and/or `server/CONTEXT.md` for every affected context. Read applicable ADRs under root, client, or server `docs/adr/` directories when they exist; absent ADR directories require no action.
- **Reason:** The contexts define shared meaning across the client and server.
- **Verification:** The change uses the glossary's preferred terms and preserves shared meanings at context crossings.

## Preserve the ubiquitous language — Gate

- **Trigger:** Naming a model, module, behavior, test, user-facing concept, or planning artifact.
- **Requirement:** Use the exact domain terms and avoid listed synonyms. Update the applicable context documents when the task intentionally introduces or sharpens a domain concept.
- **Reason:** Synonym drift hides duplicated concepts and splits ownership.
- **Verification:** Names and descriptions match the relevant context glossary; shared concepts remain aligned in both contexts.

## Surface decision conflicts — Gate

- **Trigger:** A request or artifact contradicts a domain invariant or ADR.
- **Requirement:** Warn the user and cite both sources. Stop for confirmation when behavior, architecture, security, contracts, or scope is affected. A newer artifact supersedes an ADR only when it says so explicitly.
- **Reason:** Silent precedence choices erase intentional product and architecture decisions.
- **Verification:** The conflict and its resolution are visible in the conversation or originating artifact before implementation continues.
