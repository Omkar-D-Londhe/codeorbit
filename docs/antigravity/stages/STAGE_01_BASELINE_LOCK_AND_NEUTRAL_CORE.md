# Stage 01 — Baseline lock, reference snapshot and language-neutral core

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 01 · **Slug:** `baseline-lock-and-neutral-core` · **Branch:** `stage-01-baseline-lock-and-neutral-core`

**Objective.** Freeze a verified baseline of the ORIGINAL project, add the test/QA tooling every later stage needs, and remove the hard-coded 'html' coupling so pages ask a `TrackRegistry` instead — without moving or rewriting working code.

**In scope**
- Record baseline results (typecheck, lint, 176 tests, build size 388.53 kB / 121.33 kB gzip) in `docs/antigravity/status/STAGE_01_STATUS.md`.
- Create a branch, copy `docs/antigravity/` (this pack, including `reference/`) into the repo; the `reference/` folder is a **read-only snapshot** of the reference ZIP — never imported by `src/`.
- `TrackRegistry` + `TrackModule` contract (see `01` Part B §B2) and an `html` `TrackModule` that WRAPS the existing `src/data/*` content (no file moves).
- Replace literal `'html'` in `Home.tsx`, `Progress.tsx`, `Explore.tsx`, `lib/routes.ts` (`trackPath` default) and `lib/progress.ts` (`nextAction` default) with registry lookups.
- Test tooling: `vitest-axe`, a committed regression-smoke test file, a real browser smoke script (`npm run test:e2e`, Playwright) replacing the reference's unreproducible claims.
- Concept registry skeleton `src/core/concepts/concepts.ts` (types only plus an empty typed array; filled from Stage 19).
- Update `AGENTS.md`, `README.md`, `DESIGN.md` wording: language-neutral platform; HTML is the first optional track.

**Out of scope**
- No visual changes, no new features, no data/storage changes, no file moves, no dependency other than the test tooling.

## 2. Prerequisites and dependencies

- None. This is the first stage. Read `ANTIGRAVITY_EXECUTION_GUIDE.md` and `00`, `01`, `05`, `07`, `08` first.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Platform / reference / concept items:** `PLT-01` Language-neutral TrackRegistry / TrackModule, `PLT-02` Concept registry skeleton, `PLT-04` Regression smoke, axe and browser smoke tooling
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-01, FC-09, FC-21, FC-32 (baseline only; Atlas entries come in Stage 19)

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- `src/lib/orbitGeometry.ts`, `src/components/orbit/*`, `src/components/CodeEditor.tsx`, `SandboxedPreview.tsx`, `src/lib/preview.ts`, `src/lib/validators.ts`, `src/lib/storage.ts`, `src/state/*`, `src/data/*`, all 8 existing test files and their 176 tests. The legacy arc orbit (`orbitGeometry.ts`, `components/orbit/*`) stays untouched here; it is replaced only in Stage 10b after owner approval O-15 (`10` §17).

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/pages/Home.tsx, Progress.tsx, Explore.tsx | Get the active track (selected or first `available`) from the registry; no `'html'` literals. Behaviour and markup unchanged. |
| src/lib/routes.ts | `trackPath(technologyId: string)` — parameter required; callers pass the registry id. |
| src/lib/progress.ts | `nextAction(state, technologyId)` and `trackProgress` take a required id; add no behaviour. |
| src/data/curriculum.ts | Unchanged content. Export `HTML_TECH_ID` only for the html track file; remove other imports of it. |
| eslint.config.js | Add `no-restricted-syntax` rule: string literal `'html'` is forbidden in `src/pages/**`, `src/components/**`, `src/core/**`. |
| package.json | Add devDependencies `vitest-axe` and `@playwright/test`; scripts `test:e2e` (Playwright smoke against `vite preview`). |
| AGENTS.md, README.md, DESIGN.md | Replace 'frontend learning studio / HTML is the only complete track' with the language-neutral wording from `01` Part A §A2; note the reference snapshot. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/content/types.ts | `TrackModule`, `LanguageDescriptor`, `CapabilityId`, `Topic`/`Lesson`/`Quiz` re-exports, `ChallengeV2` (files[]) per `01` §B2. |
| src/core/content/registry.ts | `registerTrack`, `getTracks`, `getTrack`, `getAvailableTracks`, `defaultTrackId`; pure, no React. |
| src/core/content/challengeAdapter.ts | `toChallengeV2(challenge)`: maps `starterCode/solutionCode` to `files[]`/`solution.files[]`; used by later stages, no behaviour change now. |
| src/tracks/html/track.ts | The `html` `TrackModule` built from `data/curriculum`, `lessons`, `quizzes`, `challenges`, `validators`; capabilities `['lessons','quizzes','practice','preview','diagnostics']`; availability `'available'`; planned tracks (css, javascript, bootstrap, angular) registered as `planned`. |
| src/app/registerTracks.ts | Imported once from `main.tsx`; registers all tracks. |
| src/core/concepts/concepts.ts | `ConceptEntry` type (see `06` §4) and `export const concepts: ConceptEntry[] = []`. |
| src/test/a11y.ts | `expectNoA11yViolations(container)` wrapper around `vitest-axe`. |
| src/test/regression.smoke.test.tsx | Automates regression smoke items 1–9 of `08` G2. |
| e2e/smoke.spec.ts, playwright.config.ts | Real browser smoke: load Home at 1280/820/390 px, no horizontal overflow, Learning Orbit selection by click and keyboard, lesson complete persists after reload, preview iframe has `sandbox=""`. |
| docs/antigravity/status/ | Folder for stage status reports. |

## 7. Implementation steps (execute in order)

1. Inspect: `git status`, `git log --oneline -5`; run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`; record numbers. Expect 8 test files / 176 tests passing; if not, stop and report.
2. Create branch `stage-01-baseline-neutral-core`; add this pack under `docs/antigravity/`; commit as `Stage 01: add Antigravity pack`.
3. Add `src/core/content/types.ts` and `registry.ts` with unit tests (`registry.test.ts`): registering twice with the same id throws; `getAvailableTracks` filters; `defaultTrackId` is the first `available`.
4. Add `src/tracks/html/track.ts` wrapping existing exports; add `registerTracks.ts` and import it in `main.tsx` before render. Planned tracks keep their current descriptions from `curriculum.ts` (`css`, `javascript`, `bootstrap`, `angular`).
5. Refactor the five files listed above to use the registry. After each file run `npm run test`; the existing integration tests must pass unchanged.
6. Add the ESLint restriction and fix any violation it reveals in the allowed folders.
7. Add `challengeAdapter.ts` + test proving every existing challenge converts and round-trips (`files[0].content === starterCode`).
8. Install `vitest-axe`; add `a11y.ts`; write `regression.smoke.test.tsx` covering the 9 smoke items; add axe checks for Home, Track, Lesson, Quiz, Practice, Progress, Review, Explore.
9. Install Playwright (`npm i -D @playwright/test`; `npx playwright install chromium`), write `e2e/smoke.spec.ts`; run against `npm run build && npx vite preview`. If browsers cannot be installed, mark e2e **NOT VERIFIED** and keep the script.
10. Update docs; write the baseline numbers into `docs/WORKLOG.md`; fill `STAGE_STATUS_TEMPLATE.md`.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

```ts
// src/core/content/registry.ts
export function registerTrack(track: TrackModule): void          // throws on duplicate id
export function getTrack(id: string): TrackModule | undefined
export function getTracks(): readonly TrackModule[]               // registration order
export function getAvailableTracks(): readonly TrackModule[]      // availability === 'available'
export function defaultTrackId(): string | undefined
```
Pages obtain the track via `useTrack(trackId?)` (`src/core/content/useTrack.ts`): explicit id from the route → `state.selectedTopicId`'s track → `defaultTrackId()`. If no track is available, pages render the empty state (below), never crash.

## 9. UI/UX expectations

No visual change. Home, Track, Explore, Progress must render pixel-identical results for an HTML-only registry (compare DOM snapshots in the smoke test).

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

No available track: Home and Explore show `EmptyState` titled "No learning tracks are available yet" with no actions. Unknown `:technologyId` redirects to `/explore` (existing behaviour kept).

## 11. Security and performance

No new runtime dependencies. Playwright and vitest-axe are dev-only. Registry is synchronous; no bundle growth expected (< 2 kB).

## 12. Required tests and regression checks

- `registry.test.ts`, `challengeAdapter.test.ts`, `htmlTrack.test.ts` (ids unique, every topic has lesson/quiz/challenge, capabilities honest).
- `regression.smoke.test.tsx` (8 pages + storage recovery + preview attributes).
- ESLint rule verified with a fixture that must fail.
- Existing 176 tests still pass.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] All pre-existing tests pass (≥ 176) plus the new ones; typecheck, lint, build green; build size within +5 kB of baseline.
- [ ] `grep -rn "'html'" src/pages src/components src/core` returns nothing (enforced by lint).
- [ ] Home, Track, Progress, Explore render from the registry; with the html track removed from the registry they show the empty state without throwing (test).
- [ ] `docs/antigravity/reference/` exists in the repo and is not imported anywhere (lint/`tsconfig` exclude it).
- [ ] axe reports no serious/critical violations on the 8 pages.
- [ ] `AGENTS.md`/`README.md`/`DESIGN.md` describe CodeOrbit as language-neutral with HTML as the first optional track.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

Nothing is copied into `src/` in this stage. The `reference/` snapshot is added to docs so later stages can read it. Decision D17/D18 in `05` (HTML coupling must not be inherited).

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Orbit geometry/components behaviour, preview sandbox/CSP, storage schema/migrations, reducer actions, tokens and styles, existing test assertions.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_01_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 01: Baseline lock, reference snapshot and language-neutral core`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 02 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
