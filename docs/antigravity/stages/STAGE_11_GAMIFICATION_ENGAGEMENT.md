# Stage 11 — Gamification: XP, levels, achievements, streaks, daily challenge, personal bests

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

> **Decision gate (soft — a default exists; proceed with it and record that you did):** O-09 (XP table) and O-10 (daily scope) are soft gates: proceed with the defaults in `07` and record that you did.

## 1. Stage identity, objective and scope

**Stage:** 11 · **Slug:** `gamification-engagement` · **Branch:** `stage-11-gamification-engagement`

**Objective.** Build the motivation layer from real events using the reference's best-verified logic: derived XP and levels, derived achievements with first-seen dates, meaningful-activity streaks, a frozen daily challenge with completion, local personal bests, milestone events and rank toasts.

**In scope**
- 8.1 XP & level system (pure function of state), 8.2 achievement badge gallery, 8.3 challenge-completion streak (meaningful-activity streak), 8.4 'First Blood' & milestone events, 8.5 local personal bests, 8.6 daily challenge completion stamp, 8.7 rank progression toast, 5.7 XP awarded animation.
- Daily challenge selection + completion (reference D4), achievements derivation (D6), engagement tests (D16).

**Out of scope**
- Dashboard layout (Stage 12), analytics charts (Stage 15), streak calendar UI (Stage 12).

## 2. Prerequisites and dependencies

- Stage 03 (activity foundation), Stage 09 (quiz types), Stage 10 (sub-stage 10b, pulse hook) exit gates green.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `5.7` XP Awarded Animation, `8.1` XP & Level System, `8.2` Achievement Badge Gallery, `8.3` Challenge Completion Streak, `8.4` "First Blood" & Milestone Events, `8.5` Leaderboard (Local), `8.6` Daily Challenge Completion Stamp, `8.7` Rank Progression Toast
**Platform / reference / concept items:** `REF-04` Daily challenge selection and completion, `REF-05` Derived achievements
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-23 (conditional behaviour), FC-21 (structured data), FC-25

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Mastery/pass rules (L-15) — gamification reads them, never changes them; `streak.ts` from Stage 03; Orbit behaviour.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/state/types.ts, reducer.ts, storage.ts | Schema **v5** (migration `v4→v5` adds `badges: {}`, `personalBests: {}`; `dailyAssigned` itself was added in v2): `dailyAssigned` freeze on first view; `RECORD_CHECK` marks `dailyDone` when `challengeId === state.dailyAssigned[today]` and all requirements passed (no content import in reducer). |
| src/pages/Progress.tsx | Achievement gallery section; XP/level header (when gamification enabled). |
| src/components/Toast.tsx | Milestone/rank toasts with polite live region; dedupe by id. |
| src/pages/Settings.tsx | 'Show XP and achievements' switch (default on). |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/gamification/daily.ts | `dailyChallengeFor(dayKey, pool)` adapted from `reference/daily.ts` (pool injected); `assignDaily(state, dayKey, pool)` returns the frozen id. |
| src/core/gamification/achievements.ts | `AchievementDef`, `evaluateAchievements(state, ctx)`; platform defs here; track defs from `TrackModule.achievements`. |
| src/tracks/html/achievements.ts | HTML-specific defs ported from the reference (Foundations, Semantic Structure, Accessible Images, Form Builder, HTML Track Complete) — no `!` assertions. |
| src/core/gamification/xp.ts | `computeXp(state, ctx)`, `levelFor(xp)`, `XP_TABLE`. |
| src/core/gamification/milestones.ts | Detects newly-true milestones by comparing evaluations → events + toasts; 'First Blood' = first ever passing check. |
| src/core/gamification/personalBests.ts | Best quiz score per topic, fastest pass (only when timestamps exist), longest streak (`streakBest`). |
| src/core/gamification/BadgeGallery.tsx, XpBar.tsx, XpAward.tsx, DailyChallengeCard.tsx | UI (card adapted from `reference/DailyChallengeCard.tsx`). |

## 7. Implementation steps (execute in order)

1. Inspect `docs/antigravity/reference/{daily,achievements}.ts` and `engagement.test.tsx`; list adaptations from `05` D4–D7, D16.
2. Port tests first into `daily.test.ts`, `achievements.test.ts`, `engagement.integration.test.tsx`; adjust imports to injected pools; keep every assertion's intent.
3. Implement `daily.ts` with `dailyAssigned` freeze: assignment written the first time the day's challenge is read (action `ASSIGN_DAILY`, `now` required); a test proves adding challenges mid-day does not change today's pick.
4. Reducer: `dailyDone` rule using the assigned id; one entry per day.
5. Implement achievements as data; add earned detection → `badges[id] = { firstSeenAt: now, backfilled }` on first observation (existing progress → `backfilled: true`, `firstSeenAt: null`).
6. Implement XP from `XP_TABLE` (below); level curve `xpForLevel(n) = 100 * n * (n + 1) / 2` (cumulative); tests: monotonic, no farming (replaying/hints/revisits add nothing), un-completing a lesson lowers XP consistently.
7. Milestones and toasts: only on newly observed transitions; not on first load for backfilled items (silent).
8. Personal bests UI in Progress ('Your best on this device').
9. Gallery UI: star icon + 'Earned/Not yet' text + rule + progress; earned date or 'Earned (date not recorded)'.
10. XP award animation: +N number floats near the action for ≤ 600 ms; reduced motion → inline text only.
11. Settings switch hides all gamification UI while data remains.
12. Docs: `DECISIONS.md` D-114…D-118 amended; QA at four viewports.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

### 7a. Sub-stages

This stage is large. To keep each working session reviewable it may be executed as the sub-stages below **without dropping any scope**: the stage is complete only when every sub-stage gate and every §13 box is green. Each sub-stage uses branch `stage-NN<letter>-<slug>`, its own status report (`STAGE_NN<letter>_STATUS.md`) and its own exit gate. Give Antigravity one sub-stage at a time (guide §10).

| Sub-stage | Title | Scope (from §1/§7) | Sub-stage exit gate |
|---|---|---|---|
| 11a | XP, levels, achievements, personal bests (schema v5) | Pure derivations, `badges`/`personalBests`, migration `v4→v5`, rule tests | Derivation + migration tests green |
| 11b | Streak surfaces, daily challenge, milestones, toasts | Frozen daily assignment, completion, milestone events, rank toasts, Settings switch (P-04) | All §13 boxes green |

## 8. Component behaviour, state, data contracts and integration

```ts
interface AchievementDef { id: string; title: string; rule: string; scope: 'platform' | { trackId: string }; evaluate(state: CodeOrbitState, ctx: EngagementContext): { earned: boolean; progress?: { current: number; total: number } } }
interface EngagementContext { todayKey: string; tracks: readonly TrackModule[]; progressOf(topicId: string): TopicProgress }
const XP_TABLE = { lessonComplete: 10, quizPass: 15, quizPerfect: 10 /* bonus */, challengePass: 25, independentSolve: 15 /* bonus: no hints, no solution */, topicMastered: 50, errorUnderstood: 5, dailyChallenge: 20 }  // awarded once per source key (topic/challenge/entry/day)
xp = Σ awards over current saved state; level = max n with cumulative XP ≥ xpForLevel(n)
```
Achievement list (platform): First Challenge Completed, Independent Solver, Revision Completed, First Mastery, Three-Day Streak, Seven-Day Streak, Quiz Ace (perfect score on any quiz). Track achievements come from tracks. Each shows its exact rule.

## 9. UI/UX expectations

Gallery grid `repeat(auto-fill, minmax(260px, 1fr))`; earned cards get a neutral raised surface with lime outline and star icon; unearned are quiet with progress text 'x of y'. No flame icons, no loss-aversion copy (L-19). XP bar in Progress header: level number, `role=progressbar`, text 'Level 3 · 240 XP · 60 to next'. Daily card per reference wording.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Gamification disabled → XP/badges/toasts hidden; daily card remains (it is a learning feature). Empty pool → card says 'No challenges available today'. First load with existing progress → silent backfill (no toast storm).

## 11. Security and performance

Evaluation is pure and memoised on the state slices used; runs in render, not on a timer. No storage of derived numbers except `badges` first-seen map.

## 12. Required tests and regression checks

- Ported/extended: streak, daily (determinism, cycle, pre-1970, freeze, empty pool), achievements (negative cases: opening pages/bookmarking/notes earn nothing; each rule), XP (no farming, un-complete, levels), milestones (once only), personal bests.
- Integration: a real passing check earns First Challenge Completed, records a streak day, and marks the daily when it is today's.
- Gallery a11y; toast dedupe; reduced motion.
- All mastery/progress tests unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] No badge, XP or streak value changes unless a real recorded event changed (tests).
- [ ] Daily challenge for a day never changes once assigned, even if the pool grows (test).
- [ ] Backfilled badges show 'Earned (date not recorded)'; new earnings show the real date.
- [ ] Mastery rules untouched; gamification toggle hides everything.
- [ ] Reference achievements tests are ported and green with injected pools.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

REUSE: streak logic (already Stage 03), achievement rule wording and tests. ADAPT: daily (pool injection, freeze), achievements (data-driven, track-scoped, first-seen dates), XP (derived). EXCLUDE: reducer content imports.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Quiz/mastery semantics, meaningful-activity rules (L-19), orbit.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_11_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 11: Gamification: XP, levels, achievements, streaks, daily challenge, personal bests`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 12 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
