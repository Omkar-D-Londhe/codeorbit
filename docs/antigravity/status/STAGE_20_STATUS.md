# Stage 20 — Execution runner and complexity-analysis & optimisation framework — Status Report

Save as `docs/antigravity/status/STAGE_20_STATUS.md`.

## 1. Header
- **Stage:** 20 · **Slug:** `runner-and-analysis-framework` · **Branch:** `stage-20b-runner-and-analysis-framework` · **Commit:** Uncommitted working tree (preserving Stage 16–19 baseline and Stage 20a–20b deliverables per explicit user instruction)
- **Date/time:** 2026-10-29T12:28:00+05:30 · **Agent/tool:** Antigravity (Google DeepMind)
- **Sub-stages completed:**
  - **Stage 20a:** Worker Runner Host (`PLT-05`) — see `STAGE_20A_STATUS.md`
  - **Stage 20b:** Analysis Framework & UI (`PLT-06`, `PLT-07`) — see `STAGE_20B_STATUS.md`

## 2. Baseline before changes (prior to Stage 20)
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm test` | Test Files: 117 passed / Tests: 896 passed |
| `npm run build` | Built in 1.55s; main JS 335.84 kB (gzip 104.63 kB) |

## 3. Deliverables Summary
### Stage 20a: Worker Runner Host (`PLT-05`)
- Implemented `WorkerRunnerHost` class implementing `CodeRunner` (`kind: 'worker-exec'`) in `src/core/runner/workerHost.ts`.
- Created isolated module Web Worker script in `src/core/runner/workerEntry.ts` with no DOM or network access.
- Implemented static sandbox security policy checker `checkWorkerSandboxPolicy()` in `src/core/runner/sandboxPolicy.ts`.
- Enforced hard timeout termination (default 3 s), output byte capping (64 KiB), AbortSignal support, and bidirectional message schema validation.
- Unit and integration tests in `src/test/runner/workerHost.test.ts` (14 tests).

### Stage 20b: Analysis Framework & UI (`PLT-06`, `PLT-07`)
- **Analysis Contracts (`src/core/analysis/types.ts`):** Complete data types conforming to `01` §B5.
- **Complexity Ordering (`src/core/analysis/complexityOrder.ts`):** Pure Big-O ordering sequence, normalisation, and spoken `aria-label` generator.
- **Accessibility Rendering (`src/core/analysis/ComplexityDisplay.tsx`):** Big-O classes render with `<sup>` tags (e.g. `O(n<sup>2</sup>)`) and spoken `aria-label` attributes (e.g. `aria-label="O of n squared"`).
- **Provider Registry (`src/core/analysis/registry.ts`):** Honest registry with zero providers in production builds.
- **Estimate Validation (`src/core/analysis/validate.ts`):** Rejects `isFormalProof: true`, empty assumptions, empty limitations, unknown classes, and out-of-bounds ranges.
- **Analysis UI (`src/core/analysis/AnalysisPanel.tsx`):** Honest unavailable state with no fake numbers; displays time, auxiliary space, confidence chip, method, assumptions, limitations, interactive bottlenecks, and heuristic disclaimer.
- **Optimisation Panel (`src/core/analysis/OptimisationPanel.tsx`):** Suggestions with expected effect, risk, verification badges, and "Apply as new draft" preserving learner code.
- **Comparison View (`src/core/analysis/ComparisonView.tsx`):** Before/After comparison table with ▲▼ text indicators and empirical benchmark measurements with environment note.
- **Schema v9 Migration (`src/lib/storage.ts`, `src/core/storage/migrations.ts`):** `analysis.history` capped at 30 items; dropped under quota pressure; excluded from default export.
- **Practice Workspace Integration (`src/pages/Practice.tsx`):** "Analyse & improve" toolbar button (Decision Gate O-13), drawer, mobile 5th tab, file switcher integration for `solution-optimised`, and bottleneck highlighting.
- **Test-Only Fake Provider (`src/test/fakeProvider.ts`):** Isolated test provider exclusively used in tests.
- **Automated Tests (`src/test/analysis.test.tsx`):** 25 tests covering all Stage 20b requirements.

## 4. Results after changes
| Command | Result |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm test` | Test Files: 119 passed / Tests: 936 passed (previous: 896; delta: +40) |
| `npm run build` | Built in 716ms; main JS 335.98 kB (gzip 104.68 kB; total delta +0.14 kB) |
| `npm audit --omit=dev` | 0 vulnerabilities |

## 5. Acceptance criteria evidence (Stage 20 §13)
| Criterion | Met? | Evidence |
|---|---|---|
| Complexity classes render with `<sup>` (e.g. O(n<sup>2</sup>)) and carry a spoken form (`aria-label` "O of n squared") | Met | Tested in `src/test/analysis.test.tsx`: `<ComplexityDisplay value="O(n^2)" />` renders `<span>O(n<sup>2</sup>)</span>` with `aria-label="O of n squared"`. |
| Infinite-loop code in the test engine is killed within timeout + 250 ms and the UI stays responsive | Met | Tested in `src/test/runner/workerHost.test.ts`: Worker terminated in 214ms (200ms timeout) while main thread executed $\ge 2$ ticks. |
| In the real app at this stage no complexity numbers appear anywhere | Met | Tested in `src/test/analysis.test.tsx`: registry has zero providers in production; AnalysisPanel renders honest unavailable state with no placeholder or fake numbers. |
| Invalid or assumption-free estimates are rejected | Met | Tested in `src/test/analysis.test.tsx`: `validateEstimate` rejects `isFormalProof: true`, empty assumptions, empty limitations, unknown classes, and out-of-bounds ranges. |
| UI always shows method, confidence, assumptions, limitations and the heuristic disclaimer | Met | Tested in `src/test/analysis.test.tsx`: `AnalysisPanel` renders all 5 elements with exact copy "Heuristic estimate, not a formal proof." |
| Applying a suggestion never overwrites the learner's code | Met | Tested in `src/test/analysis.test.tsx` and implemented in `src/pages/Practice.tsx`: creates a separate draft `solution-optimised`, leaving the original file completely untouched. |

## 6. Global gates (`08`)
| Gate | Applies? | Result / evidence |
|---|---|---|
| G1 Code and asset hygiene | Yes | Clean TypeScript (0 errors), clean ESLint (0 warnings), 0 unapproved dependencies, no literal `'html'` in `src/core/**` or `src/pages/**`. |
| G2 Regression smoke | Yes | `npm test -- src/test/regression.smoke.test.tsx`: 19/19 tests passed. |
| G3 Cross-browser / viewport | Yes | Responsive at 1280px (drawer), 768px, and 390px (5th mobile tab). |
| G4 Accessibility | Yes | Spoken `aria-label` on math, keyboard navigation, text delta arrows (▲/▼), 0 serious/critical axe violations. |
| G5 Boundaries & storage | Yes | Schema v9 append-only migration; quota drop logic verified; no secrets in storage. |
| G6 State and identity | Yes | Persistence pure; `analysis.history` capped at 30 items; draft preservation guaranteed. |
| G7 Performance & bundle | Yes | Production build built in 716ms; JS bundle 335.98 kB (gzip 104.68 kB; +0.14 kB delta). |
| G8 Test coverage & quality | Yes | 119/119 test files passed (936/936 tests green; +40 tests added across Stage 20). |
| G9 Truthfulness & copy | Yes | Grep verified zero occurrences of forbidden words ("optimal", "guaranteed", "proven"); no fake providers in production; no partial numbers on error. |

## 7. Exit gate confirmation
- [x] Every acceptance box in §13 is ticked with evidence.
- [x] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` pass; regression smoke is green.
- [x] Bundle size (+0.14 kB) and 0 new dependencies recorded.
- [x] No placeholder, fake metric, dead control, or unverified claim remains.
- [x] Status report exists. Working tree remains intentionally uncommitted per explicit user instructions.
