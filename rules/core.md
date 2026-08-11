# Core rules

## Preserve task scope — Gate

- **Trigger:** Every task.
- **Requirement:** Change only what the request requires. Preserve unrelated worktree changes and do not silently expand scope. Warn the user when required work conflicts with the stated scope.
- **Reason:** The worktree may contain concurrent or user-owned work.
- **Verification:** The final diff maps to the request or its originating artifact; unrelated pre-existing changes remain intact.

## Protect repository data — Gate

- **Trigger:** File deletion, replacement, cleanup, or Git history operations.
- **Requirement:** Resolve exact targets before destructive work and prefer recoverable operations. Treat user files and uncommitted changes as authoritative unless the user explicitly requests their removal.
- **Reason:** Broad cleanup can destroy work that is not reproducible.
- **Verification:** Targets are explicit and scoped; material removal is reported with recovery status.

## Keep secrets and restricted endpoints out of Git — Gate

- **Trigger:** Configuration, credentials, endpoints, environment files, or logs.
- **Requirement:** Commit templates and environment-variable names, never credentials, private endpoints, populated `.env` files, tokens, or secret-bearing logs.
- **Reason:** Repository history is durable and commonly shared.
- **Verification:** Inspect the changed configuration and diff for credential-shaped values before completion.

## Respect source access constraints — Gate

- **Trigger:** Scraping, discovery, or external content acquisition.
- **Requirement:** Use permitted access paths. Respect authentication, paywalls, anti-bot controls, robots and site terms; preserve deployment-configurable exclusions.
- **Reason:** Product discovery must not depend on bypassing access controls or third-party restrictions.
- **Verification:** The implementation does not evade controls and documents any required local service or permitted credential.

## Keep generated output out of changes — Gate

- **Trigger:** Builds, tests, generators, or packaging.
- **Requirement:** Exclude generated build output such as `bin/`, `obj/`, coverage output, caches, and temporary files from the authored change unless the repository explicitly treats a generated artifact as source.
- **Reason:** Generated noise obscures review and creates machine-specific diffs.
- **Verification:** Inspect `git status --short` after verification and separate pre-existing generated changes from authored changes.

## Ask before adding production dependencies — Gate

- **Trigger:** Adding a runtime package, framework, service, or SDK.
- **Requirement:** Ask the user first. Explain why the existing stack is insufficient, the maintenance and security cost, and the files that will change. Test-only tooling may be added without separate approval when the task clearly requires it and its lockfile changes are verified.
- **Reason:** Runtime dependencies create durable operational and supply-chain obligations.
- **Verification:** Every new runtime dependency has explicit approval and a recorded purpose.

## Publish intentionally — Gate

- **Trigger:** Commit, push, or pull-request work requested by the user.
- **Requirement:** Use Conventional Commits in English. A pull request states the summary, verification, originating requirement, required local services, and UI screenshots when the user approved visual inspection.
- **Reason:** Publishing creates durable shared history and review obligations.
- **Verification:** The staged diff matches the intended scope and the published metadata contains the required evidence.
