# Stage 28 — External-dependency features (AI hints, W3C validator, LAN multiplayer)

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

> **Decision gate (HARD — the gated capability is not built until the owner records a yes in `07`):** O-06 (AI hints), O-07 (multiplayer) and O-14 (W3C validator network use) are each a hard gate for their own feature only. The memo, the services registry and the Settings 'Connected services' section (all `Not connected`) are ungated.

## 1. Stage identity, objective and scope

**Stage:** 28 · **Slug:** `external-dependency-gated` · **Branch:** `stage-28-external-dependency-gated`

**Objective.** Hold the three Phase-2 ideas that require infrastructure the project does not have, and implement each only after an explicit owner decision — otherwise ship nothing misleading.

**In scope**
- 17.2 AI-powered hint expansion, 17.5 live HTML validator (W3C API), 17.8 multiplayer challenge race.

**Out of scope**
- Anything that needs secrets in the frontend; any silent network call.

## 2. Prerequisites and dependencies

- Stage 27 exit gate green.
- Per-feature hard gates: O-06 (AI hints), O-07 (multiplayer transport), O-14 (W3C validator disclosure). Without a recorded yes the feature is not built.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `17.2` AI-powered hint expansion, `17.5` Live HTML validator, `17.8` Multiplayer challenge race
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** —

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- L-05 (Code Coach stays deterministic; AI hints are separate and labelled), privacy rules (no code leaves the browser without explicit, per-action consent).

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/pages/Settings.tsx | 'Connected services' section listing each service as `Not connected` until configured. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| docs/EXTERNAL_FEATURES.md | Decision memos: AI (provider, backend proxy required for key management, cost, data disclosure), W3C validator (endpoint, rate limits, what is sent, offline behaviour), multiplayer (WebRTC needs signalling; cross-tab `BroadcastChannel` only works on one device). |
| src/core/services/registry.ts | `ExternalService { id, name, status: 'not-connected'\|'connected'\|'error', disclosure: string }`. |
| src/tracks/html/validatorW3C.ts (only if approved) | Sends the learner's HTML to the W3C Nu validator **only on a button press** after a disclosure dialog; shows messages with line numbers; clear offline/error handling; never in the background. |
| src/core/services/aiHints.ts (only if O-06 approved) | Calls an owner-hosted proxy (no keys in the client); labelled 'AI-generated hint — may be wrong'; counted as a hint use (affects mastery exactly like hints do today); off by default. |
| src/core/multiplayer/* (only if O-07 approved) | Race on the chosen transport; opponent data never fabricated; shows 'waiting for opponent' states. |

## 7. Implementation steps (execute in order)

1. Write `docs/EXTERNAL_FEATURES.md` with options and risks; surface O-06/O-07 in the stage report.
2. Implement the services registry and the Settings section (all `Not connected`).
3. For each feature with an approved decision: implement per its memo with consent dialogs, error states and tests; for each without: leave it absent (no controls, no routes).
4. Verify the production build makes **zero** network requests to third parties by default (browser test).
5. Docs.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

```ts
interface ExternalService { id: 'w3c-validator' | 'ai-hints' | 'multiplayer'; name: string; status: 'not-connected' | 'connected' | 'error'; disclosure: string }
```

## 9. UI/UX expectations

Settings → Connected services: cards with status chip, disclosure text, Connect/Disconnect buttons only when an implementation exists.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Offline → feature disabled with reason. Service error → message, no retry storm (max 1 manual retry).

## 11. Security and performance

No keys in client; requests only on explicit action; request/response size caps; no learner data sent without a visible disclosure dialog.

## 12. Required tests and regression checks

- Registry tests; Settings rendering; network-silence test (fetch spy shows no third-party calls on load or while learning); for each approved feature: consent, success, failure, offline tests.
- Previous suites unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] By default the app performs no third-party requests (test).
- [ ] Unapproved features do not appear as controls or routes.
- [ ] Approved features always show a disclosure dialog before sending anything and handle errors gracefully.
- [ ] AI hints (if built) count as hint usage and are labelled.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Deterministic Code Coach, mastery rules.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_28_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 28: External-dependency features (AI hints, W3C validator, LAN multiplayer)`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 29 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
