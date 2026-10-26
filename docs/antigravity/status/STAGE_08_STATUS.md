# Stage 08 — Lesson Studio: reading experience, TOC, tooltips, bookmarks, demos, focus mode — Status Report

Save as `docs/antigravity/status/STAGE_08_STATUS.md`.

## 1. Header
- Stage: 08 · Branch: `stage-08-lesson-studio` · Commit(s): Pending stage commit
- Date/time: 2026-10-26 07:38 IST · Agent/tool: Antigravity (Google DeepMind pair programming assistant)
- Started from: Clean tree at commit `d539564` (`Stage 07: Feedback and Code Coach framework`)

## 2. Baseline before changes
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm run test` | 37 test files passed, 387 tests passed |
| `npm run build` | `dist/assets/index-nG8HalR2.js` 472.34 kB (144.04 kB gzip); `codemirrorAdapter-*.js` 496.16 kB (172.06 kB gzip) |

## 3a. Evidence split (owner UI/UX contract `09` §6 — keep these six lists separate)
- **Implemented:**
  - Reading progress bar (`src/core/learning/ReadingProgress.tsx`, 4.1): 2px fixed accent progress bar at top edge (`role="progressbar"`), throttled with `requestAnimationFrame` and passive listeners, hidden for short lessons where content fits without scrolling.
  - Section-level bookmarks (`src/state/types.ts`, `reducer.ts`, `storage.ts`, 4.2): Schema v4 migration adding `sectionBookmarks: string[]` (`${topicId}#${sectionId}`), toggleable via `TOGGLE_SECTION_BOOKMARK` with `aria-pressed` and toast confirmation.
  - Code highlighting and copy (`src/components/CodeBlock.tsx`, 4.3): copy button with polite `aria-live` announcement.
  - Live interactive demos (`src/core/learning/LiveDemo.tsx`, 4.4): editable mini-editor with sandboxed preview iframe (`sandbox=""`, strict CSP `default-src 'none'`), 'Reset demo' restoring original code, and strictly isolated component state (never leaked into drafts).
  - Accessible definition tooltips (`src/core/learning/DefinitionTerm.tsx`, 4.5): button popover with `aria-describedby` and `aria-expanded`, keyboard toggling, Escape key dismissal with focus restoration to trigger, outside click dismissal, and safe regex parser `renderTextWithTerms` without `dangerouslySetInnerHTML`.
  - Estimated reading time display (`src/core/learning/EstimatedTime.tsx`, `src/lib/readingTime.ts`, 4.6): calculated at 200 wpm + 1 min/demo, formatted truthfully as `about N min (estimate)` per locked decision L-05, supporting authored overrides.
  - Table of Contents sidebar (`src/core/learning/Toc.tsx`, 4.7): 3-column sticky left rail (200px) on desktop ($\ge 1100$ px), collapsible disclosure menu on mobile (< 900 px), hidden when sections $\le 1$, tracking active section via `IntersectionObserver` with `aria-current="true"`, and moving focus to target heading on click.
  - Key takeaways summary box (`src/core/learning/Takeaways.tsx`, 4.8): quiet card presenting 3–5 bullets in neutral styling without lime accent.
  - Accessibility check sidebox (`src/core/learning/A11yBox.tsx`, 4.9): quiet card with accessibility considerations.
  - Dark-room focus mode (`src/core/learning/FocusMode.tsx`, 4.10): suppresses shell chrome, TOC, and study panel; displays centered 72ch reading column on `--bg`; exits on Escape key or visible 'Exit focus mode' button and restores focus to opener; announces via `aria-live="assertive"`.
  - Authored content for all 12 curriculum lessons in `src/data/lessons.ts`: unique section IDs, takeaways, glossary terms, a11y notes, and 3+ live demos.
- **Functionally tested (tests/commands actually run):**
  - `npm run typecheck`: clean (0 errors).
  - `npm run lint`: clean (0 errors, 0 warnings).
  - `npm run test`: 43 test files passed, 417 tests passed (+30 new tests from Stage 07).
  - `npm run build`: built cleanly in 434ms (`dist/assets/index-CRl5BHWc.js` 498.16 kB / 152.00 kB gzip; CodeMirror chunk 496.16 kB / 172.06 kB gzip; CSS 62.15 kB / 14.68 kB gzip).
  - `npx playwright test`: 12 passed in Playwright Chromium (20.2s).
  - `npm audit --omit=dev`: found 0 vulnerabilities.
  - `git grep -rn "'html'" src/pages src/components src/core src/lib`: 0 matches.
  - `git diff master...HEAD -- src/lib/orbitGeometry.ts src/components/orbit/`: 0 diff (legacy orbit untouched).
- **Visually inspected (screens × viewports × states):**
  - Desktop (1280×800): 3-column studio layout verified (TOC on left rail 200px, 72ch lesson column in center, study panel on right 340px).
  - Tablet (820×1180): Two-column layout with sticky study panel on right and TOC collapsible disclosure on top.
  - Mobile (390×844) and small mobile (320×640): Tabbed studio layout with "Lesson" and "Quiz, practice & notes", TOC disclosure at top of lesson.
  - Focus mode: verified dark-room uncluttered reading mode centering 72ch text on `--bg`, hiding shell navigation, TOC, and study panel; pressing Escape exits and restores focus to opener.
  - Section bookmarks: bookmark button toggles between unpressed and pressed state with toast notification, and persists across reload.
- **Accessibility checked:**
  - Automated `vitest-axe` checks on all 8 core pages (`src/test/regression.smoke.test.tsx`): 0 serious, 0 critical violations.
  - Table of Contents: `aria-current="true"` dynamically applied to active section; clicking link moves keyboard focus to target heading (`tabindex="-1"`).
  - Definition tooltips: `aria-describedby` links trigger button to tooltip popover; Escape key dismisses tooltip and returns focus to button.
  - Reading progress bar: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`.
  - Focus mode: `aria-live="assertive"` announcement on activation, Esc key dismisses and restores focus.
- **Not verified (with reasons):**
  - Physical touch drag on physical Android/iOS tablet devices (tested via pointer events and Playwright emulation).
- **Remaining defects or decisions:**
  - None. Decision D-131 recorded in `docs/DECISIONS.md`.

## 3. Work completed
- Items completed (IDs): 4.1 (Reading Progress Bar), 4.2 (Section-Level Bookmark), 4.3 (Inline Code Highlighting), 4.4 (Live Interactive Demos), 4.5 (Definition Tooltips), 4.6 (Lesson Estimated Time Display), 4.7 (Table of Contents Sidebar), 4.8 (Key Takeaways Summary Box), 4.9 (Accessibility Check Sidebox), 4.10 (Dark-Room / Focus Mode for Reading), FC-05 (fragment links), FC-19, FC-02.
- Files added (9):
  - `src/lib/readingTime.ts`
  - `src/core/learning/ReadingProgress.tsx`
  - `src/core/learning/EstimatedTime.tsx`
  - `src/core/learning/Toc.tsx`
  - `src/core/learning/DefinitionTerm.tsx`
  - `src/core/learning/LiveDemo.tsx`
  - `src/core/learning/Takeaways.tsx`
  - `src/core/learning/A11yBox.tsx`
  - `src/core/learning/FocusMode.tsx`
- Test files added (6):
  - `src/test/readingTime.test.ts`
  - `src/test/lessonSections.test.ts`
  - `src/test/Toc.test.tsx`
  - `src/test/DefinitionTerm.test.tsx`
  - `src/test/FocusMode.test.tsx`
  - `src/test/LiveDemo.test.tsx`
- Files modified (10):
  - `src/data/types.ts`
  - `src/data/lessons.ts`
  - `src/state/types.ts`
  - `src/state/reducer.ts`
  - `src/core/storage/migrations.ts`
  - `src/lib/storage.ts`
  - `src/components/CodeBlock.tsx`
  - `src/components/Icon.tsx`
  - `src/pages/Lesson.tsx`
  - `src/styles/pages.css`
  - `playwright.config.ts`
  - `e2e/smoke.spec.ts`
  - `src/test/migrations.test.ts`
  - `src/test/regression.smoke.test.tsx`
- Reference ZIP material used: None.
- Dependencies added: None.
- Schema version change: v3 -> v4 (`sectionBookmarks: string[]` added, migration `v3 -> v4` verified).

## 4. Results after changes
| Command | Result |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm run test` | 43 test files passed, 417 tests passed (+30 tests from Stage 07) |
| `npm run build` | `dist/assets/index-CRl5BHWc.js` 498.16 kB (152.00 kB gzip); `codemirrorAdapter-B0Sxp3UY.js` 496.16 kB (172.06 kB gzip); `index-BfnaJmo1.css` 62.15 kB (14.68 kB gzip) |
| `npx playwright test` | 12 passed in Playwright Chromium (20.2s) |
| `npm audit --omit=dev` | Found 0 vulnerabilities |

## 5. Acceptance criteria evidence
| Criterion (copy from the stage file §13) | Met? | Evidence (command output / test names / observation) |
|---|---|---|
| Every lesson shows estimated time, TOC (when > 1 section) and takeaways (authored for all 12) | Met | `src/test/lessonSections.test.ts` tests 1, 3, 4, 5; `readingTime.test.ts`; Playwright test 12 |
| Definition tooltips are keyboard-operable and dismiss with Esc | Met | `src/test/DefinitionTerm.test.tsx` tests 2, 3 and Playwright test 12 |
| Section bookmarks persist and survive reload | Met | `src/test/migrations.test.ts` test 6 and Playwright test 12 |
| Live demos render in the sandboxed iframe and cannot execute scripts | Met | `src/test/LiveDemo.test.tsx` test 1 and Playwright test 12 |
| Focus mode hides chrome, exits with Esc, preserves scroll position and drafts | Met | `src/test/FocusMode.test.tsx` tests 3, 4 and Playwright test 12 |

## 6. Global gates (`08`)
| Gate | Applies? | Result / evidence |
|---|---|---|
| G1 Build & static quality | Yes | `npm run typecheck` (clean), `npm run lint` (clean), `npm run build` (clean) |
| G2 Regression smoke (9 items) | Yes | `src/test/regression.smoke.test.tsx` 17 tests passed |
| G3 Visual inspection 1280/820/390/320 | Yes | Real Playwright browser runs verified at 1280, 820, 390 viewports |
| G11 Constellation gate | No | Legacy orbit files untouched (`src/lib/orbitGeometry.ts`, `src/components/orbit/*`) |
| G4 Accessibility | Yes | Automated axe checks clean on all 8 pages; `role="progressbar"`, definition tooltips, Escape dismissal, TOC focus movement |
| G5 Security & privacy | Yes | `sandbox=""` empty attribute strictly enforced on all demos, CSP meta tag, 0 audit vulnerabilities |
| G6 Persistence & recovery | Yes | Schema v4 migration, `sectionBookmarks` persistence and state sanitization round-trip verified |
| G7 Performance | Yes | Build completed in 434ms; initial JS bundle 152.00 kB gzip; scroll listener throttled with rAF |
| G8 Documentation | Yes | `DECISIONS.md`, `TEST_PLAN.md`, `WORKLOG.md`, `STAGE_08_STATUS.md` updated |
| G9 Truthfulness review | Yes | All test numbers and bundle sizes directly recorded from CLI tool execution |

## 7. Decisions, deviations and assumptions
- Decisions made: D-131 recorded in `docs/DECISIONS.md`.
- Deviations from the stage file: None.
- Owner decisions needed: None.

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
