# CodeOrbit — Test Plan

**Status:** Defined in advance; nothing is executable yet (no
application code or tooling exists). Acceptance criteria below are
adopted from blueprint §24 and are the bar a feature must clear before
it is considered done.

## Verification levels

| Level | What it covers | Command (planned) | Status |
|-------|----------------|-------------------|--------|
| Type check | TypeScript correctness | `npm run typecheck` | Not runnable — no app |
| Lint | Code style and common errors | `npm run lint` | Not runnable — no app |
| Unit tests | Validators, storage schema, arc layout math, quiz logic | `npm run test` | Not runnable — no app |
| Production build | Bundling succeeds | `npm run build` | Not runnable — no app |
| Browser acceptance | Behaviour per section below | Manual / scripted browser | Not runnable — no app |

Planned commands assume the Vite foundation from Phase 0+; record the
actual commands here once `package.json` scripts exist.

## Global acceptance (blueprint §24.1)

- [ ] Application starts using the documented commands.
- [ ] Production build succeeds.
- [ ] No blocking console errors.
- [ ] Navigation links work.
- [ ] Responsive layout works at desktop, tablet, and mobile widths.
- [ ] Keyboard focus is visible.
- [ ] Reduced-motion setting is respected.
- [ ] No major horizontal page overflow.
- [ ] Every visible control has meaningful behaviour (no fake controls).

## Learning Orbit acceptance (§24.2)

### Locked geometry and map semantics

- [ ] Desktop arc opens upward: ends lower, centre higher; no downward arc is used.
- [ ] The view reads as a professional celestial knowledge atlas, not a noisy game screen.
- [ ] Topic positions are stable for the same curriculum/layout; selecting a topic does not reshuffle the map.
- [ ] The canonical topic order is the same in strip, arc, and any mobile fallback.
- [ ] Any relationship connectors come from explicit curriculum data; no fabricated edges.
- [ ] Connectors and edge fades do not cover labels, hit areas, or keyboard focus.

### States and details

- [ ] Not-started, in-progress, completed, mastered, selected, and focus/hover states are distinct.
- [ ] State is not communicated by colour alone.
- [ ] Progress rings/markers reflect saved data; no unsupported percentages or mastery signals.
- [ ] Selection changes local emphasis and detail panel, not the entire map geometry.
- [ ] Duration, difficulty, prerequisites, and recommendations are shown only when grounded in data.
- [ ] Learn, Quick Quiz, and Practice actions lead to real available activities or are omitted/clearly disabled with a valid reason.

### Synchronisation, fades, and range navigation

- [ ] Strip scrolling/swiping updates the visible map range.
- [ ] Map scrolling/dragging/panning updates the strip's visible range.
- [ ] Selecting in either representation updates the same stable topic ID and detail panel.
- [ ] Programmatic sync has loop guards and produces no jitter, repeated opposing scrolls, or lost selection.
- [ ] Distant selection uses controlled panning/range changes without a jarring jump or global node rearrangement.
- [ ] Edge fades do not intercept pointer/touch/keyboard interaction or make titles illegible.
- [ ] At the true beginning/end, fades do not falsely imply more topics outside the list.
- [ ] First, last, previous, and next topic navigation work predictably.

### Responsive and accessibility

- [ ] Desktop, tablet, and mobile were reviewed independently.
- [ ] Mobile uses compact arc when legible; otherwise carousel fallback preserves IDs, ordering, state, and learner progress.
- [ ] Resizing or changing presentation mode preserves selection and drafts/progress.
- [ ] Keyboard-only navigation reaches topics in logical order and focus is always visible.
- [ ] Touch targets are practical; controls do not depend on hover.
- [ ] Screen-reader-accessible labels expose topic title/status/selection as appropriate; decorative paths are not announced as meaningless clutter.
- [ ] Reduced motion removes/reduces panning, glides, trails, and other non-essential movement without losing state clarity.
- [ ] The orbit is still fully usable when motion is disabled; no continuous ambient motion is required.
- [ ] There is no page-level horizontal overflow on mobile.

### Visual review evidence

Record screenshots at representative desktop/tablet/mobile widths, including at least: unselected state, selected state, in-progress state, completed/mastered state, true-start and true-end fade, a distant-topic range change, keyboard focus, reduced-motion, and mobile fallback (if used). Record viewport/browser, expected vs actual, and the corresponding commit in `docs/WORKLOG.md`.

## Lesson and quiz acceptance (§24.3)

- [ ] Every implemented lesson has valid content and stable IDs.
- [ ] Quiz selection and answer validation work.
- [ ] Correct and incorrect feedback is clear.
- [ ] Quiz state is saved and restored as specified.
- [ ] Notes and bookmarks persist and can be edited/deleted.

## Practice workspace acceptance (§24.4)

- [ ] Run renders HTML in an isolated (sandboxed, script-less) iframe.
- [ ] Reset restores starter code, with confirmation when unsaved work
      could be lost.
- [ ] Code draft persists across navigation and reload.
- [ ] Requirement checker reports correct pass/fail for known test
      cases.
- [ ] Hints reveal progressively; solution reveal is explicit.
- [ ] The app never claims general AI review when using deterministic
      rules.
- [ ] Learner HTML gains no access to parent-app state or localStorage.

## Persistence acceptance (§24.5)

- [ ] Continue Learning opens the correct last activity.
- [ ] Saved state survives reload.
- [ ] Missing or corrupt storage falls back safely to defaults.
- [ ] Reset progress works with confirmation.
- [ ] No API key or secret is stored in localStorage.

## Assessment acceptance (§24.6)

- [ ] Every mandatory assessment concept maps to an implementation
      (`ASSESSMENT_COMPLIANCE.md`, currently all pending review).
- [ ] Each mapping has a test or recorded evidence.
- [ ] The compliance matrix is checked against the original assignment
      wording.
- [ ] Required technologies/libraries are included where explicitly
      mandated.

## Test-writing priorities (once code exists)

1. **Orbit layout and synchronisation** — pure tests for upward-arc
   position mapping, stable order, visible-range calculation, resize
   behaviour, first/last handling, and scroll-sync loop guards. Verify
   that selecting a topic never reorders the canonical list.
2. **Relationship data** — ensure displayed connectors map to valid
   prerequisite/relationship IDs and do not appear for absent relations.
3. **Validators** — test the deterministic requirement checker against
   known-good and known-bad HTML fixtures, including whitespace and
   attribute-order variations.
4. **Storage schema** — version migration, malformed JSON, quota errors,
   and reset path.
5. **Quiz engine** — answer validation, scoring, state save/restore.
6. **Component tests** — controls, focus states, status semantics, and
   reduced-motion variants.
7. **Manual browser passes** — desktop/tablet/mobile Orbit screenshots,
   keyboard-only journey, reduced-motion, and full demo flow (blueprint §27).

## Evidence recording

For each verified acceptance item, record: date, build/commit,
browser, steps, expected vs. actual, and evidence (screenshot or
notes) in `docs/WORKLOG.md`.


## Visual design and responsive QA (Claude-owned)

Run these checks against the implemented application after each major screen group and once again before handoff. Record viewport dimensions, routes inspected, defects found, fixes made, and any checks not possible in the available environment.

- [ ] Root `DESIGN.md` exists and matches the actual palette, type, spacing, component states, focus rules, motion, and breakpoints.
- [ ] Inspect dashboard, catalog, Learning Orbit, lesson, practice, and implemented progress/review routes at desktop (about 1440px and 1280px), tablet (about 768–1024px), and narrow mobile (about 360–430px).
- [ ] At desktop widths, Learning Orbit is a broad upper arch, never a downward/U-shaped valley; topic labels and nodes do not overlap.
- [ ] Arc and topic strip synchronise both ways by stable IDs, remain in canonical order, and don't jitter or enter a scroll/render loop.
- [ ] First/last topics and fade-edge items are reachable and overlays do not intercept clicks/touches.
- [ ] Touch targets are comfortable; hover-only affordances have a touch/keyboard alternative.
- [ ] Layout has no accidental page-level horizontal overflow, clipped text, fixed-height content loss, or unreadably compressed editor/preview panels.
- [ ] Inspect initial/empty, populated, completed, error, unavailable, loading, and feedback states where applicable.
- [ ] Test focus-visible indicators, text contrast, 200% browser zoom or equivalent narrow layout, and prefers-reduced-motion behaviour.
- [ ] Verify mobile lesson/practice navigation preserves selected topic, drafts, and activity state.
- [ ] Remove placeholder copy, inert icon buttons, fake charts/metrics, and unfinished routes that misleadingly appear available.
- [ ] Fix observed defects and re-inspect affected routes; don't just document obvious issues as known limitations.

Visual QA must be based on the running app when the environment supports it. Do not claim screenshots, manual browser inspection, or visual-regression checks that were not actually performed.
