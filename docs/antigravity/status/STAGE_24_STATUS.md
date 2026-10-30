# Stage 24 — Bootstrap Track — Status Report

Save as `docs/antigravity/status/STAGE_24_STATUS.md`.

## 1. Header
- **Stage:** 24 · **Slug:** `bootstrap-track` · **Branch:** `stage-24-bootstrap-track` · **Commit:** Uncommitted working tree (preserving Stages 16–23 baseline and Stage 24 deliverables per explicit user instructions)
- **Date/time:** 2026-10-29T18:12:00+05:30 · **Agent/tool:** Antigravity 2.0 (Google DeepMind)
- **Started from:** dedicated branch `stage-24-bootstrap-track` branched from `stage-23b-javascript-track` preserving all uncommitted changes intact.

## 2. Baseline before changes (prior to Stage 24)
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm test` | Test Files: 129 passed / Tests: 1,048 passed |
| `npm run build` | Built in 597ms |

## 3a. Evidence split (owner UI/UX contract `09` §6)
- **Implemented:**
  - **Vendored Bootstrap CSS & Dependency Tracking (§6, §7.2, §11):**
    - Self-contained official Bootstrap 5.3.3 minified stylesheet vendored at `src/tracks/bootstrap/vendor/bootstrap.min.css` (232.8 kB).
    - Accompanying official MIT license at `src/tracks/bootstrap/vendor/LICENSE-bootstrap`.
    - Maintained `src/tracks/bootstrap/DEPENDENCY.md` recording version 5.3.3, package source, SHA256 checksum (`3c8f27e6009ccfd710a905e6dcf12d0ee3c6f2ac7da05b0572d3e0d12e736fc8`), and upgrade procedure.
    - Verified by automated hash test `src/test/bootstrapVendor.test.tsx`.
    - Bundled as an isolated lazy chunk (`dist/assets/bootstrap.min-*.js`, 30.99 kB gzip), loaded dynamically via `?raw` strictly when a Bootstrap practice lab or demo opens.
  - **Preview Stylesheet Injection & Isolation (§5, §8, §10, §11):**
    - Extended `PreviewOptions`, `ScriptPreviewOptions`, and `buildPreviewDocument` in `src/lib/preview.ts` to support optional `stylesheets?: string[]`.
    - Updated `IframePreviewRunner` (`src/core/runner/iframePreviewRunner.ts`) and `SandboxedPreview` (`src/components/SandboxedPreview.tsx`) to pass and inject stylesheets into preview `<head>` as `<style data-track-stylesheet="true">`.
    - Injected stylesheets are bounded strictly to the sandboxed `<iframe>` (`sandbox=""`, no scripts, no same-origin).
    - Preserves strict CSP (`default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:`) with zero network access and zero remote CDN links.
    - Integrated error recovery and retry in `Practice.tsx`: if stylesheet chunk loading fails, preview displays "Bootstrap styles could not be loaded" with a "Retry" button while challenges remain editable (§10).
  - **Bootstrap Rule Validators (§6, §7.4):**
    - Implemented in `src/tracks/bootstrap/validators/index.ts` and integrated with `evaluateRule` in `src/lib/validators.ts`:
      1. `hasClass`: checks target element for specified class name.
      2. `navbarStructure`: validates the full Bootstrap 5 responsive navbar markup contract: `.navbar`, `.navbar-toggler` with `data-bs-toggle="collapse"` (or `data-toggle="collapse"`), `aria-controls`, `aria-expanded`, `.collapse.navbar-collapse`, and `.navbar-nav` with `.nav-link` items (FC-26).
      3. `gridStructure`: validates `.container` / `.container-fluid` wrapper containing `.row` with `.col-*` columns, enforcing minimum column counts when configured (FC-28).
      4. `formControls`: validates presence of `.form-control`, `.form-select`, or `.form-check-input` and verifies that every control has an associated accessible label (FC-27).
      5. `validationFeedback`: validates presence of `.is-invalid` (or `.is-valid`) on controls and adjacent `.invalid-feedback` container (FC-27).
    - Factory function `createBootstrapValidator` provides deterministic evaluation.
  - **Curriculum & Content Module (`src/tracks/bootstrap/`):**
    - `curriculum.ts`: 8 topics across 4 groups (`bs-grid-layout`, `bs-typography-utilities`, `bs-components-nav`, `bs-forms-auth`) forming an acyclic directed graph (DAG).
    - `lessons.ts`: 8 lessons with objectives, takeaways (3-5), vocabulary definitions, accessibility notes, code examples, interactive live demos, and contrasts with custom CSS.
    - `quizzes.ts`: 8 quizzes with 3 questions each (24 questions total) covering multiple choice concepts, responsive contracts, and accessibility.
    - `challenges.ts`: 8 challenges with unit requirements, 3 hints (conceptual $\to$ structural $\to$ specific), failing starters, and 100% passing solutions.
    - `achievements.ts`: 5 achievements (`bs-grid-architect`, `bs-component-master`, `bs-navbar-navigator`, `bs-auth-craftsman`, `bs-track-complete`) conforming to `AchievementDef`.
    - `snippets.ts`: 5 snippets (`snip-bs-navbar`, `snip-bs-card-grid`, `snip-bs-login-form`, `snip-bs-alert-dismiss`, `snip-bs-pricing-table`).
    - `track.ts`: Assembled `TrackModule` with purple tint `#8b5cf6`, glyph `B`, `available` status, and truthful capabilities `['lessons', 'quizzes', 'practice', 'preview', 'diagnostics', 'snippets']`.
  - **Educational Notice & Concept Atlas Separation (§8, §13):**
    - Added `notice: 'Presentation only: nothing is sent or stored.'` to `bs-ch-auth-forms` and rendered in the brief pane in `Practice.tsx`.
    - Concept Atlas entries FC-26, FC-27, FC-28 updated with `evidenceTests: ['src/test/bootstrapTrack.test.ts']` and `teachIn` referencing `navbar`, `auth-forms`, and `grid-system`.
    - Maintained `platformUse: undefined` (honoring rule L-14: teaching only — CodeOrbit itself does not use Bootstrap).
    - Regenerated `docs/ASSESSMENT_COMPLIANCE.md` (32 concepts).
  - **System Integration:**
    - Registered `bootstrapTrack` in `src/app/registerTracks.ts`.
    - Updated `src/test/emptyTracks.test.tsx` and `src/test/htmlTrack.test.ts`.
- **Functionally tested:**
  - `src/test/bootstrapVendor.test.tsx` (5 tests passing): SHA256 checksum matching, MIT license presence, stylesheet injection into preview `<head>`, strict no-network CSP, and platform style isolation.
  - `src/test/bootstrapValidators.test.ts` (15 tests passing): `hasClass`, `navbarStructure` positive/negative contracts, `gridStructure` column counts, `formControls` label associations, `validationFeedback`, and `createBootstrapValidator`.
  - `src/test/bootstrapTrack.test.ts` (8 tests passing): track metadata, DAG topology, 8 lessons, 8 quizzes (24 questions), 8 challenges (all starters fail / all solutions pass 100%), authentication notice, Concept Atlas FC-26..FC-28 separation, and snippets/achievements counts.
  - `src/test/bootstrapResponsive.test.tsx` (2 tests passing): mobile (390px), tablet (820px), desktop (1280px) device frame rendering and sandbox isolation.
  - `src/test/concepts.honesty.test.tsx` (28 tests passing): live DOM selector matching, teach-in topic resolution, and L-14 separation.
  - `src/test/app.test.tsx` (40 tests passing).
  - `src/test/htmlTrack.test.ts` (4 tests passing).
  - `src/test/cssTrack.test.ts` (10 tests passing).
  - `src/test/jsTrack.test.ts` (6 tests passing).
  - `src/test/regression.smoke.test.tsx` (19 tests passing): 9 G2 regression smoke items and G4 axe checks on 8 core pages.
  - Full test suite: **133 test files passed (1,078 tests passing)**.
- **Accessibility checked:**
  - Automated axe checks across all core pages: 0 serious, 0 critical violations.
  - Responsive navbar hamburger toggler enforces `aria-controls`, `aria-expanded`, and accessible labels.
  - Form controls validator requires programmatic label association (`for="id"` or wrapping `<label>`).
  - Alert banners require `role="alert"` for screen reader live announcements.
- **Not verified:**
  - Angular Track implementation / Stage 25 (explicitly excluded).
- **Remaining decisions:**
  - Out of scope per §1: Bootstrap JavaScript behaviors (dropdown/collapse animations) are taught via HTML markup contracts (`data-bs-*`, `aria-expanded`) without requiring runtime Bootstrap JS.

## 4. Work completed
- Items completed: FC-26, FC-27, FC-28.
- Files added:
  - `src/tracks/bootstrap/vendor/bootstrap.min.css`
  - `src/tracks/bootstrap/vendor/LICENSE-bootstrap`
  - `src/tracks/bootstrap/DEPENDENCY.md`
  - `src/tracks/bootstrap/curriculum.ts`
  - `src/tracks/bootstrap/lessons.ts`
  - `src/tracks/bootstrap/quizzes.ts`
  - `src/tracks/bootstrap/challenges.ts`
  - `src/tracks/bootstrap/achievements.ts`
  - `src/tracks/bootstrap/snippets.ts`
  - `src/tracks/bootstrap/track.ts`
  - `src/tracks/bootstrap/validators/index.ts`
  - `src/test/bootstrapVendor.test.tsx`
  - `src/test/bootstrapValidators.test.ts`
  - `src/test/bootstrapTrack.test.ts`
  - `src/test/bootstrapResponsive.test.tsx`
- Files modified:
  - `src/lib/preview.ts`
  - `src/components/SandboxedPreview.tsx`
  - `src/core/runner/iframePreviewRunner.ts`
  - `src/core/runner/types.ts`
  - `src/core/content/types.ts`
  - `src/core/content/challengeAdapter.ts`
  - `src/data/types.ts`
  - `src/lib/validators.ts`
  - `src/pages/Practice.tsx`
  - `src/app/registerTracks.ts`
  - `src/core/concepts/concepts.ts`
  - `src/test/emptyTracks.test.tsx`
  - `src/test/htmlTrack.test.ts`
  - `src/test/app.test.tsx`
  - `docs/ASSESSMENT_COMPLIANCE.md`
  - `docs/WORKLOG.md`
  - `docs/DECISIONS.md`

## 5. Results after changes
| Command | Result |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings; literal `'html'` check clean) |
| `npm test` | Test Files: 133 passed / Tests: 1,078 passed (delta: +4 files, +30 tests vs Stage 23b) |
| `npm run build` | Built in 838ms (`bootstrap.min-*.js` chunk: 232.83 kB / 30.99 kB gzip) |
| `npx vitest run src/test/regression.smoke.test.tsx` | 19/19 passed (9 smoke items, 10 a11y axe checks) |
| Working Tree Status | Preserved, uncommitted |

## 6. Acceptance criteria evidence (Stage 24 §13)
| Criterion | Met? | Evidence |
|---|---|---|
| Platform pages are unaffected by the vendored CSS | Met | Tested in `src/test/bootstrapVendor.test.tsx`: rendered Home page has no `.container`, `.row`, or `.navbar` classes, and platform styles remain 100% custom CSS. |
| Navbar and auth-form challenges are checkable by rules; brief states no real authentication | Met | Tested in `src/test/bootstrapValidators.test.ts` and `src/test/bootstrapTrack.test.ts`: `navbarStructure`, `formControls`, and `validationFeedback` rules validate requirements; `bs-ch-auth-forms` displays `notice: 'Presentation only: nothing is sent or stored.'`. |
| No network request is possible from the preview (CSP test) | Met | Tested in `src/test/bootstrapVendor.test.tsx`: preview document contains strict CSP `default-src 'none'` and zero remote links or scripts. |
| Track is `available` with truthful capabilities | Met | Tested in `src/test/bootstrapTrack.test.ts`: `availability: 'available'` and `capabilities: ['lessons', 'quizzes', 'practice', 'preview', 'diagnostics', 'snippets']`. |
| FC-26…FC-28 Atlas entries present | Met | Verified in `src/core/concepts/concepts.ts` and `docs/ASSESSMENT_COMPLIANCE.md`: FC-26, FC-27, FC-28 map to `bootstrap` topics, with `platformUse: undefined`. Tested in `src/test/concepts.honesty.test.tsx`. |
