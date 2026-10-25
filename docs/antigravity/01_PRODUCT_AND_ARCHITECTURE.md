# 01 — Product and Architecture

This file combines the locked product requirements (Part A) and the target architecture and contracts (Part B). **Part A wins over any stage file.**

## Part A — Product Vision and Locked Decisions

### A1. Product statement

CodeOrbit is a browser-based, language-neutral learning studio. A learner picks a language or technology, moves through a **Learning Orbit** of topics, reads short lessons, checks understanding with varied quizzes, writes code in a real editor, gets deterministic feedback, and — once a real analyzer exists for the language — sees time and auxiliary-space complexity estimates with explanations, bottlenecks, optimisation suggestions and before/after comparisons. Progress, notes, achievements and review queues are personal, local, exportable and honest.

**Audience:** self-directed learners (students first). **Tone:** premium, calm, celestial in moderation, never gimmicky. **Data:** local to the browser; no accounts in this roadmap.

### A2. Direction change (supersedes the original blueprint and `AGENTS.md`)

- **Baselines.** The *original* CodeOrbit project is the primary implementation baseline. The *reference* ZIP (`codeorbit_1.zip`) is a reference implementation whose ideas, logic and tests are reused selectively per `05_REFERENCE_ZIP_COMPARISON.md`. Neither limits the agreed scope.
- **Frontend concepts are applied, not just taught** (`06_FRONTEND_CONCEPTS_APPLICATION_MAP.md`). The platform stays React + TypeScript; the technologies it teaches live in separate track modules.

- **HTML is no longer the required primary track.** It becomes the *first optional track module*, kept working and tested. The core platform (shell, orbit, lesson/quiz/practice frameworks, gamification, search, notes, analytics, settings) must not import HTML-specific code.
- Platform-wide features are built **before** new languages. Languages are then added **one at a time**, each with tooling, curriculum, tests and truthful availability states.
- Complexity analysis and optimisation are first-class platform concepts. UI and infrastructure ship early (Stage 20) in an honest "no analyzer registered" state; real results appear only with a real language-specific provider (first: JavaScript, Stage 22).

### A3. Locked decisions

Locked decisions cannot be changed by a stage. Changing one requires the owner to edit this file and log it in `07`.

| ID | Decision |
|---|---|
| L-01 | ~~The Learning Orbit arc opens upward (∩).~~ **SUPERSEDED (2026-10-25) by L-23** for the primary Learning Orbit. No stage may implement arc geometry for it. The baseline arc code stays only as the legacy default until Stage 10a is accepted (`10` §17). |
| L-02 | **AMENDED by L-23.** Node positions depend only on the ordered topic ids, optional authored coordinates and the container's aspect bucket (landscape/portrait) — never on selection, progress, hover or pan/zoom. (The "equal arc length" clause is superseded with L-01.) |
| L-03 | **AMENDED by L-23/L-24.** Map, topic stepper, list view and details panel share one selected id (`state.selectedTopicId`) and sync bidirectionally. Panning, zooming or scrolling never changes selection. Connections are drawn only for declared `prerequisiteIds`; the curriculum-order path is drawn differently and is not a dependency. |
| L-04 | ~~Orbit display mode derived from arc geometry (arch, arch-compact, carousel).~~ **SUPERSEDED by L-23/L-25.** Density (labels, default Map/List view) follows container size and zoom per `10` §7.3, §9; there is no carousel mode. |
| L-05 | The Code Coach is deterministic and challenge-specific. No claim of general AI review. Optional AI hints exist only after Stage 28 decisions and are always labelled. |
| L-06 | Web previews render only in a sandboxed iframe via `srcdoc`. `allow-scripts` and `allow-same-origin` are never combined. Learner markup never enters the trusted DOM. |
| L-07 | Non-web code runs only in a dedicated Worker (or WASM) sandbox with enforced timeout and output limits, never in the main thread or trusted DOM. |
| L-08 | No fake controls, fabricated metrics, invented activity/progress, fake leaderboard rows, or dead routes that look live. Planned features appear as clearly labelled "Planned" or are absent. |
| L-09 | Complexity results are **estimates**: each carries assumptions, a confidence level, and a "heuristic, not a formal proof" statement. Never shown without a real provider. |
| L-10 | Persistence is versioned. `SCHEMA_VERSION` only increases; migrations are append-only and pure; the backup key is preserved on corrupt/newer-version recovery; no secrets in storage. |
| L-11 | Every interactive control is keyboard-operable with a visible `:focus-visible` ring (2px `--focus`, 2px offset). Status is never colour-only (icon/shape + text). |
| L-12 | `prefers-reduced-motion: reduce` disables all non-essential motion, including nebula drift, cursor glow, particles, page transitions, trails and pulses. Motion is interaction-driven, never auto-looping, except the optional nebula and particles which are freezable and off under reduced motion. |
| L-13 | Touch targets ≥ 44px; body text ≥ 16px, nothing smaller than 13px; WCAG AA contrast in every theme (verified by test, not asserted). |
| L-14 | The platform's own stack stays React + TypeScript + Vite + React Router + custom CSS tokens; it is never rewritten in a technology it teaches (no Bootstrap/Angular in the core). Taught technologies live in `src/tracks/<id>` and render only inside the sandboxed preview or Worker. New dependencies must be justified (size, licence, maintenance, a11y) and recorded in `docs/DECISIONS.md`. |
| L-15 | Existing progress semantics are preserved (`lib/quiz.ts`, `lib/progress.ts`): a quiz *counts as a step* when `correct × 3 ≥ total × 2` (`isPass`); a topic is *completed* when lesson + passed quiz + practice are done; it is *mastered* only when also the best quiz score is perfect (`isPerfect`) and every challenge was completed without revealing the solution. Gamification may never alter these rules. |
| L-16 | XP, streaks, badges and analytics derive only from real recorded events with real timestamps. No back-filling or invention. |
| L-17 | Focus mode is expandable/reversible and preserves drafts. Desktop learning is split-screen. |
| L-18 | Each stage ends with a green exit gate (typecheck, lint, test, build, stage tests, evidence). |
| L-19 | Engagement data follows the reference-validated truthfulness rules: a streak day is recorded only for a *meaningful action* (lesson completed, quiz finished, check run, later: review card answered); visiting, selecting, bookmarking, drafting, noting, searching and settings never count; dates are the device's local calendar days; nothing is back-filled. |
| L-20 | Achievements are *derived* from saved state, each shows its exact rule, and no earned date is shown unless it was really observed. XP is a pure function of saved state (no farmable counters). |
| L-21 | The daily challenge is a local, deterministic rotation, independent of progress, **frozen once assigned for a day**, and never described as shared with other people or devices. |
| L-22 | The original project is the baseline: working components are not replaced merely to match a preferred architecture; reference-ZIP code is copied only after the compatibility/quality check recorded in `05`. |
| L-23 | **The primary Learning Orbit is a celestial constellation map** (central track hub, topic stars on a deterministic spiral, prerequisite connections, pan/zoom, topic-details panel), approved by the owner on 2026-10-25. Full specification: `10_CONSTELLATION_LEARNING_ORBIT_SPEC.md`. The concept image `design-reference/codeorbit_constellation_concept.png` is a mood/composition reference only, never an asset or data source. Supersedes L-01 and L-04; amends L-02 and L-03. |
| L-24 | **Constellation data truth.** Every node maps to a real `Topic.id`; every connection is a declared `prerequisiteIds` entry; node states, counts and progress are derived from real state, never stored, invented or seeded; selecting a node sets `selectedTopicId` and its actions open the existing lesson/quiz/practice routes. "Locked" is derived and advisory unless the owner decides otherwise (O-16). |
| L-25 | **The map is never the only path.** A complete list view and a topic stepper offer every topic and action with full keyboard and screen-reader support; pan/zoom have button and keyboard equivalents; reduced motion and high contrast are honoured. |
| L-26 | **Visual acceptance needs evidence.** A UI stage (and the constellation in particular) is visually accepted only after the real application was run, screenshots were captured and looked at at the agreed viewports, compared with the design references, defects fixed and re-inspected. Without that evidence the check is reported NOT VERIFIED. The constellation is delivered prototype-first: 10a prototype → owner approval (O-15) → 10b roll-out. |

### A4. Resolved product decisions (defaults Antigravity must follow)

| ID | Decision | Rationale |
|---|---|---|
| P-01 | Editor library: **CodeMirror 6** (modular, small, accessible), not Monaco. Monaco only if the owner reverses this in `07`. | Bundle size, mobile support, Tab handling control. |
| P-02 | Theme names: **Obsidian** (default dark), **Starlight** (light, high contrast), **Aurora** (teal dark). Plus a **High-contrast** mode (13.3) layered on any theme. | Catalog 1.8, 13.3. |
| P-03 | Accent options: five curated, each tested for AA on every theme; default violet `#9a8bff`. | Catalog 1.9. |
| P-04 | Gamification is optional: a Settings switch ("Show XP and achievements") defaults **on**; turning it off hides XP, levels, badges and toasts but keeps data. | Avoid pressure. |
| P-05 | "Leaderboard (Local)" (8.5) lists only the learner's own personal bests and previous periods on this device. No fake peers. | L-08. |
| P-06 | Keep the existing quiz semantics exactly: pass = at least two thirds correct (`isPass`), mastery requires a perfect best (`isPerfect`). New question types (Stage 09) must report `{correct,total}` in the same shape so these functions keep working. | Preserve current behaviour. |
| P-07 | Time estimates (4.6, 11.3, 12.2) are labelled **estimate** until at least 3 real timed sessions exist; "actual" appears only from measured active time. | L-08, L-16. |
| P-08 | Daily challenge selection is **deterministic from the local date and the learner's available content** (no network). It is labelled as a local rotation. | Offline-first. |
| P-09 | Backend-requiring features (AI hints, W3C validator, multiplayer) are built only after the owner records a decision (Stage 28); until then they are absent or clearly "Not connected". | L-08. |
| P-10 | Language tracks are registered through a `TrackModule` contract (see Part B §B2). Tracks declare which capabilities they support; the UI hides or labels unsupported ones truthfully. | Language-neutral core. |
| P-11 | **Constellation renderer: SVG (connections, rings, halos) + real DOM `<button>` stars in a CSS-transformed wrapper + CSS-gradient starfield. No canvas, WebGL or 3D engine in v1.** Escalation to a canvas edge/backdrop layer only with measured evidence and owner approval (`10` §11). | Simplest performant and accessible option that meets the design; native focus, hit-testing and text scaling. |
| P-12 | Map is the default view; List is the default only when the track has more than 14 topics and the container is narrower than 768 px. The learner's explicit Map/List choice is stored as a per-viewer UI preference (`codeorbit:ui:orbit-view`), not in learner data. | Legibility on phones without removing the map. |
| P-13 | The concept image is included in the pack as a labelled reference and is never shipped in the application. Where it conflicts with the written spec or real data (topic names, numbering, counts, fake navigation) the spec and real data win. | Avoids copying concept-art placeholders. |

### A5. Feature categories and the product they build

1. **Platform foundation** — design system v2, themes, settings, data management, versioned storage.
2. **Learning Orbit** — celestial constellation map (hub, topic stars, prerequisite connections, pan/zoom, details panel) with list view and stepper; pulse/trail, zones, magnify, "you are here", mini constellation, search highlight (`10`).
3. **Learning framework** — lesson studio, quiz engine (5+ question types), practice workspace, feedback/Code Coach, error notebook.
4. **Editor** — CodeMirror 6 adapter, resizer, auto-save, fullscreen, snippets, diff, device frames.
5. **Motivation** — XP/levels, badges, streaks, milestones, daily challenge, local personal bests.
6. **Discovery** — command palette, fuzzy search, filters/tags, related topics, shortcuts modal, onboarding.
7. **Personal knowledge** — rich notes, tags, bookmark folders, flashcards, export.
8. **Insight** — dashboard, mastery map, heatmaps, velocity, gap recommendations, sharing card.
9. **Inclusivity** — font scaling, dyslexia-friendly font, high contrast, screen-reader announcements, reminders.
10. **Reliability** — code splitting, optimistic UI, quota guard, offline/PWA, error recovery UI.
11. **Learning science and authoring** — spaced repetition, custom challenge creator, peer snapshots, voice read, portfolio export.
12. **Complexity analysis and optimisation** — provider contracts, analysis UI, comparison, correctness checks.
13. **Language tracks** — HTML (module), CSS, JavaScript, Bootstrap, Python, Java/C++ (decision-gated), Angular (decision-gated).

### A6. Non-goals

User accounts or cloud sync; server-side rendering; executing arbitrary learner code outside a Worker/WASM or sandboxed iframe; fabricated analysis, metrics or peers; native mobile apps (the PWA covers installability); real-time multiplayer without an owner-approved transport (Stage 28).

### A7. Definition of "done" for the product

All 110 catalog items are either implemented and verified, or explicitly parked behind a recorded decision with a truthful UI state. Every stage has a signed-off status report. `FINAL_INTEGRATION_AND_ACCEPTANCE.md` is fully ticked with evidence.


---

## Part B — Target Architecture and Contracts

This part defines the shape the codebase moves toward. Stages introduce each piece incrementally; the contracts here are the stable interfaces. Paths are targets, not facts about the current repo (see `00_BASELINE_AUDIT.md` for what exists). **Evolve, do not rewrite:** the existing `src/components`, `src/pages`, `src/lib`, `src/state`, `src/data`, `src/styles` stay where they are and keep working; new platform modules are *added* under `src/core/<area>` and track content under `src/tracks/<id>`; an existing file moves only when a stage needs it, with `git mv`, tests green before and after.

## B1. Layering and module boundaries

```
src/
  components/ pages/ lib/ state/ data/ styles/   EXISTING — evolve in place (see rule above)
  core/           NEW language-neutral platform modules (NO imports from src/tracks/*)
    content/      TrackRegistry, content contracts, concept registry
    learning/     mastery, quiz engine, practice engine, coach, review / spaced repetition
    orbit/        masteryLayout (from reference), force layout, mini constellation; orbit/constellation/ = the constellation map (`10`). Legacy arc `orbitGeometry.ts` stays in lib/ only until Stage 10a is accepted
    editor/       EditorAdapter contract + CodeMirror adapter + plain adapter
    analysis/     AnalysisProvider contract, registry, result validation, comparison
    runner/       CodeRunner contract, Worker sandbox host, iframe preview host
    gamification/ streak (from reference), daily, achievements, xp, levels
    search/       index, fuzzy matcher, command registry
    insights/     analytics derivations
    settings/     settings model, theme/accent application
    storage/      migrations v2+, quota guard, export/import (storage.ts stays the entry point)
    a11y/         announcer, shortcuts, contrast utilities, focus utilities
    time/         Clock / ClockProvider (injectable "now")
    ui/           design-system components (extracted from components/ gradually)
  tracks/         one folder per language/technology: html/ css/ javascript/ bootstrap/ python/ java/ cpp/ angular/
    <id>/         track.ts (TrackModule), curriculum, lessons, quizzes, challenges, validators/runners/analysis providers, achievements, concept entries
```

**Rules**

1. `core/**` never imports `tracks/**`. Tracks register themselves in `app/registerTracks.ts`; pages receive tracks from the registry. (The reference ZIP's `daily.ts` and `achievements.ts` import content directly — do not copy that coupling.)
2. Tracks never import each other. Shared language helpers live in `core/`.
3. Pure logic (geometry, mastery layout, streaks, daily pick, achievements, XP, scoring, diff, fuzzy match, analysis comparison) is plain `.ts` with no DOM/React, unit-tested.
4. Persisted data is reachable only through `lib/storage.ts`/`core/storage`; components use selectors and dispatch, never `localStorage` directly.
5. The reducer stays pure; time comes from an injected clock (`now` on actions, optional as in the reference; absent ⇒ no activity recorded); side effects live in hooks/effect modules.
6. The platform's React/TypeScript code is separate from taught technologies: track content is data plus sandboxed execution, never platform code.

Stage 01 introduces `TrackRegistry` and makes the existing HTML content available through an `html` `TrackModule` **without moving content files**; Stage 21 completes HTML-module packaging only if tests stay green.

## B2. Content contracts (language-neutral)

```ts
export type CapabilityId =
  | 'lessons' | 'quizzes' | 'practice' | 'preview' | 'execution'
  | 'diagnostics' | 'complexity' | 'optimisation' | 'diff' | 'snippets' | 'a11yLint'

export interface TrackModule {
  id: string                       // 'html', 'css', 'javascript', ...
  name: string
  glyph: string
  description: string
  availability: 'available' | 'preview' | 'planned' | 'decision-gated'
  tint: string                     // CSS custom property value for nebula tint (1.1)
  language: LanguageDescriptor
  capabilities: CapabilityId[]     // honest list; UI reads this
  groups: TopicGroup[]
  topics: Topic[]
  lessons: Record<string, Lesson>
  quizzes: Record<string, Quiz>
  challenges: Challenge[]
  runner?: CodeRunner              // preview or execution host
  validatorFactory?: ChallengeValidatorFactory
  analysisProvider?: AnalysisProvider
  snippets?: Snippet[]
  achievements?: AchievementDef[]            // track-scoped (Stage 11)
  concepts?: ConceptEntry[]                  // Concept Atlas entries (Stage 19)
  previewStylesheets?: Array<() => Promise<string>>  // lazily loaded CSS for the preview (Stage 24)
  constellation?: ConstellationTrackMeta     // optional icons/authored positions (`10` §3)
}

export interface ChallengeTestCase { id: string; name: string; call: string; expect: unknown; hidden?: boolean }  // executable tracks; hidden cases report only counts

export interface LanguageDescriptor {
  id: string; displayName: string; fileExtension: string
  editorLanguageId: string         // key understood by the EditorAdapter
  defaultFiles?: ChallengeFile[]
}

export interface Topic {
  id: string; trackId: string; groupId: string
  title: string; shortTitle: string; description: string
  prerequisiteIds: string[]
  tags?: string[]; estimatedMinutes?: number   // estimatedMinutes is authored, labelled "estimate"
}

export interface ChallengeFile { name: string; language: string; content: string; readOnly?: boolean }

// Challenge (the target shape; Stage 01 calls it `ChallengeV2` while the baseline `Challenge` still exists and adapts to it)
export interface ChallengeV2 {
  id: string; trackId: string; topicId: string; title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prompt: string; objective: string
  files: ChallengeFile[]            // replaces single starterCode; single-file = one entry
  requirements: ChallengeRequirement[]
  hints: [string, string, string]
  solution: { files: ChallengeFile[]; explanation: string }
  tests?: ChallengeTestCase[]       // for executable tracks (shape below)
  referenceComplexity?: ReferenceComplexity   // for analysis comparison; authored, not computed
}
```

`ChallengeRequirement` is `{ id, label, explain?: string, check: RuleSpec }` where `RuleSpec` is a discriminated union owned by the track (HTML keeps the current `Rule` union). The core only knows `ChallengeValidator`:

```ts
export interface RequirementResult { id: string; met: boolean; detail?: string; line?: number; column?: number }
export interface ChallengeValidator { validate(files: ChallengeFile[]): RequirementResult[] | Promise<RequirementResult[]> }
export type ChallengeValidatorFactory = (challenge: Challenge) => ChallengeValidator
```

Migration compatibility: `starterCode`/`solutionCode` map to `files[0]`/`solution.files[0]`; a one-time adapter in Stage 01 builds the new shape from existing data without changing persisted drafts (drafts stay keyed by challenge id and, from Stage 06, by `challengeId::fileName`).

## B3. Editor contract (Stage 05)

```ts
export interface EditorAdapter {
  mount(el: HTMLElement, opts: EditorOptions): EditorHandle
}
export interface EditorOptions {
  value: string; language: string; readOnly?: boolean; ariaLabel: string
  lineNumbers: boolean; wrap: boolean; fontSize: number; tabSize: number
  tabCapturesFocus: boolean        // default false: Tab leaves the editor (no keyboard trap); Esc then Tab, or user opt-in, indents
  onChange(value: string): void
  onCursor?(pos: { line: number; column: number }): void
}
export interface EditorHandle {
  getValue(): string; setValue(v: string): void
  insertAtCursor(text: string): void
  focus(): void; setDiagnostics(d: EditorDiagnostic[]): void
  setReadOnly(v: boolean): void; updateOptions(o: Partial<EditorOptions>): void
  destroy(): void
}
export interface EditorDiagnostic { line: number; column?: number; severity: 'error'|'warning'|'info'; message: string }
```

A `<CodeEditor>` React component wraps the adapter; the current textarea editor stays as `PlainTextEditorAdapter` fallback (used if CodeMirror fails to load, for tests, and when the user chooses "Simple editor" in Settings).

## B4. Runner contract (previews and execution)

```ts
export type RunnerKind = 'iframe-preview' | 'script-preview' | 'worker-exec'
export interface CodeRunner {
  kind: RunnerKind
  run(input: RunInput, signal: AbortSignal): Promise<RunResult>
}
export interface RunInput { files: ChallengeFile[]; stdin?: string; limits?: { timeoutMs: number; maxOutputBytes: number } }
export type RunResult =
  | { status: 'ok'; stdout?: string; stderr?: string; durationMs: number; previewDoc?: string }
  | { status: 'timeout' | 'memory' | 'error'; message: string; stderr?: string; durationMs: number }
```

- `iframe-preview` returns a `previewDoc` for `SandboxedPreview` (HTML/CSS/Bootstrap). The preview iframe keeps `sandbox=""`. Multi-file stitching (6.5) happens in `buildPreviewDocument`, never in the parent DOM.
- `script-preview` (Stage 23, C-05) renders learner HTML+JS in an opaque-origin iframe: `sandbox="allow-scripts"` **only** (never with `allow-same-origin`), CSP `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:`, results through a nonce-checked `postMessage` schema, replaced on timeout.
- `worker-exec` hosts a language engine inside a dedicated Web Worker created from a static module (no `eval` in the main thread). Hard limits: default 3000 ms timeout enforced by the host terminating the worker, output capped (default 64 KiB), no network (CSP on the worker script), no DOM. Each run uses a fresh worker unless the track documents otherwise.
- Runner availability is a capability; the UI never shows "Run" for tracks that lack it.

## B5. Complexity analysis and optimisation contracts (Stage 20+)

```ts
export type Confidence = 'low' | 'medium' | 'high'
export type ComplexityClass = string   // normalised Big-O text: 'O(1)', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)', ...

export interface AnalysisInput { language: string; files: ChallengeFile[]; entryPoint?: string; inputSizeSymbol?: string }

export interface ComplexityEstimate {
  time: { worst?: ComplexityClass; average?: ComplexityClass; best?: ComplexityClass }
  auxiliarySpace: ComplexityClass
  confidence: Confidence
  assumptions: string[]            // required, non-empty; e.g. "n is the length of arr", "built-in sort is O(n log n)"
  limitations: string[]            // required: what the analyzer could not model
  explanation: Explanation         // stepwise, referencing source ranges
  bottlenecks: Bottleneck[]        // source ranges ranked by contribution
  method: 'static-ast' | 'instrumented-measurement' | 'hybrid'
  isFormalProof: false             // literal false; heuristics are never proofs
}
export interface Explanation { summary: string; steps: Array<{ text: string; range?: SourceRange; contributes?: ComplexityClass }> }
export interface Bottleneck { range: SourceRange; reason: string; contributes: ComplexityClass; rank: number }
export interface SourceRange { file: string; startLine: number; startCol: number; endLine: number; endCol: number }

export interface OptimisationSuggestion {
  id: string; title: string; rationale: string
  expected: { time?: ComplexityClass; auxiliarySpace?: ComplexityClass }
  risk: 'none' | 'low' | 'medium'
  patch?: { files: ChallengeFile[] }       // optional proposed rewrite
  requiresCorrectnessCheck: true
}

export interface CorrectnessCheck { passed: boolean; cases: Array<{ name: string; passed: boolean; detail?: string }>; coverageNote: string }
export interface Comparison {
  before: ComplexityEstimate; after: ComplexityEstimate
  correctness: CorrectnessCheck
  measurement?: { inputSizes: number[]; beforeMs: number[]; afterMs: number[]; environmentNote: string }
}

export interface AnalysisProvider {
  id: string; language: string; version: string
  supports(input: AnalysisInput): { ok: true } | { ok: false; reason: string }
  analyze(input: AnalysisInput, signal: AbortSignal): Promise<ComplexityEstimate>
  suggest?(input: AnalysisInput, estimate: ComplexityEstimate): Promise<OptimisationSuggestion[]>
  verifyEquivalence?(before: AnalysisInput, after: AnalysisInput): Promise<CorrectnessCheck>
  worker?: { scriptUrl: string }          // providers that need a Worker (e.g. Python `ast` inside Pyodide)
  maxConfidence?: Confidence             // hard cap enforced by the validator (Java/C++ static estimators: 'medium')
}
```

**Truthfulness rules** (enforced by tests in Stage 20):
- `analysisRegistry.get(language)` returns `undefined` when no provider is registered; the UI then shows "Complexity analysis is not available for <language> yet." and **no numbers**.
- `assumptions` and `limitations` must be non-empty or the result is rejected by a validator and shown as "Analysis could not be completed".
- The UI always shows method, confidence and the "heuristic estimate, not a formal proof" line.
- An optimisation suggestion cannot be shown as "verified" unless `verifyEquivalence` ran and passed against the available test cases; otherwise it is labelled "Unverified suggestion".
- Measured timings (hybrid method) show the environment note and are never presented as asymptotic proof.

## B6. State model (target, `schemaVersion` 2 and beyond)

```ts
interface CodeOrbitState {
  schemaVersion: number
  // v1 fields kept: lastVisited, selectedTopicId, topics, quizSessions, drafts, challenges, bookmarks, errorNotebook, notes
  // v2 (Stage 03) — migration v1→v2 PRESERVES activityDays/dailyDone when present (reference-style v1 data) and adds defaults when absent
  activityDays: string[]                          // local 'YYYY-MM-DD', unique, sorted, max 400 — durable basis of streaks (reference D1/D2)
  dailyDone: string[]                             // local days on which that day's daily challenge was passed (reference D4)
  streakBest: number                              // longest streak ever seen; survives the 400-day activityDays cap
  dailyAssigned: Record<string, string>           // dayKey -> challengeId, frozen on first view of the day (adaptation of D4); pruned to the last 400 days
  settings: Settings
  activity: ActivityEvent[]                       // append-only, capped (5,000), real timestamps only; feeds velocity/heatmaps; streaks do NOT depend on it so pruning never loses a streak
  // v5 (Stage 11)
  badges: Record<string, { firstSeenAt: number | null; backfilled: boolean }>   // achievements are derived; this only remembers when they were first observed
  personalBests: Record<string, number>
  // later (see the schema-version table in 03_STAGE_PLAN.md): history v3, sectionBookmarks v4, notes+folders v6, timeSpent v7, review+custom v8, analysis.history v9
}
```

- XP and levels are **not stored**: they are a pure function of the saved records (L-20). `badges` stores only first-seen timestamps.
- Each schema bump adds one migration function `vN-1 → vN`: pure, idempotent, total (never throws on odd input), covered by a test with a fixture of the previous version. `sanitizeState` drops invalid sub-records rather than the whole state ("repaired").
- `activity` events: `{ id, type, at: number, trackId?, topicId?, refId?, meta?: Record<string, string|number|boolean> }`. Types are an enum (`lesson-complete`, `quiz-finish`, `challenge-check`, `challenge-pass`, `hint`, `solution-reveal`, `note-save`, `bookmark`, `review-answer`, `analysis-run`, ...). Everything in streaks, velocity, heatmaps and XP derives from these.
- Large derived data (search index, mastery graph layout) is **never** persisted.
- Persistence is debounced (250–500 ms) and flushed on `visibilitychange`/`pagehide`. A quota guard (Stage 03) estimates the serialised size, warns at 80% of a 4 MiB soft budget, and offers export/prune; a failed write sets `saveStatus.kind='error'` (existing) and shows the banner.
- `localStorage` keys: `codeorbit:state` (main), `codeorbit:state:backup`, `codeorbit:settings:early` (tiny: theme/accent/reduce-motion override, read before React mounts to prevent a flash). Keep all keys prefixed `codeorbit:`.
- Export format (14.4): `{ app: 'codeorbit', exportVersion: 1, schemaVersion, exportedAt, state }` JSON. Import validates, migrates, shows a diff-style summary, and requires confirmation; it never merges silently.

## B7. Settings model (Stage 03)

```ts
interface Settings {
  profile: { displayName: string; goal?: string }          // 14.1, local only
  pace: 'relaxed' | 'steady' | 'intensive'                 // 14.2 -> daily target + reminder copy
  theme: 'obsidian' | 'starlight' | 'aurora'
  accent: 'violet' | 'teal' | 'amber' | 'rose' | 'azure'
  contrast: 'normal' | 'high'
  fontScale: 0.875 | 1 | 1.125 | 1.25 | 1.5
  dyslexiaFont: boolean
  motion: 'system' | 'reduce' | 'full'
  atmosphere: { nebula: boolean; grid: boolean; cursorGlow: boolean; particles: boolean }
  editor: { engine: 'codemirror' | 'plain'; fontSize: number; tabSize: 2|4; lineNumbers: boolean; wrap: boolean; tabCapturesFocus: boolean; autoClose: boolean }
  gamification: { enabled: boolean }
  reminders: { enabled: boolean; time?: string; days: number[] }   // local only; see 14.3 for limits
  announcements: boolean                                          // 13.4
  onboarding: { completed: boolean; skippedAt?: number }          // 15.1 tour (Stage 17)
}
```

Defaults preserve today's experience: Obsidian, violet, normal contrast, scale 1, atmosphere layers **on only if** motion is allowed (nebula on, grid on, cursor glow off, particles off).

## B8. Search and command contracts (Stage 13)

```ts
interface Command { id: string; title: string; keywords: string[]; group: 'Navigate'|'Learn'|'Practice'|'Settings'|'Data'|'Help'; shortcut?: string; enabled(): boolean; run(): void }
interface SearchDoc { id: string; kind: 'topic'|'lesson-section'|'challenge'|'note'|'bookmark'|'command'; trackId?: string; title: string; body: string; tags: string[]; path: string }
```

The index is built in memory on first palette open (lazy, off the main render path), rebuilt when notes/bookmarks change. Fuzzy matching is implemented in `core/search/fuzzy.ts` (small, tested) or `fuse.js` if justified; matches return highlight ranges.

## B9. Security boundaries

| Boundary | Rule |
|---|---|
| Web preview iframe | `sandbox=""`, `srcdoc`, restrictive CSP, `referrerPolicy="no-referrer"`. Device frames (6.6) are CSS wrappers around the same iframe, never a second renderer. |
| Script preview iframe (Stage 23) | `sandbox="allow-scripts"` only; **never** with `allow-same-origin`; opaque origin; CSP `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:`; nonce-checked, schema-validated `postMessage`; forged messages ignored; infinite loop ⇒ iframe replaced on timeout; a unit test fails if both flags ever appear together. |
| Worker execution | Module Worker, no DOM, CSP `connect-src 'none'`, timeouts by terminate, output cap, fresh instance per run, message schema validated on both sides. |
| Storage | No secrets. Notes are rendered through a sanitising Markdown-subset renderer (no raw HTML). Imports are schema-validated and sanitised before use. |
| URLs | Peer snapshots (17.3) encode data in the fragment (`#`), are size-capped, validated and rendered read-only; code in them is never auto-run. |
| Third-party network | None by default. W3C validator (17.5) and AI hints (17.2) are opt-in, show what is sent, and are absent until Stage 28 decisions. |
| Dependencies | Licence compatible, pinned via lockfile, audited with `npm audit` at each stage; bundle impact recorded. |

## B10. Cross-cutting state flows

1. **Learning event flow:** UI action → dispatch domain action → reducer updates records **and** appends an `ActivityEvent` (same reducer step, so they cannot diverge) → selectors derive progress/XP/streak → `useAnnouncer` and toasts react to *derived changes* (e.g. level up), never to raw actions.
2. **Persistence flow:** state change → debounced `saveState` → quota guard → success/failure → `saveStatus` → `SaveNote` + auto-save indicator.
3. **Track flow:** `TrackRegistry` supplies tracks → pages receive `trackId` from route/state; no page hard-codes a track id.
4. **Analysis flow:** Practice "Analyse" → `analysisRegistry.get(language)` → provider `analyze` (abortable, with timeout) → validated `ComplexityEstimate` → `AnalysisPanel`; "Optimise" → `suggest` → optional `verifyEquivalence` → `Comparison`.
5. **Theme flow:** Settings → `applySettings()` sets `data-theme`, `data-accent`, `data-contrast`, `data-motion`, font-scale CSS variable on `<html>`; the early script in `index.html` applies the same attributes from `codeorbit:settings:early` before first paint.
