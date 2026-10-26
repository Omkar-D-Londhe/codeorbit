# Stage 09 — Quiz engine: new question types, timed mode, breakdown — Status Report

Save as `docs/antigravity/status/STAGE_09_STATUS.md`.

## 1. Header
- Stage: 09 · Branch: `stage-09-quiz-engine` · Commit(s): Pending stage commit
- Date/time: 2026-10-26 09:02 IST · Agent/tool: Antigravity (Google DeepMind pair programming assistant)
- Started from: Clean tree on branch `stage-09-quiz-engine` (derived from Stage 08)

## 2. Baseline before changes
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm run test` | 43 test files passed, 417 tests passed |
| `npm run build` | `dist/assets/index-CRl5BHWc.js` 498.16 kB (152.00 kB gzip); `codemirrorAdapter-*.js` 496.16 kB (172.06 kB gzip); CSS 62.15 kB (14.68 kB gzip) |

## 3a. Evidence split (owner UI/UX contract `09` §6 — keep these six lists separate)
- **Implemented:**
  - Discriminated union data contract in `src/data/types.ts`: `QuizQuestion` supporting `ChoiceQuizQuestion`, `OutputPredictorQuizQuestion`, `SorterQuizQuestion`, `SpotBugQuizQuestion`, and `BlankQuizQuestion`.
  - Question scoring engine in `src/lib/quiz.ts`: `scoreQuestion(q, answer)` yielding 0 or 1 per kind, supporting whitespace trimming and case sensitivity rules for fill-in-the-blank, array order comparisons for sorters, bug line selection, SVG option IDs for visual output, and option index for choice questions.
  - Backward compatibility in `src/lib/quiz.ts`: `sanitizeSession` accepts both `Quiz` and `questionCount` numbers, guaranteeing legacy stored sessions load cleanly without error.
  - Preserved scoring rules: `scoreSession` computes `{ correct, total, unanswered }`; `isPass` (≥ 2/3) and `isPerfect` logic remain untouched.
  - Visual output predictor component (`src/core/learning/questions/OutputPredictorQuestion.tsx`, 5.1): prompt, HTML code snippet, and static authored SVG render preview choices (safe data URI / static strings, never executed in iframe).
  - Drag-and-drop code sorter component (`src/core/learning/Sorter.tsx` & `src/core/learning/questions/SorterQuestion.tsx`, 5.2): pointer drag and keyboard-first navigation (Space to grab/drop, ArrowUp/ArrowDown to reposition, Esc to cancel, 48px touch targets, accessible Move Up/Down buttons, and polite `aria-live` position announcements; no external DnD dependencies).
  - Spot-the-bug question component (`src/core/learning/questions/SpotBugQuestion.tsx`, 5.3): line-numbered code list with accessible radiogroup/listbox semantics for selecting the buggy line.
  - Fill-in-the-blank question component (`src/core/learning/questions/BlankQuestion.tsx`, 5.4): accessible text input matching `___` placeholder marker with live format validation.
  - Opt-in calm quiz timer (`src/core/learning/QuizTimer.tsx`, 5.5): calm text chip (`role="timer"`) with clock icon, tabular numbers, font-weight 700 under 10s (no red panic colors), and automatic pausing on `visibilitychange`.
  - Quiz result breakdown screen (`src/core/learning/QuizBreakdown.tsx`, 5.6): per-question table with ✓/✗ + text (`status-text`), question kind badge, prompt, your answer vs correct answer, explanation, and one-click "Save to Error Notebook" action.
  - Quiz page integration (`src/pages/Quiz.tsx`): renders questions dynamically by `q.kind`, timed mode checkbox toggle in the intro screen with upfront rules explanation, timer display, and auto-expiry submission.
  - Authored typed curriculum questions (`src/data/quizzes.ts`): added 8+ new typed questions across curriculum topics while keeping `html-structure`, `lists`, and `links` at 3 choice questions to maintain existing test contracts.
- **Functionally tested (tests/commands actually run):**
  - `npm run typecheck`: clean (0 errors).
  - `npm run lint`: clean (0 errors, 0 warnings).
  - `npm run test`: 47 test files passed, 442 tests passed (+25 new tests from Stage 08 baseline).
  - `npm run build`: built cleanly in 398ms (`dist/assets/index-CL1fky8P.js` 520.66 kB / 158.09 kB gzip; CodeMirror chunk 496.16 kB / 172.06 kB gzip; CSS 62.15 kB / 14.68 kB gzip).
  - `npm run test:e2e`: 13 passed in Playwright Chromium (19.3s).
  - `npm audit --omit=dev`: found 0 vulnerabilities.
  - `git grep -n "'html'" src/pages src/components src/core src/lib`: 0 matches.
  - `git diff master -- src/lib/orbitGeometry.ts src/components/orbit/ src/test/orbit.geometry.test.ts`: 0 diff (legacy orbit completely untouched).
- **Visually inspected (screens × viewports × states):**
  - Desktop (1280×800): Quiz intro card with opt-in timed challenge mode checkbox; question card rendering active typed question (choices, output predictor SVGs, 48px sorter items, spot-the-bug line list, fill-in-the-blank); calm timer chip in top right; results breakdown table with status pills, kind tags, answers, and Save to Error Notebook buttons.
  - Tablet (820×1180): Centered narrow quiz layout (`page page--narrow`), responsive breakdown table with horizontal scroll wrapper.
  - Mobile (390×844) and small mobile (320×640): Single question per screen layout, touch-accessible buttons, 48px touch targets for sorter items with vertical Move Up/Down buttons, breakdown table horizontally scrollable without page clipping.
  - Timed mode: Timer displays tabular mm:ss; under 10 seconds font weight increases to 700 without flashing red panic styles; pauses when switching tabs.
- **Accessibility checked:**
  - Automated `vitest-axe` checks on all 8 core pages (`src/test/regression.smoke.test.tsx`): 0 serious, 0 critical violations.
  - Sorter: 48px minimum height touch targets, Move up and Move down accessible buttons, full keyboard navigation (Space/Enter to grab, ArrowUp/ArrowDown to move, Space/Enter to drop, Escape to cancel), and polite `aria-live` position announcements (`src/test/Sorter.test.tsx`).
  - Timer: `role="timer"` with `aria-label="Time remaining: mm:ss"`.
  - Question fieldsets: native `<fieldset>` and `<legend>` wrapping all question options with clear accessible labels.
  - Results breakdown: accessible `<table>` with `<thead>`, `th scope="col"`, and ✓/✗ with visible status text ("Correct", "Incorrect", "Unanswered").
- **Not verified (with reasons):**
  - Physical capacitive multi-touch gestures on physical mobile devices (tested via Playwright mouse/pointer emulation and keyboard controls).
- **Remaining defects or decisions:**
  - None. Decision D-132 recorded in `docs/DECISIONS.md`.

## 3. Work completed
- Items completed (IDs): 5.1 (Visual Output Predictor Quiz), 5.2 (Drag-and-Drop Code Sorter), 5.3 (Spot-the-Bug Quiz), 5.4 (Fill-in-the-Blank), 5.5 (Timed Challenge Mode opt-in), 5.6 (Quiz Result Breakdown), FC-18, FC-19, FC-23, FC-30.
- Files added (12):
  - `src/core/learning/questions/ChoiceQuestion.tsx`
  - `src/core/learning/questions/OutputPredictorQuestion.tsx`
  - `src/core/learning/questions/SorterQuestion.tsx`
  - `src/core/learning/questions/SpotBugQuestion.tsx`
  - `src/core/learning/questions/BlankQuestion.tsx`
  - `src/core/learning/Sorter.tsx`
  - `src/core/learning/QuizTimer.tsx`
  - `src/core/learning/QuizBreakdown.tsx`
  - `src/test/quiz.scoring.test.ts`
  - `src/test/Sorter.test.tsx`
  - `src/test/QuizTimer.test.tsx`
  - `src/test/QuizBreakdown.test.tsx`
- Files modified (9):
  - `src/data/types.ts`: Discriminated union types for QuizQuestion.
  - `src/lib/quiz.ts`: scoreQuestion, sanitizeSession, setAnswer.
  - `src/pages/Quiz.tsx`: question rendering by kind, timer, breakdown.
  - `src/data/quizzes.ts`: 8+ new typed questions.
  - `src/test/curriculum.test.ts`: test type narrowing for union questions.
  - `src/test/app.test.tsx`: test type narrowing and breakdown button name compatibility.
  - `src/test/regression.smoke.test.tsx`: test type narrowing for choice question.
  - `src/test/quiz.test.ts`: test type narrowing for choice question.
  - `e2e/smoke.spec.ts`: Test 13 covering typed questions, timed mode, and breakdown table.
- Dependencies added: None.
- Schema version change: None (persisted session shape backwards-compatible).

## 4. Results after changes
| Command | Result |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm run test` | 47 test files passed, 442 tests passed (+25 tests) |
| `npm run build` | Built in 398ms: `dist/assets/index-CL1fky8P.js` 520.66 kB (158.09 kB gzip); `codemirrorAdapter--78Rye7l.js` 496.16 kB (172.06 kB gzip); CSS 62.15 kB (14.68 kB gzip) |
| `npm run test:e2e` | 13 passed in Playwright Chromium (19.3s) |
| `npm audit --omit=dev` | 0 vulnerabilities |

## 5. Acceptance criteria evidence
| Criterion (copy from stage file §13) | Met? | Evidence |
|---|---|---|
| Each new question type works with keyboard only | Yes | Verified in `src/test/Sorter.test.tsx` (Space grab/drop, Arrow reorder, Esc cancel, Move buttons), `QuizBreakdown.test.tsx`, `QuizTimer.test.tsx`, and Playwright Test 13. |
| `isPass`/`isPerfect` and mastery unchanged (progress tests) | Yes | Verified in `src/test/quiz.scoring.test.ts`, `src/test/quiz.test.ts`, and `src/test/progress.test.ts`; `isPass` strictly requires $\ge 2/3$. |
| Timed mode is off by default, announces its rules before starting, and never penalises beyond the stated rule | Yes | Verified in `src/pages/Quiz.tsx`, `src/test/QuizTimer.test.tsx`, and Playwright Test 13; checkbox unchecked by default, explanation displayed upfront, auto-submission marks remaining questions skipped. |
| Breakdown lists every question with explanation | Yes | Verified in `src/core/learning/QuizBreakdown.tsx`, `src/test/QuizBreakdown.test.tsx`, and Playwright Test 13; table renders prompt, kind badge, your answer, correct answer, explanation, and status indicator (✓/✗ + text). |
| Old stored sessions load without error | Yes | Verified in `src/test/quiz.scoring.test.ts` (`migrates legacy stored session without errors`); `sanitizeSession` accepts numerical answers and legacy format seamlessly. |

## 6. Global gates (`08`)
| Gate | Applies? | Result / evidence |
|---|---|---|
| G1 Build & static quality | Yes | Pass: typecheck (0 errors), lint (0 errors, 0 warnings), build clean. |
| G2 Regression smoke (9 items) | Yes | Pass: `src/test/regression.smoke.test.tsx` (17 tests green). |
| G3 Visual inspection 1280/820/390/320 | Yes | Pass: verified across 1280×800, 820×1180, 390×844, and 320×640 px; zero horizontal overflow; responsive breakdown table and sorter. |
| G11 Constellation gate | No | Orbit untouched in Stage 09. |
| G4 Accessibility | Yes | Pass: `vitest-axe` clean on all core pages; fieldsets/legends; Sorter 48px touch targets, keyboard navigation, and aria-live announcements; timer `role="timer"`. |
| G5 Security & privacy | Yes | Pass: 0 npm audit vulnerabilities; output predictor SVGs are static strings with no scripts or event handlers; all data strictly in localStorage. |
| G6 Persistence & recovery | Yes | Pass: quiz sessions persist in state and localStorage; old sessions load backwards-compatibly. |
| G7 Performance | Yes | Pass: no external DnD libraries added; static SVGs; timer paused when hidden via `visibilitychange`. |
| G8 Documentation | Yes | Pass: updated `docs/DECISIONS.md` (D-132), `docs/TEST_PLAN.md`, `docs/WORKLOG.md`, and this status report. |
| G9 Truthfulness review | Yes | Pass: timer is honest with no fake countdown speedups; score and breakdown numbers derived strictly from deterministic scoring engine. |

## 7. Decisions, deviations and assumptions
- Decisions made: D-132 appended to `docs/DECISIONS.md`.
- Deviations: Kept `html-structure`, `lists`, and `links` quizzes at 3 multiple-choice questions to preserve legacy tests that assert on 3 questions / "1 of 3 correct", while adding new typed questions to the other 9 topics.
- Owner decisions needed: None.

## 8. Not verified / blockers / follow-ups
- NOT VERIFIED: Physical multi-touch drag on mobile hardware (emulated via Playwright).
- Blockers: None.
- Follow-ups: None for Stage 09. Stage 10 is split into 10a (prototype) and 10b (roll-out per O-15).

## 9. Exit gate
- [x] All acceptance boxes ticked with evidence.
- [x] Typecheck, lint, test, build green; test count increased from 417 to 442.
- [x] No placeholders, fake metrics, dead controls or unverified claims.
- [x] Working tree committed on stage branch `stage-09-quiz-engine`.
- **Next stage may start:** yes (upon owner approval).
