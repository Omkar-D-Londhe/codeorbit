# 09 — Mandatory UI/UX Quality Contract

*Supplied by the owner and incorporated verbatim below the mapping note. It applies to **every UI-related stage**.*

**How this contract maps onto the pack**

| Contract section | Where it is enforced |
|---|---|
| §1 Product identity | `01` Part A (L-11…L-14, L-22, L-23), `04` |
| §2 Design before implementing | Each stage file §7 (inspect → design → implement → run → correct) |
| §3 Component completeness | `04` §2 component states; `08` G3, G4 |
| §4 Responsive and accessible | `08` G3, G4; `10` §9, §13 |
| §5 Visual acceptance gate | `08` G3 (all UI stages) and **G11** (constellation / orbit-affecting stages); `10` §15 |
| §6 No silent compromises; report separation | `STAGE_STATUS_TEMPLATE.md` §3a (Implemented / Functionally tested / Visually inspected / Accessibility checked / Not verified / Remaining) |

**Contract wording that this pack makes concrete.** "Approved design references" = the tokens in `04` plus, for the Learning Orbit, `design-reference/codeorbit_constellation_concept.png` (concept reference only). "Required viewport sizes" = 1440×900 (orbit stages only), 1280×800, 820×1180, 390×844, 320×640. Nothing in this pack has been visually verified; the first visual evidence will come from Antigravity's stage reports.

---

## Contract text (owner-supplied)

## Objective

Build CodeOrbit as a cohesive, premium, professional interactive learning product. Do not treat UI/UX as decoration added after functionality. Visual design, usability, accessibility, responsive behavior and interaction quality are part of the implementation requirements.

## 1. Preserve the agreed product identity

- Use the agreed premium dark visual direction, with obsidian and charcoal surfaces, restrained celestial/violet accents and clear typographic hierarchy.
- Keep the interface clean, focused and professional. Avoid excessive cards, gradients, glowing borders, decorative icons, oversized headings and unnecessary animation.
- Maintain one coherent design system across every route, track, component and learning activity.
- Reuse established design tokens and components instead of inventing a different visual style in each stage.
- Inspect and preserve valuable existing UI and interactions. Do not replace functioning screens with generic templates simply because they are easier to implement.

## 2. Design before implementing each screen

For each screen or major component:

1. Inspect the existing implementation and relevant architecture contracts.
2. Identify the user's primary task and the visual hierarchy needed to support it.
3. Define the layout, spacing, component relationships and responsive behavior.
4. Specify meaningful interaction states and transitions.
5. Implement the screen using the shared design system.
6. Run the application and inspect the actual rendered result.
7. Correct visual, usability and responsive defects before marking the work complete.

Do not invent unspecified product behavior when it could conflict with an existing decision. Record important ambiguities and seek clarification when necessary.

## 3. Enforce component completeness

Where applicable, implement and verify default, hover, active, selected, keyboard-focus, disabled, loading, empty, error and success states.

Controls must provide understandable feedback. Links must navigate correctly. Buttons must perform their advertised actions. Forms must validate and communicate errors. Progress indicators must represent real application state.

Animations must be purposeful, consistent, performant and respectful of reduced-motion preferences. Avoid motion that interferes with learning or code editing.

## 4. Enforce responsive and accessible behavior

Test representative desktop, tablet and mobile viewports. Verify that navigation, editor layouts, sidebars, topic navigation, charts, dialogs and interactive activities remain usable at each supported size.

Check keyboard navigation, visible focus, semantic structure, accessible names, contrast, zoom and reduced-motion behavior. Do not claim accessibility compliance without evidence.

## 5. Mandatory visual acceptance gate

For each UI-related stage:

- Run the real application and visit every materially affected screen.
- Inspect the rendered result at the required viewport sizes.
- Compare it with the approved design references and shared design tokens.
- Check alignment, spacing, typography, hierarchy, density, consistency, clipping, overflow and interaction behavior.
- Exercise important hover, focus, selected, loading, empty, error and success states.
- Fix visible defects and re-inspect the corrected result.
- Record the screens and viewports checked, findings, fixes, tests performed and unresolved issues.

A stage is not visually accepted merely because it builds, passes unit tests or contains the requested components.

If browser inspection or screenshot comparison is unavailable, explicitly report the limitation and leave visual verification unverified. Never claim a visual check was performed when it was not.

## 6. No silent quality compromises

Do not remove features, simplify agreed interactions, substitute placeholder screens, use fake data as real progress, or weaken visual requirements to finish a stage faster.

If a stage is too large, split it into documented sub-stages while preserving its scope and dependencies.

Every stage report must separate:
- Implemented
- Functionally tested
- Visually inspected
- Accessibility checked
- Not verified
- Remaining defects or decisions

## Definition of UI/UX completion

A screen is complete only when its required behavior works, its design is consistent with the CodeOrbit system, its supported viewports are usable, its relevant interaction states are handled, and the required verification evidence is recorded.
