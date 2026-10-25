# Stage 04 — Atmosphere layers and cinematic transitions

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 04 · **Slug:** `atmosphere-and-motion` · **Branch:** `stage-04-atmosphere-and-motion`

**Objective.** Add the restrained celestial atmosphere (nebula, constellation grid, cursor glow, optional particles) and cinematic route transitions, all optional, performance-budgeted and fully disabled by reduced motion.

**In scope**
- 1.1 nebula, 1.2 grid overlay, 1.3 cursor glow, 1.6 particles (off by default), 1.7 page transitions.
- A reusable, **deterministic static `Starfield`** (seeded star dots in SVG/CSS, ≤ 150 dots, optional twinkle on ≤ 12 dots only when motion is allowed) that the constellation map (Stage 10) uses as its local backdrop; it must also render on its own in `/__ui` and be absent in high-contrast/reduced-data contexts.
- Settings → Appearance → Atmosphere toggles (nebula, grid, cursor glow, particles) and Motion (`system | reduce | full`).
- Per-track `--nebula-tint` (violet HTML, amber CSS, teal JavaScript, defaults for others).

**Out of scope**
- Orbit animations (Stage 10), XP animations (Stage 11).

## 2. Prerequisites and dependencies

- Stage 03 exit gate green (settings model, appearance application).
- Read `10_CONSTELLATION_LEARNING_ORBIT_SPEC.md` §2 and §11–§12 (the `Starfield` backdrop is used by the constellation).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `1.1` Dynamic Nebula Background, `1.2` Constellation Grid Overlay, `1.3` Cursor Glow / Parallax Aura, `1.6` Ambient Particle Field (optional, heavy-opt-in), `1.7` Cinematic Page Transitions
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-15 (fixed/absolute positioning), FC-17 (transitions)

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Orbit, content readability, existing reduced-motion behaviour (`prefers-reduced-motion` CSS), z-index scale.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/styles/tokens.css, base.css | Atmosphere tokens; global `html[data-motion='reduce']` rules mirrored with the media query. |
| src/components/Shell.tsx | Render `<Atmosphere />` as a fixed, `aria-hidden`, `pointer-events:none` layer behind `<main>`; wrap `<Outlet/>` in `RouteTransition`. |
| src/core/settings/appearance.ts | Apply `data-motion`, atmosphere data attributes. |
| src/pages/Settings.tsx | Atmosphere and Motion controls. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/atmosphere/Atmosphere.tsx | Composes the layers by settings and route (nebula on Home/Track only). |
| src/core/atmosphere/Nebula.tsx + nebula.css | 3 stacked radial gradients, one transform/opacity loop 90–120 s. |
| src/core/atmosphere/ConstellationGrid.tsx | SVG pattern, 4–6% opacity; cursor-proximity brightening via CSS variable, rAF-throttled. |
| src/core/atmosphere/CursorGlow.tsx | Fixed radial gradient following the pointer with trailing; pointer-fine devices only. |
| src/core/atmosphere/Particles.tsx | Canvas, 15–30 dots, hero area only, paused when hidden/off-screen. |
| src/core/atmosphere/RouteTransition.tsx | View Transitions API when available, CSS fallback ≤ 300 ms; skipped on first load and reduced motion. |
| src/core/atmosphere/Starfield.tsx + starfield.ts | Seeded (`seed`, `density`) static star layer for local backdrops; pure `starPositions(seed, n)` tested for determinism; `aria-hidden`; twinkle only through `useMotionAllowed`. |
| src/core/atmosphere/useMotionAllowed.ts | Single hook combining OS preference and Settings. |

## 7. Implementation steps (execute in order)

1. Inspect existing reduced-motion CSS and `Shell` layering; record z-indexes.
2. Implement `useMotionAllowed` with tests (system/reduce/full + OS preference precedence per `04` §5).
3. Nebula and grid as CSS/SVG layers first; verify no layout/paint cost by Performance panel note.
4. Cursor glow with `pointermove` throttled through rAF and `(pointer: fine)` guard; cleanup on unmount.
5. Particles with `IntersectionObserver` + `visibilitychange`; hard cap of 30 particles; default off.
6. Route transition wrapper; ensure focus move to `<main>` (existing) still occurs and the skip link works.
7. Settings controls; per-track tint from `TrackModule.tint`.
8. Build `Starfield` (pure position function first, then the component); add it to `/__ui`.
9. **Visual QA (mandatory, `08` G3):** run the app; capture Home and Track (with the nebula and the Starfield specimen) at 1280×800, 820×1180, 390×844, 320×640 × 3 themes; look at the screenshots, compare with `04` §5 and the mood of `design-reference/codeorbit_constellation_concept.png`; fix defects and re-inspect; measure idle CPU (document method).

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

```ts
export interface AtmosphereSettings { nebula: boolean; grid: boolean; cursorGlow: boolean; particles: boolean }
export function useMotionAllowed(): boolean   // false when OS reduce OR settings.motion === 'reduce'
```
Defaults: nebula on, grid on, cursor glow off, particles off. `motion: 'full'` never overrides a hard OS reduce preference unless the learner explicitly picks it (document in DESIGN.md).

## 9. UI/UX expectations

Layers sit behind content at `z-index: 0`; content has `position: relative; z-index: 1`. Nebula visible only on Home and Track pages. High-contrast mode shows a static flat background (no layers). Transitions: 220 ms opacity + 8 px rise.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Unsupported View Transitions → CSS fallback. Canvas unsupported → particles silently off. Pointer coarse → glow/grid-proximity off.

## 11. Security and performance

Animate only `transform`/`opacity`; ≤ 2 ms scripting per frame; rAF cancelled on unmount and when `document.hidden`; zero listeners left after unmount (test with spies).

## 12. Required tests and regression checks

- `useMotionAllowed.test.ts` matrix.
- Component tests: under reduce mode no animation classes or canvases are mounted; with allowed motion they are.
- Listener cleanup tests; Particles cap test (never > 30).
- Route transition: focus ends in `<main>`; transition skipped on first render.
- Regression smoke + axe.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] `Starfield` is deterministic for a given seed/density (test), ≤ 150 dots, `aria-hidden`, absent in high-contrast, twinkle only when motion is allowed.
- [ ] With `prefers-reduced-motion: reduce` emulated: no nebula animation, no grid proximity, no glow, no particles, no transitions (test + browser check).
- [ ] Atmosphere never intercepts pointer events or focus (test `pointer-events: none`, `aria-hidden`).
- [ ] Toggles in Settings take effect immediately and persist.
- [ ] Text contrast over the nebula meets AA in all themes (contrast test samples the brightest gradient stop).
- [ ] Documented idle CPU is ~0 when the tab is hidden.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None (reference has no atmosphere).

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Content layout, orbit, any copy; do not make atmosphere a dependency of any feature.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_04_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 04: Atmosphere layers and cinematic transitions`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 05 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
