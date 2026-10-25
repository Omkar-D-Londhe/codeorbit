# 03 — Master Stage Plan

The complete implementation sequence for Antigravity. Stages are ordered by **technical dependency and risk**, not to make a long document: shared foundations first, then user-visible platform features, then engagement/insight built on real events, then resilience and authoring, then the execution/analysis framework, then language tracks one at a time (each mature track de-risking the next), and finally release verification.

**Execution rule:** one stage at a time, in order. A stage's exit gate must be green before the next begins (`ANTIGRAVITY_EXECUTION_GUIDE.md`). Some stages carry **soft** gates (a default exists; proceed and record) or **hard** gates (the gated capability waits for the owner's recorded yes): see §10 (gate table) and `07` §4a. Stage 10 is delivered as 10a prototype → owner approval (O-15) → 10b.

## 1. Order, outcomes and dependencies

| Stage | Phase | Name | Depends on | Items | Gate | Instruction file |
|---|---|---|---|---|---|---|
| 01 | A · Foundation | Baseline lock, reference snapshot and language-neutral core | — (first stage) | 3 | — | [`stages/STAGE_01_BASELINE_LOCK_AND_NEUTRAL_CORE.md`](stages/STAGE_01_BASELINE_LOCK_AND_NEUTRAL_CORE.md) |
| 02 | A · Foundation | Design system v2: tokens, themes, accents, glass surfaces, scrollbars | 01 | 5 | — | [`stages/STAGE_02_DESIGN_SYSTEM_V2.md`](stages/STAGE_02_DESIGN_SYSTEM_V2.md) |
| 03 (03a, 03b) | A · Foundation | Storage v2, settings, data management, activity foundation | 02 | 9 | — | [`stages/STAGE_03_STORAGE_V2_SETTINGS_DATA.md`](stages/STAGE_03_STORAGE_V2_SETTINGS_DATA.md) |
| 04 | B · Experience and workspace | Atmosphere layers and cinematic transitions | 03 | 5 | — | [`stages/STAGE_04_ATMOSPHERE_AND_MOTION.md`](stages/STAGE_04_ATMOSPHERE_AND_MOTION.md) |
| 05 | B · Experience and workspace | Editor platform: CodeMirror 6 adapter, splitter, auto-save, fullscreen, editor preferences | 03 | 5 | soft · O-01 | [`stages/STAGE_05_EDITOR_PLATFORM.md`](stages/STAGE_05_EDITOR_PLATFORM.md) |
| 06 | B · Experience and workspace | Practice workspace: multi-file, snippets, device frames, a11y linter, diff, difficulty progression | 05 | 6 | — | [`stages/STAGE_06_PRACTICE_WORKSPACE.md`](stages/STAGE_06_PRACTICE_WORKSPACE.md) |
| 07 | B · Experience and workspace | Feedback and Code Coach framework | 06 | 6 | — | [`stages/STAGE_07_FEEDBACK_CODE_COACH.md`](stages/STAGE_07_FEEDBACK_CODE_COACH.md) |
| 08 | B · Experience and workspace | Lesson Studio: reading experience, TOC, tooltips, bookmarks, demos, focus mode | 05, 03 | 10 | — | [`stages/STAGE_08_LESSON_STUDIO.md`](stages/STAGE_08_LESSON_STUDIO.md) |
| 09 | B · Experience and workspace | Quiz engine: new question types, timed mode, breakdown | 06 | 6 | — | [`stages/STAGE_09_QUIZ_ENGINE.md`](stages/STAGE_09_QUIZ_ENGINE.md) |
| 10 (10a, 10b) | B · Experience and workspace | Learning Orbit: celestial constellation map (10a prototype → 10b roll-out) with extended layers | 04, 02, 03 | 10 | hard · O-15 (O-16 soft) | [`stages/STAGE_10_CONSTELLATION_ORBIT.md`](stages/STAGE_10_CONSTELLATION_ORBIT.md) |
| 11 (11a, 11b) | C · Engagement and insight | Gamification: XP, levels, achievements, streaks, daily challenge, personal bests | 03, 09, 10 | 10 | soft · O-09, O-10 | [`stages/STAGE_11_GAMIFICATION_ENGAGEMENT.md`](stages/STAGE_11_GAMIFICATION_ENGAGEMENT.md) |
| 12 | C · Engagement and insight | Dashboard: hero ring, streak calendar, group cards, daily card, activity feed, quick actions, smart next step | 11 | 8 | — | [`stages/STAGE_12_DASHBOARD.md`](stages/STAGE_12_DASHBOARD.md) |
| 13 | C · Engagement and insight | Command palette, fuzzy search, filters/tags, related topics, orbit search highlight, shortcuts modal | 08, 10, 02 | 6 | — | [`stages/STAGE_13_COMMAND_PALETTE_DISCOVERY.md`](stages/STAGE_13_COMMAND_PALETTE_DISCOVERY.md) |
| 14 | C · Engagement and insight | Notes, bookmarks, Error Notebook flashcards and export | 13, 08 | 6 | — | [`stages/STAGE_14_NOTES_BOOKMARKS_REVIEW.md`](stages/STAGE_14_NOTES_BOOKMARKS_REVIEW.md) |
| 15 (15a, 15b, 15c) | C · Engagement and insight | Mastery map (layered + force + heatmap) and progress analytics | 12, 11, 03 | 11 | — | [`stages/STAGE_15_MASTERY_MAP_ANALYTICS.md`](stages/STAGE_15_MASTERY_MAP_ANALYTICS.md) |
| 16 | D · Inclusion, resilience, authoring, concepts | Accessibility and inclusivity features, reminders | 12 | 6 | — | [`stages/STAGE_16_ACCESSIBILITY_INCLUSIVITY.md`](stages/STAGE_16_ACCESSIBILITY_INCLUSIVITY.md) |
| 17 (17a, 17b, 17c) | D · Inclusion, resilience, authoring, concepts | Onboarding, empty states, performance, optimistic UI, offline/PWA, recovery UI | 16 | 7 | soft · O-08 | [`stages/STAGE_17_ONBOARDING_RESILIENCE_OFFLINE.md`](stages/STAGE_17_ONBOARDING_RESILIENCE_OFFLINE.md) |
| 18 (18a, 18b) | D · Inclusion, resilience, authoring, concepts | Spaced repetition, custom challenges, peer snapshots, voice read, portfolio export | 14, 06, 09 | 5 | — | [`stages/STAGE_18_LEARNING_SCIENCE_AUTHORING.md`](stages/STAGE_18_LEARNING_SCIENCE_AUTHORING.md) |
| 19 | D · Inclusion, resilience, authoring, concepts | Concept Atlas: frontend concepts applied in the platform and linked to track content | 18 | 0 | — | [`stages/STAGE_19_CONCEPT_ATLAS.md`](stages/STAGE_19_CONCEPT_ATLAS.md) |
| 20 (20a, 20b) | E · Analysis framework and language tracks | Execution runner and complexity-analysis & optimisation framework | 07, 06, 15 | 3 | soft · O-13 | [`stages/STAGE_20_RUNNER_AND_ANALYSIS_FRAMEWORK.md`](stages/STAGE_20_RUNNER_AND_ANALYSIS_FRAMEWORK.md) |
| 21 (21a, 21b) | E · Analysis framework and language tracks | Language integration playbook and the HTML track module (with course-evidence gap closure) | 20, 19 | 13 | — | [`stages/STAGE_21_HTML_MODULE_AND_PLAYBOOK.md`](stages/STAGE_21_HTML_MODULE_AND_PLAYBOOK.md) |
| 22 | E · Analysis framework and language tracks | CSS track | 21 | 8 | — | [`stages/STAGE_22_CSS_TRACK.md`](stages/STAGE_22_CSS_TRACK.md) |
| 23 (23a, 23b) | E · Analysis framework and language tracks | JavaScript track, script-enabled preview, Worker execution and the first real analysis provider | 22, 20 | 11 | soft · O-02, O-12 | [`stages/STAGE_23_JAVASCRIPT_TRACK.md`](stages/STAGE_23_JAVASCRIPT_TRACK.md) |
| 24 | E · Analysis framework and language tracks | Bootstrap track | 23 | 3 | — | [`stages/STAGE_24_BOOTSTRAP_TRACK.md`](stages/STAGE_24_BOOTSTRAP_TRACK.md) |
| 25 (25a, 25b) | E · Analysis framework and language tracks | Python track (Pyodide in a Worker) with analysis provider | 24 | 1 | hard · O-03 | [`stages/STAGE_25_PYTHON_TRACK.md`](stages/STAGE_25_PYTHON_TRACK.md) |
| 26 | E · Analysis framework and language tracks | Java and C++ tracks (decision-gated execution) | 25 | 1 | hard · O-04 | [`stages/STAGE_26_JAVA_CPP_GATED.md`](stages/STAGE_26_JAVA_CPP_GATED.md) |
| 27 | E · Analysis framework and language tracks | Angular track (decision-gated) | 26 | 1 | hard · O-05 | [`stages/STAGE_27_ANGULAR_GATED.md`](stages/STAGE_27_ANGULAR_GATED.md) |
| 28 | E · Analysis framework and language tracks | External-dependency features (AI hints, W3C validator, LAN multiplayer) | 27 | 3 | hard · O-06, O-07, O-14 | [`stages/STAGE_28_EXTERNAL_DEPENDENCY_GATED.md`](stages/STAGE_28_EXTERNAL_DEPENDENCY_GATED.md) |
| 29 | F · Release | Final integration, hardening and release | all (01–28) | 0 | — | [`stages/STAGE_29_FINAL_INTEGRATION_RELEASE.md`](stages/STAGE_29_FINAL_INTEGRATION_RELEASE.md) |

### 1.1 Expected outcome per stage

| Stage | Expected outcome (one line; the stage file has the full objective) |
|---|---|
| 01 | Original locked as baseline; reference snapshot; `TrackRegistry`; regression, axe and browser-smoke tooling |
| 02 | Themeable design system: 3 themes, 5 accents, contrast-tested tokens, `core/ui` components, orbit tokens |
| 03 | Schema v2 + injectable clock + activity foundation; Settings page; export/import/reset; quota guard |
| 04 | Optional nebula, grid, cursor glow, particles, static `Starfield`; route transitions; reduced-motion safe |
| 05 | CodeMirror 6 behind `EditorAdapter` (textarea fallback); splitter, auto-save indicator, fullscreen, preferences |
| 06 | Multi-file practice workspace: tabs, snippets, device frames, a11y linter, diff, `CodeRunner` preview |
| 07 | Source-positioned diagnostics, Code Coach feedback panel, attempt history (schema v3) |
| 08 | Lesson reading experience: TOC, progress, terms, takeaways, section bookmarks, demos, focus mode (schema v4) |
| 09 | Typed quiz engine: new question types, timed mode, breakdown; pass/perfect semantics unchanged |
| 10 | Celestial constellation Learning Orbit: prototype (10a) → owner approval → roll-out and layers 2.1–2.7 (10b) |
| 11 | XP, levels, derived achievements, streaks, frozen daily challenge, personal bests (schema v5) |
| 12 | Dashboard: hero ring, streak calendar, group cards, daily card, activity feed, quick actions |
| 13 | Command palette, fuzzy search, filters/tags, related topics, orbit search highlight, shortcuts modal |
| 14 | Markdown-subset notes, tags, bookmark folders, Error Notebook flashcards, export (schema v6) |
| 15 | Mastery Map (layered, force, heatmap) and analytics: velocity, time tracking, estimates (schema v7) |
| 16 | Font scaling, dyslexia font, high contrast, announcements, local reminders, accessibility sweep |
| 17 | Tour, empty states, code splitting, optimistic UI, error boundary, PWA/offline |
| 18 | Spaced repetition, custom challenges, peer snapshots, voice read, portfolio (schema v8) |
| 19 | Concept Atlas: FC registry linked to real platform use, lessons, demos, exercises, tests; honesty tests |
| 20 | Worker runner host and the complexity-analysis & optimisation framework with an honest no-provider state (schema v9) |
| 21 | Track playbook + generator; HTML module expansion closing the course-concept gaps |
| 22 | CSS track with a parser-backed style probe; no scripts needed |
| 23 | JavaScript track, script-enabled preview, Worker engine, first real analysis provider |
| 24 | Bootstrap track with vendored preview CSS; reuses CSS machinery |
| 25 | Python: 25a content and structure-check practice (`preview`); 25b Pyodide execution and `ast` provider (hard-gated by O-03) |
| 26 | Java and C++: content, structure checks, static estimators (medium cap); execution hard-gated by O-04 |
| 27 | Angular: lessons, quizzes, decision memo, `decision-gated` state; practice hard-gated by O-05 |
| 28 | External-dependency features (AI hints, W3C validator, LAN multiplayer) hard-gated per feature |
| 29 | Whole-product verification against the matrix; hardening; documentation; release candidate |

### 1.2 Reference adaptation per stage

| Stage | Reference-ZIP use (see `05`) |
|---|---|
| 01 | Nothing is copied into `src/` in this stage |
| 02 | Reference `pages.css` additions (status chips, achievement cards, mastery nodes) are tokenised later in Stages 11/12/15; do not import them now |
| 03 | REUSE `reference/streak.ts` + its 9 tests (D1); REUSE the meaningful-activity rule (D2); ADAPT optional-field storage to a real v2 migration (D3); ADAPT `now: D |
| 04 | — |
| 05 | — |
| 06 | — |
| 07 | — |
| 08 | Reference `Lesson.tsx` change is only `now: Date.now()` (already handled in Stage 03) |
| 09 | Reference changes `Quiz.tsx` only to pass `now` (handled in Stage 03) |
| 10 | — |
| 11 | REUSE: streak logic (already Stage 03), achievement rule wording and tests |
| 12 | REUSE streak-card truthfulness (D12); ADAPT grid and wording (D5, D13); fix duplicate daily card |
| 13 | — |
| 14 | — |
| 15 | REUSE `masteryLayout.ts` and tests (D8) |
| 16 | — |
| 17 | — |
| 18 | D2 meaningful-activity table extended with `review-answer` |
| 19 | D17: carry the reference's honest `pending-review` posture and its coverage-gap list into the registry |
| 20 | — |
| 21 | D17 coverage-gap table is the source for the content work; D18 forbids inheriting HTML coupling |
| 22 | — |
| 23 | — |
| 24 | — |
| 25 | — |
| 26 | — |
| 27 | — |
| 28 | — |
| 29 | Final comparison: confirm every adapted reference feature (streak, daily, achievements, mastery) still passes the ported reference test intents |

## 2. Why this order

1. **Stage 01 first** — nothing multi-track, no analysis and no new language can be built while pages hard-code `'html'`; the regression and browser-smoke tooling also lets every later stage prove it did no harm. The original is locked as the baseline *before* any change.
2. **Design system (02) before settings (03) before visual layers (04)** — themes/accents/contrast are the substrate for Settings, atmosphere, high-contrast and every later component. Storage v2 and the injectable clock (03) are prerequisites for activity, XP, streaks, analytics and all later migrations.
3. **Editor (05) → Practice workspace (06) → Feedback (07)** — the coding workspace is the platform's centre; feedback and analysis hang off its contracts (`EditorAdapter`, `CodeRunner`, diagnostics).
4. **Lesson (08), Quiz (09), Constellation Learning Orbit (10)** — independent surfaces that only need the earlier foundations; the constellation needs the tokens/components from 02, the `Starfield` and motion hook from 04, and is built prototype-first (10a) with an owner checkpoint (O-15) before roll-out (10b).
5. **Gamification (11) → Dashboard (12) → Discovery (13) → Notes (14) → Mastery & analytics (15)** — engagement logic first (it defines the real events), then the surfaces that display it; search and notes precede analytics so the index and personal data exist.
6. **Accessibility (16), Resilience/offline (17), Authoring (18), Concept Atlas (19)** — cross-cutting features applied *after* most UI exists so they cover it; the Atlas is built when there is something real to map.
7. **Runner and analysis framework (20) before any language** — the contracts and the honest "no provider" state exist before a provider can mislead anyone.
8. **Tracks one at a time (21–27)** — HTML module + playbook (21) proves the pattern; CSS (22) needs no scripts; JavaScript (23) introduces script execution and the first real analyzer; Bootstrap (24) reuses CSS machinery; Python (25) adds a heavy runtime; Java/C++ (26) and Angular (27) are decision-gated; external-dependency features (28) are last because they need infrastructure.
9. **Final integration (29)** verifies the whole product against this matrix.

No stage may be executed in parallel with another: they share the reducer, storage, styles and routing.

## 3. Persisted schema chain

| Version | Stage | Change | Migration |
|---|---|---|---|
| 1 | original | baseline (+ reference-style optional `activityDays`/`dailyDone` tolerated) | — |
| 2 | 03 | `settings`, `activity`, `activityDays`, `dailyDone`, `dailyAssigned`, `streakBest` | `v1→v2` (preserves reference-style fields) |
| 3 | 07 | `ChallengeRecord.history` | `v2→v3` |
| 4 | 08 | `sectionBookmarks` | `v3→v4` |
| 5 | 11 | `badges`, `personalBests` | `v4→v5` |
| 6 | 14 | notes as Markdown + tags, `bookmarkFolders` | `v5→v6` |
| 7 | 15 | `timeSpent` | `v6→v7` |
| 8 | 18 | `review`, `custom.challenges` | `v7→v8` |
| 9 | 20 | `analysis.history` | `v8→v9` |

Rules: append-only, pure, fixture-tested; migration index 0 (`progress`→`topics`) is never edited; a newer-than-known version is refused with the backup preserved. If a stage needs no persisted change it adds no version.

## 4. Existing features and files that must survive every stage

The Learning Orbit's **behaviour** (one shared selection, declared-prerequisite-only connections, keyboard model) — carried by the legacy arc code (`src/lib/orbitGeometry.ts`, `src/components/orbit/*`) until the constellation prototype is accepted (O-15), then by the constellation; deterministic validators; sandboxed preview (`SandboxedPreview.tsx`, `lib/preview.ts`); storage recovery and backup; progress/mastery semantics (`lib/progress.ts`, `lib/quiz.ts`); Error Notebook; focus management and skip link; the design tokens' default look; the original 176 tests (never weakened).

## 5. New architectural components introduced (and where)

| Component | Stage |
|---|---|
| `TrackRegistry`, `TrackModule`, `ChallengeV2` adapter | 01 |
| Appearance/theme engine, `core/ui` components (incl. `StatusChip`, `ProgressRing`), orbit tokens, icon registry, contrast utility | 02 |
| Schema v2+, `Clock`, quota guard, export/import, streak/activity | 03 |
| Atmosphere layers, `Starfield`, motion hook, route transitions | 04 |
| `EditorAdapter` (CodeMirror + plain), `Splitter` | 05 |
| `CodeRunner` (iframe preview), diff, a11y linter, snippets | 06 |
| Source positions, feedback panel | 07 |
| Lesson components (TOC, terms, demos, focus) | 08 |
| Typed question engine | 09 |
| Constellation map (layout, states, panels, pan/zoom, list view, stepper), then pulse/trail/zones/magnify/you-are-here/mini constellation | 10 (10a, 10b) |
| Daily, achievements, XP, milestones, personal bests | 11 |
| Dashboard modules | 12 |
| Search index, fuzzy matcher, command registry, shortcuts registry | 13 |
| Markdown renderer, notes/bookmarks/flashcards | 14 |
| Mastery layouts (layered/force), active time, charts, share card | 15 |
| Announcer, reminders, font scaling | 16 |
| Tour, service worker, manifest, code splitting, recovery UI | 17 |
| Spaced repetition, creator, snapshots, speech, portfolio | 18 |
| Concept registry + Atlas + honesty tests | 19 |
| Worker runner host, analysis framework + UI | 20 |
| Playbook, generator, HTML module expansion | 21 |
| CSS parser + style probe | 22 |
| Script preview + JS Worker engine + JS analysis provider | 23 |
| Vendored Bootstrap preview CSS | 24 |
| Pyodide engine + Python provider | 25 |
| Static estimators (Java/C++) | 26 |
| Angular decision memo/content | 27 |
| External services registry | 28 |

## 6. Risks (ordered by impact) and mitigations

| # | Risk | Mitigation |
|---|---|---|
| 1 | Large reducer/state growth and a single localStorage blob | Debounced writes, caps, quota guard, schema chain with fixtures (03) |
| 2 | Executing learner code (JS/Python) | Worker/opaque-origin iframe, limits, security tests, no `allow-same-origin` (20, 23, 25) |
| 3 | Misleading complexity claims | Truthfulness contract, validator, confidence/limitations, fixtures with measured precision (20, 23, 25, 26) |
| 4 | Accessibility regressions from rich visuals | Axe + manual keyboard checks every UI stage; reduced-motion/high-contrast gates (02, 04, 16) |
| 5 | Bundle growth (editor, Pyodide, Bootstrap) | Lazy chunks, budgets in `07` §3, recorded sizes (05, 17, 24, 25) |
| 6 | Content volume (many tracks) | Playbook + generator; tracks `available` only when truthful (21+) |
| 7 | Decision-gated items stalling work | Soft gates use defaults; hard gates (O-03, O-04, O-05, O-06, O-07, O-14, O-15) never block the ungated parts (25a, 26, 27, 28 ungated parts, 10a) |
| 11 | Constellation looks wrong or fails to scale | Prototype-first (10a) with real-data tests, mandatory screenshots looked at, owner approval before roll-out; SVG+DOM keeps it simple |
| 12 | Visual claims without evidence | Mandatory visual QA gate (`09`, `08` G3/G11); missing evidence ⇒ NOT VERIFIED and the gate stays closed |
| 8 | Course requirements unverified | Concept registry marks `pending-review`; never blocks (06, 19) |
| 9 | Reference-code coupling to HTML | Injection and track-scoped definitions (11, 15) |
| 10 | Over-long stage prompts | One stage file per stage; stages sized for one working session each |

## 7. Parallelism and checkpoints

No parallel stages. Commit at every stage boundary; the owner may tag checkpoints. If another stage proves too large, split it into lettered sub-stages **inside its stage file** (§7a) rather than skipping content, and add the sub-stage to §8.


## 8. Sub-stages (documented splits; no feature is dropped)

Sub-stages keep each working session reviewable. Each has its own branch `stage-NN<letter>-<slug>`, status report `STAGE_NN<letter>_STATUS.md` and exit gate; the parent stage is complete only when all sub-stages and the stage-level acceptance boxes are green. Stage 10 and Stage 25 are **required** splits (owner checkpoints); the others are recommended splits for the largest stages (from the metrics: steps, new files and items per stage).

| Stage | Sub-stage | Title | Scope | Sub-stage exit gate |
|---|---|---|---|---|
| 03 | 03a | Schema v2, clock, activity foundation | Types, `v1→v2` migration with fixtures, sanitisers, `Clock`, streak/activity logic (REF-02/03), reducer actions | Migration + ported streak/activity tests green; no UI |
| 03 | 03b | Persistence hardening, export/import, Settings page | Debounced saves, quota guard, `storage` event, export/import/reset, Settings page and controls | All §13 boxes green |
| 10 | 10a | Constellation prototype (real architecture, representative HTML topics) | Pure core, map, states, panels, stepper, list, pan/zoom, responsive, tests, visual QA evidence; legacy arc remains default; flag `?orbit=constellation` | All 10a acceptance boxes green with evidence; screenshots at 5 viewports looked at and compared; **STOP — owner records O-15** |
| 10 | 10b | Roll-out, catalog layers 2.1–2.7, legacy retirement | Default for all tracks; pulse, trail, zones, magnify, you-are-here, mini constellation; legacy arc removed; surviving tests ported; perf + final visual QA | All §13 boxes green; G11 satisfied; Stage 11 may start |
| 11 | 11a | XP, levels, achievements, personal bests (schema v5) | Pure derivations, `badges`/`personalBests`, migration `v4→v5`, rule tests | Derivation + migration tests green |
| 11 | 11b | Streak surfaces, daily challenge, milestones, toasts | Frozen daily assignment, completion, milestone events, rank toasts, Settings switch (P-04) | All §13 boxes green |
| 15 | 15a | Layered map, list fallback, heatmap | REF-01/06 port, Mastery page, keyboard model, heatmap, list <720 px | Layout/page tests + visual QA green |
| 15 | 15b | Force view (opt-in) | Deterministic seeded force layout, pinning, reduced-motion static | Determinism + edge-truth tests green |
| 15 | 15c | Analytics and time tracking (schema v7) | `timeSpent` migration `v6→v7`, active-time tracker, charts, estimates, recommendations, share card | Migration + chart tests green |
| 17 | 17a | Code splitting, error boundary, empty states, optimistic UI | 16.1, 16.2, 16.5, 15.2 | Bundle budget recorded; error/empty-state tests green |
| 17 | 17b | Onboarding tour | 15.1 tour, replay, `settings.onboarding` | Tour tests + a11y green |
| 17 | 17c | PWA and offline | 16.3 service worker, manifest, update flow, offline test | Offline test (browser) green or NOT VERIFIED with reason |
| 18 | 18a | Schema v8, spaced repetition and voice read | One migration `v7→v8` adding both `review` and `custom.challenges` (fixtures), `review` state, queue, speech synthesis with honest limits | Migration + review/SM tests green |
| 18 | 18b | Creator, snapshots, portfolio | Uses the `custom.challenges` field from v8 (no new schema version); creator UI, peer snapshot encode/decode, portfolio export | XSS/size-cap tests green |
| 20 | 20a | Runner host (Worker) | `CodeRunner` Worker host, limits, abort, schema validation, fake engine tests | Isolation/timeout tests green |
| 20 | 20b | Analysis contracts, validation, registry and UI | `AnalysisProvider`, `validateEstimate`, honest unavailable panel, optimisation/comparison UI, schema v9 | No-provider and truthfulness tests green |
| 21 | 21a | Playbook, generator, availability states | `TRACK_PLAYBOOK.md`, `npm run new-track`, truthful availability chips, Atlas back-fill | Generator + capability-honesty tests green |
| 21 | 21b | HTML gap content | FC-02/03/06/07/08 content, rule kinds, new `media-elements` topic, media CSP exception | Rule + track-structure tests green |
| 23 | 23a | Script preview, Worker engine and JavaScript content | C-05 script preview with security tests, Worker engine, curriculum/challenges/DOM-event tests | Security + engine tests green |
| 23 | 23b | JavaScript analysis provider, suggestions, equivalence | AST provider with ≥ 30 fixtures, verified suggestions, Analyse drawer wiring, measurement chart | Fixture precision recorded; truthfulness tests green |
| 25 | 25a | Python content and structure-check practice (ungated) | Curriculum, lessons, quizzes, structure-rule challenges, Python editor language, `preview` availability, no Run, no analysis numbers | 25a acceptance boxes green; Stage 26 may start even if 25b waits |
| 25 | 25b | Pyodide execution, analysis provider, offline cache (HARD gate O-03) | Self-hosted Pyodide, Worker engine, execution tests, `ast` provider + suggestions, offline caching, `available` upgrade | Only after O-03 = yes: 25b acceptance boxes green |

## 9. Dependency map

"Depends on" means the listed stages' exit gates (and, for lettered stages, the stated sub-stage) must be green. Every dependency points to an earlier stage; the verification script checks that, and that each stage file's §2 prerequisites name the same stages.

| Stage | Depends on | Unblocks |
|---|---|---|
| 01 | — (first stage) | 02 |
| 02 | 01 | 03, 10, 13 |
| 03 | 02 | 04, 05, 08, 10, 11, 15 |
| 04 | 03 | 10 |
| 05 | 03 | 06, 08 |
| 06 | 05 | 07, 09, 18, 20 |
| 07 | 06 | 20 |
| 08 | 05, 03 | 13, 14 |
| 09 | 06 | 11, 18 |
| 10 | 04, 02, 03 | 11, 13 |
| 11 | 03, 09, 10 | 12, 15 |
| 12 | 11 | 15, 16 |
| 13 | 08, 10, 02 | 14 |
| 14 | 13, 08 | 18 |
| 15 | 12, 11, 03 | 20 |
| 16 | 12 | 17 |
| 17 | 16 | 29 |
| 18 | 14, 06, 09 | 19 |
| 19 | 18 | 21 |
| 20 | 07, 06, 15 | 21, 23 |
| 21 | 20, 19 | 22 |
| 22 | 21 | 23 |
| 23 | 22, 20 | 24 |
| 24 | 23 | 25 |
| 25 | 24 | 26 |
| 26 | 25 | 27 |
| 27 | 26 | 28 |
| 28 | 27 | 29 |
| 29 | all (01–28) | — (release) |

Special dependencies: Stage 11 needs **10b** (pulse hook); Stage 13 needs **10b** (orbit highlight on the constellation); Stage 26 needs **25a only**; Stage 29 needs every stage's ungated parts plus recorded decisions for every hard gate.

## 10. Decision gate table

Policy (`07` §4a): **soft** = a default exists, proceed and record; **hard** = the gated capability is not built until the owner records a yes; later stages may start once the ungated parts are green.

| Stage | Gate type | Decision(s) | What proceeds / what waits | If the owner declines |
|---|---|---|---|---|
| 05 | soft | O-01 | CodeMirror 6 is the default; proceed and record it | Default stays in force |
| 10 | hard | O-15 (O-16 soft) | 10a prototype proceeds; **10b waits for the owner to record O-15 = approved**; locked topics advisory by default (O-16) | Prototype is revised (10a repeats) until approved; 10b never starts without approval |
| 11 | soft | O-09, O-10 | XP table and daily scope defaults; proceed and record | Default stays in force |
| 17 | soft | O-08 | any static HTTPS host; proceed and record | Default stays in force |
| 20 | soft | O-13 | "Analyse and improve" name; proceed and record | Default stays in force |
| 23 | soft | O-02, O-12 | script preview as specified; `acorn` parser; proceed and record | Default stays in force |
| 25 | hard | O-03 | **25a (Python content, structure-check practice, `preview`) proceeds; 25b (Pyodide execution, `ast` provider, offline cache) waits for a recorded yes** | Python stays `preview` with structure-check practice, no Run, no analysis |
| 26 | hard | O-04 | content, structure checks, static estimators, `preview` proceed; **execution (Run) waits** | Java/C++ stay `preview` (editor + static analysis only) |
| 27 | hard | O-05 | lessons, quizzes, decision memo, `decision-gated` state proceed; **Angular practice waits** | Angular stays `decision-gated` with lessons only |
| 28 | hard | O-06, O-07, O-14 | memo, services registry, Settings section proceed; **AI hints, multiplayer and W3C validator each wait for their own yes** | The feature is absent (no control, no route) |
