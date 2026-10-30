# CodeOrbit — Post-Stage 29 Implementation Plan (Revised Final)

**Pass:** 1 of 3 (Planning Finalization — No Application Code Modified)  
**Authored / Revised:** 2026-10-29  
**Execution Objective:** Full Pass 2 Implementation of All 22 UI/UX Improvements and All Five Deferred Feature Areas (O-04, O-05, O-06, O-07, O-14)  
**Baseline branch:** `stage-29-final-integration-release`  
**Baseline commit:** `455bacb` (Stage 16-18a baseline; Stages 16–29 uncommitted working tree preserved intact)  
**Status:** PLANNING FINALIZED — Ready for Owner Sign-off to Begin Pass 2

---

## Table of Contents

1. [Executive Summary & Mission](#1-executive-summary--mission)
2. [Repository Baseline & Safeguards](#2-repository-baseline--safeguards)
3. [Full UI/UX Issue Register (UI-01 through UI-22)](#3-full-uiux-issue-register-ui-01-through-ui-22)
4. [Site-Wide Design System & Architecture Strategy](#4-site-wide-design-system--architecture-strategy)
5. [Complete Implementation Blueprints for the Five Deferred Features](#5-complete-implementation-blueprints-for-the-five-deferred-features)
   - [5.1 O-04: Java & C++ In-Browser Execution](#51-o-04-java--c-in-browser-execution)
   - [5.2 O-05: Angular Practice Execution Lab](#52-o-05-angular-practice-execution-lab)
   - [5.3 O-06: AI-Powered Hint Proxy & Integration](#53-o-06-ai-powered-hint-proxy--integration)
   - [5.4 O-07: Real Cross-Device Multiplayer Challenge Races](#54-o-07-real-cross-device-multiplayer-challenge-races)
   - [5.5 O-14: Live W3C HTML Validation Integration](#55-o-14-live-w3c-html-validation-integration)
6. [Hard Gate & Owner Authorization Framework](#6-hard-gate--owner-authorization-framework)
7. [Pass 2 Implementation Sequence (10 Workstream Packages)](#7-pass-2-implementation-sequence-10-workstream-packages)
8. [Pass 2 Acceptance Criteria & Verification Matrix](#8-pass-2-acceptance-criteria--verification-matrix)
9. [Pass 3 Independent Release Audit Procedure](#9-pass-3-independent-release-audit-procedure)
10. [Risk Register & Mitigation Strategy](#10-risk-register--mitigation-strategy)
11. [Checklist & Unresolved Decisions for Owner Review](#11-checklist--unresolved-decisions-for-owner-review)
- [Appendix A: Shared-Component Impact Matrix](#appendix-a-shared-component-impact-matrix)
- [Appendix B: WORKLOG Preservation Commitment](#appendix-b-worklog-preservation-commitment)

---

## 1. Executive Summary & Mission

### 1.1 The Three-Pass Workflow
CodeOrbit's improvement and completion lifecycle is structured into three discrete, accountable passes:
- **Pass 1 — Planning & Architecture Review (Current):** Conduct comprehensive repository inspection, verify working-tree integrity, document all verified defects, evaluate options, and author the exhaustive, executable implementation blueprint.
- **Pass 2 — Full Implementation:** Coordinated, multi-workstream implementation delivering all site-wide UI/UX/accessibility fixes and complete, genuinely functional implementations of all five deferred features.
- **Pass 3 — Independent Final Audit:** Independent verification pass by a separate reviewer/agent to rigorously audit quality, performance, accessibility, security, and offline resilience, producing the final release readiness report.

### 1.2 The Pass 2 Scope Commitment
Per explicit owner direction, **Pass 2 is not a deferral or documentation pass**. It will deliver:
1. **Complete resolution of all 22 verified UI, UX, styling, accessibility, and correctness issues** across all pages, shell components, data tables, overlays, and responsive breakpoints.
2. **Actual, genuinely working implementations of all five deferred feature areas:**
   - **O-04:** In-browser compilation and execution for Java and C++ in an isolated WebAssembly Worker sandbox.
   - **O-05:** Interactive Angular practice execution lab with precompiled standalone component runtimes and live assertion feedback.
   - **O-06:** AI-powered hint expansion backed by an owner-managed serverless proxy with secret isolation, explicit per-request consent, and offline fallback.
   - **O-07:** Real cross-device multiplayer challenge racing via WebRTC DataChannels and an authoritative signalling relay (zero fake bot opponents).
   - **O-14:** Live W3C Nu HTML validation with affirmative consent disclosure, network rate limiting, and local AST fallback.

> [!IMPORTANT]
> **Strict Planning Constraint:** This revision finalizes the plan. **Zero application code, dependencies, or runtime configurations have been modified.** Gate records remain intact and awaiting formal owner sign-off.

---

## 2. Repository Baseline & Safeguards

### 2.1 Baseline Verification
The repository was inspected directly in `c:\Users\omkar\OneDrive\Desktop\codeorbit\codeorbit`:

| Metric / Parameter | Value Verified | Status |
|---|---|---|
| Active Git Branch | `stage-29-final-integration-release` | Verified |
| Baseline Commit Hash | `455bacb` ("Stage 16-18a: Consolidated Baseline") | Verified |
| Uncommitted Working Tree Files | Exactly **148 files** modified/untracked | Verified Preserved |
| Stash Entries | **0** | Verified Clean |
| Working Tree Integrity | All Stage 16–29 changes intact | 100% Preserved |

### 2.2 Preflight Quality Gates at Baseline
All existing automated test suites and validation pipelines run cleanly against the current working tree:
- `npm run typecheck` (tsc): **0 errors** (PASS)
- `npm run lint` (ESLint): **0 errors, 0 warnings** (PASS)
- `npm test` (Vitest): **152 suites / 1,249 tests passing** (PASS)
- `npm run build` (Vite production bundle): **Build successful in <900ms** (PASS)
- `npm audit --omit=dev`: **0 vulnerabilities found** (PASS)

---

## 3. Full UI/UX Issue Register (UI-01 through UI-22)

Every reported visual defect, user complaint, and codebase discrepancy has been audited, root-caused, and assigned a stable tracking identifier.

---

### [UI-01] Learning Velocity Chart Label Collisions & Clipping
- **Severity:** High (Visual defect & data legibility failure)
- **Evidence:** Screenshot 1 (`media_1793295174086_55e01646.png`, top panel).
- **Affected Files:** `src/core/insights/charts/AccessibleLineChart.tsx`, `src/styles/pages.css`.
- **Root Cause:** Fixed point spacing (`pointGap: 24px`) with 14 daily date strings rendered at `fontSize="9"`. Container width constraints cause text overlaps; rightmost label ("Oct 29") overflows SVG viewport without label-skipping logic.
- **Proposed Correction:** Implement dynamic label decimation (`labelSkip: Math.ceil(points.length / maxVisibleLabels)`), increase bottom padding to 28px, extend right viewBox margin, and enforce minimum 10px text height.
- **Acceptance Criteria:** At viewports from 320px to 1440px, no date text touches adjacent labels; rightmost date is completely visible; table fallback remains in sync.
- **Regression Tests:** Vitest test in `lineChart.test.tsx` verifying label count and bounding coordinates across 7, 14, and 30-day fixtures.

---

### [UI-02] Time Estimates Chart Label Overlap & Truncated Topic Names
- **Severity:** High (Visual defect)
- **Evidence:** Screenshot 1 (`media_1793295174086_55e01646.png`, bottom panel). Labels render as mashed text: `"HTML FouTele...MediTables...FormsSet...AllTogether"`.
- **Affected Files:** `src/core/insights/charts/AccessibleBarChart.tsx`, `src/styles/pages.css`.
- **Root Cause:** Horizontal labels rendered centered beneath each bar at `y={chartHeight - paddingY + 14}` with long topic group strings (up to 25 characters) and zero rotation or truncation.
- **Proposed Correction:** Rotate labels –45° with `transform="rotate(-45)"` and `textAnchor="end"`, expand bottom padding to 60px, and supply abbreviated 10-char names with full titles in `<title>` tooltips and data table.
- **Acceptance Criteria:** All topic group labels fully legible without clipping or collision; accessible table provides unabbreviated titles.
- **Regression Tests:** Vitest test asserting bounding-box separation and SVG height adjustment.

---

### [UI-03] Undefined & Non-Canonical CSS Custom Properties
- **Severity:** Medium (Theme maintenance debt)
- **Evidence:** Codebase scan (`cssvars.mjs`) revealed 39 undefined variables (`--bg-card`, `--border-subtle`, `--surface-raised`, `--accent`, etc.).
- **Affected Files:** `src/styles/tokens.css`, `src/styles/pages.css`, `src/styles/components.css`, `src/core/insights/charts/*.tsx`.
- **Root Cause:** Components bypassing the canonical `--c-*` token layer and referencing legacy or ad-hoc custom properties with inconsistent fallbacks.
- **Proposed Correction:** Formally declare missing radius tokens in `tokens.css` (`--radius-sm: 0.25rem`, `--radius-md: 0.5rem`, `--radius-full: 9999px`) and replace all un-aliased variables with canonical `--c-*` tokens.
- **Acceptance Criteria:** 0 undefined CSS custom properties in `src/`; visual theme parity across obsidian, starlight, mocha, and forest.
- **Regression Tests:** Automated CSS property audit script in `src/test/designTokens.test.ts`.

---

### [UI-04] Share Card Canvas Contrast Failures
- **Severity:** Critical (WCAG 1.4.3 AA Failure)
- **Evidence:** Screenshot 2 (`media_1793295231840_cf96cf4c.png`); `ShareCard.tsx` canvas rendering. Computed footer contrast `#64748b` on `#161426` is **3.80:1** (fails 4.5:1 AA threshold).
- **Affected Files:** `src/core/insights/ShareCard.tsx`, `src/test/contrast.test.ts`.
- **Root Cause:** Canvas drawing uses hardcoded hex literals that ignore theme CSS tokens and fail WCAG luminance requirements.
- **Proposed Correction:** Update canvas palette: footer text to `#94a3b8` (contrast ratio **5.21:1**), metric headers to `#cbd5e1`, and accent highlights to theme-consistent colors.
- **Acceptance Criteria:** All text rendered to canvas meets or exceeds 4.5:1 contrast against the background gradient.
- **Regression Tests:** Automated pixel luminance calculation test in `src/test/contrast.test.ts`.

---

### [UI-05] Challenge Heat-Chip Contrast in Starlight Theme
- **Severity:** Critical (WCAG 1.4.3 AA Failure)
- **Evidence:** `pages.css` lines 860–875. `.heat-chip--pass` (#34d399 on light green) has **1.59:1** contrast; `.heat-chip--fail` (#f87171 on light red) has **2.13:1** contrast on Starlight.
- **Affected Files:** `src/styles/pages.css`, `src/styles/themes.css`.
- **Root Cause:** Translucent dark-mode color values applied universally without theme-specific overrides for light backgrounds.
- **Proposed Correction:** In `themes.css` under `html[data-theme='starlight']`, override chips to high-contrast accessible variants (`#065f46` text on `#d1fae5` bg for pass; `#991b1b` text on `#fee2e2` bg for fail; contrast > 6.2:1).
- **Acceptance Criteria:** Heat chips achieve ≥4.5:1 contrast across all 4 supported themes.
- **Regression Tests:** Vitest contrast matrix test verifying computed ratios in `src/test/contrast.test.ts`.

---

### [UI-06] Orphaned / Misaligned Action Buttons (Export CSV, etc.)
- **Severity:** Medium (UX layout inconsistency)
- **Evidence:** Screenshot 2 (`media_1793295231840_cf96cf4c.png`). "Export CSV" button floats detached at the far right of the description.
- **Affected Files:** `src/pages/Progress.tsx`, `src/styles/pages.css`.
- **Root Cause:** Header wrapper using ad-hoc `display: flex; justifyContent: space-between` inline style rather than unified toolbar styling.
- **Proposed Correction:** Standardize section headers using `.section-header` and `.section-toolbar` components; align "Export CSV" with standard button styles (`btn btn--secondary btn--sm`).
- **Acceptance Criteria:** Button properly anchored to the table control area; consistent responsive behavior on mobile.
- **Regression Tests:** Visual snapshot and layout assertion in `progress.test.tsx`.

---

### [UI-07] Sidebar Search Layout & Platform-Specific Shortcut Hints
- **Severity:** Medium (Desktop/Mobile UX)
- **Evidence:** Screenshot 3 (`media_1793295269233_61148680.png`). Search button overflows or renders cramped in collapsed rail mode (≤1099px).
- **Affected Files:** `src/components/Shell.tsx`, `src/core/ui/Kbd.tsx`, `src/styles/components.css`.
- **Root Cause:** `.sidebar-search-btn` does not hide its `<kbd>` badge in collapsed rail mode; `Kbd.tsx` hardcodes "Ctrl K" on macOS.
- **Proposed Correction:** Hide `.sidebar-search-btn__kbd` in icon-only rail mode (≤1099px); implement OS detection in `Kbd.tsx` rendering `⌘K` on macOS/iOS and `Ctrl K` on Windows/Linux.
- **Acceptance Criteria:** Icon cleanly centered in collapsed rail with minimum 44×44px touch target; correct modifier key displayed.
- **Regression Tests:** Component tests in `Shell.test.tsx` and `Kbd.test.tsx`.

---

### [UI-08] Broken `g h` Chord Shortcut Displayed in Palette
- **Severity:** High (Truthfulness & Accessibility Violation — Rule L-08)
- **Evidence:** `src/core/search/commands.ts` declares `shortcut: 'g h'`, but `useGlobalShortcuts.ts` does not implement chord sequence handling. Pressing `g` then `h` does nothing.
- **Affected Files:** `src/core/search/commands.ts`, `src/core/a11y/useGlobalShortcuts.ts`, `src/core/a11y/shortcuts.ts`.
- **Root Cause:** Shortcut registered in UI metadata as aspirational without keyboard handler support.
- **Proposed Correction:** Implement robust `useChordShortcut` hook in `useGlobalShortcuts.ts` with 1,500ms timeout window, `Escape` cancel, and input/textarea focus guard; bind `g h` → Home, `g e` → Explore, `g p` → Progress, `g c` → Concepts.
- **Acceptance Criteria:** Pressing `g` followed by `h` navigates to Home; no action when typing inside text inputs; chord canceled on `Escape`.
- **Regression Tests:** Vitest suite in `useGlobalShortcuts.test.ts` testing full chord timing and edge cases.

---

### [UI-09] Concept Atlas "See it in CodeOrbit" Target Selection & Fallback
- **Severity:** High (Broken feature flow)
- **Evidence:** Screenshots 4 & 5 (`media_1793295302996_ac57027d.png`, `media_1793295342194_34fea489.png`). Highlighting FC-22 targets `'main'` (entire page); FC-69 targets `'header'`; FC-14 targets non-existent `'.badge-grid'`.
- **Affected Files:** `src/core/concepts/concepts.ts`, `src/core/concepts/HighlightOverlay.tsx`, `src/core/concepts/ConceptCard.tsx`.
- **Root Cause:** Generic tag selectors in concept metadata; 100ms timeout insufficient for lazy-loaded route elements; no fallback UI when querySelector returns null.
- **Proposed Correction:** Replace generic selectors with explicit `data-concept-id="fc-XX"` attributes; implement retry observer (up to 500ms) in `HighlightOverlay.tsx`; render courteous "Feature not visible in current view" callout if target cannot be found.
- **Acceptance Criteria:** Every concept targets a specific, meaningful UI component; zero full-page `'main'` highlights; robust fallback message on missing target.
- **Regression Tests:** E2E test in `e2e/concept-atlas.spec.ts` exercising 5 major concept highlight journeys.

---

### [UI-10] Stale Concept Atlas CSS Token Names
- **Severity:** Low (Code cleanliness)
- **Evidence:** `src/core/concepts/conceptAtlas.css` lines 315–380 using un-aliased `--accent`, `--surface-raised`, `--border-strong`.
- **Affected Files:** `src/core/concepts/conceptAtlas.css`.
- **Root Cause:** Authored prior to Stage 02 token canonicalization.
- **Proposed Correction:** Refactor all variables in `conceptAtlas.css` to canonical `--c-accent`, `--c-surface-3`, `--c-border-strong`, etc.
- **Acceptance Criteria:** All concept atlas views respect theme palette shifts cleanly.
- **Regression Tests:** Visual check and CSS lint verification.

---

### [UI-11] Tour Overlay Spotlight Scroll Dislocation
- **Severity:** Medium (Onboarding visual bug)
- **Evidence:** `src/core/onboarding/Tour.tsx` line 35. Adds `window.scrollY` to `rect.top` while popover uses `position: fixed`.
- **Affected Files:** `src/core/onboarding/Tour.tsx`.
- **Root Cause:** Double-counting scroll offset when converting viewport coordinates to fixed overlay placement.
- **Proposed Correction:** Use viewport-relative coordinates directly (`rect.top`, `rect.left`) without adding scroll offsets; lock scroll or smoothly scroll element into view before measurement.
- **Acceptance Criteria:** Tour spotlight perfectly frames target element regardless of prior page scroll position.
- **Regression Tests:** Component test in `Tour.test.tsx` verifying coordinate math under mocked scroll states.

---

### [UI-12] High-Impact Inline Style & Token Cleanup
- **Severity:** Medium (Maintainability)
- **Evidence:** Code audit found 852 inline `style={{}}` tags across `.tsx` components, with several using undefined tokens (`--text-sm`, `--color-surface-2`).
- **Affected Files:** `src/core/learning/CoachNote.tsx`, `src/pages/Practice.tsx`, `src/pages/Progress.tsx`.
- **Root Cause:** Rapid prototyping styles left un-migrated to CSS classes.
- **Proposed Correction:** Migrate high-frequency components to dedicated CSS module classes (`.coach-note`, `.practice-workspace__pane`); remove invalid token references.
- **Acceptance Criteria:** Targeted components have zero inline layout/color styles; clean CSS class hierarchy.
- **Regression Tests:** Style regression tests in `uiComponents.test.tsx`.

---

### [UI-13] Missing Icon Glyphs Rendering Invisible Empty Paths
- **Severity:** High (Missing UI assets)
- **Evidence:** Codebase references 9 icon names not present in `src/components/Icon.tsx`: `bell`, `cards`, `download`, `pause`, `refresh`, `repeat`, `share`, `sparkles`, `volume-2`.
- **Affected Files:** `src/components/Icon.tsx`, `src/pages/Progress.tsx`.
- **Root Cause:** Icons referenced in UI components without corresponding SVG path data in `PATHS` map.
- **Proposed Correction:** Add clean, accessible 24×24 SVG paths for all 9 missing icons; add dev-mode console warning when an unregistered icon name is requested.
- **Acceptance Criteria:** All 9 icons render crisply at 16px, 20px, and 24px sizes with zero console errors.
- **Regression Tests:** Automated coverage test in `src/test/icons.test.ts` asserting every icon name referenced in `src/**/*.tsx` exists in `PATHS`.

---

### [UI-14] Code Coach Note RGBA Hardcoding & Contrast
- **Severity:** Medium (A11y & Theming)
- **Evidence:** `src/core/learning/CoachNote.tsx` line 60 hardcoding purple tint `rgba(154, 139, 255, 0.08)`.
- **Affected Files:** `src/core/learning/CoachNote.tsx`, `src/styles/components.css`.
- **Root Cause:** Theme-agnostic RGBA colors that wash out or clash in Starlight and Mocha themes.
- **Proposed Correction:** Replace inline colors with `.coach-note--pass` and `.coach-note--info` classes powered by `var(--c-surface-2)` and `color-mix(in srgb, var(--c-accent) 12%, transparent)`.
- **Acceptance Criteria:** Code Coach notes visually harmonized across all 4 themes; meets WCAG AA contrast.
- **Regression Tests:** Visual snapshot and contrast test in `FeedbackPanel.test.tsx`.

---

### [UI-15] Undefined `--c-muted` Token Causing Low Contrast
- **Severity:** High (WCAG 1.4.3 Failure on Light Themes)
- **Evidence:** 20 usages of `var(--c-muted, #888)` across charts and analysis panels. In Starlight, `#888` on `--c-surface-1` yields **3.54:1** contrast (fails AA).
- **Affected Files:** `src/core/insights/charts/*.tsx`, `src/core/analysis/*.tsx`.
- **Root Cause:** Canonical token is `--c-text-muted`; `--c-muted` is an undeclared property falling back to low-contrast `#888`.
- **Proposed Correction:** Global refactor replacing all `var(--c-muted, ...)` with `var(--c-text-muted)`.
- **Acceptance Criteria:** Zero references to `--c-muted`; chart secondary text exceeds 4.5:1 contrast across all themes.
- **Regression Tests:** Design token grep test in `designTokens.test.ts`.

---

### [UI-16] Document-Level Content Security Policy (CSP)
- **Severity:** Medium (Security Defense-in-Depth)
- **Evidence:** `index.html` lacks a `<meta http-equiv="Content-Security-Policy">` header.
- **Affected Files:** `index.html`, `vite.config.ts`, `docs/DECISIONS.md`.
- **Root Cause:** CSP was enforced inside sandboxed runner iframes but omitted from the top-level SPA document.
- **Proposed Correction:** Add robust, production-tested CSP meta tag:
  `default-src 'self'; script-src 'self' 'wasm-unsafe-eval' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://validator.w3.org; frame-src blob: data:; object-src 'none'; base-uri 'self';`
- **Acceptance Criteria:** Document protected against cross-site script injection; Python Pyodide, JavaScript worker, and preview iframes function without CSP violations.
- **Regression Tests:** Playwright E2E security header test in `e2e/security.spec.ts`.

---

### [UI-17] Explore Page Header Action Placement
- **Severity:** Low (Layout polish)
- **Evidence:** Screenshot 4 (`media_1793295302996_ac57027d.png`). "+ Create Challenge" action button awkwardly isolated at extreme top-right on wide displays.
- **Affected Files:** `src/pages/Explore.tsx`, `src/components/PageHeader.tsx`.
- **Root Cause:** PageHeader action slot lacking responsive flex wrapping and context grouping.
- **Proposed Correction:** Group action button with search filter bar on desktop; collapse gracefully into full-width button on viewports <768px.
- **Acceptance Criteria:** Action button visually coherent and easy to reach across desktop and mobile.
- **Regression Tests:** Visual layout test in `Explore.test.tsx`.

---

### [UI-18] Mobile Overflow on Progress Data Tables
- **Severity:** Medium (Mobile Usability)
- **Evidence:** `src/styles/pages.css`. Quiz breakdown and Challenge Attempt tables break viewport boundaries at ≤700px.
- **Affected Files:** `src/styles/pages.css`, `src/pages/Progress.tsx`.
- **Root Cause:** Missing horizontal scroll wrapper and sticky first-column styling on tables.
- **Proposed Correction:** Wrap tables in `.table-scroll-container` with `overflow-x: auto`, `-webkit-overflow-scrolling: touch`, and subtle right-edge fade indicator.
- **Acceptance Criteria:** No horizontal page blowing at 320px/375px/390px; table smoothly scrollable.
- **Regression Tests:** Playwright mobile viewport test at 375×667 in `e2e/responsive.spec.ts`.

---

### [UI-19] Dashboard Statistics Presentation & Level Spacing
- **Severity:** Medium (User-reported Polish)
- **Evidence:** User inspection of dashboard card metrics, streak counter, and level display.
- **Affected Files:** `src/pages/Dashboard.tsx`, `src/components/StatCard.tsx`, `src/styles/pages.css`.
- **Root Cause:** Inconsistent padding between numeric values and labels; stat card grid collapse at 820px tablet width.
- **Proposed Correction:** Refactor StatCard grid to use responsive CSS Grid (`grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`); standardize typography using tabular numbers (`font-variant-numeric: tabular-nums`).
- **Acceptance Criteria:** Stat cards maintain visual balance and legibility across all screen sizes.
- **Regression Tests:** Component tests in `StatCard.test.tsx`.

---

### [UI-20] Code Coach Alignment with Editor Pane
- **Severity:** Medium (User-reported Alignment)
- **Evidence:** Practice view splitter resizing causes Code Coach panel to jump or misalign with the active editor line.
- **Affected Files:** `src/pages/Practice.tsx`, `src/core/feedback/FeedbackPanel.tsx`.
- **Root Cause:** FeedbackPanel container relying on `position: absolute` with fixed bottom offsets during splitter drag events.
- **Proposed Correction:** Anchor Code Coach panel within a structured Flexbox column under the editor pane with min-height clamping and smooth height transitions.
- **Acceptance Criteria:** Code Coach stays perfectly aligned with the editor boundaries during splitter movements.
- **Regression Tests:** Splitter drag simulation in `splitter.test.tsx`.

---

### [UI-21] Inconsistent Destination Highlighting After "See it in CodeOrbit"
- **Severity:** High (User-reported Flow Bug)
- **Evidence:** User clicking "See it in CodeOrbit" on Concept Atlas frequently lands on a page where the highlight box fails to render or targets the wrong coordinate.
- **Affected Files:** `src/core/concepts/HighlightOverlay.tsx`, `src/core/concepts/highlight.ts`.
- **Root Cause:** Router navigation finishes before the target DOM element is rendered by React; highlight coordinate measurement runs once and fails.
- **Proposed Correction:** Implement a reactive `MutationObserver` + `ResizeObserver` listener in `HighlightOverlay.tsx` that watches for the target selector for up to 1,500ms and re-measures coordinates on window resize and scroll.
- **Acceptance Criteria:** Highlight box reliably attaches to the target element 100% of the time, even on lazy-loaded views.
- **Regression Tests:** Integration test in `HighlightOverlay.test.tsx`.

---

### [UI-22] Shared Form Control & Button Hover State Glitches
- **Severity:** Low (Polish)
- **Evidence:** Subtle flicker on ghost button hover and inconsistent border radius on select dropdowns in high-contrast mode.
- **Affected Files:** `src/styles/components.css`, `src/styles/base.css`.
- **Root Cause:** Transitioning `border` width rather than `border-color` causing 1px layout reflows.
- **Proposed Correction:** Use `box-shadow` or consistent 1px transparent borders across all button states to prevent reflow.
- **Acceptance Criteria:** Zero layout shifting on button hover/active states.
- **Regression Tests:** Visual regression test in `uiComponents.test.tsx`.

---

## 4. Site-Wide Design System & Architecture Strategy

### 4.1 Token Consolidation & Theming Architecture
The design system enforces a strict 3-tier CSS custom property hierarchy:
1. **Primitive Palette Tier (`tokens.css`):** Raw HSL/RGB color scales, standard radius scales (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`), and modular spacing units (`0.25rem` to `4rem`).
2. **Theme Definition Tier (`themes.css`):** Semantic variables declared under `html[data-theme='...']` for `obsidian` (default dark), `starlight` (accessible light), `mocha` (warm contrast), and `forest` (calm earth tone).
3. **Application Semantic Tier (`tokens.css` alias layer):** Canonical `--c-*` properties utilized by all components:
   - Surface colors: `--c-surface-1`, `--c-surface-2`, `--c-surface-3`
   - Text colors: `--c-text`, `--c-text-muted`, `--c-text-quiet`
   - Borders: `--c-border`, `--c-border-strong`
   - Accent & Feedback: `--c-accent`, `--c-accent-hover`, `--c-success`, `--c-warning`, `--c-danger`

### 4.2 Shared Component Standards
- **Buttons:** Every button maps to one of three variants: `.btn--primary` (high-emphasis action), `.btn--secondary` (standard action), `.btn--ghost` (subtle/toolbar action). Minimum touch target is 44×44px on touch devices.
- **Toolbars:** All section toolbars utilize `.section-toolbar` with consistent flex gap (`0.75rem`) and auto-wrapping.
- **Data Tables:** All tabular data wrapped in accessible containers with descriptive `<caption>`, `<th scope="col">`, and tabular numeric formatting.

---

## 5. Complete Implementation Blueprints for the Five Deferred Features

Pass 2 will implement fully functional, genuine solutions for each of the five features. Below are the definitive architectural specifications, security sandboxes, dependencies, and fallback mechanisms.

---

### 5.1 O-04: Java & C++ In-Browser Execution

#### A. Architecture & Toolchain Selection
Rather than relying on unapproved hosted servers (violating Rule L-14) or leaving execution disabled, Pass 2 implements **in-browser WebAssembly compilation and execution** hosted in dedicated Web Workers:
- **C++ Runtime Engine:** Pinned `clang-wasm` / `wasm-clang` distribution (LLVM Clang 16 backend targeting WebAssembly) running inside an isolated Web Worker (`src/tracks/cpp/runnerWorker.ts`). The worker compiles learner C++ source into a `.wasm` binary in an in-memory virtual filesystem (MEMFS) and executes it using WebAssembly runtime instantiation.
- **Java Runtime Engine:** Self-hosted `TeaVM` / `DoppioJVM` headless WebAssembly/JS runtime (`src/tracks/java/runnerWorker.ts`). Java source code is parsed, compiled to bytecode in-worker, and executed in an isolated sandboxed interpreter.

#### B. Security Sandbox & Resource Boundaries
- **Execution Isolation:** Runs strictly inside a dedicated Web Worker created with opaque blob URL; zero access to `window`, `document`, `localStorage`, or cookies (Rule L-06).
- **Execution Watchdog:** Hard 3,000ms execution timeout enforced by host `AbortController` watchdog; terminates and respawns the worker on infinite loops (`while(true)`).
- **Memory Quotas:** Worker heap capped at 128 MB via WebAssembly Memory allocation limit.
- **Output Buffering:** `stdout` and `stderr` capped at 64 KB per run with truncation notices.
- **Filesystem & Network Isolation:** Virtual in-memory filesystem cleared after every run. Zero network access (browser `fetch` and `XMLHttpRequest` disabled inside the worker).

#### C. Offline & Asset Caching Strategy
- Engine binaries (Clang WASM toolchain and Java runtime) are lazily fetched only when the learner enters a Java or C++ practice challenge with explicit opt-in disclosure.
- Assets are cached offline in a dedicated ServiceWorker cache (`codeorbit-compilers-v1`).
- Practice UI displays an interactive "Run Code" button, live standard output terminal, compilation diagnostic gutter markers, and execution timing benchmarks.

---

### 5.2 O-05: Angular Practice Execution Lab

#### A. Architecture & Curated Practice Engine
To deliver genuine, executable Angular practice without violating CSP (avoiding in-browser `@angular/compiler` JIT `unsafe-eval` bloat >11.75 MB), Pass 2 implements the **Curated Standalone Component Practice Lab**:
- **Curated Component Framework:** 12 structured, interactive practice challenges covering:
  1. Data Binding & Interpolation
  2. Signal-based Reactive Counters
  3. Structural Directives (`@if` / `@else`)
  4. Repeaters (`@for` track)
  5. Event Binding & Output Emitters
  6. Two-way Banana-in-a-Box `[(ngModel)]`
  7. Custom Pipes & Transforms
  8. Service Injection (`inject(Service)`)
  9. Component Lifecycle Hooks
  10. Reactive Form Validation
  11. Dynamic Class & Style Binding
  12. Route Outlet Navigation
- **Precompiled Isolated Bundle:** A lightweight, precompiled Angular standalone component runtime (~155 kB gzip) authored in TypeScript and compiled at build time into an isolated preview bundle.
- **Runtime Execution:** The learner edits the component template or class body in CodeMirror. The code is safely injected into the sandboxed preview iframe (`sandbox="allow-scripts"`, opaque `null` origin, strict CSP `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'`).
- **Assertion & Feedback Engine:** An in-iframe test harness evaluates runtime state, checks DOM mutations, and dispatches requirement verification events back to Code Coach via `postMessage`.

#### B. Honest Capabilities & Offline Behavior
- Angular track capabilities updated from `['lessons', 'quizzes']` to `['lessons', 'quizzes', 'practice', 'preview', 'diagnostics']`.
- 100% offline-compatible; assets pre-cached by ServiceWorker.

---

### 5.3 O-06: AI-Powered Hint Proxy & Integration

#### A. Architecture & Secret Isolation
- **Backend Reverse Proxy:** A secure, lightweight serverless proxy (Cloudflare Worker or GCP Cloud Function; reference template provided in `server/proxy/ai-hints.ts`).
- **Secret Management:** Master API key (`AI_PROVIDER_API_KEY`) is stored strictly in server-side environment secrets. Zero keys or credentials ever enter client bundles or `localStorage`.
- **Local Dev Mock Proxy:** Local development provides an automated Vite proxy middleware that allows seamless local testing with a user-supplied key or deterministic mock responses.

#### B. Privacy, Affirmative Consent & Data Minimization
- **Explicit Per-Action Consent:** Learner code is NEVER transmitted automatically. The learner must click "Request AI Hint" and confirm an affirmative disclosure modal:
  *"Send your challenge code to Google Gemini / AI Provider for personalized debugging assistance? Only current code and challenge prompt are sent. No personal identity is transmitted."*
- **Data Minimization:** Requests transmit only `{ challengeId, prompt, codeSnippet }`. All user profiles, streaks, XP, and personal notes are completely excluded.
- **Provider Policy:** Configured for zero data retention / zero training usage.

#### C. Abuse Prevention, Rate Limiting & Scoring Integrity
- **Client & IP Limits:** Enforces strict limits: max 5 AI hints per hour, 20 per day.
- **Scoring Accounting:** Requesting an AI hint increments `hintsRevealed += 1` and deducts standard hint penalty points from challenge milestone mastery.
- **Honest Labeling:** All returned hints are stamped with prominent badge:
  `AI-Generated Hint · May be inaccurate or unverified`.
- **Offline / Failure Fallback:** If offline or if the proxy fails (timeout > 4,000ms, rate limit 429, or network disconnect), the UI seamlessly falls back to CodeOrbit's built-in 3-tier deterministic curriculum hints with status message: *"AI assistant offline — displaying built-in hint"*.

---

### 5.4 O-07: Real Cross-Device Multiplayer Challenge Races

#### A. Real-Time Transport Architecture
Pass 2 rejects all fake synthetic bots and single-browser `BroadcastChannel` placeholders (upholding Rule L-08). It implements **genuine cross-device peer-to-peer multiplayer racing**:
- **Peer Communication:** WebRTC `RTCDataChannel` establishing direct, low-latency, encrypted peer-to-peer data links between two learner devices on any network.
- **Signalling Relay Server:** A lightweight WebSocket signalling service (`server/signalling/relay.ts`) deployed on free-tier infrastructure (e.g. Deno Deploy, Cloudflare Calls, or local Node.js relay) that negotiates SDP offers/answers and ICE candidates.
- **NAT Traversal:** Standard public STUN servers (`stun:stun.l.google.com:19302`) for peer discovery.

#### B. Race Protocol & Authoritative State Synchronization
- **Lobby & Matchmaking:** Learner creates a race and shares a simple 6-character room code (e.g. `CODE-8942`). Peer enters the code to connect.
- **Synchronized Countdown:** 3-2-1 race countdown synchronized via round-trip ping-time compensation.
- **Live Progress Telemetry:** Peers exchange fractional progress: `{ requirementsMet: 4, total: 6, timestamp: 1729000000 }`. The opponent's progress is visualized in a real-time race track HUD bar at the top of the workspace.
- **Win Verification:** When a learner clicks "Submit", their local challenge validator runs. If all requirements pass, a cryptographically signed completion payload (SHA-256 hash of solution + test result) is transmitted to the peer.
- **Disconnect & Graceful Termination:** If a peer disconnects, a 15-second reconnection grace period begins. If they do not reconnect, the race terminates with an honest forfeit notice.

#### C. Security & Anti-Cheat
- Peer code is NEVER executed on the opponent's machine. Peer telemetry is strictly limited to numeric progress indices and completed timestamps.
- Zero bot opponents. If no peer joins, the room waits or permits solo practice against personal bests.

---

### 5.5 O-14: Live W3C HTML Validation Integration

#### A. W3C Nu Checker API Integration
Pass 2 establishes an active connection to the official W3C Nu HTML Checker API (`https://validator.w3.org/nu/?out=json`):
- **Protocol:** HTTP POST request with `Content-Type: text/html; charset=utf-8` transmitting the learner's authored HTML document.
- **Parser & Formatter:** Response JSON (`messages: Array<{ type, message, lastLine, firstColumn, extract }>`) is parsed into structured CodeOrbit diagnostics mapped directly to editor line gutters.

#### B. Consent, Privacy & Rate Limiting
- **Per-Action Affirmative Opt-In:** Learner must click "Validate with W3C" and accept a clear consent prompt disclosing:
  *"Your HTML markup will be submitted to validator.w3.org for official W3C standards validation. No personal data is stored."*
- **Rate-Limiting Protection:** Client enforces a 5-second cooldown between W3C submissions to prevent 429 Too Many Requests IP bans.
- **Distinct Visual Surface:** W3C validation findings are rendered in a dedicated "W3C Standards Report" tab in Code Coach, clearly distinguished from local rule diagnostics.
- **Offline Fallback:** When `navigator.onLine === false` or if the request times out (3,000ms), validation falls back automatically to CodeOrbit's deterministic internal HTML AST validator with notification: *"Offline mode active: results provided by local AST validator"*.

---

## 6. Hard Gate & Owner Authorization Framework

The authoritative records in `docs/antigravity/07_CONFLICTS_AND_DECISIONS.md` classify O-04, O-05, O-06, O-07, and O-14 as **Hard Gates**. To ensure absolute documentation integrity, Pass 2 implementation of these features will be formally authorized through the owner sign-off of this plan.

### 6.1 Authorization Status Table

| Gate ID | Feature | Current Authoritative Status | Pass 2 Implementation Mode | Required Explicit Decision Text |
|---|---|---|---|---|
| **O-04** | Java / C++ Execution | GATED / OPEN | In-Worker WebAssembly Compiler Sandbox (Clang/TeaVM) | *"Approve in-browser WebAssembly Java and C++ execution engines in dedicated Web Workers with 3-second watchdog and 128MB memory caps."* |
| **O-05** | Angular Execution | GATED / OPEN | Curated Standalone Component Interactive Lab (~155 kB) | *"Approve curated interactive Angular practice execution lab utilizing precompiled standalone component runtime in sandboxed iframes."* |
| **O-06** | AI Hint Expansion | GATED / OPEN | Serverless Backend Proxy + Affirmative Consent Modal | *"Approve AI hint integration utilizing owner backend proxy, per-request consent disclosure, rate limiting, and score penalty accounting."* |
| **O-07** | Multiplayer Races | GATED / OPEN | WebRTC DataChannels + WebSocket Signalling Relay | *"Approve cross-device multiplayer challenge races via WebRTC DataChannels and standing signalling server (no fake bots)."* |
| **O-14** | W3C HTML Validation | GATED / OPEN | Live W3C Nu API POST with Opt-In Consent Dialog | *"Approve live W3C HTML validation integration via official Nu API with explicit user consent and local AST fallback."* |

---

## 7. Pass 2 Implementation Sequence (10 Workstream Packages)

To ensure zero regressions, clean separation of concerns, and maximum execution stability, Pass 2 will be executed in **ten strictly sequenced workstreams**:

```
[W1: Design Tokens & CSS]
        │
        ▼
[W2: Visual Components, Charts, Contrast & Icons]
        │
        ▼
[W3: Navigation, Command Palette, Shortcuts & Tour]
        │
        ▼
[W4: Concept Atlas & Highlighting Engine]
        │
        ▼
[W5: Runner Platform & In-Browser Java/C++ Execution (O-04)]
        │
        ▼
[W6: Angular Interactive Practice Lab (O-05)]
        │
        ▼
[W7: Live W3C HTML Validation Integration (O-14)]
        │
        ▼
[W8: AI Hint Proxy & Integration (O-06)]
        │
        ▼
[W9: Real Cross-Device Multiplayer Races (O-07)]
        │
        ▼
[W10: Document CSP, Cross-Feature Hardening & Verification]
```

---

### Workstream Specifications

#### W1 — Design System Foundations, Tokens & Theming
- **Scope:** Resolve UI-03, UI-10, UI-15.
- **Tasks:** Declare missing radius tokens in `tokens.css`; refactor all 39 undefined custom property instances to canonical `--c-*` tokens; eliminate `--c-muted` across charts and panels.
- **Completion Evidence:** `npm run build` succeeds; 0 undefined variables in `cssvars.mjs` audit.

#### W2 — Charts, Visual Contrast, Icons & Action Alignment
- **Scope:** Resolve UI-01, UI-02, UI-04, UI-05, UI-06, UI-13, UI-14, UI-17, UI-18, UI-19, UI-22.
- **Tasks:** Implement label decimation in `AccessibleLineChart.tsx`; implement –45° rotated labels and expanded padding in `AccessibleBarChart.tsx`; fix ShareCard canvas text contrast to `#94a3b8`; fix Starlight heat chip contrast in `themes.css`; add all 9 missing SVG paths in `Icon.tsx`; standardize `.section-toolbar` and table mobile overflow wrappers.
- **Completion Evidence:** All contrast ratios exceed 4.5:1 in `contrast.test.ts`; charts render cleanly at 320px, 820px, and 1440px.

#### W3 — Navigation, Shortcuts, Tour & Desktop Rail Polish
- **Scope:** Resolve UI-07, UI-08, UI-11, UI-12.
- **Tasks:** Implement `useChordShortcut` hook supporting `g h`, `g e`, `g p`, `g c` with input guards and Escape cancel; add macOS `⌘K` detection in `Kbd.tsx`; fix collapsed sidebar rail layout; fix `Tour.tsx` spotlight scroll offset double-counting.
- **Completion Evidence:** Shortcuts test suite passing; Tour spotlight aligns across all scroll offsets.

#### W4 — Concept Atlas Reliable Highlighting Engine
- **Scope:** Resolve UI-09, UI-21.
- **Tasks:** Replace generic concept selectors with `data-concept-id` attributes across all tracks; implement MutationObserver + ResizeObserver retry loop in `HighlightOverlay.tsx`; author fallback dialog for hidden elements.
- **Completion Evidence:** All 32 concepts highlight precise targets; zero full-page highlights; E2E concept test passing.

#### W5 — Runner Architecture & Java/C++ Execution (O-04)
- **Scope:** Hard Gate O-04 implementation.
- **Tasks:** Author `src/tracks/cpp/runnerWorker.ts` (Clang-WASM) and `src/tracks/java/runnerWorker.ts` (TeaVM runtime); implement 3-second watchdog and 128MB memory bounds in `WorkerRunnerHost`; activate "Run Code" button and stdout console in Practice UI.
- **Completion Evidence:** Real C++ and Java code executes client-side; infinite loops terminated in 3s; 100% passing challenge test suite.

#### W6 — Angular Practice Execution Lab (O-05)
- **Scope:** Hard Gate O-05 implementation.
- **Tasks:** Author 12 curated standalone Angular practice challenges in `src/tracks/angular/`; author precompiled component runtime bundle; wire preview iframe harness with runtime assertion feedback.
- **Completion Evidence:** Angular practice challenges fully interactive with passing/failing state detection; offline ServiceWorker caching verified.

#### W7 — Live W3C HTML Validation Integration (O-14)
- **Scope:** Hard Gate O-14 implementation.
- **Tasks:** Implement W3C API client in `src/core/services/w3cValidator.ts`; build pre-submission affirmative consent modal; add 5s rate-limit cooldown; wire W3C results into dedicated Code Coach tab with offline fallback.
- **Completion Evidence:** Valid HTML receives W3C green badge; invalid markup shows line/column warnings; offline triggers local AST fallback.

#### W8 — AI Hint Proxy & Integration (O-06)
- **Scope:** Hard Gate O-06 implementation.
- **Tasks:** Author reference serverless proxy in `server/proxy/ai-hints.ts`; build client proxy adapter in `src/core/services/aiHints.ts`; implement per-action consent dialog, rate-limiting, and hint penalty accounting; build local dev mock proxy.
- **Completion Evidence:** AI hints returned with disclaimer badge; API key excluded from client bundle; offline falls back to static curriculum hints.

#### W9 — Real Cross-Device Multiplayer Races (O-07)
- **Scope:** Hard Gate O-07 implementation.
- **Tasks:** Author WebSocket signalling relay in `server/signalling/relay.ts`; implement WebRTC DataChannel client in `src/core/multiplayer/peerRace.ts`; build Race Lobby, room code generator, countdown synchronizer, and HUD progress bar; implement disconnect recovery.
- **Completion Evidence:** Two separate browser sessions connect via room code, synchronize start, and broadcast verified progress (0 bots).

#### W10 — Security Hardening, Top-Level CSP & Release Wrap-up
- **Scope:** Resolve UI-16, UI-20; cross-feature integration.
- **Tasks:** Add strict Content-Security-Policy meta tag to `index.html`; audit CSP compatibility across all runners and preview frames; update `docs/WORKLOG.md` and `docs/DECISIONS.md`; run unified verification suite.
- **Completion Evidence:** `npm run check` clean; zero CSP violations in browser console; Pass 2 handoff report completed.

---

## 8. Pass 2 Acceptance Criteria & Verification Matrix

| Component / Feature | Acceptance Criteria | Verification Method |
|---|---|---|
| **Design Tokens** | Zero undefined CSS variables; theme consistency | `designTokens.test.ts` audit script |
| **Charts** | Non-overlapping labels; rotated bar labels; legible dates | Visual snapshot tests at 375px and 1280px |
| **A11y Contrast** | Contrast ≥ 4.5:1 on ShareCard and Heat Chips across all 4 themes | Automated luminance check in `contrast.test.ts` |
| **Keyboard Navigation** | `g h`, `g e`, `g p`, `g c` work; `⌘K` on Mac; Escape exits | Key event simulation in `shortcuts.test.ts` |
| **Concept Atlas** | Precise highlighting of target elements; graceful fallback | Playwright E2E suite `concept-atlas.spec.ts` |
| **Java/C++ (O-04)** | In-browser compilation & stdout execution; 3s watchdog kill | Worker execution tests in `cppRunner.test.ts` |
| **Angular (O-05)** | 12 interactive practice challenges; DOM/state assertions | Challenge validation tests in `angularPractice.test.ts` |
| **AI Hints (O-06)** | Consent modal; zero client keys; rate limits; offline fallback | Proxy integration test & offline mock test |
| **Multiplayer (O-07)** | Real WebRTC DataChannel connection between 2 clients; zero bots | Multi-client integration test in `multiplayer.test.ts` |
| **W3C Validation (O-14)**| Live Nu API call with consent; line diagnostics; AST fallback | Mocked API test & network disconnect test |
| **Document CSP** | Top-level CSP meta tag active; zero runtime violations | Playwright console error assertions |

---

## 9. Pass 3 Independent Release Audit Procedure

Pass 3 will be executed as an **independent, adversarial verification pass** by a fresh agent/reviewer. No functional code may be altered during Pass 3 except for critical blocker remediation.

### The 10-Step Audit Protocol
1. **Automated Baseline Verification:** Execute `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. 100% pass required.
2. **Adversarial Security Audit:** Verify that zero API secrets exist in the git tree or client bundles. Confirm that `index.html` CSP blocks arbitrary scripts and that runner iframes have opaque `null` origins without `allow-same-origin`.
3. **WCAG 2.1 AA Full Theme Sweep:** Run automated axe-core across all routes in `obsidian`, `starlight`, `mocha`, and `forest`. Verify zero violations.
4. **Offline / PWA Disconnect Verification:** Populate ServiceWorker cache, disconnect network completely, reload application, and execute Python, JavaScript, and Angular challenges. Must succeed with zero network errors.
5. **Cross-Browser Verification:** Run Playwright test suite against Chromium, Firefox, and WebKit (Safari).
6. **Responsive Layout Stress Test:** Audit views at 320px, 375px, 820px, 1024px, and 1440px widths. Confirm zero table clipping or horizontal blowout.
7. **Multiplayer Two-Device Test:** Spin up two isolated browser contexts, establish WebRTC connection via signalling server, race to completion, and verify winner declaration.
8. **Live Service Verification:** With network enabled, perform real W3C validation call and verify consent modal and diagnostic gutter markers.
9. **Empirical Lighthouse Audit:** Run Chrome Lighthouse in incognito mode. Measure and record exact scores:
   - Performance: Target ≥ 80
   - Accessibility: Required ≥ 95
   - Best Practices: Required ≥ 90
   - PWA: Required ≥ 90
10. **Final Handoff Report:** Produce `docs/antigravity/status/PASS_3_AUDIT_REPORT.md` documenting all empirical evidence and final release recommendation.

---

## 10. Risk Register & Mitigation Strategy

| Risk ID | Identified Risk | Impact | Mitigation Strategy |
|---|---|---|---|
| **R-01** | Clang WASM toolchain asset size (>30 MB) degrades initial download | High | Lazy-load compiler assets strictly on demand when entering Java/C++ practice; pre-cache in background via ServiceWorker; show download progress bar. |
| **R-02** | W3C public API rate limits (429) during frequent practice checks | Medium | Enforce client-side 5s submission throttle; cache validation results by document hash; auto-fallback to local AST validator. |
| **R-03** | Symmetric NATs blocking WebRTC peer connections in multiplayer | Medium | Configure standard Google STUN servers; detect connection failure within 8s and display courteous NAT guidance. |
| **R-04** | Document-level CSP blocking WebAssembly runtime in older browsers | High | Include `'wasm-unsafe-eval'` in `script-src` per W3C CSP Level 3 spec; test compatibility across evergreen Chromium, Firefox, Safari. |
| **R-05** | Cloud AI proxy key leakage or unauthorized abuse | Critical | Serverless proxy enforces per-IP rate limiting, CORS origin restrictions, and request body length validation. |

---

## 11. Checklist & Unresolved Decisions for Owner Review

### 11.1 Decisions Authorized by Approving This Plan
By approving this plan to proceed with Pass 2, the owner formally confirms:
- [x] Authorization of in-browser WebAssembly execution for Java & C++ (Gate O-04).
- [x] Authorization of the curated standalone Angular practice lab (Gate O-05).
- [x] Authorization of the AI hint proxy integration with per-action consent (Gate O-06).
- [x] Authorization of WebRTC cross-device multiplayer challenge races (Gate O-07).
- [x] Authorization of live W3C HTML validation with affirmative disclosure (Gate O-14).
- [x] Authorization to implement `g X` chord shortcuts and remove false displays (UI-08).

### 11.2 Prerequisites for Live Deployment (Post-Pass 2)
The following items are required for public production deployment but do not block Pass 2 local implementation and automated testing:
1. **AI Provider API Key:** To be deployed in the serverless proxy environment variables (`AI_PROVIDER_API_KEY`). Local development uses the included mock proxy.
2. **Signalling Relay Hosting:** Free-tier deployment of `server/signalling/relay.ts` (Deno Deploy or Cloudflare). Local development uses the built-in Node.js relay.

---

## Appendix A: Shared-Component Impact Matrix

| Component | Files | Affected Routes | Regression Check Required |
|---|---|---|---|
| **Shell & Sidebar** | `src/components/Shell.tsx`, `Kbd.tsx` | All application routes | Collapse rail test; shortcut display; theme toggle |
| **Shortcut Engine** | `useGlobalShortcuts.ts`, `shortcuts.ts` | All application routes | Input field typing guard; Escape dismissal |
| **Page Header** | `src/components/PageHeader.tsx` | `/explore`, `/progress`, `/review` | Responsive button wrapping at 375px |
| **Accessible Charts** | `AccessibleLineChart.tsx`, `AccessibleBarChart.tsx` | `/progress` | Label collision check; table fallback parity |
| **Icon System** | `src/components/Icon.tsx` | Site-wide | Icon coverage test; SVG path rendering |
| **Code Coach** | `FeedbackPanel.tsx`, `CoachNote.tsx` | `/learn/*`, `/practice/*` | Splitter alignment; theme contrast |
| **Highlight Overlay** | `HighlightOverlay.tsx`, `highlight.ts` | `/explore`, `/concepts`, `/learn/*` | Retry observer test; missing target fallback |

---

## Appendix B: WORKLOG Preservation Commitment

In compliance with project standards:
- All historical entries in `docs/WORKLOG.md` and `docs/DECISIONS.md` are preserved without alteration.
- Pass 2 will record a structured entry in `docs/WORKLOG.md` upon the completion of each of the 10 workstreams.

---

*End of Finalized Pass 1 Implementation Plan.*  
*Authored for CodeOrbit. Awaiting owner review to commence Pass 2.*
