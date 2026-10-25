# Stage 07 — Feedback and Code Coach framework

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 07 · **Slug:** `feedback-code-coach` · **Branch:** `stage-07-feedback-code-coach`

**Objective.** Make feedback richer and truthful: inline line-level markers, requirement progress bar, animated requirement rows, per-challenge feedback history, expandable explanations and a clearly deterministic Code Coach persona.

**In scope**
- 7.1 inline line-level feedback, 7.2 requirement progress bar, 7.3 animated requirement rows, 7.4 feedback history, 7.5 'Explain this requirement', 7.6 Code Coach persona.
- Extend `RequirementResult` with optional `line/column`; HTML rule evaluators report locations where the DOM parser can (source-position mapping).

**Out of scope**
- AI hints (Stage 28), analysis feedback (Stage 20).

## 2. Prerequisites and dependencies

- Stage 06 exit gate green (workspace, editor diagnostics hook).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `7.1` Inline Line-Level Feedback, `7.2` Requirement Progress Bar, `7.3` Animated Requirement Rows, `7.4` Feedback History (per Challenge), `7.5` "Explain This Requirement" Expandable, `7.6` Code Coach Persona
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-30 (test results presentation), FC-32

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Rule semantics in `validators.ts`, `ChallengeRecord` fields, three-hint ladder, Error Notebook capture on failed checks.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/lib/validators.ts | Return optional `line/column` where determinable; no change to pass/fail logic. |
| src/pages/Practice.tsx | Render new feedback components; send `EditorDiagnostic[]` to the editor. |
| src/state/types.ts, reducer.ts, lib/storage.ts | Schema **v3**: `ChallengeRecord.history: Array<{at, passed, total, failedIds}>` (cap 20); migration `v2→v3` adds `history: []`; sanitiser drops malformed entries. |
| src/data/challenges.ts | Optional `explain` text per requirement (authored). |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/learning/FeedbackPanel.tsx | Progress bar + rows + history. |
| src/core/learning/RequirementRow.tsx | Row with icon+text status, expandable explanation, animated state change. |
| src/core/learning/CoachNote.tsx | Persona label and copy rules. |
| src/core/learning/diagnostics.ts | Maps `RequirementResult` → `EditorDiagnostic`. |
| src/lib/sourcePositions.ts | HTML source offset→line/column mapping for selector matches. |

## 7. Implementation steps (execute in order)

1. Inspect validators and Practice feedback markup; list rules where an element location is meaningful.
2. Add source-position mapping with tests (multi-line, nested, void elements, entity edge cases); fall back to no location when unsure.
3. Extend results and diagnostics; editor shows gutter markers and an underline with `aria-label` tooltips.
4. Build `FeedbackPanel`: `role=progressbar` 'x of y requirements met', rows grouped Met / Not met, ✓/✗ + text, expandable explanation (`details`).
5. Animation: row state change fades/scales 160 ms, disabled under reduced motion; no sound.
6. History: store last 20 checks; list shows time, passed/total; selecting an entry is read-only information.
7. Code Coach copy: label 'Code Coach · rule-based, specific to this challenge'; never says 'AI' or 'reviewed your code'; wording style guide in `DESIGN.md`.
8. QA and docs.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

```ts
interface RequirementResult { id: string; met: boolean; detail?: string; line?: number; column?: number }
interface CheckHistoryEntry { at: number; passed: number; total: number; failedIds: string[] }
```
Coach copy rules: describe what was checked and what is missing; suggest the next smallest step; never grade the learner, never imply general code review (L-05).

## 9. UI/UX expectations

Feedback column (desktop) / Feedback tab (mobile). Top: bar with text 'X of Y met'. Rows ≥ 44 px. Failed rows reveal 'Explain this requirement'. Line markers: red/amber gutter dots plus `aria-label='Line 4: missing alt attribute'`.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Before first check: 'Run Check to see how your code measures up' (no fake progress). Parse failure: single message 'Could not read this HTML' with no rows. History empty: hidden section.

## 11. Security and performance

Escape all echoed snippets. Source mapping is O(n) per check, no external parser dependency.

## 12. Required tests and regression checks

- `sourcePositions.test.ts`, `diagnostics.test.ts`, `FeedbackPanel.test.tsx` (states, a11y, reduced motion), history cap test, storage sanitiser test.
- Existing validators and Practice tests pass.
- Copy test: UI strings never contain 'AI' or 'reviewed' in the coach component (guards L-05).

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Progress bar value equals met/total after each check (tests with partial results).
- [ ] At least the doctype/selector/everyHasAttr rules report line numbers in an HTML fixture.
- [ ] History persists across reload and is capped at 20.
- [ ] Reduced motion removes row animation.
- [ ] Coach text passes the L-05 copy test.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Pass/fail semantics, hint ladder, Error Notebook creation rules.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_07_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 07: Feedback and Code Coach framework`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 08 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
