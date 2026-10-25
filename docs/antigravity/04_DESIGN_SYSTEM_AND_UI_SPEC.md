# 04 — Design System and UI Specification

Direction: a **premium, professional dark interface with restrained celestial styling**. Surfaces are quiet and layered; lavender (or the chosen accent) marks action and selection; lime appears only for real success; the celestial motif lives in the Learning Orbit, truthful progress moments and the optional atmosphere layer. Lesson text and the practice lab stay plain and readable. Every adjective below is translated into a rule you can implement and test.

Base values already exist in `src/styles/tokens.css` and root `DESIGN.md`. Stage 02 extends them; keep both files in sync with the running app.

## 1. Tokens

### 1.1 Existing (keep)
`--bg #111219` · `--surface #191b25` · `--surface-raised #222533` · `--surface-high #292c3c` · `--border #2e3142` · `--border-strong #404459` · `--text #f4f2f8` · `--text-muted #a7a9bc` · `--text-quiet #9a9db3` · `--accent #9a8bff` · `--accent-hover #aa9eff` · `--accent-soft #c4baff` · `--accent-wash rgb(154 139 255/.13)` · `--on-accent #14121f` · `--success #c3f477` · `--warning #f2b85b` · `--danger #ff7f7f` · `--focus #c4baff`. Spacing `--s-1…--s-12` (4px base). Radii `--r-sm 6px`, `--r-md 10px`, `--r-lg 14px`. Motion `--t-fast 120ms`, `--t-med 220ms`, `--t-orbit 360ms`, `--ease cubic-bezier(.2,.7,.2,1)`. Layout `--sidebar-w 240px`, `--rail-w 76px`, `--content-w 1120px`. z-index `--z-nav 20`, `--z-fade 2`, `--z-dialog 100`, `--z-toast 110`.

### 1.2 Added in Stage 02
- Semantic aliases so components never reference raw palette values: `--c-bg`, `--c-surface-1/2/3`, `--c-border`, `--c-border-strong`, `--c-text`, `--c-text-muted`, `--c-text-quiet`, `--c-accent`, `--c-accent-hover`, `--c-accent-soft`, `--c-accent-wash`, `--c-on-accent`, `--c-success`, `--c-warning`, `--c-danger`, `--c-focus`. Old names remain as aliases until Stage 28.
- Glass tokens: `--glass-bg` (surface at 62–72% alpha), `--glass-border` (1px, white at 8–12% alpha), `--glass-highlight` (inset 0 1px 0 white 6% alpha), `--glass-blur` (14px), `--glass-saturate` (1.15).
- Elevation: `--shadow-1` (existing), `--shadow-2` (menus/palette), `--glow-active` (only for the selected orbit node).
- Atmosphere: `--nebula-tint` (per track), `--grid-opacity` (0.05), `--glow-radius` (320px).
- Code: `--code-bg`, `--code-gutter`, token colours `--tok-keyword/string/number/comment/tag/attr/func/type/punct`, each ≥ 4.5:1 on `--code-bg` in every theme.
- Diff: `--diff-add-bg` (lime at 14%), `--diff-del-bg` (danger at 14%), plus non-colour markers `+` / `−` in a gutter.
- Type scale additions: `--fs-code`, `--fs-small 14px`, `--fs-meta 13px` (nothing smaller than 13px). Font scale multiplier `--font-scale` applied on `html { font-size: calc(100% * var(--font-scale)) }`; all sizes in `rem`.
- Dyslexia-friendly font: self-hosted **OpenDyslexic** or **Atkinson Hyperlegible** (`@fontsource`), toggled with `data-dyslexia="on"` swapping `--font-sans` only (never the code font).

### 1.3 Themes (`data-theme` on `<html>`; defined in `themes.css`)

| Token | Obsidian (default) | Starlight (light) | Aurora (teal dark) |
|---|---|---|---|
| `--bg` | `#111219` | `#f7f6fb` | `#0d1517` |
| `--surface` | `#191b25` | `#ffffff` | `#142024` |
| `--surface-raised` | `#222533` | `#f0eef8` | `#1b2b30` |
| `--surface-high` | `#292c3c` | `#e6e3f3` | `#23373d` |
| `--border` | `#2e3142` | `#d3cfe6` | `#2b4047` |
| `--text` | `#f4f2f8` | `#17151f` | `#eaf6f5` |
| `--text-muted` | `#a7a9bc` | `#4a4660` | `#a3bfc0` |
| `--accent` (violet default) | `#9a8bff` | `#5b45e0` | `#5fd6c6` |
| `--on-accent` | `#14121f` | `#ffffff` | `#06201c` |
| `--success` | `#c3f477` | `#2d7a10` | `#9bf0a0` |

These are starting values. **Stage 02 must verify** with an automated contrast test (WCAG relative luminance, written in `core/a11y/contrast.ts`) that: body text ≥ 7:1 on `--bg`; muted text ≥ 4.5:1 on every surface; accent on every surface ≥ 3:1 (UI) and `--on-accent` on `--accent` ≥ 4.5:1; focus ring ≥ 3:1 on adjacent colours. Adjust values until the test passes and record final values in `DESIGN.md`. High-contrast mode (`data-contrast="high"`) raises text to ≥ 12:1, borders to ≥ 4.5:1, removes glass transparency and glow.

*Pack-QA computation (a throw-away script, WCAG 2.x luminance formula; **not** the Stage 02 test and **not** a visual check):* for the opaque values above, text on `--bg` = 16.8 / 16.8 / 16.7 (Obsidian / Starlight / Aurora); `--text-muted` on `--bg` = 8.0 / 8.4 / 9.5 and on `--surface-high` = 6.0 / 7.1 / 6.4; default accent on `--bg` = 6.7 / 5.8 / 10.5; `--on-accent` on `--accent` = 6.6 / 6.2 / 9.7; `--success` on `--bg` = 14.7 / 5.0 / 13.5. All meet the thresholds stated above for those pairs. **Not computed:** the other four accents on each theme, semi-transparent glass/halo/glow layers, the `--orbit-*` state colours (not yet defined), high-contrast values, hover/focus colours. Stage 02 must compute all of them.

### 1.4 Accent presets (`data-accent`)
`violet #9a8bff` (default) · `teal #5fd6c6` · `amber #f2b85b` · `rose #ff8fb1` · `azure #7db4ff`. Each preset defines `--accent`, `--accent-hover`, `--accent-soft`, `--accent-wash`, `--on-accent` per theme; the contrast test runs the full 3×5 matrix.

## 2. Components (all in `core/ui`, each with documented states)

Every interactive component implements: default, hover, `:focus-visible` (2px `--focus` outline, 2px offset), active (1px press), disabled (45% opacity, `cursor:not-allowed`, `aria-disabled` where focus must remain), loading (where async), error (where input). Hit area ≥ 44×44 CSS px.

| Component | Variants / notes |
|---|---|
| `Button` | primary / secondary / ghost / success / danger / danger-ghost; sm/md/lg; icon-leading/trailing; loading spinner replaced by static text under reduced motion |
| `IconButton` | requires `aria-label`; tooltip on hover/focus (`role="tooltip"`, 500 ms delay, dismiss on Esc) |
| `Card` | feature / quiet / glass; optional header, footer actions |
| `GlassPanel` | `backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate))`; **fallback** `@supports not (backdrop-filter…)` → opaque `--surface-raised`; high-contrast → opaque |
| `Tabs` | roving tabindex, arrow keys, Home/End, `aria-selected`; scrollable on overflow with edge fades (`pointer-events:none`) |
| `Dialog` / `Drawer` | focus trap, return focus, Esc closes, scroll lock, `aria-modal`, `--z-dialog`; Drawer slides from right (disabled motion → instant) |
| `Toast` | `role="status"` (polite) or `role="alert"` (errors); 5 s default, pausable on hover/focus, never the sole channel for critical info |
| `Menu` / `Popover` | arrow-key navigation, typeahead, Esc, focus return |
| `Tooltip` | non-interactive content only |
| `Badge` / `Chip` | status chips use icon + text; never colour alone |
| `ProgressRing` / `ProgressBar` | `role="progressbar"` with value/min/max or `aria-valuetext` |
| `Tag` input | add by Enter/comma, remove by Backspace or button, announce changes |
| `Toggle` / `Select` / `Slider` / `Segmented` | native inputs styled, label association enforced |
| `EmptyState` | icon (static or subtle animated under allowed motion), title, one-line help, primary action |
| `Kbd` | renders shortcut keys; platform-aware (⌘ vs Ctrl) |
| `Splitter` | `role="separator"`, `aria-orientation`, `aria-valuenow`, arrow keys ±2%, Home/End, double-click/button resets |
| `CodeBlock` | syntax-highlighted, copy button with `aria-live` "Copied" confirmation |
| `Skeleton` | static shimmer-free placeholder under reduced motion |

## 3. Layout and responsiveness

| Range | Shell | Orbit | Lesson | Practice |
|---|---|---|---|---|
| ≥ 1100 px | 240 px sidebar | constellation map + right details column 320–340 px, labels on (`10` §9) | 2 columns + sticky study panel / TOC | brief column + editor + preview + feedback |
| 768–1099 px | 76 px icon rail (tooltips on labels) | constellation map, details panel docked below, numbers + selected label | stacked; TOC collapses to a menu | stacked; resizer vertical |
| < 768 px | top bar + bottom nav | constellation map (portrait aspect) or list view per P-12; details below | tabs | 4 tabs: Brief / Editor / Preview / Feedback; fullscreen editor + preview drawer |

Rules: no page-level horizontal overflow at 320 px; content max width `--content-w`; lesson reading measure `72ch`; safe-area insets respected for bottom nav; spacing follows the 4 px scale only.

## 4. Screen compositions

- **Home / Dashboard** (Stage 12): top row = hero progress ring (left, 160 px) + "Continue" card + Daily Challenge card; second row = Topic Group completion cards (grid `repeat(auto-fill,minmax(220px,1fr))`) + streak calendar; third row = recent activity feed + quick actions toolbar. Empty states for new learners (no invented data).
- **Explore**: track cards with truthful availability badges (`Available`, `Preview`, `Planned`, `Decision pending`), capability chips, progress when started.
- **Track (Learning Orbit)**: header (track select, count, Map/List toggle, expand); the **constellation map** with hub and stars; topic stepper; right column with topic details (prerequisites, status, Lesson/Quiz/Practice actions), Your Progress and Legend; group zones (10b); search highlight. Specification: `10`.
- **Lesson**: sticky reading-progress bar (2 px, `role="progressbar"`), TOC sidebar, section bookmarks, definition tooltips, takeaways box, estimated time, a11y sidebox, focus mode.
- **Quiz**: one question at a time; type-specific interaction; result breakdown; XP animation (Stage 11).
- **Practice**: brief | editor | preview | feedback; toolbar with auto-save state, run/check, hints, reveal, fullscreen, snippets, device frames, diff (after reveal), analyse (when a provider exists).
- **Progress / Insights**: velocity chart, heat table, quiz breakdown, time estimates, mastery heatmap, force graph, share card.
- **Review**: error notebook list ↔ flashcard mode, spaced-repetition queue.
- **Notes / Bookmarks**: Markdown-subset editor with preview, tags, folders, export.
- **Settings**: sections Profile · Appearance (theme, accent, contrast, font, atmosphere) · Learning (pace, reminders, gamification) · Editor · Accessibility · Data (export, import, reset, usage meter) · About.
- **Command palette**: centred dialog, 560 px max, glass; input + grouped results; `↑/↓` Enter Esc; `role="combobox"` + `listbox`.

## 5. Atmosphere and motion

| Layer | Spec | Off conditions |
|---|---|---|
| Nebula (1.1) | Fixed, `z-index:0`, behind content; 3 stacked radial-gradients tinted by `--nebula-tint`; one `transform`/`opacity` keyframe loop of 90–120 s (no layout properties). Dashboard/Track only. | reduced motion, setting off, high contrast (static solid), battery-saver (`prefers-reduced-data` where available) |
| Constellation grid (1.2) | SVG pattern or single canvas at 4–6% opacity; cursor brightening via CSS variable updated in `requestAnimationFrame`, max 60 fps, throttled | reduced motion (static grid), touch devices (static), setting off |
| Cursor glow (1.3) | Fixed `::after` with `radial-gradient`, position via CSS variables, 120 ms trailing | touch, reduced motion, setting off (default off) |
| Particles (1.6) | 15–30 dots on Dashboard hero canvas only; paused when tab hidden or hero off-screen (`IntersectionObserver`) | default off; reduced motion; setting off |
| Page transitions (1.7) | View Transitions API when supported, else CSS cross-fade + 8 px rise; ≤ 300 ms | reduced motion; first load; unsupported browsers fall back to instant |

Performance budget for the whole atmosphere stack: ≤ 2 ms scripting per frame on a mid-range laptop, zero layout thrash, CPU idle when hidden. Only `transform` and `opacity` animate. Pulse, trail and XP animations last ≤ 600 ms and run once per event.

**Reduced motion** means: no keyframe loops, no parallax, no transitions longer than 1 ms except opacity fades ≤ 120 ms may be replaced by instant changes, scroll is `behavior:auto`. Implemented globally via `html[data-motion="reduce"]` **and** `@media (prefers-reduced-motion: reduce)` (Settings `motion: 'system'|'reduce'|'full'`; `full` still respects hard OS preference unless the learner explicitly overrides — document this precedence in `DESIGN.md`).

## 6. Learning Orbit visual rules — celestial constellation (L-23; details in `10`)

Visual language: deep indigo/violet field, a glowing hub, glassy stars (spheres) with a thin rim light, faint dashed prerequisite lines and dotted curriculum-order lines, restrained glow, one strong highlight on the selected star. Reference mood: `design-reference/codeorbit_constellation_concept.png` (concept only). All colours come from tokens; glow never carries meaning on its own.

Node states (each = icon/shape **and** text): **completed** = check badge (mastered adds a star badge) · **in progress** = progress arc `parts/partsTotal` · **available** = bright neutral star, "Ready to start" · **locked** = lock badge, dimmed, "Locked — complete … first"; selected = accent ring + glow + connections brightened. Tokens (Stage 02): `--orbit-field`, `--orbit-hub-glow`, `--orbit-ring`, `--orbit-star-size`, `--orbit-star-completed|progress|available|locked`, `--orbit-edge-prereq|order|active`, `--orbit-label`, `--orbit-halo`. Layers in Stage 10b:
- **Star pulse (2.1):** on a real progress save, the node's ring scales 1 → 1.35 → 1 with opacity fade, 520 ms, once.
- **Orbital trail (2.2):** when a **non-adjacent** topic is selected, a glowing curved SVG path draws from the previous to the new star (stroke-dashoffset, ≤ 400 ms) and fades; once per selection, never looped; skipped when there is no previous selection or motion is reduced.
- **Prerequisite lines (2.3):** only declared edges; hovering/focusing a node brightens its incoming and outgoing edges and lists "Requires / Unlocks" in a live region.
- **Group zones (2.4):** soft tinted halos/sectors behind the stars of each `groupId` with a small outer label; clicking the label selects the group's first topic and pans to it; zones never change node positions.
- **Magnify (2.5):** hover/focus scales the star ≤ 1.08×, shows a compact tooltip (title, status, estimate); no layout shift (transform only); touch uses tap-to-select.
- **You-are-here (2.6):** a small ring marker on the learner's `lastVisited` topic, labelled "Last visited" in text for screen readers.
- **Mini constellation (2.7):** a 48×48 px static SVG miniature (hub + star dots at their normalised positions, current topic highlighted) in the breadcrumb bar in lesson and practice views ≥ 768 px; links to the Track page; decorative with a text equivalent "Topic 4 of 12".
- **Search highlight (2.8):** matching nodes ring in accent and non-matching dim to 45% opacity; results count announced.

## 7. Accessibility baseline (applies to every screen)

Landmarks (`header`, `nav`, `main`, `aside`, `footer` where meaningful); exactly one `h1`; skip link; focus moves to `<main>` on route change; dialogs trap and restore focus; all form controls labelled; error text associated by `aria-describedby`; live regions: one global polite announcer (Stage 16) plus local `role="status"`; images/SVG decorative = `aria-hidden`, informative = text alternative; colour never the only carrier; zoom to 200% and text spacing overrides without loss; keyboard shortcuts never fire while typing in inputs and never override browser/AT shortcuts; all custom widgets follow WAI-ARIA Authoring Practices patterns.

## 8. Visual QA checklist (run at 1280×800, 820×1180, 390×844 and 320×640; orbit-affecting stages also 1440×900)

**Mandatory evidence (`08` G3/G11, `09` §5):** run the real app, capture screenshots, look at them, compare with the design references, fix and re-inspect. No evidence ⇒ NOT VERIFIED.

1. No horizontal scroll. 2. No clipped or overlapping text or nodes. 3. Focus ring visible on every control. 4. Hover/active/disabled states present. 5. All three themes × default accent and one alternative accent. 6. High-contrast mode. 7. Font scale 150%. 8. Reduced motion on. 9. Empty, loading, error and populated states. 10. Dark-mode screenshots show no pure-white flashes on load. Record findings in the stage report; fix defects, don't just list them.
