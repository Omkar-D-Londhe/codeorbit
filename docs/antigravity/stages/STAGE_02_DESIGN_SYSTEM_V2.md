# Stage 02 — Design system v2: tokens, themes, accents, glass surfaces, scrollbars

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 02 · **Slug:** `design-system-v2` · **Branch:** `stage-02-design-system-v2`

**Objective.** Extend the existing token system into a themeable design system (Obsidian, Starlight, Aurora; five accents; high-contrast hook) with verified contrast, glass panels and styled scrollbars, and extract the reusable UI components later stages need — preserving the current look as the default.

**In scope**
- Semantic aliases `--c-*` over existing tokens; `themes.css` with `[data-theme]`, `[data-accent]`, `[data-contrast]` selectors (see `04` §1).
- Early-boot script in `index.html` applying `codeorbit:settings:early` (theme/accent/contrast/motion) before first paint to avoid flashes.
- `core/a11y/contrast.ts` (WCAG luminance + ratio) and a test that checks the full theme × accent × contrast matrix.
- Glass panel system (1.4) with `@supports` and high-contrast fallbacks; thin scrollbars (1.5).
- Extract/introduce `core/ui` components: `Button`, `IconButton`, `Card`, `GlassPanel`, `Tabs`, `Toggle`, `Select`, `Segmented`, `Tooltip`, `Kbd`, `Skeleton` — reusing existing CSS classes (`btn`, `card`) so existing screens do not change.
- A minimal theme/accent switch used by Stage 03 Settings; for now exposed through `applyAppearance({theme, accent, contrast})` and a dev-only story page `/__ui` (excluded from production).
- **Constellation foundations (L-23, `10` §19):** `--orbit-*` tokens (field, hub glow, ring, star size, per-state star colours, edge colours, label, halo) defined for every theme and high-contrast; components `StatusChip` (icon + text), `ProgressRing`, `ProgressBar`, `DockedPanel`/`Drawer`, and the inline-SVG icon registry `core/ui/icons` (curated set; no icon font or CDN); gallery entries showing a star in every state (completed, in-progress, available, locked, selected), the hub, and both line styles (dashed prerequisite, dotted order) in every theme.

**Out of scope**
- Settings page UI (Stage 03), atmosphere layers (Stage 04), font scaling/dyslexia font (Stage 16).

## 2. Prerequisites and dependencies

- Stage 01 exit gate green.
- Read `10_CONSTELLATION_LEARNING_ORBIT_SPEC.md` §19 and `09_UI_UX_QUALITY_CONTRACT.md`; look at `design-reference/codeorbit_constellation_concept.png` (mood only).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `1.4` Glassmorphism Panel System, `1.5` Custom CSS Scroll Bar, `1.8` Light/Dark/Cosmic Themes, `1.9` Customisable Accent Colour
**Platform / reference / concept items:** `PLT-18` Constellation design-system foundations
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-10, FC-11 (platform use: custom properties, accent switching), FC-17 (transition tokens)

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Default Obsidian look and every existing class name used by pages/tests (`btn`, `btn--primary`, `card`, `status-chip`, orbit classes); `DESIGN.md` token table as the source of truth for default values.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/styles/tokens.css | Add semantic `--c-*` aliases, glass, elevation, code, diff, atmosphere tokens; keep every old token. |
| src/styles/base.css | Scrollbar styling (`scrollbar-width: thin; scrollbar-color`, `::-webkit-scrollbar`), `color-scheme` per theme. |
| src/styles/components.css | Rebase component colours on `--c-*`; add `.glass` surfaces for Card variants. |
| index.html | Inline early-boot script (≤ 30 lines, try/catch around storage) setting `data-theme/accent/contrast/motion` on `<html>`. |
| src/main.tsx | Call `applyAppearance` from stored settings when available. |
| DESIGN.md | Document final theme values, accent presets, glass rules, contrast results. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/styles/themes.css | Theme and accent overrides; imported after tokens. |
| src/core/a11y/contrast.ts (+ test) | `contrastRatio(fg, bg)`, `relativeLuminance`, parse hex/rgb(a) with alpha compositing. |
| src/core/settings/appearance.ts | `applyAppearance`, `readEarlyAppearance`, `writeEarlyAppearance` (key `codeorbit:settings:early`). |
| src/core/ui/*.tsx | The components above (incl. `StatusChip`, `ProgressRing`, `ProgressBar`, `DockedPanel`), each with a `*.test.tsx` (roles, keyboard, states, axe). |
| src/core/ui/icons/* | Curated inline-SVG icon registry (`IconId`), decorative by default (`aria-hidden`) with an optional accessible label; used by the constellation (`10` §3). |
| src/styles/orbit-tokens.css | `--orbit-*` tokens per theme/accent/contrast (see `10` §19); values are starting values verified by the contrast test, not asserted. |
| src/pages/UiGallery.tsx | Dev-only route `/__ui` (guarded by `import.meta.env.DEV`) rendering every component × state × theme for visual QA. |

## 7. Implementation steps (execute in order)

1. Inspect current `tokens.css`, `components.css`, usage of colour literals (`grep -rn "#[0-9a-fA-F]\{3,8\}" src/styles src/components`). List literals to tokenise.
2. Add `--c-*` aliases; migrate component CSS to aliases without changing computed values (verify by DOM/style snapshot of key elements).
3. Write `contrast.ts` and the matrix test first (red). Define Starlight and Aurora values from `04` §1.3 and the five accents; adjust until green; record final values in `DESIGN.md`.
4. Implement `themes.css` and `applyAppearance`; add the early-boot script; test that reload applies attributes before React mounts (jsdom: script executes on document).
5. Add glass surfaces with fallbacks; verify with `@supports not (backdrop-filter: blur(1px))` branch and `[data-contrast='high']`.
6. Build `core/ui` components one at a time; each follows the state list in `04` §2. Replace existing ad-hoc markup only where trivially equivalent; leave others.
7. Build `/__ui` gallery; inspect all 3 themes × default accent + one alternative at 1280/820/390/320 px; fix defects.
8. Add the `--orbit-*` tokens, `StatusChip`, `ProgressRing`, `ProgressBar`, `DockedPanel` and the icon registry; add star/hub/line-style specimens to `/__ui`; extend the contrast matrix test with every state glyph/label tuple (text AA, glyph ≥ 3:1).
9. **Visual QA (mandatory, `08` G3):** run the app; capture `/__ui` screenshots at 1280×800, 820×1180, 390×844, 320×640 for 3 themes × default + one alternative accent, high contrast included; look at them and compare with `04` and `design-reference/codeorbit_constellation_concept.png` (palette/glow mood only); fix defects and re-inspect.
10. Update `DESIGN.md`; run full gates.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

```ts
export type ThemeId = 'obsidian' | 'starlight' | 'aurora'
export type AccentId = 'violet' | 'teal' | 'amber' | 'rose' | 'azure'
export type ContrastMode = 'normal' | 'high'
export interface Appearance { theme: ThemeId; accent: AccentId; contrast: ContrastMode }
export function applyAppearance(a: Appearance, root = document.documentElement): void
// Early record (tiny JSON): { v: 1, theme, accent, contrast, motion }
```
Every accent × theme pair defines `--accent`, `--accent-hover`, `--accent-soft`, `--accent-wash`, `--on-accent`.

## 9. UI/UX expectations

Follow `04` §1–§3 exactly. Default (Obsidian + violet) must look the same as today. Orbit tokens express the constellation mood (deep indigo field, restrained glow) but only inside orbit components — they must not change any existing screen. Glass appears only on elevated surfaces (menus, palette, panels, dialogs) — not on the whole page. No pure white flash on load in dark themes.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Unsupported `backdrop-filter` → opaque raised surface. Storage unavailable in early script → silently use defaults. Invalid stored values → defaults (tested).

## 11. Security and performance

Early script is inline and tiny (CSP-safe: no `eval`). Use `transform`/`opacity` only for transitions. No new dependencies.

## 12. Required tests and regression checks

- `contrast.test.ts`: known pairs (e.g. #000/#fff = 21:1), alpha compositing, and the full matrix with thresholds from `04` §1.3.
- `appearance.test.ts`: apply/read/write, invalid input, early script behaviour.
- Component tests for each `core/ui` component: roles, keyboard (Tabs arrows/Home/End, Toggle space), disabled/aria-disabled, axe.
- Regression smoke from Stage 01 green.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Contrast matrix test passes for 3 themes × 5 accents × 2 contrast modes with the thresholds in `04` §1.3.
- [ ] Switching theme/accent/contrast via `applyAppearance` visibly restyles Home, Track, Lesson, Quiz, Practice, Progress, Review (inspected at four viewports; findings recorded).
- [ ] Default appearance is visually unchanged from baseline (side-by-side description in report).
- [ ] All `core/ui` components pass axe and keyboard tests; `/__ui` exists in dev only (production build does not contain the route).
- [ ] Scrollbars are thin and themed; glass fallbacks verified in a test for `[data-contrast='high']`.
- [ ] `--orbit-*` tokens exist for every theme, accent and high-contrast; the contrast test covers every node-state glyph/label tuple; `StatusChip`, `ProgressRing`, `ProgressBar`, `DockedPanel` and the icon registry pass axe and keyboard tests and appear in `/__ui`.
- [ ] Visual evidence (screenshots looked at, compared, defects fixed and re-inspected) is recorded, or the report says VISUAL: NOT VERIFIED and the exit gate stays closed (`08` G3).

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

Reference `pages.css` additions (status chips, achievement cards, mastery nodes) are tokenised later in Stages 11/12/15; do not import them now. Avoid the sibling-margin pattern (`.rules + .card--quiet`) when tokenising (`05` defect 13).

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Information architecture, routes, copy, orbit geometry, behaviour of any component beyond styling.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_02_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 02: Design system v2: tokens, themes, accents, glass surfaces, scrollbars`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 03 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
