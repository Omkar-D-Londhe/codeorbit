# Decisions made in this build (D-1xx)

Original locked decisions remain in `docs/reference/DECISIONS.md`. Additions/clarifications:

| ID | Decision | Why |
|---|---|---|
| D-101 | **Greenfield build.** No CodeOrbit repository was supplied (the second upload held lab-submission PDFs only), so the project was created from scratch in `codeorbit/`. | Cannot preserve code that was not provided. |
| D-102 | Stack: React + TS + Vite + React Router + custom CSS + versioned localStorage. Only extra runtime deps: three `@fontsource-variable/*` font packages (self-hosted, no CDN). | Preferred stack in the brief; fonts give typographic identity without network calls. |
| D-103 | 12 topics / 8 groups, one lesson + 3-question quiz + 1 challenge each. Prerequisite edges are declared explicitly; a test asserts curriculum order ≠ a dependency chain and that every edge points to an earlier topic. | Real relationships only. |
| D-104 | Orbit display mode is derived from geometry (min node spacing 56px; label-box collisions), producing `arch` ≥ ~900px, `arch-compact` ~640–899px, `carousel` below. Phones use the carousel. | Brief: try compact arch first, fall back if targets are tiny; here 360–430px give < 56px spacing. |
| D-105 | Nodes at equal **arc length** on a half-ellipse; edges as quadratic curves bowed toward the arch interior. | Even spacing; connectors never cross the rim. |
| D-106 | Challenge validation = declarative `Rule` objects evaluated on a `DOMParser` document (detached, never attached). | Deterministic, testable, no `eval`. |
| D-107 | Preview = `<iframe sandbox="" srcdoc>` plus a CSP meta (`default-src 'none'; img-src data:; style-src 'unsafe-inline'`). Remote images are therefore blocked by design; challenges use `data:` images. | Defence in depth; no scripts, no same-origin, no forms/popups. |
| D-108 | Progress (D-018 in the original numbering): lesson = learner marks complete; quiz passed = best ≥ 2/3; practice = every requirement passes in a Check; *completed* = all three; *mastered* = completed + perfect quiz best + practice finished before any solution reveal. Opening a page is **not** progress. | Evidence-based, no false progress. |
| D-109 | Quick quiz allows “Skip question” (counts as unanswered) and “Check answer” is disabled until an option is chosen. Answers are final once checked. In-flight sessions persist. | Truthful scoring + resume. |
| D-110 | “Saved” text appears only after a successful `setItem` (`saveStatus.at ≥ note.updatedAt`); storage failure shows a warning. | No fake confirmations. |
| D-111 | Editor is a plain `<textarea>` with a line gutter; no Tab capture; syntax highlighting only in read-only code blocks. | Avoid keyboard traps and fragile overlay alignment. |
| D-112 | **Not implemented** (blueprint “when in scope”): Achievements, Daily Challenge, Mastery graph route, streaks. No routes or controls exist for them. | Avoid fake working routes; budget went to the core journey. |
| D-113 | Quiz option order is rotated by a stable hash of the question ID so the correct answer is not always in the same slot; deterministic across loads. | Content quality without randomness that would break resume. |
