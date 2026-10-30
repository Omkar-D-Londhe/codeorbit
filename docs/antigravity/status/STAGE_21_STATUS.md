# Stage 21 — Language integration playbook and the HTML track module (with course-evidence gap closure) — Status Report

Save as `docs/antigravity/status/STAGE_21_STATUS.md`.

## 1. Header
- **Stage:** 21 · **Slug:** `html-module-and-playbook` · **Branch:** `stage-21-html-module-and-playbook` · **Commit:** Uncommitted working tree (preserving Stage 16–20 baseline and Stage 21 deliverables per explicit user instruction)
- **Date/time:** 2026-10-29T13:05:00+05:30 · **Agent/tool:** Antigravity (Google DeepMind)

## 2. Baseline before changes (prior to Stage 21)
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm test` | Test Files: 119 passed / Tests: 936 passed |
| `npm run build` | Built in 716ms; main JS 335.98 kB (gzip 104.68 kB) |

## 3. Deliverables Summary
### 1. Track Integration Playbook (`docs/TRACK_PLAYBOOK.md`, `PLT-12`)
- Authoritative step-by-step authoring guide detailing track structure, contracts, prerequisites, lessons, quizzes, challenges, validators, runners, snippets, achievements, Concept Atlas registration, testing checklist, and capability honesty rules.

### 2. Track Scaffolding Generator (`scripts/new-track.mjs`, `package.json`, `PLT-12`)
- CLI scaffolder runnable via `npm run new-track -- <trackId>`.
- Generates typed track module files in `src/tracks/<trackId>/` (`curriculum.ts`, `track.ts`, `lessons.ts`, `quizzes.ts`, `challenges.ts`, `achievements.ts`, `snippets.ts`) and a failing-until-filled test suite in `src/test/tracks/<trackId>.test.ts`.
- Automated testing in `src/test/trackGenerator.test.ts`.

### 3. Multi-Track Shell & Truthful Availability States (`src/pages/Explore.tsx`, `PLT-13`, `L-08`)
- Track feature and list items display truthful availability chips (`Available`, `Preview`, `Planned`, `Decision pending`).
- Displays truthful capability chips (`Lessons`, `Quizzes`, `Practice`, `Preview`, `Run`, `Analysis`) matching registered track capabilities.
- Unavailable tracks are informational only with no clickable links or buttons (preventing dead routes).

### 4. HTML Gap Content Closure (FC-01–FC-09, FC-31)
- **FC-02 (Text semantics):** Lesson expanded with `<mark>`, `<sup>`, `<sub>`, `<u>`; quiz questions added; challenge `ch-html-formatting` authored.
- **FC-03 (Nested lists):** Lesson outline section expanded; quiz question added; challenge `ch-html-nested-lists` authored.
- **FC-06 (Tables & cell spans):** Lesson section on `rowspan` and `colspan` added; quiz question added; challenge `ch-html-table-spans` authored.
- **FC-07 (Form controls & validation):** Lesson expanded with radio, checkbox, select, date, tel, file, `pattern`, `minlength`, `maxlength`; quiz questions added; challenge `ch-html-advanced-forms` authored.
- **FC-08 (Multimedia elements):** 13th topic `media-elements` registered in `src/data/curriculum.ts`; lesson with `<audio>`, `<video>`, `<source>`, fallback text, and `<track>` subtitles; 3+ question quiz; `ch-media-elements` challenge with `needsMedia: true`.
- **FC-31 (Local dev HTTP serving):** Lesson callout on local HTTP serving vs `file://` added to `html-structure`.

### 5. Deterministic Validation Rule Kinds (`src/data/types.ts`, `src/lib/validators.ts`)
- Added 5 pure rule evaluators: `hasAttrValue`, `nestedList`, `cellSpan`, `inputTypes`, and `mediaControls`.
- Exhaustive positive, negative, and edge-case unit tests in `src/test/htmlRules.test.ts` (20 tests).

### 6. Per-Challenge Sandboxed Preview CSP Extension (`src/lib/preview.ts`, `src/components/SandboxedPreview.tsx`, `src/pages/Practice.tsx`)
- `buildPreviewDocument` accepts `options?: PreviewOptions`.
- Appends `; media-src data:` only when `needsMedia: true` is specified on the active challenge.
- Minimal data URIs (< 2 kB total) provided in `src/tracks/html/mediaSamples.ts`.

### 7. Concept Atlas & Assessment Compliance (`src/core/concepts/concepts.ts`, `docs/ASSESSMENT_COMPLIANCE.md`)
- Updated FC-02, FC-03, FC-06, FC-07, FC-08, and FC-31 entries with real teach-in topics, challenge references, and evidence tests.
- Re-generated `docs/ASSESSMENT_COMPLIANCE.md` via `npm run docs:concepts`.
- All 28 honesty checks in `src/test/concepts.honesty.test.tsx` pass.

## 4. Results after changes
| Command | Result |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm test` | Test Files: 122 passed / Tests: 981 passed (previous: 936; delta: +45) |
| `npm run build` | Built in 592ms; main JS 342.04 kB (gzip 106.81 kB) |

## 5. Acceptance criteria evidence (Stage 21 §13)
| Criterion | Met? | Evidence |
|---|---|---|
| The new HTML topics/exercises cover each listed gap with passing tests | Met | Verified in `src/test/htmlRules.test.ts` (20 tests), `src/test/htmlTrackExpanded.test.ts` (9 tests), and `src/test/curriculum.test.ts`. |
| A learner with progress in the original 12 topics keeps it untouched after the update | Met | Verified in `src/test/htmlTrackExpanded.test.ts`: learner fixture with 12 completed topics preserves `mastered` status across all 12 topics with zero regression. |
| `npm run new-track -- demo` scaffolds a valid, test-failing-until-filled track; playbook references real paths | Met | Tested in `src/test/trackGenerator.test.ts`: generates all 7 track files and failing-until-filled test suite; `docs/TRACK_PLAYBOOK.md` references real paths. |
| Explore shows availability truthfully; no dead links | Met | Tested in `src/test/app.test.tsx` and `src/pages/Explore.tsx`: unavailable tracks are informational only with no buttons/links (`L-08`). |
| Atlas honesty tests green with updated entries | Met | Tested in `src/test/concepts.honesty.test.tsx`: all 28 honesty checks pass. |

## 6. Preserved Invariants & Guardrails
- **Branch:** `stage-21-html-module-and-playbook` (dedicated Stage 21 branch).
- **Working Tree:** Intentionally uncommitted per user instruction; 100% of accumulated deliverables from Stages 16–20b preserved.
- **Compatibility:** All 12 original HTML topic IDs, quiz scoring, and mastery semantics remain untouched.
- **ESLint Rule:** Literal string `'html'` strictly forbidden in `src/pages/**`, `src/components/**`, `src/core/**`, `src/lib/**` (verified via `npm run lint`).
- **No Git Commit/Push/Tag:** Preserved uncommitted state awaiting user decision.
