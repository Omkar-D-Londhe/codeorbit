# Stage 08 — Lesson Studio: reading experience, TOC, tooltips, bookmarks, demos, focus mode

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 08 · **Slug:** `lesson-studio` · **Branch:** `stage-08-lesson-studio`

**Objective.** Turn the lesson page into a polished reading studio with progress, navigation, highlighted code, definition tooltips, estimated time, takeaways, an accessibility side box, section bookmarks, live interactive demos and a reversible focus mode.

**In scope**
- 4.1 reading progress bar, 4.2 section-level bookmark, 4.3 inline code highlighting, 4.4 live interactive demos, 4.5 definition tooltips, 4.6 estimated time, 4.7 table of contents, 4.8 key takeaways box, 4.9 accessibility check side box, 4.10 focus (dark-room) mode.
- Authoring fields on `Lesson`: `takeaways`, `terms`, `demos`, `a11yNotes`, `estimatedMinutes` (optional, labelled estimate).

**Out of scope**
- Notes editor (Stage 14), voice read (Stage 18), concept 'See it in CodeOrbit' links (Stage 19).

## 2. Prerequisites and dependencies

- Stage 05 exit gate green (highlighter, `CodeBlock`), Stage 03 (settings, persistence).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `4.1` Reading Progress Bar, `4.2` Section-Level Bookmark, `4.3` Inline Code Highlighting, `4.4` Live Interactive Demos, `4.5` Definition Tooltips, `4.6` Lesson Estimated Time Display, `4.7` Table of Contents Sidebar, `4.8` Key Takeaways Summary Box, `4.9` Accessibility Check Sidebox, `4.10` Dark-Room / Focus Mode for Reading
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-05 (fragment links), FC-19 (dynamic rendering), FC-02

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Lesson content for all 12 topics, 72ch reading measure, `SET_LESSON_COMPLETE` semantics and recorded activity day, existing focus management on route change, two-column layout with sticky study panel.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/pages/Lesson.tsx | Sections get stable ids; add progress bar, TOC, bookmark buttons, takeaways, a11y box, focus mode; use the new components. |
| src/data/types.ts + lessons.ts | Optional authoring fields; add takeaways/terms for all 12 lessons and 3+ demos (HTML track). |
| src/state/types.ts, reducer.ts, storage.ts | `bookmarks` stays `string[]` of topic ids; schema **v4** adds `sectionBookmarks: string[]` (`topicId#sectionId`); migration `v3→v4` adds `[]`. |
| src/components/CodeBlock.tsx | Use highlighter from Stage 05; keep Copy with `aria-live` confirmation. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/learning/ReadingProgress.tsx | 2 px bar, `role=progressbar`, scroll-based, throttled. |
| src/core/learning/Toc.tsx | Sticky TOC ≥ 1100 px; collapses to a menu < 900 px; `aria-current` for active section via IntersectionObserver. |
| src/core/learning/DefinitionTerm.tsx | Accessible tooltip/popover for terms (focusable button, `aria-describedby`, Esc closes). |
| src/core/learning/LiveDemo.tsx | Runs a demo through the track's `CodeRunner` preview in the sandboxed iframe with editable source (HTML track now). |
| src/core/learning/Takeaways.tsx, A11yBox.tsx, EstimatedTime.tsx | Presentational components. |
| src/core/learning/FocusMode.tsx | Hides sidebar/TOC/study panel; `Esc` exits; preserves scroll and drafts. |
| src/lib/readingTime.ts | Words ÷ 200 wpm + demo allowance; rounded up; output labelled 'about N min'. |

## 7. Implementation steps (execute in order)

1. Inspect `Lesson.tsx`, section data shape and the study panel.
2. Add stable ids to sections (derived from authored `id`, fallback slug); test uniqueness per lesson.
3. Reading progress and TOC (IntersectionObserver with a jsdom-safe fallback).
4. Estimated time util + authored override; shows 'about N min (estimate)'.
5. Definition terms: parse `{{term:id}}` markers in authored text into `DefinitionTerm`; no HTML injection.
6. Section bookmark buttons (toggle, `aria-pressed`, toast confirmation) and a bookmarks list entry point (list UI completes in Stage 14).
7. Live demos: editable mini-editor + sandboxed preview, 'Reset demo' button, demo code never persisted as a draft.
8. Takeaways + a11y box content authored for 12 lessons.
9. Focus mode with `Esc` exit, visible 'Exit focus mode' button, `aria-live` announcement.
10. QA at four viewports; keyboard walkthrough; axe.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

```ts
interface LessonSectionV2 extends LessonSection { id: string }
interface Lesson { ...existing; takeaways?: string[]; terms?: Record<string, { term: string; definition: string }>; demos?: Array<{ id: string; title: string; files: ChallengeFile[] }>; a11yNotes?: string[]; estimatedMinutes?: number }
sectionBookmarkId(topicId, sectionId) => `${topicId}#${sectionId}`
```

## 9. UI/UX expectations

Reading bar fixed under the top edge (z-index `--z-nav`+1), 2 px accent. TOC left rail on ≥ 1100 px (200 px) with the study panel on the right; < 900 px the TOC is a 'On this page' disclosure at top. Takeaways box: quiet card with 3–5 bullets and a lime-free neutral style (lime is reserved for success). Focus mode: single centred 72ch column on `--bg`.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Lesson without takeaways/terms/demos: those components simply do not render (no empty boxes). Demo runner failure: inline error with Reset. TOC with one section: hidden.

## 11. Security and performance

Demos run only through the sandboxed preview (empty `sandbox`). Scroll handlers use rAF throttling and passive listeners. Estimated time never displayed as exact.

## 12. Required tests and regression checks

- `readingTime.test.ts`, section id uniqueness test across all lessons, `Toc.test.tsx` (active section, keyboard), `DefinitionTerm.test.tsx` (focus/Esc/aria), `FocusMode.test.tsx` (Esc, draft preserved), `LiveDemo.test.tsx` (sandbox attributes).
- Existing lesson tests pass; completion still records the activity day.
- Browser smoke: TOC link scrolls and moves focus to the section heading.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Every lesson shows estimated time, TOC (when > 1 section) and takeaways (authored for all 12).
- [ ] Definition tooltips are keyboard-operable and dismiss with Esc.
- [ ] Section bookmarks persist and survive reload.
- [ ] Live demos render in the sandboxed iframe and cannot execute scripts.
- [ ] Focus mode hides chrome, exits with Esc, preserves scroll position and drafts.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

Reference `Lesson.tsx` change is only `now: Date.now()` (already handled in Stage 03).

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Lesson prose accuracy, completion semantics, mastery.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_08_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 08: Lesson Studio: reading experience, TOC, tooltips, bookmarks, demos, focus mode`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 09 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
