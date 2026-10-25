# Stage 03 — Storage v2, settings, data management, activity foundation

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 03 · **Slug:** `storage-v2-settings-data` · **Branch:** `stage-03-storage-v2-settings-data`

**Objective.** Introduce schema v2 (settings, activity, streak/daily fields preserved from reference-style data), debounced quota-aware persistence, an injectable clock, the Settings page (profile, pace, appearance controls, data management) and export/import — the foundation every engagement, analytics and personalisation stage relies on.

**In scope**
- Schema v2 + migration `v1→v2`: adds `settings`, `activity`, `activityDays`, `dailyDone`, `dailyAssigned`, `streakBest`; **preserves** `activityDays`/`dailyDone` if present (reference-era v1) after sanitising.
- Reuse `streak.ts` (D1) from `docs/antigravity/reference/streak.ts` as `src/core/gamification/streak.ts` and port its 9 tests (D16).
- Meaningful-activity rule table and `withDay`-style recording in the reducer; typed `ActivityEvent` appended in the same reducer step (D2).
- `ClockProvider`/`useClock()` and optional `now` on actions (D15). Pages dispatching meaningful actions pass `now`.
- Debounced persistence (250–500 ms) + flush on `pagehide`/`visibilitychange`; quota guard with soft budget 4 MiB (16.4); `storage` event handling for multi-tab.
- Settings page `/settings`: Profile card (14.1), Preferred pace (14.2), Appearance (theme/accent/contrast from Stage 02), Data management (14.4: export, import, reset, usage meter). Editor preferences section appears in Stage 05.
- Add Settings to navigation (sidebar, rail, bottom nav overflow rule: 5 items max → Settings goes in the top bar on mobile).

**Out of scope**
- Reminders (Stage 16), editor/accessibility preferences UI (Stages 05, 16), XP/badges (Stage 11), activity charts (Stage 15).

## 2. Prerequisites and dependencies

- Stage 02 exit gate green (appearance application and `core/ui`).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `14.1` Learner Profile Card, `14.2` Preferred Learning Pace, `14.4` Data Management Panel, `16.4` localStorage Quota Guard
**Platform / reference / concept items:** `PLT-03` Injectable clock, `PLT-14` Schema versioning chain v2→v9, `REF-02` Streak logic (reference `streak.ts`), `REF-03` Meaningful-activity rule, `REF-07` Engagement test suite (42 tests)
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-07 (Settings uses radio, checkbox/toggle, select, range, file inputs), FC-20, FC-25

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- `STORAGE_KEY`, `BACKUP_KEY`, existing v0→v1 migration, recovery reasons, `sanitizeState` behaviours, all existing storage tests.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/lib/storage.ts | `SCHEMA_VERSION = 2`; append migration index 1 (`v1→v2`); extend `createDefaultState` and `sanitizeState`; keep `MAX_DAYS = 400`; day lists sanitised with the regex/uniqueness/sort/cap rules from the reference diff (`reference/reference_integration.diff`). |
| src/state/types.ts, reducer.ts | New fields; actions `SET_SETTINGS`, `IMPORT_STATE`; `SET_LESSON_COMPLETE`, `QUIZ_FINISH`, `RECORD_CHECK` accept `now?`; `withActivity(state, now, event)` records day + event only for meaningful actions. |
| src/state/AppState.tsx | Debounced save effect, flush handlers, `storage` listener, `saveStatus` incl. quota warning. |
| src/pages/Lesson.tsx, Quiz.tsx, Practice.tsx | Pass `now` from `useClock()` for the three meaningful actions. |
| src/components/Shell.tsx | Add Settings nav item; SaveNote shows quota warning text. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/gamification/streak.ts | Verbatim logic from `reference/streak.ts` (+ `streakBest` helper `nextStreakBest(prev, info)`). |
| src/core/time/Clock.tsx | `ClockProvider`, `useClock(): () => number` (defaults to `Date.now`). |
| src/core/storage/migrations.ts | Pure `migrateV1toV2` (+ fixtures). |
| src/core/storage/quota.ts | `estimateBytes(state)`, `quotaStatus(bytes)`: `ok \| warn(≥80%) \| full`. |
| src/core/storage/exportImport.ts | `buildExport(state)`, `parseImport(text)` → `{ok, state, summary} \| {ok:false, error}`. |
| src/core/activity/meaningful.ts | `MEANINGFUL_ACTIONS` table: `lesson-complete`, `quiz-finish`, `challenge-check`; exhaustive test. |
| src/pages/Settings.tsx | Settings page (sections per `04` §4). |
| src/test/fixtures/state.v1.original.json, state.v1.reference.json, state.v1.malformed.json | Migration fixtures. |

## 7. Implementation steps (execute in order)

1. Inspect `storage.ts`, `reducer.ts`, existing `storage.test.ts`; list every place that creates state.
2. Write migration fixtures and failing tests first: original-v1 → v2 (defaults), reference-v1 (fields kept, duplicates removed, sorted, capped), malformed lists (dropped → `repaired`), newer-version still refused, backup kept.
3. Implement `migrateV1toV2`, extend sanitiser, bump `SCHEMA_VERSION`; make all tests green. Do not edit migration index 0.
4. Port `streak.ts` and its 9 tests (`streak.test.ts`) unchanged in intent; add `nextStreakBest` tests (value survives list truncation).
5. Add `meaningful.ts` and reducer changes; port the reference tests 'records a day for lesson completion, quiz finish and checks — but not for visiting or un-completing' and 'does not record a day when no timestamp is supplied'; add: event appended with same `now`; activity cap (5,000, oldest dropped); notes/bookmarks/settings never record.
6. Add `Clock`; update the three pages to pass `now`; tests inject a fake clock (no fake timers).
7. Implement debounced saving, `pagehide` flush, quota guard and `storage` event; tests: coalesced writes (one `setItem` for rapid actions), flush on `pagehide`, quota `warn` copy, write failure sets `saveStatus.error`.
8. Build export/import with confirm dialog; import runs sanitise + migrate; shows counts (topics touched, notes, events); never merges silently.
9. Build Settings page with `core/ui` components; validation on profile (name ≤ 40 chars, trimmed); visual QA at four viewports; keyboard walkthrough.
10. Docs: `DECISIONS.md` (D-114…D-118 adapted per `05`), `TEST_PLAN.md`, `README.md` (data export), `WORKLOG.md`.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

### 7a. Sub-stages

This stage is large. To keep each working session reviewable it may be executed as the sub-stages below **without dropping any scope**: the stage is complete only when every sub-stage gate and every §13 box is green. Each sub-stage uses branch `stage-NN<letter>-<slug>`, its own status report (`STAGE_NN<letter>_STATUS.md`) and its own exit gate. Give Antigravity one sub-stage at a time (guide §10).

| Sub-stage | Title | Scope (from §1/§7) | Sub-stage exit gate |
|---|---|---|---|
| 03a | Schema v2, clock, activity foundation | Types, `v1→v2` migration with fixtures, sanitisers, `Clock`, streak/activity logic (REF-02/03), reducer actions | Migration + ported streak/activity tests green; no UI |
| 03b | Persistence hardening, export/import, Settings page | Debounced saves, quota guard, `storage` event, export/import/reset, Settings page and controls | All §13 boxes green |

## 8. Component behaviour, state, data contracts and integration

```ts
interface ActivityEvent { id: string; type: 'lesson-complete'|'quiz-finish'|'challenge-check'; at: number; trackId?: string; topicId?: string; refId?: string; meta?: Record<string, string|number|boolean> }
type Action = ... | { type: 'SET_SETTINGS'; patch: Partial<Settings> } | { type: 'IMPORT_STATE'; state: CodeOrbitState }
// withActivity(state, now | undefined, event) → state'   (no now ⇒ unchanged; same-day duplicates only add the event, not a second day)
interface ExportFile { app: 'codeorbit'; exportVersion: 1; schemaVersion: number; exportedAt: number; state: CodeOrbitState }
```
Meaningful rule (L-19): recorded for lesson marked **complete** (not un-complete), quiz **finished**, challenge **check run** (pass or fail). Never for visits, selection, bookmarks, drafts, notes, settings, import, searching.

## 9. UI/UX expectations

Settings is a single scrollable page with a left in-page section list ≥ 900 px and a segmented/anchor list below. Data section: usage meter (`role=progressbar`, text "2.1 MB of about 4 MB"), Export (downloads `codeorbit-backup-YYYY-MM-DD.json`), Import (file input + preview dialog), Reset (danger button → confirm dialog requiring typing `RESET`). Profile name is shown nowhere else yet. Controls are native, labelled form controls (FC-07 platform use): `radio` group for theme, `checkbox`/toggle for gamification, `select` for pace, `input type=file accept=.json` for import.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Import: invalid JSON / wrong `app` / newer schema / oversized (> 4 MiB) each show a specific error and change nothing. Quota full: banner explains export/prune; app stays usable. Storage unavailable: banner (existing) + export still works from memory.

## 11. Security and performance

Never log or transmit state. Import is parsed with `JSON.parse` in try/catch, schema-validated, size-capped, sanitised. Debounce prevents per-keystroke writes. Settings changes are applied optimistically and persisted debounced.

## 12. Required tests and regression checks

- `migrations.test.ts`, extended `storage.test.ts` (all fixtures; unchanged old assertions).
- `streak.test.ts` (ported 9), `activity.test.ts`, `meaningful.test.ts` (exhaustive over action types).
- `persistence.test.tsx`: debounce coalescing, flush, quota, failure, multi-tab `storage` event.
- `exportImport.test.ts` and `Settings.test.tsx` (forms, validation, dialogs, axe, keyboard).
- Regression smoke green; old v1 blob in `localStorage` loads in the running app (browser smoke).

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Settings uses real labelled form controls — a `radio` group, `checkbox`/toggle, `select` and a `file` input (test by role/label) — which is what the Concept Atlas cites for FC-07.
- [ ] Loading original-v1 and reference-v1 blobs yields a valid v2 state with `activityDays`/`dailyDone` preserved when present and no data loss; malformed parts are repaired and flagged.
- [ ] `SCHEMA_VERSION === 2`; migration index 0 untouched (test reads the array length and first entry behaviour).
- [ ] Recording rules match L-19 exactly (test table); 9 ported streak tests pass.
- [ ] Rapid typing in the Practice editor produces at most one `localStorage.setItem` per debounce window (test with spy).
- [ ] Export → reset → import restores an identical state (deep equality after migration).
- [ ] Settings page is keyboard-operable, passes axe, and Reset needs explicit typed confirmation.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

REUSE `reference/streak.ts` + its 9 tests (D1); REUSE the meaningful-activity rule (D2); ADAPT optional-field storage to a real v2 migration (D3); ADAPT `now: Date.now()` into an injectable clock (D15). Do NOT import `reference/daily.ts` or `achievements.ts` yet (Stage 11).

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Existing v1 semantics, backup/recovery behaviour, quiz/mastery rules, orbit components.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_03_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 03: Storage v2, settings, data management, activity foundation`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 04 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
