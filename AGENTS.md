# CodeOrbit Agent Instructions

## Product and source of truth

CodeOrbit is a browser-based, language-neutral learning studio. A learner picks a language or technology, moves through a **Learning Orbit** of topics, reads short lessons, checks understanding with varied quizzes, writes code in a real editor, gets deterministic feedback, and explores complexity analysis and optimisation. HTML is the first optional track module, with CSS, JavaScript, Bootstrap and Angular planned. A read-only snapshot of reference material is located at `docs/antigravity/reference/` (never imported by `src/`). Read `docs/antigravity/ANTIGRAVITY_EXECUTION_GUIDE.md`, `docs/antigravity/01_PRODUCT_AND_ARCHITECTURE.md`, `docs/DECISIONS.md`, and root `DESIGN.md`.

Precedence: (1) Locked decisions in `01_PRODUCT_AND_ARCHITECTURE.md` Part A, (2) resolved decisions in `07_CONFLICTS_AND_DECISIONS.md`, (3) the active stage specification, (4) `DESIGN.md` and repo documentation. Do not invent missing requirements or silently resolve conflicts.

## Claude owns UI/UX

Claude is responsible for visual design, responsive layout, interaction states, design tokens, screen composition, implementation, browser inspection, and refinement. External tools such as Stitch/Figma and exported mockups are optional; never block implementation waiting for them. Create and maintain root `DESIGN.md` and keep it aligned with the running app. Follow the full screen-by-screen requirements and visual QA checklist in `docs/UI_DESIGN_SPEC.md`.

## Serial-phase rule

Inspect repository and Git status before edits. Follow the phase order in blueprint §25 and complete the acceptance criteria for a phase before moving on, but do not turn ordinary design decisions into approval bottlenecks. If original assessment files are missing, flag the compliance blocker, continue unaffected work, and do not invent assessment content or claim verified compliance. Update the work log and relevant tracker, and checkpoint completed work where the repository workflow supports it. Do not skip actual prerequisites, change product scope silently, or let parallel agents edit shared architecture.

## Locked product requirements

- Learning Orbit arc opens upward like a hill/rainbow; never invert into a U-shaped valley.
- Horizontal topic strip and arc/map synchronise both ways from stable topic IDs and canonical curriculum order.
- Treat Learning Orbit as a restrained celestial knowledge atlas. Use stable node positions, truthful relationship connectors, readable status states, usable edge fades, stable selection, and mobile arc-where-possible/carousel-fallback.
- Desktop learning is split-screen; focus mode is expandable/reversible and preserves drafts.
- Code Coach is deterministic and challenge-specific in the MVP; do not claim general AI review.
- Learner HTML renders in an isolated sandboxed iframe without script privileges. Never execute learner code in the trusted parent DOM.
- No fake controls, fabricated metrics, false graph edges, invented progress/activity metadata, or dead routes that look live.

## Architecture and code quality

Preferred stack: React + TypeScript + Vite + React Router + custom CSS + versioned localStorage, unless an original assessment requires otherwise. Inspect before adding dependencies. Use stable IDs, typed reusable components, structured lesson/quiz/challenge data, explicit storage migrations/default recovery, and no secrets in frontend code or localStorage.

## Accessibility, motion, and visual quality

Use semantic HTML, readable type, WCAG AA contrast where applicable, visible keyboard focus, accessible state beyond colour alone, keyboard/touch support, and reduced-motion alternatives. Avoid page-level horizontal overflow. Use restrained interaction-driven motion and inspect the actual running app at desktop/tablet/mobile widths when tools permit. Fix obvious visual problems rather than merely reporting them.

## Verification and records

Inspect existing files before changing them and avoid unrelated rewrites. Run actual available type-check, lint, unit, build, and browser checks. Do not claim a command passed unless run. Update `docs/WORKLOG.md`, `docs/ASSESSMENT_COMPLIANCE.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, and root `DESIGN.md` when relevant. Never mark assessment compliance verified without comparing the original requirements and recording evidence.

## Workspace safeguards

Preserve user changes. Do not alter `.freebuff/project-id` or commit `.freebuff/`. Review diffs and Git status before committing. The canonical product specification is `docs/CODEORBIT_BLUEPRINT.md`; this file is the concise instruction summary.
