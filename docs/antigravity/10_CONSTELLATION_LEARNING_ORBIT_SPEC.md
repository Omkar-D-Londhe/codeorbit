# 10 — Constellation Learning Orbit: Specification

**Status: APPROVED by the owner as the primary visual and interaction model of the Learning Orbit** (decisions L-23…L-26 in `01_PRODUCT_AND_ARCHITECTURE.md` Part A; logged in `07` §5). This file is the single detailed specification. Stage 02 (tokens/components), Stage 04 (starfield backdrop) and Stage 10 (map, in two sub-stages 10a prototype and 10b roll-out) implement it. Where a stage file and this file disagree, raise it in the stage report; locked decisions in `01` still win.

> **Nothing described here has been implemented or tested.** Every "must" is an instruction for Antigravity. No pass/fail result, screenshot or performance figure exists yet; the pack must never be quoted as evidence that any of this works.

## 0. What changed and what stays

| Topic | Before | Now |
|---|---|---|
| Primary Learning Orbit geometry | Upward-opening semicircular arc (∩) with nodes at equal arc length; modes `arch / arch-compact / carousel` (former L-01, L-04) | **Celestial constellation map**: a central track hub, topic stars (nodes) laid out on a deterministic spiral/ring in a pannable, zoomable field, with prerequisite connections, orbit paths and a topic-details panel (L-23). The arc requirement is **superseded for the primary Learning Orbit**. |
| Node placement | Equal arc length on the arc; depends on ids and width | Deterministic from the ordered topic ids, an optional authored override and the container's aspect bucket; **never** from selection or progress (L-02 amended) |
| Synchronised navigation | Legacy strip ↔ legacy arch share one selected id | **Preserved and extended**: map ↔ topic stepper ↔ list view ↔ details panel share one `selectedTopicId` (L-03 amended) |
| Prerequisite connectors | Only declared `prerequisiteIds`; curriculum order is not a dependency | **Preserved** and made visually distinct from the curriculum-order path (L-24) |
| Roving tabindex / key model | Left/Right/Home/End along the strip | Preserved in the stepper and list; map adds spatial arrow navigation (§7.4) |
| Carousel mode | Cards when the arc could not fit | Replaced by the **list view** and the **stepper** (§8); FC-24 (carousel pattern) is now met by the stepper plus the JavaScript gallery exercise |
| Mastery Map (catalog 11.1, Stage 15) | Separate analytic graph | **Unchanged and still required.** The constellation is the *navigation* map; the Mastery Map is the *analytic* graph (layered prerequisite depth, optional force view). They share the state-derivation helper (§5) but not layout code. |
| Everything else | — | Unchanged: all 29 stages, security, truthfulness, honest reporting, stage-by-stage execution |

## 1. The concept image and how to use it

File: `design-reference/codeorbit_constellation_concept.png` (see `design-reference/README.md`). It is a **concept reference**, not an asset.

### 1.1 Take from the image (composition and mood)

- A **large central hub** (the technology) with a soft ringed glow and the track name/subtitle beneath it.
- **Topic stars** as glassy spheres, each with an icon, a two-digit curriculum number above a title, and a status line beneath; arranged around the hub on a flowing ring, **counter-clockwise from the top**.
- **Thin, faint connection lines** (dotted/dashed) over a **deep violet/indigo starfield and nebula**; restrained glow; one strong highlight on the selected/active star.
- Status vocabulary: **completed** (green check), **in progress** (progress ring with `done/total`), **locked** (lock icon + the word "Locked").
- A **right-hand details column** with: selected-topic card (title, "Topic n of N", status chip, description, primary **View Topic →** button) and a **Your Progress** card (ring "x of N", legend counts, percentage bar).
- A **bottom pager** (previous/next arrows with progress dots) and an **Orbit View / List View** toggle plus an expand control.
- A small **explanatory hint card** ("Click on a star to begin your journey").

### 1.2 Adapt (follow the intent, not the pixels)

| Image element | What to build |
|---|---|
| Distinct icon per topic | A curated inline-SVG icon registry (`core/ui/icons`); a topic may name an icon id, otherwise its number is shown. No icon font or network icon CDN. |
| Counter-clockwise ring | Deterministic spiral layout (§4), counter-clockwise from the top, so topic 01 is at the top. |
| "Locked" | A **derived, advisory** state (§5; decision O-16). Never stored. |
| `3/5`, `0/6` on nodes | The real `parts / partsTotal` from `topicProgress()` (lesson, quiz, practice = up to 3 parts). Never a made-up total. |
| Technology list in the left column | The app's real track switcher (a `Select`/`Segmented` in the track header fed by `TrackRegistry`). Tracks that are not `available` are labelled with their true availability (`Preview`, `Planned`, …), never "Coming soon" unless that is the real state. |
| "Your Progress" card | Real `trackProgress()` numbers. Counts must sum to the topic count. |
| "Learning Journey" tips card | Becomes a compact **Legend** card (node states, solid/dashed/dotted line types). No marketing copy. |
| Expand control | A CSS "expanded map" overlay that hides the details column, with `Esc` to return (no Fullscreen API dependency). |
| Planets, asteroids, bright galaxy swirl | Decorative layers only, drawn with CSS/SVG gradients in the backdrop (Stage 04 `Starfield`/`Nebula`); omitted under reduced motion/high contrast. **Do not crop or embed the concept PNG.** |

### 1.3 Do NOT copy (defects and fake controls in the image)

- **Topic names and count.** The image shows "Introduction, Text & Headings, Lists & Links, Images & Media, Tables, Forms, Semantic HTML, Meta & SEO, Project, Accessibility, Best Practices, Next Steps". **These are not the real topics.** The real HTML track has 12 topics: `html-structure`, `elements-attributes`, `headings-paragraphs`, `text-semantics`, `lists`, `links`, `images`, `tables`, `forms`, `semantic-layout`, `accessibility`, `putting-together` (and the real prerequisites in `curriculum.ts`). **Always render real data.**
- **Two topics numbered "08"** (Project and Meta & SEO) — a defect in the image. Numbers come from the topic's position in the ordered list.
- The image's panel counts (Completed 3, In Progress 1, Locked 8 → 12) leave "Tables 0/6" unexplained — a node cannot show a progress ring and have no category. Real counts use the four derived states in §5 and always sum to N.
- The top navigation (Learn / Practice / Assess / Progress / Atlas), notification bell with unread dot, user avatar "S", and the global search chip: **none are in the agreed information architecture**; a bell and an avatar would be fake controls (L-08). The real shell (sidebar/rail, command palette from Stage 13) is unchanged.
- "Coming soon" labels on Python/Java/C++ as if buildable now — availability is what the registry says.
- The exact colours/gradients: use the project tokens (`04`); the image is a mood reference.

## 2. Anatomy of the constellation map

Render order (back to front): **backdrop** (starfield, nebula wash — decorative, `aria-hidden`) → **zone halos** (10b) → **orbit rings** (decorative dotted ellipses) → **curriculum-order path** → **prerequisite connections** → **trail / pulse** (10b, transient) → **hub** → **topic stars + labels** → **you-are-here marker** (10b) → **map controls** (zoom, fit, expand) overlay.

| Element | Meaning (must be truthful) | Accessibility |
|---|---|---|
| Hub | The technology/track (`Technology.id`). Selecting it clears the topic selection and shows the track overview in the panel (name, description, progress, **Continue** = `nextAction()`). It is **not** a topic. | `<button>` named "<Track> track overview" |
| Topic star | Exactly one real `Topic.id` | `<button>` per node (§13) |
| Prerequisite connection | One declared entry of `Topic.prerequisiteIds` (prerequisite → dependent) | `aria-hidden`; relations are text in the panel and live region |
| Curriculum-order path | Position order in the track's `topicIds` (faint dotted). **Not a dependency.** | `aria-hidden` |
| Orbit ring | Pure decoration | `aria-hidden` |
| Zone halo (10b) | A topic **group** (`TopicGroup`) region; label on the outer edge | label is a button; text exposed in list view |
| Progress arc on a star | `parts / partsTotal` of that topic | text beside it ("1 of 3 steps") |

### 2.1 Distinguishing line types (never colour alone)

- Prerequisite connection: **dashed** (6 4), 1.5 px, brightness rises on focus/selection of either endpoint, small mid-point chevron showing direction.
- Curriculum-order path: **dotted** (1 6, round caps), 1 px, lower opacity, no chevron.
- The Legend card explains both. A test asserts that the two classes differ in dash pattern.

## 3. Data model

The constellation never invents data. It is computed from the track's existing topics, groups, prerequisites and the learner's state.

```ts
// src/core/orbit/constellation/types.ts
export type NodeState = 'completed' | 'in-progress' | 'available' | 'locked'   // derived, never stored
export type TopicStatus = 'not-started' | 'in-progress' | 'completed' | 'mastered' // existing (lib/progress.ts)

/** Optional authored presentation hints. Absent hints fall back to the deterministic layout and the topic number. */
export interface ConstellationTopicMeta {
  topicId: string                  // MUST equal an existing Topic.id of this track (validated)
  icon?: IconId                    // from core/ui/icons; absent ⇒ show the topic number
  x?: number; y?: number           // authored position in the virtual space (all-or-nothing per track)
}
export interface ConstellationTrackMeta {
  trackId: string                  // Technology.id
  hubIcon?: IconId
  topics?: ConstellationTopicMeta[]
}

export interface LayoutNode {
  topicId: string                  // real Topic.id
  index: number                    // 0-based position in the ordered topic list (display number = index + 1, zero-padded)
  x: number; y: number             // virtual coordinates
  angle: number                    // radians, for label side
  labelSide: 'left' | 'right' | 'top' | 'bottom'
  groupId: string                  // Topic.groupId
}
export interface LayoutEdge { fromId: string; toId: string; d: string; kind: 'prerequisite' }       // from prerequisiteIds only
export interface OrderLink  { fromId: string; toId: string; d: string }                             // consecutive topics
export interface ConstellationLayout {
  aspect: 'landscape' | 'portrait'                         // bucket derived from the container
  width: number; height: number                            // virtual space: landscape 1200×800, portrait 800×1100
  hub: { x: number; y: number; r: number }
  nodes: LayoutNode[]; edges: LayoutEdge[]; order: OrderLink[]
  rings: Array<{ id: string; rx: number; ry: number }>     // decorative
}
export interface NodeView {                                // what a star renders (pure function of layout + state)
  topicId: string; state: NodeState; status: TopicStatus
  parts: number; partsTotal: number                        // from topicProgress(); never invented
  missingPrerequisiteIds: string[]                         // declared prerequisites not yet completed
  selected: boolean
}
export interface ViewTransform { x: number; y: number; zoom: number }  // zoom is relative to "fit" (1 = fit); range 0.75–3
```

### 3.1 Pure functions (all unit-tested, no DOM, no clock, no randomness)

```ts
validateConstellation(track: { topics: Topic[]; groups: TopicGroup[] }, meta?: ConstellationTrackMeta): ValidationIssue[]
//   every meta.topicId exists; every prerequisiteId exists in the track; prerequisites form a DAG; topic count ≤ 42; ids unique;
//   authored positions are all-or-nothing and inside the virtual space.
computeConstellationLayout(topics: Topic[], aspect: 'landscape' | 'portrait', meta?: ConstellationTrackMeta): ConstellationLayout
deriveNodeState(topic: Topic, progress: TopicProgress, completedIds: ReadonlySet<string>): { state: NodeState; missingPrerequisiteIds: string[] }
fitTransform(layout: ConstellationLayout, container: { w: number; h: number }, padding?: number): ViewTransform
clampTransform(t: ViewTransform, layout: ConstellationLayout, container: { w: number; h: number }): ViewTransform  // keeps ≥ 25% of the field visible
nextNodeInDirection(layout: ConstellationLayout, fromId: string, dir: 'left' | 'right' | 'up' | 'down'): string | null
aspectBucket(container: { w: number; h: number }): 'landscape' | 'portrait'  // portrait when h/w > 1.1, with hysteresis 0.05
```

**Truthfulness rules (L-24).**
1. Every node maps to a real `Topic.id`; the number of nodes equals the track's topic count.
2. Every connection corresponds to an entry in a topic's declared `prerequisiteIds`. The layout adds no relationship. Authored `ConstellationTopicMeta` cannot add edges.
3. `NodeState`, counts, `parts/partsTotal` and percentages are computed from `topicProgress()`/`trackProgress()`; they are never persisted, never fabricated and never seeded.
4. Selecting a node sets `state.selectedTopicId` (existing action `SELECT_TOPIC`) and nothing else; opening a lesson/quiz/practice uses the existing routes (`/lesson/:topicId`, `/quiz/:topicId`, `/practice/:challengeId`) via `lib/routes`.

## 4. Deterministic layout

Positions depend only on **(a) the ordered topic ids, (b) optional authored coordinates, (c) the aspect bucket**. They never depend on selection, progress, hover or the pan/zoom state (L-02 amended).

1. Virtual space: landscape 1200×800, portrait 800×1100. Hub at the centre with radius 110 (landscape) / 90 (portrait).
2. `n` = topic count. `turns = ceil(n / 14)` (1–3). For `i = 0 … n-1`, `t = i / n`:
   - `angle = -90° - 360° · turns · t` (counter-clockwise from the top in screen coordinates),
   - `rf = 1 - depth · t`, with `depth = 0.12` when `turns = 1` else `0.42`, and a floor so the node ring never enters the hub exclusion zone (hub radius + 70),
   - `x = cx + rx · rf · cos(angle)`, `y = cy + ry · rf · sin(angle)`, with `(rx, ry) = (470, 290)` landscape or `(300, 450)` portrait,
   - a small deterministic organic offset `±6%` of the radius from `sin(i · 2.4)` (no `Math.random`).
3. **Collision relaxation:** up to 8 fixed iterations of pairwise separation until every pair of node centres is ≥ 96 virtual units apart (a test asserts this for `n ∈ {1, 2, 6, 12, 13, 28, 42}` in both aspects). Order of operations is fixed so results are bit-stable.
4. `labelSide`: `right` if `x > cx + 80`, `left` if `x < cx - 80`, else `top` when above the hub, `bottom` when below.
5. Edges: for each topic and each `prerequisiteIds` entry, a quadratic Bézier from prerequisite to dependent whose control point is the midpoint pulled 25% toward the hub. Order links: the same construction between consecutive indices.
6. Authored coordinates (`x`/`y`) replace steps 2–3 only when **all** topics of the track have them.
7. Maximum 42 topics per constellation in v1. A track with more topics must be grouped into sub-tracks or raise a decision in `07`; `validateConstellation` fails otherwise.

## 5. Node states

Derived by `deriveNodeState` from the existing four `TopicStatus` values (unchanged, L-15) plus declared prerequisites.

| State | Rule (first match) | Star visual | Text (always shown, never colour-only) |
|---|---|---|---|
| `completed` | `status` is `completed` or `mastered` | solid success-tinted sphere, **check badge**; `mastered` adds a star badge | "Completed" / "Mastered" |
| `in-progress` | `status === 'in-progress'` (a real part exists or the topic was touched with progress) | accent sphere with a **progress arc** `parts/partsTotal` | "1 of 3 steps" |
| `available` | `not-started` and every declared prerequisite is completed (or none exist) | neutral bright sphere, soft pulse **only on first view of the page when motion is allowed** (decorative; off under reduced motion) | "Ready to start" |
| `locked` | `not-started` and at least one declared prerequisite is **not** completed | dimmed sphere, **lock badge**, 60% opacity of the icon (contrast still ≥ 3:1 for the glyph, text AA) | "Locked — complete <Title(s)> first" |

- A topic with real progress is **never** shown as locked, even if a prerequisite is incomplete.
- **O-16 is resolved: locked topics are advisory.** A topic with incomplete prerequisites is labelled "Locked" and the details panel says "Recommended first: …", but the learner can still open the topic. Do **not** block or redirect `/lesson`, `/quiz`, or `/practice` based on prerequisite completion. This owner-confirmed behavior is recorded in `07`.
- Counts in "Your Progress": completed (including mastered), in progress, ready, locked. They sum to `n`. Percent complete = completed / n, rounded down, never 100% unless every topic is completed.
- `NodeState` is a presentation of progress; it is never written to storage.

## 6. Panels, controls and navigation surfaces

### 6.1 Topic-details panel (selected topic)

Contents (all real): title; "Topic *n* of *N*"; status chip (icon + text); description (`Topic.description`); group name; **primary button "View topic"** → `/lesson/:topicId`; **action row** with *Lesson*, *Quiz*, *Practice* buttons that deep-link to the existing routes, each with a real state hint (lesson done / quiz best score `x of y` / practice `m of k` challenges completed); prerequisites ("Requires", linked) and dependents ("Unlocks", linked), both from `prerequisiteEdges`/`dependentsOf`; "Recommended first: …" when advisory-locked; the three progress parts as a checklist with text states.

- Practice link target: the first challenge of the topic that is not completed, else the first challenge.
- Nothing is shown that the data cannot support (no estimate text without Stage 12/P-07 rules; no fake "time left").
- When no topic is selected the panel shows the **track overview** (hub selected): name, description, progress ring and counts, **Continue** (from `nextAction()`), and the Legend.
- Panel is an `aside` landmark; the selected topic's name is its heading; selection changes are announced politely.

### 6.2 "Your Progress" card, Legend card

Progress card: ring (`role="img"` with a text alternative "3 of 12 topics completed"), four counts with icons, a percentage bar (`role="progressbar"` with `aria-valuenow`). Legend card: four node states, mastered badge, dashed vs dotted line types, current-topic ring. Both are plain, compact cards (`04` Card).

### 6.3 Topic stepper (synchronised navigation, preserved)

Previous / Next buttons with a dot row: one dot per topic when `n ≤ 14`, otherwise "Topic 5 of 28" with a thin progress bar. Dots are buttons (roving tabindex, ≥ 24 px hit area expanded to 44 px) in curriculum order, labelled with the topic title and state; the selected dot is `aria-current`. Previous/Next change the selection and bring the node into view (animated only when motion is allowed; trail in 10b). Scrolling or panning the map never changes the selection (L-03).

### 6.4 View toggle and track header

Segmented control **Map** / **List** (stored as a per-viewer UI preference in `localStorage` key `codeorbit:ui:orbit-view`, wrapped in try/catch; **not** learner data, no schema change). Track header: track `Select` (from `TrackRegistry`), topic count and one-line description, view toggle, and the expand button.

### 6.5 Map controls

Zoom in, zoom out, **Fit** (reset), **Expand** — icon buttons ≥ 44 px with `aria-label`s and tooltips; they work with mouse, touch and keyboard. They are the only control surface needed for pan/zoom; gestures are an enhancement.

## 7. Interaction model

### 7.1 Pointer (mouse/pen)

- **Hover/focus a star:** scale ≤ 1.08 (transform only), label emphasised, compact tooltip (title, state, steps), and its prerequisite/dependent connections brighten (others fade to 25%).
- **Click/Enter/Space a star:** select it (does not navigate). **Click the primary button** (or double-click a star, a shortcut only) to open the lesson.
- **Drag on empty space:** pan (pointer capture, 4 px drag threshold so clicks still select). Cursor `grab/grabbing`.
- **Ctrl/⌘ + wheel** or trackpad pinch: zoom around the pointer. **Plain wheel scrolls the page** (the map must not trap scrolling); a one-time hint explains the modifier.
- Double-click on empty space: no action.
- No inertia when motion is reduced.

### 7.2 Touch

- One-finger drag on empty space: pan. Two-finger pinch: zoom (two active pointers). Tap a star: select. Tap the primary button: open.
- The map surface sets `touch-action: none` **only inside the map box**; the box has a bounded height on coarse pointers (§9) so the page remains scrollable around it, and the zoom/fit buttons and the List view are always available.
- Targets ≥ 44×44 px and ≥ 8 px apart at the default fit for ≤ 14 topics at 320 px portrait (the layout test asserts spacing; denser tracks default to List view, P-12).

### 7.3 Pan/zoom model

- State `ViewTransform { x, y, zoom }`, zoom relative to *fit*, range **0.75–3**, step 1.25× on buttons and `+`/`-`.
- Applied as a single CSS `transform` on the map content wrapper through a ref + CSS variables updated in `requestAnimationFrame`; **no React re-render per pointer move**.
- `clampTransform` keeps at least 25% of the field in view; `Fit` recomputes `fitTransform`.
- Labels: at zoom < 0.9 on narrow containers (< 768 px), only the number is shown except for the selected/focused star; ≥ 0.9 labels appear.
- The transform is **not persisted** (resets per visit, and on track change).

### 7.4 Keyboard

The map region is one tab stop (roving tabindex on the stars; the hub and controls are separate tab stops).

| Key (focus on a star) | Action |
|---|---|
| Arrow keys | Move focus to the **nearest star in that direction** (`nextNodeInDirection`); the viewport auto-pans to keep it visible |
| `PageDown` / `PageUp` | Next / previous topic in **curriculum order** |
| `Home` / `End` | First / last topic |
| `Enter` / `Space` | Select the focused star |
| `Shift` + Arrows | Pan by 80 px |
| `+` / `-` / `0` | Zoom in / out / fit (also when the map region has focus) |
| `Esc` | Leave expanded mode, close tooltip; never discards selection |
| `Tab` | Leaves the map to the next control (stepper, panel) — no trap |

Focus is always visible (L-11). Focus never moves on selection except by the user's own keystroke. An `aria-live="polite"` region announces "Selected: <title>, <state>" and, after a 300 ms debounce, "Requires: … Unlocks: …".

## 8. List view (fallback and equivalent, L-25)

An ordered list (`<ol>`) in curriculum order, grouped under `TopicGroup` headings: each row is a button-like item with number, title, state icon + text, a steps meter (`parts/partsTotal`), and a **View topic** link; the selected row has `aria-current="true"`. Selecting a row selects the same `selectedTopicId`, updates the details panel and, when the view is switched back to Map, the map shows the same selection and brings it into view. Rows show "Requires: …" text. The list is complete (every topic, every action) so that a learner never needs the map. Keyboard: Up/Down/Home/End roving, Enter selects, Tab reaches the row's link.

## 9. Responsive layouts

| Viewport (tested) | Layout | Map | Details | Notes |
|---|---|---|---|---|
| ≥ 1100 px (1280×800, also 1440×900) | Sidebar 240 + map + **right column 320–340 px** | height = available (≥ 560); labels on | Right column: selected card, Your Progress, Legend | Stepper bottom-centre; toggle and expand bottom-right of the map |
| 768–1099 px (820×1180) | Icon rail 76 + single column | height clamp(460px, 56vh, 640px); labels on for selected + hovered, numbers otherwise when zoom < 0.9 | **Docked panel below the map** (card stack, 2-column grid for progress/legend) | Stepper under the map |
| 480–767 px | Top bar + bottom nav | height clamp(360px, 60vh, 520px); numbers + selected label | Panel below the map in normal flow; selecting a star scrolls the panel's heading into view only if it is off-screen | Portrait aspect bucket |
| < 480 px (390×844, 320×640) | As above | Map when `n ≤ 14` (default), else **List** (P-12); user choice always wins | Panel below, one column | Portrait aspect; ≥ 44 px targets; no horizontal page scroll; font scale 150% must not clip |

Never rely on a media query alone for map density; labels follow zoom and container size. The **Expanded** overlay hides the panel and shows controls and the stepper only.

## 10. Motion and reduced motion

Allowed motion (all interaction-driven, one-shot, `transform`/`opacity`/`stroke-dashoffset` only): focus/hover scale, pulse on a **real** progress save (2.1), trail on non-adjacent selection (2.2), animated pan-to-node, subtle star twinkle (off by default; follows the Stage 04 atmosphere toggle), available-node soft glow.

With `prefers-reduced-motion: reduce` or Settings → Motion = reduce: **no** twinkle, glow animation, pulse, trail, animated pan/zoom, inertia or parallax; a state change is shown by an instant 2 px ring. Hover scale stays but has no transition. High-contrast mode: no starfield/nebula, solid 2 px borders, thicker connections. A test asserts the animation classes/attributes are absent in reduce mode.

## 11. Rendering technology decision (P-11)

**Decision: SVG for connections/rings/zone halos and decorative backdrop; real DOM `<button>` elements, absolutely positioned inside a CSS-transformed wrapper, for hub and topic stars; CSS gradients for the starfield/nebula.** No canvas, no WebGL, no 3D engine, no new runtime dependency for the map (custom pointer handling, ≈ 300–450 lines).

Why: native focus, labels, hit-testing and touch targets; text scales with font settings; screen readers get real controls; simple to test in jsdom; ≤ 42 elements is trivially cheap for the DOM; SVG keeps lines crisp at every zoom.

**Escalation (only with evidence).** Move *edges and backdrop* (not the buttons) to a `<canvas>` layer only if, on the documented reference device profile, the 42-node fixture shows p95 frame time > 16.7 ms or > 3 long tasks per 10 s of panning **after** memoisation and `will-change` tuning. Record the measurement in `07` and obtain owner approval first. A WebGL or 3D engine (three.js etc.) is **out of scope**; proposing one needs a demonstrated need and owner approval.

## 12. Performance requirements

- Map code + CSS ≤ **25 kB gzip** added to the route chunk (lazy-loaded with the Track route; Stage 17 code-splitting keeps it out of the initial bundle when Stage 17 lands). Record the real size.
- Layout computed once per `(topic ids, aspect bucket, meta)` and memoised; node components are memoised by `NodeView` equality; **no re-render of nodes during pan/zoom**.
- Pan/zoom frames use only `transform`; rAF-throttled; listeners removed on unmount; observers disconnected.
- No long task > 50 ms during selection, pan or zoom on a mid-range device profile (measure with the Performance panel or a scripted trace; if not measured, write **NOT VERIFIED**).
- Starfield: static SVG/CSS; ≤ 150 star dots; twinkle uses ≤ 12 animated dots and only when allowed.
- Idle CPU ≈ 0 when the tab is hidden or the map is off-screen.

## 13. Accessibility requirements

- Map wrapper: `role="group"`, `aria-label="Learning Orbit map for <Track>, <N> topics"`. Backdrop, rings, connections, halos: `aria-hidden="true"`.
- Each star is a `<button>` with an accessible name `"<number> <Title>. <State text>"`, `aria-current="true"` when selected, `aria-describedby` linking its state/steps text. The hub is a button.
- Roving tabindex across stars (one tab stop); spatial arrows; order keys (§7.4). No keyboard trap; visible focus ring (2 px `--focus`, 2 px offset) that is not clipped by `overflow` (the map wrapper pads for the ring).
- Status never colour-only: icon + text for every state (L-11); text contrast AA in all themes; glyph/UI component contrast ≥ 3:1 (verified with `contrast.ts` for every theme × accent × state tuple).
- Pan/zoom have button and keyboard alternatives; gestures are optional.
- Live regions: polite selection announcement and debounced relations text; no announcement on load.
- List view and the details panel are the screen-reader-first equivalents; both reachable from the map region in one Tab.
- 200% zoom and 150% font scale: labels may wrap, never clip; the toolbar wraps; no horizontal scroll at 320 px.
- Touch targets ≥ 44 px; spacing ≥ 8 px.

## 14. Required prototype before roll-out (Stage 10a)

A **working prototype on the real CodeOrbit architecture and representative HTML topics** must exist, be tested, be visually inspected and be **accepted by the owner (decision O-15, hard gate)** before Stage 10b rolls the constellation out.

### 14.1 Prototype scope (10a)

- Built under `src/core/orbit/constellation/` using real code: `TrackRegistry` (`html` track), real `Topic`/`TopicGroup` data and prerequisites, `topicProgress()`/`trackProgress()`, `state.selectedTopicId` with `SELECT_TOPIC`, real routes via `lib/routes`, `core/ui` components from Stage 02, tokens, motion hook from Stage 04.
- Mounted on the **real Track page** behind a URL flag (`/learn/html?orbit=constellation`); the legacy orbit stays the default until 10b. The flag is removed in 10b.
- Renders the real 12-topic HTML track. The **representative set** used for fixtures and screenshots: `html-structure` (root, no prerequisites), `elements-attributes` and `headings-paragraphs` (first branches), `links` and `lists` (leaves from different branches), `accessibility` (two prerequisites: `semantic-layout`, `images`), `putting-together` (four prerequisites). Together they cover every connection pattern in the real data.
- Includes: layout, hub, stars, labels, the four states, prerequisite and order lines, selection, details panel with real actions, progress card, legend, stepper, Map/List toggle and list view, expand, pan/zoom with pointer, touch and keyboard, responsive layouts, reduced-motion behaviour.
- Excludes (10b): pulse, trail, zone halos, magnify tooltip polish, you-are-here marker, mini constellation, search highlight (Stage 13), final polish, removal of the legacy arc, roll-out to all tracks.
- **State fixtures for inspection:** a dev-only route `/__ui/orbit` (absent from production builds) renders the map with injected, clearly labelled **fixture** progress covering all four states plus a mastered node. Fixture data is never written to storage and never appears on real routes. The real app is also driven through real actions (completing a lesson, a quiz and a check) to inspect the live path.

### 14.2 Prototype evidence package (for the owner)

`docs/antigravity/status/STAGE_10a_STATUS.md` plus `docs/antigravity/status/screenshots/stage-10a/`: screenshots at 1440×900, 1280×800, 820×1180, 390×844, 320×640 for: default selection, each node state, selected star with highlighted connections, list view, expanded view, reduced motion, high contrast; a comparison table against the concept image (§15.3); test and command results; known defects; items **NOT VERIFIED**. The owner records approval, requested changes or rejection in `07` (O-15). Antigravity does not start 10b without a recorded "approved".

## 15. Mandatory visual QA gate (L-26)

Applies to **10a, 10b, Stage 02 (tokens/components), Stage 04 (backdrop), Stage 16 (accessibility sweep) and Stage 29**, and to any stage that changes how the orbit looks. It extends `08` G3 and `09` §5.

### 15.1 Procedure

1. Run the real application (`npm run dev`, or `npm run build && npx vite preview`).
2. With browser tooling (Playwright/Antigravity browser), capture screenshots at **1440×900, 1280×800, 820×1180, 390×844, 320×640** into `docs/antigravity/status/screenshots/<stage>/<viewport>-<state>.png` using a committed script (`e2e/orbit-visual.spec.ts`).
3. **Open and look at each screenshot** (do not infer from the DOM), and open `design-reference/codeorbit_constellation_concept.png` beside them.
4. Complete the comparison and defect tables below, fix visible defects, re-capture, and re-inspect.
5. Exercise hover, focus, selected, locked, in-progress, completed, empty (zero topics), error (invalid track data) and loading states.
6. If any step cannot be done (no browser tool, no image viewing), **write NOT VERIFIED with the reason**. Visual acceptance stays incomplete; the stage exit gate stays **closed** unless the owner explicitly accepts the gap in writing.

### 15.2 Evidence table (copy into the status report)

| Viewport | State | Screenshot file | Observed | Defect found | Fix | Re-inspected? |
|---|---|---|---|---|---|---|

### 15.3 Comparison with the concept (qualitative, content differs by design)

| Check | Match / Deviation / N/A | Note |
|---|---|---|
| Hub at the centre with glow ring and track name | | |
| Stars on a flowing counter-clockwise ring from the top, no overlaps | | |
| Number + title + status line readable beside every star | | |
| Completed / in-progress / locked glyphs distinct without colour | | |
| Faint prerequisite and order lines; selected star's lines brighter | | |
| Palette and glow restrained, in the project tokens | | |
| Starfield/nebula decorative, text over it passes contrast | | |
| Details column: title, topic n of N, status chip, description, View topic | | |
| Progress card ring, counts, bar match real state | | |
| Pager/stepper and Map/List toggle present and working | | |
| No clipped labels, no overflow, no horizontal page scroll at 320 px | | |
| No fake controls (bell, avatar, "Assess" tab, fabricated topics) | | |

### 15.4 Defect classes that must be checked

Alignment, spacing, typography, hierarchy, density, label collisions, overlap of stars/labels, clipping at the field edge, focus ring clipping, tooltip overflow, unreadable text over the nebula, low-contrast locked states, hit-target size, jank during pan, pinch jitter, scroll trapping, panel overflow, expanded-mode escape, theme/accent/high-contrast breakage, reduced-motion leaks.

## 16. Test plan (names are requirements; add more)

| File | Tests |
|---|---|
| `constellation/layout.test.ts` | determinism (same input ⇒ identical output); independence from selection/progress (positions equal across states); counter-clockwise from the top; min spacing ≥ 96 for n ∈ {1, 2, 6, 12, 13, 28, 42} in both aspects; hub exclusion; label sides; authored override all-or-nothing; > 42 rejected |
| `constellation/connections.test.ts` | edges equal the multiset of `prerequisiteIds` of the real HTML track (compared with `prerequisiteEdges()`; the baseline data has 15 edges for 12 topics, but the test derives the number, never hard-codes it); no edge for curriculum order; order links are consecutive pairs; edge/order dash classes differ; missing prerequisite id reported by `validateConstellation` |
| `constellation/state.test.ts` | table test for all four states incl. mastered; in-progress with an incomplete prerequisite is not locked; counts sum to n; derived from `topicProgress`; nothing persisted |
| `constellation/navigation.test.ts` | `nextNodeInDirection` on the real layout and a synthetic grid; order keys; Home/End; `fitTransform`/`clampTransform` bounds; zoom limits |
| `ConstellationMap.test.tsx` | renders one button per topic with correct names/states (HTML track); click/Enter/Space selects (`SELECT_TOPIC`) and the panel updates; selection syncs with stepper and list; **View topic**, Lesson, Quiz, Practice hrefs equal `lib/routes` outputs for every HTML topic; locked topic shows "Recommended first" and is still openable (O-16 default); hub selection shows track overview with **Continue** equal to `nextAction()` |
| `ConstellationMap.pan-zoom.test.tsx` | drag pans past 4 px and does not select; click selects; ctrl+wheel and buttons zoom within limits; Fit resets; pinch with two pointers zooms; plain wheel does not call `preventDefault`; pan never changes selection |
| `ConstellationMap.a11y.test.tsx` | axe zero serious/critical in all states and in list view; roles/names; roving tabindex; no keyboard trap; live-region messages; decorative layers `aria-hidden`; focus ring not clipped (class/padding assertion) |
| `ConstellationMap.responsive.test.tsx` | container sizes 1280/820/390/320 (ResizeObserver mock): aspect bucket, label policy, default view rule P-12, stepper dots vs "Topic n of N", panel placement |
| `ConstellationMap.motion.test.tsx` | reduce mode: no pulse/trail/twinkle classes; instant pan; high contrast removes backdrop |
| `ProgressCard.test.tsx` | numbers equal `trackProgress()`; sums to n; percent never 100 unless all complete |
| `e2e/orbit-visual.spec.ts` | screenshot script (see §15), plus smoke: select via click and keyboard, switch to list and back, reload keeps `selectedTopicId`, no horizontal overflow at 390/320 |
| Regression | the existing orbit **intent** tests (selection, keyboard bounds, only declared edges) are ported to the new components before the legacy arc is removed; test count never decreases except for the superseded geometry tests listed in §17 |

## 17. Superseded geometry and legacy handling

- **L-01 (upward ∩ arc)** and **L-04 (modes derived from arc geometry)** are **superseded** by L-23 for the primary Learning Orbit. L-02 and L-03 are **amended** (not removed): see `01` Part A.
- The baseline's `orbitGeometry.ts` arc functions (`computeOrbitLayout`, `chooseOrbitMode`, arc `edgePath`), `OrbitArch.tsx`, `TopicStrip.tsx` and `orbit.geometry.test.ts` **remain untouched and routed as the default until 10a is accepted (O-15)**, so the application never loses its orbit mid-work.
- In **10b only**, after O-15 is recorded as approved: the legacy arc components are removed from the route, and the tests that assert *arc-specific* geometry (arc positions, equal arc length, upward opening, `arch*/carousel` mode derivation) are retired with a recorded supersession note in `docs/DECISIONS.md` (citing L-23 and O-15). This is the **only** sanctioned deletion of existing tests. Tests of intent that survive (selection, keyboard bounds, "only declared prerequisites", no selection-dependent positions) are **ported**, not dropped. The count of retired tests is stated in the status report.
- No document in this pack asks for arc geometry for the primary orbit. The arc may appear only in (a) the baseline audit describing the original, (b) this supersession record, and (c) the legacy handling above.

## 18. How other stages relate

| Stage | Relationship |
|---|---|
| 01 | Locks the baseline including the legacy orbit tests; adds `e2e` smoke (selection by click/keyboard works for whichever orbit is current) |
| 02 | Adds `--orbit-*` tokens and the components in §19 |
| 03 | Settings schema unchanged for the map (view preference is a per-viewer UI key) |
| 04 | Adds `Starfield` (seeded, static) and per-track `--nebula-tint` used by the hub glow |
| 10a / 10b | Implement this file |
| 11 | Pulse hook consumes real XP/status events |
| 12 | Dashboard track cards link into the constellation; mini progress uses the same derivation |
| 13 | Orbit search highlight (2.8) dims non-matching stars to 45% without moving them |
| 15 | Mastery Map (analytic graph) is separate; reuses `deriveNodeState` |
| 16 | Accessibility audit includes the constellation, list view and keyboard model |
| 19 | Atlas entries FC-15/17/18/24 cite the constellation where it truthfully applies |
| 21–27 | Every new track provides topics/groups/prerequisites (+ optional `ConstellationTrackMeta`); no per-track map code; `validateConstellation` in the track structure test; ≥ 13-topic fixture checked |
| 29 | Final visual QA sweep (§15) over every available track |

## 19. Design-system additions (Stage 02) used here

Tokens: `--orbit-field` (backdrop gradient stops), `--orbit-hub-glow`, `--orbit-ring`, `--orbit-star-size` (56 px; hub 140 px at fit), `--orbit-star-completed`, `--orbit-star-progress`, `--orbit-star-available`, `--orbit-star-locked`, `--orbit-edge-prereq`, `--orbit-edge-order`, `--orbit-edge-active`, `--orbit-label`, `--orbit-halo` (zones). Values are *starting values* chosen inside `04`; contrast is verified by test (never asserted).

Components: `StatusChip` (icon + text), `ProgressRing`, `ProgressBar`, `Segmented` (view toggle), `IconButton`, `Tooltip`, `Drawer/DockedPanel` (panel below the map on tablets), the icon registry `core/ui/icons`. Each has states default/hover/active/selected/focus-visible/disabled and a `/__ui` gallery entry.
