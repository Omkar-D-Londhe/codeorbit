# Stage 19 — Concept Atlas: frontend concepts applied in the platform and linked to track content

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 19 · **Slug:** `concept-atlas` · **Branch:** `stage-19-concept-atlas`

**Objective.** Make the application of frontend concepts real and checkable: a registry of course concepts (FC rows), a `/concepts` Atlas that links each concept to where CodeOrbit actually uses it, where it is taught, an exercise, and its tests — with honesty tests that fail on invented claims.

**In scope**
- `06` §3–§4 (FC-01…FC-32 registry, Atlas page, 'See it in CodeOrbit' highlight, honesty tests).
-  Back-fill entries for everything built in Stages 01–18 with accurate `platformUse` (source files, selectors, routes).

**Out of scope**
- New track content (Stages 21–27 add `teachIn` as tracks land; entries for planned tracks show 'Planned').

## 2. Prerequisites and dependencies

- Stage 18 exit gate green (all platform features exist to be mapped).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

No item is *completed* here; this stage only prepares or verifies (see scope).
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** All FC rows (registry); FC-32

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Platform/track separation (L-14); no platform change is required to satisfy an Atlas entry.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/core/concepts/concepts.ts | Populate all FC entries from `06` with real `platformUse` where it exists; `courseStatus` stays `pending-review` except `not-required` rows. |
| src/components/Shell.tsx / palette | Atlas reachable from navigation 'Concepts' (under Explore) and the command palette. |
| docs/ASSESSMENT_COMPLIANCE.md (repo) | Replace with the generated table from the registry (supporting record; marks everything `pending-review` without blocking). |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/pages/Concepts.tsx (`/concepts`) | Filter by track/area; list of concept cards. |
| src/core/concepts/ConceptCard.tsx | Title, summary, 'Where CodeOrbit uses it' (or 'Teaching topic — CodeOrbit itself does not need this technique'), 'Learn it', 'Try it', evidence list, status chip. |
| src/core/concepts/highlight.ts | 'See it in CodeOrbit': navigates to the route and outlines the target selector (dismissible; reduced-motion: static outline). |
| src/test/concepts.honesty.test.tsx | Honesty tests described below. |

## 7. Implementation steps (execute in order)

1. Inspect `06` and the features delivered so far; for each FC row decide `platformUse` truthfully (leave absent when none).
2. Implement types and registry; write honesty tests first (they will fail until entries are accurate).
3. Honesty test 1: every `sourceFiles` path exists in the repo (read via `fs` in Vitest). Test 2: every `selectors` entry matches ≥ 1 element when the route is rendered. Test 3: every `teachIn` references an existing topic/challenge or a non-available track. Test 4: every `evidenceTests` file exists. Test 5: `verified` requires a non-empty `assessmentRef`. Test 6: no entry claims `platformUse` for FC-12 (float), FC-26–FC-29 (Bootstrap/Angular) while L-14 holds.
4. Build the page and cards; 'See it in CodeOrbit' uses route navigation then highlights with a focusable, dismissible callout.
5. Add palette command 'Open Concept Atlas'.
6. Generate `docs/ASSESSMENT_COMPLIANCE.md` from the registry via a script (`npm run docs:concepts`) so it can never drift.
7. QA at four viewports; axe.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

See `06` §4 (`ConceptEntry`). Additional field: `assessmentRef?: string` (question/assessment number once verified).

## 9. UI/UX expectations

Grid of cards grouped by area (HTML, CSS, JavaScript, Bootstrap, Angular, Testing, Accessibility). Status chip: `Applied here + taught`, `Taught only`, `Planned`, with icon + text. The highlight callout is a bordered tooltip anchored to the target with 'Dismiss' button.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Entry whose track is planned → 'Planned' chip and disabled 'Learn it'. Selector not on route (should never ship; test prevents). Empty filter → message.

## 11. Security and performance

Registry is static data; page is lazy-loaded.

## 12. Required tests and regression checks

- `concepts.honesty.test.tsx` (6 checks above).
- Atlas page tests: filters, links, statuses, axe, keyboard; highlight dismissal and reduced-motion test.
- Script test: generated compliance doc matches registry.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] All six honesty checks pass; deliberately breaking a path or selector makes a test fail (demonstrate in report).
- [ ] Every FC row from `06` exists with `courseStatus` ≠ `verified` unless an assessment reference is recorded.
- [ ] Teaching-only concepts say so explicitly; no invented platform usage.
- [ ] The Atlas is reachable via navigation and the palette.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

D17: carry the reference's honest `pending-review` posture and its coverage-gap list into the registry.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Core features, routes (beyond adding `/concepts`).
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_19_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 19: Concept Atlas: frontend concepts applied in the platform and linked to track content`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 20 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
