# Stage 18 — Spaced Repetition, Custom Challenges, Peer Snapshots, Voice Read & Portfolio Export — Consolidated Status Report

Save as `docs/antigravity/status/STAGE_18_STATUS.md`.

## 1. Header
- Stage: 18 (Consolidated: 18a + 18b) · Branch: `stage-18b-learning-science-authoring` · Baseline Commit: `455bacbdc383a8356421758f0b04ebbd14cfb296`
- Date/time: 2026-10-28 · Agent/tool: Antigravity (Google DeepMind)
- Schema Version: strictly maintained at `SCHEMA_VERSION = 8` (one migration v7→v8, adding `review` and `custom.challenges`).

## 2. Verification Summary Across Quality Gates
| Gate / Command | Result | Notes |
|---|---|---|
| `npm run typecheck` (`tsc -b --noEmit`) | **PASS (0 errors)** | Strict TypeScript validation across all authoring, sharing, and portfolio modules |
| `npm run lint` (`eslint .`) | **PASS (0 errors, 0 warnings)** | Adheres to strict architectural no-restricted-syntax rules |
| `npm test -- [Stage 18 suite]` | **PASS (74 tests / 8 suites)** | `spaced.test.ts`, `dueReview.test.tsx`, `voiceRead.test.tsx`, `snapshot.test.ts`, `portfolio.test.ts`, `challengeCreator.test.tsx`, `migrations.test.ts`, `storage.test.ts` |
| `npm test` (full repository suite) | **PASS (868 tests / 116 suites)** | 100% green across full test suite; verified G2 regression smoke suite and optimistic UI rollback |
| `npm run build` (`vite build`) | **PASS (built in 464ms)** | Clean production bundle with code-split lazy routes for `ChallengeCreator` (20.6 kB), `Share` (4.85 kB), `Review` (20.8 kB) |

## 2a. Regression Remediation
- **Issue:** Legacy review tests (`app.test.tsx`, `optimisticUi.test.tsx`, `regression.smoke.test.tsx`) expected Error Notebook entries to appear directly on `/review`. Unconditional defaulting to `'due'` and static mounting of hidden panels caused duplicate topic text matches and hidden DOM elements.
- **Remediation:** In [`src/pages/Review.tsx`](file:///c:/Users/omkar/OneDrive/Desktop/codeorbit/codeorbit/src/pages/Review.tsx):
  - Initialized `tab` to `'errors'` by default, while supporting `?tab=due` via `useSearchParams` for direct deep-linking from dashboard "Start Due Review".
  - Conditionally rendered active tab panels (`{tab === '...' && ...}`) rather than mounting all inactive tabs with `hidden`, preventing duplicate DOM text collisions across tabs.
  - Verified: `optimisticUi.test.tsx` (5/5), `app.test.tsx` (40/40), `regression.smoke.test.tsx` (19/19), `dueReview.test.tsx` (7/7), and full test suite (868/868 tests across 116 suites) 100% PASS.

## 3. §13 Acceptance Criteria Checklist & Evidence
- [x] **Review schedule matches the documented intervals (tests).**
  - **Evidence:** `src/test/spaced.test.ts` verifies SM-2 interval progression: 1 → 3 → 7 → 16 → `Math.round(interval * ease)` days for consecutive Good grades. Again lapses reset interval to 1 day and increment lapse counter. Hard multipliers and Easy bonuses conform to documented specifications. DST-safe UTC noon calendar math prevents ±1 hour timezone drift.
- [x] **A created challenge is checkable and persists; invalid ones cannot be saved.**
  - **Evidence:** `src/test/challengeCreator.test.tsx` verifies that `ChallengeCreator` (`/create`) validates each stepper step, verifies CSS selectors with `isValidSelector`, runs a reference solution self-check via `validateChallenge()`, checks quota budgets with `getQuotaInfo()`, and persists valid challenges into `state.custom.challenges`. Invalid forms, broken selectors, and failing reference solutions are blocked from saving.
- [x] **Snapshot links round-trip and never execute code on open (test + sandbox check).**
  - **Evidence:** `src/test/snapshot.test.ts` verifies base64url encode/decode round-trip, transparent `CompressionStream` deflate compression with uncompressed fallback, strict 8 KB fragment limit enforcement (`MAX_SNAPSHOT_LINK_BYTES = 8192`), and schema validation. The `/share` route renders received code into read-only syntax blocks and strictly requires explicit learner confirmation ("Try it in your workspace") before creating a local workspace copy in `custom.challenges`. Code is never executed upon page load.
- [x] **Portfolio contains only the learner's own completed work, fully escaped.**
  - **Evidence:** `src/test/portfolio.test.ts` verifies that `generatePortfolioHtml` in `src/core/portfolio/exportPortfolio.ts` includes only passed challenges (`rec.completed === true`), uses the learner's final edited drafts, rejects generation when 0 completed projects exist, strictly escapes all content/metadata against script injection (`<script>alert("hacked")</script>`), and isolates live project previews in `sandbox="allow-scripts"` iframes with `srcdoc`.
- [x] **Answering a review card records a streak day; viewing does not.**
  - **Evidence:** `src/test/dueReview.test.tsx` verifies that `ANSWER_REVIEW_CARD` dispatches through `withActivity(...)` with type `'review-answer'`, logging an activity event and advancing `activityDays` and streak metrics, whereas viewing cards or navigating due review never modifies activity logs.

## 4. Invariants & Architecture Compliance
- **Schema v8 Contract:** Storage schema version is strictly 8 (`SCHEMA_VERSION = 8`). Exactly one migration (`migrateV7toV8`) initializes `review: Record<string, ReviewCard>` and `custom: { challenges: ChallengeV2[] }`.
- **Mastery Rule Immunity:** Neither answering review cards nor creating, editing, or practicing custom challenges ever alters official topic mastery records in `state.topics` (L-15 invariant).
- **Offline / Zero-Backend Architecture:** Spaced repetition scheduling, custom challenge authoring, peer snapshot compression, speech synthesis, and portfolio generation operate completely in-browser with zero remote API dependencies.
