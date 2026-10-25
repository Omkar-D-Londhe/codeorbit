# Stage 05 — Editor platform: CodeMirror 6 adapter, splitter, auto-save, fullscreen, editor preferences

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

> **Decision gate (soft — a default exists; proceed with it and record that you did):** O-01 (CodeMirror 6 vs Monaco) is a soft gate: proceed with CodeMirror 6 (P-01) and record that you did.

## 1. Stage identity, objective and scope

**Stage:** 05 · **Slug:** `editor-platform` · **Branch:** `stage-05-editor-platform`

**Objective.** Replace the textarea with a CodeMirror 6 adapter behind a language-neutral `EditorAdapter` contract (keeping the textarea as a fallback), and add the split-view resizer, auto-save indicator, fullscreen editor and editor preferences.

**In scope**
- 6.1 CodeMirror 6 with syntax highlighting (HTML now; language ids pluggable), bracket matching, auto-close tags/brackets, line numbers.
- 6.2 splitter with persisted position; 6.3 auto-save indicator; 6.8 fullscreen editor + preview drawer; 14.5 editor preferences.
- `PlainTextEditorAdapter` (existing textarea logic) as fallback and for tests.
- Code highlighting for `CodeBlock` (lessons) via the same highlighter (read-only).

**Out of scope**
- Multi-file tabs, snippets, diff (Stage 06); diagnostics rendering (Stage 07); minimap (Monaco-only, excluded by decision P-01).

## 2. Prerequisites and dependencies

- Stage 03 exit gate green (debounced persistence, settings).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `6.1` Monaco / CodeMirror Editor, `6.2` Split-View Resizer, `6.3` Auto-Save Indicator, `6.8` Fullscreen Editor Mode, `14.5` Editor Preferences
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-18 (events: pointer drag, keyboard), FC-32

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Existing accessibility decision: **Tab does not trap focus by default**; draft keys and `SET_DRAFT`/`CLEAR_DRAFT`; editor `aria-label`; mobile 4-tab Practice layout.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/components/CodeEditor.tsx | Becomes a thin wrapper choosing the adapter by settings; same props (`value`, `onChange`, `label`) plus optional `language`. |
| src/pages/Practice.tsx | Use `Splitter`, auto-save indicator, fullscreen toggle; keep four-tab mobile structure. |
| src/components/CodeBlock.tsx | Optional highlighted rendering via `core/editor/highlight`. |
| src/pages/Settings.tsx | Editor section: engine, font size, tab size, line numbers, wrap, Tab behaviour, auto-close. |
| package.json | Add `@codemirror/state`, `view`, `commands`, `language`, `lang-html`, `autocomplete`, `lint` (lazy-loaded chunk). |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/editor/types.ts | `EditorAdapter`, `EditorHandle`, `EditorOptions`, `EditorDiagnostic` per `01` §B3. |
| src/core/editor/codemirrorAdapter.ts | Dynamic import; theme from CSS variables; `tabCapturesFocus` handling (Esc then Tab, or setting). |
| src/core/editor/plainAdapter.ts | Textarea+gutter implementation (moved from `CodeEditor.tsx`). |
| src/core/editor/highlight.ts | Static highlighter producing token spans for `CodeBlock`. |
| src/core/ui/Splitter.tsx | `role=separator`, pointer + keyboard (±2%), double-click reset, persisted ratio. |
| src/core/editor/AutoSaveIndicator.tsx | Dot + relative time; amber when a write fails (reads `saveStatus`). |
| src/core/editor/FullscreenEditor.tsx | Fullscreen layout + right drawer for preview. |

## 7. Implementation steps (execute in order)

1. Inspect `CodeEditor.tsx` usage (Practice only), CSS `.editor*`, tests referencing the editor label.
2. Define the contract and move the textarea logic into `PlainTextEditorAdapter`; component tests keep passing using the plain adapter.
3. Implement the CodeMirror adapter behind dynamic `import()`; theme using tokens (`--code-*`, `--tok-*`); verify contrast of tokens.
4. Keyboard model: default Tab moves focus out; `Esc` then `Tab` documented in an editor help line; setting `Tab inserts indentation` enables the keymap and shows a persistent hint 'Press Esc then Tab to leave the editor'.
5. Splitter: horizontal ≥ 900 px, vertical 768–899 px, hidden on mobile tabs; ratio clamped 25–75%; reset button.
6. Auto-save indicator tied to debounced save status from Stage 03 (`saved 3 s ago`, relative time updates every 10 s while visible).
7. Fullscreen: `Esc` exits; focus returns to trigger; preview as drawer (`Drawer` from Stage 02).
8. Editor preferences wiring and persistence; fallback to plain adapter if the chunk fails to load (error toast, no crash).
9. Bundle check: editor chunk lazy-loaded; record sizes; visual and keyboard QA.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

See `01` §B3. `CodeEditor` props: `{ value, onChange, label, language?, readOnly?, diagnostics? }`. Editor preference keys are in `Settings.editor`; defaults: engine `codemirror`, fontSize 14.4, tabSize 2, lineNumbers true, wrap false, `tabCapturesFocus` false, autoClose true.

## 9. UI/UX expectations

Editor surface uses `--code-bg`; gutter `--code-gutter`; visible focus ring around the editor container; selection and cursor colours meet 3:1. Toolbar above editor: auto-save indicator (left), fullscreen button, settings link (right). Splitter handle 8 px wide visual, 24 px hit target, grip dots.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

CodeMirror loading → skeleton with the plain textarea already usable (value never lost). Chunk load error → plain editor + toast. Read-only (after solution reveal comparison) → `aria-readonly`. Storage write failure → amber indicator with text 'Draft not saved'.

## 11. Security and performance

CodeMirror chunk ≤ 150 kB gzip, loaded only on Practice/Fullscreen; learner text is never rendered as HTML (CM renders text nodes). No `eval`. Debounce `onChange` → state to 200 ms but keep local editor state immediate.

## 12. Required tests and regression checks

- Adapter contract tests run against both adapters (same suite).
- Splitter keyboard/pointer/persistence tests.
- Auto-save states tests with fake clock.
- Fullscreen focus/Esc tests; axe on Practice.
- Existing Practice integration tests pass unchanged with the plain adapter; one new integration uses CodeMirror in jsdom if feasible, otherwise browser smoke.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Editing in CodeMirror persists drafts exactly like before (reload restores).
- [ ] Tab leaves the editor by default (test) and indents only when the setting is on.
- [ ] Splitter position persists and resets; reachable and operable with keyboard.
- [ ] Editor bundle is a separate lazy chunk; initial route JS growth ≤ 3 kB gzip.
- [ ] Fullscreen + drawer works at 390 px; Esc exits and restores focus.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None (reference leaves the editor unchanged — KEEP-ORIGINAL logic for the plain adapter).

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Draft storage keys/semantics, Practice requirement checking, the preview sandbox.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_05_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 05: Editor platform: CodeMirror 6 adapter, splitter, auto-save, fullscreen, editor preferences`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 06 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
