# Stage 16 — Accessibility and inclusivity features, reminders

> Give Antigravity **only this file** for this stage (plus the reading list in `ANTIGRAVITY_EXECUTION_GUIDE.md` and any document this file tells you to read). Do not start another stage. Rules in `01_PRODUCT_AND_ARCHITECTURE.md` Part A (locked decisions) and `08_GLOBAL_ACCEPTANCE_AND_QA.md` apply.

## 1. Stage identity, objective and scope

**Stage:** 16 · **Slug:** `accessibility-inclusivity` · **Branch:** `stage-16-accessibility-inclusivity`

**Objective.** Give learners control over reading and interaction: font scaling, dyslexia-friendly font, high-contrast mode, screen-reader announcements for progress, and local reminders — and prove WCAG-oriented behaviour with automated and manual checks.

**In scope**
- 13.1 font size scaler, 13.2 dyslexia-friendly font toggle (Atkinson Hyperlegible), 13.3 high-contrast mode (wiring from Stage 02 hooks), 13.4 screen-reader progress announcements, 14.3 notification/reminder system (local, honest limits per C-10).

**Out of scope**
- Shortcut modal (Stage 13, done).

## 2. Prerequisites and dependencies

- Stage 12 exit gate green.
- The accessibility sweep includes the constellation, list view and keyboard model: read `10_CONSTELLATION_LEARNING_ORBIT_SPEC.md` §7, §8 and §13.

If any prerequisite is not truly complete (check its status report in `docs/antigravity/status/`), stop and report; never fake it.

## 3. Enhancement and concept IDs covered

**Catalog items:** `13.1` Font Size Scaler, `13.2` Dyslexia-Friendly Font Toggle, `13.3` High-Contrast Mode, `13.4` Screen-Reader Progress Announcements, `14.3` Notification / Reminder System (Local)
**Platform / reference / concept items:** `FC-32` Keyboard interaction and accessibility
Acceptance criteria per item are in `02_ENHANCEMENT_TRACEABILITY_MATRIX.md`; the stage-level criteria below are additional.

**Frontend concepts touched:** FC-32, FC-16 (responsive text), FC-11 (typography)

## 4. Existing files to inspect and preserve

Inspect before editing. Preserve behaviour and tests of:
- Existing landmarks, skip link, focus management, status-with-icon rule, 44 px targets.

Initial inspection commands (run and record output summaries in the report):
```bash
git status && git log --oneline -5
npm run typecheck && npm run lint && npm run test && npm run build
git diff --stat main...HEAD   # what earlier stages changed
```

## 5. Files to modify and intended changes

| File | Intended change |
|---|---|
| src/pages/Settings.tsx | Accessibility section: font scale, dyslexia font, contrast, motion, announcements, reminders. |
| src/styles/*.css | All sizes in `rem`; `html { font-size: calc(100% * var(--font-scale)) }`; dyslexia font variable swap. |
| src/state/reducer.ts, types.ts | Announcement hooks consume derived transitions (no extra stored state); reminder settings live in `settings.reminders`. |

## 6. New files and responsibilities

| File | Responsibility |
|---|---|
| src/core/a11y/Announcer.tsx, useAnnounce.ts | Single polite live region + assertive channel; dedupes and queues messages. |
| src/core/a11y/progressAnnouncements.ts | Maps derived changes (lesson complete, quiz result, challenge pass, level up, badge) to concise messages. |
| src/core/reminders/reminders.ts | `isReminderDue(settings, now, lastShown)`; shows an in-app banner/toast on open; optional `Notification` only after explicit permission and only while the page/service worker is alive. |
| src/test/a11y.matrix.test.tsx | Runs axe over every route in each theme × contrast mode × font scale 1.5. |

## 7. Implementation steps (execute in order)

1. Inspect px-based sizes (`grep -rn "[0-9]px" src/styles`) and convert type/size values to `rem` where they scale text; keep borders/shadows in px.
2. Font scale: five steps; verify no clipped text at 1.5 and at 320 px width; orbit labels remain readable (labels may wrap, nodes keep size).
3. Dyslexia font: `@fontsource/atkinson-hyperlegible`, swaps `--font-sans` only; code stays monospaced.
4. High-contrast: wire `data-contrast` (Stage 02) — flat surfaces, 2 px borders, thicker focus ring, no glass/glow/atmosphere; verify ≥ 12:1 text.
5. Announcer: mount once in `Shell`; replace ad-hoc `role=status` for progress events with the announcer (keep local status for form errors).
6. Reminders: settings (time, days); on app open, if due and not shown today → banner 'Time for your daily practice'; Notification permission button explains limitation: 'Reminders appear while CodeOrbit is open.'
7. Run the a11y matrix test; fix violations.
8. Manual checks: keyboard-only walkthrough of every route; screen-reader semantics review; zoom 200%; text-spacing override; record results.

After each numbered step that changes behaviour, run the affected tests; after the last step run the full gates.

## 8. Component behaviour, state, data contracts and integration

```ts
Announcer: announce(message: string, politeness?: 'polite' | 'assertive'): void   // dedupes identical messages within 1.5 s
fontScale: 0.875 | 1 | 1.125 | 1.25 | 1.5
Reminders: { enabled: boolean; time?: 'HH:MM'; days: number[] /* 0=Sun */ }
```

## 9. UI/UX expectations

Settings → Accessibility uses an `input type=range` (five snap steps with visible tick labels and current value, FC-07 platform use) for font scale with live preview text; reminders use `input type=time` plus day checkboxes (FC-07); toggles with explanatory help text; high-contrast preview swatch. Announcements are visually hidden except for an optional 'Show announcements' debug toggle in dev.

Apply `04_DESIGN_SYSTEM_AND_UI_SPEC.md` for tokens, components, themes, motion and accessibility. Inspect the running UI at 1280×800, 820×1180, 390×844 and 320×640 and fix visible defects (`08` G3).

## 10. Error handling, loading, empty states and recovery

Notification permission denied/unsupported → explain and keep in-app reminders. Invalid time → inline error. Font files fail to load → system sans fallback.

## 11. Security and performance

Fonts self-hosted, `font-display: swap`; dyslexia font loaded only when enabled. Announcer never floods (queue max 3).

## 12. Required tests and regression checks

- `a11y.matrix.test.tsx`; contrast matrix incl. high contrast; Announcer dedupe/queue; `isReminderDue` cases (timezone/DST: uses local time); font scale applied to `html`; reduced-motion and high-contrast interaction tests.
- Existing tests unchanged.

Always also run the regression smoke (`08` G2) and the checks in `08` G1, G4 (UI changes), G5 (code/storage/URL/dependency changes), G6 (state changes), G7 (performance), G9 (truthfulness).

## 13. Acceptance criteria (objective)

- [ ] Font scale is an `input type=range` and the reminder time an `input type=time`, both labelled and keyboard operable (test by role/label).
- [ ] axe: zero serious/critical on all routes across the matrix.
- [ ] At 150% font scale and 320 px width: no clipped text, no horizontal page scroll (browser check).
- [ ] High-contrast mode removes glass/glow/atmosphere and meets ≥ 12:1 for text.
- [ ] Progress events are announced once (tests count live-region updates).
- [ ] Reminder copy states its limits; no push or background claims.

Each box needs evidence in the completion report (command output summary, test names, or viewport observations).

## 14. Reference ZIP usage (see `05_REFERENCE_ZIP_COMPARISON.md`)

None.

Reference code lives in `docs/antigravity/reference/` as a read-only snapshot. Copy only what this stage names, after checking compatibility; never import from that folder.

## 15. Must NOT be changed in this stage

- Status icon+text vocabulary, keyboard model.
- Any locked decision in `01` Part A; any unrelated file; the original project's identity (name, palette, Learning Orbit concept, tone).
- Do not weaken or delete existing tests; do not rewrite working components merely to match a preferred architecture.

## 16. Completion reporting and exit gate

1. Fill `STAGE_STATUS_TEMPLATE.md` and save it as `docs/antigravity/status/STAGE_16_STATUS.md` with **real** command results.
2. Update `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `README.md`/`DESIGN.md` where this stage changed them.
3. Commit on the stage branch: `Stage 16: Accessibility and inclusivity features, reminders`. Do not push or tag unless the owner asked.
4. Report unresolved items, owner decisions needed, and anything **NOT VERIFIED**.

**Exit gate — Stage 17 may start only when all are true:**
- Every acceptance box in §13 is ticked with evidence (or explicitly marked NOT VERIFIED and accepted by the owner).
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pass; the regression smoke is green; test count has not decreased.
- Bundle size and any new dependency are recorded.
- No placeholder, fake metric, dead control, or unverified claim remains.
- The status report exists and the working tree is committed.
