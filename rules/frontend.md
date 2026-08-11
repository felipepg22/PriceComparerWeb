# Frontend rules

## Follow the Angular application shape — Gate

- **Trigger:** Any change under `client/`.
- **Requirement:** Use Angular 21 standalone imports, signal-based state, typed domain-facing models, 2-space indentation, and single-quoted TypeScript. Keep UI modules in `src/app/components/`, domain-facing types in `src/app/models/`, and client integrations in `src/app/services/`.
- **Reason:** A consistent application shape keeps dependencies and responsibilities discoverable.
- **Verification:** Changed files follow `client/.editorconfig`, existing standalone patterns, and the declared directory ownership.

## Keep presentation interfaces focused — Gate for new code

- **Trigger:** Creating or changing a UI module interface.
- **Requirement:** Pass domain-relevant inputs and outputs rather than broad form objects, browser globals, transport clients, or large label bags. Keep transport and external effects in the owning workflow or integration adapter.
- **Reason:** Broad presentation interfaces expose implementation details and make callers coordinate behavior.
- **Verification:** Inputs and outputs describe what callers need, and the module does not require knowledge of unrelated control names or transport mechanics.

## Apply the product design system — Gate

- **Trigger:** Changing layout, interaction, responsive behavior, typography, spacing, color, or styling.
- **Requirement:** Read `client/DESIGN.md` and the root `DESIGN.md`; use their tokens and preserve the trustworthy, calm, search-first product direction.
- **Reason:** Visual consistency is a product constraint, not local styling preference.
- **Verification:** Changed styles and markup use the documented design language across relevant responsive states.

## Ask before visual inspection — Gate

- **Trigger:** Browser-level visual QA, screenshots, or responsive inspection would be useful.
- **Requirement:** Ask the user first unless the request explicitly includes visual QA. Automated build and tests remain the default frontend verification.
- **Reason:** Browser inspection can add substantial execution and context cost.
- **Verification:** Visual tooling runs only after explicit request or approval.
