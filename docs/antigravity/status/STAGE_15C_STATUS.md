# Stage 15c — Analytics, Active-Time Tracking & Schema v7 Migration — Status Report

Save as `docs/antigravity/status/STAGE_15C_STATUS.md`.

## 1. Header
- **Sub-stage:** 15c (`stage-15c-mastery-map-analytics`)
- **Branch:** `stage-15c-mastery-map-analytics` · **Commit:** `6d20594`
- **Date/time:** 2026-10-27 17:56 IST · **Agent/tool:** Antigravity (Google DeepMind pair programming assistant)
- **Predecessor Baseline:** Stage 15b (commit `2d6a41c` on `stage-15b-mastery-map-analytics`) verified 100% green.

## 2. Baseline before changes (Stage 15b exit state)
| Command | Result (summary line) |
|---|---|
| `git status` | clean, branch `stage-15b-mastery-map-analytics` at `2d6a41c` |
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm run test` | 92 test files passed, 681 tests passed |
| `npm run build` | Built successfully (`index-*.js` 684.11 kB, CSS 97.87 kB) |
| `npm audit --omit=dev` | 0 vulnerabilities |

## 3a. Evidence split (owner UI/UX contract `09` §6)
- **Implemented:**
  - **Schema v7 Migration (Catalog 11.3, 11.4):**
    - State types updated in `src/state/types.ts`: `SCHEMA_VERSION = 7`, `timeSpent: Record<string, number>`, `timeSpentSessions: Record<string, number>`.
    - Migration function `migrateV6toV7` in `src/core/storage/migrations.ts` preserves existing state, initializes empty records, and strictly validates non-negative integers.
    - Sanitization in `src/lib/storage.ts` verifies `timeSpent` and `timeSpentSessions` structures.
  - **Active-Time Tracking Engine (Catalog 11.3, Option A):**
    - Hook `useActiveTime(topicId)` in `src/core/insights/activeTime.ts`.
    - 60-second idle threshold with `mousemove`, `mousedown`, `keydown`, `touchstart`, and `scroll` activity listeners.
    - Automatic pause on window blur and document visibility hidden (`document.hidden`).
    - 30-second batched dispatch interval and immediate unmount flush.
    - Measured-session definition (Option A): continuous active study >= 5 seconds records `isNewSession: true` once per topic visit; short bounces (< 5s) record active seconds without incrementing sessions; idle pauses and periodic batch flushes do not duplicate session counts.
    - Action `RECORD_ACTIVE_TIME` handled in `src/state/reducer.ts` updating `timeSpent` and `timeSpentSessions` with zero side effects on streaks, XP, or milestones.
    - Mounted in learning routes: `src/pages/Lesson.tsx`, `src/pages/Quiz.tsx`, and `src/pages/Practice.tsx`.
  - **Estimates & Recommendations (Catalog 11.3, 11.4, Principle P-07):**
    - `src/core/insights/estimates.ts`:
      - `calculateTrackRemainingEstimate`: Computes remaining track learning time based on topic declared durations.
      - `compareTopicEstimates` and `compareGroupEstimates`: Evaluates estimated vs actual active time.
      - **Principle P-07 gate:** Topic and group actual time comparisons are strictly suppressed unless `timeSpentSessions[topicId] >= 3` genuine measured sessions have occurred.
    - `src/core/insights/recommendations.ts`:
      - `recommend(state, track)`: Deterministically suggests next unfinished topic in topological/prerequisite order, and flags gap topics with weak quiz scores (< 70%) or unmastered prerequisites.
    - Integration on `src/pages/Mastery.tsx`: remaining estimate pill in header and recommendation banner cards above the map.
  - **Analytics Derivations (Catalog 12.1, 12.2, 12.5):**
    - `src/core/insights/velocity.ts`: Topics completed per week over rolling 4-week window with empty state `"Complete a lesson to see your pace"`.
    - `src/core/insights/quizBreakdown.ts`: First-try vs latest score comparison and weak quiz (< 70%) detection.
    - `src/core/insights/attemptHeat.ts`: Topic-by-topic attempt matrix with last 10 attempts (`✓` / `✗`) and CSV export (`exportAttemptsToCsv`).
  - **Accessible Pure SVG Charts (Catalog 12.3):**
    - `src/core/insights/charts/AccessibleBarChart.tsx` and `AccessibleLineChart.tsx`:
      - Pure SVG rendering without external charting libraries.
      - Enclosed in semantic `<figure>` with `<figcaption>`.
      - Interactive keyboard tooltips (`tabindex={0}`, `aria-label`).
      - Full accessible `<table>` alternative for screen readers and non-graphical devices.
  - **Progress Sharing Card (Catalog 12.4):**
    - `src/core/insights/ShareCard.tsx`:
      - Client-side `<canvas>` rendering exportable as PNG image.
      - Zero cloud telemetry or external network calls.
      - Exclusively surfaces real user metrics (no fabricated vanity figures).
      - Text alternative rendered directly in DOM for assistive technology.
  - **Progress Page Integration (`src/pages/Progress.tsx`):**
    - Collapsible analytics sections for Velocity, Estimated vs Actual Time, Quiz Breakdown, Topic Attempt Heat Matrix, and Share Card.
    - CSV export button with direct blob download.
- **Functionally tested:**
  - `src/test/insights/activeTime.test.tsx` (10 tests):
    - Flushes active time on unmount.
    - Pauses accumulation when user is idle for > 60 seconds.
    - Pauses accumulation on window blur and tab hidden.
    - Increments session count for visits >= 5s.
    - Bounces (< 5s) record seconds without incrementing session count.
    - Repeated flushes within same visit do not duplicate session count.
    - Route transition flushes time to correct topic ID.
    - Zero side effects on streak calculations.
  - `src/test/insights/estimates.test.ts` (4 tests):
    - Calculates track remaining estimate correctly.
    - Respects Principle P-07 session threshold (suppresses actual until >= 3 sessions).
    - Aggregates group estimates and actuals correctly.
    - Formats durations accurately.
  - `src/test/insights/recommendations.test.ts` (4 tests):
    - Recommends first incomplete topic in prerequisite order.
    - Identifies gaps for quizzes with score < 70%.
    - Explains recommendation reasoning clearly.
    - Returns null next topic when track is fully completed.
  - `src/test/insights/velocity.test.ts` (2 tests):
    - Returns empty message when zero lessons completed.
    - Calculates rolling 4-week pace from completion timestamps.
  - `src/test/insights/quizBreakdown.test.ts` (2 tests):
    - Compares first-try vs latest scores.
    - Flags weak topics (< 70%).
  - `src/test/insights/attemptHeat.test.ts` (3 tests):
    - Formats last 10 attempts as pass/fail markers.
    - Generates valid CSV formatted content.
    - Sanitizes topic titles with commas in CSV export.
  - `src/test/insights/charts.test.tsx` (4 tests):
    - AccessibleBarChart renders SVG bars and accessible fallback table.
    - AccessibleLineChart renders SVG polylines, points, and table.
    - Tooltips focusable with accessible names.
    - Supports empty datasets gracefully.
  - `src/test/insights/shareCard.test.tsx` (4 tests):
    - Generates card with real user stats.
    - Renders accessible text alternative.
    - Download button triggers canvas export.
  - `src/test/insights/analytics.integration.test.tsx` (2 tests):
    - Progress page mounts all 5 analytics sections with correct initial empty states.
    - Mastery page displays remaining time pill and recommendations.
  - `src/test/migrations.test.ts` (11 tests):
    - Upgrades schema v6 to v7 initializing `timeSpent` and `timeSpentSessions`.
    - Handles undefined, empty, and partial v6 state safely.
- **Visually & responsiveness inspected:**
  - Progress and Mastery pages adapt across viewports (mobile, tablet, desktop).
  - SVG charts scale with `viewBox` and maintain legible typography.
  - Heat matrix scrolls horizontally on narrow viewports without overflowing page layout.
- **Accessibility checked:**
  - SVG charts utilize semantic `<figure>`, `<figcaption>`, and accessible tabular representations.
  - ShareCard provides full DOM alternative text matching canvas contents.
  - Zero axe accessibility violations.
- **Not verified:**
  - Stage 16 functionality (future stage).
- **Remaining defects or decisions:** None.

## 3. Work completed
- Items completed: Catalog 11.3 (Active-Time Tracking), 11.4 (P-07 Estimates), 12.1 (Velocity), 12.2 (Quiz Breakdown), 12.3 (Accessible Charts), 12.4 (Share Card), 12.5 (Attempt Heat & CSV Export).
- Files added:
  - `src/core/insights/activeTime.ts`
  - `src/core/insights/estimates.ts`
  - `src/core/insights/recommendations.ts`
  - `src/core/insights/velocity.ts`
  - `src/core/insights/quizBreakdown.ts`
  - `src/core/insights/attemptHeat.ts`
  - `src/core/insights/charts/AccessibleBarChart.tsx`
  - `src/core/insights/charts/AccessibleLineChart.tsx`
  - `src/core/insights/ShareCard.tsx`
  - `src/test/fixtures/state.v6.json`
  - `src/test/insights/activeTime.test.tsx`
  - `src/test/insights/estimates.test.ts`
  - `src/test/insights/recommendations.test.ts`
  - `src/test/insights/velocity.test.ts`
  - `src/test/insights/quizBreakdown.test.ts`
  - `src/test/insights/attemptHeat.test.ts`
  - `src/test/insights/charts.test.tsx`
  - `src/test/insights/shareCard.test.tsx`
  - `src/test/insights/analytics.integration.test.tsx`
- Files modified:
  - `src/state/types.ts`
  - `src/state/reducer.ts`
  - `src/core/storage/migrations.ts`
  - `src/lib/storage.ts`
  - `src/pages/Progress.tsx`
  - `src/pages/Mastery.tsx`
  - `src/pages/Lesson.tsx`
  - `src/pages/Quiz.tsx`
  - `src/pages/Practice.tsx`
  - `src/styles/pages.css`
  - `src/test/migrations.test.ts`
  - `src/test/notes/migration.test.ts`
  - `docs/WORKLOG.md`

## 4. Quality Gates Verification Results
| Gate | Command | Result |
|---|---|---|
| **Typecheck** | `npm run typecheck` | **PASS** (0 errors) |
| **Lint** | `npm run lint` | **PASS** (0 errors, 0 warnings) |
| **Test Suite** | `npx vitest run` | **PASS** (101 test files, 718 tests passed, 0 failed) |
| **Production Build** | `npm run build` | **PASS** (Built in 556ms, index-*.js 717.23 kB, CSS 100.94 kB) |
| **Dependency Audit** | `npm audit --omit=dev` | **PASS** (0 vulnerabilities) |
