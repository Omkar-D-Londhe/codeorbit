# Stage 27 — Angular track (decision-gated)

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

> **Decision gate (HARD — the gated capability is not built until the owner records a yes in `07`):** O-05 (Angular delivery approach) is a hard gate for **practice delivery only**: no Angular challenges or in-browser build until the owner records a decision. Lessons, quizzes, the decision memo and the `decision-gated` state are ungated.

## 1. Stage identity, objective and scope

**Stage:** 27 · **Slug:** `angular-gated` · **Branch:** `stage-27-angular-gated`

**Objective.** Prepare the Angular track honestly: content, concept mapping and a safe-delivery decision, without pretending an in-browser Angular build exists.

**In scope**
- Curriculum and lessons for Angular fundamentals (components, templates, data binding, directives, services, routing) with read-only annotated examples and quizzes.
- Decision memo `docs/ANGULAR_OPTIONS.md`: (a) precompiled example gallery (static, safe), (b) in-browser compile (heavy, TypeScript + AOT), (c) keep planned.
- Availability stays `decision-gated` until O-05 is resolved; if (a) is chosen, implement the gallery with precompiled bundles rendered in the script-enabled preview (Stage 23).

**Out of scope**
- Authoring challenges that require building Angular code until O-05 is resolved. No course evidence for Angular exists (FC-29 is `pending — no evidence`).

## 2. Prerequisites and dependencies

- Stage 26 exit gate green.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Platform / reference / concept items:** `FC-29` Angular fundamentals (no course evidence)
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-29

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Platform stays React; Angular never enters `src/core` (L-14).

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/app/registerTracks.ts | `angular` availability `decision-gated`. |
| src/pages/Explore.tsx | Card shows 'Decision pending' with a link to the memo summary. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/tracks/angular/{track,curriculum,lessons,quizzes}.ts | Read-only content; no challenges until decided. |
| docs/ANGULAR_OPTIONS.md | Decision memo with sizes, security, maintenance cost. |
| src/tracks/angular/concepts.ts | FC-29 entry with `courseStatus: 'pending-review'` and note 'no course evidence found'. |

## 7. Implementation steps (execute in order)

1. Write the memo with measured facts (bundle sizes of Angular compiler vs precompiled runtime — measure, do not guess).
2. Author fundamentals lessons and quizzes (no executable claims).
3. Register as `decision-gated`; Explore shows the truthful state.
4. If O-05 option (a) is approved during the stage, add the precompiled gallery as `preview` capability and tests; otherwise stop.
5. Atlas entry; QA; docs.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

`availability: 'decision-gated'`; capabilities `['lessons','quizzes']` only.

## 9. UI/UX expectations

Track card with `Decision pending` chip; track page shows lessons/quizzes only; Practice entries absent.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

No practice challenges → Practice links absent (no dead routes).

## 11. Security and performance

Lessons are static data, lazy-loaded.

## 12. Required tests and regression checks

- Availability/capability honesty tests; Explore rendering; Atlas entry test; no Angular imports in core (lint rule).
- Previous suites unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Explore shows 'Decision pending'; no practice entry points exist.
- [ ] FC-29 appears in the Atlas as pending with no invented platform usage.
- [ ] Memo contains measured numbers.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Core architecture; other tracks.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_27_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 27: Angular track (decision-gated)`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 28 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
