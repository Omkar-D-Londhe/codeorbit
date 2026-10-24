# CodeOrbit — Product Blueprint and Implementation Specification

**Document type:** Product requirements, UX specification, technical
architecture, implementation roadmap, and AI-agent handoff\
**Project status:** Specification and implementation-ready design direction prepared; application implementation and assessment verification must be checked in the working repository\
**Initial product:** Frontend-only learning and coding-practice
platform\
**Initial learning track:** HTML\
**Preferred implementation stack:** React + TypeScript + Vite, custom
CSS, React Router, browser localStorage\
**Design workflow:** Claude owns UI/UX design → create and maintain root `DESIGN.md` and `docs/UI_DESIGN_SPEC.md` → implement, visually inspect, refine, and test in the actual application. Stitch/Figma are optional and are not prerequisites.\
**Working principle:** Design the whole experience, implement it in
controlled increments, and keep the project portable.

------------------------------------------------------------------------

## 1. Executive Summary

CodeOrbit is an interactive programming-learning studio that brings
concept learning, knowledge checks, code experimentation, practice
challenges, guided feedback, and progress tracking into one connected
experience.

It is inspired by the strengths of tutorial platforms and
coding-practice platforms, but it should not be a simple clone of
either. Its defining experience is a distinctive **celestial Learning Orbit**: an
unmistakably upward-opening semicircular topic navigator synchronized with
a horizontal topic strip. It should feel like a navigable celestial atlas
of knowledge, not a generic card carousel. Topic nodes sit along the arc;
subtle orbital paths may connect topics only when the curriculum data
supports a real prerequisite or learning relationship. The navigation
helps learners explore a curriculum while seeing which topics are new, in
progress, completed, or mastered.

A student should be able to select a topic, understand the concept,
modify a working example, answer a short quiz, complete a related coding
challenge, request progressive hints, review a reference solution, and
save their progress without switching websites.

The first complete learning track will be HTML. The platform
architecture should allow future tracks---such as CSS, JavaScript,
Bootstrap, and Angular---to be added through structured content and
reusable components rather than a complete redesign.

CodeOrbit should be visually polished, animation-rich but purposeful,
responsive, accessible, and practical to demonstrate as a frontend
mini-project. Every mandatory concept from the Frontend Design and
Testing Lab assessments must be represented by a working feature or
implementation decision and verified against the original assignment
requirements before submission.

## 2. Product Vision

### 2.1 Vision statement

Make learning frontend development feel like an interactive journey:
explore a concept, experiment with it, practise deliberately, understand
mistakes, and return exactly where learning stopped.

### 2.2 Product promise

**Learn the concept. Experiment with code. Practise with guidance. Build
mastery.**

### 2.3 Product principles

1.  **One topic, one learning loop.** Theory, examples, quiz, and
    practice belong to the same topic experience.
2.  **Practice should explain, not merely judge.** Feedback should
    explain what passed, what failed, and why.
3.  **Progress must be meaningful.** A topic should not be marked
    mastered solely because it was opened.
4.  **The interface should be distinctive but usable.** Animation and
    visual effects must never obscure the content or controls.
5.  **Resume should be dependable.** A student should be able to return
    after closing or refreshing the browser and recover useful learning
    state.
6.  **The first version should work offline where feasible.** Curated
    lesson data and deterministic checks should not require a backend.
7.  **No feature should be a fake control.** Every visible button or
    interactive element must perform its advertised action or be clearly
    labelled as a future capability.
8.  **The architecture should support future growth.** Adding a new
    technology track should mainly require content and challenge
    definitions.
9.  **Assessment compliance is a product requirement.** Required course
    concepts must be demonstrated in the actual interface or code, not
    just listed in documentation.
10. **Protect the learner's work.** Save drafts, explain data storage,
    and isolate the code preview from the parent application.

## 3. Goals and Non-Goals

### 3.1 Goals for the mini-project

-   Deliver a complete and coherent frontend application.
-   Implement an HTML learning track with several topic groups and
    individual lessons.
-   Build the upward semicircle and synchronized horizontal topic strip.
-   Include interactive lessons, short quizzes, coding challenges, and a
    live HTML preview.
-   Provide challenge-specific code checking, progressive hints,
    line-related feedback where possible, and reference solutions.
-   Persist progress, quiz state, drafts, notes, bookmarks, and
    error-review data in localStorage.
-   Include a Continue Learning experience and a mastery/progress
    dashboard.
-   Add meaningful animations, transitions, hover states, responsive
    behaviour, and reduced-motion support.
-   Demonstrate required HTML, CSS, JavaScript, forms, events, DOM
    updates, validation, and any other mandatory assessment concepts.
-   Maintain a detailed project specification and implementation record
    that can be used by Freebuff or another coding agent.

### 3.2 Non-goals for the initial release

These are future extensions, not requirements for the first usable
mini-project:

-   A production-scale multi-user backend.
-   Cloud synchronization across devices.
-   A general-purpose AI reviewer capable of understanding arbitrary
    code in every language.
-   Running arbitrary JavaScript, Python, Java, or other programs on a
    server.
-   A complete replacement for a commercial tutorial or coding interview
    platform.
-   Real-time multiplayer, leaderboards, or social networking.
-   Payment, subscriptions, or advertising within CodeOrbit.
-   Full CSS, JavaScript, Bootstrap, and Angular curricula on day one.
-   A production authentication system unless required by the course or
    explicitly approved later.

The UI and data model may leave room for future capabilities, but the
initial release must not pretend that future features are already
implemented.

## 4. Users and Primary Scenarios

### 4.1 Primary user

A student learning frontend development who wants explanations,
examples, quizzes, and practical coding exercises organized by concept.

### 4.2 Core scenarios

**Scenario A --- Start learning** 1. The learner opens the dashboard. 2.
The learner chooses HTML from the technology catalog. 3. The learner
explores the topic strip and upward arc. 4. The learner selects a topic.
5. The lesson, quiz, and practice actions are available from that topic.

**Scenario B --- Learn and practise** 1. The learner reads the
explanation. 2. The learner examines a code example. 3. The learner
edits the example and runs it. 4. The learner answers the quick quiz. 5.
The learner opens a related challenge. 6. The learner submits the code
and receives requirement-based feedback. 7. The learner requests a hint
or solution if needed.

**Scenario C --- Resume** 1. The learner closes the browser or navigates
away. 2. The app restores the last technology, topic, lesson position,
code draft, and relevant progress. 3. A Continue Learning card offers a
clear next action. 4. The learner can resume or intentionally choose
another topic.

**Scenario D --- Review mistakes** 1. A challenge attempt fails one or
more requirements. 2. The app explains the missing requirement. 3. The
learner can save the mistake to an error notebook. 4. The progress
dashboard suggests a related concept or review challenge.

**Scenario E --- Explore freely** 1. The learner searches for a topic or
filters by category/difficulty. 2. The learner can open any available
topic. 3. Mastery indicators guide the learner but do not unnecessarily
lock the syllabus.

## 5. Information Architecture

### 5.1 Main routes

Recommended routes:

-   `/` --- Home / learning dashboard
-   `/catalog` --- Technology catalog
-   `/learn/:technologyId` --- Technology overview and topic orbit
-   `/learn/:technologyId/:topicId` --- Topic learning studio
-   `/practice/:challengeId` --- Focused challenge workspace
-   `/mastery` --- Skill mastery map
-   `/progress` --- Learning analytics and history
-   `/notebook` --- Error notebook and learning journal
-   `/bookmarks` --- Saved lessons and examples
-   `/settings` --- Appearance, motion, and learning preferences

Routing may be simplified if needed, but route names and
responsibilities should remain understandable.

### 5.2 Shared application shell

The shared shell should contain: - Brand mark and CodeOrbit wordmark. -
Primary navigation. - Search entry point. - Continue Learning access. -
A small progress or profile area. - Responsive mobile navigation. -
Consistent page container, spacing, and transition rules.

Avoid displaying every possible navigation link at once. Use a clear
hierarchy and a compact secondary menu for less frequent tools.

### 5.3 Technology catalog

Each technology card should include: - Technology name and short
description. - Status: available, planned, or preview. - Topic count
when real data exists. - Learner progress when available. - A clear
action to enter the track.

HTML is the only fully implemented track in the first release. Other
technologies may appear as "Coming later" cards, but must not lead to
incomplete or misleading experiences.

## 6. Visual Identity and Design System

### 6.1 Design direction

The visual direction is a **digital learning atelier**: a premium, calm,
dark developer workspace with editorial typography and purposeful
motion.

Suggested palette (Claude owns the final accessible token tuning; see `docs/UI_DESIGN_SPEC.md`): - Obsidian
background: `#15161D` - Graphite surface: `#252735` - Elevated surface:
`#2D3040` - Primary violet: `#8B80FF` - Soft violet: `#B9B0FF` - Signal
lime: `#B9F36A` for rare success or progress accents - Paper text:
`#F3F1EB` - Muted text: `#A7A8BC` - Error: a sufficiently contrasting
red tone - Success: a sufficiently contrasting green tone

These are starting design tokens, not immutable values. Claude must establish the final root `DESIGN.md`, including semantic usage, typography, spacing, radii, shadows, borders, focus rings, component states, contrast considerations, and the celestial accent treatment. The implementation and `DESIGN.md` must match; Claude does not need external design-tool approval for ordinary design choices.

### 6.4 Celestial visual language

The visual identity combines a professional, calm learning workspace with
a restrained celestial knowledge-map motif. It is not a fantasy game UI
and must not sacrifice readability for decoration.

- **Core identity:** dark observatory / digital learning atelier; precise,
  editorial, quiet, high-contrast, and suitable for a serious developer
  workspace.
- **Dashboard expression:** an observatory-like overview of current
  learning activity, progress, and a restrained sense of discovery.
- **Technology catalog and Learning Orbit:** the strongest expression of
  the celestial motif, using topic-stars/nodes, a clean upward-opening arc,
  and sparse connecting paths where relationships are meaningful.
- **Learning studio:** the same typography, surfaces, borders, and accent
  language, with celestial decoration greatly reduced so lesson content
  and code stay central.
- **Practice workspace:** laboratory first. Keep the editor, requirements,
  preview, feedback, and focus controls visually clear; use the motif only
  for small status signals or framing details.
- **Mastery map:** the most expansive knowledge-constellation view, showing
  actual curriculum relationships and progress without inventing graph
  connections.
- **Gamification:** professional with subtle, purposeful rewards. Points,
  progress rings, streaks, and achievements must reflect real saved state;
  avoid arcade-like clutter, oversized badges, excessive confetti, or
  attention-demanding animation.

Use thin orbital lines, small luminous nodes, restrained violet highlights,
and rare lime success accents only where they aid orientation or status.
Avoid full-screen star fields, dense particle clouds, neon on every edge,
continuous twinkling, decorative lines behind body text, or contrast that
reduces accessibility. Celestial visuals should be concentrated in places
where they communicate curriculum structure, selection, progress, or
orientation.

The exact star shape, path curvature, glow strength, line weight, palette,
blur, and motion timing are implementation design choices owned by Claude and documented in root `DESIGN.md`. The requirements that are not negotiable are the upward-opening arc, stable and predictable
navigation, semantically truthful connections, meaningful progress states,
accessibility, and a restrained professional tone.

### 6.2 Typography

Use a clean, readable sans-serif family for UI and body text. Use a
highly legible monospace family for code. Establish a limited scale
for: - Display headings - Page headings - Section headings - Body text -
Supporting text - Labels and metadata - Code text

Do not use tiny text to fit too much information into a card. Maintain
comfortable line length and contrast.

### 6.3 Components

Create reusable components for: - Buttons and icon buttons - Inputs,
search fields, select controls, checkboxes, and radio groups - Cards and
technology cards - Status badges - Progress bars and rings - Tabs and
segmented controls - Tooltips - Modals and confirmation dialogs - Toasts
and inline feedback - Empty states - Loading and error states - Topic
cards - Code panels - Quiz options - Hint panels - Challenge requirement
rows - Achievement badges - Responsive navigation

All components must have default, hover, focus-visible, active,
disabled, loading, success, and error states where applicable.

## 7. Signature Feature: The Learning Orbit

### 7.1 Definitive geometry

The topic cards must form an **upward-opening semicircle** beneath the
horizontal topic strip. The arc rises toward the centre like a hill or
rainbow. The end cards are lower; cards nearer the centre are higher.

Do not implement a downward-opening arc. This orientation is a locked
design requirement.

### 7.2 Two coordinated navigators

The Learning Orbit consists of: 1. A horizontal topic strip above the
arc. 2. An upward-opening semicircular arrangement of topic cards below
it.

Both represent the same ordered topic list and share one source of truth
for: - Topic identifiers - Selected topic - Current visible range -
Topic status - Completion/progress data

### 7.3 Synchronized interaction requirements

-   Scrolling or swiping the horizontal strip updates the visible topic
    range and the arc.
-   Scrolling or dragging the arc updates the horizontal strip.
-   Clicking a topic in either view selects the same topic in both
    views.
-   Selecting a topic updates the selected lesson and available
    quiz/practice actions.
-   The active topic remains visually clear.
-   Selection must not cause an unexpected jump in scroll position.
-   The two scroll handlers must not repeatedly trigger one another in a
    feedback loop.
-   Use shared state plus controlled scroll synchronization, with guards
    or animation-frame scheduling if needed.
-   Provide previous/next controls where useful.
-   Support keyboard navigation, focus indication, and touch gestures.
-   The entire topic collection must remain reachable, including the
    first and last items.

### 7.4 Arc geometry

Use a responsive layout that calculates card positions from a stable arc
model. A possible approach is to place cards along an SVG path or use a
controlled layout function that maps each card's normalized horizontal
position to a vertical offset. The exact implementation can be chosen
after the UI design system and interaction decisions are recorded in `DESIGN.md`.

Requirements: - Cards should not overlap labels or each other. - The
selected card should be visually prominent without obscuring
neighbours. - The arc must remain visually upward-opening at all
supported desktop widths. - Card positions should adapt to the number of
visible items. - Avoid expensive layout recalculations on every
animation frame. - Respect reduced-motion preferences. - Provide a
mobile alternative that preserves the same topic ordering and selected
topic.

### 7.5 Edge fade and reappearance

The horizontal topic strip and arc should fade at their left and right
visual edges, producing a sense of continuous exploration.

-   Use a mask or gradient overlay where supported.
-   At the true beginning of the list, do not imply that earlier topics
    exist.
-   At the true end, do not imply that more topics remain.
-   Fade effects must not block pointer events or keyboard access.
-   The fade must not make a topic impossible to read or select.
-   If CSS masking is not supported in a target environment, use a
    gradient overlay fallback.
-   Test fade behaviour during dragging, resizing, and programmatic
    selection.

### 7.6 Topic card content and states

A topic card may show: - Topic title or short label - Topic number -
Completion marker - In-progress indicator - Small progress ring or
status mark - Difficulty or estimated duration in a detail
popover/expanded view

States: - Not started - In progress - Completed - Mastered - Selected -
Hovered/focused - Disabled only when there is a real reason to disable
the action

Do not use colour as the only way to convey status.

### 7.7 Topic details

Selecting a card updates a nearby topic detail area with: - Topic
title - Short description - Estimated learning duration, if maintained
in data - Prerequisite concepts, if any - Current progress - Actions:
Learn, Quick Quiz, Practice - A suggested next step when appropriate

### 7.8 Celestial knowledge-map composition

The Learning Orbit is a **celestial atlas of the curriculum**. The
semicircle is the visual spine; topic cards/nodes are anchored to it as
stable points in an ordered learning path. Each topic may combine a small
star/node marker with a compact, legible topic card or label. Do not make
the user decode an abstract star map before they can choose a lesson.

The desired visual hierarchy is:

1. The selected topic is immediately obvious.
2. The horizontal topic strip makes exact topic navigation predictable.
3. The upward-opening arc gives the curriculum a distinctive spatial
   identity and helps users perceive topic order.
4. Completion and in-progress states are visible but secondary to the
   selected topic.
5. Relationship paths provide additional curriculum context without
   obscuring the arc or controls.

The arc must continue to read as **upward-opening like a hill or rainbow**:
its ends are lower and the centre is higher. Star positions, connector
curves, shadows, or animation must never make the arc appear inverted.
The star-map motif enriches the locked geometry; it does not replace it.

### 7.9 Nodes, relationships, and truthful visual encoding

- Every node maps to a stable `topicId`; its visible title is not its
  identity key.
- Topic order follows the curriculum's canonical ordering, not the
  learner's completion order.
- A topic node can show a star/dot, compact card, numbered label, or a
  combination chosen by Claude and recorded in `DESIGN.md`. It must remain recognisable as an
  interactive topic control.
- Draw a connector only when structured content defines a real
  prerequisite, dependency, or explicitly described learning relation.
  Do not connect arbitrary neighbours solely to make the map look full.
- Use different visual treatments for the primary arc/order path and
  optional relationship connectors so the two meanings cannot be confused.
- Lines should be thin, low contrast, and behind nodes/cards. They must
  never cross labels in a way that reduces readability or pointer accuracy.
- When a relation cannot be represented clearly at a screen size, hide or
  simplify the connector rather than moving topics unpredictably.
- The node map is an aid to orientation, not a claim that learning is a
  literal scientific network or that proximity measures ability.

### 7.10 Topic states and visual semantics

The topic map must represent the actual stored state, not a decorative
approximation:

- **Not started:** visible, selectable, calm/dim node; still readable and
  discoverable.
- **In progress:** subtle progress ring, arc segment, or status marker
  reflecting saved progress where such a metric exists.
- **Completed:** clear non-colour-only completion icon/marker and a
  restrained increase in node clarity or illumination.
- **Mastered:** distinct marker reserved for topics that meet the
  transparent mastery criteria defined by the progress model.
- **Selected:** strongest local emphasis, such as a restrained glow,
  brighter outline, slightly elevated surface, or an outer selection ring.
  Do not change the global layout just to make selection visible.
- **Hovered/focused:** clear border/outline and, where helpful, a compact
  tooltip or detail preview. Hover must not be the only way to discover
  information.
- **Unavailable/preview:** use only when that content is genuinely
  unavailable or future-only. Do not disable available HTML topics merely
  because prerequisite topics are incomplete; explain prerequisites as
  recommendations unless a real requirement dictates otherwise.

Never use hue alone to communicate a state. Combine color with icons,
labels, ring geometry, fill, border, or accessible text. Status visuals
must have sufficient contrast against the final approved surfaces.

### 7.11 Stable geometry, map range, and panning

The map must feel spatially stable. A selected topic changing should not
cause every node to rearrange or re-randomise.

- Define topic positions from a stable, deterministic ordering and layout
  model. Keep a topic's relative position consistent for the same
  curriculum and responsive layout class.
- Scrolling the horizontal strip changes the visible topic range in the
  map. Interacting with the map updates the strip's visible range. Both
  views continue to use the same canonical list and selected-topic state.
- On navigation to a distant topic, smoothly pan/shift the viewport or
  reveal the appropriate range; do not animate all topics through new
  positions without a clear reason.
- Keep previous and next topic navigation predictable. A user must be
  able to reach the first and last topics and understand where they are
  within the track.
- Use controlled scroll synchronization with loop guards, stable IDs,
  and requestAnimationFrame or equivalent scheduling only when needed.
  Avoid opposing scroll handlers that chase each other indefinitely.
- Do not force a scroll jump on focus change, resizing, returning from a
  lesson, or re-opening the page.
- If the current selection is outside the visible range, bring it into
  view with a restrained pan/scroll and preserve the user's sense of
  orientation.
- On resize, recompute geometry only when relevant layout dimensions or
  breakpoints change; do not do expensive layout measurement on every
  animation frame.

A suitable implementation may use SVG paths, CSS transforms, a measured
arc function, or another approach chosen after the design is approved.
The visual reference should constrain behaviour, not prematurely dictate
the implementation technology.

### 7.12 Celestial interaction and micro-animation

The motion should feel like navigation through a knowledge constellation,
not continuous ambient animation.

- Selecting a node may gently brighten the star, animate the selection
  ring, and update the nearby detail panel.
- Moving to a neighbouring topic may use a short star-to-star glide or a
  subtle connecting trail that communicates the change of selection.
- Panning to a different range may shift the map smoothly while keeping
  topic order and relative positions understandable.
- Newly completed progress may illuminate a marker once, briefly; do not
  use persistent pulsing as a substitute for a clear status icon.
- Relationship paths may be revealed or emphasised on selection/focus,
  especially when they help explain prerequisites. Avoid animating every
  line every time the component renders.
- The edge-fade/reappearance effect remains a viewport cue, not an
  infinite carousel illusion. Fade overlays must not intercept clicks.
- Animation must never delay activation, hide focus, flash rapidly, or
  induce motion when a user has requested reduced motion.
- Keep the map static when idle. No mandatory continuous star drift,
  parallax, blinking, particle emission, or auto-rotation.

Prefer transform and opacity. If an animated trail is too expensive,
unclear, or inaccessible, use a simple highlight/state transition. The
same selected/visible state must be understandable when all motion is
removed.

### 7.13 Responsive modes and mobile fallback

The upward arc remains the preferred form wherever it stays readable and
usable. Do not assume the full desktop semicircle can simply be scaled
down to a phone.

- **Desktop:** full strip plus clear upward arc with topic nodes/cards;
  show enough topics to understand continuity without shrinking labels.
- **Tablet:** preserve the upward arc where possible, reduce the number of
  simultaneously visible topics if needed, and maintain touch-friendly
  controls and visible navigation cues.
- **Mobile first option:** design a compact constellation explorer that
  retains topic order, selection, node state, and a clear upward-opening
  gesture/shape wherever the geometry remains practical. It may show a
  smaller subset at once and let the user swipe/pan between ranges.
- **Mobile fallback:** when a compact arc would produce overlaps, tiny
  labels, inaccessible touch targets, or confusing lines, use a styled
  horizontal topic carousel/strip. Keep the celestial visual language,
  selected state, status indicators, and the same topic IDs/order. The
  carousel is a usability fallback, not a replacement for the locked
  desktop signature feature.
- A distinct mobile transition may glide from one star/node to another
  and briefly show a restrained connecting trail, but it must be driven
  by the user's interaction and stop when motion is disabled.
- Keep topic details in a separate compact panel/drawer if the map and
  detail card cannot coexist comfortably.
- Avoid horizontal overflow of the overall page. A horizontally
  scrollable topic index is acceptable only when the scroll area is
  clearly bounded and operable.
- Switching between desktop/tablet/mobile arrangements must preserve the
  selected topic and never reset progress or drafts.

The compact map versus carousel decision should be made from the implemented responsive layout plus a usability/legibility review. Claude owns this decision. Baseline preference is
**arc wherever possible, carousel fallback when necessary**; do not
commit to an unusable arc just for visual consistency.

### 7.14 Topic detail panel and information hierarchy

When a topic is selected, provide a clear nearby panel or focused detail
surface containing, where content data exists:

- Topic title and a one- or two-sentence description.
- Topic group or position in the curriculum.
- Estimated duration and difficulty, if real data is maintained.
- Prerequisite concepts, with working links to those topics.
- Status and saved progress, using text/icon and not only colour.
- Primary **Learn** action and clearly available **Quick Quiz** and
  **Practice** actions when those activities exist for that topic.
- A useful next-step recommendation when supported by actual progress.

Do not fabricate duration, difficulty, mastery percentages, relationship
edges, or last-activity metadata. If data is unavailable, omit that field
or label it honestly rather than presenting a made-up value.

### 7.15 Keyboard, touch, and screen-reader behaviour

- Topic nodes/cards must be keyboard reachable in predictable curriculum
  order. Use an appropriate semantic control and accessible name.
- Visible focus styling must not depend on hover or animation.
- Support arrow-key previous/next topic movement where it matches the
  chosen interaction model; do not trap the user in the map.
- Keep Tab and Shift+Tab behaviour predictable. If the map uses a roving
  tab index, document and test the pattern.
- Touch users need clear hit areas, no hover-only information, and no
  gesture that conflicts with page scrolling.
- Give status and selection accessible text such as topic title, state,
  and position when appropriate. Decorative paths should be hidden from
  assistive technology; meaningful prerequisite relationships should be
  available as text or links elsewhere in the detail panel.
- Do not force users to infer topic state from glow intensity alone.
- With reduced motion, replace glides and panning animations with direct
  or short fade transitions while preserving selection and orientation.

### 7.16 Learning Orbit non-goals and guardrails

The Learning Orbit is not:

- A random generative starfield or continuously moving background.
- A graph that rearranges itself around whichever topic was clicked.
- A progress score disguised as node size or spatial position.
- A maze that hides exact topic titles behind hover interactions.
- A replacement for the horizontal topic strip.
- A downward-opening arc, even on narrow screens where a carousel fallback
  may be preferable.

Keep the overall product professional with subtle gamification. The map
should make the curriculum feel inviting and memorable while remaining an
efficient educational control.

## 8. Continue Learning and Persistent State

### 8.1 Purpose

Continue Learning is a first-class feature on the dashboard and within
the learning shell. It should help a learner return to meaningful work
rather than merely reopening a route.

### 8.2 Data to persist

Persist, when applicable: - Last selected technology and topic - Last
selected lesson section or reading position - Last active workspace
tab - Quiz answers, attempts, and completion state - Current challenge
identifier - Code draft for each challenge - Challenge completion and
attempts - Completed lesson/topic markers - Notes and bookmarks - Error
notebook entries - Achievement state - Preferences such as reduced
motion and editor settings

### 8.3 Resume card

The dashboard should include: - "Continue learning" heading - Last
technology and topic - Current activity (lesson, quiz, or challenge) -
Progress indicator - Last activity metadata if available - Primary
"Resume" button - Secondary option to browse other topics

Do not invent a precise time or activity date if it has not been stored.

### 8.4 Persistence behaviour

-   Save important state after meaningful changes, not only when the
    user leaves.
-   Debounce frequent code-draft writes to avoid excessive synchronous
    storage updates.
-   Handle missing, malformed, or older stored data safely.
-   Use a versioned storage schema so future data changes can be
    migrated.
-   Provide a reset/clear-progress action with confirmation.
-   Do not store secrets or API keys in localStorage.
-   Explain that localStorage is browser-profile-specific and does not
    synchronize across devices.
-   If storage is unavailable or full, show a helpful message and keep
    the app usable where possible.

## 9. Learning Studio

### 9.1 Layout

The learning studio should provide a focused, split-screen experience on
desktop: - **Left panel:** explanation, learning objectives, code
examples, visual demonstration, quiz, notes. - **Right panel:** practice
challenge, editor, run/reset controls, output preview, requirements,
hints, feedback, solution reveal.

Panels should scroll independently where appropriate. The interface must
not become so cramped that both columns are unusable.

On smaller screens, convert the panels into accessible tabs or stacked
sections. Preserve the student's current code and selected activity when
switching between tabs.

### 9.2 Lesson structure

Each lesson should include: 1. Topic title and short introduction. 2.
Learning objectives. 3. Explanation in small sections. 4. Syntax or
structural reference. 5. A code example. 6. An explanation of what the
example does. 7. An interactive demonstration where suitable. 8. Common
mistakes. 9. Accessibility or semantic notes where relevant. 10. Quick
knowledge check. 11. Related practice challenge. 12. Mark complete or
continue action. 13. Bookmark and personal-note actions.

Use accurate, curated HTML explanations. Avoid filler text and avoid
teaching obsolete markup as current best practice without a clear
historical note.

### 9.3 Quick quiz

Question types may include: - Multiple choice - Predict the rendered
output - Identify a mistake - Select a missing element/attribute -
True/false where it is genuinely useful - Arrange steps or snippets in
the correct order

Required behaviour: - One clear question at a time or a compact quiz
layout. - Selected answer state. - Answer validation. -
Correct/incorrect feedback with an explanation. - Score and completion
summary. - Retry option. - Saved state when the learner leaves
mid-quiz. - Keyboard-accessible selection and submission. - No automatic
"mastered" status from one correct answer alone.

### 9.4 Personal notes and bookmarks

Learners should be able to: - Bookmark a topic or example. - Add a note
to a topic. - Edit or delete their note. - Find saved items on a
dedicated page. - Navigate from a saved item back to the relevant
topic. - Keep note content separate from the original lesson data.

## 10. Coding Practice Workspace

### 10.1 Editor and preview

For the initial HTML track: - Provide an editable HTML code area. - Use
a suitable editor component if dependencies and setup allow it;
otherwise begin with a well-designed textarea-based editor and keep the
editor interface modular. - Include Run, Reset, and optionally Copy
controls. - Show rendered output in a preview panel. - Update the
preview on explicit Run and optionally through a debounced live-preview
mode. - Preserve code drafts by challenge. - Make preview errors
understandable. - Provide a clear empty state before the first run.

### 10.2 Safe preview boundary

User-submitted HTML must not execute inside the trusted application DOM.

-   Use a sandboxed iframe for preview.
-   Avoid granting script execution privileges for the HTML-only MVP.
-   Do not combine `allow-scripts` and `allow-same-origin` casually.
-   Treat user HTML as untrusted.
-   Do not inject user code into privileged application components.
-   Keep the preview boundary separate from localStorage and parent-app
    state.
-   If future JavaScript execution is added, reassess the threat model
    and use a stricter isolation strategy.
-   The preview must not be treated as a secure general-purpose code
    execution sandbox for arbitrary programs.

### 10.3 Challenge model

Each challenge should define: - Unique identifier - Technology and topic
identifier - Title - Difficulty - Prompt/instructions - Starter code -
Expected learning objective - Explicit requirements - Hints in a defined
sequence - Reference solution - Explanation of the solution - Validation
rules - Completion criteria - Optional related lesson and prerequisite
topic

### 10.4 Requirement checker

For HTML challenges, use deterministic, challenge-specific checks rather
than attempting to infer every possible correct solution.

Examples: - A required element exists. - An anchor includes an
appropriate `href`. - An image has a non-empty `alt` attribute. - A form
control has an associated label. - A semantic landmark is present. - A
list contains the required number or kind of items. - A table includes
header cells when required. - A required text label is present.

The checker should tolerate reasonable variations in whitespace,
capitalization where HTML semantics permit it, and attribute order.
Avoid fragile raw-string comparisons when a parser or normalized check
is feasible.

### 10.5 Feedback

After submission, show: - Requirements passed - Requirements still
missing - Why each requirement matters - A link to the related lesson
section - A suggested next action

Where possible, feedback should refer to the relevant element or line.
If exact source-line attribution is unreliable, identify the element or
requirement rather than inventing a line number.

### 10.6 Progressive hints

Use a graduated sequence: - **Hint 1 --- Conceptual clue:** point to the
relevant idea. - **Hint 2 --- Structural clue:** identify the kind of
element, attribute, or structure needed. - **Hint 3 --- Specific
guidance:** show a partial pattern or targeted example. - **Reveal
solution:** show the full reference solution with an explanation.

The learner should explicitly request each hint. Track hint usage as
learning history if useful, but do not punish learners for using hints.

### 10.7 Reference solution and better approach

The solution panel should: - Show a complete reference solution. -
Explain the important lines/elements. - Highlight semantic,
accessibility, or maintainability improvements. - Offer "Copy solution"
only as an explicit action. - Encourage comparing the learner's attempt
with the solution. - Allow returning to the learner's draft when
possible.

Do not silently replace the student's code with the reference solution.

### 10.8 Before-and-after comparison

Provide a comparison view for selected challenges: - Starter/original
code - Learner's current code or reference code - Rendered result
comparison where feasible - A short explanation of what changed and why

Use a clear toggle or split view. Do not overload the workspace with
multiple editors when a simple before/after switch is more usable.

## 11. Code Coach and Learning Feedback

The initial Code Coach is a **rule-based feedback system**, not a
general AI reviewer.

Responsibilities: - Evaluate challenge-specific requirements. - Explain
failed requirements. - Connect failures to lesson sections. - Offer
progressive hints. - Provide a reference solution. - Suggest semantic
and accessibility improvements where rules can identify them. - Let the
learner save a mistake to the error notebook.

Future optional AI assistance may provide broader explanations, but it
would require an approved API/backend integration, usage limits, privacy
messaging, error handling, and a security review. Do not expose API keys
in frontend code or commit them to the repository.

## 12. Skill Mastery Map

The mastery map complements the Learning Orbit; it does not replace it.

-   The Learning Orbit is the compact, exploratory topic navigator.
-   The mastery map shows relationships and progress across the
    curriculum.

Represent topic prerequisites as a graph or a structured list of
dependencies. A student may explore any available topic, but
prerequisite relationships can explain why an earlier concept is
recommended.

The mastery map may use the celestial-concept visual language introduced
by Learning Orbit, but it should be a broader curriculum relationship
view rather than a second copy of the compact arc. Every displayed edge
must come from real structured prerequisite/relationship data. Use stable
node positions within a given layout and clear labels or a linked detail
panel. Do not encode ability as physical distance or node size, and do
not let decorative constellations imply relationships that the curriculum
does not define.

Suggested statuses: - New - Learning - Practising - Completed - Mastered

Suggested mastery criteria may combine: - Lesson completion - Quiz
performance - Successful challenge completion - A later review result

Keep criteria transparent and configurable. Do not imply scientific
measurement of ability. The mastery score is a learning aid, not a
formal assessment grade.

## 13. Error Notebook and Learning Journal

### 13.1 Error notebook

A learner can save an unsuccessful or confusing attempt with: -
Technology/topic - Challenge - Learner's code snapshot, if appropriate -
Failed requirement - Explanation - Date/sequence of the attempt -
Resolution status - Link to a related lesson - Option to create a review
task

Allow entries to be marked "reviewed" or "understood." Avoid shaming
language.

### 13.2 Learning journal

A learner can create personal notes associated with: - A topic - A
lesson section - A challenge - A general study session

Notes should support editing and deletion and be searchable if feasible.

### 13.3 Revision recommendations

Start with transparent, rule-based recommendations: - If a challenge
repeatedly fails a requirement, recommend its related lesson. - If a
quiz score is below a defined threshold, suggest retry or review. - If a
topic has been started but not completed, offer it in Continue
Learning. - If an error notebook entry remains unresolved, suggest
revisiting it. - If prerequisites are incomplete, explain the suggested
prerequisite.

Do not make recommendations based on hidden or opaque rules in the MVP.

## 14. Motivation, Achievements, and Daily Challenge

### 14.1 Rewards

Use restrained gamification: - Points for completing meaningful learning
actions. - Milestones for completing topic groups. - Badges for
demonstrated skills. - A streak indicator only if the app has reliable
activity dates. - Progress rings or markers tied to actual saved state.

Avoid rewarding meaningless clicks, artificially inflating scores, or
pressuring students with excessive notifications.

### 14.2 Daily challenge

A daily challenge can be selected from curated content using a stable
date-based rule. In a frontend-only app, it may be local to the user's
current date and device; do not claim that every user receives a
globally synchronized challenge.

### 14.3 Achievement examples

-   HTML Foundations
-   Semantic Structure
-   Accessible Images
-   Form Builder
-   First Challenge Completed
-   Independent Solver
-   Revision Completed

Badge names should reflect actual completion rules.

## 15. Search, Filters, Focus Mode, and Shortcuts

### 15.1 Global search

Search across available: - Technologies - Topics - Lesson titles -
Challenge titles - Tags - Bookmarks and notes, if practical

Show useful empty states and keyboard-accessible results. Filters may
include topic group, difficulty, completion status, and content type.

### 15.2 Focus practice mode

Focus mode should: - Reduce visual distractions. - Keep the challenge
prompt, editor, preview, and essential feedback visible. - Hide or
collapse secondary navigation. - Preserve access to hints and reset. -
Offer an obvious exit action. - Never destroy the draft when entering or
leaving focus mode.

### 15.3 Keyboard shortcuts

Potential shortcuts: - Run code - Reset challenge (with safeguards) -
Switch between lesson and practice - Open hint - Navigate to
previous/next topic - Focus search

Display shortcuts in the UI where useful. Avoid overriding browser or
assistive-technology shortcuts unnecessarily. Ensure shortcuts are
discoverable and documented.

## 16. Motion and Interaction System

### 16.1 Motion philosophy

Motion should communicate state, hierarchy, and continuity. It should
not be decoration applied to every element.

### 16.2 Planned motion

-   Landing page: staggered, restrained entrance.
-   Technology cards: subtle hover elevation or border emphasis.
-   Learning Orbit: smooth but restrained active-node emphasis, stable
    upward-arc positioning, short selection transitions, and optional
    interaction-driven star-to-star trail where it remains clear.
-   Topic strip: synchronized scrolling with guarded updates and no
    feedback-loop jitter.
-   Topic details: controlled content transition without a jarring panel
    resize or forced scroll jump.
-   Constellation paths: reveal or emphasise only when a real topic
    relationship helps orientation; avoid animating every connector.
-   Mastery map: restrained status transitions that never change the
    underlying topic relationships or imply unsupported measurements.
-   Lesson completion: progress update and restrained success feedback.
-   Quiz: answer-state transitions and result reveal.
-   Code preview: visible update when Run is pressed.
-   Feedback: inline expansion or a small panel transition.
-   Mastery map: clear status changes.
-   Achievements: brief, non-disruptive confirmation.

### 16.3 Performance and accessibility

-   Prefer transform and opacity animations.
-   Avoid animating expensive layout properties unnecessarily.
-   Avoid scroll-jacking.
-   Use reduced-motion media queries and a preference toggle where
    appropriate.
-   Ensure essential state changes remain understandable without
    animation.
-   Use focus-visible styles.
-   Test with keyboard-only interaction.
-   Keep animations short enough not to delay task completion.
-   Avoid infinite ambient motion that distracts from learning.

## 17. Responsive Design

### Desktop

-   Shared shell and dashboard.
-   Full horizontal topic strip.
-   Upward arc with a comfortable number of visible cards.
-   Split-screen learning and practice workspace.
-   Mastery map and analytics with enough space to read.

### Tablet

-   Compact navigation.
-   Smaller arc or fewer visible cards.
-   Adjustable lesson/practice panel proportions.
-   Touch-friendly controls.

### Mobile

-   A horizontal swipeable topic strip remains available as precise
    navigation.
-   First try a compact constellation explorer that preserves the
    upward-opening arc, canonical topic order, selection, and status when
    labels and touch targets remain legible.
-   Fall back to a touch-friendly horizontal carousel when the compact arc
    would overlap labels, produce tiny targets, or make topic order hard
    to understand. Retain the celestial style and same state/data.
-   Keep topic details in a separate compact panel/drawer if the map and
    details cannot fit together.
-   Use a short, interaction-driven star-to-star glide/trail only when it
    is understandable; no ongoing ambient motion.
-   Lesson/practice switcher or stacked panels; preserve draft and current
    activity across switches.
-   Persistent access to Run, Preview, Hint, and Resume.
-   No horizontal overflow from the overall page; explicitly bounded
    horizontal topic scrolling is allowed when usable.
-   Touch targets of comfortable size; no hover-only functionality.
-   Code editor remains usable; if necessary, allow a dedicated editor
    view.

Do not simply scale the desktop design down. Define mobile behaviour
intentionally in the implementation, compare compact-arc and carousel alternatives,
record the decision in `DESIGN.md`, and test it in the browser.

## 18. Initial HTML Curriculum

The exact curriculum should be reviewed against course requirements and
kept in structured data.

Suggested topic groups:

1.  **HTML Foundations**
    -   Document structure
    -   Elements and attributes
    -   Headings and paragraphs
    -   Comments and entities
2.  **Text and Content**
    -   Text formatting
    -   Quotations
    -   Lists
    -   Code-related text and semantic meaning
3.  **Links and Navigation**
    -   Anchor elements
    -   `href`
    -   Relative and absolute paths
    -   Opening links safely and accessibly
    -   Page bookmarks
4.  **Images and Media**
    -   Images
    -   `alt` text
    -   Image sizing
    -   Audio and video basics
    -   Embedded content where relevant
5.  **Tables**
    -   Table structure
    -   Header and data cells
    -   Captions
    -   Row/column spanning
    -   Appropriate use of tables
6.  **Forms and Inputs**
    -   Form structure
    -   Labels and controls
    -   Text, email, number, password, date, and other suitable inputs
    -   Radio buttons and checkboxes
    -   Select controls and text areas
    -   Required fields and built-in validation
    -   Accessible form feedback
7.  **Semantic HTML and Accessibility**
    -   Header, navigation, main, section, article, footer
    -   Meaningful structure
    -   Heading hierarchy
    -   Labels and alternative text
    -   Keyboard and accessibility considerations
8.  **Putting It Together**
    -   Profile page
    -   Registration form
    -   Article page
    -   Data table
    -   Small multi-section website

Each topic should include a lesson, at least one knowledge check, and at
least one practice challenge when appropriate. The actual number of
topics should be selected based on content quality and available time,
not on a desire to fill the arc.

## 19. Frontend Assessment Compliance

The uploaded lab PDFs include screenshots of rendered pages and code, so
text extraction alone does not capture all task details. This blueprint
proposes how common assessment concepts can be demonstrated, but the
final compliance matrix must be checked against the exact original
question wording and all visible pages before submission.

The project should deliberately include working examples of the required
concepts, where they are part of the course assessments:

  -----------------------------------------------------------------------
  Assessment concept area             CodeOrbit application
  ----------------------------------- -----------------------------------
  HTML document structure and         Shared page shell, lesson content,
  semantic elements                   challenge examples

  Headings, paragraphs, lists, links, Curriculum lessons and live
  and images                          examples

  Tables and structured data          Lesson examples and data-oriented
                                      challenges

  CSS selectors, properties, spacing, Full custom design system and
  borders, colours, and typography    responsive components

  Layout and positioning              Dashboard, topic arc, split-screen
                                      workspace, cards

  Flexbox/grid or required layout     Responsive application shell and
  techniques                          reusable page layouts

  Forms and form controls             Search, notes, preferences, quiz
                                      forms, practice inputs

  Validation and feedback             Quiz validation, input validation,
                                      challenge requirement checker

  JavaScript event handling           Topic selection, scrolling, tabs,
                                      editor actions, buttons

  DOM or dynamic rendering            Live preview, quiz results, topic
                                      content, progress UI

  Conditional behaviour               Hints, completion states,
                                      recommendations, filters

  Arrays and objects / structured     Technology, topic, lesson, quiz,
  data                                and challenge definitions

  Reusable functions and components   React components and shared utility
                                      functions

  Browser persistence                 Resume, drafts, notes, bookmarks,
                                      settings, and progress

  Keyboard interaction                Shortcuts, accessible controls,
                                      topic navigation

  Animation and transitions           Learning Orbit, cards, progress
                                      feedback, responsive interactions

  Responsive design                   Desktop, tablet, and mobile layouts
  -----------------------------------------------------------------------

This table is a planning map, not proof that each requirement is
satisfied. Maintain a separate compliance tracker with the exact
assessment number/question, required concept, CodeOrbit file/component,
test evidence, and verification status.

If the professor explicitly requires a particular library or framework,
that requirement overrides an optional stack preference. Do not use
React to avoid practising a concept that must be demonstrated directly.

## 20. Recommended Technical Architecture

### 20.1 Stack

-   React
-   TypeScript
-   Vite
-   React Router
-   Custom CSS and CSS variables
-   Bootstrap only where needed to demonstrate required course concepts
-   GSAP only for motion that is genuinely easier to coordinate with it;
    use CSS for simpler transitions
-   localStorage for initial persistence
-   A suitable HTML editor component if practical; otherwise start with
    a modular textarea-based editor

Do not add dependencies solely because they are fashionable. Every
dependency should have a clear purpose.

### 20.2 Suggested project structure

``` text
CodeOrbit/
├── AGENTS.md
├── README.md
├── DESIGN.md
├── docs/
│   ├── CODEORBIT_BLUEPRINT.md
│   ├── ASSESSMENT_COMPLIANCE.md
│   ├── DECISIONS.md
│   ├── WORKLOG.md
│   ├── TEST_PLAN.md
│   └── UI_DESIGN_SPEC.md
├── design-reference/
│   ├── design-system/
│   ├── dashboard/
│   ├── catalog/
│   ├── learning-orbit/
│   ├── learning-studio/
│   ├── practice-workspace/
│   └── mastery-dashboard/
├── public/
│   └── assets/
└── src/
    ├── app/
    ├── routes/
    ├── components/
    │   ├── layout/
    │   ├── navigation/
    │   ├── orbit/
    │   ├── lessons/
    │   ├── quizzes/
    │   ├── editor/
    │   ├── feedback/
    │   ├── progress/
    │   └── shared/
    ├── features/
    │   ├── catalog/
    │   ├── learning/
    │   ├── practice/
    │   ├── mastery/
    │   ├── notebook/
    │   └── settings/
    ├── data/
    │   ├── technologies/
    │   ├── html-topics/
    │   ├── lessons/
    │   ├── quizzes/
    │   └── challenges/
    ├── hooks/
    ├── services/
    │   ├── storage/
    │   ├── progress/
    │   └── validation/
    ├── styles/
    │   ├── tokens.css
    │   ├── globals.css
    │   └── motion.css
    ├── types/
    └── utils/
```

The structure can be adjusted after inspecting Vite and any approved
starter code. Avoid making empty directories for every possible future
feature before there is a use for them.

### 20.3 Data models

Use stable identifiers. Do not identify topics by their visible titles
alone.

Example conceptual types:

``` ts
type TopicStatus = "not-started" | "in-progress" | "completed" | "mastered";

type Technology = {
  id: string;
  name: string;
  description: string;
  status: "available" | "planned";
  topicIds: string[];
};

type Topic = {
  id: string;
  technologyId: string;
  title: string;
  description: string;
  groupId: string;
  prerequisiteIds: string[];
  lessonId: string;
  quizIds: string[];
  challengeIds: string[];
  estimatedMinutes?: number;
};

type ChallengeRequirement = {
  id: string;
  description: string;
  explanation: string;
  validatorKey: string;
};

type Challenge = {
  id: string;
  topicId: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prompt: string;
  starterCode: string;
  requirements: ChallengeRequirement[];
  hints: string[];
  solutionCode: string;
  solutionExplanation: string;
};
```

These are conceptual examples; adapt types to the final content model.

### 20.4 Storage schema

Store one versioned application state or a small set of clearly
versioned keys. Example:

``` ts
type CodeOrbitState = {
  schemaVersion: number;
  lastVisited: {
    technologyId: string;
    topicId: string;
    activity: "lesson" | "quiz" | "practice";
    challengeId?: string;
  };
  topicProgress: Record<string, {
    status: TopicStatus;
    lessonProgress: number;
    quizBestScore?: number;
    completedChallengeIds: string[];
  }>;
  codeDrafts: Record<string, string>;
  bookmarks: string[];
  notes: Record<string, string>;
  errorNotebook: ErrorNotebookEntry[];
  preferences: {
    reducedMotion: boolean;
    focusModeDefault: boolean;
  };
};
```

Do not treat this exact shape as final until the feature model is
implemented. Include safe parsing, default state, migration handling,
and a reset path.

## 21. Claude-Owned UI/UX Design Workflow

Claude is the UI/UX designer and implementation owner. Google Stitch, Figma,
external mock-up tools, or exported design files are optional and must not be
required to continue. The canonical visual and interaction requirements are in
`docs/UI_DESIGN_SPEC.md`; root `DESIGN.md` is created and maintained by Claude
so the final tokens and component rules accurately reflect the running app.

### 21.1 Design responsibility

Claude must make and document cohesive decisions about the art direction,
palette, typography, geometry, layout, iconography, component states, motion,
accessibility, responsive breakpoints, empty/error/success states, and route
hierarchy. Design must be implemented in the real app and validated in a
running browser wherever possible. Static mockups alone are not completion.

### 21.2 Implementation order

1. Read the blueprint, decisions log, UI design spec, test plan, and the actual
   original course assessment files when available.
2. Inspect the repository and retain existing working code, local changes, and
   project-specific constraints.
3. Establish a concise implementation-ready `DESIGN.md` from the canonical UI
   spec. Choose final semantic tokens and component rules without repeatedly
   asking the user to select ordinary visual details.
4. Implement the shared shell and one cohesive core screen at a time. Reuse the
   established tokens/components; do not create disconnected design variants.
5. Implement the upward-opening Learning Orbit and synchronisation requirements
   as a high-priority signature component; test geometry and interaction logic.
6. Extend the system across learning, practice, feedback, progress, and review
   screens while keeping each page's information hierarchy purpose-specific.
7. Inspect desktop, tablet, and mobile layouts; compare against the checklist in
   `docs/UI_DESIGN_SPEC.md`; correct real defects and inspect again.
8. Update `DESIGN.md` when a deliberate design decision changes; keep the file
   and actual interface aligned.

### 21.3 Optional design-tool use

If Claude independently has access to an external design tool, it may use it as
an accelerator, but it must not block on login, export, availability, or manual
approval. No generated external screen is authoritative over the actual
product requirements, assessment requirements, accessibility, or working app.

### 21.4 UI delivery requirements

The deliverable is the implemented responsive application plus root
`DESIGN.md`, maintained docs, and test evidence. Design must not be reported as
complete until all implemented routes have been checked for consistency,
working states, keyboard/touch usability, and reduced-motion behaviour.

## 22. Freebuff Desktop Workflow

Freebuff Desktop is the primary coding environment. Use its built-in
models and available agent capabilities first; external API keys are not
required for the normal Freebuff included-model workflow according to
its current official information.

### 22.1 Before implementation

1.  Create the project folder.
2.  Initialize Git.
3.  Add this blueprint and the assessment compliance tracker.
4.  Add `AGENTS.md` with project-wide instructions.
5.  Inspect Node/npm and the current project.
6.  Set up the React + TypeScript + Vite foundation.
7.  Confirm that the app builds before adding complex features.

### 22.2 Persistent project instructions

`AGENTS.md` should contain: - Product summary - Approved stack -
Design-system rules - Build/test commands - File-organization
conventions - Accessibility and security rules - Requirement to inspect
existing files before modifying them - Requirement to avoid unrelated
rewrites - Requirement to run checks after changes - Requirement to
update the work log and compliance tracker - Requirement to stop and
report blockers rather than inventing requirements

Keep it concise enough to be useful. The full blueprint remains in
`docs/CODEORBIT_BLUEPRINT.md`; `AGENTS.md` should summarize the rules
the agent must apply to every task.

### 22.3 Use agents deliberately

Good parallel work: - One agent audits assessment requirements and updates the compliance matrix. - One agent performs a visual QA review against `docs/UI_DESIGN_SPEC.md` and records actionable defects. - One agent implements an isolated
component in a separate workspace. - One agent reviews code or tests a
completed feature.

Poor parallel work: - Two agents editing the same shared navigation or
storage files at once. - One agent changing data types while another
builds against the old types. - Asking multiple agents to "build the
entire app" independently and then merging their conflicting results.

Prefer one implementation owner for shared architecture. Use other
agents for isolated tasks, design review, tests, or critique. Merge only
after reviewing diffs and running checks.

### 22.4 Work in small tasks

Each task prompt should specify: 1. Scope 2. Relevant files/design
references 3. Expected behaviour 4. Acceptance criteria 5. Tests/build
checks 6. What must not be changed 7. Required work-log update

Do not ask the agent to implement the entire platform in a single
request.

### 22.5 Model and allowance strategy

-   Check the current model picker and its displayed usage
    cost/allowance.
-   Use a fast/efficient model for small styling changes, file
    discovery, and straightforward refactors.
-   Use a stronger model for architecture, tricky synchronization,
    security-sensitive preview work, or complex debugging.
-   Start with one agent for a task that changes shared architecture.
-   Use parallel agents only when tasks are independent.
-   Save stable project instructions in files rather than repeatedly
    pasting long context.
-   Keep tasks narrow to reduce repeated reasoning and unnecessary file
    changes.
-   Export useful conversations or record their outcomes in the work
    log.
-   Usage limits and model availability can change; rely on the app's
    current picker rather than old estimates.

### 22.6 API keys

Do not purchase API access just because you heard that agents use API
keys. Freebuff's included model workflow is designed not to require your
own model API key. An external provider key may be relevant only if you
intentionally configure a supported external provider or a separate
future AI feature.

If an external key is introduced later: - Confirm the provider's pricing
and free tier. - Set usage limits where available. - Store it in a local
environment variable or secret manager. - Add `.env` to `.gitignore`. -
Commit only `.env.example` with placeholder names. - Never put a secret
in React/Vite frontend variables that are bundled to the browser. -
Never paste real keys into prompts, screenshots, public repositories, or
documentation. - Use a backend proxy for any production API that
requires a secret.

### 22.7 Privacy and cloud-model caution

Freebuff works locally with cloud-hosted models. Before sending code or
files, review the product's current data and model disclosures. Prompts
and usage may be processed under the provider's terms, and
model-specific data handling can differ. Do not send passwords, API
keys, private personal data, or unrelated confidential files.

## 23. Suggested `AGENTS.md` Starter

``` md
# CodeOrbit Agent Instructions

## Product
CodeOrbit is an interactive frontend learning studio. The first complete track is HTML.
Read `docs/CODEORBIT_BLUEPRINT.md` for product requirements and `DESIGN.md` for visual rules.

## Working rules
- Inspect the repository before changing files.
- Follow `docs/UI_DESIGN_SPEC.md` and root `DESIGN.md`; Claude owns the UI design and must not wait for external design exports.
- Implement only the task requested; do not rebuild unrelated features.
- Keep components reusable and typed.
- Use stable IDs for technologies, topics, lessons, quizzes, and challenges.
- Do not create fake controls or pretend future capabilities are implemented.
- Preserve learner drafts and progress when changing storage logic.
- Never execute learner-submitted code in the trusted parent application DOM.
- Keep secrets out of source code and version control.

## Accessibility and motion
- Use semantic HTML, visible keyboard focus, labels, and accessible feedback.
- Support keyboard and touch interaction.
- Respect reduced-motion preferences.
- Do not rely on colour alone to communicate status.

## Verification
- Run the relevant build, type-check, and tests after changes.
- Report commands run and results accurately.
- Update `docs/WORKLOG.md` and `docs/ASSESSMENT_COMPLIANCE.md` when relevant.
- If requirements conflict or an assessment requirement is unclear, stop and ask rather than guessing.
```

## 24. Testing and Acceptance Criteria

### 24.1 Global acceptance

-   Application starts using documented commands.
-   Production build succeeds.
-   No blocking console errors.
-   Navigation links work.
-   Responsive layout works at desktop, tablet, and mobile widths.
-   Keyboard focus is visible.
-   Reduced-motion setting is respected.
-   No major horizontal page overflow.
-   Every visible control has meaningful behaviour.

### 24.2 Learning Orbit acceptance

**Geometry and visual meaning**

-   [ ] Desktop arc is unmistakably upward-opening: ends lower, centre
    higher. No variant inverts the arc.
-   [ ] The celestial style reads as a professional knowledge atlas, not
    a generic carousel or noisy game screen.
-   [ ] Nodes/cards have stable positions for a given curriculum order
    and viewport class; selection does not reshuffle the map.
-   [ ] The horizontal topic order remains canonical and is not changed
    by progress or navigation history.
-   [ ] Optional relationship connectors are sourced from real
    prerequisite/relationship data; no decorative false edges.
-   [ ] Nodes and paths do not obscure labels, focus indicators, or hit areas.

**State and hierarchy**

-   [ ] Not-started, in-progress, completed, mastered, selected, and
    focus/hover states are distinguishable.
-   [ ] Progress indicators reflect stored data and do not invent precise
    percentages or mastery levels.
-   [ ] Status is never conveyed by colour alone.
-   [ ] The selected node is clear without triggering an entire-map
    rearrangement; the detail panel updates consistently.
-   [ ] Duration, difficulty, prerequisites, and recommendations are shown
    only when supported by real content/progress data.

**Synchronization and range**

-   [ ] Strip scroll/swipe updates the visible map range.
-   [ ] Map interaction updates the strip range.
-   [ ] Selecting a topic in either view selects the same stable topic ID,
    updates details, and exposes only actions that actually exist.
-   [ ] No jitter, repeated scroll feedback, or synchronization loop.
-   [ ] Distant selection uses controlled pan/range change rather than a
    jarring jump or complete topic rearrangement.
-   [ ] Edge fade does not hide essential content or block clicks.
-   [ ] At true start/end, fades do not falsely imply extra topics outside
    the curriculum.
-   [ ] First and last topics remain reachable; previous/next behaviour is
    predictable.

**Responsive and accessibility**

-   [ ] Keyboard selection/navigation and visible focus work; topics are
    reachable in curriculum order.
-   [ ] Touch interactions work without relying on hover or conflicting
    with vertical page scrolling.
-   [ ] Mobile arc is retained only if labels, spacing, and targets remain
    usable; otherwise carousel fallback is used without changing IDs,
    order, or saved state.
-   [ ] Resizing or changing presentation mode preserves selected topic
    and all learner state.
-   [ ] Reduced motion removes/reduces glides, panning, trails, and other
    non-essential motion without losing status or orientation.
-   [ ] The map remains useful when animation is disabled and has no
    mandatory continuously moving ambient effects.
-   [ ] Mobile layout does not introduce page-level horizontal overflow.

### 24.3 Lesson and quiz acceptance

-   Every implemented lesson has valid content and stable IDs.
-   Quiz selection and answer validation work.
-   Correct and incorrect feedback is clear.
-   Quiz state is saved and restored as specified.
-   Notes and bookmarks persist and can be edited/deleted.

### 24.4 Practice acceptance

-   Run renders HTML in an isolated preview.
-   Reset restores the intended starter code after confirmation if
    unsaved work could be lost.
-   Code draft persists across navigation/reload.
-   Requirement checker reports correct pass/fail states for known test
    cases.
-   Hints reveal progressively.
-   Solution reveal is explicit.
-   The app does not claim general AI review when using deterministic
    rules.
-   Learner HTML does not gain unintended access to parent app state.

### 24.5 Persistence acceptance

-   Continue Learning opens the correct last activity.
-   Saved state survives reload.
-   Missing/corrupt storage falls back safely.
-   Reset progress works with confirmation.
-   No API key or secret is stored in localStorage.

### 24.6 Assessment acceptance

-   Every mandatory assessment concept is mapped to an implementation.
-   Each mapping has a test or evidence.
-   The final compliance matrix is checked against original assignment
    wording.
-   Required technologies/libraries are included where explicitly
    mandated.

## 25. Implementation Roadmap and Serial Phase Gates

The phase gates below are the authoritative execution order for this
project. They expand the former high-level feature roadmap into smaller
verifiable steps. Do not skip ahead, run concurrent tasks that modify the
same architecture, or add product scope without explicit approval. A phase
is not complete until its exit criteria are checked, the records are
updated, and the checkpoint is saved in Git.

### Phase 0 — Documentation and repository foundation (completed baseline)

Deliverables: canonical blueprint, project instructions, decisions log,
work log, assessment tracker draft, test plan, Claude-owned UI design spec,
Git repository, and initial checkpoint.

Exit criteria: initial repository setup is verified. The initial app is
not yet required to exist at this point in this recorded baseline. The
known foundation checkpoint is `40787aa861c3649699b2cee37b4febd169e3a2b3`;
verify it in the repository rather than assuming the working tree has not
changed since the record was created.

### Phase 1 — Assessment requirements closure

Deliverables: review of the two original Frontend Design / Testing Lab
assignment sources; exact question-by-question compliance matrix;
required library/framework and marking constraints; updates to D-002 and
the architecture only if the original source mandates a change.

Exit criteria: every actual requirement is transcribed accurately,
including instructions visible only in screenshots; candidate blueprint
rows are labelled required/not required; unresolved conflicts are
recorded. No candidate row is treated as verified merely because it appears in the blueprint. The user expects to supply the original files to Claude for this review. If unavailable, leave assessment-dependent decisions and compliance claims pending, but continue independent implementation work that is safe under the known requirements; do not freeze unrelated work or invent the missing assessment content.

### Phase 2 — Claude-owned design system and screen blueprint

Deliverables: root `DESIGN.md` based on `docs/UI_DESIGN_SPEC.md`, final
semantic tokens, type scale, spacing/layout rules, global navigation pattern,
component-state definitions, responsive breakpoints, and short layout
specifications for each in-scope route. Claude makes normal design decisions
independently; no Stitch/Figma export or separate user approval is required.

Exit criteria: `DESIGN.md` is specific enough to implement; visual choices are
consistent with locked product decisions and available assessment evidence;
the design includes all main screens and empty/error/success/mobile states.
Do not prolong this phase with repeated concept-only planning.

### Phase 3 — Learning Orbit interaction and responsive design validation

Deliverables: a detailed implemented design plan for the Orbit's upper-arch
geometry, stable topic IDs/order, node states, truthful relationships,
bidirectional strip/map synchronisation, edge fades, topic detail hierarchy,
keyboard/touch navigation, mobile compact-arc/carousel decision, and reduced-
motion equivalent. Write relevant geometry/synchronisation tests before adding
secondary visual effects.

Exit criteria: the geometry and state transitions are precisely specified and
testable; the actual implementation path is clear; no external screen export or
manual design approval is a dependency. Proceed to the app foundation once these
requirements are recorded and the assessment gate is resolved or explicitly
isolated as pending where original files are unavailable.

### Phase 4 — App foundation

Deliverables: React + TypeScript + Vite foundation (unless the assessment
review mandates otherwise), routing, shared app shell, global reset,
final design tokens from `DESIGN.md`, core reusable components, and build
/type-check/test commands.

Exit criteria: clean install/start/build succeeds; no blocking errors;
responsive shell and accessibility baseline work. Record actual scripts
in `TEST_PLAN.md` rather than inventing commands before `package.json`
exists.

### Phase 5 — Dashboard and technology catalog

Deliverables: dashboard, Continue Learning empty/populated states,
technology catalog, real HTML availability, and clearly marked future
technology previews.

Exit criteria: navigation works; displayed counts/progress are sourced
from data; future tracks do not lead into fake or incomplete experiences.

### Phase 6 — Learning Orbit implementation

Deliverables: topic data model, stable arc geometry, horizontal strip,
celestial nodes and valid relationships, bidirectional synchronization,
edge fades, topic detail panel/actions, keyboard/touch support, mobile
presentation fallback, and reduced-motion behaviour.

Exit criteria: all Learning Orbit acceptance criteria in §24.2 pass. Test
layout maths and scroll guards before adding extra visual polish.

### Phase 7 — Learning studio

Deliverables: curated HTML lessons, objectives, explanations, examples,
interactive examples where appropriate, quizzes, notes, bookmarks, and
lesson completion.

Exit criteria: each implemented lesson has stable IDs and a complete,
accurate learning loop; quiz state and notes/bookmarks persist correctly.

### Phase 8 — Practice workspace

Deliverables: HTML editor, script-less sandboxed iframe preview,
challenge definitions, deterministic requirement checker, progressive
hints, explicit reference-solution reveal, before/after comparison, and
expandable focus mode.

Exit criteria: several complete end-to-end challenges pass known-good and
known-bad tests; student drafts are preserved; preview isolation is
verified.

### Phase 9 — Code Coach

Deliverables: challenge-specific requirement feedback, accessible pass/fail
rows, explanations, related lesson links, next-step recommendations, and
error-notebook save action.

Exit criteria: feedback is deterministic and honest; the UI does not claim
general AI review. Any future AI integration requires separate approval
and security/privacy planning.

### Phase 10 — Progress and mastery

Deliverables: versioned localStorage persistence, topic/mastery status,
progress views, mastery relationship map, error notebook, journal,
revision recommendations, restrained achievements, streaks when backed
by reliable dates, and date-based daily challenge.

Exit criteria: progress and recommendations reflect saved evidence;
refresh/resume works; no unsupported mastery or analytics claims.

### Phase 11 — Integration and quality assurance

Deliverables: end-to-end journeys, responsive checks, keyboard/screen-
reader review, reduced-motion review, storage failure recovery, preview
security validation, assessment compliance verification, and bug fixes.

Exit criteria: the build and relevant tests pass; remaining limitations
are explicit; the complete demo path works at intended breakpoints.

### Phase 12 — Final handoff and demonstration

Deliverables: README and exact setup/run instructions, demo sequence,
updated work log, final compliance evidence, screenshots where allowed,
Git status/commit record, known limitations, and a concise submission
summary.

Exit criteria: another person can run and demonstrate the app from the
instructions; requirements are evidenced; no phase is described as
verified without supporting results.

**Serial-order rule:** do not skip genuine prerequisites or silently cross a blocked gate. Record the blocker and complete independent tasks that do not depend on it when safe; do not freeze the entire project over a missing external source. Any change to scope, architecture, or locked Learning Orbit behaviour must be discussed and recorded before proceeding.

## 26. Project Records

Maintain these records during development:

### `docs/DECISIONS.md`

For each significant decision, record: - Decision - Reason -
Alternatives considered - Date or milestone - Impact on future work

### `docs/WORKLOG.md`

For each completed task, record: - Task name - Files changed - Behaviour
implemented - Tests/build commands - Results - Known limitations - Next
task

### `docs/ASSESSMENT_COMPLIANCE.md`

For each original assessment requirement, record: - Assessment file and
question/section - Required concept - CodeOrbit feature - Relevant
source files - Verification method - Status: not started / in progress /
verified - Evidence or notes

### `docs/UI_DESIGN_SPEC.md`

Use this file as the canonical UI/UX specification. Track the required screen layouts, interaction states, responsive decisions, and visual QA checklist. Keep implementation tokens in sync with root `DESIGN.md`; external exports are optional, not required evidence.

## 27. Recommended Demonstration Flow

A concise demo should show one coherent learner journey rather than
clicking randomly through every page.

1.  Open the dashboard and show Continue Learning.
2.  Enter the HTML track.
3.  Demonstrate the upward semicircle and synchronized topic strip.
4.  Select a topic and show the lesson.
5.  Edit a code example and run it.
6.  Answer the quick quiz.
7.  Open the related practice challenge.
8.  Submit an incomplete solution and show meaningful feedback.
9.  Request hints, then compare with the reference solution.
10. Save a mistake or bookmark a concept.
11. Return to the dashboard and show updated progress.
12. Refresh the browser and demonstrate resume persistence.
13. Briefly show responsive behaviour and explain how assessment
    concepts are implemented.

Choose a demo challenge that works reliably and can be completed
quickly. Keep a backup screenshot or short recording only if allowed by
the course.

## 28. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Scope becomes too large             Keep the entire vision documented
                                      but implement in phases; prioritize
                                      a complete core journey.

  Screens look inconsistent    Maintain one `DESIGN.md`, shared tokens, reusable components, and
                                      run visual regression/consistency checks.

  Agent overwrites working code       Use Git commits, narrow tasks, and
                                      explicit "do not rewrite unrelated
                                      files" instructions.

  Multiple agents conflict            Separate workspaces and independent
                                      tasks; keep one owner for shared
                                      architecture.

  Daily model allowance runs out      Use efficient models for simple
                                      tasks, preserve context in files,
                                      and reserve stronger models for
                                      difficult work.

  External API cost surprises         Start without external API keys;
                                      verify provider pricing before
                                      opting in.

  Preview security issue              Keep learner HTML isolated in a
                                      sandboxed iframe and do not grant
                                      unnecessary privileges.

  localStorage corruption             Version the schema, validate parsed
                                      data, and recover to defaults
                                      safely.

  Animation harms usability           Respect reduced motion, test
                                      keyboard navigation, and keep
                                      transitions purposeful.

  Assessment concepts are missing     Verify the final compliance matrix
                                      against every original assignment
                                      requirement.

  Feature is visually present but     Require acceptance criteria and
  nonfunctional                       tests for every interactive
                                      control.
  -----------------------------------------------------------------------

## 29. Definition of Done

A feature is not complete simply because its UI looks right.

A feature is done when: - It follows the documented design system in root `DESIGN.md`. - It
behaves as specified. - It is responsive. - It is keyboard-accessible
where applicable. - It handles empty, error, and success states. - It
preserves user work where required. - It has been tested using its
acceptance criteria. - The build passes. - The work log and compliance
tracker are updated where relevant. - Known limitations are documented
honestly.

## 30. Immediate Next Actions

The repository foundation has been prepared, but the assessment and design
gates are not yet closed. Continue in this order:

1. Apply the five Markdown replacements to the project repository and verify the canonical paths, diffs, and Git state.
2. Have Claude inspect the original Frontend Design and Testing Lab
   assignment sources. Populate `docs/ASSESSMENT_COMPLIANCE.md` from the
   real question wording and screenshots; do not invent or infer questions.
3. Resolve assessment-mandated stack/library decisions before finalising
   D-002 and any architecture-dependent design choices.
4. Have Claude define the implementation-ready system in root `DESIGN.md`
   using `docs/UI_DESIGN_SPEC.md`; no external design tool is required.
5. Validate the Learning Orbit requirements and tests, paying particular
   attention to the upper arch, stable nodes, strip/map synchronisation, and
   mobile fallback.
6. Build the app phase by phase; use browser inspection where available and
   apply the visual QA checklist after each major screen group.
7. Preserve the known initial commit and `.freebuff/` workspace metadata;
   never alter `.freebuff/project-id` or commit `.freebuff/`.

This documentation package does not contain application source code. It authorises Claude to design and implement within the existing repository when given the master prompt and relevant source files; follow the assessment-verification and serial execution rules.

## 31. External Tool References

-   Freebuff: https://freebuff.com/
-   Freebuff Desktop: https://freebuff.com/desktop

**Current product baseline:** CodeOrbit is a frontend-first, HTML-first
learning studio with a professional interface and subtle gamification; a
celestial knowledge atlas centred on a definitive upward-opening
semicircular Learning Orbit; a synchronized horizontal topic strip;
truthful curriculum relationships; progressive lesson/quiz/practice loops;
a deterministic Code Coach; persistent learning state; expandable focus
mode; and a broader mastery/revision system. Visual details such as final tokens, typography, star shapes, and motion timings are Claude-owned implementation decisions and must be recorded in root `DESIGN.md`. Assessment compliance remains pending review of the original
assignment sources. Implementation proceeds through the serial phase gates
in §25, with no skipped gates or unapproved scope additions.
