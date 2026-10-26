# Stage 11 — Gamification: XP, levels, achievements, streaks, daily challenge, personal bests — Status Report

Save as `docs/antigravity/status/STAGE_11_STATUS.md`.

## 1. Header
- Stage: 11 (Sub-stage 11a: Core Gamification Logic, Schema v5, XP & Achievements)
- Branch: `stage-11a-gamification-engagement` · Commit(s): Pending stage commit
- Date/time: 2026-10-26 15:25 IST · Agent/tool: Antigravity (Google DeepMind pair programming assistant)
- Started from: Commit `6e7179d` on branch `stage-10-constellation-orbit`
- Soft Decision Gates:
  - **O-09 (XP award table):** Approved default per specification (`lessonComplete: 10, quizPass: 15, quizPerfect: 10, challengePass: 25, independentSolve: 15, topicMastered: 50, errorUnderstood: 5, dailyChallenge: 20`).
  - **O-10 (Daily challenge scope):** Approved default per specification (global pool across available tracks; "current track only" filter off by default).
- Predecessor Stage: Stage 10 (Constellation Orbit) verified 100% green and committed.

## 2. Baseline before changes (Stage 10 exit state)
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm run test` | 66 test files passed, 525 tests passed |
| `npm run build` | Built successfully in 416ms |

## 3. Scope Implemented for Stage 11a
- **Schema v5 Data Model & Types (`src/state/types.ts`):**
  - Added `BadgeRecord` interface: `{ firstSeenAt: number | null; backfilled: boolean }`.
  - Added `badges: Record<string, BadgeRecord>` and `personalBests: Record<string, number>` to `CodeOrbitState`.
- **Schema Migration v4 → v5 (`src/core/storage/migrations.ts` & `src/lib/storage.ts`):**
  - Implemented `migrateV4toV5(old)`: pure, idempotent migration safely preserving existing state, initializing `badges: {}` and `personalBests: {}`.
  - Bumped `SCHEMA_VERSION = 5` and added `migrateV4toV5` to the ordered migrations chain.
  - Updated `sanitizeState()` to validate and repair `badges` and `personalBests` field-by-field.
- **Pure XP & Level Derivation (`src/core/gamification/xp.ts`, Catalog 8.1, L-20):**
  - `XP_TABLE`: fixed awards per milestone (`lessonComplete: 10, quizPass: 15, quizPerfect: 10, challengePass: 25, independentSolve: 15, topicMastered: 50, errorUnderstood: 5, dailyChallenge: 20`).
  - Cumulative level curve: `xpForLevel(n) = 100 * n * (n + 1) / 2`.
  - Pure calculation: `computeXp(state)` derives total XP and level purely from saved state; never writes to storage; immune to score inflation and farming (replays, hints, revisits grant 0 XP); un-completing an activity lowers XP consistently.
- **Data-Driven Achievements Architecture (`src/core/gamification/achievements.ts`, Catalog 8.2, REF-05):**
  - `AchievementDef`, `AchievementProgress`, `AchievementEvaluation`, and `EngagementContext` contracts.
  - Platform achievements: `first-challenge`, `independent-solver`, `revision-completed`, `first-mastery`, `three-day-streak`, `seven-day-streak`, and `quiz-ace`.
  - `evaluateAchievements(state, ctx)` evaluates all registered platform and track achievements without side-effects.
  - `syncBadges(state, now)` tracks honest dates: live achievements earn `{ firstSeenAt: now, backfilled: false }`; pre-existing progress earns `{ firstSeenAt: null, backfilled: true }` (silent backfill, preventing toast storms).
- **Track-Scoped HTML Achievements (`src/tracks/html/achievements.ts`):**
  - Ported 5 HTML track achievements without `!` assertions: `html-foundations`, `semantic-structure`, `accessible-images`, `form-builder`, and `html-complete`.
  - Registered under `htmlTrack.achievements` in `src/tracks/html/track.ts`.
- **Local Personal Bests (`src/core/gamification/personalBests.ts`, Catalog 8.5):**
  - `derivePersonalBests(state)`: derives longest streak (`streakBest`), best quiz scores per topic sorted by percentage, and fastest challenge pass durations from check history and `personalBests`.
  - Strictly local to this device; zero peer comparisons.
- **State Reducer Enhancements (`src/state/reducer.ts`):**
  - Added action handlers for `AWARD_BADGE`, `RECORD_PERSONAL_BEST`, and `ASSIGN_DAILY`.
  - Updated `RECORD_CHECK` to mark `dailyDone` when all requirements pass and `challengeId === state.dailyAssigned[today]`.

## 4. Verification and Quality Gates
| Gate | Command | Result |
|---|---|---|
| **TypeScript** | `npm run typecheck` (`tsc -b --noEmit`) | **PASS** (0 errors) |
| **ESLint** | `npm run lint` (`eslint .`) | **PASS** (0 warnings, 0 errors) |
| **Unit & Integration Tests** | `npm run test` (Vitest) | **PASS** (69 test files, 549 tests passed, +24 new tests) |
| **Production Build** | `npm run build` | **PASS** (built in 498ms; `index-*.js` 572.39 kB / 171.98 kB gzip, CSS 80.28 kB / 17.79 kB gzip) |
| **Security Audit** | `npm audit --omit=dev` | **PASS** (0 vulnerabilities) |
| **Track Neutrality** | `git grep -n "'html'" src/core/gamification src/core/orbit` | **PASS** (0 occurrences) |

## 5. Tests Added in Stage 11a
- `src/test/gamification/achievements.test.ts` (13 tests): starts unearned, anti-farming on navigation/notes, First Challenge pass check, topic badges exact rules, HTML Foundations progress, Independent Solver hint/solution exclusion, First Mastery quiz perfection, Revision Completed understood entry, Three-Day / Seven-Day streaks, Quiz Ace, rule length > 20 chars & unique IDs, HTML Complete, honest dates & silent backfill.
- `src/test/gamification/xp.test.ts` (6 tests): default 0 XP / Level 0, monotonic level curve, level threshold mapping, XP_TABLE category scoring, anti-farming on replay/re-check, consistent reduction on un-completing.
- `src/test/gamification/personalBests.test.ts` (4 tests): empty state handling, longest streak derivation, quiz best sorting, fastest pass extraction.
- `src/test/migrations.test.ts` (extended with 2 new v5 migration tests): v4 to v5 migration adding badges/personalBests, preserving sectionBookmarks, and preserving existing badges/personalBests.

## 6. Bundle Size and Dependency Changes
- **New Runtime Dependencies:** 0 (Zero new runtime dependencies).
- **New Dev Dependencies:** 0.
- **Bundle Size:**
  - Main JS chunk: `dist/assets/index-CimIXkRH.js`: 572.39 kB (gzip: 171.98 kB).
  - CodeMirror chunk: `dist/assets/codemirrorAdapter-CjjTKl3B.js`: 496.16 kB (gzip: 172.06 kB).
  - CSS: `dist/assets/index-cmvLolbK.css`: 80.28 kB (gzip: 17.79 kB).

## 7. Deferred to Stage 11b
- Frozen daily challenge UI (`DailyChallengeCard.tsx`).
- Milestone events and rank progression toasts (`src/components/Toast.tsx` polite announcements).
- XP award float animation (`XpAward.tsx`).
- Achievement Badge Gallery UI (`BadgeGallery.tsx`) and XP Bar header in `src/pages/Progress.tsx`.
- "Show XP and achievements" toggle switch in `src/pages/Settings.tsx` (Rule P-04).
- Visual screenshot verification across 4 viewports (Desktop, Tablet, Mobile, Narrow Mobile).

## 8. Exit Gate Check (Stage 11a)
- Derivation + migration tests green: **PASS** (32 gamification & migration tests passed).
- Full Vitest suite: **PASS** (549 tests passing, 0 failing).
- Typecheck & Lint: **PASS** (0 errors, 0 warnings).
- Clean separation: core logic is 100% track-neutral; HTML track achievements isolated in `src/tracks/html/`.
- Stage 11a exit gate: **PASS**.
