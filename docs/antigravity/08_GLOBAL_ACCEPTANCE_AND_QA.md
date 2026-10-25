# 08 — Global Acceptance and QA (applies to every stage)

A stage is **not done** until every gate below that applies to it is green *and* the stage's own acceptance criteria are met. "Applies" is decided by what the stage touched (the stage file lists which sections are mandatory); when unsure, run it.

## G1. Build and static quality (always)

- [ ] `npm run typecheck` — zero errors.
- [ ] `npm run lint` — zero errors; no new warnings introduced; no `eslint-disable` without a comment explaining why.
- [ ] `npm run test` — all tests pass; the count never decreases without a recorded reason; new behaviour has new tests.
- [ ] `npm run build` — succeeds; record main chunk and total JS size (gzip) in the report; flag any increase > 10% that the stage did not intend.
- [ ] `npm audit --omit=dev` reviewed; new high/critical issues are fixed or recorded in `07`.
- [ ] No `console.error`/`console.warn` output during tests except in tests that assert it.
- [ ] No `any` added without justification; no TODO without an owner and stage reference.

## G2. Behavioural regression (always)

Run the **regression smoke** — it must stay green at every stage (Stage 01 turns it into automated tests in `src/test/regression.smoke.test.tsx`):

1. Home renders; "Start/Resume" reaches the correct lesson.
2. Track page shows the Learning Orbit; selection via the map/stepper/list stays in sync (until Stage 10b: the legacy orbit and its strip); arrow keys/Home/End move within bounds; panning/zooming never changes selection.
3. Lesson: marking complete persists across reload.
4. Quiz: answering, finishing, retake; pass/perfect semantics (`isPass`, `isPerfect`) unchanged.
5. Practice: editing saves a draft; Check shows requirement results; hints progress 1→3; solution reveal records `solutionRevealed`.
6. Error Notebook: failed check adds an entry; mark understood; delete.
7. Progress: numbers match stored state.
8. Storage recovery: corrupt JSON → fresh state + backup kept + banner; newer-version → not loaded + backup + banner; storage unavailable → banner, app still usable.
9. Preview iframe attributes: static previews `sandbox=""`; script-preview mode (Stage 23+) `sandbox="allow-scripts"` only; **never** both `allow-scripts` and `allow-same-origin`; CSP meta present; `srcdoc` used.

## G3. Visual inspection (any UI change)

**Mandatory visual acceptance (owner contract `09` §5).** Run the real app (`npm run dev` or `npm run build && npx vite preview`), visit every materially affected screen, capture screenshots with browser tooling (Playwright is acceptable) at **1280×800, 820×1180, 390×844, 320×640** (plus **1440×900** for orbit-affecting stages), **look at the screenshots**, compare with `04` and the design references, exercise hover/focus/selected/loading/empty/error/success states, fix visible defects and re-inspect. Save screenshots under `docs/antigravity/status/screenshots/<stage>/` and record screens, viewports, findings, fixes and unresolved issues in the report. A stage is **not** visually accepted because it builds or its unit tests pass. If a browser tool or screenshot inspection is unavailable, write **VISUAL: NOT VERIFIED** with the reason; the exit gate stays closed unless the owner accepts the gap in writing. Never claim a check you did not perform.

## G4. Accessibility (any UI change)

- [ ] Keyboard-only walkthrough of every new/changed flow (Tab, Shift+Tab, arrows, Enter, Space, Esc). No trap, logical order, visible focus.
- [ ] Screen-reader semantics reviewed: roles, names, states, live regions. Prefer Testing Library queries by role/name — if a query by role fails, the semantics are wrong.
- [ ] Automated: `vitest-axe` (or `jest-axe`) added in Stage 01 and run in component tests for each new screen/component; zero serious/critical violations.
- [ ] Contrast test (`core/a11y/contrast.ts` from Stage 02) green for all theme × accent × contrast combinations.
- [ ] Reduced motion verified: with `prefers-reduced-motion: reduce` emulated, nothing animates beyond the allowed minimum; a test asserts that animation classes/attributes are not applied.
- [ ] Zoom 200% and font scale 150%: no loss of content or function.
- [ ] Touch targets ≥ 44×44; spacing between adjacent targets ≥ 8px.

## G5. Security and privacy (any stage touching code, storage, URLs, imports, networking or dependencies)

- [ ] Preview iframe boundary intact (see G2.9). A unit test fails if `allow-same-origin` and `allow-scripts` appear together.
- [ ] No learner content reaches `innerHTML`, `dangerouslySetInnerHTML`, `eval`, `new Function`, or the parent DOM. Markdown renderer for notes escapes HTML.
- [ ] Script preview (Stage 23+): `sandbox="allow-scripts"` without `allow-same-origin` (unit test), CSP meta, nonce-checked schema-validated messages, forged messages ignored, `contentDocument` is `null` from the parent, infinite loop ⇒ iframe replaced on timeout.
- [ ] Worker execution (when present): timeout kill test, output-cap test, no-network assertion (CSP header/meta), message-schema validation tests, infinite-loop test that proves the main thread stays responsive.
- [ ] Import/URL snapshot inputs are size-capped, validated against a schema, and sanitised; malformed input shows an error and changes nothing.
- [ ] No secrets, tokens, or API keys in source or storage. Network calls only where the stage and `07` allow, opt-in, with a visible disclosure.
- [ ] New dependencies: licence checked, size recorded, necessity argued in `docs/DECISIONS.md`.

## G6. Persistence and recovery (any stage touching state)

- [ ] If the persisted shape changed: `SCHEMA_VERSION` bumped, one new append-only migration, fixture-based migration test (previous-version blob → current), sanitiser tests for malformed sub-records, unchanged backup behaviour.
- [ ] Round-trip test: `saveState → loadState` equality; reload keeps UI state.
- [ ] Failure modes: quota exceeded, storage throws, storage disabled, concurrent tab write (last-write-wins but never corrupt; `storage` event listener refreshes or warns).
- [ ] Export → import round trip equals original after migration; malformed import is rejected atomically.

## G7. Performance (any stage adding code or animation)

- [ ] No new long task > 50 ms in common interactions (measure with Performance panel or a documented script).
- [ ] Heavy libraries (editor, graph, charts) are lazy-loaded behind route or interaction boundaries; initial route JS stays within the budget recorded at Stage 01 plus the budget stated in the stage.
- [ ] Animations use only `transform`/`opacity`; no layout reads in animation loops; rAF loops cancel on unmount/hidden.
- [ ] Lists > 200 items virtualised or paginated; derived data memoised and tested for referential stability where it matters.

## G8. Documentation and records (always)

- [ ] `README.md` updated for new scripts/features; `DESIGN.md` for token/component changes; `docs/DECISIONS.md` for choices; `docs/TEST_PLAN.md` for new test coverage; `docs/WORKLOG.md` with a dated stage entry.
- [ ] `docs/antigravity/status/STAGE_NN_STATUS.md` filled from `STAGE_STATUS_TEMPLATE.md` with real command output summaries, not claims.
- [ ] Traceability: the matrix row for every completed enhancement id is updated to `Done` with the evidence (test names / screens) — in the status report, and in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md` only by the owner.

## G9. Truthfulness review (any stage with user-visible numbers, labels or claims)

- [ ] Every number on screen is derived from real stored events or authored content; list the derivation in the report.
- [ ] Every label states only what is true ("Estimate", "Local to this browser", "Not available for this language yet").
- [ ] No placeholder lorem, no demo data seeded into a real learner's state, no hidden test hooks in production builds.
- [ ] Planned features appear only as labelled "Planned" or not at all.

## G11. Constellation / Learning Orbit gate (Stages 02 tokens, 04 backdrop, 10a, 10b, 16, 21–27 content, 29)

Applies whenever the stage touches how the Learning Orbit looks, behaves or is populated. Specification: `10`.

- [ ] Every node maps to a real `Topic.id`; connections equal the declared `prerequisiteIds` (test against the real track data); no invented prerequisites.
- [ ] Four derived states render with icon **and** text; counts sum to the topic count; no stored/seeded progress.
- [ ] Selecting a node updates the details panel; its Lesson/Quiz/Practice actions open the correct existing routes (test per HTML topic).
- [ ] Pan, zoom, fit and expand work by pointer, touch (pinch) and keyboard/buttons; panning never changes selection; the page still scrolls around the map.
- [ ] List view and stepper are complete equivalents with full keyboard support; selection is shared across map, stepper, list and panel.
- [ ] Reduced motion and high contrast verified (no animation classes; no backdrop in high contrast).
- [ ] Responsive layouts verified at 1440/1280/820/390/320 with **real screenshots looked at** and compared with `design-reference/codeorbit_constellation_concept.png` using the table in `10` §15.3; defects fixed and re-inspected.
- [ ] Performance notes recorded (layout memoised, no re-render during pan, long-task check or NOT VERIFIED).
- [ ] No arc geometry for the primary orbit anywhere; legacy arc removed only after O-15 approval.

## G10. Release-level gates (Stage 29 only; see `FINAL_INTEGRATION_AND_ACCEPTANCE.md`)

Full matrix coverage, cross-browser smoke (Chromium, Firefox, WebKit), mobile Safari/Chrome checks, Lighthouse PWA/Performance/Accessibility/Best-Practices ≥ 90 on the production build served over HTTP, offline test, data-migration test from the original v1 fixture to latest, final security review.

## Evidence rules

"Passed" means you ran it and saw it pass. Reports quote the command, the summary line (for example `Test Files 14 passed (14) / Tests 212 passed (212)`), and for visual checks the viewport and what was observed. Unverifiable items are marked **NOT VERIFIED** with a reason; they block the exit gate unless the stage file says otherwise.
