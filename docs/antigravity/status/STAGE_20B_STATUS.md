# Stage 20b — Analysis Framework & UI — Status Report

Save as `docs/antigravity/status/STAGE_20B_STATUS.md`.

## 1. Header
- **Stage:** 20b · **Slug:** `runner-and-analysis-framework` · **Branch:** `stage-20b-runner-and-analysis-framework` · **Commit:** Uncommitted working tree (preserving Stage 16–19 baseline and Stage 20a–20b deliverables per explicit user instruction)
- **Date/time:** 2026-10-29T12:28:00+05:30 · **Agent/tool:** Antigravity (Google DeepMind)
- **Started from:** Clean branch creation from `stage-20a-runner-and-analysis-framework` preserving all uncommitted files.

## 2. Baseline before changes
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm test` | Test Files: 118 passed / Tests: 910 passed |
| `npm run build` | Built in 485ms; main JS 335.84 kB (gzip 104.63 kB) |

## 3a. Evidence split (owner UI/UX contract `09` §6)
- **Implemented:**
  - **Analysis Contracts & Data Types (`src/core/analysis/types.ts`):** `Confidence`, `ComplexityClass`, `AnalysisInput`, `ComplexityEstimate`, `Explanation`, `Bottleneck`, `OptimisationSuggestion`, `CorrectnessCheck`, `Comparison`, `AnalysisProvider`, `AnalysisError`, and `AnalysisState`.
  - **Complexity Ordering & Normalisation (`src/core/analysis/complexityOrder.ts`):** Pure ordering (`O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!)`), flexible normalisation, unknown class handling (returns `undefined`, never guessed), and spoken `aria-label` generation.
  - **Accessibility Component (`src/core/analysis/ComplexityDisplay.tsx`):** Renders Big-O classes using `<sup>` tags (e.g. `O(n<sup>2</sup>)`) with spoken `aria-label` attribute (e.g. `aria-label="O of n squared"`), directly fulfilling FC-02 and §13.
  - **Analysis Provider Registry (`src/core/analysis/registry.ts`):** `registerProvider`, `getProvider`, `hasProvider`, and `clearProviders`. Starts empty; exactly 0 providers registered in production builds at Stage 20.
  - **Estimate Validator (`src/core/analysis/validate.ts`):** `validateEstimate` enforcing required non-empty assumptions and limitations, `isFormalProof === false`, canonical Big-O classes, and source range boundaries against input files.
  - **Analysis Panel (`src/core/analysis/AnalysisPanel.tsx`):** Truthful unavailable states with no fake numbers when capability is missing or provider is not registered. Displays worst/average/best time complexity, auxiliary space, confidence chips (Low/Medium/High), method, assumptions, limitations, interactive bottleneck list with ranks, and mandatory disclaimer: "Heuristic estimate, not a formal proof."
  - **Optimisation Panel (`src/core/analysis/OptimisationPanel.tsx`):** Displays suggestions with rationale, expected time/space, risk level, and verification badge ("Verified on N cases" vs "Unverified suggestion"). Includes "Apply as new draft" action which creates a new draft file `solution-optimised` without overwriting the learner's original code.
  - **Comparison View (`src/core/analysis/ComparisonView.tsx`):** Before/After comparison table with ▲▼ text change indicators (not colour only), equivalence verification case results, and empirical benchmark timings table with environment note and disclaimer.
  - **State Schema v9 Migration (`src/state/types.ts`, `reducer.ts`, `storage.ts`, `migrations.ts`):** Incremented `SCHEMA_VERSION` to 9. Pure append-only `migrateV8toV9` migration initializing `analysis.history` (capped at 30 records). Save retry logic drops derived analysis history under quota pressure. Export excludes analysis history by default unless explicitly opted in.
  - **Practice Integration (`src/pages/Practice.tsx`):** Added "Analyse & improve" toolbar button (Decision Gate O-13), desktop drawer, mobile 5th tab, file switcher integration for `solution-optimised`, and bottleneck highlighting via editor diagnostics.
  - **Test-Only Fake Provider (`src/test/fakeProvider.ts`):** Isolated test provider implementing `AnalysisProvider` for unit and UI tests. Never registered in production builds.
  - **Automated Tests (`src/test/analysis.test.tsx`):** 25 tests covering ordering, validation, registry, UI display, copy rules, suggestion drafting, comparison deltas, and schema v9 persistence.
- **Functionally tested (tests/commands actually run):**
  - `npm test -- src/test/analysis.test.tsx`: 25/25 tests passed.
  - `npm test -- src/test/migrations.test.ts src/test/storage.test.ts`: 29/29 tests passed.
  - `npm test -- src/test/runner/workerHost.test.ts`: 14/14 tests passed.
  - `npm test -- src/test/regression.smoke.test.tsx`: 19/19 tests passed.
  - `npm test`: **119/119 test files passed (936/936 tests green, delta +26)**.
- **Visually inspected:**
  - Responsive layout verified across viewports (1280px desktop drawer, 768px tablet, 390px mobile 5th tab).
  - Empty unavailable card verified showing clear reason with zero placeholder numbers.
  - High-contrast and reduced-motion states respected.
- **Accessibility checked:**
  - Spoken `aria-label` generated for all complexity classes (tested in `analysis.test.tsx`).
  - Text-based ▲/▼ indicators used alongside colours in comparison view.
  - Full keyboard accessibility for explanation steps, bottlenecks, and drawer actions.
  - `npm test -- src/test/regression.smoke.test.tsx`: 0 serious or critical axe violations across all 8 core pages.
- **Not verified:**
  - Real language-specific analyzer execution (out of scope for Stage 20; deferred to Stage 23 JavaScript and Stage 25 Python).
- **Remaining defects or decisions:**
  - None. Decision Gate O-13 soft gate adopted: "Analyse and improve" (recorded in `docs/DECISIONS.md`).

## 3. Work completed
- **Items completed:** `PLT-06` (Complexity-analysis contracts, registry, and validation), `PLT-07` (Analysis and optimisation UI, comparison view, Practice integration), Schema v9 migration.
- **Files added:**
  - `src/core/analysis/types.ts`
  - `src/core/analysis/complexityOrder.ts`
  - `src/core/analysis/ComplexityDisplay.tsx`
  - `src/core/analysis/registry.ts`
  - `src/core/analysis/validate.ts`
  - `src/core/analysis/AnalysisPanel.tsx`
  - `src/core/analysis/OptimisationPanel.tsx`
  - `src/core/analysis/ComparisonView.tsx`
  - `src/core/analysis/analysis.css`
  - `src/test/fakeProvider.ts`
  - `src/test/analysis.test.tsx`
- **Files modified:**
  - `src/state/types.ts` (added `analysis: AnalysisState`)
  - `src/state/reducer.ts` (added `RECORD_ANALYSIS` and `CLEAR_ANALYSIS_HISTORY` actions)
  - `src/core/storage/migrations.ts` (added pure append-only `migrateV8toV9`)
  - `src/lib/storage.ts` (incremented `SCHEMA_VERSION` to 9, sanitized `analysis.history` capped at 30, quota retry drop)
  - `src/core/storage/exportImport.ts` (excluded `analysis.history` from default export)
  - `src/pages/Practice.tsx` (added Analyse & improve action, drawer, mobile tab, and bottleneck highlighting)
  - `src/test/migrations.test.ts` (updated to test schema v9 and `migrateV8toV9`)
  - `docs/DECISIONS.md` (recorded Decision Gate O-13)
  - `docs/TEST_PLAN.md` (documented runner and analysis test coverage)
  - `docs/WORKLOG.md` (logged Stage 20a and 20b deliverables)
- **Dependencies added:** None.
- **Schema version change:** v8 → v9.

## 4. Results after changes
| Command | Result |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm run test` | Test Files: 119 passed / Tests: 936 passed (previous: 910; delta: +26) |
| `npm run build` | Built in 716ms; main JS 335.98 kB (gzip 104.68 kB; delta +0.14 kB) |
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
| G8 Test coverage & quality | Yes | 119/119 test files passed (936/936 tests green; +26 tests added). |
| G9 Truthfulness & copy | Yes | Grep verified zero occurrences of forbidden words ("optimal", "guaranteed", "proven"); no fake providers in production; no partial numbers on error. |

## 7. Exit gate confirmation
- [x] Every acceptance box in §13 is ticked with evidence.
- [x] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` pass; regression smoke is green.
- [x] Bundle size (+0.14 kB) and 0 new dependencies recorded.
- [x] No placeholder, fake metric, dead control, or unverified claim remains.
- [x] Status report exists. Working tree remains intentionally uncommitted per explicit user instructions.
