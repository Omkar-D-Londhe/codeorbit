# Stage 23 — JavaScript track, script-enabled preview, Worker execution and the first real analysis provider

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

> **Decision gate (soft — a default exists; proceed with it and record that you did):** O-02 (script preview) and O-12 (acorn) are soft gates: proceed with the defaults in `07` and record that you did.

## 1. Stage identity, objective and scope

**Stage:** 23 · **Slug:** `javascript-track` · **Branch:** `stage-23-javascript-track`

**Objective.** Deliver the JavaScript track with two safe execution paths — a strict script-enabled preview for DOM/event lessons and Worker execution for console/algorithm exercises graded by visible unit tests — and the first genuine, language-specific complexity-analysis provider.

**In scope**
- Track topics: variables/types, control flow, functions, arrays/objects, events (`click`, `mouseover`, `keydown`, `input`), DOM manipulation, input validation, galleries/carousels, web storage (in-memory shim), testing basics (assertions, test cases), data structures and algorithms basics (feeds analysis).
- PLT-11 script-enabled preview mode (C-05); PLT-08 `javascript` `AnalysisProvider` (static AST + optional instrumented measurement) with limitations; FC-18…FC-25, FC-30.
- Unit-test style challenges: each challenge has visible test cases; results list name/expected/actual.

**Out of scope**
- Other languages, frameworks.

## 2. Prerequisites and dependencies

- Stage 22 exit gate green; Stage 20 runner and analysis framework exist; owner decisions O-02 (script preview) and O-12 (parser dependency) — proceed with the defaults in `07` if unanswered and record them.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Platform / reference / concept items:** `PLT-08` JavaScript analysis provider, `PLT-11` Script-enabled preview mode, `FC-18` JS events (click, mouseover, keydown, input), `FC-19` DOM and dynamic rendering, `FC-20` Input validation and feedback, `FC-21` Arrays, objects, structured data, `FC-22` Functions and reuse, `FC-23` Conditionals and control flow, `FC-24` Gallery / carousel pattern, `FC-25` Browser persistence (localStorage), `FC-30` Front-end testing concepts (Testing Lab unknown)
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-18, FC-19, FC-20, FC-21, FC-22, FC-23, FC-24, FC-25, FC-30

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- HTML/CSS previews stay `sandbox=""`; `allow-scripts` + `allow-same-origin` is never combined; Practice requirement semantics for non-JS tracks.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/core/runner/iframePreviewRunner.ts | Add `mode: 'static' \| 'script'`; `script` uses `sandbox="allow-scripts"` only. |
| src/lib/preview.ts | Second document builder with CSP `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:` and an injected **harness** (see contracts). |
| src/app/registerTracks.ts | Register `javascript` and its analysis provider; capabilities `lessons, quizzes, practice, preview, execution, diagnostics, complexity, optimisation (suggestions only after verifyEquivalence exists)`. |
| package.json | Add `acorn` and `acorn-walk` (lazy chunk) if O-12 default accepted. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/tracks/javascript/{track,curriculum,lessons,quizzes,challenges}.ts | Content; ≥ 12 topics, DAG, quizzes, challenges across difficulties, many with `tests[]`. |
| src/tracks/javascript/runner.ts | Worker engine: executes learner functions in a fresh Worker using `new Function` **inside the worker only**; exposes `console`, test harness (`test(name, fn)`, `expect(...)`), deterministic `Math.random` seed option; no `fetch`, `importScripts` disabled after bootstrap. |
| src/tracks/javascript/previewHarness.ts | Script-preview harness: captures `console`, `error`, `unhandledrejection`; sends messages via `postMessage` with a per-run nonce; DOM event simulators for tests (click/keydown/input) acting **inside the iframe**; 'Reset' reloads the iframe; host enforces timeout by replacing the iframe. |
| src/tracks/javascript/validators/* | Rules: test-case results from the Worker; DOM assertions evaluated *inside* the iframe via harness messages (`querySelector` exists/text/attribute), never by touching the iframe document from the parent. |
| src/tracks/javascript/analysis/provider.ts | Static analysis on the `acorn` AST: loop nesting depth, recursion detection (direct), known built-in costs table (`sort` O(n log n), `indexOf`/`includes`/`slice`/`concat` O(n), `Map/Set` get/set O(1) average), auxiliary space from allocations (array/object/Map/Set growth in loops, recursion depth), explanation steps with source ranges, bottleneck ranking, confidence rules, limitations (dynamic dispatch, higher-order callbacks of unknown cost, `eval`, async). |
| src/tracks/javascript/analysis/measure.ts | Optional instrumented timing in the Worker over input sizes [1k…64k] (powers of 2), median of 5 runs, reported with environment note; never used to *claim* asymptotics. |
| src/tracks/javascript/analysis/equivalence.ts | `verifyEquivalence(before, after)` runs the challenge's test cases + generated cases (deterministic seeded random inputs from a declared generator) and reports `CorrectnessCheck` with coverage note. |
| src/tracks/javascript/analysis/fixtures/* | ≥ 30 labelled functions with expected classes (constant, linear, quadratic nested loops, binary search log n, merge sort n log n, recursion fib exponential, memoised fib linear, etc.). |
| src/tracks/javascript/{snippets,achievements,concepts}.ts | Snippets, achievements, Atlas entries FC-18…FC-25, FC-30. |

## 7. Implementation steps (execute in order)

1. Inspect Stage 20 runner/analysis modules and the playbook; confirm the script-preview design in `07` C-05.
2. Implement script preview with the harness; security tests first (G5): attributes (`allow-scripts` only), CSP meta, no access from parent (`contentDocument` is `null` due to opaque origin — assert), nonce check on messages, forged messages ignored, infinite loop → iframe replaced by timeout.
3. Implement the Worker engine and test harness; tests: timeout, output cap, thrown errors, async rejection, forbidden globals (`fetch` undefined), determinism.
4. Author curriculum/lessons/quizzes/challenges; each challenge has ≥ 3 visible tests and 1 hidden-test option flagged (hidden tests shown only as 'N hidden cases passed').
5. Event/DOM challenges (mouseover, click, keydown, input validation, gallery) graded through harness assertions.
6. Write the analysis provider with the labelled fixtures **before** implementation of tricky parts; target: every fixture's class is either exactly matched or reported with `confidence: 'low'` and a limitation — **never silently wrong**; measure precision on fixtures and record in the report (target ≥ 90% exact on supported constructs; unsupported → low confidence).
7. Wire the Practice 'Analyse & improve' drawer for JS: complexity, assumptions, bottlenecks (editor highlights), suggestions limited to a curated rule set (e.g. nested `includes` → `Set`; repeated `indexOf` → map) each requiring `verifyEquivalence` before it can be labelled 'Verified on N cases'.
8. Measurement chart shows timings with environment note.
9. Atlas entries updated; register track `available` when all listed capabilities truthfully work.
10. QA at four viewports; security review; docs (limitations list for the analyzer in `DECISIONS.md`).

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

### 7a. Sub-stages

This stage is large. To keep each working session reviewable it may be executed as the sub-stages below **without dropping any scope**: the stage is complete only when every sub-stage gate and every §13 box is green. Each sub-stage uses branch `stage-NN<letter>-<slug>`, its own status report (`STAGE_NN<letter>_STATUS.md`) and its own exit gate. Give Antigravity one sub-stage at a time (guide §10).

| Sub-stage | Title | Scope (from §1/§7) | Sub-stage exit gate |
|---|---|---|---|
| 23a | Script preview, Worker engine and JavaScript content | C-05 script preview with security tests, Worker engine, curriculum/challenges/DOM-event tests | Security + engine tests green |
| 23b | JavaScript analysis provider, suggestions, equivalence | AST provider with ≥ 30 fixtures, verified suggestions, Analyse drawer wiring, measurement chart | Fixture precision recorded; truthfulness tests green |

## 8. Component behaviour, state, data contracts and integration

```ts
// harness messages (iframe → host), all carry { nonce, type }
type HarnessMsg = { type: 'console'; level: 'log'|'warn'|'error'; text: string } | { type: 'error'; message: string; line?: number } | { type: 'assert'; id: string; ok: boolean; detail?: string } | { type: 'done' }
interface ChallengeTestCase { id: string; name: string; call: string /* e.g. 'sum([1,2,3])' */; expect: unknown; hidden?: boolean }
// Analysis provider
export const jsProvider: AnalysisProvider = { id: 'js-static-v1', language: 'javascript', version: '1.0.0', supports, analyze, suggest, verifyEquivalence }
```
Confidence rules: `high` only when every loop bound and every called function cost is resolved from the built-in table or the file itself; `medium` when one assumption is needed (e.g. 'callback runs in O(1)'); `low` when anything unresolved. `assumptions` and `limitations` are always populated.

## 9. UI/UX expectations

Practice for JS: files tab (`solution.js`, optional `index.html`), Run and Check buttons, Console panel (monospace, `role=log`, copy button), Tests panel (list of cases: name, expected, actual, ✓/✗ + text). Analyse drawer per Stage 20. DOM challenges show the script-preview iframe with a 'Reset' button.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Timeout: 'Your code ran longer than 3 seconds and was stopped' + hint about infinite loops. Syntax error: line-numbered message. Analysis unsupported construct: low confidence + limitation. Worker creation failure: message, Run disabled.

## 11. Security and performance

Learner JS never runs on the main thread or trusted DOM; script iframe origin is opaque, no network; Worker has no DOM; limits enforced by the host; `acorn` loaded lazily; analysis ≤ 2 s for 500-line files else 'too large'.

## 12. Required tests and regression checks

- Security suite (script preview and Worker); harness protocol tests; runner determinism; test-case grading; DOM challenge grading; analysis fixtures (≥ 30) with expected classes, confidence assertions, and 'unsupported → low confidence' cases; `verifyEquivalence` tests (equivalent, non-equivalent, partial coverage note); copy tests (no proof language); track structure tests; mastery for the new track.
- All previous tests unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Infinite loops and runaway output are stopped; the UI remains responsive (tests).
- [ ] No parent access to the script iframe and no `allow-same-origin` anywhere (test).
- [ ] On the labelled fixtures the provider returns exact classes for supported constructs and low confidence + limitations for unsupported ones; recorded precision in the report.
- [ ] Suggestions are labelled 'Verified on N cases' only after `verifyEquivalence` passes; otherwise 'Unverified suggestion'.
- [ ] Analyse is available only for JavaScript; other tracks still show the honest unavailable state.
- [ ] FC-18…FC-25 and FC-30 have Atlas entries with real teach/exercise/test references.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None (reference has no JS track). Reuse the reference's honesty wording pattern ('not an exam grade') for analysis disclaimers.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Static HTML/CSS preview; platform reducer; mastery rules.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_23_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 23: JavaScript track, script-enabled preview, Worker execution and the first real analysis provider`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 24 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
