# Architecture rules

Use **module**, **interface**, **implementation**, **depth**, **seam**, **adapter**, **leverage**, and **locality** with the meanings in `.agents/skills/codebase-design/SKILL.md`.

## Give each domain invariant one owner — Gate

- **Trigger:** Adding or changing a business rule such as Search Currency, host eligibility, Comparable Offer classification, ranking, or Offer Email validation.
- **Requirement:** One module owns the invariant. Callers and adapters transport inputs and outcomes without independently reimplementing it. For an existing split rule, add no new owner.
- **Reason:** Duplicate decisions drift and make one behavior require coordinated edits across several modules.
- **Verification:** Search affected paths for repeated normalization, thresholds, classification, or error mapping and identify the owning module.

## Align each interface with one seam — Gate

- **Trigger:** Creating or changing an interface or adapter.
- **Requirement:** Every operation belongs to one responsibility and every adapter implements every operation meaningfully.
- **Reason:** An adapter that throws for an irrelevant operation proves the interface crosses seams.
- **Verification:** Reject unused operations, placeholder implementations, `NotSupportedException`, and callers that depend on unrelated subsets.

## Introduce only real seams — Gate

- **Trigger:** Adding an interface, adapter, facade, or pass-through module.
- **Requirement:** Justify the seam with at least two meaningful adapters, normally production and test, or a true external dependency that must be substituted. Framework-required seams are permitted.
- **Reason:** Speculative abstractions increase interface surface without leverage.
- **Verification:** Name the adapters and apply the deletion test: if deletion only removes indirection, keep the implementation internal.

## Keep composition modules thin — Gate for new responsibilities; guideline for existing roots

- **Trigger:** Adding behavior to application roots, route handlers, or top-level UI modules.
- **Requirement:** Roots compose modules and translate transport concerns. Put cohesive workflow state and business decisions behind a named module interface; do not add an unrelated reason for the root to change.
- **Reason:** Product Search, Offer Email, presentation, and transport concerns otherwise accumulate in one implementation.
- **Verification:** State the root's responsibility before and after the change and deepen the workflow when the new reason is independent.

## Put external effects behind substitutable adapters — Gate for new effects

- **Trigger:** Adding HTTP, SMTP, browser storage, browser metadata, filesystem, clock, or other environmental behavior.
- **Requirement:** The owning module receives the dependency at a seam. Production and test adapters expose the same observable outcomes and failure modes. Do not worsen existing direct global access.
- **Reason:** Injected effects are testable without process-wide or browser-wide mutation.
- **Verification:** Tests replace the effect without constructing production infrastructure inside domain logic.

## Test through the module interface — Gate

- **Trigger:** Adding behavior, fixing a defect, or deepening a module.
- **Requirement:** Assert observable outcomes through the same interface callers use. Helper and adapter tests may supplement but never replace workflow-level behavior coverage.
- **Reason:** Tests of private implementation or fakes can pass while production ordering and outcome mapping are broken.
- **Verification:** The changed behavior has a test that would fail when the owning module's observable result is wrong.

## Remove newly orphaned production code — Gate

- **Trigger:** Replacing, extracting, or retiring behavior.
- **Requirement:** Remove superseded modules, methods, styles, translations, and adapters created or orphaned by the change unless an active migration explicitly needs them.
- **Reason:** Unreachable implementation and interface surface add cognitive load without leverage.
- **Verification:** Reference search proves reachability for retained production symbols and assets.

## Name modules after owned domain behavior — Guideline

- **Trigger:** Creating, splitting, or renaming a production module.
- **Requirement:** Use terminology from the applicable `CONTEXT.md`. Define a genuinely new domain concept before using it as a seam; conflicting terminology is a gate failure.
- **Reason:** Domain-aligned names expose ownership and improve navigation.
- **Verification:** The name communicates owned knowledge rather than only a mechanism or pattern.

Module size alone is not an architecture rule. Review depth, responsibility, locality, interface surface, and change coupling instead of enforcing line-count thresholds.
