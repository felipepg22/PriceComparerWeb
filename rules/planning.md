# Planning rules

## Accept multiple requirement sources — Gate

- **Trigger:** Planning or implementing work.
- **Requirement:** Treat the active user prompt, plan, TDD, PRD, ADR, issue, or task brief named by the user as the originating requirement source. No issue or fixed artifact format is mandatory. Existing `openspec/` content is historical and is not a project workflow or default requirement source.
- **Reason:** Work may start from several legitimate artifacts.
- **Verification:** The plan or handoff names its originating source and does not invent a mandatory issue or OpenSpec dependency.

## Route rules during planning — Gate

- **Trigger:** Creating or editing a plan, TDD, PRD, ADR, task brief, or similar implementation artifact.
- **Requirement:** Determine affected paths and concerns, load every applicable file from `rules/README.md`, and use them while designing the work. Add an `Applicable rules` section containing repository-relative links only; never copy rule text.
- **Reason:** Plans must be compliant when created and must not embed stale rule copies.
- **Verification:** Every planned area and concern maps to a rule link, and every link resolves.

## Make implementation artifacts executable — Gate

- **Trigger:** Creating a plan, TDD, PRD, or task brief intended for implementation.
- **Requirement:** State the originating source, scope, exclusions, acceptance criteria, applicable rules, relevant domain context and ADRs, required verification, and known conflicts or that none were found.
- **Reason:** An implementation agent needs observable completion criteria and the context required to act without guessing.
- **Verification:** Each task is traceable to acceptance criteria and verification.

## Resolve rules again at implementation — Gate

- **Trigger:** Starting implementation from an artifact.
- **Requirement:** Load its `Applicable rules` links and independently recalculate applicability from the actual work. Do not edit the originating plan during implementation. If required work exceeds its scope, warn the user and stop until the user supplies revised direction.
- **Reason:** Planning and implementation may occur in different agents, and discovered scope must not silently rewrite the agreed plan.
- **Verification:** The implementation stays within the artifact or has explicit subsequent user direction.

## Warn on instruction conflicts — Gate

- **Trigger:** Requirements, rules, domain context, or ADRs disagree.
- **Requirement:** Always warn the user and identify the conflicting sources. Continue following repository rules. Stop for confirmation when the conflict affects behavior, architecture, security, a public contract, or scope.
- **Reason:** Agents must not silently choose an instruction or rewrite a rule for convenience.
- **Verification:** Material conflicts have an explicit user resolution before affected implementation.
