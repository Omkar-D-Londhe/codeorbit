# Stage 10 — Learning Orbit: celestial constellation map (10a prototype → 10b roll-out) with extended layers

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

> **Decision gate:** O-15 (prototype approval) is a hard gate between 10a and 10b: do not start 10b until the owner records "approved" in `07` §4. **O-16 is resolved:** locked topics are advisory; learners may open them and see prerequisite guidance. Do not block lesson, quiz, or practice routes.

## 1. Stage identity, objective and scope

**Stage:** 10 · **Slug:** `constellation-orbit` · **Branch:** `stage-10-constellation-orbit`

**Objective.** Replace the legacy upward-arc Learning Orbit with the owner-approved celestial constellation map as the primary Learning Orbit, delivered prototype-first: 10a builds a working, tested and visually inspected prototype on the real architecture and the real HTML topics and stops for owner approval (O-15); 10b rolls the constellation out to every track, adds the catalog layers 2.1–2.7, retires the legacy arc and completes visual QA. Preserve synchronised topic navigation, declared-prerequisite-only connections, the keyboard model and every locked truthfulness rule. Read `10_CONSTELLATION_LEARNING_ORBIT_SPEC.md` completely and look at `design-reference/codeorbit_constellation_concept.png` before starting.

**In scope**
- **10a (prototype):** constellation data model and pure functions (`validateConstellation`, `computeConstellationLayout`, `deriveNodeState`, `fitTransform`, `clampTransform`, `nextNodeInDirection`, `aspectBucket`); hub, stars, labels, the four derived states, prerequisite and order lines, selection, topic-details panel with real Lesson/Quiz/Practice actions, Your Progress and Legend cards, topic stepper, Map/List toggle and list view, expand mode, pan/zoom (pointer, touch pinch, keyboard, buttons), responsive layouts, reduced-motion and high-contrast behaviour; mounted on the real Track page behind `?orbit=constellation`; dev-only `/__ui/orbit` fixture page; the tests in `10` §16; screenshots and the evidence package (`10` §14.2, §15).
- **10b (roll-out):** after O-15 is recorded as approved — make the constellation the default for every track; catalog 2.1 star pulse, 2.2 trail on non-adjacent selection, 2.3 prerequisite emphasis with Requires/Unlocks live text, 2.4 group zones (halos) with label-click navigation, 2.5 magnify ≤ 1.08× with tooltip, 2.6 you-are-here marker, 2.7 48×48 mini constellation in the breadcrumb bar (lesson/practice, ≥ 768 px); remove the legacy arc route and retire only arc-geometry tests with a recorded note (`10` §17); port every surviving intent test; performance measurement on the 42-node fixture; final visual QA at five viewports.

**Out of scope**
- Orbit search highlight 2.8 (Stage 13).
- Mastery Map and force graph (Stage 15) — a separate analytic view.
- Canvas/WebGL/3D rendering (needs measured evidence and owner approval, `10` §11).
- The concept image's top navigation, bell, avatar and placeholder topics — never built (L-08).

## 2. Prerequisites and dependencies

- Stage 04 exit gate green (motion hook, `Starfield`, per-track tint), Stage 02 (tokens and `core/ui` components incl. `StatusChip`, `ProgressRing`, icon registry), Stage 03 (settings).
- For 10b only: **O-15 recorded as approved** in `07` §4 (hard gate). O-16 is already resolved to advisory behavior; do not add enforced locking.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `2.1` Star Pulse on Progress Save, `2.2` Orbital Trail on Navigation, `2.3` Prerequisite Constellation Lines, `2.4` Topic Group Zones, `2.5` Zoom/Magnify on Hover (Arc nodes), `2.6` "You Are Here" Indicator, `2.7` Mini Orbit Preview in Header
**Platform / reference / concept items:** `PLT-15` Constellation Learning Orbit map (primary), `PLT-16` Orbit list view and topic stepper (synchronised navigation), `PLT-17` Constellation prototype gate and mandatory visual QA evidence
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-15 (absolute positioning of stars), FC-17 (transitions/animation), FC-18 (hover/focus/pointer events), FC-24 (carousel pattern → stepper pager)

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Selection model (`state.selectedTopicId`, `SELECT_TOPIC`), `topicProgress`/`trackProgress`/`nextAction` semantics (L-15), existing routes and `lib/routes` helpers, `prerequisiteEdges`/`dependentsOf`.
- In 10a the **legacy arc orbit stays the default** and its tests stay green (`orbitGeometry.ts`, `OrbitArch.tsx`, `TopicStrip.tsx`, `orbit.geometry.test.ts`, orbit parts of `app.test.tsx`).
- Roving tabindex and Home/End semantics, status-never-colour-only, focus management on route change.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/pages/Track.tsx (or the component it renders) | 10a: render `<ConstellationOrbit>` when `?orbit=constellation`; 10b: render it by default and remove the flag and the legacy branch. |
| src/components/orbit/LearningOrbit.tsx | Remains the legacy default in 10a; removed from the route in 10b (after O-15). |
| src/components/Shell.tsx | 10b: mini constellation in the breadcrumb bar (≥ 768 px, lesson and practice views). |
| src/styles/*.css + tokens | Consume the Stage 02 `--orbit-*` tokens; add constellation CSS (`constellation.css`). |
| src/core/search/*, TopicDetail (Stage 13 consumers) | Not in this stage; keep the `highlightIds` prop in the contract so Stage 13 plugs in without moving stars. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/orbit/constellation/types.ts | Types in `10` §3 (`NodeState`, `LayoutNode`, `ConstellationLayout`, `NodeView`, `ViewTransform`, track meta). |
| src/core/orbit/constellation/layout.ts (+ test) | `computeConstellationLayout`, `aspectBucket`, collision relaxation — pure, deterministic, no `Math.random`. |
| src/core/orbit/constellation/state.ts (+ test) | `deriveNodeState` and derived counts; shared with the Mastery Map (Stage 15). |
| src/core/orbit/constellation/validate.ts (+ test) | `validateConstellation`: real ids, declared prerequisites, DAG, ≤ 42 topics, authored coords all-or-nothing. |
| src/core/orbit/constellation/viewport.ts (+ test) | `fitTransform`, `clampTransform`, zoom limits, `nextNodeInDirection`. |
| src/core/orbit/constellation/usePanZoom.ts | Pointer/touch/keyboard handling through refs and rAF; no React re-render per move; cleanup on unmount. |
| src/core/orbit/constellation/ConstellationOrbit.tsx | Container: header (track select, count, Map/List toggle, expand), map, stepper, panels; owns view state, reads real state. |
| src/core/orbit/constellation/ConstellationMap.tsx + Star.tsx + Hub.tsx + Edges.tsx | SVG connections/rings; DOM `<button>` stars and hub inside the transformed wrapper; labels per zoom policy. |
| src/core/orbit/constellation/TopicDetailsPanel.tsx, ProgressCard.tsx, LegendCard.tsx | Right column / docked panel (`10` §6). |
| src/core/orbit/constellation/TopicStepper.tsx, TopicListView.tsx | Synchronised stepper (prev/next/dots) and the complete list view (`10` §6.3, §8). |
| src/core/orbit/constellation/constellation.css | Styles using `--orbit-*` tokens; reduced-motion and high-contrast rules. |
| src/pages/UiOrbitGallery.tsx | Dev-only `/__ui/orbit` fixture page (labelled fixture data, never stored; excluded from production). |
| e2e/orbit-visual.spec.ts | Committed screenshot + smoke script (`10` §15). |
| 10b: src/core/orbit/{MiniConstellation.tsx, usePulse.ts, OrbitTrail.tsx, relationsLive.ts, ZoneHalos.tsx} | Catalog 2.1–2.7 layers. |

## 7. Implementation steps (execute in order)

1. **10a-1 Inspect.** Read `10`, look at the concept image, read the real HTML track data, `topicProgress`, `lib/routes`, the Track page, existing orbit tests; run the full gates and record the baseline.
2. **10a-2 Pure core first (tests red → green).** `types.ts`, `validate.ts`, `layout.ts`, `state.ts`, `viewport.ts` with the layout/connection/state/navigation tests in `10` §16, including the min-spacing matrix and edges-equal-declared-prerequisites tests against the real HTML data.
3. **10a-3 Static render.** Backdrop (Stage 04 `Starfield`), hub, stars with the four states, labels, order path and prerequisite edges, selection via click/Enter/Space writing `SELECT_TOPIC`. Inspect it in the browser immediately.
4. **10a-4 Panels.** Topic-details panel (real actions via `lib/routes`), Your Progress, Legend, track-overview state for the hub, live regions.
5. **10a-5 Navigation surfaces.** Stepper and list view sharing the selection; Map/List toggle with the `codeorbit:ui:orbit-view` preference and the P-12 default rule; expand mode.
6. **10a-6 Pan/zoom.** `usePanZoom` (drag threshold, ctrl/⌘+wheel, pinch, buttons, keyboard), clamp, fit, label policy; verify the page still scrolls around the map on touch and that plain wheel is not captured.
7. **10a-7 Responsive + states.** Layouts for ≥ 1100, 768–1099, 480–767, < 480; loading, empty (no topics), error (invalid data) states; reduced motion and high contrast.
8. **10a-8 Tests.** Complete the test plan in `10` §16 (component, a11y with axe, responsive, motion, pan/zoom).
9. **10a-9 Visual QA (mandatory).** Run the app; capture the screenshot set at 1440×900, 1280×800, 820×1180, 390×844, 320×640 for every state in `10` §14.2; look at them; fill `10` §15.2–§15.3; fix defects; re-capture and re-inspect.
10. **10a-10 Evidence package and STOP.** Write `STAGE_10a_STATUS.md` with the evidence, deviations and NOT VERIFIED items; ask the owner to record O-15. Do not start 10b.
11. **10b-1 After O-15 = approved:** apply requested changes, make the constellation the default, remove the flag and the legacy arc route, port surviving intent tests, retire only arc-geometry tests with the supersession note (`10` §17).
12. **10b-2 Layers 2.1–2.7:** pure helpers + tests first (zones partition, trail path, relations text); pulse on real progress saves only; trail on non-adjacent selection; zones with label click; magnify tooltip; you-are-here marker from `lastVisited`; mini constellation.
13. **10b-3 Roll-out checks:** every available track renders (validate data, ≥ 13-topic fixture and the 42-node fixture), performance measurement, theme × accent × contrast × high-contrast × font-scale sweep.
14. **10b-4 Final visual QA at five viewports, docs and status report.**

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

### 7a. Sub-stages

This stage is delivered as **required** sub-stages. Each has its own branch, status report and exit gate; do not start the next sub-stage until the previous one is green and accepted by the owner where a gate says so.

| Sub-stage | Title | Scope (from §1/§7) | Sub-stage exit gate |
|---|---|---|---|
| 10a | Constellation prototype (real architecture, representative HTML topics) | Pure core, map, states, panels, stepper, list, pan/zoom, responsive, tests, visual QA evidence; legacy arc remains default; flag `?orbit=constellation` | All 10a acceptance boxes green with evidence; screenshots at 5 viewports looked at and compared; **STOP — owner records O-15** |
| 10b | Roll-out, catalog layers 2.1–2.7, legacy retirement | Default for all tracks; pulse, trail, zones, magnify, you-are-here, mini constellation; legacy arc removed; surviving tests ported; perf + final visual QA | All §13 boxes green; G11 satisfied; Stage 11 may start |

## 8. Component behaviour, state, data contracts and integration

Full contracts, layout algorithm, state table, interaction model and test names are in `10_CONSTELLATION_LEARNING_ORBIT_SPEC.md` §3–§8 and §16 — implement them exactly; they are not repeated here to avoid divergence.

Key invariants to assert in tests:
```ts
// every node ↔ one real topic; edges == declared prerequisiteIds; positions independent of progress/selection
expect(layout.nodes.map(n => n.topicId)).toEqual(track.topics.map(t => t.id))
expect(edgeKeys(layout.edges)).toEqual(sorted(prerequisiteEdges(track.topics).map(e => `${e.from}>${e.to}`)))
expect(computeConstellationLayout(topics, 'landscape')).toEqual(computeConstellationLayout(topics, 'landscape')) // deterministic
```
Selecting a star dispatches `SELECT_TOPIC`; the primary action navigates with `lib/routes` (`/lesson/:topicId`); Quiz and Practice buttons use `/quiz/:topicId` and `/practice/:challengeId`.

## 9. UI/UX expectations

Follow `10` §1–§2, §6, §9 and `04` §6. The concept image is a mood reference: hub centre, flowing ring of glassy stars with number + title + status, faint dashed/dotted lines, restrained glow on a deep violet field, right-hand details column, stepper and Map/List toggle. Use real topic names and counts, project tokens and the agreed shell; do not build the image's top navigation, bell or avatar.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Loading (skeleton ring), empty track (no topics: explanatory empty state, no map), invalid data (error state listing `validateConstellation` issues in dev, a friendly message in production), unavailable track (truthful availability chip, no map), storage-recovery banner unaffected, locked topics advisory (O-16), one-topic track (hub + one star, no lines), > 14 topics on narrow screens → list view default (P-12).

## 11. Security and performance

No new runtime dependency; custom pointer handling; no `innerHTML`; labels from authored data rendered as text. Performance budget in `10` §12 (≤ 25 kB gzip added to the route chunk, memoised layout, no re-render during pan/zoom, no long task > 50 ms or NOT VERIFIED). Listeners and observers cleaned up. Dev-only `/__ui/orbit` is excluded from production and its fixture data never enters storage.

## 12. Required tests and regression checks

- All tests listed in `10` §16 (layout, connections, state, navigation, map, pan-zoom, a11y/axe, responsive, motion, progress card, e2e visual script).
- Legacy orbit tests stay green through 10a; in 10b port the intent tests and retire only arc-geometry tests with a recorded note.
- 10b: pulse fires once per real save and not on load/navigation; trail only for non-adjacent selection and absent under reduced motion; zones do not move stars (position equality); mini constellation text alternative; relation live text; you-are-here marker.
- Regression smoke (`08` G2) green; G11 checklist.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] **10a:** every star maps to a real HTML topic id and the 15 declared prerequisite connections equal the data (test); the four node states render with icon + text and counts sum to 12; selecting a star updates the panel and its Lesson/Quiz/Practice actions open the correct existing routes for every HTML topic (test).
- [ ] **10a:** pan, zoom, fit and expand work by mouse, touch pinch and keyboard/buttons; panning never changes selection; the page scrolls around the map; list view and stepper are complete equivalents sharing one selection.
- [ ] **10a:** reduced motion and high contrast verified; axe has zero serious/critical violations in all states; layout tests pass for both aspect buckets.
- [ ] **10a:** screenshots at 1440×900, 1280×800, 820×1180, 390×844 and 320×640 exist, were looked at, and `10` §15.2–§15.3 are filled with fixes and re-inspection — or the report states VISUAL: NOT VERIFIED and the exit gate stays closed.
- [ ] **10a:** legacy orbit still the default and all legacy tests green; evidence package delivered; owner approval O-15 requested.
- [ ] **10b (only after O-15 approved):** constellation is the default for every available track; no document or code path still implements the arc for the primary orbit; surviving intent tests ported; only arc-geometry tests retired with a note.
- [ ] **10b:** 2.1 pulse (real saves only), 2.2 trail (non-adjacent selection), 2.3 emphasis + Requires/Unlocks text, 2.4 zones (no position change; label click selects first topic), 2.5 magnify ≤ 1.08× with tooltip, 2.6 you-are-here, 2.7 48×48 mini constellation with link and text alternative — each with its test.
- [ ] **10b:** performance measured on the 42-node fixture (or NOT VERIFIED), five-viewport visual QA re-done on the final build, G11 checklist complete.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None from the reference ZIP for the map (it left the orbit untouched, KEEP-ORIGINAL for selection semantics). `masteryLayout.ts` is **not** used here. The concept image is a visual reference only (`design-reference/README.md`).

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- `topicProgress`/`trackProgress` semantics, the four `TopicStatus` values, mastery/pass rules (L-15), `selectedTopicId` and `SELECT_TOPIC`, routes.
- In 10a: the legacy orbit components and their tests.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_10_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 10: Learning Orbit: celestial constellation map (10a prototype → 10b roll-out) with extended layers`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 11 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
