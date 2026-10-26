# Stage 12 — Dashboard: hero ring, streak calendar, group cards, daily card, activity feed, quick actions, smart next step — Status Report

Save as `docs/antigravity/status/STAGE_12_STATUS.md`.

## 1. Header
- **Stage:** 12 (`dashboard`)
- **Branch:** `stage-12-dashboard` · **Commit:** Pending stage commit
- **Date/time:** 2026-10-26 16:20 IST · **Agent/tool:** Antigravity (Google DeepMind pair programming assistant)
- **Predecessor Stage:** Stage 11 (commit `c9ad51b` on `stage-11b-gamification-engagement`) verified 100% green and committed.

## 2. Baseline before changes (Stage 11 exit state)
| Command | Result (summary line) |
|---|---|
| `git status` | clean, branch `stage-12-dashboard` at `c9ad51b` |
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm run test` | 72 test files passed, 564 tests passed |
| `npm run build` | Built successfully in 374ms (`index-*.js` 586.05 kB / 176.11 kB gzip, CSS 84.01 kB / 18.40 kB gzip) |
| `npm audit --omit=dev` | 0 vulnerabilities |

## 3. Scope Implemented for Stage 12
- **3.1 Hero Progress Ring (`src/core/insights/HeroRing.tsx`):**
  - Large 160 px `ProgressRing` showing real completed topics and steps from saved state.
  - Zero-state truthfulness: displays exact 0 metrics without fabrication (`0 of 12 topics complete · 0 of 36 learning steps done`).
  - Prominent percentage display and semantic progressbar (`role="progressbar"`).
- **3.2 Streak Calendar (`src/core/gamification/StreakCalendar.tsx`):**
  - Semantic `table` with `caption`, `th` weekdays (Mon..Sun), and month header labels.
  - Max 84 cells (12 weeks × 7 days).
  - Exact cell state derivation: active cells correspond 1:1 with `activityDays`.
  - Accessible cell labels: `aria-label='{day} {month}: active'` / `'no activity'`.
  - Empty state truthfulness: hides streak figures and renders *"No activity recorded yet"* when `activityDays.length === 0`.
  - Visual shape and color-distinguished legend (`Active day` / `No activity`).
- **3.3 Topic Group Completion Cards (`src/core/insights/GroupCards.tsx`):**
  - Responsive grid (`repeat(auto-fill, minmax(200px, 1fr))`) rendering one card per `TopicGroup`.
  - Displays group title, completion percentage, completed/total count, and progress bar.
  - Deep-links directly to the first incomplete topic of the group.
- **3.4 Daily Challenge Feature Card (`src/core/gamification/DailyChallengeCard.tsx`):**
  - Canonical placement established on Home / Dashboard.
  - Anchor `id="daily-challenge"`.
  - Frozen assignment preserved across mid-day catalog expansions.
  - Completion stamp (`.daily__stamp`) rendered when today's challenge is completed.
- **3.5 Recent Activity Feed (`src/core/insights/ActivityFeed.tsx`):**
  - Lists up to 10 recorded activity events with real timestamps (`<time>`) and links.
  - Human-readable sentences mapping `ActivityEvent.type`:
    - `'lesson-complete'`: `"Completed lesson: [Title]"`
    - `'quiz-finish'`: `"Completed quiz: [Title] ([score]/[total])"`
    - `'challenge-check'`: `"Passed practice check: [Title]"`
  - Completely hidden when `activity.length === 0` (zero fabricated activity).
- **3.6 Quick Actions Toolbar (`src/core/insights/QuickActions.tsx`):**
  - Role toolbar with keyboard-accessible navigation to only working destinations:
    - Resume / Start: points to `resumePath(lastVisited)` if active, or `trackPath(trackId)`.
    - Daily Challenge: jumps to `#daily-challenge`.
    - Review (Error Notebook): points to `/review` with unread count badge.
    - Notes: points to `/review` with user notes count badge.
    - Settings: points to `/settings`.
- **15.3 Smart Next Step Card (`src/core/learning/NextStepCard.tsx`):**
  - Transparently wraps `nextAction()` and provides explicit prerequisite-based justification (e.g. *"Because Document structure is complete, you are ready for Elements and attributes.*").
  - Handles foundation topics and all-complete track state gracefully.
- **Track-Aware Dashboard Composition (`src/pages/Home.tsx`):**
  - Composes the complete 3-row responsive grid:
    - **Row 1:** Hero progress ring (left, 160 px) + Continue / Start card + Daily Challenge card.
    - **Row 2:** Topic group cards grid + Track curriculum segment strip + Streak calendar.
    - **Row 3:** Recent activity feed + Smart next step / Error Notebook review + Quick actions toolbar.
  - Mobile layout order (< 768px): strictly follows single-column order: `Continue, Daily, Hero ring, Groups, Track strip, Calendar, Next step, Review, Feed, Quick actions`.
  - Strictly track-neutral via `useTrack()`; zero `'html'` string literals.
  - Empty new-learner state: only Continue/Start + Daily + Groups (0%), with no fabricated streak numbers or feed.
- **Progress Page Deduplication (`src/pages/Progress.tsx`):**
  - Removed duplicate `DailyChallengeCard` (resolving reference defect 11).
  - Added streak summary line linking to the dashboard (`/`).
  - Daily challenge card now appears **exactly once** across Home and Progress.

## 4. Verification and Quality Gates
| Gate | Command | Result |
|---|---|---|
| **TypeScript** | `npm run typecheck` (`tsc -b --noEmit`) | **PASS** (0 errors) |
| **ESLint** | `npm run lint` (`eslint .`) | **PASS** (0 warnings, 0 errors) |
| **Unit & Integration Tests** | `npm run test` (Vitest) | **PASS** (74 test files, 572 tests passed, +8 new tests) |
| **Playwright Visual E2E** | `npx playwright test e2e/dashboard-visual.spec.ts` | **PASS** (4 tests passed across 5 viewports + first-run + toggles) |
| **Playwright Gamification Visual** | `npx playwright test e2e/gamification-visual.spec.ts` | **PASS** (5 tests passed) |
| **Playwright Smoke E2E** | `npx playwright test e2e/smoke.spec.ts` | **PASS** (13 tests passed) |
| **Production Build** | `npm run build` | **PASS** (built in 481ms; `index-*.js` 598.45 kB / 179.42 kB gzip, CSS 89.03 kB / 19.36 kB gzip) |
| **Security Audit** | `npm audit --omit=dev` | **PASS** (0 vulnerabilities) |
| **Track Neutrality** | `git grep -n "'html'" src/core/insights src/core/gamification src/pages/Home.tsx` | **PASS** (0 occurrences) |

## 5. Acceptance Criteria Checklist
- [x] **First-run dashboard shows no streak figure, no feed, no fabricated numbers:** Verified by unit test in `src/test/insights/dashboard.test.tsx` and Playwright test in `e2e/dashboard-visual.spec.ts`.
- [x] **Calendar active days equal `activityDays` exactly:** Verified by unit test in `src/test/gamification/streakCalendar.test.tsx` asserting exact active cells vs inactive cells.
- [x] **Daily card appears exactly once across Home and Progress:** Verified by unit test in `src/test/insights/dashboard.test.tsx` checking that `DailyChallengeCard` is mounted on Home and replaced with a summary link on Progress.
- [x] **Layout verified at 1280/820/390/320 px without overflow:** Verified via Playwright evaluating `scrollWidth <= clientWidth` across all 5 viewports (1440, 1280, 820, 390, 320 px).
- [x] **Original Resume/Start/Review behaviours preserved:** Verified by passing all 40 tests in `src/test/app.test.tsx` and 17 regression smoke tests in `src/test/regression.smoke.test.tsx`.

## 6. Visual Evidence Screenshots
Generated in `docs/antigravity/status/screenshots/stage-12/`:
1. `dashboard-desktop-1440.png`: Desktop (1440×900) 3-row dashboard with hero ring, continue card, daily challenge, group cards, streak calendar, and activity feed.
2. `dashboard-laptop-1280.png`: Laptop (1280×800) responsive layout.
3. `dashboard-tablet-820.png`: Tablet (820×1180) responsive 2-column layout.
4. `dashboard-mobile-390.png`: Mobile (390×844) single-column layout adhering to prescribed order.
5. `dashboard-narrow-320.png`: Narrow mobile (320×640) compact layout with zero horizontal overflow.
6. `dashboard-first-run-1280.png`: First-run empty dashboard with honest empty copy and no fabricated numbers.
7. `dashboard-high-contrast.png`: High Contrast mode on Dashboard (`data-contrast="high"`).
8. `dashboard-reduced-motion.png`: Reduced Motion mode on Dashboard (`data-motion="reduced"`).

## 7. Exit Gate Check (Stage 12 Complete)
- All Stage 12 requirements (3.1–3.6, 15.3, REF-08) implemented: **PASS**.
- Automated test count: 572 passed (exceeds baseline 564): **PASS**.
- All quality gates green (typecheck, lint, vitest, playwright, build, audit, track neutrality): **PASS**.
- 5 viewport screenshots and special modes captured: **PASS**.
- Stage 12 exit gate: **PASS**.
