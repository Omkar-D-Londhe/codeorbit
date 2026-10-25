# Stage 17 — Onboarding, empty states, performance, optimistic UI, offline/PWA, recovery UI

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

> **Decision gate (soft — a default exists; proceed with it and record that you did):** O-08 (hosting target) is a soft gate: it only affects documentation; implement for any static HTTPS host and record the assumption.

## 1. Stage identity, objective and scope

**Stage:** 17 · **Slug:** `onboarding-resilience-offline` · **Branch:** `stage-17-onboarding-resilience-offline`

**Objective.** Make the app welcoming and robust: first-run tour, animated empty states, route-level code splitting, optimistic updates, an offline-first service worker with installable PWA manifest, and a recovery-oriented error boundary.

**In scope**
- 15.1 first-run onboarding tour, 15.2 animated empty states, 16.1 route-level code splitting, 16.2 optimistic UI updates, 16.3 offline-first behaviour, 16.5 error boundary with recovery UI, 17.6 installable PWA (manifest + service worker).

**Out of scope**
- Hosting setup beyond documentation (O-08).

## 2. Prerequisites and dependencies

- Stage 16 exit gate green; owner awareness of O-08 (any static HTTPS host).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `15.1` First-Run Onboarding Tour, `15.2` Animated Empty States, `16.1` Route-Level Code Splitting, `16.2` Optimistic UI Updates, `16.3` Offline-First Behaviour, `16.5` Error Boundary with Recovery UI, `17.6` Mobile app (PWA installable)
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-16, FC-25, FC-32

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Existing `ErrorBoundary` public behaviour, storage recovery banners, route table.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/App.tsx | `React.lazy` for pages (Home eager); Suspense fallback skeleton. |
| src/components/ErrorBoundary.tsx | Recovery UI: message, 'Reload', 'Copy diagnostic info', 'Export my data', 'Reset this screen'. |
| src/components/EmptyState.tsx | Animated illustration variants (SVG, reduced-motion safe). |
| vite.config.ts, index.html | Manifest link, theme-color, icons; build emits `sw.js` (Workbox-free hand-written or `vite-plugin-pwa` if justified in DECISIONS). |
| src/state/reducer.ts / AppState.tsx | Optimistic UI is already synchronous (state first, persist after); add rollback on persistence failure only for destructive actions (delete note/error) via undo toast. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/onboarding/Tour.tsx + steps.ts | Spotlight tour (5–7 steps) over Orbit, Lesson link, Practice, Review, Settings; skippable; `Esc`; replay from Settings/Help; completion flag in settings. |
| src/core/pwa/register.ts | Registers the service worker in production only; update prompt toast ('New version available — Reload'). |
| public/manifest.webmanifest, public/icons/* | Name, short_name, `display: standalone`, colors from tokens, 192/512 + maskable icons. |
| src/sw.ts or public/sw.js | Precache app shell + hashed assets; runtime cache for fonts and lazy chunks; **never** cache `localStorage` data (n/a) and never serve a stale shell against a newer schema (skipWaiting only after user confirms). |
| src/core/ui/Skeletons.tsx | Route skeletons. |

## 7. Implementation steps (execute in order)

1. Inspect bundle (`npm run build` output) and record route chunk sizes before/after.
2. Code-split pages; test that each route loads with Suspense fallback and that deep links work after refresh.
3. Empty-state variants for: no notes, no bookmarks, no review items, no activity, no tracks; animations stop under reduced motion.
4. Tour: focus-managed dialog-like popovers anchored to real elements (skip if element absent); steps authored per available capability; does not auto-start twice; Settings has 'Replay tour'.
5. Error boundary recovery UI; test by throwing in a child; 'Export my data' uses Stage 03 export.
6. PWA manifest + icons (generated SVG→PNG at build or committed); service worker with versioned cache names; offline test: after first load, airplane-mode reload shows the app and local data.
7. Update flow: new SW waits; toast offers reload; reload activates; test with a simulated waiting worker.
8. Lighthouse on `vite preview` (HTTP) records PWA/Performance/Accessibility scores; fix regressions.
9. Docs: README deployment notes (HTTPS requirement, scope, cache versioning).

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

### 7a. Sub-stages

This stage is large. To keep each working session reviewable it may be executed as the sub-stages below **without dropping any scope**: the stage is complete only when every sub-stage gate and every §13 box is green. Each sub-stage uses branch `stage-NN<letter>-<slug>`, its own status report (`STAGE_NN<letter>_STATUS.md`) and its own exit gate. Give Antigravity one sub-stage at a time (guide §10).

| Sub-stage | Title | Scope (from §1/§7) | Sub-stage exit gate |
|---|---|---|---|
| 17a | Code splitting, error boundary, empty states, optimistic UI | 16.1, 16.2, 16.5, 15.2 | Bundle budget recorded; error/empty-state tests green |
| 17b | Onboarding tour | 15.1 tour, replay, `settings.onboarding` | Tour tests + a11y green |
| 17c | PWA and offline | 16.3 service worker, manifest, update flow, offline test | Offline test (browser) green or NOT VERIFIED with reason |

## 8. Component behaviour, state, data contracts and integration

```ts
interface TourStep { id: string; selector: string; title: string; body: string; placement: 'top'|'right'|'bottom'|'left'; requires?: CapabilityId }
settings.onboarding: { completed: boolean; skippedAt?: number }
SW cache keys: `codeorbit-shell-v${APP_VERSION}`, `codeorbit-assets-v${APP_VERSION}`
```

## 9. UI/UX expectations

Tour popover 320 px, arrow to target, 'Step 2 of 6', Back/Next/Skip buttons, focus trapped within the popover and restored on exit; dim overlay with a cut-out; reduced motion removes pulse. Empty states: 96 px SVG, title, one-line help, one action.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Target element missing (e.g. mobile nav) → step skipped silently. Offline first visit (no cache) → browser default (documented). SW registration failure → no impact, logged to console only in dev.

## 11. Security and performance

Initial route JS ≤ baseline + 40 kB gzip (limit in `07` §3); lazy chunks prefetched on idle for likely next routes; SW does not cache API (none); no analytics/telemetry.

## 12. Required tests and regression checks

- Route lazy-load tests; Tour keyboard/focus/skip/replay tests; ErrorBoundary recovery test (copy diagnostic contains no learner code); SW unit tests for cache-key versioning (Workbox-free logic extracted to a pure module); manifest validity test (JSON schema subset).
- Browser/e2e: offline reload works after first load; install prompt criteria met; Lighthouse scores recorded (≥ 90 targets are enforced at Stage 29).

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Each non-home route is its own chunk; initial JS within budget.
- [ ] Fresh profile shows the tour once; skipping persists; replay works; `Esc` closes and focus returns.
- [ ] Throwing in a page shows the recovery UI with working Reload and Export; the shell remains usable.
- [ ] After one online visit the app loads and works offline with existing data (browser check).
- [ ] A new deployment is offered via toast and not forced.
- [ ] Manifest and icons pass the installability audit.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Storage recovery semantics, route paths.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_17_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 17: Onboarding, empty states, performance, optimistic UI, offline/PWA, recovery UI`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 18 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
