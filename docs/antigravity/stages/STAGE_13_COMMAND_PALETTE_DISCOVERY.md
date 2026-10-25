# Stage 13 — Command palette, fuzzy search, filters/tags, related topics, orbit search highlight, shortcuts modal

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 13 · **Slug:** `command-palette-discovery` · **Branch:** `stage-13-command-palette-discovery`

**Objective.** Add keyboard-first navigation and discovery across all content and user data, with a tested fuzzy matcher and a shortcut reference.

**In scope**
- 9.1 command palette, 9.2 fuzzy search with highlighted matches (`<mark>`), 9.3 filter and tag system, 9.4 related topics panel, 2.8 orbit search highlight, 13.5 keyboard shortcut reference modal.

**Out of scope**
- Note/bookmark data (indexed when Stage 14 lands; the index supports them now via `SearchDoc` sources).

## 2. Prerequisites and dependencies

- Stage 08 (lesson sections), Stage 10 (10b: constellation rolled out), Stage 02 (Dialog) exit gates green.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `2.8` Orbit Search Highlight, `9.1` Command Palette, `9.2` Fuzzy Search with Highlighted Matches, `9.3` Filter & Tag System, `9.4` "Related Topics" Panel, `13.5` Keyboard Shortcut Reference Modal
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-02 (`mark`), FC-18 (keyboard events), FC-03 (listbox), FC-32

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Existing keyboard behaviours (orbit keys, Esc in focus mode); the skip link; no global shortcut may fire while typing in inputs/editor.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/components/Shell.tsx | Mount `CommandPalette` and global shortcuts; add search button (top bar/sidebar). |
| src/core/orbit/constellation/* | Accept `highlightIds`; dim non-matching stars to 45% without moving any star (the Stage 10 contract keeps this prop). |
| src/pages/Explore.tsx, Track.tsx | Filter/tag UI (track, status, difficulty, tag). |
| src/core/orbit/constellation/TopicDetailsPanel.tsx | Related Topics panel (prerequisites, dependents, same group, tag overlap). |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/search/fuzzy.ts | Subsequence matcher with scoring (consecutive, word-start, case bonus) returning highlight ranges; no dependency unless justified. |
| src/core/search/index.ts | `buildIndex(tracks, state)`, lazy, memoised; sources: topics, lesson sections, challenges, notes, bookmarks, commands. |
| src/core/search/commands.ts | Command registry and default commands. |
| src/core/search/CommandPalette.tsx | Dialog + combobox/listbox (`aria-activedescendant`). |
| src/core/a11y/shortcuts.ts, ShortcutsModal.tsx | Single registry powering the palette hints and the modal; `?` opens it. |

## 7. Implementation steps (execute in order)

1. Inspect existing key handlers (grep `onKeyDown`, `keydown`) and list conflicts.
2. Write `fuzzy.ts` with exhaustive tests first (empty query, case, order, ties, unicode, long strings).
3. Build the index lazily on first open; tests for coverage of all sources and rebuild on change.
4. Palette UI per `04` §4; shortcut `Ctrl/⌘+K` and `/`; guard against inputs/contenteditable/CodeMirror.
5. Result groups: Navigate, Learn, Practice, Settings, Data, Help; `Enter` runs, `Esc` closes, focus returns.
6. Highlights use `<mark>` (FC-02) with `aria-label` unaffected.
7. Orbit highlight from the Track page filter input; announce 'N topics match'.
8. Filters/tags: URL query params (`?status=in-progress&tag=forms`) so state is shareable and restorable.
9. Related topics logic as a pure function with tests.
10. Shortcuts modal generated from the registry; QA.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

See `01` §B8. `fuzzy(query, text) → { score: number; ranges: Array<[number, number]> } | null`. Shortcut registry entry: `{ id, keys: string[], description, scope: 'global' | 'palette' | 'orbit' | 'editor' }`.

## 9. UI/UX expectations

Palette: centred glass dialog, 560 px max width, input 48 px, results list max 8 visible with scroll, each row icon + title + path/hint + shortcut `Kbd`. Highlighted characters use `<mark>` with accent-wash background (contrast tested). Mobile: full-width sheet from top.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

No results: 'No matches for “x”' + suggestion to clear filters. Index building: results appear progressively (< 50 ms typical). Disabled commands are omitted.

## 11. Security and performance

Index in memory only (never persisted); debounce 60 ms; cap 50 results; rank before render; large lists virtualised if > 200.

## 12. Required tests and regression checks

- `fuzzy.test.ts`, `index.test.ts`, `commands.test.ts`, palette keyboard tests (open/close/arrow/enter/focus return), shortcut guard test (typing in textarea does not trigger), `related.test.ts`, orbit highlight test, URL-filter tests, axe.
- Existing keyboard tests unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] `Ctrl/⌘+K` opens the palette from every route and never while typing in an input or the editor.
- [ ] Search finds topics, lesson sections, challenges (and notes/bookmarks once they exist) with highlighted matches.
- [ ] Orbit highlighting announces counts and preserves node positions.
- [ ] Shortcut modal lists exactly the registered shortcuts (test compares registry to rendered list).
- [ ] Filters round-trip through the URL.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Orbit keyboard navigation, focus management on route change.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_13_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 13: Command palette, fuzzy search, filters/tags, related topics, orbit search highlight, shortcuts modal`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 14 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
