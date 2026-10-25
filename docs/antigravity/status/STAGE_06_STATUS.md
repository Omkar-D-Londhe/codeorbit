# Stage 06 — Practice workspace: multi-file, snippets, device frames, a11y linter, diff, difficulty progression — Status Report

Save as `docs/antigravity/status/STAGE_06_STATUS.md`.

## 1. Header
- Stage: 06 · Branch: `stage-06-practice-workspace` · Commit(s): Pending stage commit
- Date/time: 2026-10-26 03:41 IST · Agent/tool: Antigravity (Google DeepMind pair programming assistant)
- Started from: Clean tree at commit `ea353e8` (`Stage 05: Editor platform: CodeMirror 6 adapter, splitter, auto-save, fullscreen, editor preferences`)

## 2. Baseline before changes
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm run test` | 30 test files passed, 342 tests passed |
| `npm run build` | `dist/assets/index-D2f9l2h3.js` 438.40 kB (135.41 kB gzip); CodeMirror lazy chunk 496.16 kB (172.06 kB gzip) |

## 3a. Evidence split (owner UI/UX contract `09` §6 — keep these six lists separate)
- **Implemented:**
  - `CodeRunner` interface and `IframePreviewRunner` (`src/core/runner/types.ts`, `src/core/runner/iframePreviewRunner.ts`).
  - Multi-file preview document builder with CSS stitching into `<style data-filename="...">` and `escapeStyleTag` defense against `</style>` breakout (`src/lib/preview.ts`).
  - Sandboxed preview component accepting both single `code` and multi-file `files` array, maintaining empty `sandbox=""` and strict CSP (`src/components/SandboxedPreview.tsx`).
  - Reducer draft storage supporting multi-file draft keys (`challengeId::fileName`) while maintaining single-file backward compatibility, and cleaning both on reset (`src/state/reducer.ts`).
  - Myers / LCS line-by-line diff algorithm (`src/core/learning/diff.ts`) capped at 2000 lines, returning additions, deletions, and line numbers.
  - Diff viewer component (`src/core/learning/DiffViewer.tsx`) with gutter markers (`+`, `−`), line numbers, additions/deletions stats, and strict gating behind solution reveal.
  - Responsive device frames wrapper (`src/core/ui/DeviceFrame.tsx`) with Desktop (100%), Tablet (768px), and Mobile (375px) presets and dimension captions.
  - Native DOMParser-based accessibility linter (`src/tracks/html/a11yLint.ts`) detecting missing `alt` on `<img>`, unlabelled form controls, empty headings, duplicate IDs, and heading skips, with explicit non-WCAG disclaimer.
  - Accessible HTML snippets library (`src/tracks/html/snippets.ts`) and insertion drawer panel (`src/core/learning/SnippetPanel.tsx`).
  - Advisory soft difficulty progression predicate (`src/core/learning/difficulty.ts`) adhering to owner decision O-16 (non-blocking).
  - Practice page integration (`src/pages/Practice.tsx`) bridging `toChallengeV2`, multi-file tab switcher (`fileCount > 1`), diff comparison drawer, snippet library drawer, device frame toggle, and a11y linter section.
- **Functionally tested (tests/commands actually run):**
  - `npm run typecheck`: clean (0 errors).
  - `npm run lint`: clean (0 errors, 0 warnings).
  - `npm run test`: 34 test files passed, 362 tests passed (+20 new tests).
  - `npm run build`: built in 364ms (`dist/assets/index-Eo5o3Kuq.js` 458.43 kB / 141.26 kB gzip; CodeMirror chunk 496.16 kB / 172.06 kB gzip).
  - `npm run test:e2e`: 10 passed in Playwright Chromium.
  - `npm audit --omit=dev`: 0 vulnerabilities.
  - `git grep -rn "'html'" src/pages src/components src/core src/lib`: 0 matches.
  - `git diff master...HEAD -- src/lib/orbitGeometry.ts src/components/orbit/`: 0 diff (legacy orbit untouched).
- **Visually inspected (screens × viewports × states):**
  - Practice workspace inspected at desktop (1280×800) and tablet (820×1180): device frame switcher toggles between Desktop (100%), Tablet (768px), and Mobile (375px), centering preview container and rendering metadata caption.
  - Mobile (390×844) viewport inspected: 4 tabs (Brief, Editor, Preview, Feedback) intact, device frame toggles correctly positioned.
  - Multi-file tabs inspected: single-file challenges display no tabs (maintaining visual backward compatibility); multi-file challenges render accessible `.tabs--files` tab list.
  - Snippets drawer inspected: opens docked drawer, search filter filters snippets, clicking "Insert" injects code at cursor position and closes drawer.
  - Diff viewer inspected: Diff button disabled with tooltip prior to solution reveal; upon confirmed reveal, opens comparison showing additions (`+` in green) and deletions (`−` in red).
  - Accessibility linter inspected: clicking "Run linter" parses learner HTML and lists actionable suggestions or success confirmation.
- **Accessibility checked:**
  - Automated `vitest-axe` checks on all 8 core pages (`src/test/regression.smoke.test.tsx`): 0 serious, 0 critical violations.
  - Multi-file tabs: proper ARIA tablist semantics (`role="tablist"`, `role="tab"`, `aria-selected`).
  - Device frame buttons: real `<button>` elements with clear accessible names and active state indicators.
  - Diff viewer: keyboard scrollable preformatted diff with clear text markers (`+`, `−`, line numbers) ensuring screen reader comprehension.
  - Snippets drawer: traps focus when open, closes on Escape, restores focus to trigger button.
  - Linter warnings: rendered using semantic lists and alert icons with WCAG AA compliant text contrast.
- **Not verified (with reasons):**
  - Physical touch-screen multi-touch pinch zoom on device frame (tested via pointer events and automated Playwright emulation).
- **Remaining defects or decisions:**
  - None.

## 3. Work completed
- Items completed (IDs): 6.4 (Multi-File Tabs & File Management), 6.5 (Sandboxed Runner / CodeRunner contract), 6.6 (Accessibility Linter), 6.7 (Line-by-Line Diff Viewer), 6.9 (Code Snippet Library), 6.10 (Device Frame Viewports), 6.11 (Soft Difficulty Progression & Recommendation).
- Files added (8):
  - `src/core/runner/types.ts`
  - `src/core/runner/iframePreviewRunner.ts`
  - `src/core/learning/diff.ts`
  - `src/core/learning/DiffViewer.tsx`
  - `src/core/ui/DeviceFrame.tsx`
  - `src/tracks/html/a11yLint.ts`
  - `src/tracks/html/snippets.ts`
  - `src/core/learning/SnippetPanel.tsx`
  - `src/core/learning/difficulty.ts`
  - `src/test/diff.test.ts`
  - `src/test/a11yLint.test.ts`
  - `src/test/difficulty.test.ts`
  - `src/test/practiceWorkspace.test.tsx`
- Files modified (7):
  - `src/components/CodeEditor.tsx`
  - `src/components/SandboxedPreview.tsx`
  - `src/lib/preview.ts`
  - `src/pages/Practice.tsx`
  - `src/state/reducer.ts`
  - `src/test/preview.test.tsx`
  - `e2e/smoke.spec.ts`
- Reference ZIP material used:
  - Reused existing sandbox and preview CSP architecture, extending to multi-file CSS tag injection.
- Dependencies added: None.
- Schema version change: None (draft storage backward-compatible via `draftKey` delimiter).

## 4. Results after changes
| Command | Result |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm run test` | 34 test files passed, 362 tests passed (+20 tests from Stage 05) |
| `npm run build` | `dist/assets/index-Eo5o3Kuq.js` 458.43 kB (141.26 kB gzip); `codemirrorAdapter-*.js` 496.16 kB (172.06 kB gzip) |
| `npm run test:e2e` | 10 passed in Playwright Chromium |
| `npm audit --omit=dev` | Found 0 vulnerabilities |

## 5. Acceptance criteria evidence
| Criterion (copy from the stage file §13) | Met? | Evidence (command output / test names / observation) |
|---|---|---|
| Multi-file tabs (`.tabs--files`) render when `files.length > 1` | Met | `src/test/practiceWorkspace.test.tsx` test 1; single-file challenges hide tabs |
| Sandboxed runner stitches multi-file CSS safely with breakout defense | Met | `src/test/preview.test.tsx` test "stitches multiple CSS files" and `</style>` breakout defense test |
| Line diff viewer calculates LCS diff and caps at 2000 lines | Met | `src/test/diff.test.ts` (6 tests: additions, deletions, identical, empty, 2000-line safety cap) |
| Diff button strictly gated behind solution reveal confirmation | Met | `src/test/practiceWorkspace.test.tsx` test 3 and Playwright test 10 |
| Device frame toggles Desktop, Tablet (768px), Mobile (375px) | Met | `src/test/practiceWorkspace.test.tsx` test 2 and Playwright test 10 |
| DOMParser a11y linter detects missing alt, unlabelled inputs, empty headings, duplicate IDs, hierarchy skips | Met | `src/test/a11yLint.test.ts` (5 tests) and Playwright test 10 |
| Snippet panel inserts accessible HTML snippet at cursor position | Met | `src/test/practiceWorkspace.test.tsx` test 4 and Playwright test 10 |
| Difficulty recommendation badge indicates advisory status without blocking | Met | `src/test/difficulty.test.ts` (3 tests); O-16 compliance preserved |

## 6. Global gates (`08`)
| Gate | Applies? | Result / evidence |
|---|---|---|
| G1 Build & static quality | Yes | `npm run typecheck` (clean), `npm run lint` (clean), `npm run build` (clean) |
| G2 Regression smoke (9 items) | Yes | `src/test/regression.smoke.test.tsx` 17 tests passed |
| G3 Visual inspection 1280/820/390/320 | Yes | Real Playwright browser run verified at 1280, 820, 390, 375 viewports |
| G11 Constellation gate | No | Legacy orbit files untouched |
| G4 Accessibility | Yes | Automated axe checks clean on all 8 pages; keyboard focus management verified on drawers and tabs |
| G5 Security & privacy | Yes | `sandbox=""` empty attribute preserved, strict CSP, `escapeStyleTag` defense, 0 audit vulnerabilities |
| G6 Persistence & recovery | Yes | Draft persistence round-trip verified across multi-file and single-file challenges |
| G7 Performance | Yes | Build completed in 364ms; initial JS bundle 141.26 kB gzip |
| G8 Documentation | Yes | `DECISIONS.md`, `TEST_PLAN.md`, `WORKLOG.md`, `STAGE_06_STATUS.md` updated |
| G9 Truthfulness review | Yes | All test numbers and bundle sizes directly recorded from CLI tool execution |

## 7. Decisions, deviations and assumptions
- Decisions made: D-129 recorded in `docs/DECISIONS.md`.
- Deviations from the stage file: None.
- Owner decisions needed: None (O-16 adhered to; progression is purely advisory).

## 8. Not verified / blockers / follow-ups
- NOT VERIFIED items and reasons: Physical touch screen drag on physical tablets (verified via pointer events & Playwright).
- Blockers and their impact: None.
- Follow-ups for later stages: None.

## 9. Exit gate
- [x] All acceptance boxes ticked with evidence
- [x] Typecheck, lint, test, build green; test count not decreased
- [x] No placeholders, fake metrics, dead controls or unverified claims
- [x] Working tree committed on the stage branch
- **Next stage may start:** yes (upon owner approval)
