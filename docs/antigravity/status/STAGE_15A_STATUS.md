# Stage 15a — Layered Mastery Map, Heatmap, List Fallback and Keyboard Navigation — Status Report

Save as `docs/antigravity/status/STAGE_15A_STATUS.md`.

## 1. Header
- **Sub-stage:** 15a (`stage-15a-mastery-map-analytics`)
- **Branch:** `stage-15a-mastery-map-analytics` · **Commit:** Pending sub-stage commit
- **Date/time:** 2026-10-27 11:30 IST · **Agent/tool:** Antigravity (Google DeepMind pair programming assistant)
- **Predecessor Baseline:** Stage 14 (commit `bbbea47` on `stage-14-notes-bookmarks-review`) verified 100% green and committed.

## 2. Baseline before changes (Stage 14 exit state)
| Command | Result (summary line) |
|---|---|
| `git status` | clean, branch `stage-15a-mastery-map-analytics` at `bbbea47` |
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm run test` | 89 test files passed, 643 tests passed |
| `npm run build` | Built successfully (`index-*.js` 669.92 kB, CSS 94.31 kB) |
| `npm audit --omit=dev` | 0 vulnerabilities |

## 3a. Evidence split (owner UI/UX contract `09` §6)
- **Implemented:**
  - `masteryLayout.ts` deterministic pure layout engine (`src/core/orbit/masteryLayout.ts`):
    - Computes topic depths strictly from declared prerequisite IDs.
    - Gracefully ignores missing/invalid prerequisite IDs (`missingIdTolerance`).
    - Detects cycles in prerequisite graphs and throws a descriptive Error (`Cycle detected in prerequisite graph`).
    - Places nodes into vertical depth columns (Level 1, Level 2, ...) with deterministic y-spacing and non-overlapping bounding boxes.
    - Generates cubic bezier curves (`M x1 y1 C mx y1, mx y2, x2 y2`) between prerequisites and dependents.
  - Track-scoped Mastery Map Page (`src/pages/Mastery.tsx`, `/learn/:technologyId/mastery`):
    - Default view: `Layers` (interactive layered node/edge prerequisite DAG).
    - Alternative views: `Heatmap` (grouped by level with status chips, icons, and legend) and `List` (grouped by level).
    - Compact screen list fallback: Automatically transitions from graph to structured list when container width < 720px without page overflow.
    - Inner scroll container `.mastery__graph-scroll` (`overflow-x: auto`) preventing page horizontal scroll while parent card has `overflow: hidden` (reference defect 12).
    - Roving-tabindex keyboard navigation model:
      - `ArrowDown` / `ArrowUp`: moves between nodes within the same depth column.
      - `ArrowRight` / `ArrowLeft`: moves across depth columns to the vertically closest node.
      - `Home` / `End`: jumps to first / last node in the current depth column.
      - Focused topic receives `tabIndex="0"` and `aria-current="true"`; all other nodes have `tabIndex="-1"`.
    - Criteria and details panel:
      - Preserves exact verbatim criteria wording: `"A learning aid, not an exam grade. Later review results are not part of the criteria."`.
      - Clearly marks `"Not possible: solution revealed first"` when challenge solution was revealed before completing without solution.
      - Displays lesson complete status, quiz score (pass = at least two thirds correct), practice status, and mastery star.
  - Route, Navigation & Command Palette Integration:
    - Route `/learn/:technologyId/mastery` in `src/App.tsx`.
    - Route redirect `/mastery` -> `<Navigate to="/learn/html/mastery" replace />`.
    - Shell nav matcher updated to include `'/mastery'` under Explore/Learn.
    - Track page (`src/pages/Track.tsx`) includes 'Mastery map' link button in both legacy and constellation views.
    - Command palette (`src/core/search/commands.ts`) includes `cmd-nav-mastery` ("Go to Mastery Map").
    - Adheres strictly to track neutrality; no hard-coded `'html'` string literals in `src/pages/**`, `src/components/**`, `src/core/**` or `src/lib/**` (queries `TrackRegistry.defaultTrackId()`).
  - Explicit Scope Exclusions:
    - Force view deferred to Sub-stage 15b.
    - Analytics, charts, recommendations, share card, active-time tracker, `timeSpent`, and schema v7 migration deferred to Sub-stage 15c.
    - Schema remains cleanly at **v6** for Stage 15a.
- **Functionally tested:**
  - `src/test/masteryLayout.test.ts` (9 unit tests):
    - Derives depth from real prerequisite graph (html-structure at 0, semantic-layout at 2, accessible at 3).
    - Keeps canonical order within depth column.
    - Nodes never overlap vertically within a depth column.
    - Edge list contains ONLY declared prerequisite relationships.
    - Aligns nodes into distinct x-columns matching depths.
    - Handles graphs with zero prerequisites cleanly.
    - Ignores missing/invalid prerequisite IDs without throwing.
    - Detects prerequisite cycles and throws Error.
    - Node coordinates are completely stable across calls with same input.
  - `src/test/Mastery.test.tsx` (9 unit and integration tests):
    - Shows graph with all 12 topics and only real edges on wide screens.
    - Selecting a node explains status and highlights only its active edges (`.mastery__edge--active`).
    - Explains why mastery is impossible after revealing the solution first ("Not possible: solution revealed first").
    - Falls back to structured list on narrow screens (< 720px width).
    - Renders Heatmap view with legend and status chips.
    - Roving tabindex keyboard navigation operates via arrow keys, Home, and End.
    - Track page links to track-scoped mastery map.
    - `/mastery` redirects to default track map `/learn/html/mastery`.
    - Command palette includes `Go to Mastery Map`.
- **Visually & responsiveness inspected:**
  - Wide screen (≥720px): Renders interactive layered DAG with SVG bezier curves and active highlight glow.
  - Narrow screen (<720px): Cleanly switches to accessible structured list (`aria-label="Topics grouped by prerequisite level"`).
  - Intermediate screen (720px–1000px): Inner scroll container allows horizontal exploration of wide graphs without triggering viewport horizontal overflow.
- **Accessibility checked:**
  - Full roving tabindex pattern on graph nodes with polite status updates on selection.
  - Axe accessibility suite passes 100% across all core pages with zero serious or critical violations.
  - Valid ARIA tablist/tab structure for view toggling (Layers, Heatmap, List).
- **Not verified:**
  - Sub-stages 15b and 15c (explicitly deferred).
- **Remaining defects or decisions:** None.

## 3. Work completed
- Items completed: 15a.1, 15a.2, 15a.3, 15a.4, 15a.5, 15a.6.
- Files added:
  - `src/core/orbit/masteryLayout.ts`
  - `src/pages/Mastery.tsx`
  - `src/test/masteryLayout.test.ts`
  - `src/test/Mastery.test.tsx`
- Files modified:
  - `src/App.tsx`
  - `src/components/Shell.tsx`
  - `src/core/search/commands.ts`
  - `src/lib/routes.ts`
  - `src/pages/Track.tsx`
  - `src/styles/pages.css`

## 4. Quality Gates Verification Results
| Gate | Command | Result |
|---|---|---|
| **Typecheck** | `npm run typecheck` | **PASS** (0 errors) |
| **Lint** | `npm run lint` | **PASS** (0 errors, 0 warnings, no-restricted-syntax verified) |
| **Test Suite** | `npx vitest run` | **PASS** (91 test files, 661 tests passed, 0 failed) |
| **Production Build** | `npm run build` | **PASS** (built in 905ms, assets bundled cleanly) |
| **Security Audit** | `npm audit --omit=dev` | **PASS** (0 vulnerabilities) |

## 5. Exit-gate decision
**Sub-stage 15a Complete: PASS**. Ready for commit on `stage-15a-mastery-map-analytics` and user authorization before proceeding to Sub-stage 15b.
