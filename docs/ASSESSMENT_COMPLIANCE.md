# Assessment compliance — evidence-based status

> **Auto-generated supporting record.** Generated from `src/core/concepts/concepts.ts` via `npm run docs:concepts`. Do not edit manually.

**Nothing in this file is marked verified.** The original assessment *requirement* documents were not supplied.

## Source review
| # | Source | In workspace? | Reviewed? | Finding |
|---|---|---|---|---|
| S-1 | Frontend Design Lab assessment (question sheet) | ❌ | — | Not provided. |
| S-2 | Testing Lab assessment (question sheet) | ❌ | — | Not provided. |
| S-3 | `now.zip` → 41 PDFs `24MIC0135_FE_Lab_Assess_*` / `Frontend Lab *` (course **CSI3029 Front End Design and Testing (Lab)**) | ✅ | Partially (OCR of cover pages) | These are **completed lab submissions** (name, reg. no., screenshots of results), not requirement text. They are image-only PDFs; OCR cover text confirms the course code and that submissions are screenshots of working pages (e.g. Assessment 29 shows a mouse-event box). They contain no marking criteria, so they cannot verify any requirement. |

**Blocker recorded:** without S-1/S-2, no assessment row can be verified. Unaffected work continued. Please supply the question sheets (or confirm which required techniques/libraries apply) to complete this matrix.

## Summary statistics
- **Total registered concepts:** 32
- **Applied in platform:** 25
- **Teaching-only (no platform use claimed):** 7
- **Pending review:** 31
- **Not required:** 1
- **Verified:** 0

## Frontend concepts application matrix
| ID | Concept | Area | Platform use | Teach (Track / Topic) | Evidence tests | Status | Assessment Ref |
|---|---|---|---|---|---|---|---|
| FC-01 | Document structure & landmarks | html | Single-page shell structure with header, main content, and landmarks (index.html, src/components/Shell.tsx) | html:html-structure (ch-html-structure) | `curriculum.test.ts`<br>`validators.test.ts` | `pending-review` | — |
| FC-02 | Headings, paragraphs & text formatting | html | Page heading hierarchy and typography across views (src/components/Shell.tsx, src/pages/Explore.tsx) | html:headings-paragraphs (ch-headings-paragraphs)<br>html:text-semantics (ch-text-semantics)<br>html:text-semantics (ch-html-formatting) | `curriculum.test.ts`<br>`validators.test.ts` | `pending-review` | — |
| FC-03 | Lists & navigation sequences | html | Shell navigation list and command palette list items (src/components/Shell.tsx) | html:lists (ch-lists)<br>html:lists (ch-html-nested-lists) | `curriculum.test.ts`<br>`validators.test.ts` | `pending-review` | — |
| FC-04 | Images, SVG emblems & text alternatives | html | SVG navigation icons, status emblems, and visual assets (src/components/Shell.tsx) | html:images (ch-images) | `curriculum.test.ts` | `pending-review` | — |
| FC-05 | Hyperlinks, skip links & anchor navigation | html | Accessible skip to content link and routing anchors (src/components/Shell.tsx) | html:links (ch-links) | `curriculum.test.ts`<br>`app.test.tsx` | `pending-review` | — |
| FC-06 | Data tables with captions & headers | html | Challenge attempt heat matrix and time tracking tabular records (src/pages/Progress.tsx) | html:tables (ch-tables)<br>html:tables (ch-html-table-spans) | `insights/attemptHeat.test.ts`<br>`validators.test.ts` | `pending-review` | — |
| FC-07 | Form controls & input validation | html | Settings preferences and custom challenge authoring forms (src/pages/Settings.tsx) | html:forms (ch-forms)<br>html:forms (ch-html-advanced-forms) | `validators.test.ts` | `pending-review` | — |
| FC-08 | Audio & video multimedia elements | html | Teaching-only (no platform use) | html:media-elements (ch-media-elements) | `voiceRead.test.tsx`<br>`curriculum.test.ts` | `pending-review` | — |
| FC-09 | Semantic page regions & landmarks | html | Application shell landmarks establishing primary navigational regions (src/components/Shell.tsx) | html:semantic-layout (ch-semantic-layout) | `curriculum.test.ts`<br>`app.test.tsx` | `pending-review` | — |
| FC-10 | CSS selectors, cascading & states | css | Design token typography and interactive button hover/focus states (src/styles/components.css) | css:selectors<br>css:cascade-specificity | `contrast.test.ts` | `pending-review` | — |
| FC-11 | Box model, borders & custom properties | css | Spacing system, card containers, and CSS custom property theme tokens (src/styles/tokens.css) | css:box-model<br>css:colour-typography | `contrast.test.ts` | `pending-review` | — |
| FC-12 | Float layout & clear mechanics | css | Teaching-only (no platform use) | css:float-and-clear | `curriculum.test.ts` | `pending-review` | — |
| FC-13 | Flexbox one-dimensional layout | css | Shell header, navigation bar, and toolbar cluster arrangements (src/components/Shell.tsx) | css:flexbox | `uiComponents.test.tsx` | `pending-review` | — |
| FC-14 | CSS Grid two-dimensional layout | css | Progress badge gallery and analytics card grid arrangements (src/core/gamification/BadgeGallery.tsx, src/pages/Progress.tsx) | css:grid | `insights/dashboard.test.tsx` | `pending-review` | — |
| FC-15 | Positioning & stacking contexts | css | Fixed skip link overlay and sticky toolbars (src/components/Shell.tsx, src/styles/base.css) | css:positioning | `starfield.test.tsx` | `pending-review` | — |
| FC-16 | Responsive design & media queries | css | Responsive shell layout adapting between desktop sidebar and mobile navigation (src/components/Shell.tsx, src/styles/components.css) | css:responsive-design | `splitter.test.tsx` | `pending-review` | — |
| FC-17 | Transitions, keyframe animations & reduced motion | css | Navigation interactive hover transitions and motion preference gating (src/components/Shell.tsx, src/styles/components.css) | css:transitions-animations | `useMotionAllowed.test.ts` | `pending-review` | — |
| FC-18 | DOM events & interaction listeners | javascript | Global keyboard shortcuts, roving tabindex, and button interaction handlers (src/components/Shell.tsx) | javascript:events | `search/palette.test.tsx` | `pending-review` | — |
| FC-19 | Dynamic DOM rendering & component trees | javascript | Reactive view rendering and topic card projection in Explore view (src/pages/Explore.tsx) | javascript:dom | `preview.test.tsx` | `pending-review` | — |
| FC-20 | Input validation & feedback mechanisms | javascript | Input validation helpers and settings preference sanitization (src/lib/validators.ts, src/pages/Settings.tsx) | javascript:validation | `validators.test.ts` | `pending-review` | — |
| FC-21 | Structured data: arrays, objects & state | javascript | Central immutable state reducer and structured learner state stores (src/state/types.ts, src/state/reducer.ts) | javascript:data-structures-basics<br>python:py-data-structures<br>java:java-arrays-collections<br>cpp:cpp-recursion-stl | `storage.test.ts`<br>`pythonTrack.test.ts`<br>`javaTrack.test.ts`<br>`cppTrack.test.ts` | `pending-review` | — |
| FC-22 | Functions, composition & pure utilities | javascript | Spaced repetition scheduling algorithm and mastery calculation utilities (src/core/learning/spaced.ts) | javascript:functions<br>python:py-functions<br>java:java-methods<br>cpp:cpp-functions-references | `spaced.test.ts`<br>`pythonTrack.test.ts`<br>`javaTrack.test.ts`<br>`cppTrack.test.ts` | `pending-review` | — |
| FC-23 | Control flow, conditionals & gating logic | javascript | Recommendation engine conditional heuristics and progress gating (src/core/insights/recommendations.ts) | javascript:control-flow<br>python:py-control-flow<br>java:java-control-flow<br>cpp:cpp-control-flow | `insights/recommendations.test.ts`<br>`pythonTrack.test.ts`<br>`javaTrack.test.ts`<br>`cppTrack.test.ts` | `pending-review` | — |
| FC-24 | Carousel & stepper navigation patterns | javascript | Constellation topic stepper with dynamic dot pager and index counter (src/core/orbit/constellation/TopicStepper.tsx, src/pages/Track.tsx) | javascript:gallery | `constellation/topicCounter.test.tsx` | `pending-review` | — |
| FC-25 | Browser persistence & Web Storage API | javascript | Versioned localStorage persistence layer with automatic migration (src/lib/storage.ts, src/pages/Settings.tsx) | javascript:web-storage | `storage.test.ts`<br>`migrations.test.ts` | `pending-review` | — |
| FC-26 | Bootstrap responsive navbar | bootstrap | Teaching-only (no platform use) | bootstrap:navbar | `bootstrapTrack.test.ts` | `pending-review` | — |
| FC-27 | Authentication form patterns | bootstrap | Teaching-only (no platform use) | bootstrap:auth-forms | `bootstrapTrack.test.ts` | `pending-review` | — |
| FC-28 | Bootstrap grid system & utilities | bootstrap | Teaching-only (no platform use) | bootstrap:grid-system | `bootstrapTrack.test.ts` | `pending-review` | — |
| FC-29 | Angular components, templates & services | angular | Teaching-only (no platform use) | angular:ng-components<br>angular:ng-templates<br>angular:ng-data-binding<br>angular:ng-directives<br>angular:ng-services<br>angular:ng-routing | `angularTrack.test.ts`<br>`angularHonesty.test.tsx` | `pending-review` | no course evidence found |
| FC-30 | Front-end testing & assertion suites | testing | Challenge rule grading engine and automated assertion verifiers (src/lib/validators.ts) | javascript:testing-basics<br>python:py-testing-basics | `regression.smoke.test.tsx`<br>`validators.test.ts`<br>`pythonTrack.test.ts` | `pending-review` | — |
| FC-31 | Local development environment & HTTP serving | testing | Teaching-only (no platform use) | html:html-structure | `devRoute.test.tsx` | `not-required` | — |
| FC-32 | Keyboard interaction & accessibility (WCAG) | accessibility | Skip to main content link, roving tabindex, visible focus indicators, and WCAG compliance (src/components/Shell.tsx, src/styles/base.css) | html:accessibility | `a11y.matrix.test.tsx` | `pending-review` | — |

All rows: **pending-review** except not-required rows (requires original question sheets).
