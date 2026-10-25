# 06 — Frontend Concepts: Applied in CodeOrbit, Taught by its Tracks

## 1. Requirement and principle

CodeOrbit must **apply** the frontend concepts students learn — not only teach them and not only list them in assessment documents. Each concept below is mapped to (a) a *real runtime use inside the platform*, where one is natural, (b) a *track lesson, live demonstration and coding exercise* that teaches it, and (c) *tests*. A concept with no natural platform use is marked **teaching-only**; it is never faked into the UI.

**Separation rule (locked, see 01 Part A, L-14).** The platform itself is React + TypeScript + Vite + custom CSS. The technologies it *teaches* (HTML, CSS, JavaScript, Bootstrap, Angular, later languages) live in separate track modules (`src/tracks/<id>`) with their own content, runners and validators. The platform never gets rewritten in a taught technology (no Bootstrap in the core, no Angular shell) merely to "demonstrate" it; the taught technology is demonstrated *inside the track's sandbox* (iframe preview or Worker).

## 2. What is known about the course (evidence and its limits)

- Course named in the learner's submissions: **CSI3029 Front End Design and Testing (Lab)** (from `docs/ASSESSMENT_COMPLIANCE.md` in the reference ZIP).
- Available evidence: the reference ZIP's coverage table, built from the learner's completed lab PDFs (screenshots of code and output) for assessments 01–03, 05–20, 22, 29, 34–41 (others only checked at cover level), plus blueprint §19 (a planning hypothesis).
- **Not available:** the Frontend Design Lab and Testing Lab question sheets and marking criteria; therefore **every course-specific mapping below is `pending-review`**. Nothing is "verified". Per the owner's instruction this is a supporting activity: **it never blocks a stage**. Stages implement the concept coverage that the evidence and agreed product requirements already justify; anything uncertain is listed as pending in the stage report.
- To close a row later: compare it with the original question wording, record the question number and evidence in `docs/ASSESSMENT_COMPLIANCE.md` (Stage 29 consolidates).

## 3. Concept application map

Legend — **Platform use**: where CodeOrbit's own UI genuinely uses the concept (real files/features, existing or planned). **Teach**: track + topic where lessons, live demo and exercise live. **Gap** = the reference compliance table found the concept untaught. **Status** is course-verification status (all `pending-review`) plus implementation status.

### 3.1 HTML (track `html`)

| ID | Concept (course evidence) | Platform use | Teach: lesson + live demo + exercise | Tests | Stage | Impl. status |
|---|---|---|---|---|---|---|
| FC-01 | Document structure, `title` (01–02) | Single-page shell: `index.html`, `<main>`, landmarks | topic `html-structure`; `ch-html-structure` | existing `validators.test.ts`, `curriculum.test.ts` | exists; 21 | Implemented |
| FC-02 | Headings, paragraphs, text formatting incl. `b i u mark sup sub kbd strong em q cite` (05–06) | Lesson typography (`h1` per page, `kbd` in shortcuts modal, `mark` for search highlights 9.2, `sup/sub` in complexity notation `O(n²)` rendering) | topics `headings-paragraphs`, `text-semantics` — **extend** with `mark`, `sup`, `sub`, `u` (gap) + new challenge | rule tests for new tags; search-highlight test asserts `<mark>` | 13, 21 | Partial (gap) |
| FC-03 | Lists incl. nested (03) | Navigation `<ul>`, command palette listbox, achievements list | topic `lists`; **add nested-list requirement** (challenge currently checks flat lists only) | validator test for nested `ul>li>ul` | 21 | Partial (gap) |
| FC-04 | Images, `alt`, `width/height`, `figure/figcaption` (07–08, 10, 18) | Emblem/progress SVG with text alternatives; share card image (12.5) with alt | topic `images`; `ch-images` | existing | exists | Implemented |
| FC-05 | Links, `target=_blank`, `rel`, fragment links (09, 11) | Skip link (`#main`), TOC fragment links (4.7), external-link safety | topic `links`; `ch-links` | existing + TOC fragment test | 08 | Implemented / extend |
| FC-06 | Tables incl. `rowspan/colspan` (03, 10) | Challenge attempt heat table (12.4) is a real data table with `caption`, `th scope` | topic `tables` — **add `rowspan/colspan`** (gap; keep the lesson note that table layout is discouraged) | rule + table a11y test | 15, 21 | Partial (gap) |
| FC-07 | Form controls: text/email/password/radio/checkbox/select/date/tel/file; `required`, `pattern`, `minlength/maxlength` (20, 22) | Settings (radio theme, checkbox/toggle, select pace, `time` reminder, `range` font scale, `file` import), custom-challenge creator (17.7), notes, search | topic `forms` — **extend** with radio, checkbox, select, date, tel, file, `pattern`, `minlength/maxlength` (gap) + exercises | controls-labelled rule tests; Settings form a11y tests | 03, 14, 18, 21 | Partial (gap) |
| FC-08 | `audio`, `video` (20, 22) | Voice-read lesson audio control (17.10, speech synthesis — not an `<audio>` element, so *teaching-only* for the element) | **new topic** `media-elements`: demo with small `data:` media; exercise requires `controls`, `src`/`source`, fallback text, `track` captions | rule tests | 21 | **Gap — new** |
| FC-09 | Semantic regions `header nav main footer article section aside` (12–19) | Shell landmarks, lesson `article`, study `aside` | topic `semantic-layout`; `ch-semantic-layout` | existing | exists | Implemented |

### 3.2 CSS (track `css`)

| ID | Concept | Platform use | Teach | Tests | Stage |
|---|---|---|---|---|---|
| FC-10 | Selectors, properties, inline styles, hover colour (11–19) | Design tokens, `:hover/:focus-visible` states | CSS track topics `selectors`, `cascade-specificity`, `pseudo-classes`; live demo edits a rule and shows result | CSS rule validators (computed-style via sandbox preview probe) | 22 |
| FC-11 | Box model, spacing, borders, colours, typography | Token scale, cards, theme switch (1.8), accent switch via CSS custom property (1.9 — a real, user-visible use of CSS variables) | topics `box-model`, `colour-typography` | tests + token contrast test | 02, 22 |
| FC-12 | `float` layout (11–19) | **teaching-only** (platform uses flex/grid; no fake use) | topic `float-and-clear` (legacy layout, marked as such) | rule tests | 22 |
| FC-13 | Flexbox | Shell, toolbars, nav, tab lists | topic `flexbox` + live "flex playground" demo | tests | exists/22 |
| FC-14 | Grid | Dashboard (3.x), achievement gallery, Mastery list | topic `grid` + demo | tests | 12, 22 |
| FC-15 | Positioning (static/relative/absolute/fixed/sticky) | Constellation stars (absolutely positioned buttons inside a transformed wrapper, Stage 10), Mastery nodes (absolute), sticky study panel/TOC, fixed nebula layer | topic `positioning` | tests | 04, 10, 22 |
| FC-16 | Responsive design, media queries | Shell breakpoints, Orbit mode derived from geometry, device frames (6.6) | topic `responsive-design`; exercise passes only with a working `@media` rule (checked in 375/768 px frames) | frame-render tests | 06, 22 |
| FC-17 | Transitions and animation | Constellation star hover/focus scale, pulse (2.1), trail (2.2), pan-to-node, toasts, all gated by reduced motion | topic `transitions-animations`; exercise with `prefers-reduced-motion` requirement | rule tests + reduced-motion tests | 10, 22 |

### 3.3 JavaScript (track `javascript`)

| ID | Concept | Platform use | Teach | Tests | Stage |
|---|---|---|---|---|---|
| FC-18 | Events: `click`, `mouseover`, `keydown`, `input` (29, 34–39) | Constellation pointer/touch/keyboard handling (drag-to-pan, wheel/pinch zoom, spatial arrow keys, roving tabindex), magnify on hover (2.5), command-palette shortcuts (9.1), splitter drag (6.2) | topic `events`; demos run in the Worker/iframe-preview with a DOM-event harness (Stage 23 defines the safe harness) | event tests; platform keyboard tests | 06, 10, 13, 23 |
| FC-19 | DOM manipulation / dynamic rendering, galleries (34–39) | Live preview, quiz results, search results | topic `dom`; sandbox preview with scripts requires a **separate, stricter iframe mode** (see decision C-05) | harness tests | 23 |
| FC-20 | Input validation and feedback (35–39) | Settings validation, import validation, challenge validator, quiz validation | topic `validation` | tests | 03, 23 |
| FC-21 | Arrays and objects, structured data | `TrackModule`, curriculum, state | topic `data-structures-basics` (feeds complexity analysis later) | tests | 01, 23 |
| FC-22 | Functions, reuse | Pure core libraries (geometry, streak, mastery) | topic `functions` | tests | 23 |
| FC-23 | Conditionals and control flow | Hints gating, recommendations, soft difficulty gates (6.10) | topic `control-flow` | tests | 23 |
| FC-24 | Image gallery / carousel pattern | Constellation **topic stepper** (previous/next + dot pager, Stage 10; replaces the retired carousel mode), device-frame toggle | exercise "build a gallery" | tests | 23 |
| FC-25 | Browser persistence (`localStorage`) | Versioned storage, drafts, notes, settings | topic `web-storage` (sandbox gets an in-memory storage shim; real storage never exposed to learner code) | tests | 03, 23 |

### 3.4 Bootstrap, Angular, testing, tooling

| ID | Concept | Platform use | Teach | Tests | Stage | Status |
|---|---|---|---|---|---|---|
| FC-26 | Bootstrap navbar (40–41) | none (core stays custom CSS; L-14) | Bootstrap track topic `navbar` with self-hosted Bootstrap CSS injected into the **iframe document** only | rule tests (`.navbar`, `.navbar-toggler`, `aria-expanded`) | 24 | pending-review |
| FC-27 | Authentication-style forms (login/registration UI) (40–41) | none (no real auth; non-goal) | topic `auth-forms`: presentation + client-side validation only; exercise states clearly "no real authentication" | rule tests | 24 | pending-review |
| FC-28 | Bootstrap grid, utilities, components, responsive breakpoints | none | topics `grid-system`, `utilities`, `components` | rule tests | 24 | pending-review |
| FC-29 | Angular: components, templates, binding, routing, services | none | **Decision-gated** (needs in-browser build or restricted preview; no course evidence found) | — | 27 | **pending — no evidence** |
| FC-30 | Front-end **testing** (Testing Lab — content unknown) | CodeOrbit's own Vitest suites; the platform shows requirement/test results (7.x) | JS-track challenges graded by visible unit-test cases; HTML/CSS graded by requirement rules; a topic `testing-basics` (assertions, test cases, expected vs actual) | test-runner tests | 23 | pending-review |
| FC-31 | Local dev environment (XAMPP/localhost, 01) | n/a for a Vite app | optional HTML-track note "Serving a page locally" | — | 21 | not-required (unconfirmed) |
| FC-32 | Keyboard interaction and accessibility | Everything (L-11) | HTML topic `accessibility`; a11y linter (6.7) | axe + keyboard tests | all | Implemented / ongoing |

## 4. The Concept Atlas (Stage 19) — making the application of concepts real and checkable

A page `/concepts` (and Settings → "How CodeOrbit is built") lists every FC row:

```ts
interface ConceptEntry {
  id: string                       // 'FC-13'
  title: string; summary: string   // authored, short
  platformUse?: { feature: string; route?: string; sourceFiles: string[]; selectors?: string[] }  // real, optional
  teachIn: Array<{ trackId: string; topicId: string; challengeId?: string }>
  evidenceTests: string[]          // vitest file names
  courseStatus: 'pending-review' | 'verified' | 'not-required'
}
```

**Honesty tests (Stage 19)**: every `sourceFiles` path exists; every `selectors` string matches at least one element on the named route in a rendered test; every `teachIn` ids exist in the registered tracks (or the track's availability is not `available`, in which case the Atlas shows "Planned"); every `evidenceTests` file exists; no entry is `verified` without a recorded assessment reference. An entry with no `platformUse` shows "Teaching topic — CodeOrbit itself does not need this technique", never an invented use.

Each Atlas entry offers: "See it in CodeOrbit" (navigates to the route and briefly outlines the element with a reduced-motion-safe, dismissible highlight), "Learn it" (lesson), "Try it" (challenge), and "Under the hood" (links to documented design decisions; not the source in production).

## 5. Where this lands in the stage plan

Concept rows are carried as IDs in each stage's scope (`FC-xx`) and in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`. A stage that touches a concept's platform use or track content must keep the row's tests green and update the Atlas entry (from Stage 19 on). Stage 19 builds the Atlas and back-fills entries for everything already built; Stages 21–27 add the track-side content and tests; Stage 29 reviews `courseStatus` and consolidates `docs/ASSESSMENT_COMPLIANCE.md` without blocking release on `pending-review` rows.
