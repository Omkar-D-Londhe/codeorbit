# Stage 20 — Execution runner and complexity-analysis & optimisation framework

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

> **Decision gate (soft — a default exists; proceed with it and record that you did):** O-13 (product name of the optimise flow) is a soft gate: use "Analyse and improve" and record it.

## 1. Stage identity, objective and scope

**Stage:** 20 · **Slug:** `runner-and-analysis-framework` · **Branch:** `stage-20-runner-and-analysis-framework`

**Objective.** Build the shared infrastructure for running code safely and for genuine complexity analysis: the Worker runner host, the `AnalysisProvider` contract and registry, validated result model, analysis/optimisation UI, comparison view — all honest about the absence of a provider until Stage 23.

**In scope**
- PLT-05 Worker runner host (L-07), PLT-06 analysis contracts/registry/validation, PLT-07 analysis UI: complexity panel, assumptions/limitations/confidence, bottleneck highlighting in the editor, optimisation suggestions list, before/after comparison, correctness check display.
- Truthful 'not available' states for every language lacking a provider; a **test-only fake provider** used exclusively in tests (never registered in production builds).

**Out of scope**
- Any real analyzer (Stages 23, 25, 26); script-enabled iframe (Stage 23).

## 2. Prerequisites and dependencies

- Stage 07 exit gate green (diagnostics in editor), Stage 06 (runner interface), Stage 15 (charts for measurement).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Platform / reference / concept items:** `PLT-05` Worker runner host, `PLT-06` Complexity-analysis contracts, registry and validation, `PLT-07` Analysis and optimisation UI
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-21, FC-22 (feeds later JS data-structures topic), FC-30

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- The iframe preview runner and its empty sandbox; Practice requirement checking; Code Coach copy rules (L-05).

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/pages/Practice.tsx | Adds an 'Analyse' action visible only when `track.capabilities` includes `complexity` AND a provider is registered for the language; otherwise a disabled affordance explains why. |
| src/state/types.ts, reducer.ts, storage.ts | Schema **v9**: `analysis.history` (capped 30 records, derived data may be dropped under quota pressure); migration `v8→v9`. |
| src/core/editor/* | Render `Bottleneck` ranges as highlights via `setDiagnostics`/decorations. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/runner/workerHost.ts, workerEntry.ts | Dedicated module Worker per run; message schema `{type:'run', files, stdin, limits}` / `{type:'result'\|'log'\|'error'}` validated both ways; host kills the worker on timeout (default 3 s) and on output cap (64 KiB); `AbortSignal` support. |
| src/core/runner/sandboxPolicy.ts | CSP/worker constraints and a static check that the worker entry imports no DOM/network APIs (lint rule + test). |
| src/core/analysis/types.ts | Contracts from `01` §B5. |
| src/core/analysis/registry.ts | `registerProvider`, `getProvider(language)`; production never registers a fake. |
| src/core/analysis/validate.ts | `validateEstimate(e)`: assumptions/limitations non-empty, class strings normalised/known, `isFormalProof === false`, ranges within files; invalid → `AnalysisError`. |
| src/core/analysis/complexityOrder.ts | Pure ordering and comparison of Big-O classes (`O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!)`) with parse/normalise; unknown → `undefined`, never guessed. |
| src/core/analysis/AnalysisPanel.tsx | Time (best/avg/worst when provided), auxiliary space, confidence chip (icon+text), method, assumptions, limitations, explanation steps (click highlights source), bottleneck list with ranks, disclaimer 'Heuristic estimate, not a formal proof.' |
| src/core/analysis/OptimisationPanel.tsx | Suggestions with expected effect and risk; 'Apply as new draft' (never overwrites silently); 'Verify' runs `verifyEquivalence` when available; badge 'Verified on N cases' vs 'Unverified suggestion'. |
| src/core/analysis/ComparisonView.tsx | Before/after complexity table + optional measured timings chart with environment note and 'not an asymptotic proof'. |
| src/test/fakeProvider.ts | Test-only provider for UI/validation tests. |

## 7. Implementation steps (execute in order)

1. Inspect `01` §B4–§B5 and Practice toolbar.
2. Write runner host with a fake engine first: tests for timeout kill, output cap, abort, malformed messages, worker error; confirm the main thread stays responsive during an infinite loop (test with a timer tick assertion).
3. Add the lint/test guard ensuring worker entry code does not reference `document`, `window`, `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts` to non-allowlisted URLs.
4. Define analysis types, validator and ordering utilities with exhaustive tests (including malformed estimates and unknown classes).
5. Build the panels against the fake provider in tests; in the app, with no provider registered, show: 'Complexity analysis is not available for <language> yet.' and **no numbers**.
6. Editor highlighting for bottlenecks; click-to-highlight from explanation steps; keyboard accessible list.
7. Comparison and optimisation flows: applying a suggestion creates a new draft file `solution-optimised` (never replaces the learner's draft); correctness state must be shown before the comparison table is labelled 'verified'.
8. History persistence with cap and drop-under-quota behaviour; migration v8→v9.
9. Truthfulness review (G9): grep UI strings for 'optimal', 'guaranteed', 'proven'; tests forbid them in analysis components.
10. QA, docs (`DECISIONS.md`: analysis architecture, limits).

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

### 7a. Sub-stages

This stage is large. To keep each working session reviewable it may be executed as the sub-stages below **without dropping any scope**: the stage is complete only when every sub-stage gate and every §13 box is green. Each sub-stage uses branch `stage-NN<letter>-<slug>`, its own status report (`STAGE_NN<letter>_STATUS.md`) and its own exit gate. Give Antigravity one sub-stage at a time (guide §10).

| Sub-stage | Title | Scope (from §1/§7) | Sub-stage exit gate |
|---|---|---|---|
| 20a | Runner host (Worker) | `CodeRunner` Worker host, limits, abort, schema validation, fake engine tests | Isolation/timeout tests green |
| 20b | Analysis contracts, validation, registry and UI | `AnalysisProvider`, `validateEstimate`, honest unavailable panel, optimisation/comparison UI, schema v9 | No-provider and truthfulness tests green |

## 8. Component behaviour, state, data contracts and integration

See `01` §B5 and §B4 verbatim. Additional: `AnalysisError { code: 'unsupported'|'timeout'|'invalid-result'|'internal'; message }`; `AnalysisRecord { id, at, language, files hash, estimate | error }`.

## 9. UI/UX expectations

Practice gains an 'Analyse & improve' drawer (desktop: right panel tab; mobile: fifth tab). Confidence chip: Low (warning icon) / Medium / High with text; explanation steps list with source-range chips; bottleneck list ranks 1…n. When unavailable the drawer shows the reason and which capability is missing, with no placeholder values. Comparison: two columns 'Before'/'After' with ▲▼ text arrows (not colour only).

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

No provider → unavailable panel. Provider throws/times out → 'Analysis could not be completed' + reason, no partial numbers. Invalid result → rejected with 'The analyzer returned an invalid result', logged in dev. Unsupported construct → low confidence + limitation listed.

## 11. Security and performance

Worker has no DOM/network; per-run fresh worker; analysis runs off the main thread when the provider declares `worker` (`AnalysisProvider.worker`, `01` §B5); AbortSignal and 5 s default timeout; analysis history excluded from export unless the learner opts in (size).

## 12. Required tests and regression checks

- Runner host tests (timeout, cap, abort, schema, isolation, main-thread responsiveness).
- `validateEstimate` and `complexityOrder` tests (including 'never fabricate').
- UI tests with the fake provider for every state; copy test forbidding proof-like claims; axe; keyboard.
- Production-build test: registry has **zero** providers at Stage 20 (the Analyse affordance is disabled everywhere).

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Complexity classes render with `<sup>` (e.g. O(n<sup>2</sup>)) and carry a spoken form (`aria-label` "O of n squared") — the Concept Atlas cites this for FC-02 `sup`/`sub` (test).
- [ ] Infinite-loop code in the test engine is killed within timeout + 250 ms and the UI stays responsive.
- [ ] In the real app at this stage no complexity numbers appear anywhere (test + manual check).
- [ ] Invalid or assumption-free estimates are rejected.
- [ ] UI always shows method, confidence, assumptions, limitations and the heuristic disclaimer.
- [ ] Applying a suggestion never overwrites the learner's code.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None; reference has no analysis.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Iframe preview runner and its sandbox; mastery; coach copy rules.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_20_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 20: Execution runner and complexity-analysis & optimisation framework`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 21 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
