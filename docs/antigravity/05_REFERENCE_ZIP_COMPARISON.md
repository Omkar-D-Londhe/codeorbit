# 05 — Original Baseline vs Reference ZIP: Comparison and Reuse Decisions

**Roles.** The *original* ZIP (`8187fe4b…_codeorbit.zip`, git commit `1307572`) is the **primary implementation baseline**. The *reference* ZIP (`codeorbit_1.zip`, commit `e3e5464`) is a **reference implementation**: a source of ideas, logic and tests to reuse selectively. It is never a replacement project and its feature set is not a ceiling on scope.

**How they were compared.** Both were extracted, diffed file by file (`diff -rq`, then `diff` of every changed file), the new files were read in full, and both were built and tested independently.

| | Original baseline | Reference ZIP |
|---|---|---|
| Commits | 1 | 2 (adds `e3e5464`: mastery map, achievements, streaks, daily challenge, assessment-compliance rewrite, Home spacing fix) |
| `src/` lines | 5,913 | 6,710 |
| Test files / tests (actually run) | 8 / **176 passed** | 9 / **218 passed** (`engagement.test.tsx` adds 42) |
| `typecheck` / `lint` | pass / pass | pass / pass |
| Production JS | 388.53 kB (121.33 kB gzip) | 403.30 kB (125.46 kB gzip) |
| Dependencies | identical `package.json` | identical `package.json` |

The reference is the original plus exactly this delta: **new files** `lib/streak.ts`, `lib/daily.ts`, `lib/achievements.ts`, `lib/masteryLayout.ts`, `pages/Mastery.tsx`, `components/DailyChallengeCard.tsx`, `test/engagement.test.tsx`; **changed files** `App.tsx` (route `/mastery`), `Shell.tsx` (nav match), `Home.tsx`, `Progress.tsx`, `Track.tsx` (link), `Lesson.tsx` and `Quiz.tsx` (pass `now: Date.now()`), `state/types.ts` (+`activityDays`, `dailyDone`), `state/reducer.ts`, `lib/storage.ts`, `styles/pages.css`, plus docs. Verbatim copies of the new files and the full integration diff are in `docs/antigravity/reference/` (read-only snapshot; never import from it).

## Decision vocabulary

**REUSE** = copy after checking compatibility and quality · **ADAPT** = keep the idea/logic, change it to fit the original architecture or the agreed scope · **KEEP-ORIGINAL** = the original is already better suited · **EXCLUDE** = redundant or conflicts with the product direction.

## Difference-by-difference decisions

| # | Reference difference | Evidence inspected | Decision | What exactly to do | Stage |
|---|---|---|---|---|---|
| D1 | `lib/streak.ts`: `dayKey`, `epochDay`, `addDay`, `streakInfo` | Pure, DST-safe (UTC calendar arithmetic), bounded list (400), handles unsorted/duplicate input; 9 tests in `engagement.test.tsx` | **REUSE** (functions and tests verbatim) | Place in `src/core/gamification/streak.ts`; keep signatures. Port the 9 tests. Note `streakInfo.lastActive` uses the string sort — keep. | 03 (plumbing), 11 |
| D2 | "Meaningful activity" rule: a day is recorded only for lesson completed (not un-completed), quiz finished, check run; never for visiting, selecting, bookmarking, drafts, notes (decision D-114) | `reducer.ts` `withDay()`; test "records a day for lesson completion, quiz finish and checks — but not for visiting or un-completing" | **REUSE the rule**, **ADAPT the extension points** | Keep exactly these triggers. Add (later stages) review-card answered (Stage 18) and custom/daily challenge checks (same `RECORD_CHECK`). Notes, bookmarks, settings, searches, analysis runs and visits stay excluded. Keep "`now` absent ⇒ nothing recorded" (tested). Make the rule a single table `MEANINGFUL_ACTIONS` so it can be tested exhaustively. | 03, 11, 18 |
| D3 | `activityDays` + `dailyDone` added to **v1** as optional fields, no version bump (D-118) | `storage.ts` `sanitizeState` drops malformed lists, tolerates absence | **ADAPT** | Persistence policy (L-10) requires a version bump for shape changes. Stage 03 bumps to **v2** with migration `v1→v2` that *preserves* `activityDays`/`dailyDone` when present (so data created by reference-style builds is not lost) and adds defaults when absent. Fixtures for: original-v1 (no fields), reference-v1 (with fields), malformed lists. | 03 |
| D4 | `lib/daily.ts`: `challenges[epochDay(local date) % n]` | Deterministic, progress-independent, tested incl. pre-1970 and full-cycle tests | **ADAPT** | Keep the rule and tests, but (a) pool = challenges of *available* tracks in registry order, injected (the reference imports data directly, which breaks core/track separation); (b) **freeze the assignment**: store `dailyAssigned[dayKey] = challengeId` on first view of the day, so adding challenges/tracks never changes today's pick or re-labels history; (c) completion (`dailyDone`) refers to the assigned id, and the reducer decides it by comparing the checked `challengeId` with `state.dailyAssigned[today]` (no content import in the reducer); (d) if the pool is empty show an honest empty state. | 11, 12 |
| D5 | `DailyChallengeCard` (honest wording: "Picked from this device's date. Not shared…") | Component read in full | **REUSE** wording and structure, **ADAPT** to design system v2 and catalog 3.4/8.6 (completion stamp) | Keep "Not passed today / Passed today" text+icon pairing; add the stamp only when `dailyDone` contains today. | 12 |
| D6 | `lib/achievements.ts`: derived from state each render, each badge shows its exact rule, progress where countable, no earned-date claimed | 10 badges; tests: opening pages/bookmarking/notes earn nothing; per-rule tests | **ADAPT** (adopt derivation principle; change structure) | (a) Move to data-driven `AchievementDef { id, title, rule, trackId?, evaluate(state, ctx) }`; platform badges in core, track badges (`html-foundations`, `semantic-structure`, `accessible-images`, `form-builder`, `html-complete`) move to the HTML `TrackModule` (reference hard-codes 12 HTML topic ids and `challenges.find(...)!` which would throw for other tracks). (b) Catalog 8.2 wants a *gallery* with earned dates: record `badges[id] = { firstSeenAt, backfilled }` when the evaluator first sees it earned; badges already earned from past progress are marked `backfilled: true` and display "Earned (date not recorded)". Never invent dates. (c) Keep every rule sentence visible. (d) Port all achievements tests. | 11 |
| D7 | No points/XP ("would invite score inflation", D-116) | Decision log | **ADAPT** — catalog 8.1 (XP & levels) stays in scope | Implement XP as a **pure function of saved state** (fixed, documented awards per *first* milestone: e.g. lesson complete, quiz pass, perfect quiz, challenge pass, independent solve, mastery, review understood) with no repeatable farming and no stored counters, so XP cannot drift or be inflated. Settings switch hides it (P-04). | 11 |
| D8 | `lib/masteryLayout.ts`: depth = longest prerequisite chain, rows in curriculum order, uniform node size, edges only from declared prerequisites, cycle detection | Pure, deterministic; 6 layout tests (no overlap, bounds, canonical order, same size, cycle throws) | **REUSE** (functions and tests) | Place in `src/core/orbit/masteryLayout.ts`. Add `maxDepth` guard and a defined behaviour when a prerequisite id is missing (reference ignores it silently — keep, add test). | 15 |
| D9 | `pages/Mastery.tsx`: graph ≥ 720 px container width, structured list under it (same data), "Show as a list" `<details>`, node `aria-label` = title + level + status + selected, status panel "Why this status" with mastery criteria, detail with Builds on / Leads to | Read in full; tests for graph/list/criteria/blocked-mastery explanation | **ADAPT** | Route becomes `/learn/:trackId/mastery` (keep `/mastery` as redirect to the last-used or first available track); remove hard-coded "HTML" breadcrumb, `topics[0]` and "pass = 2 of 3" literal (compute from `isPass` semantics / quiz length). Keep list fallback and criteria panel text. | 15 |
| D10 | Mastery map technique vs catalog 11.1 "Force-Directed Skill Graph" | Layered layout is deterministic and never encodes ability in distance; force layout can | **ADAPT (both)** | Layered layout is the **default and accessible** view. Implement 11.1 as an additional, opt-in "Force" view: seeded deterministic simulation, uniform node size, only declared edges, drag to pin, pause button, reduced-motion = static final layout. 11.2 heatmap is a third view. Nothing in the catalog is dropped. | 15 |
| D11 | Mastery status panel: "A learning aid, not an exam grade" | Text | **REUSE** | Keep verbatim in every mastery/insight surface. | 15 |
| D12 | Home: streak card shown only if `activityDays.length > 0`; wording "Complete a lesson, finish a quiz or run a check to start a new one" | `Home.tsx` diff | **REUSE** truthfulness pattern, **ADAPT** layout | Fold into the Stage 12 dashboard grid (hero ring, continue, daily, groups, streak calendar). Empty-state rules identical (no streak card/number before real activity). | 12 |
| D13 | Home/Progress layout: `home-secondary` grid with Daily + Streak + Next + Review; `ach-grid` `repeat(auto-fill,minmax(260px,1fr))` | CSS diff | **ADAPT** | Keep the auto-fill grid idea; implement with design-system `Card` and tokens; verify at four viewports. | 12, 11 |
| D14 | `Track.tsx`: "Mastery map" ghost button; `Shell.tsx`: `/mastery` counts as Explore | Diffs | **ADAPT** | Link to the track-scoped route; nav matcher uses route prefixes from a single table. | 15 |
| D15 | `Lesson.tsx` / `Quiz.tsx`: dispatch `now: Date.now()` | Diffs | **ADAPT** | Introduce an injectable clock (`useClock()`/`ClockProvider`) so tests control time; keep the optional `now` semantics. | 03 |
| D16 | `engagement.test.tsx` (322 lines, 42 tests) | Read in full | **REUSE** as the engagement test baseline | Split into focused files per module when ported (`streak.test.ts`, `daily.test.ts`, `achievements.test.ts`, `masteryLayout.test.ts`, `engagement.integration.test.tsx`); retarget imports; keep every assertion's intent. Add tests for new behaviour (assignment freeze, backfill, track scoping). | 03, 11, 12, 15 |
| D17 | Documentation rewrite: `ASSESSMENT_COMPLIANCE.md` (everything `pending-review`, source inventory, coverage gaps), `DECISIONS.md` D-114…D-118, `DESIGN.md` mastery/achievement notes | Read in full | **ADAPT** | Carry the honest "nothing verified" posture and the **coverage-gap table** into `06_FRONTEND_CONCEPTS_APPLICATION_MAP.md`. Supporting activity only: it must never block a stage. Merge DECISIONS entries as D-114…D-118 with the adaptations above. | 01, 19 |
| D18 | Reference scope limited to HTML | Source | **EXCLUDE as a limit** | Still HTML-coupled (hard-coded `'html'`, 12 topic ids in achievements, "HTML" in Mastery crumbs). Do not copy those couplings. | — |
| D19 | Original features the reference left unchanged: Orbit geometry/components, Shell, tokens, preview sandbox, `CodeEditor` textarea, Practice, Quiz engine, storage migrations | Identical files (`diff -rq` shows no difference) | **KEEP-ORIGINAL** | These are the baseline and stay the starting point for every later stage. | all |

## Reference defects or limits discovered (do not inherit)

1. **Core imports content data directly** (`daily.ts`, `achievements.ts` import `data/challenges` and `data/curriculum`), which blocks multi-track use → solved by injection (D4, D6).
2. **Daily pick changes when the challenge list changes** (modulo over `n`) → freeze assignment (D4).
3. **Achievements throw if a topic has no challenge** (`challenges.find(...)!`) → tolerate absence.
4. **No schema version for new persisted fields** → v2 migration (D3).
5. **Hard-coded "pass = 2 of 3" in UI** → derive from `isPass`.
6. **No earned dates / no gallery / no XP** → catalog scope kept (D6, D7).
7. **`/mastery` is single-track** → track-scoped route (D9).
8. **Streak card hides at zero activity on Home but Progress always shows a "No active streak" card** — inconsistent; standardise to the Home behaviour (a neutral "No activity recorded yet" line is acceptable, no streak figure).
9. **`longest` streak is computed from at most the last 400 stored days**, so very old best streaks silently shrink → persist `streakBest` (v2) updated whenever `streakInfo().longest` exceeds it.
10. **The reducer imports daily-challenge logic and HTML data** (`dailyChallengeFor`) → the reducer instead compares the action's `challengeId` with `state.dailyAssigned[today]` (no content import; testable with injected ids).
11. **The Daily card is mounted on both Home and Progress** → one canonical placement (dashboard); Progress links to it.
12. **Mastery graph has no keyboard model beyond Tab order and no scroll container** → roving tabindex (arrows move by level/row) and an inner scroll region (no page overflow) in Stage 15.
13. **A CSS sibling rule leaked between pages** (`.rules + .card--quiet { margin-top }` in `pages.css`, which the reference's own WORKLOG records as the cause of uneven Home cards) → use layout utilities/`gap`, not sibling selectors, when tokenising styles.
14. **Unreproducible verification claims.** The reference's `docs/TEST_PLAN.md` cites browser scripts `e2e.mjs` (41/41) and `e2e2.mjs` (11/11) and a 9-route × 3-size screenshot sweep. **Those scripts are not in the ZIP**; only the Vitest/typecheck/lint/build results above were reproduced and relied upon. Stage 01 adds a real, committed browser smoke script instead of inheriting the claim.

## What the reference confirms about the baseline

- Original `Rule`/validator architecture, storage migration approach and Orbit tests were *not* touched, which is evidence they are stable enough to build on.
- The `now` timestamp pattern and optional-field-tolerant sanitiser show the reducer/storage can absorb engagement data without a rewrite.
- The reference's two-state mastery wording ("Not possible: solution revealed first") is a good truthful-UX pattern to keep in Mastery and TopicDetail.

## Scope guarantee

Every one of the 110 catalog items remains in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`. Where the reference partially covers an item the matrix shows "Reference: partial" and the stage that adapts it. Where the reference has nothing, the item is **New**. The reference never reduces or reorders scope.
