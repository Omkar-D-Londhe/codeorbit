# CodeOrbit — Track Integration Playbook (PLT-12)

This playbook is the authoritative, step-by-step specification for adding a new language or technology track module to CodeOrbit.

---

## 1. Architectural Principles

1. **Isolation & Track Independence:**
   - Every technology track lives in its own self-contained directory: `src/tracks/<trackId>/`.
   - The platform core (Shell, Navigation, Settings, Store, Analytics, Atlas) must **never** hardcode or directly import language-specific code.
   - The literal string `'html'` or other track IDs must never appear in `src/core/**`, `src/pages/**`, or `src/lib/**`. Tracks are discovered dynamically via `getTrack(id)` and `getTracks()` in `src/core/content/registry.ts`.

2. **Truthful Availability (L-08, PLT-13):**
   - A track's availability must reflect its actual implementation state:
     - `'available'`: Track has complete curriculum, lessons, quizzes, practice challenges, and tests.
     - `'preview'`: Interactive preview with working lessons/quizzes but partial curriculum.
     - `'planned'`: Planned on the roadmap; shows an informational card with no dead links.
     - `'decision-gated'`: Pending architectural or curriculum gate decision before implementation.
   - Unavailable tracks must never render dead routes or clickable links (L-08).

3. **Capability Honesty:**
   - A track lists a capability in `TrackModule.capabilities` **only if** its UI and engine path work end-to-end and are verified by automated tests.
   - Supported capabilities (`src/core/content/types.ts`):
     - `'lessons'`: Track contains interactive lesson studio content.
     - `'quizzes'`: Track contains interactive knowledge-check quizzes.
     - `'practice'`: Track contains validated coding challenges.
     - `'preview'`: Track supports client-side document/rendering preview.
     - `'execution'`: Track supports isolated code execution via Web Worker (`worker-exec`).
     - `'diagnostics'`: Track supports inline editor linting or diagnostics.
     - `'complexity'`: Track has a registered `AnalysisProvider` for Big-O analysis.
     - `'optimisation'`: Track has optimisation rewriting suggestions.
     - `'diff'`: Track supports reference solution diffing.
     - `'snippets'`: Track provides starter snippet drawer templates.

---

## 2. Directory Structure

A complete track module resides at `src/tracks/<trackId>/`:

```
src/tracks/<trackId>/
├── track.ts            # Export trackModule: TrackModule
├── curriculum.ts       # Topic groups and topics forming a valid DAG
├── lessons.ts          # Lessons with sections, takeaways, and definition tooltips
├── quizzes.ts          # Quizzes with varied question types
├── challenges.ts       # Challenges, requirement rules, and reference solutions
├── achievements.ts     # Track-specific achievements (milestones & badges)
├── snippets.ts         # Code snippets for the Practice drawer
├── validators/         # (Optional) Language-specific challenge validators
└── index.ts            # Public barrel exporting the TrackModule
```

---

## 3. Step-by-Step Implementation Sequence

### Step 1: Scaffolding with the Track Generator
Run the track generator script to create typed boilerplate and failing-until-filled tests:

```bash
npm run new-track -- <trackId>
```

Example:
```bash
npm run new-track -- python
```

This creates:
- `src/tracks/<trackId>/` with stub files conforming to `TrackModule`.
- `src/test/tracks/<trackId>.test.ts` verifying curriculum integrity, DAG validity, and capability honesty.

### Step 2: Curriculum & DAG Validation
Define groups and topics in `curriculum.ts`:
- **Topic IDs:** Lowercase alphanumeric and hyphens (e.g. `variables-types`, `functions`).
- **Prerequisites (`prerequisiteIds`):**
  - All prerequisite IDs must exist within the track.
  - Prerequisites must form a strict Directed Acyclic Graph (DAG) with **zero cycles**.
  - Maximum 42 topics per track to guarantee Constellation Orbit rendering performance.
- Verify DAG validity using `validateConstellation({ topics, groups })`.

### Step 3: Lesson Studio Authoring
Author lessons in `lessons.ts`:
- Each topic must have exactly one corresponding lesson.
- Structure:
  - `topicId`: Matching curriculum topic ID.
  - `title`: Concise heading.
  - `sections`: Structured reading blocks with headings, body paragraphs, and inline `{{term:key}}` definition tooltips.
  - `takeaways`: 2–4 bullet points highlighting core conceptual insights.
  - Estimated reading time (derived via `calculateReadingTime`).

### Step 4: Quiz Engine Authoring
Author quizzes in `quizzes.ts`:
- Each topic must have exactly one corresponding quiz.
- Varied question types:
  - `choices`: Single-choice multiple choice (4 options).
  - `multi`: Multiple select with partial credit.
  - `sorter`: Step ordering with $\ge 44$ px touch targets.
  - `blank`: Code completion with text input.
- Questions must be deterministic, calm, and contain informative explanations for incorrect answers.

### Step 5: Practice Challenges & Validation
Author challenges in `challenges.ts`:
- Each topic must have at least one practice challenge.
- Structure:
  - `id`: Prefixed with `ch-<trackId>-...`.
  - `title` & `prompt`: Clear learner brief.
  - `starterCode`: Starter code for the editor.
  - `solutionCode` & `solutionExplanation`: Reference solution.
  - `requirements`: List of verifiable requirements evaluated via `Rule` or custom `ChallengeValidator`.
  - `hints`: Exactly 3 progressive hints:
    1. Conceptual clue.
    2. Structural clue.
    3. Specific code guidance.
  - `difficulty`: `'beginner' | 'intermediate' | 'advanced'`. Each topic group must feature at least one intermediate or advanced challenge.

### Step 6: Registration in `src/app/registerTracks.ts`
Register the track in `src/app/registerTracks.ts`:
```ts
import { myTrack } from '../tracks/myTrack/track'

export function registerTracks(): void {
  if (!getTrack(myTrack.id)) {
    registerTrack(myTrack)
  }
}
```

### Step 7: Concept Atlas Linking
If the track introduces or teaches Frontend Concepts (FC items):
- Update `teachIn` array in `src/core/concepts/concepts.ts` with `{ trackId, topicId, challengeId }`.
- Regenerate compliance documentation:
  ```bash
  npm run docs:concepts
  ```
- Run honesty tests to ensure all referenced files, topics, and challenges exist:
  ```bash
  npm test -- src/test/concepts.honesty.test.tsx
  ```

---

## 4. Testing Checklist for New Tracks

Before submitting a new track, ensure the following tests pass:

- [ ] **Track Structure:** Unique topic IDs, valid groups, and every topic has a lesson, quiz, and challenge.
- [ ] **DAG Integrity:** Prerequisite graph forms a DAG with zero circular dependencies.
- [ ] **Constellation Orbit Layout:** `computeConstellationLayout` produces deterministic layouts with no star collisions in both landscape and portrait aspect buckets.
- [ ] **Capability Honesty:** Capabilities declared in `track.capabilities` match actual working features.
- [ ] **Progress Persistence:** State migrations and learner progress are preserved across versions.
- [ ] **Accessibility:** All UI views have zero critical or serious axe violations and satisfy WCAG AA contrast.
- [ ] **Quality Gates:** `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass cleanly.
