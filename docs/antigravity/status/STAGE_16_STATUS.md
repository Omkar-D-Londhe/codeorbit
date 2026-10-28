# Stage 16 — Accessibility, Inclusivity Features & Reminders — Status Report

Save as `docs/antigravity/status/STAGE_16_STATUS.md`.

## 1. Header
- **Stage:** 16 (`accessibility-inclusivity`)
- **Branch:** `stage-15c-mastery-map-analytics` (Working tree uncommitted per explicit user instruction)
- **Baseline HEAD:** `4cc4603` (Stage 15c completion)
- **Parent Commit:** `2d6a41c`
- **Date/time:** 2026-10-27 21:55 IST · **Agent/tool:** Antigravity (Google DeepMind pair programming assistant)
- **Predecessor Baseline:** Stage 15c (commit `4cc4603` / `2d6a41c`) verified 100% green.
- **Acceptance Decision:** **ACCEPT WITH DOCUMENTED NON-BLOCKING ISSUES** (Independent audit recommendation)

## 2. Baseline & Audit-Verified Quality Gates
| Gate / Command | Stage 15c Predecessor | Stage 16 Exit State | Result | Audit Verification |
|---|---|---|---|---|
| `git status` | clean, HEAD `4cc4603` | uncommitted changes on `stage-15c-mastery-map-analytics` | Changes retained uncommitted for review per user mandate | Verified (0 staged, 0 commits) |
| `npm run typecheck` (`tsc -b --noEmit`) | Clean (0 errors) | Clean (0 errors) | PASS | Verified (0 errors) |
| `npm run lint` (`eslint .`) | Clean (0 errors, 0 warnings) | Clean (0 errors, 0 warnings) | PASS | Verified (0 errors, 0 warnings) |
| `npx vitest run` | 98 test files passed, 718 tests passed | 104 test files passed, 770 tests passed | PASS (+52 tests) | Verified (0 failed, 0 skipped, 0 excluded) |
| `npm run build` | Built successfully | Built successfully (`index-DfGG8RwJ.js` 731.37 kB, CSS 101.14 kB) | PASS | Verified (built in 432ms) |
| `npm audit --omit=dev` | 0 vulnerabilities | 0 vulnerabilities | PASS | Verified (0 vulnerabilities) |

## 3. Implementation Invariants
- **Storage Schema:** Remains strictly at **v7** (`export const SCHEMA_VERSION = 7` in `src/lib/storage.ts`).
- **Learning Velocity & Active-Time Tracking:** Stage 15c velocity calculations and time tracking engine remain untouched and fully preserved.
- **Working Tree State:** All Stage 16 changes remain uncommitted on branch `stage-15c-mastery-map-analytics` at commit `4cc4603` for user review. No branch switch, new branch, commit, or push occurred.

## 4. Implementation Details & Evidence Split

### 13.1 Font Size Scaler
- **State & Appearance:**
  - Added `FontScale = 0.875 | 1 | 1.125 | 1.25 | 1.5` and `VALID_FONT_SCALES` to `src/state/types.ts`.
  - Updated `src/core/settings/appearance.ts` with `isValidFontScale` and applied `--font-scale` to the root element.
  - Converted all component-level font sizes in `src/styles/components.css` and `src/styles/pages.css` to `rem` tokens; root scaling via `html { font-size: calc(100% * var(--font-scale, 1)); }`.
- **UI & Accessibility:**
  - Implemented 5-step integer slider (`min=0`, `max=4`, `step=1`) in `src/pages/Settings.tsx` mapping indices directly to `[0.875, 1, 1.125, 1.25, 1.5]` with visible percentage labels (87.5%, 100%, 112.5%, 125%, 150%) and live typography preview text.
  - Full keyboard accessibility with arrow keys (`aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`).
  - Storage sanitization in `src/lib/storage.ts` strictly rejects any value not in `VALID_FONT_SCALES` and invokes `drop()`.

### 13.2 Dyslexia-Friendly Font Toggle (Atkinson Hyperlegible)
- **Font Package & Dynamic Loading:**
  - Installed `@fontsource/atkinson-hyperlegible`.
  - Created `src/core/a11y/dyslexiaFont.ts` with lazy `loadDyslexiaFont()` dynamic loader; invoked only when `settings.dyslexiaFont === true` to keep font assets out of the critical bundle when disabled.
  - Added `[data-dyslexia="true"]` rules in `src/styles/tokens.css` overriding `--font-sans` with `'Atkinson Hyperlegible', sans-serif`.
  - Code typography integrity preserved: `--font-mono` remains `JetBrains Mono Variable`, strictly monospaced.
  - Catch handler in dynamic import ensures failed font loading falls back to system sans-serif without crashing the application.
- **UI:** Toggle switch in `src/pages/Settings.tsx` with explanatory help copy.

### 13.3 High-Contrast Mode
- **Wiring & Contrast Verification:**
  - Applied `[data-contrast="high"]` styles in `src/styles/themes.css` across all themes (Obsidian, Starlight, Aurora).
  - High-contrast mode eliminates glassmorphism, background blurs, glow shadows, and suppresses atmosphere layers (Nebula, ConstellationGrid, CursorGlow, Particles) via `Atmosphere.tsx:33`.
  - Verified WCAG AAA text contrast (≥ 12:1) and UI borders (≥ 4.5:1) in `src/test/contrast.test.ts` (37 tests passing).
- **UI:** High-contrast preview swatch and toggle in `src/pages/Settings.tsx`.

### 13.4 Screen-Reader Progress Announcements
- **Announcer Infrastructure:**
  - Created `src/core/a11y/Announcer.tsx` with single unified polite live region (`role="status"`, `aria-live="polite"`, `aria-atomic="true"`) and assertive channel (`role="alert"`, `aria-live="assertive"`).
  - Dedupes identical messages within 1.5 seconds via timestamp tracking map.
  - Bounded queue depth at max 3 items with 1000ms delay spacing between polite messages to prevent flooding assistive technology.
  - Created `src/core/a11y/useAnnounce.ts` hook.
- **Progress Transitions:**
  - Created `src/core/a11y/progressAnnouncements.ts` mapping derived state transitions:
    - Lesson complete (`"Lesson completed: <Title>"`)
    - Quiz results (`"Quiz completed with perfect score: ..."` or `"Quiz passed: ..."`)
    - Practice challenge pass (`"Practice challenge passed: <Title>"`)
    - Level up (`"Level up: Reached Level <N>!"`)
    - Badge earned (`"Badge earned: <Title>!"`)
  - Respects user preference `settings.announcements` (default `true`); completely silenced when disabled.
  - Created `src/core/a11y/ProgressAnnouncementListener.tsx` mounted in `src/components/Shell.tsx`. Initial mount is completely silent.
  - Verified in `src/test/a11y/announcer.test.tsx` (7 tests passing).

### 14.3 Local Reminder System (Decision C-10)
- **Local Due Calculation:**
  - Created `src/core/reminders/reminders.ts` implementing `isReminderDue(settings, nowMs, lastShownDate)`.
  - Evaluates local time and weekday match (0..6), ensuring reminders trigger at scheduled HH:MM local time and only once per local calendar day.
  - Persists `lastShownDate` (`YYYY-MM-DD`) directly to `localStorage` key `codeorbit_reminder_last_shown`. Reloads and component remounts read this key and suppress duplicate prompts.
  - Created `ReminderBanner` in `src/core/reminders/ReminderBanner.tsx` mounted on app open in `src/components/Shell.tsx`.
- **Honest Copy & Limitation Note:**
  - Banner: `"Time for your daily practice (Reminders appear while CodeOrbit is open.)"`.
  - Browser Notification permission button in `src/pages/Settings.tsx` with explicit note: `"Web notifications require CodeOrbit to be open in a tab. Push notifications while closed are not supported."` Zero push or background daemon claims.
  - Verified in `src/test/a11y/reminders.test.ts` (7 tests passing).

### FC-32 & A11y Matrix Sweep
- Created `src/test/a11y.matrix.test.tsx` executing `vitest-axe` checks across nine core routes (`/`, `/explore`, `/learn/html`, `/lesson/html-intro`, `/quiz/html-intro`, `/practice/ch-html-tags`, `/progress`, `/review`, `/settings`) across four combinations of themes (`obsidian`, `starlight`), contrast (`normal`, `high`), and font scale (`1`, `1.5`).
- 36 matrix tests executed: **0 serious or critical violations**.

## 5. Documented Non-Blocking Observations

1. **Accessibility Matrix Coverage Scope:**
   The automated matrix in `src/test/a11y.matrix.test.tsx` covers 9 routes across 4 tested theme/contrast/scale combinations (`obsidian/normal/1`, `starlight/normal/1`, `obsidian/high/1.5`, `starlight/high/1.5`). The third theme (`aurora`) and `/learn/html/mastery` route are tested for contrast and rendering in separate dedicated test suites (`contrast.test.ts`, `Mastery.test.tsx`, `regression.smoke.test.tsx`), but are not included in the `a11y.matrix.test.tsx` loop. Full Cartesian coverage across all 3 themes × 2 contrast modes × 5 scales × all routes is not claimed.
2. **Manual Viewport Verification — VERIFIED VIA SCREENSHOTS:**
   Physical browser inspection at a 320px viewport with 150% font scale was conducted using provided user screenshots (`media_1793123052810_1ff54103.png`, `media_1793123058428_8f18f201.png`, `media_1793123064234_a3358f5c.png`). Core typography wrapped cleanly without horizontal scrollbars on the body, and `<Announcer />` live regions remained properly mounted and active. Minor observation: bottom-nav label "My Progress" wraps to two lines at 320px (documented non-blocking observation).
3. **Settings Switches Alignment:**
   Settings switches for Dyslexia-Friendly Font, Announcements, and Reminders were polished in `src/styles/components.css` with centered tracks, thumbs, and high-contrast outline alignment.
4. **Learning Orbit Layout & Translucency Refinement:**
   - Finding A (Topic rows clipped / obscured): Fixed in `src/core/orbit/constellation/constellation.css` via `minmax(0, 1fr) 340px` on `.constellation-body`, `flex-wrap: wrap` and `flex: 1 1 200px` on `.constellation-list-row`, `overflow-x: hidden` on `.constellation-list-view`, and `padding-right: 356px` in expanded mode.
   - Finding B (Card translucency): Implemented `rgba(22, 19, 36, 0.86)` with `backdrop-filter: blur(10px)` and purple-accented border on `.constellation-expanded-card` and `.constellation-panel .card`, with solid fallback and WCAG AAA high-contrast mode override.
   - Finding C (Sidebar width): Evaluated and confirmed out of scope for Stage 16. Existing `FullscreenEditor` in `Practice.tsx` (`Ctrl+Shift+F`) provides distraction-free coding.
5. **Documentation Whitespace Notice:**
   `git diff --check` reported a single trailing blank line at `docs/WORKLOG.md:766`, retained as-is to avoid unrelated diff mutation.

## 6. Open Checklist
- [x] Font scale range input (0..4) and persistence contract (0.875, 1, 1.125, 1.25, 1.5)
- [x] Dyslexia-friendly font toggle with Atkinson Hyperlegible dynamic loading and monospaced code preservation
- [x] High-contrast mode across Obsidian, Starlight, and Aurora meeting WCAG AAA text (≥ 12:1) and borders (≥ 4.5:1)
- [x] Single unified Announcer with 1.5s deduplication and queue depth 3
- [x] Screen-reader progress announcements for lessons, quizzes, challenges, levels, and badges
- [x] Local reminder system with honest limitation copy and once-per-calendar-day suppression
- [x] Automated axe sweep across 9 routes with zero serious or critical violations
- [x] Viewport 320px at 150% font scale layout & horizontal scroll check: **VERIFIED (Browser screenshots reviewed; zero horizontal scroll on body)**

## 7. Modified & New Files
- **Modified:**
  - `package.json`, `package-lock.json`
  - `src/state/types.ts`
  - `src/state/AppState.tsx`
  - `src/core/settings/appearance.ts`
  - `src/core/orbit/constellation/constellation.css`
  - `src/lib/storage.ts`
  - `src/components/Shell.tsx`
  - `src/pages/Settings.tsx`
  - `src/styles/tokens.css`
  - `src/styles/components.css`
  - `src/styles/pages.css`
  - `src/test/storage.test.ts`
  - `src/test/appearance.test.ts`
  - `src/test/Settings.test.tsx`
  - `docs/WORKLOG.md`
- **New Files:**
  - `src/core/a11y/dyslexiaFont.ts`
  - `src/core/a11y/Announcer.tsx`
  - `src/core/a11y/ProgressAnnouncementListener.tsx`
  - `src/core/a11y/progressAnnouncements.ts`
  - `src/core/a11y/useAnnounce.ts`
  - `src/core/reminders/reminders.ts`
  - `src/core/reminders/ReminderBanner.tsx`
  - `src/test/a11y/announcer.test.tsx`
  - `src/test/a11y/reminders.test.ts`
  - `src/test/a11y.matrix.test.tsx`
  - `docs/antigravity/status/STAGE_16_STATUS.md`
  - `src/state/types.ts`
  - `src/state/AppState.tsx`
  - `src/core/settings/appearance.ts`
  - `src/lib/storage.ts`
  - `src/components/Shell.tsx`
  - `src/pages/Settings.tsx`
  - `src/styles/tokens.css`
  - `src/styles/components.css`
  - `src/styles/pages.css`
  - `src/test/storage.test.ts`
  - `src/test/appearance.test.ts`
  - `src/test/Settings.test.tsx`
  - `docs/WORKLOG.md`
- **New Files:**
  - `src/core/a11y/dyslexiaFont.ts`
  - `src/core/a11y/Announcer.tsx`
  - `src/core/a11y/ProgressAnnouncementListener.tsx`
  - `src/core/a11y/progressAnnouncements.ts`
  - `src/core/a11y/useAnnounce.ts`
  - `src/core/reminders/reminders.ts`
  - `src/core/reminders/ReminderBanner.tsx`
  - `src/test/a11y/announcer.test.tsx`
  - `src/test/a11y/reminders.test.ts`
  - `src/test/a11y.matrix.test.tsx`
  - `docs/antigravity/status/STAGE_16_STATUS.md`
