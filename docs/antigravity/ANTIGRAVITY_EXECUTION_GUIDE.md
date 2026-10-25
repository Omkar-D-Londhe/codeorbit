# Antigravity Execution Guide

You are implementing **CodeOrbit**, an existing React 19 + TypeScript + Vite learning studio, into a polished, language-neutral learning, coding, complexity-analysis and optimisation platform. You write code, not plans. This pack says what to build, in what order, and how to prove it.

## 1. What is in this pack

| File | Purpose |
|---|---|
| `ANTIGRAVITY_EXECUTION_GUIDE.md` | This protocol. |
| `00_BASELINE_AUDIT.md` | Evidence-based audit of the **original** project (primary baseline) with verified results. |
| `01_PRODUCT_AND_ARCHITECTURE.md` | Part A: product vision and **locked decisions**. Part B: target architecture, data models, contracts, security. |
| `02_ENHANCEMENT_TRACEABILITY_MATRIX.md` | All 168 tracked items (110 catalog + 18 platform + 8 reference + 32 frontend-concept rows) → stage, status, acceptance criterion. |
| `03_STAGE_PLAN.md` | Master roadmap: order, outcomes, dependency map, gate table, sub-stages, schema chain, risks. |
| `04_DESIGN_SYSTEM_AND_UI_SPEC.md` | Tokens, themes, components, layouts, motion, accessibility, visual QA. |
| `05_REFERENCE_ZIP_COMPARISON.md` | Original vs reference ZIP: what to REUSE / ADAPT / KEEP / EXCLUDE, and why. |
| `06_FRONTEND_CONCEPTS_APPLICATION_MAP.md` | How course concepts are applied in the platform and taught by tracks. |
| `07_CONFLICTS_AND_DECISIONS.md` | Conflicts, assumptions, constraints, **open owner decisions**. |
| `08_GLOBAL_ACCEPTANCE_AND_QA.md` | Gates G1–G10 that apply across stages. |
| `09_UI_UX_QUALITY_CONTRACT.md` | Owner's mandatory UI/UX quality contract (visual acceptance gate, component completeness, reporting split). |
| `10_CONSTELLATION_LEARNING_ORBIT_SPEC.md` | Approved celestial constellation Learning Orbit: data model, layout, states, interactions, responsive, prototype and visual-QA rules. |
| `design-reference/` | The constellation concept image (`codeorbit_constellation_concept.png`) and its usage note. A reference only — never shipped, never a data source. |
| `stages/STAGE_01 … STAGE_29` | One instruction file per stage — give Antigravity one at a time. |
| `STAGE_STATUS_TEMPLATE.md` | Report you fill in after every stage. |
| `FINAL_INTEGRATION_AND_ACCEPTANCE.md` | Final verification checklist (Stage 29). |
| `reference/` | **Read-only** snapshot of useful reference-ZIP code, tests and the integration diff. Never import it. |

## 2. Baselines and precedence

- The **original project is the baseline.** The reference ZIP supplies ideas, logic and tests to reuse selectively after a compatibility/quality check (`05`). It is not a replacement and not a scope ceiling.
- Precedence (highest first): locked decisions in `01` Part A → resolved decisions in `07` → the stage file → `01` Part B / `04` → repo `AGENTS.md` and `DESIGN.md` (updated by stages) → prose in `ENHANCEMENTS.md`.
- If a stage file contradicts a locked decision, the locked decision wins; raise it in the report.

## 3. First-run reading order

Before Stage 01 read once: `00` → `01` → `05` → `07` → `08` → `09`, then skim `02`, `03`, `04`, `06`, `10`. Stages 02, 04, 10a, 10b, 16 and 29 also require reading `10` and looking at `design-reference/`. On later stages re-read `01` Part A, `08` and the stage file.

## 4. The one-stage-at-a-time rule

1. Implement exactly one stage. Stage `N+1` starts only when Stage `N`'s **exit gate** is green and its status report exists.
2. Do not implement every stage in one operation. Do not skip unfinished requirements silently. Do not remove agreed features because they are hard or deferred.
3. Stay in scope. Out-of-scope discoveries go in the report as follow-ups.
4. If a prerequisite is missing or only partly done, stop and report. Never fake it.
5. **Decision gates** follow the policy in `07` §4a. *Soft* gates (O-01, O-02, O-08, O-09, O-10, O-12, O-13, O-16): proceed with the stated default and record that you did. *Hard* gates (O-03 Stage 25 Part B, O-04 Stage 26 execution, O-05 Stage 27 practice, O-06/O-07/O-14 Stage 28, O-15 between 10a and 10b): do **not** build the gated capability until the owner records a yes; implement the ungated parts and the truthful unavailable state, then stop at that boundary and say so. Later stages may start once the ungated parts are green.
6. A blocker: document it, explain its impact, stop at the appropriate boundary — do not conceal it, and do not invent missing requirements, data or results.
7. Assessment compliance is a supporting verification activity: **never wait on it**. Mark unverifiable course mappings `pending-review` and continue.

## 5. Invariants (every stage)

- **No fake anything:** no fabricated metrics, activity, streaks, XP, leaderboard rows, analysis results, or controls that do nothing.
- **No placeholder complexity analysis described as genuine.** Results come only from a registered language-specific `AnalysisProvider` and always show method, confidence, assumptions, limitations and "heuristic estimate, not a formal proof".
- **Learner code never runs in the trusted DOM.** Static previews: `sandbox=""`. Script preview: `allow-scripts` without `allow-same-origin`. Other languages: Worker/WASM with time/output limits.
- **Persistence is migration-safe:** `SCHEMA_VERSION` only increases; migrations append-only and fixture-tested; backup key preserved.
- **Keyboard operable, visible focus, status never colour-only, reduced motion respected.**
- **Learning Orbit** is the approved celestial constellation map (`10`): nodes are real topics, connections are declared prerequisites only, positions never depend on selection/progress, and map, stepper, list and panel share one selection. The earlier upward-arc requirement is **superseded** — do not implement arc geometry for the primary orbit.
- **Visual acceptance needs evidence** (`09`, `08` G3/G11): run the app, capture and look at screenshots at the agreed viewports, compare with the references, fix, re-inspect; otherwise report VISUAL: NOT VERIFIED.
- **Evolve, don't rewrite.** Do not rewrite the application or replace working components merely to match a preferred architecture; justify any replacement in the report.
- **The platform stays React + TypeScript + custom CSS;** taught technologies live in `src/tracks/<id>` and run only in sandboxes.
- **Never weaken or delete existing tests** to get green. Never claim a command passed unless you ran it.

## 6. Commands (real scripts in `package.json`)

```bash
npm ci               # or npm install
npm run dev
npm run typecheck
npm run lint
npm run test         # vitest run (jsdom)
npm run build
```
Stage 01 adds `npm run test:e2e` (Playwright smoke); later stages may add scripts (`new-track`, `docs:concepts`) and must document them.

## 7. Per-stage workflow

1. **Inspect:** `git status`, `git log --oneline -5`, run typecheck/lint/test/build and record results.
2. **Read** the stage file completely, then the repo files it names.
3. **Implement** in the stated order, editing existing files in place where possible. Add dependencies only where the stage names them or you can justify them (size, licence, maintenance, a11y) in `docs/DECISIONS.md`.
4. **Test** as you go: unit/component (Vitest + Testing Library), a11y (axe), keyboard walkthrough, browser checks at 1280/820/390/320 when a browser tool exists.
5. **Verify** every acceptance criterion with evidence.
6. **Document:** `README.md`, `DESIGN.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `docs/WORKLOG.md`.
7. **Commit** on branch `stage-NN-<slug>` (message `Stage NN: <title>`); fill `STAGE_STATUS_TEMPLATE.md` → `docs/antigravity/status/STAGE_NN_STATUS.md`.
8. **Stop** and present the report; wait for the next stage prompt.

## 8. Git safety

Check `git status` before any edit. Preserve unrelated user changes; never `reset --hard`, `clean -f`, force-push or rewrite history. Do not touch or commit `.freebuff/`. No secrets, `node_modules` or build output in commits. Do not push or tag unless asked. If the tree is dirty with changes you did not make, do not commit them; tell the owner.

## 9. Beginning Stage 1

Copy this pack into the repository at `docs/antigravity/`, then paste:

```
Read docs/antigravity/ANTIGRAVITY_EXECUTION_GUIDE.md, then 00, 01, 05, 07, 08 and 09 in docs/antigravity (skim 02, 03, 04, 06, 10).
Implement docs/antigravity/stages/STAGE_01_BASELINE_LOCK_AND_NEUTRAL_CORE.md completely.
Do not start any other stage. When its exit gate is green, fill STAGE_STATUS_TEMPLATE.md into docs/antigravity/status/STAGE_01_STATUS.md and stop.
```

## 10. Continuing through the remaining stages

After you have reviewed a status report and accepted it, paste for stage NN (use the exact file name in `stages/`):

```
Stage NN-1 is accepted. Re-read docs/antigravity/01_PRODUCT_AND_ARCHITECTURE.md (Part A) and 08_GLOBAL_ACCEPTANCE_AND_QA.md.
Implement docs/antigravity/stages/STAGE_NN_<SLUG>.md completely and nothing else.
Report using STAGE_STATUS_TEMPLATE.md and stop at the exit gate.
```

Some stages are split into lettered sub-stages (see each stage file §7a and `03` §8; Stage 10 is always 10a prototype → owner approval → 10b). For a sub-stage use the same prompt with `NNa` and add: "Implement sub-stage NNa only; do not start NNb." Status report: `STAGE_NNa_STATUS.md`; branch `stage-NNa-<slug>`.

Stage order: 01 baseline lock → 02 design system → 03 storage/settings → 04 atmosphere → 05 editor → 06 practice workspace → 07 feedback → 08 lesson studio → 09 quiz engine → 10 constellation Learning Orbit (10a prototype → owner approval O-15 → 10b) → 11 gamification → 12 dashboard → 13 command palette/search → 14 notes/review → 15 mastery map/analytics → 16 accessibility → 17 onboarding/offline → 18 learning-science/authoring → 19 concept atlas → 20 runner + analysis framework → 21 HTML module + playbook → 22 CSS → 23 JavaScript + first analyzer → 24 Bootstrap → 25 Python (Part A content; Part B Pyodide hard-gated by O-03) → 26 Java/C++ (execution hard-gated by O-04) → 27 Angular (practice hard-gated by O-05) → 28 external features (hard-gated by O-06/O-07/O-14) → 29 final integration.

## 11. Owner checkpoints

The owner answers open decisions in `07` §4 (O-01…O-16) before the stage that needs them. **Soft** gates: Antigravity uses the stated default if unanswered and records that it did. **Hard** gates: nothing gated is built without a recorded yes. The owner also reviews the Stage 10a prototype evidence and records O-15 before 10b.
