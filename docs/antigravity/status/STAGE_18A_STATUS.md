# Stage 18a — Schema v8, Spaced Repetition & Voice Read — Status Report

Save as `docs/antigravity/status/STAGE_18A_STATUS.md`.

## 1. Header
- Stage: 18a (Spaced Repetition & Voice Read) · Branch: `stage-15c-mastery-map-analytics` · HEAD Commit: `4cc460350c8dfc28674c8210e1e6bc8c1f2f339a`
- Date/time: 2026-10-28 · Agent/tool: Antigravity (Google DeepMind)
- Started from: Verified uncommitted Stage 17 working tree (preserved alongside Stage 16 accessibility, settings switch polish, Learning Orbit layout, chart hover fix, and Stage 17 PWA/resilience).

## 2. Baseline before changes
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | PASS (0 errors) |
| `npm run lint` | PASS (0 errors, 0 warnings) |
| `npm run build` | built in 483ms, production build succeeded |

## 3a. Evidence split (owner UI/UX contract `09` §6)
- **Implemented:**
  - SM-2 Spaced Repetition pure scheduler in `src/core/learning/spaced.ts`: pure functions `schedule(card, grade, now)`, `dueCards(cards, now)`, `nextDueDate(cards, now)`, `toDayKey(d)`, `addDays(dayKey, days)`, `createReviewCard`.
  - Documented interval progression: 1 -> 3 -> 7 -> 16 -> `Math.round(interval * ease)` days for consecutive Good grades; Again lapses reset interval to 1 day; Hard uses conservative multipliers; Easy increases ease and skips ahead.
  - DST-safe UTC noon calendar math for day-key date calculations preventing midnight clock jumps on ±1 hour adjustments.
  - Schema v8 migration in `src/core/storage/migrations.ts` (`migrateV7toV8`) and storage runtime in `src/lib/storage.ts`: bumped `SCHEMA_VERSION = 8`, adding `review: Record<string, ReviewCard>` and `custom: { challenges: ChallengeV2[] }`. Full backward-compatible non-destructive migration of all v1–v7 stores.
  - Reducer actions in `src/state/reducer.ts`: `ADD_REVIEW_CARD`, `REMOVE_REVIEW_CARD`, `ANSWER_REVIEW_CARD`.
  - Meaningful activity integration in `src/core/activity/meaningful.ts`: added `'review-answer'` to `MEANINGFUL_ACTIVITY_TYPES`. Review answers maintain daily streak activity days without altering topic mastery.
  - Automatic review card generation:
    - Missed or skipped quiz questions generate review cards on `QUIZ_FINISH`.
    - Error Notebook entries automatically generate corresponding review cards on `ADD_ERROR`.
    - Section-level manual "Add to review" toggle button on lesson sections in `src/pages/Lesson.tsx` using `sectionReviewCardId`.
  - Due Review Experience component in `src/core/learning/DueReview.tsx`: single-card review session, prompt presentation, "Show answer" reveal, 4 grade controls (`Again · 1d`, `Hard · Xd`, `Good · Yd`, `Easy · Zd`), keyboard shortcuts 1–4 and Space/Enter, progress counter, and "Nothing due today" empty state.
  - Review page tabs in `src/pages/Review.tsx`: added "Due today ({dueCount})" tab with badge hosting `<DueReview />`.
  - Shell & Home badging: `Shell.tsx` review navigation badge displays open errors + due review cards; `Home.tsx` dashboard review card surfaces count of due cards.
  - Voice Read Aloud component in `src/core/speech/VoiceRead.tsx`: Web Speech API (`speechSynthesis` + `SpeechSynthesisUtterance`) paragraph queue with Play, Pause, Resume, Stop, 4 speed rates (0.75× to 1.5×), voice selection dropdown, feature detection fallback note, active paragraph callback, unmount speech cancellation, and `useMotionAllowed` integration.
  - Integrated `<VoiceRead />` into `src/pages/Lesson.tsx` with active paragraph highlighting (`.is-reading`, `aria-current="true"`).

- **Functionally tested (tests/commands actually run):**
  - `src/test/spaced.test.ts`: 12 tests passing (grade intervals, lapses, ease clamping, DST safety, due ordering).
  - `src/test/dueReview.test.tsx`: 7 tests passing (reducer actions, mastery immunity, error card generation, reveal & rating, keyboard shortcuts 1–4, tab badging).
  - `src/test/voiceRead.test.tsx`: 5 tests passing (unsupported fallback, controls rendering, play/pause/resume/stop sequence, speed selector, unmount cancellation).
  - `src/test/migrations.test.ts`: 12 tests passing (v1 -> v8 through v7 -> v8, field preservation, schema version verification).
  - `src/test/storage.test.ts`: 16 tests passing.
  - `src/test/activity.test.ts`: 4 tests passing.
  - Quality suite: `npm run typecheck` (0 errors), `npm run lint` (0 errors, 0 warnings), `npm run build` (success).

- **Visually & Interaction Inspected:**
  - Due review card and empty states verified across desktop and mobile viewports.
  - Voice Read bar sticky styling and playback controls verified.
  - Review tab navigation and badge counts verified.

- **Mastery Rule & Streak Invariant Verification:**
  - Verified: answering review cards invokes `withActivity(...)` logging `'review-answer'`, which registers in `activityDays` and updates streak data while leaving `state.topics` completely untouched.

- **Git Safety Verified:**
  - Branch remains `stage-15c-mastery-map-analytics`.
  - HEAD remains `4cc460350c8dfc28674c8210e1e6bc8c1f2f339a`.
  - No commits created, no index staging performed.
  - All pre-existing work completely preserved.

- **Explicit Exclusions Maintained:**
  - Stage 18b (custom challenge creator, peer snapshots, portfolio export) NOT started.
  - Schema version remains strictly at v8.
  - No external backend or telemetry dependencies introduced.

## 4. Exit gate status (§7a)
- Spaced repetition pure scheduler: PASS (12/12 tests green).
- Schema v8 migration & sanitizeState: PASS (12/12 migration tests green).
- Mastery immunity & streak integration: PASS (verified in `dueReview.test.tsx`).
- Due review UI & keyboard shortcuts: PASS (verified in `dueReview.test.tsx`).
- Voice Read Aloud & unmount cancellation: PASS (5/5 tests green).
- Typecheck, Lint & Build: PASS (0 errors, 0 warnings).
- Stage 18a Exit Gate: **GREEN / READY FOR SUB-STAGE 18B**.
