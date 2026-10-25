# CodeOrbit — DESIGN.md

Premium dark learning atelier: quiet obsidian surfaces, warm near-white text, cool muted secondary text, controlled lavender accent, lime reserved for genuine success/progress. CodeOrbit is a language-neutral learning platform where HTML is the first optional track module. The celestial motif lives in the **Learning Orbit** and in truthful progress moments only; lessons and the practice lab stay plain and readable. A read-only reference snapshot is maintained at `docs/antigravity/reference/`.

All values below are the real tokens in `src/styles/tokens.css`. Change them there and here together.

## Colour tokens
| Token | Value | Use |
|---|---|---|
| `--bg` | `#111219` | page background |
| `--surface` / `--surface-raised` / `--surface-high` | `#191b25` / `#222533` / `#292c3c` | cards, controls, hover/active surfaces |
| `--border` / `--border-strong` | `#2e3142` / `#404459` | hairlines / control outlines |
| `--text` | `#f4f2f8` | primary text |
| `--text-muted` | `#a7a9bc` | secondary text (≥ 7:1 on `--bg`, ≥ 5:1 on `--surface-high`) |
| `--text-quiet` | `#9a9db3` | meta text; AA on all surfaces |
| `--accent` / `--accent-soft` / `--accent-hover` | `#9a8bff` / `#c4baff` / `#aa9eff` | primary action, selection, focus ring |
| `--on-accent` | `#14121f` | text on accent (≈ 7:1) |
| `--success` | `#c3f477` | completed / mastered / correct only |
| `--warning` / `--danger` | `#f2b85b` / `#ff7f7f` | storage notices, incorrect, destructive |

Status is never colour-only: every state also has an **icon/shape and a text label** (circle “Not started”, dashed ring “In progress”, check “Completed”, star “Mastered”, ✓/✗ + “Met/Not met”, “Correct answer/Your answer” tags).

## Typography (self-hosted via `@fontsource-variable`, no remote requests)
- UI: **Inter Variable** — body 16px/1.6, small 14px, meta 13px (nothing smaller).
- Display: **Fraunces Variable** — page titles and key headings only (`--font-display`).
- Code: **JetBrains Mono Variable** — 14.4px/1.65 in editor and code blocks.
- Lesson reading measure: `72ch`.

## Space, shape, depth
4px base scale (`--s-1…--s-12`). Radii 6 / 10 / 14. Borders carry structure; one soft shadow (`--shadow-1`). Active-node glow is the only glow (`--glow-active`).

## Breakpoints
| Range | Shell | Orbit | Lesson | Practice |
|---|---|---|---|---|
| ≥ 1100px | 240px sidebar | full arch with labels (≥ 900px wide container) | 2 columns + sticky study panel (≥ 900) | brief column + editor/preview/coach |
| 768–1099px | 76px icon rail | arch, labels only on selected node | stacked / tabs under 900 | stacked |
| < 768px | top bar + bottom nav | **carousel of cards** | tabs | 4 tabs: Brief / Editor / Preview / Feedback |

The Orbit mode is **derived from geometry**, not hard-coded: `chooseOrbitMode()` returns `carousel` if any two nodes would be closer than 56px (44px target + 12px gap), `arch-compact` if node/label boxes collide, else `arch`.

## Learning Orbit rules
- Upper half-ellipse (∩). Nodes placed at equal **arc length**, so spacing is even. Positions depend only on ordered topic IDs and container width (rounded to 8px) — never on selection.
- Strip and arch share one selected ID. Scrolling the strip never changes selection; selection from the arch scrolls the strip only if the item is not comfortably visible. Edge fades are `pointer-events: none`.
- Connectors are drawn **only** for declared `prerequisiteIds`; faint by default, bright for the selected topic. The arc itself is curriculum order, not a dependency (stated in the legend).
- Node states: number (not started) · dashed ring showing steps done (in progress) · check badge (completed) · star badge (mastered). Selected: filled accent + small glow ring.
- Keyboard: roving tabindex; arrows/Home/End move in curriculum order, clamped (no looping); focus stays in the navigator used.

## Components and states
Buttons (primary/secondary/ghost/success/danger/danger-ghost; sm/md/lg), icon buttons, chips/badges, cards (feature/quiet), tabs, toolbar, code block (with working Copy), editor (line gutter; Tab is *not* captured so keyboard users are never trapped), sandboxed preview, dialogs, toasts, empty states, banners. Every interactive control has hover, `:focus-visible` (2px `--focus` outline, 2px offset), active (1px press), disabled (45% opacity + `cursor: not-allowed`).

## Motion
`--t-fast 120ms`, `--t-med 220ms`, `--t-orbit 360ms`, ease `cubic-bezier(.2,.7,.2,1)`. Only interaction-driven: node selection ring/scale, edge highlight, toast entrance, button press. No twinkling, drift, auto-rotation or loops. `prefers-reduced-motion: reduce` removes all transitions/animations and uses instant scrolling (verified in browser).

## Accessibility decisions
Skip link; landmarks; one `h1` per page; focus moves to `<main>` on route change; dialogs trap focus and return it; quiz uses native radios in a `fieldset`; feedback in `role="status"` regions; hidden panels use `hidden`; touch targets ≥ 44px; the iframe has a title.
