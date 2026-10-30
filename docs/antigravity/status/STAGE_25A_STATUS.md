# Stage 25a — Python Curriculum, Safe Preview & Non-Executing Structural Validation — Status Report

Save as `docs/antigravity/status/STAGE_25A_STATUS.md`.

## 1. Header
- **Stage:** 25a · **Slug:** `python-track` · **Branch:** `stage-25a-python-track` · **Commit:** Uncommitted working tree (preserving Stages 16–24 baseline and Stage 25a deliverables per explicit user instructions)
- **Date/time:** 2026-10-29T18:55:00+05:30 · **Agent/tool:** Antigravity 2.0 (Google DeepMind)
- **Started from:** dedicated branch `stage-25a-python-track` branched from `stage-24-bootstrap-track` preserving all uncommitted changes intact.

## 2. Baseline before changes (prior to Stage 25a)
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm test` | Test Files: 133 passed / Tests: 1,078 passed |
| `npm run build` | Built in 838ms |

## 3a. Evidence split (owner UI/UX contract `09` §6)
- **Implemented:**
  - **Ungated Sub-Stage 25a Implementation (§1, §7.1, §7a, §8):**
    - Authored comprehensive Python curriculum across 8 topics and 4 groups (`py-foundations`, `py-collections`, `py-advanced-patterns`, `py-engineering`) forming a strictly acyclic DAG.
    - Authored 8 lessons (`src/tracks/python/lessons.ts`) with learning objectives, 3–5 key takeaways, vocabulary definitions (`terms`), interactive demos, and language-neutral comparisons.
    - Authored 8 quizzes (`src/tracks/python/quizzes.ts`) with 3 choice questions each (24 questions total) testing Python syntax, typing, scope, collections, and testing conventions.
    - Authored 8 challenges (`src/tracks/python/challenges.ts`) graded entirely by declarative, non-executing structural rules with failing starters, 100% verified passing solutions, and exactly 3 hints (conceptual $\to$ structural $\to$ specific).
    - Every challenge displays the mandatory label: `notice: 'Structure check — your code is not run'`.
    - Authored 5 achievements (`src/tracks/python/achievements.ts`) conforming to `AchievementDef`.
    - Authored 5 reference snippets (`src/tracks/python/snippets.ts`) for f-strings, dictionary frequencies, comprehensions, binary search, and defensive exceptions.
    - Registered `pythonTrack` in `src/app/registerTracks.ts` with `availability: 'preview'` and truthful capabilities `['lessons', 'quizzes', 'practice', 'diagnostics', 'snippets']` (explicitly omitting `execution`, `complexity`, and `optimisation`).
  - **Deterministic Non-Executing Structural Validation (§1, §6, §7.1):**
    - Built `src/tracks/python/validators/index.ts` implementing static checks:
      1. `definesFunction`: validates function name, parameter counts, parameter names, and returns statement presence.
      2. `containsLoop`: validates `for` and `while` loops, and checks nesting depth.
      3. `usesComprehension`: validates list, dict, and set comprehensions.
      4. `usesRecursion`: verifies that a function invokes itself within its body.
      5. `declaresClass`: validates class headers and member methods.
      6. `usesConstruct`: validates language constructs (`if-elif-else`, `try-except`, `with`, `lambda`, `docstring`, `assert`).
      7. `pythonSourceMatches`: checks safe regex/string patterns.
      8. `blocksImport`: verifies blocked modules (`os`, `subprocess`, `socket`, `urllib`, `sys`, `shutil`).
    - Integrated with `evaluateRule` and `checkRequirements` in `src/lib/validators.ts`.
    - Factory function `createPythonValidator(requirements)`.
    - Safe line/column locator `findPythonRuleLocation` for editor diagnostic highlighting.
    - Robust protections: comment stripping (`stripComments`), ReDoS-safe linear expressions, line clamping (1,000 lines), and size limits (100 KB).
  - **Absence of Code Execution & Safe Preview UI (§1, §7.1, §9, §11, §13):**
    - Zero execution of learner Python code: no `eval`, `Function`, Web Worker, Pyodide, Node, or subprocess.
    - In `src/pages/Practice.tsx`, toolbar Run button is completely hidden on the Python track (`showRun` is false).
    - Opening Python practice renders a dedicated, safe **Structure Preview** pane:
      - Header: "Structure Preview" · "Structure check mode — your code is not run"
      - Badges: `<span className="chip chip--sm">Non-Executing</span>` · `<span className="muted small">Python 3</span>`
      - Explanatory copy: "Python code is inspected using static structural rules. Code execution and runtime evaluation are not active in this preview."
      - Read-only formatted code representation.
    - Analyse button shows truthful tooltip and empty state: "Complexity analysis is not available for Python yet."
  - **CodeMirror Python Language Support (§1, §7.1, §8):**
    - Installed official `@codemirror/lang-python` dependency.
    - In `src/core/editor/codemirrorAdapter.ts`, language support is dynamically code-split and loaded lazily via `import('@codemirror/lang-python')`, keeping the main bundle lean.
    - Updated `<CodeEditor>` instances in `Practice.tsx` to pass `language={currentLanguage}`.
  - **Concept Atlas & Compliance (§3, §13):**
    - Mapped language-neutral concepts FC-21, FC-22, FC-23, and FC-30 to Python track topics in `src/core/concepts/concepts.ts`.
    - Regenerated `docs/ASSESSMENT_COMPLIANCE.md` (32 concepts verified).
  - **Explore & Navigation Integration:**
    - Updated `src/pages/Explore.tsx` to display Python with a `<span className="badge badge--preview">Preview</span>` and `<span className="badge badge--subtle">Structure check mode</span>` pill with "Open track" capability.
    - Updated `src/data/curriculum.ts` and `src/pages/Track.tsx` to permit exploring preview tracks.
- **Functionally tested:**
  - `src/test/pythonTrack.test.ts` (9 tests passing): track metadata, DAG acyclicity, 8 lessons, 8 quizzes (24 questions), 8 challenges (100% starters fail, 100% solutions pass), notice on all challenges, 5 achievements, 5 snippets, and FC-21/FC-22/FC-23/FC-30 Concept Atlas mappings.
  - `src/test/pythonValidators.test.ts` (21 tests passing): `stripComments`, `definesFunction`, `containsLoop`, `usesComprehension`, `usesRecursion`, `usesConstruct`, `checkSourceMatches`, blocked imports (`os`, `subprocess`), malformed syntax recovery, oversized files (>10,000 lines), and `createPythonValidator`.
  - `src/test/pythonNoExecution.test.tsx` (3 tests passing): verified zero execution on infinite loops or malicious payloads, verified zero calls to Web Worker during checkChallenge, verified absence of Run button, and verified Structure Preview pane rendering.
  - `src/test/concepts.honesty.test.tsx` (28 tests passing).
  - `src/test/htmlTrack.test.ts` (4 tests passing).
  - `src/test/emptyTracks.test.tsx` (3 tests passing).
  - `src/test/app.test.tsx` (40 tests passing).
  - `src/test/regression.smoke.test.tsx` (19 tests passing): 9 G2 regression smoke items and G4 axe checks across 8 core pages.
  - Full test suite: **136 test files passed (1,111 tests passing)**.
- **Accessibility checked:**
  - Automated axe checks across all core pages: 0 serious, 0 critical violations.
  - Practice toolbar respects ARIA toolbar roles.
  - Structure Preview uses appropriate semantics (`role="status"`, heading landmarks).
  - CodeMirror editor receives accessible `aria-label` describing the active language.
- **Decision Gate Status:**
  - **Approval Gate O-03 (Pyodide Download & Worker Execution):** **HARD GATE — NOT APPROVED / PENDING OWNER RESOLUTION**.
  - In strict compliance with §1, §2, §7.1, and the gate policy in `07_CONFLICTS_AND_DECISIONS.md`:
    - Pyodide is NOT downloaded, vendored, or executed.
    - Stage 25b is NOT implemented.
    - Python execution and execution-dependent analysis remain truthfully unavailable.
- **Not verified:**
  - Stage 25b (Pyodide runtime execution and `ast`-based analysis provider) — blocked pending owner approval of O-03.
  - Stage 26 (Java/C++ track) — not started.
- **Remaining decisions:**
  - Owner decision required on O-03 before Stage 25b can be authorized.

## 4. Work completed
- Items completed: Stage 25a curriculum, safe preview, structural validators, and Concept Atlas mappings for FC-21, FC-22, FC-23, FC-30.
- Files added:
  - `src/tracks/python/curriculum.ts`
  - `src/tracks/python/lessons.ts`
  - `src/tracks/python/quizzes.ts`
  - `src/tracks/python/challenges.ts`
  - `src/tracks/python/achievements.ts`
  - `src/tracks/python/snippets.ts`
  - `src/tracks/python/track.ts`
  - `src/tracks/python/validators/index.ts`
  - `src/test/pythonTrack.test.ts`
  - `src/test/pythonValidators.test.ts`
  - `src/test/pythonNoExecution.test.tsx`
- Files modified:
  - `package.json` & `package-lock.json` (`@codemirror/lang-python`)
  - `src/app/registerTracks.ts`
  - `src/core/concepts/concepts.ts`
  - `src/core/editor/codemirrorAdapter.ts`
  - `src/core/analysis/AnalysisPanel.tsx`
  - `src/data/types.ts`
  - `src/data/curriculum.ts`
  - `src/lib/validators.ts`
  - `src/pages/Practice.tsx`
  - `src/pages/Explore.tsx`
  - `src/pages/Track.tsx`
  - `src/test/concepts.honesty.test.tsx`
  - `docs/ASSESSMENT_COMPLIANCE.md`

## 5. Verification results
| Command | Result |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings; zero forbidden `'html'` occurrences) |
| `npm test` | **136 test files passed / 1,111 tests passed** (0 failed) |
| `npm run build` | Built in 775ms |
| `npx vitest run src/test/regression.smoke.test.tsx` | 19 / 19 tests passed (0 failed) |

## 6. Exit gate evaluation
- [x] Python is `preview`; no Run control exists; challenges are labelled as structure checks; no complexity numbers are shown; lessons, quizzes and structure-rule practice work end to end (§13).
- [x] Python code is NOT executed in any runtime during Stage 25a.
- [x] O-03 is recorded as PENDING OWNER APPROVAL (HARD GATE) and Stage 25b is paused.
- [x] Typecheck, lint, test, and build all pass with zero errors.
- [x] Working tree safely preserved on branch `stage-25a-python-track` without committing, pushing, or tagging.
