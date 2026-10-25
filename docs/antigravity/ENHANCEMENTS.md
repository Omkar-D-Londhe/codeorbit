# CodeOrbit — Enhancement & Feature Expansion Proposal

> This document catalogues every meaningful visual, UX, and functional upgrade worth considering for CodeOrbit beyond the baseline blueprint. Items are grouped by theme. Each entry notes what it adds and rough implementation complexity.

---

## 1. Visual Identity & Atmosphere

### 1.1 Dynamic Nebula Background
- A subtle, slowly-drifting painted-style nebula layer behind the main dashboard (CSS `background` + `radial-gradient` stacked layers or an SVG blob that slowly morphs with a CSS keyframe).  
- Completely frozen under `prefers-reduced-motion`.  
- Changes palette tint by technology: violet for HTML, amber for CSS, teal for JavaScript.

### 1.2 Constellation Grid Overlay
- Fine-grain dot-grid or faint hex-grid drawn on an `<canvas>` or as an SVG pattern.  
- Opacity set very low (≈ 4–6 %) so it textures surfaces without competing with content.  
- Grid lines nearest the cursor gently brighten on mouse move (only when motion is allowed).

### 1.3 Cursor Glow / Parallax Aura
- A soft radial gradient follows the cursor a few frames behind (CSS custom property updated by JS, painted via `::after` pseudo-element on a fixed layer).  
- Disappears on touch/mobile.

### 1.4 Glassmorphism Panel System
- Cards, side panels, and modals use `backdrop-filter: blur(…)` with a translucent border and a faint inner highlight so the nebula bleeds through elegantly.  
- Maintains WCAG contrast by adjusting text token, not the surface opacity.

### 1.5 Custom CSS Scroll Bar
- Thin violet scrollbar on all overflow containers (`::-webkit-scrollbar` + `scrollbar-width: thin`).

### 1.6 Ambient Particle Field (optional, heavy-opt-in)
- A very sparse `<canvas>` particle system (15–30 slow-drifting dots) visible only on the dashboard "hero" area.  
- Disabled by default; enabled via Settings → "Ambient particles."

### 1.7 Cinematic Page Transitions
- Route changes use a shared `ViewTransition` API or GSAP `timeline` to cross-fade + slight upward slide between pages.  
- Duration ≤ 300 ms; skipped under reduced motion.

### 1.8 Light/Dark/Cosmic Themes
- Three preset themes: **Obsidian** (existing dark), **Starlight** (high-contrast light), **Aurora** (teal-dominant dark variant).  
- Defined entirely via CSS custom property overrides; theme token is persisted in `localStorage`.

### 1.9 Customisable Accent Colour
- Allow the learner to swap the primary accent (violet) to one of five curated palette options from Settings.  
- Applied via a single CSS variable; the rest of the system scales automatically.

---

## 2. Learning Orbit — Extended Visual & Interaction

### 2.1 Star Pulse on Progress Save
- When a topic moves from "in progress" → "completed," the corresponding orbit node emits a single ring-expand pulse (keyframe, one iteration, then rests).  
- Visible even from the strip; the detail panel briefly shows a lime ✓ flash.

### 2.2 Orbital Trail on Navigation
- Selecting a non-adjacent topic draws a short glowing arc trail between the previous and new node (SVG `stroke-dashoffset` animation, ~ 250 ms).  
- Does not repeat or loop; strictly interaction-driven.

### 2.3 Prerequisite Constellation Lines
- Confirmed prerequisite relationships draw faint dashed SVG paths between nodes.  
- Hovering/focusing a node highlights only its direct prerequisite connections and darkens all others.  
- Lines have `aria-hidden="true"` and the relationships are also listed in the detail panel as accessible text.

### 2.4 Topic Group Zones
- Each topic group (Foundations, Text & Content, Links…) renders as a faint sector or coloured arc segment beneath the orbit arc.  
- Zones are labelled on the outer edge; clicking a zone label jumps the strip to that group's first topic.

### 2.5 Zoom/Magnify on Hover (Arc nodes)
- Hovered arc node scales up ~1.08× and reveals a compact tooltip (title, status, estimated time).  
- Uses `transform: scale()` — no layout reflow.

### 2.6 "You Are Here" Indicator
- A small spacecraft or bookmark icon sits just above the selected node on the arc; slides to the new node on selection change (CSS translate, requestAnimationFrame).

### 2.7 Mini Orbit Preview in Header
- A 48 px × 48 px miniaturised arc rendered in the breadcrumb bar while in a lesson or practice view, showing current topic position within the track.  
- Clicking it returns to the full orbit view.

### 2.8 Orbit Search Highlight
- When a global search query matches a topic, that orbit node temporarily pulses lime and the strip auto-scrolls to it.

---

## 3. Dashboard

### 3.1 Hero Progress Ring
- Large circular progress ring dominating the dashboard hero, showing overall HTML track completion percentage.  
- Animated draw-on with `stroke-dashoffset` when the page first loads.  
- Inner text shows percentage + mastered-topic count.

### 3.2 Streak Calendar
- GitHub-style contribution grid of the last 28 days.  
- Each day a lesson, quiz, or challenge was touched lights up in violet/lime.  
- Tooltip shows activity date and what was done.

### 3.3 Topic Group Completion Cards
- One card per group (Foundations, Text & Content, …).  
- Shows a mini filled progress bar and icons for: lessons done, quizzes passed, challenges completed.  
- Clicking drills into the orbit pre-scrolled to that group.

### 3.4 Daily Challenge Feature Card
- Prominent highlighted card that surfaces a date-stable challenge.  
- Shows challenge title, difficulty, topic, and estimated time.  
- "Start Today's Challenge" jumps directly into the practice workspace.

### 3.5 Recent Activity Feed
- A collapsible timeline of the last 10 meaningful actions (topic started, quiz passed, challenge completed, bookmark saved).  
- Timestamps if reliable; otherwise ordinal ("3 sessions ago").

### 3.6 Quick Actions Toolbar
- Fixed bottom or sidebar strip of icon buttons: Resume Last, Start Daily Challenge, Open Notebook, Go to Mastery Map, Open Search.  
- Keyboard shortcut hints shown on hover.

---

## 4. Lesson Studio — Visual & UX

### 4.1 Reading Progress Bar
- Thin violet bar at the top of the lesson scroll area that fills as the learner scrolls through the content.  
- Purely decorative / orientation aid; no effect on completion state.

### 4.2 Section-Level Bookmark
- Each major lesson section header has a bookmark icon that saves a link to that exact section (topic + anchor).  
- Bookmarks page renders each saved section with a preview of the section title and topic.

### 4.3 Inline Code Highlighting
- Lesson code blocks use a custom Prism.js or Shiki theme consistent with the app palette.  
- Line numbers toggle; a "Copy" button appears on hover.

### 4.4 Live Interactive Demos
- Selected lessons embed a mini split-pane (read-only left, live preview right) inline within the lesson body, so the learner can see a rendered example without leaving the lesson.

### 4.5 Definition Tooltips
- Technical terms in lesson prose are underlined with a dotted line; hovering/tapping shows a popover with a concise definition.  
- Definitions live in a small glossary data file.

### 4.6 Lesson Estimated Time Display
- Shows "~8 min read" derived from word count at the top of each lesson.  
- Updates dynamically to "~4 min left" based on scroll position.

### 4.7 Table of Contents Sidebar
- A fixed, collapsible mini-TOC on the right of the lesson panel (desktop only).  
- Section titles as anchor links; the active section is highlighted as the user scrolls.

### 4.8 Key Takeaways Summary Box
- Each lesson ends with a styled "Key Takeaways" card listing 3–5 concise bullet points.  
- Designed so a returning learner can quickly recap before starting a challenge.

### 4.9 Accessibility Check Sidebox
- For semantic HTML lessons, a persistent "Accessibility Scorecard" panel shows how the lesson's code example scores on WCAG criteria (alt text present, heading hierarchy, landmark roles, label associations).  
- Rule-based, not AI.

### 4.10 Dark-Room / Focus Mode for Reading
- Dims sidebar, navigation, and orbit; enlarges lesson text; hides all non-essential UI.  
- Toggle with keyboard shortcut `F` or a button; exits with `Esc`.

---

## 5. Quiz — Extended Types & UX

### 5.1 Visual Output Predictor Quiz
- Show rendered HTML output on the left; the learner picks the matching code snippet from 4 choices.  
- Alternatively: show a code snippet, ask "which output will the browser render?" with 4 small preview thumbnails.

### 5.2 Drag-and-Drop Code Sorter
- Scrambled HTML lines rendered as draggable tiles; the learner reorders them into valid markup.  
- Uses HTML Drag and Drop API + keyboard-accessible arrow-key reordering.

### 5.3 Spot-the-Bug Quiz
- A short code block with one deliberate error is displayed; the learner clicks the line containing the bug.  
- Highlighting turns red/green on confirmation.

### 5.4 Fill-in-the-Blank
- A code snippet with key tokens replaced by text inputs; the learner types the missing attribute name, tag, or value.  
- Accepts case-insensitive trimmed match; partial credit not required in MVP.

### 5.5 Timed Challenge Mode (opt-in)
- Optional countdown timer per question (30 s).  
- Enabling this awards a "Quick Thinker" badge variant for correct answers within time.  
- Off by default; toggled in Settings.

### 5.6 Quiz Result Breakdown
- After completing a quiz, show each question with the learner's answer, the correct answer, and the explanation side by side.  
- "Review Again" re-runs only incorrectly-answered questions.

### 5.7 XP Awarded Animation
- When a quiz is passed, a "+50 XP" badge floats up from the score area (CSS keyframe, one iteration).  
- Skipped under reduced motion; shows a static "+50 XP" banner instead.

---

## 6. Practice Workspace — Editor & Preview

### 6.1 Monaco / CodeMirror Editor
- Replace or augment the textarea with CodeMirror 6 (lighter) or Monaco (feature-rich).  
- HTML syntax highlighting, bracket matching, auto-close tags, line numbers, minimap (Monaco).

### 6.2 Split-View Resizer
- Draggable divider between editor and preview.  
- Drag position persisted in `localStorage`; reset button restores 50/50.

### 6.3 Auto-Save Indicator
- A small dot + timestamp ("Draft saved 3 s ago") in the editor toolbar.  
- Uses debounced writes to `localStorage`; the dot turns amber if a write fails.

### 6.4 Diff Viewer (My Code vs Reference)
- Side-by-side line diff between the learner's code and the reference solution, rendered after the solution is explicitly revealed.  
- Added lines: lime background; removed lines: soft red background.

### 6.5 Multiple File Tabs (Phase 2 extension)
- Challenge workspace shows HTML, inline CSS, and inline JS tabs.  
- Each tab's content is stitched into a single preview document in the sandboxed iframe.

### 6.6 Preview Device Frames
- Toggle overlay frames: desktop, tablet (768 px), mobile (375 px) around the preview panel.  
- Lets learners see how their HTML lays out at different sizes.

### 6.7 Accessibility Linter in Preview
- After running code, a small rule-based linter reports obvious a11y issues in the output (missing `alt`, unlabelled inputs, empty headings).  
- Shown as a collapsible list below the preview.

### 6.8 Fullscreen Editor Mode
- Editor expands to fill the viewport for small-screen users; preview is shown in a drawer that slides in from the right.

### 6.9 Code Snippet Library
- A collapsible sidebar in the editor showing commonly used HTML snippets (boilerplate, table skeleton, form template).  
- Clicking a snippet inserts it at the cursor.

### 6.10 Challenge Difficulty Progression
- Within a topic, challenges are ordered Beginner → Intermediate → Advanced.  
- Completing Beginner unlocks Intermediate (soft gate with a tooltip explaining the recommendation; not a hard lock).

---

## 7. Feedback & Code Coach

### 7.1 Inline Line-Level Feedback
- Where the requirement checker can identify the relevant element/line, show the line number and a highlight annotation in the editor gutter.

### 7.2 Requirement Progress Bar
- A horizontal progress bar above the requirement list fills as requirements pass ("3 of 5 passing").  
- Colour transitions from red → amber → lime as more requirements pass.

### 7.3 Animated Requirement Rows
- Each requirement row has a small checkbox that animates from ○ → ✓ (SVG path draw) when it passes on re-submission.

### 7.4 Feedback History (per Challenge)
- A collapsible accordion of previous submission attempts: timestamp, requirements passed, requirements failed.  
- Lets learners see their own progression.

### 7.5 "Explain This Requirement" Expandable
- Each requirement row has an ▸ expand button that shows a 2–3 sentence explanation of why this HTML practice matters (semantic meaning, browser behaviour, accessibility).

### 7.6 Code Coach Persona
- Give the Code Coach a subtle identity: a name (e.g., "ORION"), a small avatar icon, and consistent conversational tone in all its messages.  
- No fake AI branding; bio clearly states it is rule-based.

---

## 8. Gamification & Motivation

### 8.1 XP & Level System
- Every meaningful action awards XP: lesson read (+10), quiz passed (+25–50), challenge completed (+50–100), challenge completed without hints (+20 bonus).  
- XP accumulates into levels (1–20) with a named rank per tier (Cadet → Explorer → Navigator → Architect → Luminary).  
- Level and rank shown on the dashboard hero.

### 8.2 Achievement Badge Gallery
- Full-width grid of collectible badges on a dedicated `/achievements` page.  
- Badges locked by default; grayed-out silhouettes with a "How to unlock" tooltip.  
- Earned badges animate in with a brief scale-up glow on first acquisition.

### 8.3 Challenge Completion Streak
- Tracks consecutive days with at least one challenge attempted.  
- Shows a "🔥 7-day streak" badge on the dashboard.  
- Streak is stored as a last-activity date + count; honest about timezone-local day boundaries.

### 8.4 "First Blood" & Milestone Events
- Special single-emission confetti burst (canvas, < 2 s, reduced-motion aware) for: first lesson completed, first quiz passed, first challenge completed, first mastered topic.  
- Each fires at most once per milestone, ever.

### 8.5 Leaderboard (Local)
- A personal "Personal Best" table: fastest quiz time per topic, highest score, fewest hints used.  
- Local only; no server; no real-time multi-user comparison.

### 8.6 Daily Challenge Completion Stamp
- Completing the daily challenge stamps a calendar square with a glowing lime mark.  
- 7 consecutive daily challenges awards "Weekly Orbit" badge.

### 8.7 Rank Progression Toast
- When the learner levels up, a toast slides in with the new rank name, a short motivational line, and the badge icon.

---

## 9. Search & Discovery

### 9.1 Command Palette
- `Cmd/Ctrl + K` opens a spotlight-style command palette.  
- Searches: topics, lessons, challenges, bookmarks, notes.  
- Also accepts action commands: "Go to mastery map," "Reset daily challenge," "Clear progress."  
- Keyboard-navigable list; `↵` to select, `Esc` to close.

### 9.2 Fuzzy Search with Highlighted Matches
- Search results highlight matched characters in the result titles (bold + accent color).  
- Uses a lightweight fuzzy-match library (e.g., fuse.js) against an indexed list of topics/lessons/challenges.

### 9.3 Filter & Tag System
- Topics and challenges are taggable (e.g., `semantic`, `forms`, `accessibility`, `advanced`).  
- A filter bar on the catalog and orbit pages lets learners narrow by tag, difficulty, or completion status.

### 9.4 "Related Topics" Panel
- Inside a lesson, a sidebar section lists 2–4 related topics (from prerequisite and peer-group data).  
- One-click navigation to a related topic without losing current scroll position in a separate tab model.

---

## 10. Notebook, Bookmarks & Error Review

### 10.1 Rich Text Notes (Markdown Subset)
- Notes editor accepts simple Markdown (bold, italic, inline code, bullet lists).  
- Rendered view toggles with an "Edit / Preview" tab within the note card.

### 10.2 Note Tagging & Search
- Each note can have 1–3 user-typed tags.  
- Notes page supports filtering by tag and free-text search across all note content.

### 10.3 Error Notebook Flashcards
- Error notebook entries can be toggled into flashcard mode: the challenge title and failed requirement are shown; tapping reveals the explanation and solution.  
- Useful for quick revision before a test.

### 10.4 Bookmark Folders
- Group bookmarks into named folders (e.g., "Forms revision," "Exam prep").  
- Drag-and-drop reordering within a folder.

### 10.5 "Mark as Understood" Flow
- Each error notebook entry has a "I understand this now" action that moves it to a "Resolved" sub-section.  
- Resolved entries are still searchable but visually de-emphasised.

### 10.6 Export Notes / Bookmarks
- A button on the Notes and Bookmarks pages exports the data as a JSON file (or Markdown text file for notes).  
- This is an explicit action; no automatic cloud sync.

---

## 11. Mastery Map

### 11.1 Force-Directed Skill Graph
- Full mastery map rendered as an interactive, zoomable force-directed graph (D3.js or a lightweight custom implementation).  
- Nodes represent topics; edges represent real prerequisite relationships.  
- Learner can pan/zoom and click any node to jump to that topic.

### 11.2 Mastery Heatmap View
- Alternative "heatmap" view: a flat grid of topic tiles, colour-coded from cold (not started) to hot (mastered).  
- Quick overview of knowledge gaps across the whole curriculum.

### 11.3 Time-to-Completion Estimate
- Based on average lesson/quiz/challenge times and remaining incomplete topics, show an estimate: "~4 h 20 min left in HTML track" (rule-based, not ML).

### 11.4 Knowledge Gap Recommendations
- If a learner has completed later topics but skipped earlier ones, a banner flags the gap: "You've completed Forms but Semantic HTML is still in progress — recommended before submission."

---

## 12. Progress & Analytics

### 12.1 Learning Velocity Chart
- Line chart (custom SVG or lightweight chart lib) showing XP earned per day over the last 14 days.

### 12.2 Topic Time Estimates vs Actual
- Table comparing the estimated vs actual time a learner spent per topic group (tracked by session timestamps).

### 12.3 Quiz Performance Breakdown
- Per-topic quiz score history: first attempt, best attempt, number of retries.  
- Identifies "weak" topics (score < 70 % on first attempt).

### 12.4 Challenge Attempt Heat Table
- Per-challenge: number of attempts, requirements passed on first try, hints used, time to complete.  
- Exportable as CSV.

### 12.5 Progress Sharing Card
- A styled, shareable "achievement card" image generated on canvas showing: learner name (if set), track, XP, level, mastered topics.  
- Downloaded as a PNG. No external server needed.

---

## 13. Accessibility & Inclusivity

### 13.1 Font Size Scaler
- Three preset font size multipliers (Compact / Default / Large) adjustable from Settings.  
- Applied via `font-size` on `:root`; all `rem`-based typography scales cleanly.

### 13.2 Dyslexia-Friendly Font Toggle
- Optional switch to apply OpenDyslexic (locally bundled or CDN) for lesson prose.

### 13.3 High-Contrast Mode
- A fourth theme override that maximises contrast ratios and removes blurred/translucent surfaces.

### 13.4 Screen-Reader Progress Announcements
- `aria-live="polite"` region announces quiz result, challenge pass/fail, XP gain, and level-up without screen-reader focus moving unexpectedly.

### 13.5 Keyboard Shortcut Reference Modal
- `?` key opens a full list of all keyboard shortcuts, organised by context (global, editor, orbit, quiz).

---

## 14. Settings & Personalisation

### 14.1 Learner Profile Card
- Name and optional avatar (initials-based generated avatar using canvas, no upload required).  
- Shown in the nav bar and dashboard hero.

### 14.2 Preferred Learning Pace
- "Relaxed / Focused / Sprint" mode toggle.  
- Affects: Daily challenge difficulty range, recommended next topic algorithm, and dashboard prominent card order.

### 14.3 Notification / Reminder System (Local)
- An opt-in browser Notification API reminder set to a user-chosen daily time ("Remind me to practise at 18:00").  
- No server; uses `Notification` API + a stored preference.

### 14.4 Data Management Panel
- Shows: localStorage usage in KB, last save time, schema version.  
- Actions: Export all data as JSON, Import from JSON backup, Reset progress (with typed-confirmation guard).

### 14.5 Editor Preferences
- Font family (monospace options), font size, tab size, word-wrap toggle, auto-close tags toggle.

---

## 15. Onboarding & Empty States

### 15.1 First-Run Onboarding Tour
- On first visit, a 4-step guided spotlight tour (using a custom overlay + spotlight cutout) introduces: the orbit, the strip, the lesson panel, and the practice workspace.  
- "Skip tour" always available; tour is re-playable from Settings.

### 15.2 Animated Empty States
- Every empty state (no bookmarks, no notes, no errors yet) has a small inline SVG illustration and a contextual call-to-action, not just grey placeholder text.

### 15.3 "What to do next" Smart Card
- On the dashboard, a rule-based card suggests the single most relevant next action: e.g., "You've read the lesson — try the quiz," or "3 topics left in Foundations — finish the group."

---

## 16. Performance & Reliability

### 16.1 Route-Level Code Splitting
- Each route bundle loaded lazily with `React.lazy` + `Suspense`.  
- Skeleton screens shown while a lazy bundle loads.

### 16.2 Optimistic UI Updates
- Progress saves and notes feel instant; the actual `localStorage` write happens in the background with a retry on failure.

### 16.3 Offline-First Behaviour
- A `service-worker` (Workbox) caches lesson assets, the app shell, and static challenge data.  
- A small "Offline — using cached content" banner appears when the network is unavailable.

### 16.4 localStorage Quota Guard
- Before every write, check remaining quota estimate; warn if < 200 KB remains.  
- Offer to export and clear old drafts.

### 16.5 Error Boundary with Recovery UI
- Every major section wrapped in a React error boundary that shows a friendly "Something went wrong" panel with a "Reload section" action instead of a blank screen.

---

## 17. Future / Phase 2 Explorations

> These are longer-horizon ideas — not for the initial release but worth designing for in the data model.

| Idea | Description |
|---|---|
| Multi-track curriculum | CSS, JS, Bootstrap tracks with shared orbit shell |
| AI-powered hint expansion | Optional API-backed contextual hint (requires backend + key management) |
| Peer challenge sharing | Share a completed challenge (code + result) via URL-encoded snapshot |
| Spaced repetition review | Quiz questions scheduled for review based on time-since-last-attempt |
| Live HTML validator | Integration with the W3C validation API (optional, network-dependent) |
| Mobile app (PWA installable) | Add `manifest.json` + service worker so the app installs as a PWA on Android/iOS |
| Custom challenge creator | A form to define a new challenge and save it to local storage for personal practice |
| Multiplayer challenge race | Two devices on the same LAN compete on the same timed challenge (WebRTC or local broadcast) |
| Portfolio export | Generate a simple HTML portfolio page from the learner's completed projects |
| Voice-read lesson text | Web Speech API reads lesson prose aloud; pause / speed controls |

---

## Priority Implementation Order (Suggested)

| Priority | Enhancement | Impact | Effort |
|---|---|---|---|
| 🔴 High | Monaco / CodeMirror editor (§6.1) | Transforms the practice feel | Medium |
| 🔴 High | XP + level system (§8.1) | Drives return visits | Medium |
| 🔴 High | Command palette (§9.1) | Power-user UX + discoverability | Medium |
| 🔴 High | Star pulse + orbital trail animations (§2.1–2.2) | Signature visual moment | Low–Medium |
| 🔴 High | First-run onboarding tour (§15.1) | Removes confusion for new users | Medium |
| 🟡 Medium | Dynamic nebula background (§1.1) | Immediate wow factor | Low |
| 🟡 Medium | Drag-and-drop quiz sorter (§5.2) | New learning modality | Medium |
| 🟡 Medium | Diff viewer (§6.4) | Real learning value | Medium |
| 🟡 Medium | Achievement badge gallery (§8.2) | Motivation + visual richness | Medium |
| 🟡 Medium | Streak calendar (§3.2) | Habit-forming | Low |
| 🟢 Lower | Force-directed mastery graph (§11.1) | Impressive but secondary | High |
| 🟢 Lower | Service worker / offline (§16.3) | Reliability | Medium |
| 🟢 Lower | Progress sharing card (§12.5) | Shareability | Medium |

---

*Document created: 2026-10-24. Update this file as items are confirmed, scoped, or deprioritised.*
