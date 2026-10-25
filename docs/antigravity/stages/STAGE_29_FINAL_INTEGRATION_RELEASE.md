# Stage 29 — Final integration, hardening and release

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 29 · **Slug:** `final-integration-release` · **Branch:** `stage-29-final-integration-release`

**Objective.** Verify the whole product against the complete matrix, harden performance/security/accessibility, consolidate documentation and course-mapping records, and produce the release candidate.

**In scope**
- Every row in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md` is `Done`, `Gated (decision recorded)` or `Blocked (reason)` with evidence.
- Cross-browser smoke (Chromium, Firefox, WebKit), mobile Safari/Chrome checks, Lighthouse (Performance/Accessibility/Best-Practices/PWA ≥ 90 on the production build over HTTP), offline test, migration test from original v1 and reference-style v1 to the latest schema, security review, dependency audit and bundle review.
- Consolidate `docs/ASSESSMENT_COMPLIANCE.md` (generated from the Atlas), `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`, `DESIGN.md`, `AGENTS.md`; remove the dev-only `/__ui` route from production; remove dead code and unused tokens.

**Out of scope**
- New features.

## 2. Prerequisites and dependencies

- All stages 01–28 have status reports and green exit gates. Hard-gated capabilities (25b, 26 execution, 27 practice, 28 features) may be absent **only** with the owner's decision recorded as 'not approved' or still open and the truthful unavailable state shipped; sub-stage 10b requires O-15 approved.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

No item is *completed* here; this stage only prepares or verifies (see scope).
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** All

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Everything shipped; no behavioural changes except fixes.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| docs/*, README.md, DESIGN.md, AGENTS.md | Final consolidation. |
| package.json | Final scripts: `check` = typecheck + lint + test + build; `test:e2e`. |
| various | Bug fixes discovered during the audit, each with a test. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| docs/antigravity/status/FINAL_STATUS.md | Filled from `FINAL_INTEGRATION_AND_ACCEPTANCE.md`. |
| e2e/full.spec.ts | End-to-end journeys: first run → tour → lesson → quiz → practice → badge; settings change persists; export/import; offline reload; palette; mastery map; analysis (JS) with a verified suggestion. |

## 7. Implementation steps (execute in order)

1. Run the complete `FINAL_INTEGRATION_AND_ACCEPTANCE.md` checklist; each item gets evidence.
2. Matrix audit script: every ID has a status and a stage report reference; list any gaps.
3. Browser matrix and responsive sweep (four viewports × three themes × high contrast × font scale 150% × reduced motion) — fix defects, retest.
4. Security review: re-run G5 across the codebase; dependency audit; confirm no secrets; confirm CSP/sandbox attributes.
5. Performance: bundle budget vs `07` §3; long-task audit; Lighthouse.
6. Migration tests from both v1 fixtures to latest; failure-mode tests (quota, corrupt, newer-version, unavailable).
7. Truthfulness audit (G9) of every number and label; grep forbidden claims.
8. Docs consolidation; tag release candidate (`git tag v1.0.0-rc.1`) **only if the owner asks**.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

No new contracts.

## 9. UI/UX expectations

Visual consistency audit across all screens and states; fix inconsistencies (spacing, focus rings, empty states).

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Verify every empty/loading/error state listed in stage files exists and is tested.

## 11. Security and performance

Final budget check; dependency licence report (`npx license-checker --summary` or equivalent).

## 12. Required tests and regression checks

- Full suite; e2e full spec; cross-browser smoke; Lighthouse; migration; offline; a11y matrix; security tests; Atlas honesty tests.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Constellation visual QA re-done on the final build for every available track at 1440×900, 1280×800, 820×1180, 390×844 and 320×640 with screenshots looked at and the `10` §15 tables filled (or VISUAL: NOT VERIFIED accepted by the owner); G11 complete.
- [ ] `FINAL_INTEGRATION_AND_ACCEPTANCE.md` fully completed with evidence; any NOT VERIFIED item is explained and owner-accepted.
- [ ] All matrix rows resolved (Done / Gated / Blocked) — none 'Planned' silently.
- [ ] Lighthouse ≥ 90 in the four categories on the production build (or recorded reasons).
- [ ] No third-party requests by default; no high/critical audit findings unresolved.
- [ ] Original-v1 data loads into the final app without loss.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

Final comparison: confirm every adapted reference feature (streak, daily, achievements, mastery) still passes the ported reference test intents.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Scope; do not add features at this stage.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_29_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 29: Final integration, hardening and release`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Release (owner decides tagging/deployment) may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
