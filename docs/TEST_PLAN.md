# Test plan and results

Commands (all run from `codeorbit/`): `npm run typecheck` · `npm run lint` · `npm test` · `npm run build`.

## Automated (Vitest, jsdom) — 65 files (520 tests)
| File | Covers |
|---|---|
| `remediation.test.ts` | Stage 10 Consolidated Remediation: zero drift on zoom in/out, centering hub at (w/2, h/2), no drift at min zoom limit (0.75), pointer anchor preservation, edge incoming/outgoing classification, mobile container bounds |
|---|---|
| `curriculum.test.ts` | stable unique IDs/order; prerequisite edges valid, acyclic, not a chain; every topic has lesson/quiz/challenge; quiz shape; previews have no topics |
| `orbit.geometry.test.ts` | upper arch (apex mid, ends lower, monotone), symmetric, deterministic, in-bounds at 9 widths, even arc spacing, mode selection (desktop `arch`, phones `carousel`), mode monotone in width, no label collisions in `arch`, edge paths |
| `validators.test.ts` | every challenge: solution passes, starter fails, empty input safe; partial/edge cases per challenge; invalid selector safe; determinism |
| `quiz.test.ts` | select/check/skip/finish/retry/navigation/score/pass/perfect; session sanitising |
| `storage.test.ts` | save/load round-trip, invalid JSON, non-object JSON, newer version, v0 migration, partial repair, unavailable storage, quota failure, clear |
| `progress.test.ts` | status rules, best score, mastery vs solution reveal, sticky completion, recommendations, hints, drafts, notes, bookmarks, error dedupe, reset |
| `preview.test.tsx` | `sandbox=""`, no allow-scripts/allow-same-origin, learner markup absent from parent DOM, CSP before content, source scan for innerHTML/dangerouslySetInnerHTML/document.write, multi-file CSS stitching and `</style>` breakout defense |
| `app.test.tsx` | first-run, previews, Orbit render/sync/keyboard/stable positions/edges/carousel/restore, lesson notes+bookmark persistence, full quiz + resume, practice run/check/hints/solution/focus/reset/mobile tabs, progress & review empty/populated, corrupt/unavailable storage, a11y landmarks |
| `registry.test.ts` | TrackRegistry registration, duplicate rejection, registration order, availability filtering, defaultTrackId, unregisterTrack |
| `htmlTrack.test.ts` | HTML track module packaging, unique IDs, complete lesson/quiz/challenge per topic, truthful capability declarations, planned track definitions |
| `emptyTracks.test.tsx` | Empty track registry handling: Home and Explore render EmptyState titled "No learning tracks are available yet" with no actions and no crashes; unknown :technologyId redirects to /explore |
| `challengeAdapter.test.ts` | `toChallengeV2` and `toChallenge` round-trip and conversion of all 12 curriculum challenges without data loss |
| `regression.smoke.test.tsx` | Automates the 9 G2 regression smoke items (start/resume, orbit sync/keyboard, lesson persistence, quiz pass/perfect/retake, practice draft/hints/solution, error notebook CRUD, progress state numbers, storage recovery, preview sandbox/CSP) and 8 automated axe checks for serious/critical violations on Home, Explore, Track, Lesson, Quiz, Practice, Progress, Review |
| `appearance.test.ts` | DOM attributes, localStorage synchronization, early script persistence, and fallback to defaults |
| `contrast.test.ts` | WCAG AA 4.5:1 text/bg ratio and 3:1 graphical object ratio across Obsidian, Starlight, and Aurora themes |
| `uiComponents.test.tsx` | Core UI kit primitives (Button, Card, Input, Textarea, Select, Badge, Tag, ProgressBar, ProgressRing, StatCard, Callout, Tabs, Modal, Tooltip, EmptyState, Skeleton) accessibility and interaction |
| `devRoute.test.tsx` | Dev-only `/__ui` gallery route isolation from production builds |
| `streak.test.ts` | Streak computation, freeze window, milestone alerts, and streak-best logic across leap years and clock shifts |
| `activity.test.ts` | Meaningful activity predicate rules, daily deduplication, and activity event formatting |
| `migrations.test.ts` | Schema v1 to v2 to v3 to v4 migration, preservation of reference-era activity days and daily done, sanitization, challenge history initialization, and sectionBookmarks initialization |
| `exportImport.test.ts` | Backup JSON export structure, schema validation, size limits (≤ 4 MiB), and preview summaries |
| `persistence.test.tsx` | 300ms save debounce, flush on pagehide/visibilitychange, cross-tab synchronization, quota warning |
| `Settings.test.tsx` | Profile name length validation, FC-07 compliant form controls, typed "RESET" modal confirmation, atmosphere toggles and motion selector |
| `useMotionAllowed.test.ts` | Motion preference matrix (system/reduced/full), OS prefers-reduced-motion media query precedence, reactive updates |
| `starfield.test.tsx` | Deterministic starPositions generator, hard caps (≤ 150 stars, ≤ 12 twinkle), SVG rendering, high-contrast suppression, reduced motion twinkle disablement |
| `atmosphere.test.tsx` | Fixed z-index: 0 container, route-specific Nebula (Home/Track only), high-contrast absence, particle cap (≤ 30), route transition focus & first-render skip, text contrast over nebula gradient peak |
| `editorAdapters.test.ts` | Language-neutral `EditorAdapter` contract testing across both `PlainTextEditorAdapter` and `CodeMirrorEditorAdapter` (`getValue`, `setValue`, `insertAtCursor`, `setReadOnly`, `updateOptions`, `destroy`, Tab navigation) |
| `splitter.test.tsx` | Splitter (6.2, FC-18): `role="separator"`, $\pm 2\%$ keyboard navigation, Home 25%, End 75%, Enter/Space/r reset to 50%, double-click reset, boundary clamping |
| `autoSaveIndicator.test.tsx` | Auto-save indicator (6.3): `saveStatus` states, 'Saved just now', relative timestamp updates, and amber 'Draft not saved' warning on storage error |
| `fullscreenEditor.test.tsx` | Fullscreen editor (6.8): dialog accessibility, Esc key exit restoring focus to opener button, and live preview slide-out drawer |
| `diff.test.ts` | Myers / LCS line diff algorithm, line numbering, additions/deletions identification, empty inputs, identical inputs, 2000-line safety cap |
| `a11yLint.test.ts` | Accessibility linter rules: missing img alt, unlabelled inputs, empty headings, ID duplicates, heading hierarchy skips, explicit non-WCAG disclaimer |
| `difficulty.test.ts` | Soft challenge progression predicate, recommendations based on prerequisites, advisory non-blocking nature |
| `practiceWorkspace.test.tsx` | Multi-file tabs (`fileCount > 1`), DeviceFrame viewport switcher, DiffViewer gating behind solution reveal, snippet insertion at cursor |
| `sourcePositions.test.ts` | HTML source offset-to-line/column mapping (7.1), doctype/selector/attribute/heading/control location detection, multi-line and void element handling |
| `diagnostics.test.ts` | Mapping `RequirementResult` to `EditorDiagnostic` objects (7.1), severity assignment, line/column preservation |
| `FeedbackPanel.test.tsx` | Progress bar (`role="progressbar"`) met/total accuracy (7.2), grouped requirement rows (7.3), expandable explanations (7.5), check history persistence & cap at 20 (7.4), L-05 Code Coach copy test (7.6) |
| `readingTime.test.ts` | Word count calculation (200 wpm), interactive demo allowance (+1 min/demo), honest estimate formatting (`about N min (estimate)`), lesson object computation, and authored override support (4.6, L-05) |
| `lessonSections.test.ts` | Section ID uniqueness, slug validity, 3-5 takeaways per lesson, glossary terms, a11y notes, and live demo configurations across all 12 curriculum lessons |
| `Toc.test.tsx` | TOC render suppression when sections $\le 1$, desktop `<nav>` and mobile `<details>` disclosure, `aria-current="true"` active tracking, link smooth scroll and keyboard focus movement (4.7) |
| `DefinitionTerm.test.tsx` | Accessible trigger button with `aria-describedby` and `aria-expanded`, popover tooltip toggle on click, Escape dismissal with trigger refocus, outside click dismissal, and injection-safe `renderTextWithTerms` parser (4.5) |
| `FocusMode.test.tsx` | Dark-room focus mode suppression of non-reading chrome, `aria-live="assertive"` screen reader announcement, visible 'Exit focus mode' button, Escape key exit, and focus restoration to opener button (4.10) |
| `LiveDemo.test.tsx` | Live interactive demo mini-editor, sandboxed preview iframe with empty `sandbox=""` and strict CSP, local component state isolation, and reset demo restoration without draft leakage (4.4) |
| `quiz.scoring.test.ts` | Exhaustive `scoreQuestion` per kind (choice, output, sort, bug, blank whitespace trimming/case sensitivity), `scoreSession` mixed kinds, `sanitizeSession` backwards compatibility and validation |
| `Sorter.test.tsx` | Keyboard-first drag-and-drop sorter (5.2, FC-18): 48px item touch targets, Move up/down buttons, Space grab/drop, Arrow reordering, Esc cancel, polite `aria-live` announcements |
| `QuizTimer.test.tsx` | Opt-in calm quiz timer (5.5): `role="timer"` chip, tabular countdown, weight increase under 10s without panic colors, auto-pausing on `visibilitychange`, onExpire triggering |
| `QuizBreakdown.test.tsx` | Result breakdown table (5.6): per-question table rendering, kind badges, ✓/✗ + status text, your answer vs correct answer, explanations, and "Save to Error Notebook" action |
| `constellation/layout.test.ts` | Constellation layout engine: deterministic counter-clockwise placement, hub clearance, collision relaxation (≥ 96px), aspect ratio bucketing, and Bézier prerequisite edge routing |
| `constellation/connections.test.ts` | Constellation edge connections: SVG Bézier paths for declared prerequisites, directional arrows, and sequential curriculum order links |
| `constellation/state.test.ts` | Node state derivation (completed, in-progress, available, locked) and counts strictly summing to total n |
| `constellation/navigation.test.ts` | Viewport transform math: fitTransform, clampTransform (zoom 0.75-3.0, keeps ≥ 25% visible), and spatial arrow navigation cone |
| `constellation/ConstellationMap.test.tsx` | ConstellationMap integration: renders one star per topic, SELECT_TOPIC updates details panel, View topic/Lesson/Quiz/Practice links, advisory locked notice, hub selection track overview |
| `constellation/ConstellationMap.pan-zoom.test.tsx` | ConstellationMap pan/zoom: drag pans past 4px threshold without changing selection, zoom buttons and wheel limits, Fit view reset |
| `constellation/ConstellationMap.a11y.test.tsx` | Automated axe checks in Map and List views (zero serious/critical violations), roving tabindex, polite live-region announcements |
| `constellation/ConstellationMap.responsive.test.tsx` | Responsive layout: viewports 1280, 820, 390, 320 px, Rule P-12 fallback to list view on narrow screen when topic count > 14 |
| `constellation/ConstellationMap.motion.test.tsx` | Reduced motion disables twinkle; high contrast removes decorative starfield backdrop |
| `constellation/ProgressCard.test.tsx` | ProgressCard: 4 state counts strictly sum to n, progress ring & percentage never 100% unless all topics complete |
| `constellation/pulse.test.ts` | Catalog 2.1: Star pulse emits only on genuine progress save (parts increase or completion), omitted on load/nav, disabled under reduced motion |
| `constellation/trail.test.tsx` | Catalog 2.2: Orbital trail emits animated Bézier curve between stars on non-adjacent selection (|index diff| > 1), omitted on adjacent or under reduced motion |
| `constellation/relations.test.ts` | Catalog 2.3: Prerequisite live text and screen reader announcement generation matching declared curriculum prerequisites |
| `constellation/zones.test.tsx` | Catalog 2.4: Topic group halo zones with first-topic click navigation and strict star position equality invariant |
| `constellation/youAreHere.test.tsx` | Catalog 2.6: "You Are Here" beacon marker on lastVisited topic star with accessible status announcement |
| `constellation/miniConstellation.test.tsx` | Catalog 2.7: 48x48 px mini constellation preview in breadcrumb bar highlighting active topic, linking to track orbit, with accessible text alternative |
| `constellation/scale42.test.ts` | Stage 10b: 42-node track fixture scale, DAG validation, hub clearance, and deterministic layout within 50ms budget |

## Browser Smoke Suite (Playwright, production build preview) — `e2e/` (19 tests)
Real committed Playwright script executed against `vite preview` (`npm run test:e2e`):
1. **Viewport horizontal overflow**: Home verified at 1280×800, 820×1180, and 390×844 px — zero horizontal page overflow (`scrollWidth <= clientWidth`).
2. **Legacy Learning Orbit navigation**: Selection works by click on strip and arch nodes; keyboard navigation moves selection with arrow keys in bounds on `?orbit=legacy`.
3. **Lesson persistence**: Marking lesson complete persists across full browser reload.
4. **Sandboxed preview iframe**: Preview iframe verified to have empty `sandbox=""`, strictly disallow scripts, and include CSP meta `default-src 'none'`.
5. **Theme & accent switching**: Switching between Obsidian, Starlight, and Aurora restyles document attributes and background styles without flash.
6. **Dev route isolation**: `/__ui` returns 404 NotFound in production preview builds.
7. **Settings & Data Management**: Form controls rendered with accessible labels, pace selection, theme selection, quota progress meter, and backup export/reset buttons verified.
8. **Atmosphere & Reduced Motion**: Atmosphere layer renders behind content at z-index: 0; `prefers-reduced-motion: reduce` suppresses animation classes; motion setting `reduced` applies `data-motion="reduced"`.
9. **Editor Platform & Preferences**: Splitter separator with keyboard controls, AutoSaveIndicator, Fullscreen dialog modal with Esc exit and focus restoration, and Settings Editor preferences controls (engine, font size, tab indentation).
10. **Practice Workspace Platform**: Multi-file tab UI, DeviceFrame viewport dimensions (Desktop, Tablet 768px, Mobile 375px), Snippets drawer insertion, A11y linter detection, and Diff gating strictly disabled until solution revealed.
11. **Feedback & Code Coach Platform**: Initial empty state, progress bar (`role="progressbar"`) met/total reflection, Code Coach persona label with strict L-05 compliance, expandable requirement explanations (`details.req-explanation`), and attempt history entry inspection.
12. **Lesson Studio Platform**: Reading progress bar, estimated time badge (`about N min (estimate)`), takeaways card, TOC navigation with keyboard focus movement to section heading, accessible definition tooltip opening and Esc dismissal with focus return, section bookmark toggling and persistence across reloads (Schema v4), sandboxed live interactive demo with reset, and dark-room focus mode with Esc dismissal and focus restoration to opener.
13. **Quiz Engine & Results Breakdown Platform**: Intro timed mode toggle (off by default), calm QuizTimer display during timed quiz, typed questions execution (choices, sorter 48px touch targets, blank code input), results score calculation, breakdown table with ✓/✗ + status text, and one-click "Save to Error Notebook" action.
14. **Learning Orbit Constellation Map (Stage 10b Promoted)** (`e2e/orbit-visual.spec.ts` - 6 tests): Captures 13 responsive visual screenshots across 5 viewports (1440, 1280, 820, 390, 320 px) on default route `/learn/html` without query parameters, verifies interactive star selection updates details panel with accurate routes, verifies hub selection track overview with truthful `nextAction()`, tests List view toggle and reload persistence, validates expanded view and Escape dismissal, verifies high-contrast and reduced-motion states with zero horizontal page overflow, and verifies legacy fallback route `?orbit=legacy`.

## Browser (headless Chromium via puppeteer-core, production build, web security ON)
Scripts live outside the repo (`/home/claude/browser/*.mjs`, not shipped). 41 checks covering: first run; arch apex/ends/order/touch size; strip⇄arch sync incl. first & last; no jitter on strip scroll; keyboard; lesson note persistence; quiz feedback; **sandbox attack** (script, `onerror`, form, popup link) — parent title/window untouched, script not executed in frame, `SecurityError` reading frame from parent, browser console confirms script + remote-image blocks; incomplete check; hints; confirmed solution reveal; focus mode in/out with draft intact; completion + reload + Resume; reduced motion; focus ring; mobile carousel/tap/tabs. Run 4× for stability. Page-level horizontal overflow checked on 8 routes × 6 viewports (1440, 1280, 1024, 768, 390, 360): none.

## Not done / limits
- Visual inspection was via screenshots of the main routes (1440, 390 and 768 Orbit; 1440 Practice and Home reviewed by eye). Other screenshots were generated but not each individually reviewed.
- No real touch-device or screen-reader testing; no cross-browser testing (Chromium only).
- No automated colour-contrast tool run; contrast values in `DESIGN.md` are calculated by hand.
