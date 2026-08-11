# Verification rules

## Match verification to the changed area — Gate

- **Trigger:** Completing code, configuration, or test changes.
- **Requirement:** Run the checks that exercise every changed behavior:
  - Backend production behavior: `dotnet build server/PriceComparerWeb.Api.csproj` and `dotnet run --project tests/PriceComparerWeb.Api.Tests/PriceComparerWeb.Api.Tests.csproj`.
  - Frontend production behavior: from `client/`, `npm run build` and `npm run test -- --watch=false`.
  - Cross-tier behavior: both backend and frontend checks.
  - Test-only or configuration work: the smallest check that exercises the change, plus compilation when production configuration or types are affected.
  - Harness or rule work: `npx harness-score` and report the score.
- **Reason:** Passing unrelated checks is not evidence for changed behavior.
- **Verification:** The final response lists exact commands, results, and any check that could not run.

## Add tests when behavior changes — Gate

- **Trigger:** New behavior, changed behavior, a defect fix, or a refactor across an untested seam.
- **Requirement:** Cover new or changed behavior; reproduce a defect before fixing it; add characterization coverage before changing an untested seam. A refactor with adequate coverage preserves and runs existing tests without ornamental additions.
- **Reason:** Tests should protect observable behavior and survive internal restructuring.
- **Verification:** The new or existing test fails for the targeted defect or missing behavior and passes for the completed change.

## Check repository hygiene — Gate

- **Trigger:** After builds, tests, generators, or formatting.
- **Requirement:** Run `git diff --check`, inspect `git status --short`, and distinguish authored changes from pre-existing worktree changes. Review configuration changes for secrets and private endpoints.
- **Reason:** Verification commands can create noise or expose accidental sensitive data.
- **Verification:** The handed-off diff contains only intended source and documentation changes.

## Make completion claims evidence-based — Gate

- **Trigger:** Reporting work complete or behavior fixed.
- **Requirement:** Base the claim on fresh command output from the current worktree. Report failures and skipped checks plainly. Do not require a separate final rule-by-rule compliance recital.
- **Reason:** Stale or assumed results do not describe the delivered state.
- **Verification:** Each completion claim is supported by a named check or an explicit limitation.
