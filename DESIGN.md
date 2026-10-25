# CodeOrbit — DESIGN.md

Premium dark learning atelier: quiet obsidian surfaces, warm near-white text, cool muted secondary text, controlled lavender accent, lime reserved for genuine success/progress. CodeOrbit is a language-neutral learning platform where HTML is the first optional track module. The celestial motif lives in the **Learning Orbit** and in truthful progress moments only; lessons and the practice lab stay plain and readable. A read-only reference snapshot is maintained at `docs/antigravity/reference/`.

All values below are the real tokens in `src/styles/tokens.css`, `src/styles/themes.css`, and `src/styles/orbit-tokens.css`. Change them there and here together.

---

## 1. Themes (`data-theme` on `<html>`)

CodeOrbit supports three full themes verified against WCAG AAA/AA contrast criteria:

| Token | Obsidian (default dark) | Starlight (light) | Aurora (teal dark) | Description |
|---|---|---|---|---|
| `--bg` | `#111219` | `#f7f6fb` | `#0d1517` | Canvas/page background |
| `--surface` (`--c-surface-1`) | `#191b25` | `#ffffff` | `#142024` | Primary cards, sidebars |
| `--surface-raised` (`--c-surface-2`) | `#222533` | `#f0eef8` | `#1b2b30` | Hover states, secondary buttons |
| `--surface-high` (`--c-surface-3`) | `#292c3c` | `#e6e3f3` | `#23373d` | Modals, active tabs, floating panels |
| `--border` | `#2e3142` | `#d3cfe6` | `#2b4047` | Subtle structural division |
| `--border-strong` | `#404459` | `#b0a9cd` | `#3d5861` | Interactive borders, focus boundaries |
| `--text` | `#f4f2f8` | `#17151f` | `#eaf6f5` | Primary headings and body text |
| `--text-muted` | `#a7a9bc` | `#4a4660` | `#a3bfc0` | Secondary body text (≥ 4.5:1 on all surfaces) |
| `--text-quiet` | `#9a9db3` | `#5f5a7a` | `#7e9d9e` | Captions, meta (≥ 3:1 on all surfaces) |
| `--success` | `#c3f477` | `#2d7a10` | `#4ade80` | Real milestones, passing checks |
| `--warning` | `#f2b85b` | `#9e5b00` | `#f59e0b` | Advisory alerts, warnings |
| `--danger` | `#ff7f7f` | `#c42b2b` | `#f87171` | Errors, failed criteria, reset |
| `--on-danger` | `#2a0e0e` | `#ffffff` | `#250909` | Text on danger background |

---

## 2. Accent Presets (`data-accent` on `<html>`)

Each preset defines `--accent`, `--accent-hover`, `--accent-soft`, `--accent-wash`, `--on-accent` per theme. All pairs meet WCAG AA (≥ 4.5:1 for `--on-accent` on `--accent`) and UI component standards (≥ 3:1 on surfaces):

| Preset | Dark Themes (`obsidian`, `aurora`) `--accent` | Starlight `--accent` | On-Accent (Dark / Light) |
|---|---|---|---|
| `violet` (default) | `#9a8bff` | `#5b45e0` | `#14121f` / `#ffffff` |
| `teal` | `#5fd6c6` | `#0d8276` | `#06201c` / `#ffffff` |
| `amber` | `#f2b85b` | `#a15c00` | `#241600` / `#ffffff` |
| `rose` | `#ff8fb1` | `#c92a58` | `#290a14` / `#ffffff` |
| `azure` | `#7db4ff` | `#1c68d4` | `#09182d` / `#ffffff` |

---

## 3. Glassmorphism & High-Contrast Fallbacks (1.4)

Glass panels (`.glass-panel`, `.card--glass`) provide layered depth:
- Tokens: `--glass-bg` (surface at 68–72% alpha), `--glass-border` (white 10% alpha in dark, 15% in light), `--glass-highlight` (inset 1px white highlight), `--glass-blur: 14px`, `--glass-saturate: 1.15`.
- Progressive enhancement: `@supports (backdrop-filter: blur(1px))` provides glassmorphism. When unsupported, falls back to opaque `--surface-raised`.
- High-contrast mode (`data-contrast="high"`):
  - Completely disables backdrop filters (`backdrop-filter: none !important`).
  - Sets opaque background `--surface-raised`.
  - Elevates borders to ≥ 4.5:1 (`#9494b8` in dark, `#403c58` in light).
  - Elevates text to ≥ 12:1 (`#ffffff` in dark, `#000000` in light).
  - Removes glow shadows (`--glow-active: none`).

---

## 4. Custom Thin Scrollbars (1.5)

- Modern standard: `scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);`
- WebKit support: `::-webkit-scrollbar` width/height 8px, rounded thumb with padding box.
- Themed thumb colors: `--scrollbar-thumb` uses `--border-strong`, hovering to `--text-quiet`.

---

## 5. Constellation Foundations Tokens (10 §19)

Foundational orbit tokens defined across themes and high-contrast modes:
- `--orbit-field`: radial-gradient background for the constellation view.
- `--orbit-hub-glow`: soft radial glow behind the active track hub.
- `--orbit-ring`: subtle circular guide rings (8–12% opacity).
- `--orbit-star-size: 56px`: standard topic star diameter.
- `--orbit-hub-size: 140px`: track hub diameter.
- Node state colors:
  - `--orbit-star-completed`: `#c3f477` (dark) / `#2d7a10` (light).
  - `--orbit-star-progress`: active accent.
  - `--orbit-star-available`: `#f4f2f8` (dark) / `#17151f` (light).
  - `--orbit-star-locked`: `#a7a9bc` (dark) / `#4a4660` (light).
- Connector line styles:
  - Prerequisite connection: dashed (`6 4`), `--orbit-edge-prereq`.
  - Curriculum order path: dotted (`1 6`), round caps, `--orbit-edge-order`.
  - Active selection path: bright solid, `--orbit-edge-active`.

---

## 6. Contrast Matrix Verification Results

Automated contrast calculation (`src/core/a11y/contrast.ts`, `src/test/contrast.test.ts`) verifies:
- Body text on `--bg`: 16.8:1 (Obsidian), 16.8:1 (Starlight), 16.7:1 (Aurora) — passes ≥ 7:1 (AAA).
- Muted text on `--bg` and all surfaces: ≥ 4.5:1 across all 3 themes.
- Quiet text on all surfaces: ≥ 3:1 across all 3 themes.
- All 15 accent combinations: accent on surface ≥ 3:1; `--on-accent` on `--accent` ≥ 4.5:1.
- Constellation state glyphs & labels: text AA (≥ 4.5:1) and glyphs (≥ 3:1).
- High contrast mode: text ≥ 12:1, borders ≥ 4.5:1.

---

## 7. Core UI Components

Extracted in `src/core/ui/`:
- `Button`: variants `primary`, `secondary`, `ghost`, `success`, `danger`, `danger-ghost`; sizes `sm`, `md`, `lg`; icon slots; loading state.
- `IconButton`: accessible name required; tooltip on hover/focus (Esc dismisses).
- `Card`: variants `default`, `feature`, `quiet`, `glass`; optional header/footer.
- `GlassPanel`: backdrop-filtered glass with high-contrast fallback.
- `Tabs`: roving tabindex with ArrowLeft/Right/Home/End keyboard navigation.
- `Toggle`: switch input with accessible label binding.
- `Select`: styled native dropdown with custom chevron.
- `Segmented`: radio group control with arrow key navigation (Map/List toggle).
- `Tooltip`: accessible tooltip popup on hover/focus.
- `Kbd`: styled keyboard shortcuts.
- `Skeleton`: placeholder shimmer with reduced-motion static override.
- `StatusChip`: icon + text chip (never color alone).
- `ProgressRing`: SVG circular indicator with progressbar ARIA semantics.
- `ProgressBar`: horizontal indicator with progressbar ARIA semantics.
- `DockedPanel`: bottom docked drawer for tablets and responsive layouts.
- `Drawer`: modal sliding drawer with focus trap, backdrop, and Esc close.
- `Icon`: curated inline-SVG icon registry (`check`, `lock`, `play`, `sparkles`, `orbit`, etc.).
- Dev-only visual catalog at `/__ui` (`src/pages/UiGallery.tsx`).
