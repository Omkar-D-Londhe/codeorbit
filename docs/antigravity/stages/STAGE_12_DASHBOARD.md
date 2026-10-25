# Stage 12 — Dashboard: hero ring, streak calendar, group cards, daily card, activity feed, quick actions, smart next step

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 12 · **Slug:** `dashboard` · **Branch:** `stage-12-dashboard`

**Objective.** Rebuild Home as the track-aware dashboard using the reference's truthfulness patterns and responsive grid.

**In scope**
- 3.1 hero progress ring, 3.2 streak calendar, 3.3 topic-group completion cards, 3.4 daily challenge card placement, 3.5 recent activity feed, 3.6 quick actions toolbar, 15.3 'what to do next' smart card.

**Out of scope**
- Charts and velocity (Stage 15); onboarding tour (Stage 17).

## 2. Prerequisites and dependencies

- Stage 11 exit gate green.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `3.1` Hero Progress Ring, `3.2` Streak Calendar, `3.3` Topic Group Completion Cards, `3.4` Daily Challenge Feature Card, `3.5` Recent Activity Feed, `3.6` Quick Actions Toolbar, `15.3` "What to do next" Smart Card
**Platform / reference / concept items:** `REF-08` Honest wording and grid patterns for cards
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-14 (grid), FC-13 (flexbox), FC-16 (responsive)

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Existing Home behaviours: Resume/Start logic, 'Welcome back' vs first-run copy, segment strip, Error Notebook card, `nextAction` rules.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/pages/Home.tsx | Compose the dashboard; no `'html'` literals; per-track via `useTrack`. |
| src/pages/Progress.tsx | Keep streak summary line and link to dashboard; **no duplicate daily card** (reference defect 11). |
| src/styles/pages.css | Grid utilities replacing sibling selectors. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/insights/HeroRing.tsx | Large `ProgressRing` with completed topics/steps text. |
| src/core/gamification/StreakCalendar.tsx | Last 12 weeks grid from `activityDays` (each cell: date, active/inactive as text + shape). |
| src/core/insights/GroupCards.tsx | One card per `TopicGroup` with completed/total and a link. |
| src/core/insights/ActivityFeed.tsx | Last 10 events from `activity` with real timestamps. |
| src/core/insights/QuickActions.tsx | Buttons only for real destinations: Resume, Daily, Review, Notes, Settings. |
| src/core/learning/NextStepCard.tsx | Wraps `nextAction`; explains why ('Because X is a prerequisite for Y'). |

## 7. Implementation steps (execute in order)

1. Inspect `Home.tsx` and the reference `Home.tsx` diff (`reference_integration.diff`).
2. Write dashboard layout with `GlassPanel`/`Card`; 3 rows per `04` §4.
3. Streak calendar semantics: `role=table` with `caption`, `th` weekdays, cells `aria-label='12 March: active'`; month labels; legend 'Active day / No activity'.
4. Hide streak card/calendar numbers when `activityDays.length === 0` (show 'No activity recorded yet' once).
5. Activity feed shows only recorded events; empty → hidden.
6. Quick actions list only enabled destinations.
7. Keep original first-run vs returning copy.
8. Visual QA at four viewports; keyboard tour; axe.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

`StreakCalendar({ days: string[], today: string, weeks = 12 })`. `GroupCards({ track, progressOf })`. Feed entries map `ActivityEvent.type` to sentences (`'Completed lesson: Lists'`).

## 9. UI/UX expectations

Row 1: hero ring card (left) + Continue card + Daily card. Row 2: group cards grid (`minmax(220px, 1fr)`) + streak calendar (min 280 px). Row 3: activity feed + quick actions. Mobile: single column order: Continue, Daily, Hero ring, Groups, Calendar, Feed. Empty new-learner state: only Continue/Start + Daily + Groups (0%).

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

No available track → empty state. Gamification disabled → hide streak/daily/XP parts. All topics complete → existing 'Every topic is complete' content.

## 11. Security and performance

Derive from state with memoised selectors; calendar renders 84 cells max.

## 12. Required tests and regression checks

- Dashboard integration (first run, returning, complete, no track, gamification off); calendar semantics and a11y; feed shows real events only; ported reference tests: 'Home shows today's daily challenge with a working link and honest wording'.
- Existing Home tests pass.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] First-run dashboard shows no streak figure, no feed, no fabricated numbers.
- [ ] Calendar active days equal `activityDays` exactly (test).
- [ ] Daily card appears exactly once across Home and Progress.
- [ ] Layout verified at 1280/820/390/320 px without overflow.
- [ ] Original Resume/Start/Review behaviours preserved.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

REUSE streak-card truthfulness (D12); ADAPT grid and wording (D5, D13); fix duplicate daily card.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- `nextAction` rules, status vocabulary, routes.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_12_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 12: Dashboard: hero ring, streak calendar, group cards, daily card, activity feed, quick actions, smart next step`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 13 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
