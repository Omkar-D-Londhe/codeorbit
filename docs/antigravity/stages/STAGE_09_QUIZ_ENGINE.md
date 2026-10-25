# Stage 09 — Quiz engine: new question types, timed mode, breakdown

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 09 · **Slug:** `quiz-engine` · **Branch:** `stage-09-quiz-engine`

**Objective.** Extend the single-choice quiz into a typed question engine (output predictor, drag-and-drop sorter, spot-the-bug, fill-in-the-blank), add opt-in timed mode and a result breakdown — while keeping `isPass`/`isPerfect` semantics.

**In scope**
- 5.1 visual output predictor, 5.2 drag-and-drop code sorter (keyboard-accessible, no heavy DnD dependency), 5.3 spot-the-bug, 5.4 fill-in-the-blank, 5.5 timed mode (opt-in), 5.6 result breakdown.
- Authoring of at least one question of each new type per HTML topic group where meaningful (≥ 8 new questions total).

**Out of scope**
- XP animation (Stage 11), spaced repetition scheduling (Stage 18).

## 2. Prerequisites and dependencies

- Stage 06 exit gate green (preview rendering for output predictor).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `5.1` Visual Output Predictor Quiz, `5.2` Drag-and-Drop Code Sorter, `5.3` Spot-the-Bug Quiz, `5.4` Fill-in-the-Blank, `5.5` Timed Challenge Mode (opt-in), `5.6` Quiz Result Breakdown
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-18, FC-19, FC-23, FC-30

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- `QuizQuestion` multiple-choice behaviour, existing 12 quizzes, `sanitizeSession`, `isPass` (≥ 2/3) and `isPerfect`, Error Notebook creation from wrong answers.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/data/types.ts | `QuizQuestion` becomes a discriminated union with `kind` (default `'choice'` for existing data). |
| src/lib/quiz.ts | `scoreQuestion(q, answer)` per kind; `sanitizeSession` validates answer shapes per kind; `QuizScore {correct,total}` unchanged. |
| src/pages/Quiz.tsx | Render by kind; timer; breakdown screen. |
| src/data/quizzes.ts | Add typed new questions (existing ones unchanged). |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/learning/questions/*.tsx | `ChoiceQuestion`, `OutputPredictorQuestion`, `SorterQuestion`, `SpotBugQuestion`, `BlankQuestion`. |
| src/core/learning/Sorter.tsx | Pointer drag + keyboard reordering (select with Space, arrows move, Space drops, `aria-live` position announcements). |
| src/core/learning/QuizTimer.tsx | Opt-in timer; pausable; never auto-fails; no pressure copy. |
| src/core/learning/QuizBreakdown.tsx | Per-question table (kind, your answer, correct answer, explanation) with ✓/✗ + text. |

## 7. Implementation steps (execute in order)

1. Inspect `quiz.ts`, `Quiz.tsx`, session persistence shape.
2. Define the union; migrate existing data lazily (`kind ?? 'choice'`); tests prove old persisted sessions still load.
3. Implement scoring per kind with exhaustive tests (including whitespace/case rules for blanks: trim + case-sensitive unless `caseInsensitive`).
4. Build each question component with native semantics (fieldset/legend, labelled inputs).
5. Sorter: keyboard-first design, then pointer; no external DnD library.
6. Output predictor: shows learner HTML rendered in sandbox preview as options (images are `data:` SVG screenshots authored per question — never live-executed learner input).
7. Spot-the-bug: learner selects a line (listbox of lines) — scoring by line id.
8. Timed mode toggle in the quiz intro (off by default); timer shown as text and `role=timer`; expiry submits unanswered as incorrect only if the learner opted in and sees this stated up-front.
9. Breakdown screen and Error Notebook entries for wrong answers (existing flow, new kinds supply `detail`).
10. QA; docs.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

```ts
type QuizQuestion =
 | { kind?: 'choice'; id; prompt; options: string[]; answer: number; explanation: string }
 | { kind: 'output'; id; prompt; code: string; options: Array<{ id: string; svg: string }>; answer: string; explanation: string }
 | { kind: 'sort'; id; prompt; items: Array<{ id: string; text: string }>; order: string[]; explanation: string }
 | { kind: 'bug'; id; prompt; lines: string[]; answer: number; explanation: string }
 | { kind: 'blank'; id; prompt: string /* uses ___ */; answers: string[]; caseInsensitive?: boolean; explanation: string }
type Answer = number | string | string[] | null
```
Scoring contract: each question yields 0/1; `QUIZ_FINISH` receives `{correct,total}` exactly as today.

## 9. UI/UX expectations

One question per screen; progress text 'Question 2 of 3'. Sorter items are 48 px tall with grab handle icon + 'Move up/down' buttons for non-pointer users. Timer is a calm text chip, not a red countdown; under 10 s it only changes text weight.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Persisted session with unknown `kind` → question dropped and session marked repaired. Timer paused when the tab is hidden. Drag cancelled by Esc.

## 11. Security and performance

Output-predictor SVGs are authored static strings sanitised at build time (test forbids `<script>`/`on*`). No new dependencies. Large lists not expected.

## 12. Required tests and regression checks

- `quiz.scoring.test.ts` per kind; `sanitizeSession` negative tests; old-session compatibility; Sorter keyboard tests; timer tests with fake clock; breakdown rendering; axe.
- Existing `quiz.test.ts` unchanged and green.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Each new question type works with keyboard only.
- [ ] `isPass`/`isPerfect` and mastery unchanged (progress tests).
- [ ] Timed mode is off by default, announces its rules before starting, and never penalises beyond the stated rule.
- [ ] Breakdown lists every question with explanation.
- [ ] Old stored sessions load without error.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

Reference changes `Quiz.tsx` only to pass `now` (handled in Stage 03).

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Pass/mastery thresholds, existing questions' wording/order.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_09_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 09: Quiz engine: new question types, timed mode, breakdown`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 10 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
