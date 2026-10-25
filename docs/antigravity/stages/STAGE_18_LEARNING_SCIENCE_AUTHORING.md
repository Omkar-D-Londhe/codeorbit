# Stage 18 — Spaced repetition, custom challenges, peer snapshots, voice read, portfolio export

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 18 · **Slug:** `learning-science-authoring` · **Branch:** `stage-18-learning-science-authoring`

**Objective.** Add the learning-science and creator tools from the Phase 2 list that need no backend: scheduled review, a custom challenge creator, shareable URL snapshots, read-aloud and portfolio export.

**In scope**
- 17.4 spaced repetition review, 17.7 custom challenge creator, 17.3 peer challenge sharing via URL-encoded snapshot, 17.10 voice-read lesson text, 17.9 portfolio export.

**Out of scope**
- AI hints, multiplayer, W3C validator (Stage 28).

## 2. Prerequisites and dependencies

- Stage 14 exit gate green (notes/flashcards, export), Stage 06 (practice), Stage 09 (quiz types).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `17.3` Peer challenge sharing, `17.4` Spaced repetition review, `17.7` Custom challenge creator, `17.9` Portfolio export, `17.10` Voice-read lesson text
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-07 (forms), FC-19, FC-21, FC-22, FC-25

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Existing Error Notebook and quiz flows; challenge validators; sandbox preview.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/state/types.ts, reducer.ts, storage.ts | Schema **v8**: `review: Record<cardId, ReviewCard>`; `custom: { challenges: ChallengeV2[] }`; migration `v7→v8` adds empties. |
| src/pages/Review.tsx | Third tab 'Due today' (spaced repetition). |
| src/pages/Practice.tsx | Accepts custom challenge ids (`custom:<id>`) and shows 'Shared snapshot' read-only banner. |
| src/lib/routes.ts | `/create`, `/share`. |
| src/lib/reducer meaningful table | Add `review-answer` as a meaningful action (D2). |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/learning/spaced.ts | SM-2-style scheduler: grades `again/hard/good/easy`; intervals 1, 3, 7, 16… days; pure functions `schedule(card, grade, now)`, `dueCards(cards, now)`; cards generated from quiz questions the learner got wrong or flagged and from Error Notebook entries. |
| src/core/learning/DueReview.tsx | Review session UI, keyboard `1–4`. |
| src/core/authoring/ChallengeCreator.tsx (`/create`) | Form: title, language/track, files, requirements (selector/text rules from the track's rule palette), hints, solution; live preview; validation; saves to `custom.challenges`. |
| src/core/share/snapshot.ts | Encode `{v, trackId, files, title}` → base64url (deflate via `CompressionStream` when available) in the URL fragment; hard cap 8 KB; decode + schema validate; read-only. |
| src/core/speech/VoiceRead.tsx | `speechSynthesis` controls: play/pause/stop, speed 0.75–1.5, voice select; highlights the current paragraph; feature-detected. |
| src/core/portfolio/exportPortfolio.ts | Generates a self-contained HTML page of the learner's **completed** HTML-track challenge solutions (their own code), downloaded locally; escapes everything; each project in an `<iframe sandbox srcdoc>`. |

## 7. Implementation steps (execute in order)

1. Inspect Error Notebook and quiz code to decide card sources.
2. Write `spaced.ts` tests first (intervals, lapses reset, due ordering, DST-safe dates via day keys).
3. Wire cards creation: wrong quiz answers and 'Add to review' on any lesson section; migration v7→v8.
4. Due review UI + nav badge + dashboard 'Due today' count (derived).
5. Challenge creator: restrict to the rule palette of the chosen track so every created challenge is checkable; refuse challenges with no requirements; preview via the track runner; quota guard counts custom data.
6. Snapshot sharing: build URL, copy button, import page `/share#…` → shows read-only code with 'Try it in your workspace' (creates a local copy after confirmation). Never auto-run code.
7. Voice read: read lesson sections via paragraph queue; honour reduced-motion (no animated highlight); disabled with message when unsupported.
8. Portfolio export: includes only passed challenges with learner's final drafts; clearly states 'Your code only'; opens nothing remote.
9. QA; docs.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

### 7a. Sub-stages

This stage is large. To keep each working session reviewable it may be executed as the sub-stages below **without dropping any scope**: the stage is complete only when every sub-stage gate and every §13 box is green. Each sub-stage uses branch `stage-NN<letter>-<slug>`, its own status report (`STAGE_NN<letter>_STATUS.md`) and its own exit gate. Give Antigravity one sub-stage at a time (guide §10).

| Sub-stage | Title | Scope (from §1/§7) | Sub-stage exit gate |
|---|---|---|---|
| 18a | Schema v8, spaced repetition and voice read | One migration `v7→v8` adding both `review` and `custom.challenges` (fixtures), `review` state, queue, speech synthesis with honest limits | Migration + review/SM tests green |
| 18b | Creator, snapshots, portfolio | Uses the `custom.challenges` field from v8 (no new schema version); creator UI, peer snapshot encode/decode, portfolio export | XSS/size-cap tests green |

## 8. Component behaviour, state, data contracts and integration

```ts
interface ReviewCard { id: string; source: { kind: 'quiz'|'error'|'section'; refId: string }; due: string /* dayKey */; intervalDays: number; ease: number; lapses: number; lastGrade?: 'again'|'hard'|'good'|'easy'; lastAt?: number }
type SnapshotV1 = { v: 1; trackId: string; title: string; files: Array<{ name: string; content: string }> }
schedule(card, grade, nowDayKey) => ReviewCard
```

## 9. UI/UX expectations

Due review: single card, 'Show answer' then four grade buttons with intervals ('Again · 1 day'); progress 'Card 2 of 7'. Creator: stepper form (Details → Files → Requirements → Hints & solution → Preview), each step validates. Share dialog shows size meter 'Link size 2.1 KB of 8 KB'. Voice bar sticks under the lesson header.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

No due cards: 'Nothing due today' with next due date. Snapshot invalid/too large/unknown track → error page with no code executed. Speech unsupported → control hidden with explanation. Portfolio with no completed challenges → disabled with reason.

## 11. Security and performance

Decoded snapshots are treated as untrusted text (rendered in editor/preview sandbox only). Size and schema caps. No network. Compression optional with graceful fallback to uncompressed.

## 12. Required tests and regression checks

- `spaced.test.ts`, snapshot encode/decode round-trip and malicious/oversized inputs, creator validation, portfolio HTML escaping (script injection test), voice component feature-detection tests, migration v7→v8, meaningful-action table update test.
- Existing Review/Practice tests unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Review schedule matches the documented intervals (tests).
- [ ] A created challenge is checkable and persists; invalid ones cannot be saved.
- [ ] Snapshot links round-trip and never execute code on open (test + sandbox check).
- [ ] Portfolio contains only the learner's own completed work, fully escaped.
- [ ] Answering a review card records a streak day; viewing does not.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

D2 meaningful-activity table extended with `review-answer`.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Existing mastery rules; review answers never change mastery (L-15).
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_18_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 18: Spaced repetition, custom challenges, peer snapshots, voice read, portfolio export`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 19 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
