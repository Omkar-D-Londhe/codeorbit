# Worklog

## 2026-10-24 — full build
- **A Audit:** unpacked both uploads. Spec zip read (README_APPLY_UPDATE, blueprint, UI spec, decisions, compliance, test plan, AGENTS). Second zip contained no repository (see D-101) — 41 lab-submission PDFs, OCR’d at cover level. No Git history existed → `git init`.
- **B Design system:** `DESIGN.md`, tokens, base, components CSS, shell (sidebar / rail / bottom nav), buttons, dialogs, toasts, code blocks.
- **C Learning Orbit:** pure geometry module + tests; arch, strip, carousel fallback, details, keyboard, reduced motion.
- **D/E Dashboard, catalog, lessons, quizzes:** Home (first-run / resume / all-complete), Explore (HTML available, others Preview), lessons with notes/bookmarks, quiz engine with persisted sessions.
- **F Practice/Coach:** sandboxed preview, editor, Run/Check/Reset/Hint, solution reveal behind confirmation, focus mode, rule-based requirement feedback, Error Notebook save.
- **G Progress/review:** progress rules, recommendations, Progress page, Review (Error Notebook, Journal, Bookmarks), clear-data.
- **H/I Integration & QA:** see `docs/TEST_PLAN.md`. Browser pass found and fixed: noisy connectors (opacity/curvature), mobile carousel card layout and peek, redundant first-run card. A test-harness issue (Chromium launched with `--disable-web-security`) briefly made the iframe look readable from the parent; re-tested with web security on → `SecurityError`, as expected.

## 2026-10-26 — Stage 01: Baseline lock, reference snapshot and language-neutral core
- **Preflight baseline verification (commit 1307572):**
  - `npm ci`: success (239 packages, audited 240, 0 vulnerabilities).
  - `npm run typecheck`: clean (0 errors).
  - `npm run lint`: clean (0 errors, 0 warnings).
  - `npm run test`: 8 test files, 176 tests passed (10.86s).
  - `npm run build`: `dist/assets/index-CA7dL1kL.js` 388.53 kB (121.33 kB gzip); CSS 40.30 kB (10.42 kB gzip).
- **T1 Implementation Pack:** Copied Antigravity pack into `docs/antigravity/` including reference snapshot (`reference/`), stages (`stages/`), design references (`design-reference/`), and status template. Committed as `Stage 01: add Antigravity pack`.
- **T2 Language-neutral content core:** Created `src/core/content/types.ts` (`TrackModule`, `LanguageDescriptor`, `CapabilityId`, `ChallengeV2`, re-exports), pure `src/core/content/registry.ts`, and `src/core/content/useTrack.ts`. Added `src/test/registry.test.ts` (5 tests passing).
- **T3 HTML Track & planned tracks:** Created `src/tracks/html/track.ts` wrapping existing data without moving files. Created `src/app/registerTracks.ts` registering HTML and planned tracks (`css`, `javascript`, `bootstrap`, `angular`). Imported in `src/main.tsx` and `src/test/setup.ts`. Added `src/test/htmlTrack.test.ts` (4 tests passing).
- **T4 Decoupled hard-coded HTML:** Refactored `Home.tsx`, `Progress.tsx`, `Explore.tsx`, `src/lib/routes.ts`, and `src/lib/progress.ts`. Added EmptyState handling for empty registry on Home and Explore. Added `src/test/emptyTracks.test.tsx` (3 tests passing).
- **T5 ESLint restriction:** Configured `no-restricted-syntax` in `eslint.config.js` forbidding string literal `'html'` across `src/pages/**`, `src/components/**`, `src/core/**` and `src/lib/**`. Verified rule with a temporary failing fixture. Added ignore for `docs/**` and `docs/antigravity/reference/**`.
- **T6 Challenge Adapter:** Created `src/core/content/challengeAdapter.ts` (`toChallengeV2` and `toChallenge`). Added `src/test/challengeAdapter.test.ts` (2 tests passing, 100% round-trip verified across all 12 challenges).
- **T7 Accessibility & regression smoke:** Installed `vitest-axe`. Created `src/test/a11y.ts` (`expectNoA11yViolations`) and `src/test/regression.smoke.test.tsx` automating the 9 G2 regression smoke items plus axe zero-serious/critical checks on 8 core pages (17 tests passing).
- **T8 Browser smoke:** Installed `@playwright/test` and Playwright Chromium. Created `playwright.config.ts`, `e2e/smoke.spec.ts` (4 tests passing), and script `test:e2e` in `package.json`. Updated `vite.config.ts` `test.exclude` to exclude `e2e/**` and `docs/**` while preserving defaults.
- **T9 Concept registry skeleton:** Created `src/core/concepts/concepts.ts` with `ConceptEntry` interface and empty typed array.
- **T10 Documentation:** Updated `AGENTS.md`, `README.md`, `DESIGN.md`, `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, and generated `docs/antigravity/status/STAGE_01_STATUS.md`.

## 2026-10-26 — Stage 02: Design system v2: tokens, themes, accents, glass surfaces, scrollbars
- **Branch:** `stage-02-design-system-v2`
- **Tokens & Themes:**
  - Added semantic `--c-*` aliases across `tokens.css` and rebased `components.css`.
  - Created `src/styles/themes.css` supporting Obsidian (default dark), Starlight (light), and Aurora (teal dark), with 5 accent presets (violet, teal, amber, rose, azure), and high contrast overrides.
  - Created `src/styles/orbit-tokens.css` defining constellation orbit tokens (`--orbit-field`, `--orbit-hub-glow`, `--orbit-star-*`, `--orbit-edge-*`, etc.).
  - Added thin custom scrollbar styling in `base.css` with WebKit support.
  - Added early appearance boot script in `index.html` preventing theme flashes on cold load.
- **Contrast & Appearance Core:**
  - Created `src/core/a11y/contrast.ts` calculating WCAG relative luminance, alpha compositing, and contrast ratios. Added `src/test/contrast.test.ts` verifying the full 3×5×2 matrix meets WCAG AA/AAA thresholds (37 tests).
  - Created `src/core/settings/appearance.ts` (`applyAppearance`, `readEarlyAppearance`, `writeEarlyAppearance`). Added `src/test/appearance.test.ts` (6 tests).
- **Core UI Components:**
  - Extracted/built `Button`, `IconButton`, `Card`, `GlassPanel`, `Tabs`, `Toggle`, `Select`, `Segmented`, `Tooltip`, `Kbd`, `Skeleton`, `StatusChip`, `ProgressRing`, `ProgressBar`, `DockedPanel`, `Drawer`, and inline-SVG icon registry `core/ui/icons`.
  - Added `src/test/uiComponents.test.tsx` verifying keyboard navigation, ARIA roles, and axe accessibility (15 tests).
- **Visual QA Gallery:**
  - Built `src/pages/UiGallery.tsx` accessible at `/__ui` (dev-only, stripped in production build). Added `src/test/devRoute.test.tsx`.
- **E2E & Browser Smoke:**
  - Extended `e2e/smoke.spec.ts` with theme switching tests, computed background assertions, and production 404 isolation for `/__ui` (6 tests passing).
- **Documentation:**
  - Updated `DESIGN.md`, `docs/WORKLOG.md`, and produced `docs/antigravity/status/STAGE_02_STATUS.md`.
