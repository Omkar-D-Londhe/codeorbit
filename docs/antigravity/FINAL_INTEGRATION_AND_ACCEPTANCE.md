# Final Integration and Acceptance

Used in Stage 29. Every line needs evidence in `docs/antigravity/status/FINAL_STATUS.md`. `NOT VERIFIED` needs a reason and owner acceptance.

## A. Scope completeness
- [ ] All 168 rows of `02_ENHANCEMENT_TRACEABILITY_MATRIX.md` have a final status: **Done** (with stage report reference), **Gated** (decision recorded in `07`, truthful UI state present) or **Blocked** (reason). None remain silently "planned".
- [ ] All 29 stage status reports exist (including sub-stage reports 03a/03b … as used); each exit gate was green.
- [ ] Catalog sections 1–17 each checked item by item against the running app.
- [ ] Reference-derived items REF-01…REF-08 re-verified: ported test intents still pass in the final tree.

## B. Product direction
- [ ] The core imports nothing from `src/tracks/**` (lint/test); no `'html'` literal in core/pages/components.
- [ ] Every registered track has truthful availability and capabilities; no dead routes.
- [ ] HTML works as an optional track module; CSS, JavaScript, Bootstrap tracks are `available` only with working listed capabilities; Python (25a/25b), Java/C++, Angular and the Stage 28 features match the recorded `07` decisions (hard gates: O-03, O-04, O-05, O-06, O-07, O-14; owner checkpoint O-15).
- [ ] The platform is still React + TypeScript + custom CSS; no taught framework in the core bundle.
- [ ] Constellation Learning Orbit (L-23…L-26, `10`, G11) verified: nodes ↔ real topics, connections ↔ declared prerequisites, states derived, list view and stepper parity, pan/zoom by pointer/touch/keyboard, reduced motion/high contrast, and screenshot evidence at 1440/1280/820/390/320 compared with the concept reference; O-15 recorded; legacy arc removed.

## C. Truthfulness
- [ ] Every number on screen is derived from real events or authored content (derivation list in the report).
- [ ] No complexity result appears without a registered provider; every result shows method, confidence, assumptions, limitations and the heuristic disclaimer; analyzer fixture precision recorded; suggestions "Verified" only after equivalence checks.
- [ ] No fake leaderboard, metrics, activity, authentication or AI claims; Code Coach copy test passes.
- [ ] Daily challenge wording states it is local; achievements show rules; XP derived.

## D. Frontend concepts applied
- [ ] Concept Atlas lists FC-01…FC-32; honesty tests green; teaching-only concepts say so.
- [ ] `docs/ASSESSMENT_COMPLIANCE.md` regenerated from the Atlas; every course-specific row `pending-review` unless verified with an assessment reference (non-blocking).
- [ ] HTML gap closure verified: text-formatting tags, nested lists, rowspan/colspan, form controls/validation attributes, audio/video.

## E. Quality gates (`08`)
- [ ] G1–G9 green across the whole app.
- [ ] Browser matrix: Chromium, Firefox, WebKit smoke; mobile Safari/Chrome checks (or NOT VERIFIED with reason).
- [ ] Responsive sweep: 1440 (orbit)/1280/820/390/320 px × 3 themes × high contrast × font scale 150% × reduced motion — no overflow/clipping.
- [ ] axe: zero serious/critical on every route in the matrix; keyboard-only completion of core journeys.
- [ ] Lighthouse on the production build over HTTP: Performance, Accessibility, Best Practices, PWA ≥ 90 (or recorded reasons).
- [ ] Offline: load after one online visit; local data intact; update flow offers reload.

## F. Data safety
- [ ] Original-v1 fixture and reference-style v1 fixture both migrate to the latest schema without loss.
- [ ] Corrupt, newer-version, unavailable and repaired recovery paths verified; backup key preserved.
- [ ] Export → reset → import round trip identical; malformed import changes nothing.
- [ ] Quota guard warns at 80% and failed writes surface a banner.

## G. Security
- [ ] Static previews: `sandbox=""`; script preview: `allow-scripts` only; never combined with `allow-same-origin` (test).
- [ ] Workers: no DOM/network, timeouts and output caps verified; infinite loops stopped; UI responsive.
- [ ] Notes/snapshots/imports render inert (XSS corpus passes); no raw HTML from user data.
- [ ] No third-party requests by default (network-silence test); no secrets in source or storage.
- [ ] `npm audit --omit=dev` has no unresolved high/critical findings; dependency licences reviewed (Bootstrap MIT, Pyodide MPL-2.0, CodeMirror MIT, acorn MIT, fonts OFL).

## H. Performance
- [ ] Initial route JS within budget (`07` §3); heavy libs lazy; no long tasks > 50 ms in core interactions.
- [ ] Atmosphere idle CPU ≈ 0 when hidden; animations only `transform`/`opacity`.

## I. Documentation
- [ ] `README.md`, `DESIGN.md`, `AGENTS.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `docs/WORKLOG.md`, `docs/TRACK_PLAYBOOK.md` current.
- [ ] `07` decisions log reflects every owner decision; open gates listed in the release notes.
- [ ] Dev-only `/__ui` route absent from the production build.

## J. Release
- [ ] Working tree clean; release candidate commit identified; tag only if the owner asks.
- [ ] Release notes list: features, gated items (with the decision needed), known limitations (analyzer limitations list), supported browsers.
