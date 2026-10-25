# Test plan and results

Commands (all run from `codeorbit/`): `npm run typecheck` · `npm run lint` · `npm test` · `npm run build`.

## Automated (Vitest, jsdom) — 26 files (318 tests)
| File | Covers |
|---|---|
| `curriculum.test.ts` | stable unique IDs/order; prerequisite edges valid, acyclic, not a chain; every topic has lesson/quiz/challenge; quiz shape; previews have no topics |
| `orbit.geometry.test.ts` | upper arch (apex mid, ends lower, monotone), symmetric, deterministic, in-bounds at 9 widths, even arc spacing, mode selection (desktop `arch`, phones `carousel`), mode monotone in width, no label collisions in `arch`, edge paths |
| `validators.test.ts` | every challenge: solution passes, starter fails, empty input safe; partial/edge cases per challenge; invalid selector safe; determinism |
| `quiz.test.ts` | select/check/skip/finish/retry/navigation/score/pass/perfect; session sanitising |
| `storage.test.ts` | save/load round-trip, invalid JSON, non-object JSON, newer version, v0 migration, partial repair, unavailable storage, quota failure, clear |
| `progress.test.ts` | status rules, best score, mastery vs solution reveal, sticky completion, recommendations, hints, drafts, notes, bookmarks, error dedupe, reset |
| `preview.test.tsx` | `sandbox=""`, no allow-scripts/allow-same-origin, learner markup absent from parent DOM, CSP before content, source scan for innerHTML/dangerouslySetInnerHTML/document.write |
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
| `migrations.test.ts` | Schema v1 to v2 migration, preservation of reference-era activity days and daily done, sanitization and repair |
| `exportImport.test.ts` | Backup JSON export structure, schema validation, size limits (≤ 4 MiB), and preview summaries |
| `persistence.test.tsx` | 300ms save debounce, flush on pagehide/visibilitychange, cross-tab synchronization, quota warning |
| `Settings.test.tsx` | Profile name length validation, FC-07 compliant form controls, typed "RESET" modal confirmation, atmosphere toggles and motion selector |
| `useMotionAllowed.test.ts` | Motion preference matrix (system/reduced/full), OS prefers-reduced-motion media query precedence, reactive updates |
| `starfield.test.tsx` | Deterministic starPositions generator, hard caps (≤ 150 stars, ≤ 12 twinkle), SVG rendering, high-contrast suppression, reduced motion twinkle disablement |
| `atmosphere.test.tsx` | Fixed z-index: 0 container, route-specific Nebula (Home/Track only), high-contrast absence, particle cap (≤ 30), route transition focus & first-render skip, text contrast over nebula gradient peak |

## Browser Smoke Suite (Playwright, production build preview) — `e2e/smoke.spec.ts` (8 tests)
Real committed Playwright script executed against `vite preview` (`npm run test:e2e`):
1. **Viewport horizontal overflow**: Home verified at 1280×800, 820×1180, and 390×844 px — zero horizontal page overflow (`scrollWidth <= clientWidth`).
2. **Legacy Learning Orbit navigation**: Selection works by click on strip and arch nodes; keyboard navigation moves selection with arrow keys in bounds.
3. **Lesson persistence**: Marking lesson complete persists across full browser reload.
4. **Sandboxed preview iframe**: Preview iframe verified to have empty `sandbox=""`, strictly disallow scripts, and include CSP meta `default-src 'none'`.
5. **Theme & accent switching**: Switching between Obsidian, Starlight, and Aurora restyles document attributes and background styles without flash.
6. **Dev route isolation**: `/__ui` returns 404 NotFound in production preview builds.
7. **Settings & Data Management**: Form controls rendered with accessible labels, pace selection, theme selection, quota progress meter, and backup export/reset buttons verified.
8. **Atmosphere & Reduced Motion**: Atmosphere layer renders behind content at z-index: 0; `prefers-reduced-motion: reduce` suppresses animation classes; motion setting `reduced` applies `data-motion="reduced"`.

## Browser (headless Chromium via puppeteer-core, production build, web security ON)
Scripts live outside the repo (`/home/claude/browser/*.mjs`, not shipped). 41 checks covering: first run; arch apex/ends/order/touch size; strip⇄arch sync incl. first & last; no jitter on strip scroll; keyboard; lesson note persistence; quiz feedback; **sandbox attack** (script, `onerror`, form, popup link) — parent title/window untouched, script not executed in frame, `SecurityError` reading frame from parent, browser console confirms script + remote-image blocks; incomplete check; hints; confirmed solution reveal; focus mode in/out with draft intact; completion + reload + Resume; reduced motion; focus ring; mobile carousel/tap/tabs. Run 4× for stability. Page-level horizontal overflow checked on 8 routes × 6 viewports (1440, 1280, 1024, 768, 390, 360): none.

## Not done / limits
- Visual inspection was via screenshots of the main routes (1440, 390 and 768 Orbit; 1440 Practice and Home reviewed by eye). Other screenshots were generated but not each individually reviewed.
- No real touch-device or screen-reader testing; no cross-browser testing (Chromium only).
- No automated colour-contrast tool run; contrast values in `DESIGN.md` are calculated by hand.
