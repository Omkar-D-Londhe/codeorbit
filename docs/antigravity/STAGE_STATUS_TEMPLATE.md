# Stage NN — <title> — Status Report

Save as `docs/antigravity/status/STAGE_NN_STATUS.md`. Fill every field with **real** results. Write `NOT VERIFIED` plus a reason for anything you could not run or see.

## 1. Header
- Stage (and sub-stage letter if any): NN · Branch: `stage-NN-<slug>` · Commit(s): <hashes>
- Date/time: <local> · Agent/tool: Antigravity <version/model if known>
- Started from: clean tree? <yes/no — `git status` summary>

## 2. Baseline before changes
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | |
| `npm run lint` | |
| `npm run test` | Test Files x passed / Tests y passed |
| `npm run build` | main JS kB (gzip kB) |

## 3a. Evidence split (owner UI/UX contract `09` §6 — keep these six lists separate)
- **Implemented:**
- **Functionally tested** (tests/commands actually run):
- **Visually inspected** (screens × viewports × states; screenshot files looked at; comparison with design references; defects found → fixed → re-inspected). Write `VISUAL: NOT VERIFIED — <reason>` if not done:
- **Accessibility checked** (keyboard walkthrough, axe, contrast, reduced motion, zoom/font scale — what was actually run):
- **Not verified** (with reasons):
- **Remaining defects or decisions:**

## 3. Work completed
- Items completed (IDs):
- Files added / modified / removed (counts and notable paths):
- Reference ZIP material used (file → REUSE/ADAPT, adaptations made):
- Dependencies added (name, version, licence, gzip size, justification):
- Schema version change: <none / vN → vM + migration test names>

## 4. Results after changes
| Command | Result |
|---|---|
| `npm run typecheck` | |
| `npm run lint` | |
| `npm run test` | Test Files x / Tests y (previous y₀; delta) |
| `npm run build` | main JS kB (gzip); chunk list changes |
| `npm run test:e2e` | |
| `npm audit --omit=dev` | |

## 5. Acceptance criteria evidence
| Criterion (copy from the stage file §13) | Met? | Evidence (command output / test names / observation) |
|---|---|---|

## 6. Global gates (`08`)
| Gate | Applies? | Result / evidence |
|---|---|---|
| G1 Build & static quality | | |
| G2 Regression smoke (9 items) | | |
| G3 Visual inspection 1280/820/390/320 (+1440 for orbit stages) — real screenshots looked at | | per viewport/state: observed, defects fixed, re-inspected; or VISUAL: NOT VERIFIED |
| G11 Constellation gate (orbit-affecting stages) | | `10` §15.2–§15.3 tables filled |
| G4 Accessibility (keyboard, axe, contrast, reduced motion, zoom) | | |
| G5 Security & privacy | | |
| G6 Persistence & recovery | | |
| G7 Performance | | |
| G8 Documentation | | |
| G9 Truthfulness review | | numbers/labels derivations |

## 7. Decisions, deviations and assumptions
- Decisions made (also appended to `docs/DECISIONS.md`):
- Deviations from the stage file and why:
- Owner decisions needed (IDs from `07`):

## 8. Not verified / blockers / follow-ups
- NOT VERIFIED items and reasons:
- Blockers and their impact:
- Follow-ups for later stages (do not implement now):

## 9. Exit gate
- [ ] All acceptance boxes ticked with evidence (or owner-accepted NOT VERIFIED)
- [ ] Typecheck, lint, test, build green; test count not decreased
- [ ] No placeholders, fake metrics, dead controls or unverified claims
- [ ] Working tree committed on the stage branch
- **Next stage may start:** yes / no (reason)
