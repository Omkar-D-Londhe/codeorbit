# 00 — Baseline Audit (evidence-based)

The **original** CodeOrbit ZIP (`8187fe4b…_codeorbit.zip`, git commit `1307572`) is the primary implementation baseline. Audited by reading source (75 files, 5,913 lines in `src/` including tests) and by running it. A second ZIP (`codeorbit_1.zip`) is a *reference implementation*, compared in `05_REFERENCE_ZIP_COMPARISON.md`. Every statement below was read from a real file. Items marked **NOT PRESENT** were searched for and not found. Antigravity must re-verify with `git status`, `ls` and `npm run test` at Stage 01.


## 0. Verified baseline results (the original, run in a scratch copy; the source was not modified)

| Check | Result |
|---|---|
| `npm ci` | succeeds |
| `npm run typecheck` | clean |
| `npm run lint` | clean |
| `npm run test` | **8 test files, 176 tests passed** |
| `npm run build` | `index-*.js` **388.53 kB (121.33 kB gzip)**; CSS ≈ 43 kB |
| Git | single commit `1307572` ("CodeOrbit: HTML learning studio with Learning Orbit, quizzes, sandboxed practice lab") |

Stage 01 must re-measure these on the user's working tree; any difference is reported, not hidden.

## 0.1 Reference ZIP in one paragraph

The reference is the original plus commit `e3e5464`: a mastery map (`/mastery`), derived achievements, meaningful-activity streaks, a deterministic daily challenge, and a rewritten (evidence-based, all `pending-review`) assessment-compliance document. Measured: 9 test files / **218 tests** pass, build 403.30 kB (125.46 kB gzip), identical dependencies. Every other file is identical to the original. Reuse decisions are in `05`.

## 0.2 Course evidence available (for `06`)

Course named in the learner's submissions: **CSI3029 Front End Design and Testing (Lab)**. The lab question sheets and marking criteria are **not** in either ZIP; the only evidence is the reference's `docs/ASSESSMENT_COMPLIANCE.md` (coverage comparison built from the learner's completed submissions) and blueprint §19 (hypotheses). All course-specific mappings are therefore `pending-review` and **non-blocking**.

## 1. Stack and scripts (`package.json`)

| Area | Real value |
|---|---|
| UI | React 19.3.1, React Router DOM 7.18.4 |
| Language / build | TypeScript 6.0.3, Vite 8.3.5 |
| Tests | Vitest 5.0.5, @testing-library/react 16.3.3, jsdom |
| Fonts | `@fontsource-variable` Inter, Fraunces, JetBrains Mono (self-hosted) |
| Scripts | `dev`, `build`, `typecheck`, `lint`, `test`, `test:watch` |
| Styling | Hand-written CSS: `tokens.css`, `base.css`, `components.css`, `pages.css`. No Tailwind/Bootstrap in core. |
| **NOT PRESENT** | Monaco, CodeMirror, D3, fuse.js, GSAP, Framer Motion, any chart or drag-and-drop library, service worker, `manifest.json`, e2e framework |

## 2. Routes (`src/App.tsx`)

`/` Home · `/explore` Explore · `/learn/:technologyId` Track · `/lesson/:topicId` Lesson · `/quiz/:topicId` Quiz · `/practice/:challengeId` Practice · `/progress` Progress · `/review` Review · `*` NotFound. Wrapped in `ErrorBoundary` → `AppStateProvider` → `ToastProvider` → `Shell`. All pages are eagerly imported (**no route-level code splitting**).

## 3. Shell and navigation (`Shell.tsx`)

- ≥768px: sidebar (240px; the design doc describes a 76px icon rail at 768–1099px) with Brand, four nav links (Home, Explore, My Progress, Review) and a save note. <768px: top bar + bottom nav.
- Skip link, focus moves to `<main>` on route change, `StorageBanner` for recovery states, Error Notebook open-count badge.
- **Gap:** no Settings route, no command palette, no search, no theme switcher.

## 4. Domain data (`src/data`)

- `types.ts`: `Technology {id,name,glyph,description,status:'available'|'planned',topicIds}`, `Topic`, `TopicGroup`, `Lesson` (sections with optional `why`/`mistake` callout), `Quiz` (3 questions per topic), `Challenge` (`difficulty`, `prompt`, `objective`, `starterCode`, `requirements`, three `hints`, `solutionCode`, `solutionExplanation`), and a `Rule` union: `doctype, selector, noMatch, textLength, everyHasAttr, everyAttrContains, anyHasAttr, controlsLabelled, headingOrder, fragmentLinksResolve, noLinkText`.
- `curriculum.ts`: 8 groups, **12 HTML topics** with `prerequisiteIds`, 5 technologies (`html` available; `css`, `javascript`, `bootstrap`, `angular` planned, `topicIds: []`). Helpers `getTopic`, `topicsFor`, `dependentsOf`, `prerequisiteEdges`.
- 12 lessons, 12 quizzes, **12 challenges** (one per topic, all `beginner`).
- **Coupling:** `HTML_TECH_ID='html'` and literal `'html'` are hard-coded in `Home.tsx`, `Progress.tsx`, `Explore.tsx`, `lib/routes.ts` (`trackPath` default) and `lib/progress.ts` (`nextAction` default). Rules/validators are DOM/HTML only.

## 5. State and storage

- `state/types.ts`: `CodeOrbitState {schemaVersion, lastVisited?, selectedTopicId?, topics, quizSessions, drafts, challenges, notes, bookmarks, errorNotebook}`. `ChallengeRecord {attempts, hintsRevealed, solutionRevealed, completed, completedWithoutSolution, lastCheck?}`. `ErrorEntry {id, source:'challenge'|'quiz', topicId, refId, title, detail, code?, status:'open'|'understood', createdAt}`.
- `state/reducer.ts` actions: `RESET_ALL, SELECT_TOPIC, VISIT, SET_LESSON_COMPLETE, QUIZ_UPDATE, QUIZ_RESET, QUIZ_FINISH, SET_DRAFT, CLEAR_DRAFT, RECORD_CHECK, REVEAL_HINT, REVEAL_SOLUTION, SET_NOTE, TOGGLE_BOOKMARK, ADD_ERROR, SET_ERROR_STATUS, DELETE_ERROR`.
- `lib/storage.ts`: `STORAGE_KEY='codeorbit:state'`, `BACKUP_KEY='codeorbit:state:backup'`, `SCHEMA_VERSION=1`, append-only `migrations[]` (v0→v1 renames `progress`→`topics`), `sanitizeState`, `loadState/saveState/clearState`, recovery reasons `none|corrupt|newer-version|unavailable|repaired`.
- **Gap:** no settings, XP, streak, activity-event, spaced-repetition or theme state; notes are plain text per topic; bookmarks are a flat id list; no export/import; no quota guard; draft saves are not debounced or indicated.

## 6. Progress model (`lib/progress.ts`)

`TopicStatus = not-started | in-progress | completed | mastered`. `topicProgress()` returns `{lessonDone, quizPassed, quizPerfect, practiceDone, usedSolution, touched, parts, partsTotal, status}`. Mastered = completed + perfect quiz best + every challenge completed without revealing the solution. `trackProgress`, `nextAction`, `openErrorCount` exist. **Gap:** no timestamps per event (only `lastVisited.at`), so streaks/velocity cannot be derived honestly yet.

## 7. Learning Orbit (`components/orbit/*`, `lib/orbitGeometry.ts`)

- *(Baseline description — this arc geometry is legacy and **superseded** by the constellation, L-23.)* Pure geometry: upper half-ellipse, nodes at equal arc length (1024-sample table), `chooseOrbitMode()` → `arch | arch-compact | carousel` derived from node spacing and label collisions, `edgePath()` for prerequisite connectors bowed inward.
- *(Legacy, superseded by L-23; kept as the default until Stage 10a is accepted.)* Components: `LearningOrbit` (container), `OrbitArch` (SVG), `TopicStrip` (horizontal strip with edge fades, roving tabindex), `TopicDetail`, `topicKeys.ts`. Selection lives in `state.selectedTopicId`.
- Tested by `orbit.geometry.test.ts` (126 lines) and `app.test.tsx`.
- **Gap:** no pulse/trail animation, group zones, hover magnify, "you are here" marker, header mini-orbit, or search highlight.

## 8. Practice workspace and preview

- `CodeEditor.tsx`: a **plain `<textarea>` with a line-number gutter**; Tab deliberately not captured (accessibility decision). No syntax highlighting.
- `SandboxedPreview.tsx` + `lib/preview.ts`: iframe with **empty `sandbox`**, `srcdoc`, CSP `default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:`, `referrerPolicy="no-referrer"`. This is a strong boundary and **must be preserved**.
- `Practice.tsx` (288 lines): four-tab mobile layout (Brief/Editor/Preview/Feedback), deterministic Code Coach via `validators.ts` (DOMParser rules), three progressive hints, solution reveal, error-notebook capture.
- **Gap:** no resizer, no diff viewer, no device frames, no a11y linter, no multi-file, no snippets, no difficulty progression (all 12 challenges are `beginner`), no auto-save indicator, no fullscreen editor.

## 9. Quiz and lesson

- `Quiz.tsx` (174 lines), `lib/quiz.ts`: one question type (multiple choice, native radios in a fieldset). **Gap:** no other question types, timer, breakdown, or XP.
- `Lesson.tsx` (156 lines): two-column layout with study panel. **Gap:** no reading progress, TOC, tooltips, takeaways, estimated time, section bookmarks or syntax-highlighted code (`CodeBlock` has working Copy only).

## 10. Design system

Real tokens in `tokens.css` (64 lines): `--bg #111219`, `--surface #191b25`, `--surface-raised #222533`, `--surface-high #292c3c`, `--border #2e3142`, `--accent #9a8bff`, `--success #c3f477`, `--warning #f2b85b`, `--danger #ff7f7f`, `--focus #c4baff`; type scale, 4px space scale, radii 6/10/14, motion 120/220/360ms, `--sidebar-w 240px`, `--rail-w 76px`, `--content-w 1120px`, z-index scale. Documented in `DESIGN.md`. **Single theme only** (Obsidian). No glass surfaces, no scrollbar styling, no accent switching.

## 11. Tests (9 files)

`app.test.tsx` (513 lines, integration), `curriculum`, `orbit.geometry`, `preview`, `progress`, `quiz`, `storage`, `validators`, plus `setup.ts`. No e2e, no accessibility-automation (axe), no visual regression.

## 12. Existing documentation

`README.md`, `DESIGN.md`, `AGENTS.md`, `docs/{ASSESSMENT_COMPLIANCE,DECISIONS,TEST_PLAN,WORKLOG}.md`, and `docs/reference/{CODEORBIT_BLUEPRINT,UI_DESIGN_SPEC,DECISIONS,ASSESSMENT_COMPLIANCE,TEST_PLAN}.md`. `AGENTS.md` states "HTML is the only complete learning track in the first release" and "frontend learning studio"; both are **superseded** by the language-neutral direction (see `07`, decision D-01) and must be updated in Stage 01.

## 13. Capability matrix (catalog areas vs reality)

| Capability | State |
|---|---|
| Lessons, quizzes, challenges, error notebook, progress, orbit, sandboxed preview, storage recovery | **Implemented** |
| Responsive shell, skip link, focus management, reduced-motion handling | **Implemented** |
| Rich editor, XP/levels, badges, streaks, daily challenge, command palette, search, onboarding, themes, settings, export/import, PWA/offline, code splitting, analytics, mastery graph, spaced repetition | **NOT PRESENT** |
| CSS/JS/Bootstrap/Angular curricula | **NOT PRESENT** (declared `planned` only) |
| Complexity analysis, optimisation suggestions, code execution for non-web languages | **NOT PRESENT** |

## 14. Risks observed

1. HTML coupling in pages and validators blocks multi-track use (Stage 01, 21).
2. `CodeEditor` width is computed from the longest line in `ch`; replacing it must keep mobile layout and the no-keyboard-trap rule (Stage 05).
3. `app.test.tsx` is a single large integration file; new stages should add focused test files rather than grow it.
4. State is one reducer with one persisted blob; adding many features risks a large single write per keystroke. Stage 03 must introduce debounced, quota-aware persistence.
5. The empty-`sandbox` preview cannot run JavaScript. JS/Python tracks need a different, equally strict runner (Stage 23, 25).
