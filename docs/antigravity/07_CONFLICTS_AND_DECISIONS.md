# 07 — Conflicts, Assumptions, Constraints and Owner Decisions

Antigravity: when a stage depends on an **Open** decision, implement every ungated part and the truthful unavailable state, record the situation in the stage report, and stop at that boundary. When the owner answers, they edit the **Resolution** column here (this file is the single record). Defaults listed as "Proceed with" are what Antigravity uses *unless the owner changes them before the stage starts*; they never silently override a locked decision in `01` Part A.

## 1. Conflicts found and how the plan resolves them

| ID | Conflict | Resolution in this plan | Status |
|---|---|---|---|
| C-01 | `AGENTS.md` and the original blueprint say "HTML is the only complete track" and "frontend learning studio"; the new direction is language-neutral | Stage 01 rewrites those lines in `AGENTS.md`, `README.md`, `DESIGN.md`; HTML becomes the first optional track module | Resolved |
| C-02 | Reference ZIP rejects points (D-116) vs catalog 8.1 XP & levels | XP is kept, as a **pure function of saved state**, awarded once per first milestone, hideable (P-04, D7 in `05`) | Resolved (award table needs owner approval, O-09) |
| C-03 | Reference adds persisted fields to schema v1 without a bump vs L-10 | Schema v2 + migration that preserves reference-style v1 data (`05` D3) | Resolved |
| C-04 | Catalog 11.1 force-directed graph vs reference's deterministic layered map | Layered view is default/accessible; force view is an opt-in second view (deterministic seed, uniform nodes, real edges only) | Resolved |
| C-05 | The preview iframe has an **empty** `sandbox` (no scripts) — correct for HTML/CSS/Bootstrap — but JavaScript/DOM lessons need scripts; the CSP also blocks media (`default-src 'none'`) needed for audio/video lessons | Add a second, stricter **script preview mode**: `sandbox="allow-scripts"` **without** `allow-same-origin`, opaque origin, CSP `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:`, no network, `postMessage` with a validated schema, kill/reload on timeout. HTML track keeps `sandbox=""` and gains `media-src data:` only for the media topic. `allow-scripts`+`allow-same-origin` is never combined (G5 test) | Resolved by design; owner to confirm (O-02) |
| C-06 | Catalog 1.8 "Starlight (high-contrast light)" vs catalog 13.3 "High-contrast mode" | Starlight is a light theme meeting AA; High-contrast is a separate mode layered on any theme (P-02) | Resolved |
| C-07 | Catalog 8.5 "Leaderboard (Local)" vs L-08 (no fake peers) | Personal bests and past periods on this device only; no peer rows | Resolved |
| C-08 | Catalog 6.1 "Monaco / CodeMirror" and the existing "Tab is not captured" accessibility decision | CodeMirror 6; Tab leaves the editor by default, indentation via a documented toggle/shortcut (`Esc` then `Tab`, or Settings → "Tab inserts indentation") | Resolved (O-01 to reverse) |
| C-09 | Catalog 1.7 mentions GSAP/ViewTransition | Use the View Transitions API with CSS fallback; GSAP only if a stage proves it necessary (L-14) | Resolved |
| C-10 | Catalog 14.3 "Notification / Reminder System (Local)" — browsers cannot deliver timed notifications when the app is closed without push infrastructure | In-app reminders (banner/toast on open if a reminder is due) + optional Notification API only while the app or its service worker is running; copy states the limitation. No push | Resolved |
| C-11 | Catalog 17.2 AI hints, 17.5 W3C validator, 17.8 LAN multiplayer need network/backend/signalling | Stage 28, decision-gated; absent or labelled "Not connected" until decided | Open (O-06, O-07, O-14) |
| C-12 | Genuine complexity analysis needs a real language-specific analyzer; HTML/CSS have none that is meaningful | Framework first (Stage 20, honest "no provider" state); first real provider for JavaScript (Stage 23); Python (Stage 25); Java/C++ gated | Resolved / gated parts open (O-04, O-12) |
| C-13 | The two lab question sheets and marking criteria are not available | All course-specific mappings are `pending-review`; non-blocking (`06`) | Open (O-11), non-blocking |
| C-14 | Angular requires a build toolchain (TypeScript + AOT) that cannot run in the restricted preview; no course evidence found | Stage 27 decision-gated; only the planned/"Decision pending" state ships until decided | Open (O-05) |
| C-15 | Dyslexia-friendly font: OpenDyslexic vs Atkinson Hyperlegible (both OFL) | Atkinson Hyperlegible (wider legibility evidence, better metrics) via `@fontsource`; self-hosted | Resolved |
| C-16 | Large single localStorage blob vs growing features (activity log, notes, custom challenges) | Debounced writes, quota guard, caps, export/prune; IndexedDB migration is **not** planned; revisit only if the quota guard shows a real problem | Resolved |
| C-17 | Reference "verification" claims (browser e2e scripts) are not in the ZIP | Not relied on; Stage 01 commits a real browser smoke script | Resolved |
| C-18 | Existing `app.test.tsx` is one 513-line integration file | New stages add focused test files; split the old file only if a stage touches many of its tests | Resolved |
| C-19 | The original/locked Learning Orbit is an upward semicircular arc (L-01…L-04) vs the owner-approved celestial constellation (2026-10-25) | L-01 and L-04 superseded, L-02 and L-03 amended by L-23…L-26; the useful behaviour (one shared selection, declared-prerequisite-only connections, keyboard model, roving tabindex) is preserved and moved to the map, stepper and list; arc code stays as the legacy default until the prototype is accepted (O-15); only arc-geometry tests are retired, with a recorded note (`10` §17) | Resolved |
| C-20 | The concept image uses placeholder topics, a duplicated number "08", counts that do not add up, a top navigation, a bell and an avatar | Image is a mood/composition reference; real topics, numbering, counts and the agreed shell are used; fake controls are not built (`10` §1.3, P-13, L-08) | Resolved |
| C-21 | Catalog 2.x written for an arc ("arc trail", "arc nodes", "48 px arc in breadcrumb") | Re-expressed for the constellation without dropping any item: trail between stars (non-adjacent selections), zones as halos, magnify ≤ 1.08×, 48×48 mini constellation (`02`, `04` §6) | Resolved |
| C-22 | Owner UI/UX Quality Contract requires visual evidence for every UI stage vs earlier G3 wording that allowed text-only fallback | `09` incorporated; G3 now requires evidence and treats missing browser/image inspection as NOT VERIFIED that keeps the exit gate closed unless the owner accepts the gap | Resolved |
| C-23 | Stage 25 mixed ungated Python content with the gated Pyodide download (O-03), while the overview only called 26–28 gated | Gate policy in §4a: Stage 25 split into Part A (ungated) and Part B (hard gate O-03); Stage 26 depends only on Stage 25 Part A | Resolved |

## 2. Assumptions (stated so they can be corrected)

| ID | Assumption |
|---|---|
| A-01 | Target browsers: current evergreen Chromium, Firefox, Safari (WebKit), incl. iOS Safari 16.4+; no IE/legacy. |
| A-02 | Node ≥ 20 and npm are available; the repo uses `package-lock.json`. |
| A-03 | The app is hosted as a static site (HTTPS) when PWA/offline is evaluated; local dev uses Vite. |
| A-04 | Single device, single learner per browser profile; no accounts; multi-tab is supported only as last-write-wins with a `storage`-event refresh. |
| A-05 | Content (lessons, quizzes, challenges) is authored in the repo, not fetched. |
| A-06 | `localStorage` quota is ~5 MB; the soft budget is 4 MiB serialised. |
| A-07 | The device clock is trusted for streak/daily logic; clock changes are handled gracefully (a streak never goes negative; a future-dated last activity is treated as today, no crash). |
| A-08 | Antigravity has a browser tool for visual checks; if not, it states **NOT VERIFIED** per `08` G3. |

## 3. Technical constraints

- Strict **no code execution on the trusted DOM**; non-web languages only in a Worker/WASM sandbox (L-06, L-07).
- Worker/WASM engines (Pyodide ≈ 10 MB) must be lazy-loaded, self-hosted, cached by the service worker, and never block first paint.
- No network from learner code at any time.
- Static analysis can only reason about code it can parse; unsupported constructs must produce **lower confidence and explicit limitations**, never a guess presented as fact (L-09).
- A single reducer persists to one key; do not add per-keystroke writes (debounce, flush on `pagehide`).
- Bundle budget: initial route JS (gzip) must not exceed baseline **121.33 kB + 40 kB** through Stage 17; heavy libraries (editor, graph, analysis engines) load lazily.

## 4. Open decisions for the owner

### 4a. Gate policy (applies everywhere; stage files, `03`, the guide and `FINAL_INTEGRATION…` use these words)

- **Soft gate** — a default exists. Antigravity proceeds with the default, builds the whole stage, and records in the report that it used the default. The owner may change the default before the stage starts.
- **Hard gate** — the gated capability is **not built** until the owner writes a "yes" in the Resolution column. Antigravity implements everything ungated, ships the truthful unavailable/preview state, records the situation, and stops at that boundary. A later stage may start when the ungated parts of the gated stage are green.
- **Non-blocking** — verification activity that never stops work (course compliance, `pending-review`).

| ID | Decision needed | Gate | Proceed with (default) | Needed by | Resolution |
|---|---|---|---|---|---|
| O-01 | Confirm CodeMirror 6 (vs Monaco) | soft | CodeMirror 6 | Stage 05 | |
| O-02 | Confirm the script-enabled preview design (C-05) | soft | As specified | Stage 23 | |
| O-03 | Accept a self-hosted Pyodide download (~10 MB, lazy, cached) for Python **execution** | **HARD** | **Not built until a yes is recorded.** Stage 25 Part A (Python content, quizzes, structure-rule challenges, CodeMirror Python editor, availability `preview`, no Run, no complexity numbers) proceeds; Part B (Pyodide Worker engine, execution tests, `ast` provider, offline caching) waits | Stage 25 Part B | |
| O-04 | Java and C++ execution: browser WASM toolchain, a hosted execution service, or "editor + static analysis only (no run)" | **HARD** (execution only) | Static analysis + editor only; **no Run button** (Stage 26 ungated part ships) | Stage 26 | |
| O-05 | Angular approach: in-browser build, curated read-only "component playground" with precompiled examples, or keep "planned" | **HARD** (practice delivery only) | Keep "Decision pending"; the decision memo and non-executable lessons ship | Stage 27 | |
| O-06 | AI hint expansion: provider, key management (needs a backend), data disclosure, cost | **HARD** | Not built | Stage 28 | |
| O-07 | Multiplayer race transport (WebRTC needs signalling; "local broadcast" only works across tabs) | **HARD** | Not built | Stage 28 | |
| O-08 | Hosting target for the PWA (HTTPS static host) | soft | Any static HTTPS host | Stage 17 | |
| O-09 | Approve the XP award table in `stages/STAGE_11` (§Data contracts) | soft | As written | Stage 11 | |
| O-10 | Daily challenge scope: the pool of all available tracks' challenges (matches `05` D4 and Stage 11), optionally filtered to the learner's current track | soft | Global pool over available tracks; "current track only" filter off | Stage 11 | |
| O-11 | Supply Frontend Design Lab / Testing Lab question sheets and marking criteria | non-blocking | Not supplied; mappings stay `pending-review` | — | |
| O-12 | Analysis dependencies for JavaScript: allow a parser dependency (`acorn` ≈ 120 kB) or the TypeScript compiler API (much larger) | soft | `acorn` + `acorn-walk`, lazy-loaded | Stage 23 | |
| O-13 | Learner-facing product name of the "optimise" flow (e.g. "Optimise", "Improve") | soft | "Analyse and improve" | Stage 20 | |
| O-14 | Approve the W3C HTML validator network call (17.5): disclosure text, which data is sent, opt-in UX | **HARD** | Not built (validator absent / "Not connected") | Stage 28 | |
| O-15 | **Constellation prototype approval** after Stage 10a: approve, request changes, or reject the evidence package (`10` §14.2) | **HARD** | 10b (full roll-out, legacy removal) does not start until "approved" is recorded | between 10a and 10b | |
| O-16 | Locked topics: **advisory** (shown as Locked, can still be opened, "Recommended first"); enforced locking is not selected | soft | **Confirmed advisory by owner on 2026-10-26** | Stage 10a | |

## 5. Decision log (append here when resolved)

| Date | ID | Decision | By |
|---|---|---|---|
| 2026-10-25 | L-23…L-26, P-11…P-13, C-19…C-22 | Celestial constellation approved as the primary Learning Orbit; arc requirement (L-01, L-04) superseded; renderer = SVG + DOM; prototype-first with owner approval (O-15); concept image kept as a labelled reference | Owner (recorded by the pack author) |
| 2026-10-25 | C-23, §4a | Gate policy made explicit (soft / hard / non-blocking); O-03 default changed to hard gate; O-14 and O-15/O-16 added | QA pass |
| 2026-10-26 | O-16 | Confirmed advisory locked topics: learners may open topics and see prerequisite guidance; do not block lesson, quiz, or practice routes | Owner |
| 2026-10-26 | O-15 | **Constellation prototype approved**: Owner approved proceeding from Stage 10a to Stage 10b rollout and promotion. Known prototype observations (1-9) noted from Stage 10a screenshots are scheduled for consolidated follow-up after Stage 10b | Owner |
