# Stage 26 — Java and C++ tracks (decision-gated execution)

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

> **Decision gate (HARD — the gated capability is not built until the owner records a yes in `07`):** O-04 (execution strategy) is a hard gate for **execution only**: no Run control and no execution tests until the owner records a yes. Everything else in this stage (content, structure checks, static estimators, `preview` state, `docs/EXECUTION_OPTIONS.md`) is ungated.

## 1. Stage identity, objective and scope

**Stage:** 26 · **Slug:** `java-cpp-gated` · **Branch:** `stage-26-java-cpp-gated`

**Objective.** Introduce Java and C++ as truthful tracks: editor, lessons, quizzes and static analysis now; **execution only after the owner chooses an execution strategy (O-04)**. No fake 'Run'.

**In scope**
- Tracks `java` and `cpp`: curriculum, lessons, quizzes, challenges graded by static rules (structure/syntax-pattern rules) and, **only if O-04 resolved**, test execution.
- Static analysis providers (heuristic) using a lightweight parser (Lezer from CodeMirror grammars or a purpose-built tokenizer) for loop nesting and recursion detection with **low/medium confidence only**, explicit limitations; labelled 'static estimate'.
- Availability `preview` until execution exists; capabilities exclude `execution`.

**Out of scope**
- Running Java/C++ (blocked until O-04). Options to present to the owner: (a) in-browser WASM toolchains (heavy, license review), (b) a hosted sandboxed execution service (needs backend, auth, cost), (c) stay editor + static analysis.

## 2. Prerequisites and dependencies

- Stage 25 **Part A (25a)** exit gate green. Part B (Pyodide) is not required, so a pending O-03 does not block this stage.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Platform / reference / concept items:** `PLT-10` Java/C++ static estimators
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-21, FC-22

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- No code execution outside Worker/WASM; truthful availability.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/app/registerTracks.ts | Register `java`, `cpp` as `preview`. |
| src/core/analysis/registry.ts | Register static providers. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/tracks/java/*, src/tracks/cpp/* | Content and static validators. |
| src/tracks/{java,cpp}/analysis/provider.ts | Token/Lezer-based heuristic estimator; confidence never above `medium`; limitations include 'no type information', 'no call graph', 'templates/generics not modelled'. |
| docs/EXECUTION_OPTIONS.md | Decision memo: options (a)–(c) with security, cost, licensing, bundle size, offline implications; recommended default = (c) until a security review of (a) or (b) is approved. |

## 7. Implementation steps (execute in order)

1. Present O-04 in the stage report with the memo; continue with the ungated work.
2. Choose a tokenizer approach; tests with labelled fixtures (≥ 20 per language) for loop depth/recursion detection.
3. Author content; challenges use static rules only (e.g. 'declares a method named X with signature', 'contains a nested loop') clearly labelled 'structure check — your code is not run'.
4. UI: no Run button; Practice shows 'Execution isn't available for <language> yet' with a link to the status; Analyse available with low/medium confidence labelled 'static estimate'.
5. Register tracks as `preview`; Explore chips show 'Run: not available'.
6. If O-04 is resolved before completion, record it and add a follow-up stage file `STAGE_26b` in the owner's chosen direction — do **not** improvise execution.
7. Atlas/QA/docs.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

Capabilities for `java`/`cpp`: `['lessons','quizzes','practice','diagnostics','complexity']` (no `execution`, no `preview` of output). Confidence cap: `medium`. All results carry `method: 'static-ast'`.

## 9. UI/UX expectations

Practice shows editor, structure-check feedback, and the Analyse drawer; banner explains that code is not executed. Explore cards show `Preview` chip.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Unsupported syntax → low confidence + limitation. Parser error → 'Could not analyse: syntax not recognised near line N'.

## 11. Security and performance

Parsers run in the main thread only if < 20 ms typical; otherwise a Worker; input cap 50 kB.

## 12. Required tests and regression checks

- Fixtures for estimators (including expected low confidence cases); capability honesty test (no Run control present, `execution` absent); structure-rule tests; copy tests.
- Previous suites unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] No Run/execute control exists for Java or C++ (test).
- [ ] Analysis never exceeds `medium` confidence and always lists limitations.
- [ ] Explore labels both tracks `Preview`.
- [ ] `docs/EXECUTION_OPTIONS.md` exists and O-04 remains visibly open until the owner decides.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Truthfulness rules, sandbox contracts.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_26_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 26: Java and C++ tracks (decision-gated execution)`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 27 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
