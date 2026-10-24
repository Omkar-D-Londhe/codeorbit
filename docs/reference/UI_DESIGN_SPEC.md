# CodeOrbit — Claude-Owned UI/UX and Visual Design Specification

**Purpose:** This is the canonical visual and interaction specification for CodeOrbit. Claude is responsible for designing and implementing the interface. Google Stitch, Figma, external mock-up tools, exported HTML, and manually prepared screen files are optional—not prerequisites, dependencies, or approval gates.

**Product character:** premium dark learning atelier + celestial knowledge atlas + practical coding laboratory. Professional first, quietly delightful second. This is an educational product, not a game dashboard, generic SaaS admin template, space-themed toy, or copy of W3Schools/LeetCode.

**Primary requirement:** the app must look intentionally art-directed, consistent, polished, and distinctive while remaining exceptionally easy to learn and use. Design the real responsive interface and all working states, not a disconnected set of pretty mockups.

---

## 1. How Claude must use this file

1. Read this file with `docs/CODEORBIT_BLUEPRINT.md`, `docs/DECISIONS.md`, `docs/ASSESSMENT_COMPLIANCE.md`, and `docs/TEST_PLAN.md` before implementation.
2. Treat locked product behaviours below as non-negotiable. Claude may make and document visual choices within those boundaries; it must not silently alter the product scope.
3. Own the end-to-end design: tokens, typography, layout grids, responsive breakpoints, icon language, component states, animation, empty states, error states, and page hierarchy.
4. Create and maintain root `DESIGN.md` as an implementation-ready design system. Do this itself; do not wait for Stitch, a designer, a Figma file, or user approval for ordinary design decisions.
5. Implement the interface in the actual application and then inspect/test the running result. A plan or screenshot is not the deliverable.
6. When browser screenshot/visual inspection is available, inspect every main route at desktop and mobile widths, correct visible flaws, and inspect again. If no visual-browser tool exists, use available local browser/dev-server checks and report the limitation honestly.
7. Keep a short design rationale in `DESIGN.md`; do not spend the majority of the budget repeatedly planning or generating alternative concepts. Make strong decisions once, implement, evaluate, and refine.
8. Preserve source-of-truth priority: original course assessment requirements → locked decisions and product requirements → this design specification → Claude's implementation judgment. If a required assessment cannot be inspected, flag it and continue unaffected work without inventing its contents.

## 2. Art direction

### 2.1 The intended feeling

The interface should feel like entering a carefully crafted digital observatory for learning frontend development: calm, focused, tactile, editorial, technologically precise, and a little magical. The “magic” comes from the Learning Orbit, thoughtful transition details, clear progress feedback, and beautiful code/lab surfaces—not from excessive effects.

The product must feel credible to a university professor during a project review and genuinely pleasant for a student to use repeatedly. It should be polished enough to look deliberately designed rather than generated from a default component library.

### 2.2 Starting colour system

Use the following as a coherent starting palette; Claude may tune values for contrast after inspecting the result, but must keep the overall character and document final values in `DESIGN.md`.

- **Obsidian / app background:** `#111219` or a visually equivalent deep charcoal with a hint of blue-violet.
- **Main surface:** `#191B25`.
- **Elevated surface:** `#222533`.
- **Highest card/panel surface:** `#292C3C`.
- **Main text:** warm near-white around `#F4F2F8`.
- **Secondary text:** cool muted grey-violet around `#A7A9BC`.
- **Quiet text:** at least WCAG AA contrast for the actual type size; never sacrifice legibility to achieve a muted look.
- **Primary accent:** vivid but controlled violet around `#9A8BFF`.
- **Light accent:** soft lavender around `#C4BAFF`.
- **Success / completed / growth accent:** pale acid-lime around `#C3F477`, used sparingly.
- **Warning:** warm amber with sufficient contrast.
- **Error:** clear coral/red with sufficient contrast.
- **Borders:** subtle cool grey-violet, usually low-emphasis; use separation and spacing before heavy outlines.

Do not make every card purple. Use colour to establish hierarchy: neutrals for most surfaces, violet for active/interactive emphasis, lime for selected success/progress moments, and red/amber only for status. Build semantic tokens (`--bg`, `--surface`, `--surface-raised`, `--text`, `--text-muted`, `--accent`, `--success`, `--warning`, `--danger`, border/focus tokens) rather than scattering literal colours.

### 2.3 Typography

Use a clean, highly readable sans-serif for UI and lesson copy, plus a legible monospace for code. A restrained display face may be used for large page headings only if it is available locally through the existing stack or a dependency is justified. Avoid mixing many font families. Establish a deliberate type scale for: display, page title, section title, body, small helper text, metadata, button labels, and code. Do not let supporting text shrink below comfortable reading size. Use code line height and editor text sizes suited to real editing.

### 2.4 Surfaces, geometry, depth

- Use clear spacing and grouping; do not put every section inside a separate outlined card.
- Use mostly crisp geometry with modest rounding (roughly 10–16px for interactive cards/panels, smaller for controls). Avoid a page made entirely of giant pill-shaped cards.
- Use thin borders, subtle tonal shifts, restrained shadows, and a few focused glows.
- Primary CTAs have strong contrast and obvious hover/focus/pressed/disabled states.
- Avoid glassmorphism everywhere, thick gradients, giant blurred blobs, excessive drop shadows, noisy textures, and glowing borders on every element.
- Decorative graphics must not reduce available content width or compete with the title/actions.

### 2.5 Signature motif

Use a restrained celestial vocabulary: tiny star/nodes, fine orbital curves, constellation connectors, local halos, small glints at meaningful milestones, and subtle directional trails triggered by user interaction. Keep it concentrated in the Learning Orbit, technology catalog, a few progress moments, and tasteful dashboard framing. The lesson and code editor remain focused, mostly neutral surfaces. No full-screen starfield is needed.

### 2.6 Iconography and imagery

Use one consistent icon family and stroke weight. Prefer crisp, simple line icons with tooltips for icon-only controls. Do not mix unrelated emoji, stock illustrations, and multiple icon families. Do not use placeholder images as a substitute for real UI design. The app should be attractive without requiring remote images or external APIs.

## 3. Global shell and navigation

Design a coherent application shell shared across the main routes.

### Desktop, approximately 1280–1440px wide

- A persistent left navigation rail/sidebar around 224–248px wide, with the CodeOrbit wordmark, a small custom orbital emblem, and clearly grouped destinations.
- Core navigation: **Home**, **Explore / Technologies**, **My Progress**. Secondary links (when implemented): **Mastery Map**, **Error Notebook**, **Learning Journal**, **Achievements**. Avoid showing destinations that are not implemented; if implemented later, give them a sensible position in the hierarchy.
- A main content canvas with comfortable maximum width and 28–40px page padding where available.
- A compact top area for the current page/breadcrumb and useful controls such as search/help/profile only when these have meaningful behaviour. Do not add empty search boxes or fake notification icons just to fill the header.
- The main title and primary action are easy to find. Sidebar active state is obvious without colour alone.
- Sidebar can collapse on smaller laptops; nav remains keyboard accessible and retains tooltips/labels for icon-only mode.

### Tablet

- Reduce sidebar width or switch to a collapsible navigation drawer, maintaining a visible active route and clear access to core actions.
- Protect content hierarchy: no cramped three-column dashboard cards if two columns would read better.

### Mobile, approximately 360–430px wide

- Use an intentional mobile shell, usually a compact top bar plus bottom navigation for 3–5 primary destinations, or a clearly labelled drawer if it better fits the current route.
- Keep the primary task visible without a long decorative header.
- Avoid nested scrolling wherever possible. Only topic strips and editor panels may use clearly bounded horizontal/independent scrolling when essential.
- All touch controls should have comfortable targets (aim around 44px), and functionality must not depend on hover.

### Global interaction states

Every clickable control needs hover where supported, focus-visible, active/pressed, disabled, and loading states where appropriate. Forms need validation/error/success states. Buttons must use labels that describe their result. Toasts and dialogs need accessible announcement/focus behaviour. Any unsaved edits must be protected by autosave or a clear unsaved-state warning.

## 4. Screen-by-screen design instructions

### 4.1 Home / learning dashboard (`/`)

**Purpose:** orient a returning learner in seconds and get them back into a meaningful next action.

**Structure and hierarchy:**

1. A compact welcome/title zone with a specific page heading (not a huge hero taking up half the viewport), a short helpful line, and a small honest summary of learning state if saved data exists.
2. **Continue Learning** as the most prominent module. If progress exists, display the last active real topic, a meaningful one-line description, real status/progress, and one obvious **Resume** action. If no progress exists, show an inviting empty state with a **Start HTML** action. Never display invented last-access data or fake percentages.
3. An HTML learning-track card/module with topic count and completion information calculated from actual curriculum data/state. Clearly identify CSS/JavaScript/Bootstrap/Angular as previews or “Coming later” if those tracks are not fully implemented.
4. A secondary area for next recommended action, due revision, or current challenge—only when the recommendation/data is real. Otherwise show a useful start-here card, not an empty metrics dashboard.
5. Small progress/streak/achievement information may appear as supporting elements. Use true values and keep gamification subtle.

**Visual treatment:** use editorial type hierarchy, one signature orbital motif or cropped constellation graphic as a framing element, a strong Continue card, deliberate asymmetry, whitespace, and restrained accent color. Avoid a grid of identical statistic cards. Avoid giant greeting text, generic gradient blobs, meaningless graphs, and fake “hours learned” analytics.

**States to design and implement:** first launch/no progress; returning learner; all available lessons complete; saved-state recovery after invalid/corrupt local storage; narrow mobile layout.

### 4.2 Explore / technology catalog (`/explore` or current route)

**Purpose:** help learners select an available technology and understand the learning journey before entering it.

- Page title and concise explanation; use a compact search/filter only if they operate against real curriculum data.
- HTML is visually marked as the complete, available track, with a credible summary, truthful topic/lesson information, progress if available, and a clear **Open track** action.
- Future technologies may appear as lower-emphasis preview cards, visibly labelled **Preview** / **Coming later**, and must not suggest that lessons and assessments already work.
- Create a visually varied but consistent card system; one card may be featured, others more compact. Use small language/track glyphs or typographic marks rather than random illustrations.
- On mobile, one-column cards or an intentional two-column compact layout only where text stays legible.

### 4.3 HTML track / Learning Orbit (`/learn/:technologyId`)

This is the signature screen of CodeOrbit. It must not look like a routine list of cards with a semicircle pasted below it. Design the full hierarchy around an explorable celestial curriculum atlas.

**Page composition:**

1. Compact HTML-track header: track name, concise promise/description, truthful progress, and a clear route back to Explore.
2. A bounded horizontal topic strip with each topic represented in canonical curriculum order. Show active, completed, in-progress, mastered, and untouched states using more than colour (icons, shapes, text/ARIA, rings).
3. The main **Learning Orbit** area centred as the visual hero. The arc is a broad upper arch (hill/rainbow, visually ∩-shaped), not a U-shaped valley or downward-facing bowl. Topic nodes/cards sit along the arc with a stable layout.
4. A topic detail panel in the same screen, placed beside or below the map depending on available width. It includes title, concise description, group/order, known prerequisites, truthful difficulty/duration if data exists, saved state, and Learn / Quick Quiz / Practice actions where available.
5. Small legend/helper text only when it helps decode node status or relationship connectors. Never force the user to infer what a colour means.

**Geometry and stability:**

- Keep canonical topic order and stable IDs as the source of truth for both strip and arc.
- For a visible arc, map normalised horizontal positions to a smooth upper arch; a suitable conceptual formula is `y = baseline - height * sqrt(max(0, 1 - u*u))` for normalised `u` from -1 to 1. The exact implementation may use SVG paths, CSS positions, or a measured arc component, but the visible curve must clearly rise in the middle and descend toward both ends.
- Node positions must not shuffle on each render. Active selection changes emphasis and detail, not random positions.
- Avoid overlapping topic labels/cards. Reduce visible nodes, pan a window, or use a compact fallback before making labels tiny.
- All topics remain reachable; first and last nodes cannot be clipped by fades or hidden beyond an inaccessible edge.

**The two navigation systems are synchronised bidirectionally:**

- Selecting a topic in the strip selects the same stable ID in the arc and opens its details.
- Selecting a node on the arc updates the strip active state and detail panel.
- Keyboard navigation uses logical curriculum order, not visual pixel proximity alone.
- Panning/scrolling the strip must not trigger a render loop or repeatedly fight the user's scroll.
- On initial entry, restore a real previous selection when available; otherwise choose a sensible first/current topic without inventing progress.
- Resize recalculates geometry only when the relevant dimensions/breakpoint change.

**Node semantics:**

- Current/selected: clear outer ring or halo, stronger label, high-contrast indicator.
- Completed: compact check marker plus accessible completed text.
- In progress: a progress ring only if its percentage is derived from real saved work; otherwise use a nonnumeric progress state.
- Mastered: a distinct restrained marker only if mastery has a defined evidence-based rule.
- Untouched: quieter but readable; never hidden.
- Locked/prerequisite-blocked: only if the product truly implements the restriction; do not invent locking just for visual interest.

**Relationships:** connector lines are shown only for explicit prerequisite/relationship edges in curriculum data. The overall order/arc may use a subtle baseline path, but must not be presented as causal prerequisites. Do not invent edges to make the diagram look more complex. On focus/selection, a valid path may receive emphasis.

**Edge fade/reappear behaviour:** fades belong to viewport edges as a visual cue for off-screen content. They must not overlay or intercept pointer/touch input. They are not an endless carousel trick. First/last navigation remains explicit. After manual horizontal scrolling, reaching a real boundary may reveal an adjacent range without sudden jumps, cloning nodes, changing canonical order, or causing jitter. Keep a stable reference item and avoid scroll snapping that fights dragging/swiping.

**Interaction and animation:** selection glow/ring, active-path emphasis, and a very short star-to-star transition are allowed when directly triggered by user action. No mandatory continuous particle field, twinkling loop, auto-rotation, parallax, or blinking. The view must remain clear when reduced motion is on.

**Responsive design:**

- Wide desktop: full, unmistakable upper arch, topic strip, detail panel, and clear spacing.
- Tablet: maintain arch where readable; show fewer nodes at once if required, with pan/strip navigation.
- Mobile: first attempt a compact upper-arch constellation with touch-sized targets and a separate detail card/drawer. If labels overlap or targets become too small, use a well-designed horizontal topic carousel/strip; retain topic order, active state, celestial visual vocabulary, and all navigation/data behaviour. Do not shrink desktop geometry blindly.
- Overall page should not have horizontal overflow. A bounded topic strip may scroll horizontally.

### 4.4 Learning studio / lesson (`/lesson/:topicId` or current route)

**Purpose:** make theory understandable, visually organised, and directly connected to practice.

**Desktop composition:** use a two-panel workspace. The left/primary region contains lesson content and worked examples; the right/supporting region contains quick practice, quiz, notes/bookmark controls, or a context panel based on the current section. The panels should be balanced rather than one tiny content column next to a giant empty area. Allow independently scrollable panels only if their scroll behaviour is obvious and not nested excessively.

**Lesson hierarchy:**

- Breadcrumb/track/topic context.
- Lesson title, short learning objective, estimated duration only when supported by content data.
- Clear concept explanation with readable paragraphs, section labels, semantic HTML callouts, and small meaningful diagrams/examples when the idea benefits from it.
- Code examples in syntax-highlighted or clearly formatted code panels, with Copy/Reset/Run actions only where they truly work.
- “Why it matters”, common mistakes, and example output as appropriate to the topic.
- Topic navigation (previous/next) based on real curriculum order.
- **Quick Quiz**, **Practice this topic**, **Bookmark**, **Take notes**, and completion actions should be visible at the moment they make sense—not all competing at the top.

**Mobile:** turn panels into tabs or an intentional stacked layout. Keep current section/action context visible, preserve selected activity and drafts across switching, and make code usable without page-wide horizontal overflow.

**States:** first open, resumed mid-lesson, quiz correct/incorrect, note saved, bookmark active, lesson completed, no quiz/practice content available (clearly labelled, never dead link).

### 4.5 Quiz experience

- Questions should sit on a calm, high-contrast surface with a visible question number/progress, readable stem, well-spaced answer options, and an obvious submit/check action.
- Selected, correct, incorrect, disabled, explanation, and unanswered states need distinct visual feedback plus text/icon semantics.
- Avoid instant colour-only green/red changes without explanation. Give the rationale after submission.
- Back/next/retry controls must perform real transitions. Prevent contradictory state (such as changing an answer while claiming an immutable final score) and test scoring logic.
- Keyboard operation must be complete and focus must remain sensible after answer feedback.

### 4.6 Practice workspace / coding lab (`/practice/:challengeId` or current route)

**Purpose:** feel like a purpose-built compact coding laboratory, not a form that happens to contain a textarea.

**Desktop:**

- Clear challenge header with title, purpose, difficulty only if maintained, and a concise completion state.
- A requirements/instructions panel showing expected outcomes as actionable checklist items.
- Main work area organised around a code editor and a live preview. Keep editor and preview visually distinct; allow the user to resize/focus the editor/preview where practical.
- The editor uses readable monospace, line numbers if feasible, appropriate spacing, syntax cues for HTML, and clearly labelled **Run**, **Reset**, **Hint**, **Check solution**, and **Focus mode** controls only when implemented.
- Preview panel has an explicit heading/refresh status and a blank/welcome state before code is run.
- Feedback panel displays each requirement as pass/fail/not checked with explanation and a relevant next step. Do not rely on colour alone.
- Progressive hints are revealed one at a time with state recorded if appropriate. The reference solution is explicit and deliberate—not accidentally visible with one click while trying to ask for a hint.

**Focus mode:** expand the coding surface, reduce navigation/decorations, preserve access to Run/Preview/Hint/exit, and preserve learner code and challenge selection when entering/exiting. It must be easy to leave; don't trap the learner in focus mode.

**Security:** learner HTML runs only in an isolated sandboxed iframe with scripts disabled. Never insert submitted HTML into the trusted parent DOM or use `dangerouslySetInnerHTML` as a live preview mechanism. Do not combine `allow-scripts` with `allow-same-origin`. The visual design must not compromise sandboxing.

**Mobile:** make a clear Editor / Preview / Instructions switcher or tabs. Do not compress editor and preview into unreadable side-by-side slivers. Preserve content across tab switches and keep the primary run/check action easy to reach.

### 4.7 Code Coach and result feedback

- Use concise, scannable requirement rows with clear pass/fail/needs-attention status, a short explanation, and what to do next.
- Connect feedback to the exact lesson/challenge concept when possible.
- Hints are progressively disclosed; each one is useful without immediately giving the complete answer.
- Reference solution shows intentional disclosure and can be compared against learner code/output.
- Never claim a generative AI analysed the whole submission. MVP checks are deterministic, rule-based, and challenge-specific.
- Empty/not-run/checking/success/partial pass/failure states must all be designed. No false 100% score or fake confetti.

### 4.8 Progress / mastery / error notebook / journal / achievements

These routes must reuse the design language while each has a distinct purpose. Avoid reproducing the same dashboard card grid on every page.

- **Progress:** show learning by topic/category using actual state; show totals only when precisely defined. Helpful next action precedes decorative analytics.
- **Mastery map:** display only real curriculum nodes and real prerequisite relationships. It complements the Learning Orbit rather than replacing it. Provide a list/table alternative for screen readers and users who prefer linear navigation.
- **Error Notebook:** show saved mistakes with topic, explanation, status, and a working review action. Include a useful empty state that explains how mistakes are added.
- **Learning Journal/Notes:** make entries easy to read/edit/save; show timestamps only when actually stored; protect drafts.
- **Achievements/streaks:** modest recognition only for real, persisted milestones. Never infer streaks from fabricated dates or show meaningless locked achievements as clutter.
- **Daily challenge:** its prompt, completion state, and date handling must be real and repeatable; avoid fake countdowns.

### 4.9 Dialogs, notifications, empty states, and errors

Create reusable but humane patterns for confirmation dialogs, toasts, form validation, empty states, recoverable storage errors, and error boundaries. Explain the consequence in plain language. Do not cover important content with decorative popups. Toasts should not disappear so quickly that assistive-technology users or slower readers cannot access them. Destructive actions require confirmation where appropriate. Empty states should always offer the next useful step if one exists.

## 5. Motion and micro-interactions

Motion should signal state change, hierarchy, and spatial continuity. Prefer transforms/opacity and short durations; do not animate layout properties continuously. Use a restrained timing system (fast interaction feedback, medium panel/state transition, rare longer Orbit transition) and document the actual values in `DESIGN.md`.

Allowed when useful: button press response, card hover lift of only a few pixels, active topic halo/ring transition, short arc-to-node selection transition, panel reveal, progress feedback, toast enter/exit, reduced one-time milestone glint.

Avoid: permanent pulsing controls, blinking stars, repeated floating particles, constant parallax, surprise animations, big springy overshoot, confetti on routine actions, animation that delays clicking, scroll hijacking, or motion on every render. Honour `prefers-reduced-motion` with genuinely understandable instant/state-based alternatives, not just slower effects.

## 6. Accessibility and usability are design requirements

- Use semantic HTML, logical headings, landmarks, labelled inputs, button/link semantics, visible focus rings, and clear error messages.
- Keyboard navigation covers sidebar, menus, topic strip, arc nodes, tabs, quizzes, editor controls, dialogs, and feedback.
- Status is encoded by more than colour; include text labels, icons, or accessible descriptions.
- Maintain WCAG AA contrast for text and meaningful interactive components, including muted text and disabled/focused states as applicable.
- Never convey important instructions only in hover tooltips. Icon-only actions have accessible names and, visually, tooltips where useful.
- Respect reduced motion. Avoid flashing and rapidly oscillating effects.
- Ensure screen readers can navigate the Learning Orbit through a linear, meaningful sequence with topic name, state, and action; relationships are announced only when real.
- Respect text zoom and narrow viewports; avoid fixed heights that clip content, page-level horizontal overflow, tiny click targets, and hover-only features.
- Error feedback should be tied to the control/requirement and announced accessibly without unexpectedly moving focus.

## 7. Content and visual honesty

The interface must only present data the product can substantiate. Do not make up:

- Learning durations or difficulty levels that are not recorded in data.
- Topic counts, mastery scores, streaks, learner hours, performance graphs, or recent activity.
- Prerequisite edges or knowledge relationships.
- AI analysis, checks, or suggestions that are not implemented.
- “Saved” confirmations before persistence succeeds.
- A working destination for an unfinished feature.

Where data does not exist, either omit the item or provide an explicit, tasteful empty state. Use seeded sample curriculum content when it is part of the actual product dataset and label it as app content—not as a user's prior activity.

## 8. Required design-system deliverable: root `DESIGN.md`

Claude must create root `DESIGN.md` during implementation. It should include:

1. Art-direction summary and rationale.
2. Final palette with semantic token names and contrast notes.
3. Typography families and complete type scale.
4. Spacing scale, content widths, breakpoints, radii, borders, shadows, focus treatment, and layering/z-index rules.
5. Component inventory and states: nav, buttons, inputs, cards, badges, progress rings, tabs, dropdowns, dialog, toast, empty/error state, code panel/editor, quiz option, topic node, Orbit connector, and mobile navigation.
6. Motion durations/easing and reduced-motion alternative.
7. Screen layout notes for dashboard, catalog, Learning Orbit, lesson, practice workspace, progress/mastery, and review tools.
8. Accessibility and responsive decisions, especially Orbit mobile fallback.
9. Any deliberate deviation caused by source assessment requirements.

Tokens in `DESIGN.md` must match the actual code. Do not let the document become a fictional ideal disconnected from the running UI.

## 9. Visual QA acceptance checklist

Before calling the UI complete, Claude must verify the following from the actual app, not merely mark them because CSS exists:

- [ ] The visual language is consistent across every implemented route and feels premium, clear, and distinctive.
- [ ] Main hierarchy is obvious within a few seconds; primary actions are not buried.
- [ ] There is enough whitespace; text, controls, and cards do not feel cramped; no accidental giant blank areas remain.
- [ ] No horizontal overflow at common widths, except intentionally bounded topic strip/editor areas.
- [ ] At desktop width, the Learning Orbit forms a broad upper arch; the arc never becomes a U-shaped valley.
- [ ] Topic strip and arc remain synchronised, hit targets and labels do not collide, and first/last topics are reachable.
- [ ] Cards, nav, buttons, tabs, toasts, dialogs, hover/focus/pressed/disabled/loading states are styled consistently.
- [ ] Dashboard metrics and progress labels correspond to real state.
- [ ] Lesson text, code samples, quiz feedback, editor and preview remain readable.
- [ ] Mobile is purposefully composed, not a reduced desktop screenshot; touch targets are useful.
- [ ] Reduced motion remains clear and complete.
- [ ] Empty, error, success, completed, and unavailable states look intentional.
- [ ] Focus indicators and contrast remain visible on dark backgrounds.
- [ ] No placeholder copy, nonfunctional icons, fake charts, dead links, or dummy controls remain.
- [ ] `DESIGN.md` describes the same tokens/components seen in the product.
- [ ] Visual corrections from the first inspection have been rechecked after changes.

## 10. Scope and workflow guardrails

- Build the interface in the real React application, using reusable components and structured data; do not deliver only static HTML/screenshots.
- If the repository already contains source code, preserve working behaviour and integrate the design rather than blindly replacing everything.
- Do not introduce a large UI library solely for convenience; custom CSS and a small icon package are preferred unless the assessment dictates otherwise.
- Do not spend credits repeatedly asking the user to select from several palettes or asking whether ordinary design choices are acceptable. Make professional decisions and document them.
- Do not stop implementation while waiting for optional external design files. No Stitch, Figma, or remote design export is required.
- Do not skip source assessment verification when files are available. If an assessment requirement conflicts with a design preference, satisfy the course requirement and document the trade-off.
- Design and implementation are one continuous responsibility: specify briefly, implement, inspect, refine, and test.
