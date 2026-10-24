# CodeOrbit — Decisions Log

Significant project decisions, with rationale, alternatives, milestone, and impact. New entries are added at the bottom. A decision can define a locked product requirement while leaving the exact visual treatment to Claude-owned UI design; this distinction is noted below.

Template for new entries:

| # | Decision | Reason | Alternatives considered | Milestone | Impact |
|---|----------|--------|-------------------------|-----------|--------|

---

## D-001 — Product scope: frontend-only, HTML-first learning studio

- **Decision:** CodeOrbit is a frontend-only learning and practice platform. The first complete learning track is HTML; CSS, JavaScript, Bootstrap, and Angular may appear as clearly labelled previews or future extensions in the first release.
- **Reason:** Matches the mini-project brief, keeps the first release demonstrable end-to-end, and avoids backend scope.
- **Alternatives considered:** Full multi-track platform at launch; backend-backed multi-user app.
- **Milestone:** Phase 0 (2026-10-22).
- **Impact:** Architecture must support adding tracks through structured content and challenge definitions rather than a redesign. Preview cards must not lead to fake or unfinished experiences.

## D-002 — Proposed stack: React + TypeScript + Vite

- **Decision:** Proposed stack is React + TypeScript, bundled by Vite, with React Router, custom CSS/CSS variables, and browser localStorage.
- **Reason:** Blueprint §20.1 preference; typed, portable, offline-capable, and no backend required for the MVP.
- **Alternatives considered:** Plain HTML/CSS/JS; Bootstrap-led UI; Next.js; state libraries (Redux/Zustand) up front.
- **Milestone:** Phase 0 (2026-10-22).
- **Impact:** **Proposed, not final.** Any mandatory library/framework requirement in the original assessment sources overrides this. Review and update the decision only after the source documents are checked and `ASSESSMENT_COMPLIANCE.md` is populated.

## D-003 — Signature feature locked: upward-opening Learning Orbit

- **Decision:** The Learning Orbit combines a horizontal topic strip with an upward-opening semicircular topic arrangement beneath it. The arc rises toward the centre like a hill/rainbow: ends lower, centre higher. A downward-opening arc is explicitly prohibited.
- **Reason:** Blueprint §7.1 and the product's defining interaction. The orientation is a locked requirement, not an optional visual preference.
- **Alternatives considered:** Downward arc; flat carousel only; conventional grid of topic cards.
- **Milestone:** Phase 0 requirements; interaction validation in Phase 3.
- **Impact:** Both views share stable topic IDs, canonical topic order, selected topic, visible range, and progress state. Bidirectional scroll/selection synchronisation must have loop guards. Acceptance criteria belong in blueprint §24.2 and `TEST_PLAN.md`.

## D-004 — Safe preview: sandboxed iframe, no scripts

- **Decision:** Learner HTML renders only inside a sandboxed iframe without script privileges for the HTML-only MVP.
- **Reason:** Learner code is untrusted; blueprint §10.2. Combining `allow-scripts` and `allow-same-origin` can defeat the intended isolation.
- **Alternatives considered:** `srcdoc` in the parent DOM; server-side rendering; `eval`.
- **Milestone:** Phase 0 (2026-10-22).
- **Impact:** Future JavaScript execution requires a separate threat model and stricter isolation before implementation.

## D-005 — Deterministic rule-based feedback (no AI review in MVP)

- **Decision:** The initial Code Coach is a deterministic, challenge-specific requirement checker with progressive hints, lesson links, explanations, and reference solutions. It must not represent itself as a general AI code reviewer.
- **Reason:** Explainable, offline, no API cost; blueprint §11 keeps broad AI review out of the initial scope.
- **Alternatives considered:** LLM-based arbitrary code review, which requires a backend, keys, cost controls, privacy review, error handling, and security work.
- **Milestone:** Phase 0 (2026-10-22).
- **Impact:** Validator logic is defined per challenge. Feedback explains what failed and why. Optional AI integration may be considered only as a separately approved future scope.

## D-006 — Blueprint renamed to canonical path

- **Decision:** The blueprint is maintained at `docs/CODEORBIT_BLUEPRINT.md`. The original project copy was renamed from `docs/CodeOrbit_Project_Blueprint.md` while preserving its content byte-for-byte at that time (SHA-256 `3361fbd2b0efad01393c50d56a7eaced046a3fd571c69fadef6c5a5a1870fd8c`; 1,518 lines at the time of renaming).
- **Reason:** Blueprint §30 and `AGENTS.md` reference the canonical path; one source avoids broken cross-references.
- **Alternatives considered:** Keep the original filename and edit all references; duplicate the file.
- **Milestone:** Phase 0 (2026-10-22).
- **Impact:** All project documents should link to the canonical path. The update package intentionally changes the blueprint's content to elaborate decisions; the historical hash is not expected to remain valid after this update.

## D-007 — Experience balance: professional with subtle gamification

- **Decision:** The overall product experience is a hybrid: professional learning workspace first, subtle gamification second. Progress, streaks, points, milestones, and badges should support learning rather than dominate the screen.
- **Reason:** The platform should feel polished, credible, and motivating without becoming visually noisy or pressuring the learner.
- **Alternatives considered:** Strictly utilitarian/academic interface; highly gamified arcade-like interface.
- **Milestone:** Product design baseline (2026-10-22); refine in `DESIGN.md` and the implemented achievement/progress screens.
- **Impact:** Rewards must reflect real saved learning activity. Avoid meaningless-click points, invented metrics, excessive confetti, nagging prompts, and high-attention visual treatment. Keep gamification optional or restrained where possible.

## D-008 — Learning workspace: split screen with expandable focus mode

- **Decision:** Desktop learning uses a split-screen studio: learning content on one side and practice/editor/preview on the other. Focus mode expands the practice area and collapses secondary navigation without destroying the lesson context or learner draft.
- **Reason:** Supports the one-topic/one-learning-loop promise while allowing concentrated coding practice.
- **Alternatives considered:** Separate unrelated lesson and editor pages only; permanently full-screen editor; fixed narrow editor panel.
- **Milestone:** Product design baseline (2026-10-22); design in `DESIGN.md` and the implemented learning/practice screens.
- **Impact:** Mobile/tablet may use tabs or stacked panels, but must preserve current activity and code. Focus entry/exit must be explicit, reversible, and draft-safe.

## D-009 — First-release content: HTML complete; other technologies are previews

- **Decision:** The HTML track receives the complete usable learning loop. CSS, JavaScript, Bootstrap, and Angular may be shown in the catalog as future/preview items, but not as functional full curricula in the first release.
- **Reason:** Keeps scope manageable and the demonstration end-to-end, while signalling the architecture's future growth direction.
- **Alternatives considered:** Partially implemented versions of several tracks; full multi-track build before any track is complete.
- **Milestone:** Product design baseline (2026-10-22).
- **Impact:** Catalog status labels, topic counts, progress, and actions must be data-grounded. Preview cards cannot open misleading placeholder pages or display fabricated progress.

## D-010 — Learning Orbit visual identity: celestial knowledge atlas

- **Decision:** The Learning Orbit's visual concept is a restrained celestial knowledge atlas. Topic stars/nodes sit along the locked upward arc; fine orbital paths may show real prerequisites or relationships; completed states illuminate subtly; in-progress states may use a progress ring; the selected node receives local emphasis. The arc itself and horizontal strip remain the primary navigation.
- **Reason:** Makes the signature feature feel like exploration of a curriculum rather than a plain semicircle of cards, while retaining clear educational navigation.
- **Alternatives considered:** Generic semicircle of cards; flat carousel alone; decorative starfield without topic semantics.
- **Milestone:** Requirements/design planning (2026-10-22); validate during Orbit implementation and visual QA.
- **Impact:** The concept and behavioural guardrails are baseline requirements; exact palette, star glyphs, line weights, glow levels, spacing, and easing remain unapproved until Claude-owned UI design review. Connections must be truthful and stable, never decorative false graph edges. No infinite ambient motion.

## D-011 — Learning Orbit navigation: arc wherever usable, carousel as fallback

- **Decision:** Keep the upward arc wherever labels, spacing, touch targets, and orientation remain usable. For mobile/narrow layouts where a compact arc becomes crowded or confusing, use a styled horizontal carousel fallback that preserves the same ordered topic IDs, selected state, progress state, and celestial identity.
- **Reason:** Protects the signature interaction on suitable screens without forcing an unusable mobile design.
- **Alternatives considered:** Force the full semicircle at every viewport; replace the arc entirely with a carousel at all sizes.
- **Milestone:** Requirements/design planning (2026-10-22); compare alternatives during responsive implementation and visual QA.
- **Impact:** The breakpoint and exact mobile visual model are determined by design/legibility review, not arbitrary assumptions. The fallback must be recorded in `DESIGN.md` and tested.

## D-012 — Map motion: stable positions, interaction-driven transitions

- **Decision:** Topic positions remain stable for the same curriculum and viewport class. Selection changes local emphasis and the detail panel. Navigation to a distant range may use a controlled pan; short star-to-star glides or connecting trails are allowed only when they clarify selection. The map is static when idle.
- **Reason:** Stable spatial memory helps learners orient themselves; motion should signal user action, not constantly compete for attention.
- **Alternatives considered:** Re-layout every node around the selected topic; continuously drifting/twinkling starfield; no motion of any kind.
- **Milestone:** Requirements/design planning (2026-10-22); validate during Orbit implementation and reduced-motion visual QA.
- **Impact:** Use transform/opacity where suitable; avoid scroll-jacking, forced jumps, feedback-loop jitter, continuous ambient particles, and motion-dependent comprehension. Provide reduced-motion alternatives.

## D-013 — Implementation is gated and sequential

- **Decision:** Follow the authoritative phase-gate sequence in blueprint §25. Review original assessments when available and complete the Claude-owned UI design-specification phase before dependent implementation. Do not skip a phase, parallelise conflicting shared-file work, or add scope without approval.
- **Reason:** Prevents rework, missed assessment constraints, and inconsistent design/code handoff.
- **Alternatives considered:** Start coding immediately; generate/implement all pages in one task; parallel agents independently build shared architecture.
- **Milestone:** Project operating rule (2026-10-22).
- **Impact:** Track blockers and verification in `WORKLOG.md`, assessment status in `ASSESSMENT_COMPLIANCE.md`, design decisions and screen-state coverage in `UI_DESIGN_SPEC.md` and `DESIGN.md`, and acceptance tests in `TEST_PLAN.md`. A task is not complete on appearance alone.

## D-014 — Assessment compliance is still a blocking verification gate

- **Decision:** Existing candidate concept mappings remain unverified until the actual original assignment files have been inspected by Claude/user and matched to exact questions, screenshots, constraints, and evidence.
- **Reason:** The current compliance table is a candidate planning map and must not be mistaken for proof of course compliance.
- **Alternatives considered:** Treat blueprint examples as the full rubric; infer likely questions from course naming.
- **Milestone:** Open dependency (2026-10-22).
- **Impact:** `ASSESSMENT_COMPLIANCE.md` stays pending until originals are audited. This documentation update does not claim that any assignment requirement is verified.


## D-015 — Claude is the UI/UX design owner; external design tools are optional

**Decision:** Claude must design the complete interface, create/maintain root `DESIGN.md`, implement it in the actual app, visually inspect it where possible, and refine against `docs/UI_DESIGN_SPEC.md`. Stitch, Figma, manually exported mockups, and external design approvals are not prerequisites.

**Reason:** The project should use the available coding-agent budget on a beautiful, functional codebase rather than waiting on a separate design workflow. The master prompt and UI spec must provide precise constraints while allowing Claude to make coherent professional visual decisions.

**Consequences:** The actual React application is the final design deliverable. The design system must be documented and match the implemented CSS/components. Normal visual choices do not require asking the user for approval; conflicts with course requirements or locked product behaviour must be recorded.

## D-016 — The UI is art-directed but function-first

**Decision:** Use a premium dark digital atelier aesthetic, restrained violet highlights, rare lime success accents, legible sans-serif/monospace typography, precise spacing, modest card geometry, subtle depth, consistent iconography, and purposeful interaction-led animation. The celestial visual language is concentrated in the Learning Orbit and genuine progress states; lesson and coding screens prioritise focus and readability.

**Consequences:** Avoid generic SaaS-dashboard repetition, toy-like game visuals, full-screen starfields, uncontrolled gradients/glows, fake charts, decorative-only interactions, and excessive motion. Final token values may be tuned for contrast and documented in `DESIGN.md`.

## D-017 — No design-tool dependency or mockup-only completion

**Decision:** All required design work must be implementable without external design tools. Claude must deliver working responsive screens and real stateful components, not only screenshots or static mockups.

**Consequences:** `docs/UI_DESIGN_SPEC.md` is the canonical design brief. `DESIGN.md` is the live system reference. Browser/visual inspection should be used when available; any missing visual tooling is reported honestly and does not justify claiming a screenshot review occurred.
