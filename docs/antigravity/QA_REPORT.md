# QA and Change Report — Constellation edition

Scope of this report: documentation pack only. **Nothing here has been implemented, run or visually tested in the CodeOrbit application.** The original project was not modified.

## 1. What changed

### Constellation decision (owner-approved 2026-10-25)
- **Decisions** (`01` Part A): L-01 and L-04 marked **superseded**; L-02 and L-03 **amended**; new L-23 (constellation is primary), L-24 (data truth), L-25 (map is never the only path), L-26 (visual acceptance needs evidence); P-11 (SVG + DOM renderer, no canvas/WebGL/3D), P-12 (default view rule), P-13 (concept image is reference only). Logged in `07` (C-19…C-22, decision log).
- **New files:** `10_CONSTELLATION_LEARNING_ORBIT_SPEC.md` (data model, deterministic layout, node states, panels, pointer/touch/keyboard, list view, responsive, motion, renderer decision, performance, accessibility, prototype, visual QA, tests, legacy handling), `09_UI_UX_QUALITY_CONTRACT.md` (your attached contract, verbatim, with a mapping to the pack), `design-reference/` (the concept image, labelled as reference only, plus a usage note).
- **Stages:** Stage 10 rewritten as **10a prototype → owner approval (O-15, hard gate) → 10b roll-out** with catalog items 2.1–2.7 re-expressed for the constellation; Stage 02 adds `--orbit-*` tokens, `StatusChip`, `ProgressRing`, icon registry; Stage 04 adds a deterministic `Starfield`; Stages 13, 14, 21, 29 and the stage template updated.
- **Traceability:** 4 new platform rows (PLT-15…PLT-18) → **168 items**; 2.x acceptance rewritten (also fixed: 2.2 now matches the catalog — a trail on *non-adjacent* selection; 2.5 ≤ 1.08×; 2.7 is 48×48 px).
- **Global gates:** `08` G3 now requires screenshot evidence; new G11 (constellation gate). Status template gained the six-way evidence split.
- **Arc geometry:** only appears as superseded/legacy text (baseline audit, supersession records, legacy handling). Legacy arc code stays the default until 10a is accepted; only arc-geometry tests are retired in 10b with a recorded note.

### QA fixes from the earlier review
1. Stage-plan table rebuilt (7 short columns, outcomes in their own table, linked file names; Stage 01 shows "first stage").
2. Gate policy made explicit and consistent (`07` §4a): **soft** = default exists, proceed and record; **hard** = capability waits for a recorded yes. O-03 default corrected to hard; Stage 25 split into **25a (ungated)** and **25b (O-03)**; Stage 26 depends on 25a only; O-14 added for the W3C validator; C-11 now cites O-06/O-07/O-14; O-10 wording matches `05` D4 and Stage 11; guide, plan (§10 gate table), stage files and final checklist agree.
3. Matrix heading is now "Items mapped to each stage".
4. Cross-checks scripted (below). FC-01…FC-32 acceptance criteria are now specific (from `06`), not one repeated sentence.
5. Architecture consistency: `ChallengeV2`, `ChallengeTestCase`, extended `TrackModule`, `AnalysisProvider.worker/maxConfidence`, script-preview mode in B4/B9/G2/G5, `settings.onboarding`.
6. FC platform-use claims now have backing text in stages (Settings controls, `range`/`time`, `sup`/`sub`, share-card alt, constellation pointer/keyboard).
7. Sub-stages documented (§7a in stage files, `03` §8) for Stages 03, 10, 11, 15, 17, 18, 20, 21, 23, 25; no feature dropped. 18's single migration is placed in 18a.
8. Guide: new files, hard/soft gates, sub-stage prompt, still "implement only the current stage".

## 2. Verified by script (`build/verify.py`, run on the final build)
- Every table in every pack document renders with a consistent column count (136 tables, 1176 rows) **and** raw unescaped-pipe counts match headers; the 29 plan stage rows each have 7 columns and no cell over 200 characters.
- 29 stage files exist; each has the 16 required sections and an exit gate; every dependency points to an earlier real stage; each stage's §2 prerequisites name the stages in the dependency map.
- 168 unique item ids, each mapped to an existing stage with a non-trivial acceptance text; all 32 FC acceptance texts are distinct; no vague-wording hits.
- Every L/P/C/A/O/D/G id referenced is defined; `NN §x` references resolve to real headings; local links and `.md` file references resolve; the guide names existing stage files.
- No leftover phrases from the superseded gate wording, the old item count or the old Stage 10 name; every O-01…O-16 has a gate type; gate kinds in stage files match `07`.
- Contrast ratios for the opaque Obsidian/Starlight/Aurora base pairs in `04` were computed with a throw-away script (recorded in `04` §1.3). They are starting values only.

## 3. NOT verified (honest list)
- **Any behaviour of the constellation** — nothing was built. The concept image's layout was read by eye only; no screenshot comparison was done.
- That acceptance criteria are *semantically* testable: the script checks presence, distinctness and vague wording, not whether each criterion is truly testable. A human read-through is still advisable.
- Contrast for the other four accents, glass/halo/glow layers and the future `--orbit-*` colours; browser, accessibility, security and performance behaviour of anything described.
- Whether the real HTML data has exactly 15 prerequisite connections is derived from reading `curriculum.ts` (the spec tells tests to derive it).
- The markdown was rendered with markdown-it, not GitHub or an IDE preview.

## 4. Remaining decisions and blockers
| ID | Decision | Gate | Status |
|---|---|---|---|
| O-15 | Approve the Stage 10a prototype evidence | hard (before 10b) | Open until 10a exists |
| O-16 | Locked topics | soft | **Resolved 2026-10-26:** advisory; learners may open topics and see prerequisite guidance |
| O-03 | Pyodide download for Python execution | hard (25b) | Open; default = not built |
| O-04 | Java/C++ execution strategy | hard (execution) | Open |
| O-05 | Angular delivery approach | hard (practice) | Open |
| O-06 / O-07 / O-14 | AI hints / multiplayer transport / W3C validator disclosure | hard, per feature | Open |
| O-01, O-02, O-08, O-09, O-10, O-12, O-13 | Defaults listed in `07` | soft | Defaults apply unless you change them |
| O-11 | Lab question sheets / marking criteria | non-blocking | Course mappings stay `pending-review` |

Also open: the concept image's licence/provenance is not recorded beyond "supplied by the owner"; and a separate `…_QA_Fixed.zip` was **not** produced because the QA fixes are included in the constellation ZIP.
