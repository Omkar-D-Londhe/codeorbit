# Stage 25 — Python track (Pyodide in a Worker) with analysis provider

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

> **Decision gate (HARD — the gated capability is not built until the owner records a yes in `07`):** O-03 (Pyodide download) is a hard gate for Part B / sub-stage 25b only. Part A / 25a is ungated and ships the truthful `preview` state; stop after 25a if O-03 is not a recorded yes. Stage 26 depends on 25a only.

## 1. Stage identity, objective and scope

**Stage:** 25 · **Slug:** `python-track` · **Branch:** `stage-25-python-track`

**Objective.** Add Python as the first non-web language in two parts. **Part A (ungated, sub-stage 25a):** Python curriculum, lessons, quizzes, CodeMirror Python editing and structure-rule challenges ('structure check — your code is not run'), availability `preview`, no Run control, no complexity numbers. **Part B (HARD gate O-03, sub-stage 25b):** a self-hosted Pyodide runtime inside the Worker sandbox, execution-graded challenges and a Python `ast`-based analysis provider; built only after the owner records a yes for the ~10 MB self-hosted download.

**In scope**
- **Part A (25a, ungated):** Python lessons (basics, control flow, functions, lists/dicts/sets, comprehensions, recursion, testing basics, data structures and algorithm basics), quizzes, challenges graded by **structure rules** (non-executing, labelled), CodeMirror Python language support (lazy), track registered as `preview` with capabilities `lessons, quizzes, practice, diagnostics` (no `execution`, no `complexity`); the non-executing structure-rule kind it introduces is reused by Stage 26.
- **Part B (25b, HARD gate O-03):** Pyodide self-hosted in a Worker, challenges with visible tests executed in the sandbox, console, `ast`-based analysis provider with fixtures, optimisation suggestions with equivalence verification, offline caching of the runtime, availability upgraded to `available` only when every listed capability works.

**Out of scope**
- Third-party packages beyond the standard library; file/network I/O (blocked).

## 2. Prerequisites and dependencies

- Stage 24 exit gate green.
- 25a needs no owner decision. 25b needs **O-03 = yes recorded in `07`**; without it, stop after 25a and say so in the report.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Platform / reference / concept items:** `PLT-09` Python analysis provider
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-21, FC-22, FC-23, FC-30 (language-neutral concepts demonstrated in Python)

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Worker sandbox rules (L-07); analysis truthfulness rules (L-09).

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| public/ (or src/assets) pyodide/ | Self-hosted Pyodide core files (pinned version) with licence notice; excluded from first-load; cached by the service worker on first Python use. |
| src/core/runner/workerHost.ts | Support engines that need a longer warm-up: separate `ready` timeout (20 s) vs run timeout (3 s); worker reuse within a Practice session **only** for warm-up, with module state reset per run (`runPython` in a fresh namespace). |
| src/app/registerTracks.ts | Register `python` and its provider. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/tracks/python/{track,curriculum,lessons,quizzes,challenges,snippets,achievements,concepts}.ts | Content. |
| src/tracks/python/runner.ts, engineWorker.ts | Pyodide engine: stdout/stderr capture, restricted modules (`os`, `subprocess`, `socket`, `urllib` blocked via import hook), `input()` mapped to provided stdin, recursion limit, output cap, interrupt via worker terminate. |
| src/tracks/python/analysis/provider.ts | Runs Python's `ast` **inside Pyodide** (no extra parser) to extract loop nesting, recursion, comprehension costs, known built-in costs (`sorted` O(n log n), `in` on list O(n) vs set O(1) average, `list.append` O(1) amortised, slicing O(k)), auxiliary space; same confidence/limitations model; fixtures ≥ 30. |
| src/tracks/python/analysis/equivalence.ts | Seeded input generation and test-case verification. |
| src/tracks/python/vendor/DEPENDENCY.md | Pyodide version, checksum, update procedure. |

## 7. Implementation steps (execute in order)

1. **25a:** author the Python curriculum, lessons and quizzes; add structure-rule challenges (rule kinds such as 'defines a function named X with N parameters', 'contains a loop', 'uses a comprehension') labelled 'structure check — your code is not run'; wire the lazy CodeMirror Python language; register `python` as `preview`; Practice shows no Run control and Analyse shows 'Complexity analysis is not available for Python yet'; tests, visual QA, docs, status report `STAGE_25a_STATUS.md`. **Then check `07`: if O-03 is not a recorded yes, STOP here.**
2. **25b (only with O-03 = yes):** Self-host Pyodide with checksum test; lazy load with progress UI ('Preparing Python… 40%').
3. Engine worker with import blocking and limits; tests: `import os` blocked message, infinite loop killed, memory-heavy allocation limited (cap list size via output/time), unicode output, stdin.
4. Author curriculum/challenges/tests mirroring the JS track structure; unit-test style cases.
5. Analysis provider with ≥ 30 labelled fixtures, written first; unsupported → low confidence; record precision.
6. Optimisation suggestions limited to verified patterns (`list` membership → `set`, nested loops over sorted data → two pointers when applicable) requiring equivalence checks.
7. Offline: add Pyodide assets to the service worker runtime cache (opt-in size warning); verify offline Python run after first use.
8. Atlas/achievements; QA; docs (status report `STAGE_25b_STATUS.md`).

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

### 7a. Sub-stages

This stage is delivered as **required** sub-stages. Each has its own branch, status report and exit gate; do not start the next sub-stage until the previous one is green and accepted by the owner where a gate says so.

| Sub-stage | Title | Scope (from §1/§7) | Sub-stage exit gate |
|---|---|---|---|
| 25a | Python content and structure-check practice (ungated) | Curriculum, lessons, quizzes, structure-rule challenges, Python editor language, `preview` availability, no Run, no analysis numbers | 25a acceptance boxes green; Stage 26 may start even if 25b waits |
| 25b | Pyodide execution, analysis provider, offline cache (HARD gate O-03) | Self-hosted Pyodide, Worker engine, execution tests, `ast` provider + suggestions, offline caching, `available` upgrade | Only after O-03 = yes: 25b acceptance boxes green |

## 8. Component behaviour, state, data contracts and integration

`TrackModule.runner = pythonRunner` (kind `worker-exec`), `language.editorLanguageId = 'python'` (CodeMirror `@codemirror/lang-python`, lazy). Same `AnalysisProvider` contract as Stage 20/23; `provider.id = 'py-ast-v1'`.

## 9. UI/UX expectations

Same Practice layout as JS (console + tests panels). First Python use shows a size notice ('About 10 MB, downloaded once, then works offline').

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Download failure → retry; offline without cache → clear message. Pyodide init timeout → error with 'Try again'. Blocked import → friendly explanation that file/network access is unavailable.

## 11. Security and performance

Heavy assets lazy and cached; Worker memory/time limits; no network from learner code; no persistent Python state between runs.

## 12. Required tests and regression checks

- 25a: structure-rule tests; capability honesty (no Run control, no `execution`/`complexity` capability, truthful 'not available' copy); track structure/mastery tests; editor language loads lazily.
- 25b: engine tests (limits, blocked modules, determinism); provider fixtures; equivalence tests; offline cache test (browser); copy tests.
- Previous suites unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] **25a:** Python is `preview`; no Run control exists; challenges are labelled as structure checks; no complexity numbers are shown; lessons, quizzes and structure-rule practice work end to end.
- [ ] **25b (only with O-03 yes):** Python runs only inside the Worker with limits; runaway code is killed.
- [ ] **25b:** Blocked modules cannot be imported (test).
- [ ] **25b:** Analysis honours the truthfulness contract with measured fixture precision recorded.
- [ ] **25b:** Asset size and offline behaviour documented and verified (or marked NOT VERIFIED with reason).
- [ ] **25b:** Track becomes `available` only if every listed capability works; otherwise it stays `preview`.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Other tracks, platform contracts (extend only additively).
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_25_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 25: Python track (Pyodide in a Worker) with analysis provider`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 26 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
