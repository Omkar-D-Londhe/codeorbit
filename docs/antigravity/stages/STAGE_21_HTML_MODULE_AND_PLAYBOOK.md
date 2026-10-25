# Stage 21 — Language integration playbook and the HTML track module (with course-evidence gap closure)

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

> **Decision note:** No owner decision blocks this stage. Course verification stays `pending-review` and is non-blocking.

## 1. Stage identity, objective and scope

**Stage:** 21 · **Slug:** `html-module-and-playbook` · **Branch:** `stage-21-html-module-and-playbook`

**Objective.** Finalise the track-module packaging using HTML as the first optional module, write the playbook every later language follows, and close the HTML coverage gaps found in the reference compliance table (text-formatting tags, nested lists, rowspan/colspan, form controls and validation attributes, audio/video) with lessons, demos, exercises and tests.

**In scope**
- PLT-12 playbook (`docs/antigravity/PLAYBOOK_NEW_TRACK.md` copied into the repo as `docs/TRACK_PLAYBOOK.md`) and `scripts/new-track` generator.
- 17.1 multi-track shell: Explore/Track/Practice/Mastery all driven by registry for any `available`/`preview` track; availability states (`available`, `preview`, `planned`, `decision-gated`) rendered truthfully.
- HTML content expansion: FC-02 (`mark`, `sup`, `sub`, `u`), FC-03 (nested lists), FC-06 (`rowspan`/`colspan`), FC-07 (radio, checkbox, select, date, tel, file, `pattern`, `minlength`/`maxlength`), FC-08 (audio/video; new topic `media-elements`), FC-31 optional note.
- Preview CSP for the media topic: `media-src data:` only for challenges flagged `needsMedia` (tiny `data:` samples shipped in the track).

**Out of scope**
- CSS/JS/Bootstrap tracks (Stages 22–24).

## 2. Prerequisites and dependencies

- Stage 20 exit gate green; Stage 19 Atlas exists (entries are updated here).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `17.1` Multi-track curriculum
**Platform / reference / concept items:** `PLT-12` Track integration playbook and generator, `PLT-13` Truthful availability states, `FC-01` Document structure and `title`, `FC-02` Headings, paragraphs, text formatting (`mark sup sub u …`), `FC-03` Lists incl. nested, `FC-04` Images, alt, figure, `FC-05` Links, `target`, fragments, `FC-06` Tables incl. rowspan/colspan, `FC-07` Form controls and validation attributes, `FC-08` Audio and video elements, `FC-09` Semantic regions, `FC-31` Local dev environment note (not required, unconfirmed)
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-01–FC-09, FC-31

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- All 12 existing HTML topics, lessons, quizzes, challenges (ids and behaviour); persisted progress for them; mastery semantics.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/tracks/html/* | Move or re-export content so the track is self-contained; physical `git mv` of `src/data/{lessons,quizzes,challenges}.ts` into `src/tracks/html/` **only if** all tests stay green; otherwise keep re-exports. |
| src/data/curriculum.ts | Becomes `tracks/html/curriculum.ts`; cross-track helpers (`getTopic`) route through the registry. |
| src/lib/validators.ts | Moves to `tracks/html/validators/` behind `ChallengeValidatorFactory`; new rule kinds below. |
| src/lib/preview.ts | Per-challenge CSP extension for media. |
| src/pages/Explore.tsx | Track cards for every registered track with availability chips and capability chips. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| docs/TRACK_PLAYBOOK.md | Step-by-step: define `TrackModule`, curriculum + prerequisites, lessons, quizzes, challenges, validators/runners, snippets, achievements, concept entries, tests checklist, truthful availability rules, capability honesty. |
| scripts/new-track.mjs | Scaffolds `src/tracks/<id>/` with typed stubs and a failing-until-filled test. |
| src/tracks/html/topics: media-elements | Lesson, quiz, challenge (`audio`/`video` with `controls`, `source`/`src`, fallback text, `track` captions). |
| src/tracks/html/validators/rules (new kinds) | `hasAttrValue`, `nestedList`, `cellSpan`, `inputTypes`, `mediaControls` — each with tests; existing `Rule` kinds unchanged. |
| Extended HTML content | Added lessons/quiz questions/challenges for gaps listed; new challenge ids prefixed `ch-html-…`; challenges flagged `difficulty` to support Stage 06 progression (≥ 1 intermediate per group). |

## 7. Implementation steps (execute in order)

1. Inspect the reference `docs/ASSESSMENT_COMPLIANCE.md` coverage table (via `06` §3.1) and the existing 12 topics.
2. Write the playbook and generator first; use them to scaffold the media topic as the first proof.
3. Add rule kinds with tests (positive/negative/edge) then authored challenges.
4. Extend lessons: `forms` (controls and attributes), `text-semantics` (`mark/sup/sub/u`), `lists` (nested), `tables` (spans); keep prose short, accurate and tested against the validators.
5. Add quiz questions of the Stage 09 types for new content.
6. Update Atlas entries (FC-02/03/06/07/08/31) with real teach/exercise/test references; honesty tests green.
7. Packaging: attempt the `git mv`; run all tests; if red, revert the move and keep re-exports.
8. Verify migrations: adding topics/challenges does not corrupt existing progress (fixture with progress on the old 12 topics); orbit still renders 13 nodes correctly in all modes.
9. QA the new topics end-to-end; docs.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

### 7a. Sub-stages

This stage is large. To keep each working session reviewable it may be executed as the sub-stages below **without dropping any scope**: the stage is complete only when every sub-stage gate and every §13 box is green. Each sub-stage uses branch `stage-NN<letter>-<slug>`, its own status report (`STAGE_NN<letter>_STATUS.md`) and its own exit gate. Give Antigravity one sub-stage at a time (guide §10).

| Sub-stage | Title | Scope (from §1/§7) | Sub-stage exit gate |
|---|---|---|---|
| 21a | Playbook, generator, availability states | `TRACK_PLAYBOOK.md`, `npm run new-track`, truthful availability chips, Atlas back-fill | Generator + capability-honesty tests green |
| 21b | HTML gap content | FC-02/03/06/07/08 content, rule kinds, new `media-elements` topic, media CSP exception | Rule + track-structure tests green |

## 8. Component behaviour, state, data contracts and integration

```ts
type Availability = 'available' | 'preview' | 'planned' | 'decision-gated'
// capability honesty: a track lists a capability only if its UI path works end to end and is tested
new Rule kinds: { kind: 'hasAttrValue'; selector; attr; values: string[] } | { kind: 'nestedList' } | { kind: 'cellSpan'; attr: 'rowspan'|'colspan'; min: number } | { kind: 'inputTypes'; types: string[]; min?: number } | { kind: 'mediaControls'; element: 'audio'|'video' }
```

## 9. UI/UX expectations

Explore: track cards with name, glyph, description, availability chip (`Available`, `Preview`, `Planned`, `Decision pending`), capability chips (Lessons, Quizzes, Practice, Preview, Run, Analysis), progress ring when started; unavailable cards are not links (no dead routes, L-08).

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Track with `planned` availability → informational card only. Track registered but no topics → treated as planned. Media sample missing → challenge not listed.

## 11. Security and performance

Media samples tiny (< 20 kB total) as `data:` URIs; CSP extension limited to the flagged challenges; content growth keeps initial JS within budget (lessons are lazy per track).

## 12. Required tests and regression checks

- New rule-kind tests; track structure test (unique ids, prerequisites form a DAG, every topic has lesson/quiz/challenge); migration/progress compatibility test; constellation layout and `validateConstellation` for the 13-topic track in both aspect buckets (no star collisions, edges equal declared prerequisites), list-view parity; Explore availability tests; scaffold generator test.
- All existing 176+ tests unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] The new HTML topics/exercises cover each listed gap with passing tests.
- [ ] A learner with progress in the original 12 topics keeps it untouched after the update (test).
- [ ] `npm run new-track -- demo` scaffolds a valid, test-failing-until-filled track; the playbook references real paths.
- [ ] Explore shows availability truthfully; no dead links.
- [ ] Atlas honesty tests green with updated entries.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

D17 coverage-gap table is the source for the content work; D18 forbids inheriting HTML coupling.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Existing topic/challenge ids, quiz scoring, mastery semantics.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_21_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 21: Language integration playbook and the HTML track module (with course-evidence gap closure)`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 22 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
