# 02 — Enhancement Traceability Matrix

Every item from `ENHANCEMENTS.md` (all 17 sections including Future/Phase 2) plus every platform requirement, reference-ZIP-derived requirement and frontend-concept row is listed here with its identifier, baseline status, stage and objective acceptance criterion. **Nothing is omitted, downgraded or silently deferred.**

- **Catalog items:** 110 (sections 1–16 = 100 items; section 17 = 10 items, numbered `17.1`–`17.10` in table order).
- **Platform requirements** (`PLT-xx`): 18 · **Reference-ZIP-derived** (`REF-xx`): 8 · **Frontend concepts** (`FC-xx`): 32.
- **Total tracked items: 168.**

## Legend

| Baseline status | Meaning | Count |
|---|---|---|
| Implemented | Implemented in original (verify/extend) | 6 |
| Partial | Partially implemented in original | 21 |
| Reference-partial | Partly present in reference ZIP only | 14 |
| New | New | 122 |
| Gated | Decision/infrastructure-gated | 5 |

*Implemented/Partial* are judged against the **original** project (the baseline). *Reference-partial* means the reference ZIP contains a useful implementation or logic (decision recorded in `05_REFERENCE_ZIP_COMPARISON.md`). *Gated* items are retained and scheduled, but part or all of them waits for an owner decision recorded in `07_CONFLICTS_AND_DECISIONS.md`. Stage numbers refer to `03_STAGE_PLAN.md`; **the stage file is the authoritative implementation instruction**. Marking an item `Done` is evidenced in the stage status report, not by editing this table.

Acceptance criteria below are the item-level definition of done; each stage file adds stage-level criteria.


## 1. Visual Identity & Atmosphere

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `1.1` | Dynamic Nebula Background | Catalog | New | Not present in original or reference | 04 | Nebula renders behind Home/Track only, tinted per track, frozen under reduced motion; contrast over nebula meets AA (test). |  |
| `1.2` | Constellation Grid Overlay | Catalog | New | Not present in original or reference | 04 | Grid overlay at 4–6% opacity; cursor brightening only with fine pointer and allowed motion; `pointer-events:none` (test). |  |
| `1.3` | Cursor Glow / Parallax Aura | Catalog | New | Not present in original or reference | 04 | Cursor glow is off by default, absent on touch/reduced motion, and never intercepts input. |  |
| `1.4` | Glassmorphism Panel System | Catalog | New | Not present in original or reference | 02 | Glass panels have an opaque fallback under `@supports not` and high contrast; text contrast unchanged (contrast test). |  |
| `1.5` | Custom CSS Scroll Bar | Catalog | New | Not present in original or reference | 02 | Thin themed scrollbars on all overflow containers in Chromium/Firefox/WebKit (browser check). |  |
| `1.6` | Ambient Particle Field (optional, heavy-opt-in) | Catalog | New | Not present in original or reference | 04 | Particles default off, ≤ 30 dots, hero only, paused when hidden; none under reduced motion (test). |  |
| `1.7` | Cinematic Page Transitions | Catalog | New | Not present in original or reference | 04 | Route change uses a ≤ 300 ms transition, skipped on first load/reduced motion; focus still moves to `<main>`. |  |
| `1.8` | Light/Dark/Cosmic Themes | Catalog | New | Not present in original or reference | 02 | Three themes selectable; each passes the full contrast matrix; persisted and applied before first paint. |  |
| `1.9` | Customisable Accent Colour | Catalog | New | Not present in original or reference | 02 | Five accents selectable; every accent × theme passes contrast; persisted. |  |

## 2. Learning Orbit — Extended Visual & Interaction

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `2.1` | Star Pulse on Progress Save | Catalog | New | Not present in original or reference | 10 | A star emits one ring pulse only when its topic really moves in-progress → completed (or parts increase) through a persisted action; never on load/navigation; absent under reduced motion (test). | Delivered in sub-stage 10b (after owner approval O-15). |
| `2.2` | Orbital Trail on Navigation | Catalog | New | Not present in original or reference | 10 | Selecting a non-adjacent topic draws a curved trail between the previous and new star in ≤ 400 ms, once; none without a previous selection or under reduced motion (test). | Sub-stage 10b. |
| `2.3` | Prerequisite Constellation Lines | Catalog | Partial | Baseline arc orbit already draws declared prerequisite edges with selected-topic emphasis (legacy, superseded geometry); hover/focus relations text and the constellation rendering are New | 10 | Hover/focus brightens only the star's declared prerequisite/dependent connections (dashed, aria-hidden) and announces Requires/Unlocks text; the panel lists them as text (test against real HTML data). | Connections in 10a; hover/focus emphasis and Requires/Unlocks text in 10b. |
| `2.4` | Topic Group Zones | Catalog | New | Not present in original or reference | 10 | Group halos tint each `TopicGroup` region without changing star positions (equality test); clicking a zone label selects the group's first topic and pans to it. | Sub-stage 10b. |
| `2.5` | Zoom/Magnify on Hover (Arc nodes) | Catalog | New | Not present in original or reference | 10 | Hover/focus scales a star ≤ 1.08× (transform only, no layout shift) and shows a compact tooltip (title, status, estimate); touch uses tap-select. | Sub-stage 10b. |
| `2.6` | "You Are Here" Indicator | Catalog | New | Not present in original or reference | 10 | Marker sits on the `lastVisited` star with a visible ring and the text equivalent "Last visited"; absent when there is no `lastVisited`. | Sub-stage 10b. |
| `2.7` | Mini Orbit Preview in Header | Catalog | New | Not present in original or reference | 10 | 48×48 px mini constellation in the breadcrumb bar of lesson/practice views ≥ 768 px, highlights the current topic, links to the Track page and has the text alternative "Topic n of N". | Sub-stage 10b. |
| `2.8` | Orbit Search Highlight | Catalog | New | Not present in original or reference | 13 | Matching nodes ring, others dim to 45%, result count announced; positions unchanged. |  |

## 3. Dashboard

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `3.1` | Hero Progress Ring | Catalog | Partial | Home has a small `ProgressRing` (`ProgressRing.tsx`); no hero ring | 12 | Hero ring shows completed topics/steps from real state; zero state shows 0 without fabrication. |  |
| `3.2` | Streak Calendar | Catalog | Reference-partial | Reference has `streakInfo` + text card; no calendar | 12 | Calendar active cells equal `activityDays` exactly; semantic table; hidden numbers before first activity. | Adapt `reference/streak.ts` data (`activityDays`); calendar UI is new. |
| `3.3` | Topic Group Completion Cards | Catalog | New | Not present in original or reference | 12 | One card per `TopicGroup` with correct completed/total and link (test). |  |
| `3.4` | Daily Challenge Feature Card | Catalog | Reference-partial | Reference `DailyChallengeCard.tsx` | 12 | Card appears once; assignment frozen for the day; "Passed today" only after a real full pass. | Adapt `reference/daily.ts` + `DailyChallengeCard.tsx` with frozen assignment (D4, D5). |
| `3.5` | Recent Activity Feed | Catalog | New | Not present in original or reference | 12 | Feed lists only recorded events with real timestamps; hidden when empty. |  |
| `3.6` | Quick Actions Toolbar | Catalog | New | Not present in original or reference | 12 | Toolbar contains only working destinations; each is keyboard reachable. |  |

## 4. Lesson Studio — Visual & UX

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `4.1` | Reading Progress Bar | Catalog | New | Not present in original or reference | 08 | Reading bar reflects scroll position, `role=progressbar`, hidden for short lessons. |  |
| `4.2` | Section-Level Bookmark | Catalog | Partial | Topic-level bookmarks exist (`TOGGLE_BOOKMARK`); section level is New | 08 | Section bookmarks toggle with `aria-pressed`, persist across reload (schema v4). |  |
| `4.3` | Inline Code Highlighting | Catalog | New | Not present in original or reference | 08 | Inline and block code are highlighted with ≥ 4.5:1 token contrast in all themes. |  |
| `4.4` | Live Interactive Demos | Catalog | New | Not present in original or reference | 08 | Demos run only in the sandboxed preview and can be reset; no scripts execute (test). |  |
| `4.5` | Definition Tooltips | Catalog | New | Not present in original or reference | 08 | Terms open by keyboard, dismiss with Esc, expose `aria-describedby`. |  |
| `4.6` | Lesson Estimated Time Display | Catalog | New | Not present in original or reference | 08 | Time shown as "about N min (estimate)" for every lesson. |  |
| `4.7` | Table of Contents Sidebar | Catalog | New | Not present in original or reference | 08 | TOC links move focus to the section heading and track the active section. |  |
| `4.8` | Key Takeaways Summary Box | Catalog | New | Not present in original or reference | 08 | Takeaways exist for all lessons of every available track; component absent when no data. |  |
| `4.9` | Accessibility Check Sidebox | Catalog | New | Not present in original or reference | 08 | Accessibility box appears where authored and contains only authored guidance. |  |
| `4.10` | Dark-Room / Focus Mode for Reading | Catalog | New | Not present in original or reference | 08 | Focus mode hides chrome, exits with Esc/button, preserves scroll and drafts. |  |

## 5. Quiz — Extended Types & UX

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `5.1` | Visual Output Predictor Quiz | Catalog | New | Not present in original or reference | 09 | Output-predictor question renders authored static options and scores correctly. |  |
| `5.2` | Drag-and-Drop Code Sorter | Catalog | New | Not present in original or reference | 09 | Sorter works with keyboard alone and announces positions; scoring tested. |  |
| `5.3` | Spot-the-Bug Quiz | Catalog | New | Not present in original or reference | 09 | Spot-the-bug selects a line by keyboard and scores correctly. |  |
| `5.4` | Fill-in-the-Blank | Catalog | New | Not present in original or reference | 09 | Blank answers scored with documented trim/case rules (tests). |  |
| `5.5` | Timed Challenge Mode (opt-in) | Catalog | New | Not present in original or reference | 09 | Timed mode is opt-in, states its rules up-front, pausable, never penalises beyond the stated rule. |  |
| `5.6` | Quiz Result Breakdown | Catalog | New | Not present in original or reference | 09 | Breakdown lists every question with kind, answers and explanation (✓/✗ + text). |  |
| `5.7` | XP Awarded Animation | Catalog | New | Not present in original or reference | 11 | XP animation ≤ 600 ms, once per award, text-only under reduced motion; hidden when gamification is off. |  |

## 6. Practice Workspace — Editor & Preview

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `6.1` | Monaco / CodeMirror Editor | Catalog | Partial | Textarea editor with gutter (`CodeEditor.tsx`) to be upgraded | 05 | CodeMirror lazy chunk; drafts persist; Tab leaves editor by default; plain adapter fallback works. |  |
| `6.2` | Split-View Resizer | Catalog | New | Not present in original or reference | 05 | Splitter operable by pointer and keyboard; position persists; reset restores 50/50. |  |
| `6.3` | Auto-Save Indicator | Catalog | Partial | Drafts save on change; no indicator or debounce | 05 | Indicator shows saved/failed states from real save status (fake-clock tests). |  |
| `6.4` | Diff Viewer (My Code vs Reference) | Catalog | New | Not present in original or reference | 06 | Diff available only after solution reveal; add/remove marked by symbol and colour. |  |
| `6.5` | Multiple File Tabs (Phase 2 extension) | Catalog | New | Not present in original or reference | 06 | Multi-file challenge stitches HTML+CSS(+JS where allowed); `</style>` injection cannot escape (test). |  |
| `6.6` | Preview Device Frames | Catalog | New | Not present in original or reference | 06 | Frames switch preview width (375/768/desktop) without losing drafts. |  |
| `6.7` | Accessibility Linter in Preview | Catalog | New | Not present in original or reference | 06 | Linter reports missing alt, unlabelled controls, empty headings, heading order; never claims conformance. |  |
| `6.8` | Fullscreen Editor Mode | Catalog | New | Not present in original or reference | 05 | Fullscreen editor with preview drawer; Esc exits and restores focus (390 px check). |  |
| `6.9` | Code Snippet Library | Catalog | New | Not present in original or reference | 06 | Snippets insert at cursor and are undoable. |  |
| `6.10` | Challenge Difficulty Progression | Catalog | Partial | Challenges carry `difficulty` (all `beginner`); no progression | 06 | Challenges ordered by difficulty; soft gate is a tooltip, never disabled. |  |

## 7. Feedback & Code Coach

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `7.1` | Inline Line-Level Feedback | Catalog | New | Not present in original or reference | 07 | Gutter markers/underlines with `aria-label` for at least doctype/selector/attribute rules. |  |
| `7.2` | Requirement Progress Bar | Catalog | Partial | Practice shows requirement results; verify bar at Stage 07 | 07 | Bar value equals met/total after every check. |  |
| `7.3` | Animated Requirement Rows | Catalog | New | Not present in original or reference | 07 | Row state change animates ≤ 160 ms; none under reduced motion. |  |
| `7.4` | Feedback History (per Challenge) | Catalog | Partial | `ChallengeRecord.lastCheck` only (no history) | 07 | Last 20 checks stored and shown; persists across reload (schema v3). |  |
| `7.5` | "Explain This Requirement" Expandable | Catalog | New | Not present in original or reference | 07 | Failed rows expand an authored explanation by keyboard. |  |
| `7.6` | Code Coach Persona | Catalog | New | Not present in original or reference | 07 | Coach copy passes the L-05 test (no "AI", no "reviewed your code"). |  |

## 8. Gamification & Motivation

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `8.1` | XP & Level System | Catalog | New | Reference deliberately omitted points; adapted as derived XP | 11 | XP is a pure function of saved state; replays/hints/revisits add nothing (tests); level curve monotonic. | Derived from saved state only (D7, L-20). |
| `8.2` | Achievement Badge Gallery | Catalog | Reference-partial | Reference achievements grid (10 derived badges, rules shown) | 11 | Gallery shows rule, progress, Earned/Not yet text; dates only when observed, else "date not recorded". | Adapt `reference/achievements.ts` (D6); add first-seen dates. |
| `8.3` | Challenge Completion Streak | Catalog | Reference-partial | Reference meaningful-activity streak logic | 11 | Streak counts only meaningful actions on local days; yesterday keeps it alive; `streakBest` survives cap. | Reuse reference streak and meaningful-activity rule (D1, D2). |
| `8.4` | "First Blood" & Milestone Events | Catalog | New | Not present in original or reference | 11 | Milestone toasts fire once per newly observed transition; silent for backfilled items. |  |
| `8.5` | Leaderboard (Local) | Catalog | New | Not present in original or reference | 11 | Personal bests list the learner's own records on this device; no peer rows. |  |
| `8.6` | Daily Challenge Completion Stamp | Catalog | Reference-partial | Reference shows "Passed today" state | 11 | Stamp appears only when `dailyDone` contains today. | Completion decided against the frozen daily assignment (D4). |
| `8.7` | Rank Progression Toast | Catalog | New | Not present in original or reference | 11 | Level-up toast fires once per level, polite live region, hidden when gamification is off. |  |

## 9. Search & Discovery

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `9.1` | Command Palette | Catalog | New | Not present in original or reference | 13 | `Ctrl/⌘+K` opens palette on every route, never while typing; full keyboard operation; focus returns. |  |
| `9.2` | Fuzzy Search with Highlighted Matches | Catalog | New | Not present in original or reference | 13 | Fuzzy results highlight matches with `<mark>`; matcher unit tests. |  |
| `9.3` | Filter & Tag System | Catalog | New | Not present in original or reference | 13 | Filters/tags restore from the URL query and combine correctly. |  |
| `9.4` | "Related Topics" Panel | Catalog | New | Not present in original or reference | 13 | Related topics derive from real prerequisites/dependents/group/tags (pure function tests). |  |

## 10. Notebook, Bookmarks & Error Review

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `10.1` | Rich Text Notes (Markdown Subset) | Catalog | Partial | Plain-text note per topic exists (`SET_NOTE`) | 14 | Notes render Markdown subset with zero raw HTML reaching the DOM (XSS corpus). |  |
| `10.2` | Note Tagging & Search | Catalog | New | Not present in original or reference | 14 | Tags validated; search finds note text; filter by tag works. |  |
| `10.3` | Error Notebook Flashcards | Catalog | Partial | Review page lists entries; no flashcard mode | 14 | Flashcards fully keyboard-operable; statuses and nav badge update. |  |
| `10.4` | Bookmark Folders | Catalog | Partial | Flat bookmark list exists; folders are New | 14 | Folders create/rename/delete/move; topic and section bookmarks supported. |  |
| `10.5` | "Mark as Understood" Flow | Catalog | Implemented | `SET_ERROR_STATUS` open/understood exists in Review | 14 | Mark understood/reopen flow updates status, badge and review count. |  |
| `10.6` | Export Notes / Bookmarks | Catalog | New | Not present in original or reference | 14 | Export downloads Markdown/JSON containing exactly the learner's notes/bookmarks. |  |

## 11. Mastery Map

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `11.1` | Force-Directed Skill Graph | Catalog | Reference-partial | Reference layered mastery map (different technique); force view is New | 15 | Layered view default; force view deterministic; only declared edges drawn; uniform node size. | Layered view = reference `masteryLayout.ts` (D8–D10); force view opt-in. |
| `11.2` | Mastery Heatmap View | Catalog | New | Not present in original or reference | 15 | Heatmap shows status by colour+icon+text with legend. |  |
| `11.3` | Time-to-Completion Estimate | Catalog | New | Not present in original or reference | 15 | Remaining-time shown as an estimate; "actual" only after ≥ 3 measured sessions. |  |
| `11.4` | Knowledge Gap Recommendations | Catalog | New | Not present in original or reference | 15 | Each recommendation explains why from prerequisites/quiz results (pure function tests). |  |

## 12. Progress & Analytics

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `12.1` | Learning Velocity Chart | Catalog | New | Not present in original or reference | 15 | Velocity chart derives from real events; text-table alternative provided. |  |
| `12.2` | Topic Time Estimates vs Actual | Catalog | New | Not present in original or reference | 15 | Estimate vs actual labels honest; absent without measurements. |  |
| `12.3` | Quiz Performance Breakdown | Catalog | New | Not present in original or reference | 15 | Quiz breakdown derives from stored best/attempts only. |  |
| `12.4` | Challenge Attempt Heat Table | Catalog | New | Not present in original or reference | 15 | Attempt heat table is a semantic table with ✓/✗ text. |  |
| `12.5` | Progress Sharing Card | Catalog | New | Not present in original or reference | 15 | Share card contains only visible real values; downloads locally. |  |

## 13. Accessibility & Inclusivity

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `13.1` | Font Size Scaler | Catalog | New | Not present in original or reference | 16 | Five font scales; no clipping at 150% and 320 px width (browser check). |  |
| `13.2` | Dyslexia-Friendly Font Toggle | Catalog | New | Not present in original or reference | 16 | Atkinson Hyperlegible toggle swaps UI font only (code stays mono), loaded only when enabled. |  |
| `13.3` | High-Contrast Mode | Catalog | New | Not present in original or reference | 16 | High-contrast removes glass/glow, text ≥ 12:1, borders ≥ 4.5:1 (contrast test). |  |
| `13.4` | Screen-Reader Progress Announcements | Catalog | Partial | `role=status` regions exist locally; no unified announcer | 16 | Progress events announced once via the announcer (live-region update count test). |  |
| `13.5` | Keyboard Shortcut Reference Modal | Catalog | New | Not present in original or reference | 13 | Modal lists exactly the registered shortcuts; `?` opens it. |  |

## 14. Settings & Personalisation

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `14.1` | Learner Profile Card | Catalog | New | Not present in original or reference | 03 | Profile name/goal validated, stored locally, editable, resettable. |  |
| `14.2` | Preferred Learning Pace | Catalog | New | Not present in original or reference | 03 | Pace setting changes the daily target text/reminder copy and persists. |  |
| `14.3` | Notification / Reminder System (Local) | Catalog | New | Not present in original or reference | 16 | Reminders show in-app when due; Notification only with permission while app is alive; copy states limits. |  |
| `14.4` | Data Management Panel | Catalog | New | Not present in original or reference | 03 | Export/import round-trips; invalid imports change nothing; reset needs typed confirmation; usage meter shown. |  |
| `14.5` | Editor Preferences | Catalog | New | Not present in original or reference | 05 | Editor preferences apply live and persist; plain-editor option works. |  |

## 15. Onboarding & Empty States

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `15.1` | First-Run Onboarding Tour | Catalog | New | Not present in original or reference | 17 | Tour runs once, skippable, replayable, focus-managed; missing targets skipped. |  |
| `15.2` | Animated Empty States | Catalog | Partial | `EmptyState.tsx` exists; no illustration variants | 17 | Empty states exist for notes, bookmarks, review, activity, tracks; animation off under reduced motion. |  |
| `15.3` | "What to do next" Smart Card | Catalog | Partial | `nextAction()` + "Recommended next" card exist on Home | 12 | Smart card explains why the next step is suggested (derived from prerequisites). |  |

## 16. Performance & Reliability

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `16.1` | Route-Level Code Splitting | Catalog | New | Not present in original or reference | 17 | Each non-home route is a separate chunk; deep links work; Suspense skeletons shown. |  |
| `16.2` | Optimistic UI Updates | Catalog | New | Not present in original or reference | 17 | State updates are immediate; destructive deletes offer undo; rollback on persistence failure tested. |  |
| `16.3` | Offline-First Behaviour | Catalog | New | Not present in original or reference | 17 | After one online visit the app loads offline with existing data (browser check). |  |
| `16.4` | localStorage Quota Guard | Catalog | New | Not present in original or reference | 03 | Soft budget 4 MiB with warning at 80%; failed writes surface a banner and export option. |  |
| `16.5` | Error Boundary with Recovery UI | Catalog | Partial | `ErrorBoundary.tsx` exists; no recovery UI | 17 | A thrown render error shows recovery UI (reload, copy diagnostics, export data). |  |

## 17. Future / Phase 2 Explorations

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `17.1` | Multi-track curriculum | Catalog | Partial | Registry-less; `Technology.status` planned entries exist | 21 | Explore/Track/Practice/Mastery driven by registry for any registered track; availability chips truthful. |  |
| `17.2` | AI-powered hint expansion | Catalog | Gated | Needs backend + key management (O-06) | 28 | Absent until O-06 decided; if built: opt-in, labelled, no client keys, counts as hint usage. |  |
| `17.3` | Peer challenge sharing | Catalog | New | Not present in original or reference | 18 | Snapshot links round-trip (≤ 8 KB), validated, read-only, never auto-run. |  |
| `17.4` | Spaced repetition review | Catalog | New | Not present in original or reference | 18 | Scheduler follows documented intervals; review answers count as meaningful activity. |  |
| `17.5` | Live HTML validator | Catalog | Gated | Needs network disclosure approval | 28 | Absent until approved; if built: sends only on button press after disclosure, handles offline/errors. |  |
| `17.6` | Mobile app (PWA installable) | Catalog | New | Not present in original or reference | 17 | Manifest + service worker pass installability; update flow requires user confirmation. |  |
| `17.7` | Custom challenge creator | Catalog | New | Not present in original or reference | 18 | Created challenges are checkable via the track rule palette and persist; invalid ones cannot be saved. |  |
| `17.8` | Multiplayer challenge race | Catalog | Gated | Needs transport decision (O-07) | 28 | Absent until O-07 decided; no fabricated opponents. |  |
| `17.9` | Portfolio export | Catalog | New | Not present in original or reference | 18 | Portfolio export contains only the learner's own completed work, fully escaped. |  |
| `17.10` | Voice-read lesson text | Catalog | New | Not present in original or reference | 18 | Speech controls feature-detected with play/pause/stop/speed; hidden with explanation when unsupported. |  |

## P. Platform requirements (new)

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `PLT-01` | Language-neutral TrackRegistry / TrackModule | Platform | New | — | 01 | Lint rule forbids `'html'` literals in pages/components/core; registry tests; empty-registry states. |  |
| `PLT-02` | Concept registry skeleton | Platform | New | — | 01 | Types and empty registry compile; Atlas stage fills it. |  |
| `PLT-03` | Injectable clock | Platform | New | — | 03 | Tests inject a clock; absent `now` records nothing. |  |
| `PLT-04` | Regression smoke, axe and browser smoke tooling | Platform | New | — | 01 | Smoke tests and `npm run test:e2e` exist and pass (or NOT VERIFIED reason recorded). |  |
| `PLT-05` | Worker runner host | Platform | New | — | 20 | Timeout kill, cap, abort, schema and isolation tests; main thread stays responsive. |  |
| `PLT-06` | Complexity-analysis contracts, registry and validation | Platform | New | — | 20 | Invalid/assumption-free estimates rejected; no provider ⇒ no numbers. |  |
| `PLT-07` | Analysis and optimisation UI | Platform | New | — | 20 | UI shows method, confidence, assumptions, limitations, disclaimer; suggestions never overwrite drafts. |  |
| `PLT-08` | JavaScript analysis provider | Platform | New | — | 23 | Fixture precision recorded; unsupported ⇒ low confidence + limitations; verified-only labelling. |  |
| `PLT-09` | Python analysis provider | Platform | Gated | — | 25 | As PLT-08 for Python (sub-stage 25b); HARD gate O-03. |  |
| `PLT-10` | Java/C++ static estimators | Platform | New | — | 26 | No Run control; confidence ≤ medium; limitations listed. Ungated; only execution (not an item here) waits for O-04. |  |
| `PLT-11` | Script-enabled preview mode | Platform | New | — | 23 | `allow-scripts` only, never with `allow-same-origin`; forged messages ignored; timeout replaces iframe. |  |
| `PLT-12` | Track integration playbook and generator | Platform | New | — | 21 | `npm run new-track` scaffolds a valid failing-until-filled track; playbook references real paths. |  |
| `PLT-13` | Truthful availability states | Platform | Partial | — | 21 | Explore shows chips; no dead routes; capability honesty tests. |  |
| `PLT-14` | Schema versioning chain v2→v9 | Platform | New | — | 03 | Each bump has fixture-based migration tests; migration 0 untouched. |  |
| `PLT-15` | Constellation Learning Orbit map (primary) | Platform | New | — | 10 | Every node ↔ real `Topic.id`; edges == declared `prerequisiteIds` (test on real HTML data); four derived states with icon+text; selection opens the correct lesson/quiz/practice routes; layout deterministic and independent of progress/selection; layout and navigation tests in `10` §16 pass. | 10a prototype, completed in 10b |
| `PLT-16` | Orbit list view and topic stepper (synchronised navigation) | Platform | New | — | 10 | List view has every topic and action with full keyboard support; selection syncs across map, stepper, list and panel; panning never changes selection; axe zero serious/critical (test). | 10a |
| `PLT-17` | Constellation prototype gate and mandatory visual QA evidence | Platform | New | — | 10 | Screenshots at 1440/1280/820/390/320 exist, were looked at and compared with the concept reference using `10` §15.2–§15.3, or the report states VISUAL: NOT VERIFIED; O-15 recorded before 10b. | 10a (hard gate O-15) and every orbit-affecting stage |
| `PLT-18` | Constellation design-system foundations | Platform | New | — | 02 | Tokens exist for every theme/accent/contrast; contrast test covers every node-state glyph/label tuple; components pass axe/keyboard tests; `Starfield` deterministic per seed (test). | Stages 02 and 04 |

## R. Reference-ZIP-derived requirements

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `REF-01` | Layered mastery layout (reference `masteryLayout.ts`) | Reference ZIP | Reference-partial | — | 15 | Six ported layout tests pass; missing-prerequisite behaviour tested. | REUSE (D8) |
| `REF-02` | Streak logic (reference `streak.ts`) | Reference ZIP | Reference-partial | — | 03 | Nine ported streak tests pass; `streakBest` survives cap. | REUSE (D1) |
| `REF-03` | Meaningful-activity rule | Reference ZIP | Reference-partial | — | 03 | Exhaustive table test; visits/bookmarks/notes/settings never record. | REUSE rule, ADAPT points (D2) |
| `REF-04` | Daily challenge selection and completion | Reference ZIP | Reference-partial | — | 11 | Ported determinism/cycle/pre-1970 tests; frozen assignment; reducer has no content import. | ADAPT (D4) |
| `REF-05` | Derived achievements | Reference ZIP | Reference-partial | — | 11 | Ported negative/positive rule tests; track-scoped defs; no `!` assertions. | ADAPT (D6) |
| `REF-06` | Mastery page, list fallback and criteria panel | Reference ZIP | Reference-partial | — | 15 | Ported page tests; keyboard model and track-scoped route added. | ADAPT (D9) |
| `REF-07` | Engagement test suite (42 tests) | Reference ZIP | Reference-partial | — | 03 | Every assertion's intent is ported across Stages 03/11/12/15. | REUSE (D16) |
| `REF-08` | Honest wording and grid patterns for cards | Reference ZIP | Reference-partial | — | 12 | Wording present; no streak figures before real activity; no duplicate daily card. | ADAPT (D5, D12, D13) |

## C. Frontend concepts applied and taught (see 06)

| ID | Item | Source | Baseline status | Evidence in baseline/reference | Stage | Acceptance criterion (testable) | Notes |
|---|---|---|---|---|---|---|---|
| `FC-01` | Document structure and `title` | Frontend concept | Implemented | — | 21 | Atlas cites real platform use: Single-page shell: `index.html`, `<main>`, landmarks; teaching: topic `html-structure`; `ch-html-structure`; test: existing `validators.test.ts`, `curriculum.test.ts`; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-02` | Headings, paragraphs, text formatting (`mark sup sub u …`) | Frontend concept | Partial | — | 21 | Atlas cites real platform use: Lesson typography (`h1` per page, `kbd` in shortcuts modal, `mark` for search highlights 9.2, `sup/sub` in complexity notation `O(n²)` rendering); teaching: topics `headings-paragraphs`, `text-semantics` — extend with `mark`, `sup`, `sub`, `u` (gap) + new challenge; test: rule tests for new tags; search-highlight test asserts `<mark>`; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-03` | Lists incl. nested | Frontend concept | Partial | — | 21 | Atlas cites real platform use: Navigation `<ul>`, command palette listbox, achievements list; teaching: topic `lists`; add nested-list requirement (challenge currently checks flat lists only); test: validator test for nested `ul>li>ul`; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-04` | Images, alt, figure | Frontend concept | Implemented | — | 21 | Atlas cites real platform use: Emblem/progress SVG with text alternatives; share card image (12.5) with alt; teaching: topic `images`; `ch-images`; test: existing; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-05` | Links, `target`, fragments | Frontend concept | Implemented | — | 21 | Atlas cites real platform use: Skip link (`#main`), TOC fragment links (4.7), external-link safety; teaching: topic `links`; `ch-links`; test: existing + TOC fragment test; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-06` | Tables incl. rowspan/colspan | Frontend concept | Partial | — | 21 | Atlas cites real platform use: Challenge attempt heat table (12.4) is a real data table with `caption`, `th scope`; teaching: topic `tables` — add `rowspan/colspan` (gap; keep the lesson note that table layout is discouraged); test: rule + table a11y test; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-07` | Form controls and validation attributes | Frontend concept | Partial | — | 21 | Atlas cites real platform use: Settings (radio theme, checkbox/toggle, select pace, `time` reminder, `range` font scale, `file` import), custom-challenge creator (17.7), notes…; teaching: topic `forms` — extend with radio, checkbox, select, date, tel, file, `pattern`, `minlength/maxlength` (gap) + exercises; test: controls-labelled rule tests; Settings form a11y tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-08` | Audio and video elements | Frontend concept | New | — | 21 | Atlas shows the teaching-only label (no invented platform use); teaching: new topic `media-elements`: demo with small `data:` media; exercise requires `controls`, `src`/`source`, fallback text, `track`…; test: rule tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-09` | Semantic regions | Frontend concept | Implemented | — | 21 | Atlas cites real platform use: Shell landmarks, lesson `article`, study `aside`; teaching: topic `semantic-layout`; `ch-semantic-layout`; test: existing; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-10` | CSS selectors, properties, inline styles, hover | Frontend concept | New | — | 22 | Atlas cites real platform use: Design tokens, `:hover/:focus-visible` states; teaching: CSS track topics `selectors`, `cascade-specificity`, `pseudo-classes`; live demo edits a rule and shows result; test: CSS rule validators (computed-style via sandbox preview probe); `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-11` | Box model, colour, typography | Frontend concept | New | — | 22 | Atlas cites real platform use: Token scale, cards, theme switch (1.8), accent switch via CSS custom property (1.9 — a real, user-visible use of CSS variables); teaching: topics `box-model`, `colour-typography`; test: tests + token contrast test; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-12` | Float layout (teaching-only) | Frontend concept | New | — | 22 | Atlas shows the teaching-only label (no invented platform use); teaching: topic `float-and-clear` (legacy layout, marked as such); test: rule tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-13` | Flexbox | Frontend concept | New | — | 22 | Atlas cites real platform use: Shell, toolbars, nav, tab lists; teaching: topic `flexbox` + live "flex playground" demo; test: tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-14` | Grid | Frontend concept | New | — | 22 | Atlas cites real platform use: Dashboard (3.x), achievement gallery, Mastery list; teaching: topic `grid` + demo; test: tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-15` | Positioning | Frontend concept | New | — | 22 | Atlas cites real platform use: Constellation stars (absolutely positioned buttons inside a transformed wrapper, Stage 10), Mastery nodes (absolute), sticky study panel/TOC, fixed…; teaching: topic `positioning`; test: tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-16` | Responsive design / media queries | Frontend concept | New | — | 22 | Atlas cites real platform use: Shell breakpoints, Orbit mode derived from geometry, device frames (6.6); teaching: topic `responsive-design`; exercise passes only with a working `@media` rule (checked in 375/768 px frames); test: frame-render tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-17` | Transitions and animation | Frontend concept | New | — | 22 | Atlas cites real platform use: Constellation star hover/focus scale, pulse (2.1), trail (2.2), pan-to-node, toasts, all gated by reduced motion; teaching: topic `transitions-animations`; exercise with `prefers-reduced-motion` requirement; test: rule tests + reduced-motion tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-18` | JS events (click, mouseover, keydown, input) | Frontend concept | New | — | 23 | Atlas cites real platform use: Constellation pointer/touch/keyboard handling (drag-to-pan, wheel/pinch zoom, spatial arrow keys, roving tabindex), magnify on hover (2.5)…; teaching: topic `events`; demos run in the Worker/iframe-preview with a DOM-event harness (Stage 23 defines the safe harness); test: event tests; platform keyboard tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-19` | DOM and dynamic rendering | Frontend concept | New | — | 23 | Atlas cites real platform use: Live preview, quiz results, search results; teaching: topic `dom`; sandbox preview with scripts requires a separate, stricter iframe mode (see decision C-05); test: harness tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-20` | Input validation and feedback | Frontend concept | New | — | 23 | Atlas cites real platform use: Settings validation, import validation, challenge validator, quiz validation; teaching: topic `validation`; test: tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-21` | Arrays, objects, structured data | Frontend concept | New | — | 23 | Atlas cites real platform use: `TrackModule`, curriculum, state; teaching: topic `data-structures-basics` (feeds complexity analysis later); test: tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-22` | Functions and reuse | Frontend concept | New | — | 23 | Atlas cites real platform use: Pure core libraries (geometry, streak, mastery); teaching: topic `functions`; test: tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-23` | Conditionals and control flow | Frontend concept | New | — | 23 | Atlas cites real platform use: Hints gating, recommendations, soft difficulty gates (6.10); teaching: topic `control-flow`; test: tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-24` | Gallery / carousel pattern | Frontend concept | New | — | 23 | Atlas cites real platform use: Constellation topic stepper (previous/next + dot pager, Stage 10; replaces the retired carousel mode), device-frame toggle; teaching: exercise "build a gallery"; test: tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-25` | Browser persistence (localStorage) | Frontend concept | New | — | 23 | Atlas cites real platform use: Versioned storage, drafts, notes, settings; teaching: topic `web-storage` (sandbox gets an in-memory storage shim; real storage never exposed to learner code); test: tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-26` | Bootstrap navbar | Frontend concept | New | — | 24 | Atlas shows the teaching-only label (no invented platform use); teaching: Bootstrap track topic `navbar` with self-hosted Bootstrap CSS injected into the iframe document only; test: rule tests (`.navbar`, `.navbar-toggler`, `aria-expanded`); `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-27` | Authentication-style forms (UI only) | Frontend concept | New | — | 24 | Atlas shows the teaching-only label (no invented platform use); teaching: topic `auth-forms`: presentation + client-side validation only; exercise states clearly "no real authentication"; test: rule tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-28` | Bootstrap grid, utilities, components | Frontend concept | New | — | 24 | Atlas shows the teaching-only label (no invented platform use); teaching: topics `grid-system`, `utilities`, `components`; test: rule tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-29` | Angular fundamentals (no course evidence) | Frontend concept | Gated | — | 27 | Atlas shows the teaching-only label (no invented platform use); teaching: Decision-gated (needs in-browser build or restricted preview; no course evidence found); test: —; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-30` | Front-end testing concepts (Testing Lab unknown) | Frontend concept | New | — | 23 | Atlas cites real platform use: CodeOrbit's own Vitest suites; the platform shows requirement/test results (7.x); teaching: JS-track challenges graded by visible unit-test cases; HTML/CSS graded by requirement rules; a topic `testing-basics`…; test: test-runner tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-31` | Local dev environment note (not required, unconfirmed) | Frontend concept | New | — | 21 | Atlas shows the teaching-only label (no invented platform use); teaching: optional HTML-track note "Serving a page locally"; test: —; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |
| `FC-32` | Keyboard interaction and accessibility | Frontend concept | Implemented | — | 16 | Atlas cites real platform use: Everything (L-11); teaching: HTML topic `accessibility`; a11y linter (6.7); test: axe + keyboard tests; `courseStatus` stays `pending-review`. | Course mapping pending-review (non-blocking) |

## Items mapped to each stage

| Stage | Title | Items mapped to this stage | IDs |
|---|---|---|---|
| 01 | Baseline lock, reference snapshot and language-neutral core | 3 | PLT-01, PLT-02, PLT-04 |
| 02 | Design system v2: tokens, themes, accents, glass surfaces, scrollbars | 5 | 1.4, 1.5, 1.8, 1.9, PLT-18 |
| 03 | Storage v2, settings, data management, activity foundation | 9 | 14.1, 14.2, 14.4, 16.4, PLT-03, PLT-14, REF-02, REF-03, REF-07 |
| 04 | Atmosphere layers and cinematic transitions | 5 | 1.1, 1.2, 1.3, 1.6, 1.7 |
| 05 | Editor platform: CodeMirror 6 adapter, splitter, auto-save, fullscreen, editor preferences | 5 | 6.1, 6.2, 6.3, 6.8, 14.5 |
| 06 | Practice workspace: multi-file, snippets, device frames, a11y linter, diff, difficulty progression | 6 | 6.4, 6.5, 6.6, 6.7, 6.9, 6.10 |
| 07 | Feedback and Code Coach framework | 6 | 7.1, 7.2, 7.3, 7.4, 7.5, 7.6 |
| 08 | Lesson Studio: reading experience, TOC, tooltips, bookmarks, demos, focus mode | 10 | 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10 |
| 09 | Quiz engine: new question types, timed mode, breakdown | 6 | 5.1, 5.2, 5.3, 5.4, 5.5, 5.6 |
| 10 | Learning Orbit: celestial constellation map (10a prototype → 10b roll-out) with extended layers | 10 | 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, PLT-15, PLT-16, PLT-17 |
| 11 | Gamification: XP, levels, achievements, streaks, daily challenge, personal bests | 10 | 5.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, REF-04, REF-05 |
| 12 | Dashboard: hero ring, streak calendar, group cards, daily card, activity feed, quick actions, smart next step | 8 | 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 15.3, REF-08 |
| 13 | Command palette, fuzzy search, filters/tags, related topics, orbit search highlight, shortcuts modal | 6 | 2.8, 9.1, 9.2, 9.3, 9.4, 13.5 |
| 14 | Notes, bookmarks, Error Notebook flashcards and export | 6 | 10.1, 10.2, 10.3, 10.4, 10.5, 10.6 |
| 15 | Mastery map (layered + force + heatmap) and progress analytics | 11 | 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4, 12.5, REF-01, REF-06 |
| 16 | Accessibility and inclusivity features, reminders | 6 | 13.1, 13.2, 13.3, 13.4, 14.3, FC-32 |
| 17 | Onboarding, empty states, performance, optimistic UI, offline/PWA, recovery UI | 7 | 15.1, 15.2, 16.1, 16.2, 16.3, 16.5, 17.6 |
| 18 | Spaced repetition, custom challenges, peer snapshots, voice read, portfolio export | 5 | 17.3, 17.4, 17.7, 17.9, 17.10 |
| 19 | Concept Atlas: frontend concepts applied in the platform and linked to track content | 0 | — (verification/preparation) |
| 20 | Execution runner and complexity-analysis & optimisation framework | 3 | PLT-05, PLT-06, PLT-07 |
| 21 | Language integration playbook and the HTML track module (with course-evidence gap closure) | 13 | 17.1, PLT-12, PLT-13, FC-01, FC-02, FC-03, FC-04, FC-05, FC-06, FC-07, FC-08, FC-09, FC-31 |
| 22 | CSS track | 8 | FC-10, FC-11, FC-12, FC-13, FC-14, FC-15, FC-16, FC-17 |
| 23 | JavaScript track, script-enabled preview, Worker execution and the first real analysis provider | 11 | PLT-08, PLT-11, FC-18, FC-19, FC-20, FC-21, FC-22, FC-23, FC-24, FC-25, FC-30 |
| 24 | Bootstrap track | 3 | FC-26, FC-27, FC-28 |
| 25 | Python track (Pyodide in a Worker) with analysis provider | 1 | PLT-09 |
| 26 | Java and C++ tracks (decision-gated execution) | 1 | PLT-10 |
| 27 | Angular track (decision-gated) | 1 | FC-29 |
| 28 | External-dependency features (AI hints, W3C validator, LAN multiplayer) | 3 | 17.2, 17.5, 17.8 |
| 29 | Final integration, hardening and release | 0 | — (verification/preparation) |

**Audit:** all 168 ids are unique and mapped to a stage that exists (29 stages).
