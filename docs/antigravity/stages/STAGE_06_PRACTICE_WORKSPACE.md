# Stage 06 — Practice workspace: multi-file, snippets, device frames, a11y linter, diff, difficulty progression

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 06 · **Slug:** `practice-workspace` · **Branch:** `stage-06-practice-workspace`

**Objective.** Evolve Practice from a single-HTML-document lab into a language-neutral workspace with multiple files, snippets, device-frame previews, an accessibility linter, a post-reveal diff and soft difficulty progression.

**In scope**
- 6.4 diff viewer (after solution reveal), 6.5 multi-file tabs (HTML/CSS/JS stitched for preview), 6.6 device frames, 6.7 a11y linter in preview, 6.9 snippet library, 6.10 difficulty progression.
- Migrate `Practice` to `ChallengeV2.files[]` via the Stage 01 adapter; drafts keyed `challengeId` (single file, backward compatible) or `challengeId::fileName`.
- `CodeRunner` interface with the `iframe-preview` runner wrapping the existing preview (still `sandbox=""`).

**Out of scope**
- Script-enabled preview (Stage 23), Worker execution (Stage 20), feedback line markers (Stage 07).

## 2. Prerequisites and dependencies

- Stage 05 exit gate green (editor contract, splitter, drawer).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `6.4` Diff Viewer (My Code vs Reference), `6.5` Multiple File Tabs (Phase 2 extension), `6.6` Preview Device Frames, `6.7` Accessibility Linter in Preview, `6.9` Code Snippet Library, `6.10` Challenge Difficulty Progression
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-16 (responsive frames), FC-04/FC-07 (linter rules), FC-19 (dynamic rendering)

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- `SandboxedPreview` empty sandbox and CSP, hint/solution reveal semantics and `completedWithoutSolution`, existing 12 challenges and their validators.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/pages/Practice.tsx | File tabs, snippet drawer, device frame selector, linter panel, diff after reveal, difficulty badges/gating tooltip. |
| src/lib/preview.ts | `buildPreviewDocument(files)` stitches `html` + `<style>` from css files + (script files ignored until Stage 23); single-string call still supported. |
| src/components/SandboxedPreview.tsx | Accept `files`, `frame`; iframe stays `sandbox=""`. |
| src/state/reducer.ts, types.ts | Draft keys per file (`SET_DRAFT` unchanged signature; key composition helper). |
| src/data/types.ts / challenges.ts | No content change; adapter produces `files[]`. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/runner/types.ts, iframePreviewRunner.ts | `CodeRunner` contract (`01` §B4) + preview runner. |
| src/core/learning/diff.ts | Line diff (Myers or LCS) pure function + tests. |
| src/core/learning/DiffViewer.tsx | Side-by-side/inline diff with `+`/`−` gutter markers and colour (not colour-only). |
| src/core/ui/DeviceFrame.tsx | CSS frames desktop/tablet 768/mobile 375 wrapping the same iframe. |
| src/tracks/html/a11yLint.ts | Rule-based linter over the parsed preview document (missing `alt`, unlabelled controls, empty headings, duplicate ids, heading order). |
| src/core/learning/SnippetPanel.tsx + tracks/html/snippets.ts | Snippets (boilerplate, table, form) inserted via `EditorHandle.insertAtCursor`. |
| src/core/learning/difficulty.ts | Order beginner→advanced; `isRecommended(challenge, state)`; soft gate (never blocks). |

## 7. Implementation steps (execute in order)

1. Inspect Practice state flow, `validators.ts`, and preview wiring.
2. Introduce `CodeRunner` and route preview through it; tests prove the iframe attributes are unchanged.
3. Switch Practice to `files[]` via adapter; keep UI identical for single-file challenges (no tabs shown for one file).
4. Implement multi-file stitching; a multi-file fixture challenge (test-only) proves CSS tab styles the preview.
5. Diff: pure `diff.ts` with tests (empty, identical, insert, delete, replace, large input ≤ 2,000 lines performance); DiffViewer only enabled once `solutionRevealed` is true.
6. Device frames: toggle group `Desktop | Tablet | Mobile`; frame width via CSS; the iframe `srcdoc` unchanged; announce selection.
7. A11y linter: runs on Check and on explicit 'Run linter'; results list with severity, message, element snippet (escaped), collapsible; never claims WCAG conformance (label 'Quick checks, not a full audit').
8. Snippet panel; insertion respects cursor; undo works (editor history).
9. Difficulty badges and recommendation tooltip ('Try Beginner first — recommended, not required'); gate is a tooltip + `aria-describedby`, never `disabled`.
10. QA at four viewports; keyboard walkthrough of file tabs (Tabs pattern) and drawer.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

```ts
interface PracticeSession { challengeId: string; activeFile: string; frame: 'desktop'|'tablet'|'mobile'; showDiff: boolean }
draftKey(challengeId, fileName, fileCount) => fileCount === 1 ? challengeId : `${challengeId}::${fileName}`
lintHtml(doc: Document): Array<{ id: string; severity: 'error'|'warning'; message: string; selector?: string; snippet?: string }>
diffLines(a: string, b: string): Array<{ kind: 'same'|'add'|'del'; text: string; aLine?: number; bLine?: number }>
```

## 9. UI/UX expectations

Desktop: brief | (editor over preview) | feedback; File tabs above the editor (HTML, CSS, JS only when the challenge defines them). Mobile keeps Brief / Editor / Preview / Feedback tabs; file tabs inside Editor; Snippets as a bottom sheet. Device frames show a bezel and a size caption ('375 × 667').

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Linter: 'No quick-check issues found' (with the disclaimer) / list. Diff before reveal: control disabled with reason 'Reveal the solution to compare'. Preview empty: placeholder text. Frame wider than panel: horizontal scroll *inside* the frame container only.

## 11. Security and performance

Stitching occurs in `buildPreviewDocument`; user CSS goes in `<style>` text (escaped `</style>` handling test). Linter parses with `DOMParser` on the already-sandboxed document string — never attaches to the live DOM. Diff capped at 2,000 lines with a 'too large to compare' message.

## 12. Required tests and regression checks

- `diff.test.ts`, `a11yLint.test.ts` (each rule positive/negative), `difficulty.test.ts`, `preview.test.tsx` (stitching, escaping, sandbox attributes unchanged).
- Practice integration: file tabs, snippet insertion, frame toggle, diff only after reveal, completion flags unchanged.
- Existing Practice tests pass without modification.
- axe + keyboard tests for tabs/drawer/frames.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] All 12 existing challenges still behave identically (tests).
- [ ] A multi-file challenge fixture renders combined output; `</style>` injection in CSS cannot break out (test).
- [ ] Diff is unavailable until solution reveal and marks additions/removals with markers and colour.
- [ ] Device frame buttons change preview width without reloading drafts.
- [ ] Linter flags the four listed issue types and never reports a pass as 'accessible'.
- [ ] `completedWithoutSolution` and mastery rules unchanged (existing progress tests).

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None (reference leaves Practice unchanged).

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Preview sandbox attribute and CSP, validators' rule semantics, hints/solution gating, mastery.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_06_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 06: Practice workspace: multi-file, snippets, device frames, a11y linter, diff, difficulty progression`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 07 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
