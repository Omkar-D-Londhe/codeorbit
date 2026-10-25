# Stage 22 — CSS track

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 22 · **Slug:** `css-track` · **Branch:** `stage-22-css-track`

**Objective.** Add the CSS track as the second integration: curriculum, lessons, live demos, exercises graded by computed-style probes in the sandboxed preview, tests, achievements and concept entries.

**In scope**
- Topics: selectors, cascade/specificity, pseudo-classes (hover/focus), box model, colour & typography, float & clear (legacy), flexbox, grid, positioning, responsive design (media queries), transitions & animations (incl. reduced motion).
- Interactive demos (flex/grid playgrounds) via `LiveDemo`; challenges across difficulties; track `tint` amber.

**Out of scope**
- JavaScript behaviour, Bootstrap.

## 2. Prerequisites and dependencies

- Stage 21 exit gate green (playbook, availability states).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Platform / reference / concept items:** `FC-10` CSS selectors, properties, inline styles, hover, `FC-11` Box model, colour, typography, `FC-12` Float layout (teaching-only), `FC-13` Flexbox, `FC-14` Grid, `FC-15` Positioning, `FC-16` Responsive design / media queries, `FC-17` Transitions and animation
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-10, FC-11, FC-12, FC-13, FC-14, FC-15, FC-16, FC-17

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- HTML track unchanged; preview sandbox (still `sandbox=""` — CSS needs no script).

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/app/registerTracks.ts | Register the `css` track as `available` once complete (was `planned`). |
| src/lib/preview.ts / core/runner/iframePreviewRunner.ts | Add a **style probe**: after render, a *trusted* host computes results by parsing the learner CSS with a small CSS parser and matching against a **detached, host-owned copy** of the document (no scripts run in the iframe; no access to the sandboxed document). |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/tracks/css/track.ts, curriculum.ts, lessons.ts, quizzes.ts, challenges.ts | Content with prerequisites DAG, ≥ 11 topics, ≥ 1 quiz (3+ questions incl. new types) and ≥ 1 challenge per topic (≥ 3 intermediate/advanced overall). |
| src/tracks/css/validators/* | Rules: `ruleExists(selector, property, value?)`, `declares(property, valuePattern)`, `mediaQuery(minWidth\|maxWidth)`, `usesFlex/Grid`, `specificityBelow(max)`, `reducedMotionGuard`; implemented on a parsed stylesheet + detached DOM (Option A) — **no scripts in preview**. |
| src/tracks/css/snippets.ts, achievements.ts, concepts.ts | Snippets, achievements (e.g. 'Flexbox Navigator', 'Responsive by Design'), Atlas entries FC-10…FC-17. |
| src/tracks/css/parser.ts | Small, tested CSS parser (rules, at-rules `@media`, declarations; ignores unsupported syntax safely) — or an approved lightweight dependency recorded in DECISIONS. |

## 7. Implementation steps (execute in order)

1. Inspect playbook and `iframePreviewRunner`; choose the probe approach (Option A above: host-side parse + detached document; reason: preserves `sandbox=""`).
2. Write parser tests first (nesting-free CSS, comments, `@media`, malformed input never throws).
3. Implement rule kinds with tests; compute simple specificity.
4. Author curriculum DAG, then lessons/quizzes/challenges per topic; every claim in a lesson has a validator or quiz counterpart.
5. Flex/grid playgrounds as `LiveDemo` with sliders (native `range` inputs) generating CSS text shown to the learner.
6. Responsive exercise: Practice device frames (Stage 06) render at 375/768 and the validator checks the `@media` rule.
7. Reduced-motion exercise: requires a `prefers-reduced-motion` media query disabling transitions.
8. Achievements, concept entries (platform use points to real files/selectors: tokens, flex shell, grid dashboard, positioned orbit nodes, transitions).
9. Register the track as `available` only when all tests pass and capabilities listed are truthful (`lessons`, `quizzes`, `practice`, `preview`, `diagnostics`, `snippets`).
10. Orbit/Mastery/Dashboard check with two tracks; Explore shows both; switching tracks preserves each track's progress.
11. QA; docs; update Atlas.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

```ts
type CssRule = { kind: 'ruleExists'; selector: string; property: string; value?: string | RegExp } | { kind: 'mediaQuery'; feature: 'min-width'|'max-width'; min?: number; max?: number } | { kind: 'declares'; property: string; pattern: string } | { kind: 'usesDisplay'; value: 'flex'|'grid' } | { kind: 'reducedMotionGuard' } | { kind: 'specificityBelow'; selector: string; max: [number, number, number] }
parseCss(source: string): { rules: ParsedRule[]; errors: string[] }   // never throws
```

## 9. UI/UX expectations

Track card amber tint; Orbit with the track's topics; challenges show both CSS and HTML files (multi-file tabs: `index.html` readonly scaffold, `styles.css` editable). Demos show generated CSS beside the preview.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Parse errors → requirement shows 'Your CSS has a syntax problem near line N' (no crash). Unsupported at-rule → ignored with limitation note in the challenge brief.

## 11. Security and performance

No scripts in the preview; parser runs in the main thread with an input size cap (50 kB) and complexity guard; lazy-loaded chunk per track.

## 12. Required tests and regression checks

- Parser/validator tests; track structure test; challenge solution tests (every reference solution passes its own requirements and the starter fails); progress/mastery applies to the new track; two-track Explore/Mastery tests; reduced-motion exercise test.
- HTML track tests unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Every CSS challenge's reference solution passes and its starter does not (test across all).
- [ ] Switching between HTML and CSS tracks keeps independent progress and mastery.
- [ ] No script execution exists in the CSS preview path (sandbox attribute test).
- [ ] Atlas shows FC-10…FC-17 with real teaching references; honesty tests green.
- [ ] Track is `available` only if its listed capabilities all work.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None (reference has only HTML).

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- HTML track, platform styling system, preview sandbox.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_22_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 22: CSS track`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 23 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
