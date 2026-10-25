# Stage 14 — Notes, bookmarks, Error Notebook flashcards and export

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 14 · **Slug:** `notes-bookmarks-review` · **Branch:** `stage-14-notes-bookmarks-review`

**Objective.** Upgrade personal knowledge tools: Markdown-subset notes with tags and search, bookmark folders, flashcard review of the Error Notebook, 'mark as understood' polish and export.

**In scope**
- 10.1 rich-text notes (safe Markdown subset), 10.2 note tagging and search, 10.3 Error Notebook flashcards, 10.4 bookmark folders, 10.5 'Mark as understood' flow polish, 10.6 export notes/bookmarks.

**Out of scope**
- Spaced repetition scheduling (Stage 18).

## 2. Prerequisites and dependencies

- Stage 13 exit gate green (search index), Stage 08 (section bookmarks).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `10.1` Rich Text Notes (Markdown Subset), `10.2` Note Tagging & Search, `10.3` Error Notebook Flashcards, `10.4` Bookmark Folders, `10.5` "Mark as Understood" Flow, `10.6` Export Notes / Bookmarks
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-07 (forms: textarea, tag input), FC-03, FC-05, FC-25

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Existing note per topic, bookmark toggle, Error Notebook statuses and capture rules; Review page flow.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/state/types.ts, reducer.ts, storage.ts | Schema **v6**: `NoteRecord {text, format:'markdown', tags, updatedAt}`; `bookmarkFolders: Array<{id,name,itemIds}>`; migration `v5→v6` converts existing notes (`format:'markdown'`, `tags: []`) and creates the default 'Unsorted' folder from `bookmarks`. |
| src/pages/Review.tsx | Tabs: List \| Flashcards. |
| src/core/orbit/constellation/TopicDetailsPanel.tsx | Notes editor/preview, bookmark folder picker. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/notes/markdown.ts | Tiny renderer for: paragraphs, `#`–`###`, `**bold**`, `*italic*`, `` `code` ``, fenced code, lists, links (http/https/relative only). Output is React nodes — never `dangerouslySetInnerHTML`. |
| src/core/notes/NoteEditor.tsx | Textarea + preview toggle, tag input, autosave indicator. |
| src/core/notes/NotesPage.tsx (`/notes`) | All notes: search, tag filter, sort. |
| src/core/notes/BookmarksPage.tsx (`/bookmarks`) | Folders, move/rename/delete, section bookmarks. |
| src/core/learning/Flashcards.tsx | Front: question/title; back: detail/code/solution hint; Know/Review again buttons set status. |
| src/core/storage/exportNotes.ts | Markdown and JSON export of notes + bookmarks. |

## 7. Implementation steps (execute in order)

1. Inspect current note/bookmark/error code and tests.
2. Write migration v5→v6 with fixtures; tests first.
3. Markdown renderer with an XSS test corpus (script tags, `javascript:` links, event attributes, nested HTML) — all rendered as inert text.
4. Notes editor/page, tags (Tag input from `core/ui`), search integration (index sources).
5. Bookmark folders (default 'Unsorted'); topic and section bookmarks supported; drag-free move via menu.
6. Flashcards keyboard flow: Space flips, `1` Review again, `2` Understood; announces card count.
7. Export buttons (Markdown/JSON) with filenames and a count summary.
8. QA at four viewports; axe; keyboard.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

```ts
interface NoteRecord { text: string; format: 'markdown'; tags: string[]; updatedAt: number }
interface BookmarkFolder { id: string; name: string; itemIds: string[] }   // itemIds: topic ids or `topic#section`
```
Tags: lowercase, trimmed, ≤ 24 chars, ≤ 8 per note, `[a-z0-9-]`.

## 9. UI/UX expectations

Notes: two-pane (edit | preview) ≥ 900 px, toggle below. Tags as chips with remove buttons. Bookmark folders as an accordion list. Flashcards: single large card, progress 'Card 3 of 9'.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

No notes: EmptyState with 'Write your first note from any topic'. Over-long note (> 20,000 chars) rejected with message. Export with nothing: button disabled with reason.

## 11. Security and performance

Renderer never builds HTML strings; link targets validated by `new URL` allowlist; notes size counted against the quota guard.

## 12. Required tests and regression checks

- `markdown.test.ts` incl. XSS corpus; `notes.migration.test.ts`; Notes/Bookmarks/Flashcards component tests; export content tests; axe; search finds note text.
- Existing Review tests unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] No raw HTML from notes ever reaches the DOM (test corpus).
- [ ] Existing notes survive migration and render as Markdown.
- [ ] Flashcards operate by keyboard only and update statuses and the nav badge.
- [ ] Folders and export round-trip.
- [ ] Notes and bookmarks appear in command palette search.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Error entry creation rules, `understood` semantics.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_14_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 14: Notes, bookmarks, Error Notebook flashcards and export`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 15 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
