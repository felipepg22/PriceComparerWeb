# PRD: Adapt Frontend to DESIGN.md as a Comparison Dashboard

## Overview

The frontend will be redesigned as a polished comparison dashboard aligned with `client/DESIGN.md`. The app will keep its current product search and offer comparison workflow, but the first screen will feel more credible, structured, and scan-friendly for everyday shoppers.

The redesign serves users who want to compare trusted product offers without opening many retailer tabs. The main value is confidence: users should quickly understand what was searched, how many sources were considered, which offers look strongest, and how much confidence the app has in each result.

## Goals

- Make the app visibly aligned with the Wise-inspired design language in `client/DESIGN.md`.
- Improve trust through clearer source transparency, offer hierarchy, and confidence presentation.
- Preserve the current search workflow while making results easier to scan and compare.
- Keep offer count, candidate pages, attempted sources, and confidence visible.
- Remove failed-source details from the main user experience.
- Support everyday shoppers first, not professional resellers or power analysts.

## User Stories

- As an everyday shopper, I want to search for a product so that I can find comparable offers without opening many tabs.
- As an everyday shopper, I want to see seller, source, price, and confidence clearly so that I can judge whether an offer is worth opening.
- As an everyday shopper, I want the app to look credible and calm so that I trust the comparison experience.
- As an everyday shopper, I want to understand how broad the search was so that I know whether the result set feels complete.
- As a returning user, I want the result area to behave like a dashboard so that I can compare offers quickly.

## Core Features

### Wise-Inspired Visual Refresh

The app must adopt the visual language from `client/DESIGN.md`: sage-tinted canvas, white cards, near-black ink, lime primary actions, heavy display typography, and 24px rounded cards/buttons. The experience should feel like a calm fintech dashboard rather than a plain utility form.

### Dashboard-First Search Surface

The first screen must place search inside a comparison-oriented workspace. The search form remains prominent, but the surrounding content should frame the product as a trusted comparison tool rather than a generic search box.

### Comparison Metrics Summary

After search, the dashboard must show:

- Found offers
- Candidate pages
- Attempted sources

These metrics should support confidence in the search breadth without overwhelming the offer list.

### Trust-Oriented Offer Cards

Each offer must make these details easy to scan:

- Price
- Product title
- Seller or source
- Extraction/source method when useful to trust
- Confidence
- Link to open the offer

Price and source credibility should be the strongest visual anchors.

### Simplified Partial-Failure Handling

The app should not show a detailed "sources not compared" list in the main experience. If some sources fail, the dashboard may show a restrained high-level notice, but it should not distract from successful offers.

### Empty and Error States

Empty and error states must match the redesigned visual system and tell users what happened in plain language. They should preserve user confidence by distinguishing between "no comparable offers found" and "search failed."

## User Experience

The primary user flow:

1. User lands on the app and sees a polished comparison dashboard.
2. User understands that the app compares trusted offers across sources.
3. User enters a product name and optional currency.
4. User submits the search through a prominent lime primary action.
5. While loading, the app communicates progress without layout jank.
6. Results appear with dashboard metrics and scan-friendly offer cards.
7. User compares price, seller/source, and confidence.
8. User opens the most relevant offer in a new tab.

UX considerations:

- The page should prioritize comparison and trust over marketing copy.
- The first viewport should make the app's purpose obvious.
- The result list must remain usable on mobile.
- Buttons and inputs should have comfortable touch targets.
- Visual hierarchy must prevent metrics from competing with offer prices.
- The design should avoid adding extra steps before search.

## High-Level Technical Constraints

- The redesign must work with the existing search capability and returned result fields.
- Product search still depends on the local backend and configured search sources.
- The UI must remain responsive across mobile, tablet, and desktop.
- The app must not expose credentials, private endpoints, or scraping behavior that bypasses site terms.

## Non-Goals

- No backend behavior changes.
- No new search sources.
- No authentication or saved searches.
- No price history, price alerts, barcode scan, image search, or product tracking.
- No detailed failed-source diagnostics in the main UI.
- No reseller-specific profit, ROI, or marketplace arbitrage features.
- No full marketing landing page separate from the dashboard.

## Phased Rollout Plan

### MVP (Phase 1)

- Apply `DESIGN.md` visual system to the current app.
- Reframe the first screen as a comparison dashboard.
- Redesign search, metrics, offers, empty state, loading state, and error state.
- Preserve current search behavior and result data.
- Hide detailed failed-source list from the main experience.

Success criteria:

- Users can complete the current search flow without regression.
- The app visibly matches the design reference.
- Results make price, source, and confidence easier to compare.

### Phase 2

- Improve offer scan quality with stronger grouping, sorting cues, or trust badges if supported by available data.
- Add clearer explanatory microcopy for confidence and attempted sources.
- Refine responsive behavior based on real usage.

Success criteria:

- Users can identify the strongest offer faster.
- Dashboard metrics help users understand result quality without confusion.

### Phase 3

- Consider richer comparison features such as saved searches, price history, alerts, or broader trust scoring.
- Evaluate whether a separate onboarding or marketing surface is needed.

Success criteria:

- Repeat users find enough value to return for future product searches.
- The product can expand beyond one-off comparison without weakening the core dashboard.

## Success Metrics

- Users understand that the app compares product offers from multiple sources before searching.
- Users can identify price, seller/source, and confidence for each offer without opening the offer.
- Search completion remains at least as simple as the current flow.
- The redesigned UI passes visual review against `client/DESIGN.md`.
- Mobile users can search and compare offers without horizontal scrolling or overlapping content.
- Partial failures do not dominate the result experience.

## Risks and Mitigations

- Risk: The dashboard direction could feel dense for first-time users.  
  Mitigation: Keep the first screen focused on one primary search action and a small number of trust cues.

- Risk: Hiding failed-source details could make the app feel less transparent.  
  Mitigation: Keep high-level attempted-source context visible and avoid implying complete coverage when some sources fail.

- Risk: The Wise-inspired design could overpower the functional comparison workflow.  
  Mitigation: Use the design language for hierarchy and trust, not decorative complexity.

- Risk: Users may expect richer marketplace features after seeing a polished dashboard.  
  Mitigation: Keep MVP copy specific to current capabilities: search, compare, and open offers.

## Architecture Decision Records

- [ADR-001: Prioritize Comparison Dashboard Experience](adrs/adr-001.md) — The frontend redesign will center result analysis and fast offer scanning while adopting the `DESIGN.md` visual language.

## Open Questions

- Should confidence be shown as a percentage, a label, or both?
- Should the dashboard explain "candidate pages" and "attempted sources" inline?
- Should offers be visually sorted or highlighted by best price if the current response order is not guaranteed?
- Should the main page include a small note about required local services, or should that remain developer-only documentation?
