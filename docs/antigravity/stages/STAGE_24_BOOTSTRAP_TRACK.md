# Stage 24 — Bootstrap track

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 24 · **Slug:** `bootstrap-track` · **Branch:** `stage-24-bootstrap-track`

**Objective.** Add the Bootstrap track whose framework CSS exists only inside the learner preview document, covering grid, utilities, components, navbar and authentication-style forms (presentation only).

**In scope**
- Topics: Bootstrap grid and breakpoints, utilities, typography/colours, components (buttons, cards, alerts), navbar (responsive, toggler), forms and validation states, login/registration UI (no real authentication), responsive patterns.
- FC-26, FC-27, FC-28.

**Out of scope**
- Bootstrap JavaScript behaviours (collapse/dropdown) — taught as markup contracts (`data-bs-*`, `aria-expanded`) and verified by rules; running Bootstrap JS requires script preview with a vendored bundle: **excluded** unless Stage 23's script preview is extended and recorded in DECISIONS.

## 2. Prerequisites and dependencies

- Stage 23 exit gate green (track patterns mature).

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Platform / reference / concept items:** `FC-26` Bootstrap navbar, `FC-27` Authentication-style forms (UI only), `FC-28` Bootstrap grid, utilities, components
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-26, FC-27, FC-28

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Core stays custom CSS (L-14): no Bootstrap import in `src/core`, `src/components`, `src/pages`, `src/styles`.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/lib/preview.ts / core/runner/iframePreviewRunner.ts | Optional `stylesheets: string[]` injected as `<style>` text into the preview document for tracks that declare them. |
| src/app/registerTracks.ts | Register `bootstrap` as `available` when complete. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/tracks/bootstrap/vendor/bootstrap.min.css | Vendored Bootstrap CSS (pinned version, licence file `LICENSE-bootstrap` alongside; MIT) loaded lazily via `?raw` only by this track. |
| src/tracks/bootstrap/{track,curriculum,lessons,quizzes,challenges,snippets,achievements,concepts}.ts | Content + Atlas FC-26…FC-28. |
| src/tracks/bootstrap/validators/* | Rules: `hasClass`, `navbarStructure` (`.navbar`, `.navbar-toggler` with `data-bs-toggle`, `aria-controls`, `aria-expanded`, `.collapse.navbar-collapse`), `gridStructure` (`.container > .row > .col-*`), `formControls` (`.form-control`, `.form-label`, labels associated), `validationFeedback` (`.is-invalid` + `.invalid-feedback`). |
| src/tracks/bootstrap/DEPENDENCY.md | Version, source, checksum, update procedure. |

## 7. Implementation steps (execute in order)

1. Inspect Stage 22 stylesheet probe and CSS parser reuse.
2. Vendor Bootstrap CSS with licence; compute checksum; add a test that fails if the file hash changes without the DEPENDENCY.md entry.
3. Implement stylesheet injection; test that preview document contains the vendored CSS as `<style>` and nothing remote (CSP forbids network).
4. Add rule kinds with tests; authored lessons contrast Bootstrap's utility approach with the CSS track (cross-links via prerequisites optional, not required).
5. Challenges: responsive navbar, card grid, login form, registration form with validation states (explicitly 'UI only — no account is created or sent anywhere').
6. Check device frames show breakpoint behaviour (grid collapses at 375/768).
7. Atlas, achievements, register track; QA; docs.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

`TrackModule.previewStylesheets?: Array<() => Promise<string>>` — lazily loaded CSS strings injected by the iframe runner. Authentication-themed challenges carry `notice: 'Presentation only: nothing is sent or stored.'` shown in the brief.

## 9. UI/UX expectations

Bootstrap track card with its own tint; preview shows genuine Bootstrap rendering in the iframe on a light background; the platform chrome is unaffected.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

CSS chunk load failure → preview shows 'Bootstrap styles could not be loaded' with Retry; challenges stay editable.

## 11. Security and performance

Bootstrap CSS (~160 kB min, ~25 kB gzip) loaded only when a Bootstrap challenge/demo opens; no remote CDN ever; `sandbox=""` preserved.

## 12. Required tests and regression checks

- Hash/licence test; injection test; rule tests; track structure; every solution passes/starter fails; a test asserting no Bootstrap selector leaks into platform styles (render Home and check computed styles unaffected).
- Previous tests unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Platform pages are unaffected by the vendored CSS (test).
- [ ] Navbar and auth-form challenges are checkable by rules; brief states no real authentication.
- [ ] No network request is possible from the preview (CSP test).
- [ ] Track is `available` with truthful capabilities.
- [ ] FC-26…FC-28 Atlas entries present.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None; the blueprint's 'Bootstrap only where needed' is honoured by confining it to the track's preview.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Platform CSS, other tracks, sandbox rules.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_24_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 24: Bootstrap track`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 25 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
