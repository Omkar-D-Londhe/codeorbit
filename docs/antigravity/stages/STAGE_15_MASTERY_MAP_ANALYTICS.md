# Stage 15 — Mastery map (layered + force + heatmap) and progress analytics

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 15 · **Slug:** `mastery-map-analytics` · **Branch:** `stage-15-mastery-map-analytics`

**Objective.** Ship the track-scoped Mastery Map using the reference's verified layered layout as the default accessible view, add the catalog's force-directed and heatmap views, knowledge-gap recommendations, and the analytics suite (velocity, quiz breakdown, attempt heat table, time estimates, sharing card).

**In scope**
- 11.1 force-directed skill graph (opt-in view), 11.2 mastery heatmap view, 11.3 time-to-completion estimate, 11.4 knowledge-gap recommendations.
- 12.1 learning velocity chart, 12.2 topic time estimates vs actual, 12.3 quiz performance breakdown, 12.4 challenge attempt heat table, 12.5 progress sharing card.
- REF: layered mastery layout + page adapted (D8–D11, D14), keyboard model added.

**Out of scope**
- Spaced repetition (Stage 18).

## 2. Prerequisites and dependencies

- Stage 12 exit gate green (dashboard, insights modules), Stage 11 (xp/personal bests), Stage 03 (activity).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `11.1` Force-Directed Skill Graph, `11.2` Mastery Heatmap View, `11.3` Time-to-Completion Estimate, `11.4` Knowledge Gap Recommendations, `12.1` Learning Velocity Chart, `12.2` Topic Time Estimates vs Actual, `12.3` Quiz Performance Breakdown, `12.4` Challenge Attempt Heat Table, `12.5` Progress Sharing Card
**Platform / reference / concept items:** `REF-01` Layered mastery layout (reference `masteryLayout.ts`), `REF-06` Mastery page, list fallback and criteria panel
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-06 (data tables), FC-14, FC-15 (absolute-positioned nodes), FC-19, FC-21

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Mastery criteria text and 'A learning aid, not an exam grade' wording; existing four statuses and icons; Orbit; `topicProgress` semantics.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/App.tsx | Route `/learn/:technologyId/mastery`; `/mastery` redirects to the default track's map. |
| src/pages/Track.tsx | 'Mastery map' link parametrised by track. |
| src/components/Shell.tsx | Nav matcher uses route prefixes from a single table (D14). |
| src/pages/Progress.tsx | Analytics sections (collapsible) under existing summary. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/orbit/masteryLayout.ts | Copy of `reference/masteryLayout.ts` (REUSE) + guard for missing prerequisite ids (tested) + `maxDepth`. |
| src/core/orbit/forceLayout.ts | Deterministic seeded simulation (fixed iterations, no `Math.random`, no wall-clock), uniform node size, only declared edges; pinning API. |
| src/pages/Mastery.tsx | Adapted from `reference/Mastery.tsx`: views `Layers \| Force \| Heatmap \| List`; graph in an inner scroll region; roving tabindex (arrows: up/down within level, left/right across levels, Home/End); detail panel with criteria. |
| src/core/insights/estimates.ts | Estimated minutes remaining = Σ authored `estimatedMinutes` of incomplete parts; 'actual' only from measured active sessions (see below). |
| src/core/insights/activeTime.ts | Active-time tracker: foreground-visible seconds on lesson/practice routes in 30 s granularity; stored as `timeSpent: Record<topicId, seconds>` (schema **v7**, migration `v6→v7` adds `timeSpent: {}`). |
| src/core/insights/velocity.ts, quizBreakdown.ts, attemptHeat.ts, recommendations.ts | Pure derivations from `activity`, quiz records, challenge records. |
| src/core/insights/charts/*.tsx | Small accessible SVG charts (bar/line) with data tables as text alternatives; no chart library unless justified. |
| src/core/insights/ShareCard.tsx | Renders a card to canvas/PNG for download (local, no upload). |

## 7. Implementation steps (execute in order)

1. Inspect `docs/antigravity/reference/{masteryLayout.ts,Mastery.tsx,engagement.test.tsx}` (tests under 'mastery layout' and 'Mastery map page').
2. Port the 6 layout tests + page tests into `masteryLayout.test.ts` and `Mastery.test.tsx` with track-scoped routes; add: missing prerequisite id is ignored, cycle throws, positions stable across renders.
3. Adapt the page: remove hard-coded HTML crumb/`topics[0]`/'pass = 2 of 3' literal (derive pass wording from `isPass` semantics: 'at least two thirds correct'); keep list fallback < 720 px and `<details>` list alternative.
4. Add roving tabindex keyboard model and an inner scroll container (reference defect 12).
5. Force view: deterministic simulation (200 fixed iterations) → static final positions; drag pins a node (keyboard: `P` pins/unpins selected); pause/reset buttons; reduced motion: render final layout without animation.
6. Heatmap view: grid of topics by status colour **plus** icon+text; legend; sorted by level.
7. Time tracking: `useActiveTime` tracks visible foreground time on lesson/quiz/practice only, idles after 60 s without input; records seconds in `timeSpent`; labelled 'measured on this device'.
8. Estimates: show 'about N min remaining (estimate)'; compare to actual only when ≥ 3 measured sessions for that topic (P-07).
9. Recommendations: pure function — next best topic = incomplete topic whose prerequisites are all complete, tie-break by curriculum order; 'Gaps': completed topics with quiz best < perfect and no review yet; explain every recommendation in a sentence.
10. Charts with text-table alternatives; attempt heat table (`caption`, `th scope`) lists challenges × last 10 attempts as ✓/✗ with text.
11. Sharing card: includes only counts the learner can see (topics complete, streak if > 0, level if enabled); download PNG; no network.
12. QA at four viewports, keyboard, axe; docs.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

### 7a. Sub-stages

This stage is large. To keep each working session reviewable it may be executed as the sub-stages below **without dropping any scope**: the stage is complete only when every sub-stage gate and every §13 box is green. Each sub-stage uses branch `stage-NN<letter>-<slug>`, its own status report (`STAGE_NN<letter>_STATUS.md`) and its own exit gate. Give Antigravity one sub-stage at a time (guide §10).

| Sub-stage | Title | Scope (from §1/§7) | Sub-stage exit gate |
|---|---|---|---|
| 15a | Layered map, list fallback, heatmap | REF-01/06 port, Mastery page, keyboard model, heatmap, list <720 px | Layout/page tests + visual QA green |
| 15b | Force view (opt-in) | Deterministic seeded force layout, pinning, reduced-motion static | Determinism + edge-truth tests green |
| 15c | Analytics and time tracking (schema v7) | `timeSpent` migration `v6→v7`, active-time tracker, charts, estimates, recommendations, share card | Migration + chart tests green |

## 8. Component behaviour, state, data contracts and integration

```ts
interface MasteryView = 'layers' | 'force' | 'heatmap' | 'list'
masteryRoute(trackId) => `/learn/${trackId}/mastery`
timeSpent: Record<string /*topicId*/, number /*seconds*/>      // schema v7 (migration v6→v7)
recommend(state, track): { next?: { topicId: string; reason: string }; gaps: Array<{ topicId: string; reason: string }> }
```
Criteria panel (verbatim semantics from reference): lesson marked complete; quiz best (pass = at least two thirds correct); practice challenge passed; mastered = perfect quiz and no early solution reveal; if the solution was revealed first: 'Not possible: solution revealed first'.

## 9. UI/UX expectations

Layers view per reference (columns = prerequisite depth, uniform 176×56 nodes, curved edges only for real prerequisites, selected node's edges in `--accent-soft`). Force view: same node size, edges identical, subtle spacing only — distance never encodes ability. Charts: 2 colours max + patterns; axes labelled; tooltips keyboard-reachable. Mobile: list is the default; graph views available behind 'Show diagram' only when container ≥ 720 px.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

No activity: charts replaced with 'Complete a lesson to see your pace' (no empty axes). Fewer than 3 sessions: no 'actual' column. Prerequisite cycle (content bug): page shows a content-error notice and the list view only.

## 11. Security and performance

Layouts memoised by `(topicIds, width)`; force simulation < 20 ms for ≤ 60 nodes (budget test); active-time updates batched every 30 s; chart data derived on demand.

## 12. Required tests and regression checks

- Ported: `masteryLayout.test.ts` (6) and page tests (graph nodes + only real edges, selection highlights real edges, solution-first explanation, list fallback).
- New: force determinism (same input → same output), pin behaviour, heatmap semantics, recommendations, estimates labelling, active-time idle logic with fake clock, charts text alternatives, keyboard model.
- All existing progress tests unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] The share card (12.5) image has alt text and a text equivalent of the same numbers (test).
- [ ] Every drawn edge is a declared prerequisite (test) in all graph views.
- [ ] Layers view is default; list fallback appears under 720 px; page never overflows horizontally.
- [ ] Mastery criteria and the 'not an exam grade' note appear.
- [ ] Force layout is deterministic and static under reduced motion.
- [ ] No 'actual time' is shown without ≥ 3 measured sessions.
- [ ] Share card contains no fabricated values.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

REUSE `masteryLayout.ts` and tests (D8). ADAPT page (D9: route, no HTML literals, keyboard, scroll container). ADAPT layered-vs-force (D10). REUSE criteria wording (D11). ADAPT nav matcher (D14).

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- `topicProgress` and mastery semantics; orbit.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_15_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 15: Mastery map (layered + force + heatmap) and progress analytics`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 16 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
