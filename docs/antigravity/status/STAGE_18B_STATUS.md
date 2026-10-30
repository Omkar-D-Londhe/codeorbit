# Stage 18b — Creator, Peer Snapshots & Portfolio Export — Status Report

Save as `docs/antigravity/status/STAGE_18B_STATUS.md`.

## 1. Header
- Stage: 18b (Creator, Peer Snapshots & Portfolio Export) · Branch: `stage-18b-learning-science-authoring` · Base Commit: `455bacbdc383a8356421758f0b04ebbd14cfb296`
- Date/time: 2026-10-28 · Agent/tool: Antigravity (Google DeepMind)
- Schema Version: strictly maintained at `SCHEMA_VERSION = 8` (no schema bump to v9, using `custom.challenges` from v8).

## 2. Baseline before changes
| Command | Result (summary line) |
|---|---|
| `git status` | clean working tree on `stage-18b-learning-science-authoring` |
| `npm run typecheck` | PASS (0 errors) |
| `npm run lint` | PASS (0 errors, 0 warnings) |

## 3. Evidence split (owner UI/UX contract `09` §6)
- **Implemented:**
  - **Feature A — Custom Challenge Creator (`src/core/authoring/ChallengeCreator.tsx`, `/create`):**
    - 5-step progressive stepper wizard: `Details` → `Files` → `Requirements` → `Hints & Solution` → `Preview & Test`.
    - Live step-by-step form validation preventing forward navigation on invalid states.
    - Rule-based requirement builder with track rule palette: `doctype`, `selector`, `noMatch`, `textLength`, `everyHasAttr`, `anyHasAttr`, `everyAttrContains`, `controlsLabelled`, `headingOrder`, `fragmentLinksResolve`, `noLinkText`.
    - Real-time CSS selector validator `isValidSelector` verifying syntax, bracket balancing, and element selector validity.
    - Built-in self-checking test runner in Step 5: evaluates the author's reference solution against the authored requirements using `validateChallenge()` and `toChallenge()` adapter; blocks saving if requirements fail.
    - Quota guard check: evaluates `getQuotaInfo(state)` against the 4 MiB soft budget and prevents saving if storage is `'full'`.
    - Reducer action `SAVE_CUSTOM_CHALLENGE` persists challenge to `state.custom.challenges` with topic mastery immunity.
  - **Feature B — Peer Challenge Snapshots (`src/core/share/snapshot.ts`, `src/core/share/ShareModal.tsx`, `src/pages/Share.tsx`, `/share`):**
    - `SnapshotV1` schema contract: `{ v: 1, trackId, title, files: [{ name, content }] }`.
    - Client-side encoding: base64url serialization with transparent `CompressionStream` ('deflate', prefix `c.`) and uncompressed fallback (prefix `u.`).
    - Hard 8 KB URL fragment size limit check (`MAX_SNAPSHOT_LINK_BYTES = 8192` characters); rejects oversized inputs before link generation.
    - Share dialog (`ShareModal.tsx`): live size meter displaying exact bytes (`Link size X KB of 8.0 KB (Y%)`) with visual progress bar and one-click copy button.
    - Import view (`Share.tsx`): decodes URL fragment safely, renders code in read-only blocks, and strictly requires explicit learner confirmation ("Try it in your workspace") before creating a local copy in `custom.challenges`. Never executes or evaluates code automatically upon page load.
  - **Feature C — Portfolio Export (`src/core/portfolio/exportPortfolio.ts`):**
    - Generates self-contained, offline HTML portfolio showcasing the learner's own completed challenge solutions.
    - Strictly filters to completed challenges (`rec.completed === true`); rejects export with user feedback if no completed challenges exist.
    - Fetches the learner's final edited code from `state.drafts` (falling back to starter code only if unedited).
    - Absolute XSS isolation: strictly escapes all dynamic text, learner names, challenge titles, and code snippets via `escapeHtml()`.
    - Sandboxed interactive previews: each project preview renders in an isolated iframe with `sandbox="allow-scripts"` and inline `srcdoc`.
    - Export action button integrated in `src/pages/Progress.tsx` in both the top PageHeader actions and the "Your data" management card with toast feedback.
  - **Integration Points & Nav Updates:**
    - `src/lib/routes.ts`: exported `createPath()` (`/create`) and `sharePath()` (`/share`).
    - `src/App.tsx`: registered lazy-loaded routes for `ChallengeCreator` and `SharePage`.
    - `src/pages/Practice.tsx`: added support for `custom:<id>` challenges via `state.custom.challenges` and `toChallenge()` adapter, "Custom Challenge" chip, crumb/miniConstellation safety, and "Share" dialog with live size meter.
    - `src/pages/Explore.tsx`: added "Create Challenge" action button in PageHeader and "Custom & Shared Challenges" section.
    - `src/state/reducer.ts`: added `SAVE_CUSTOM_CHALLENGE` and `DELETE_CUSTOM_CHALLENGE` actions with guaranteed topic mastery immunity.

- **Functionally tested (tests/commands actually run):**
  - `src/test/snapshot.test.ts`: 9 tests passing (deflate compression round-trip, uncompressed fallback, 8 KB cap enforcement, schema validation, malicious/unsupported track rejection, script injection inertness).
  - `src/test/portfolio.test.ts`: 6 tests passing (strict HTML escaping, script injection immunity, completed-only challenge inclusion, rejection on 0 completed challenges, sandboxed iframe generation, download error handling).
  - `src/test/challengeCreator.test.tsx`: 7 tests passing (CSS selector validation, reducer save/delete actions, topic mastery immunity, toChallenge & validateChallenge evaluation pipeline, stepper validation, requirement rule builder, self-check verification).
  - Stage 18 Regression Suite: 8 test files, 74 tests passing (`spaced.test.ts`, `dueReview.test.tsx`, `voiceRead.test.tsx`, `snapshot.test.ts`, `portfolio.test.ts`, `challengeCreator.test.tsx`, `migrations.test.ts`, `storage.test.ts`).
  - Production build: `tsc -b && vite build` built in 1.50s; verified all lazy chunks generated cleanly (`ChallengeCreator`, `Share`, `snapshot`).

- **Mastery Rule & Streak Invariant Verification:**
  - Verified: Saving, editing, deleting, or practicing custom challenges never alters `state.topics` or official topic mastery (`src/test/challengeCreator.test.tsx`).
  - Verified: Storage schema remains strictly at `SCHEMA_VERSION = 8`.

- **Git Safety Verified:**
  - Branch remains `stage-18b-learning-science-authoring`.
  - Base commit preserved at `455bacbdc383a8356421758f0b04ebbd14cfb296`.
  - No remote pushes or tags executed.
