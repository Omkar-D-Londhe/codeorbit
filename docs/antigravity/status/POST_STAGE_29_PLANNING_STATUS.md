# CodeOrbit — Post-Stage 29 Planning Status Report (Final Revision)

**Pass:** 1 of 3 (Planning Finalization)  
**Status:** ✅ FINALIZED & READY FOR OWNER AUTHORIZATION  
**Date:** 2026-10-29  
**Branch:** `stage-29-final-integration-release`  
**Baseline commit:** `455bacb`  
**Working tree:** Exactly 148 modified/new files (Stages 16–29 uncommitted working tree preserved 100% intact)

---

## 1. Executive Summary

The implementation plan for the post-Stage 29 cycle has been revised and finalized in:
> `docs/antigravity/POST_STAGE_29_IMPLEMENTATION_PLAN.md`

Per explicit owner directive, Pass 2 will deliver the complete site-wide UI/UX/accessibility fixes **and complete, working implementations of all five deferred feature areas (O-04, O-05, O-06, O-07, O-14)**, rather than merely documenting them, keeping them permanently gated, or supplying fake mock UI.

**Preflight Rule Compliance:**
- ✅ **Planning revision only:** Zero application code, dependencies, or runtime configs modified.
- ✅ **No silent gate approvals:** Authoritative gate files (`07_CONFLICTS_AND_DECISIONS.md`, `DECISIONS.md`) remain untouched; the plan specifies the exact explicit decision text required from the owner to unlock each gate.
- ✅ **Full repository preservation:** Exactly 148 files in the working tree verified and preserved; 0 stashes, 0 commits, 0 resets.

---

## 2. Findings & Scope Summary

| Category | Verified Count | Resolution Status in Plan |
|---|---|---|
| **UI/UX & Visual Defects** | **22 distinct issues** (UI-01 through UI-22) | Full architectural solutions mapped in W1–W4 |
| **Undefined CSS Custom Properties** | **39 properties** (including `--c-muted`) | Complete canonical token migration planned in W1 |
| **Missing Icon Glyphs** | **9 icons** (rendering blank paths) | 9 SVG paths and automated coverage test planned in W2 |
| **WCAG 2.1 AA Contrast Failures** | **3 critical failures** (ShareCard, Starlight chips) | Accessible color overrides mapped in W2 |
| **Document Security Gap** | **No top-level CSP in index.html** | Strict W3C-compliant CSP meta tag mapped in W10 |
| **O-04 (Java / C++ Execution)** | Hard Gate Open | In-Worker WebAssembly compiler runtime (Clang/TeaVM) mapped in W5 |
| **O-05 (Angular Practice Execution)** | Hard Gate Open | Curated standalone interactive practice lab (~155 kB) mapped in W6 |
| **O-06 (AI Hint Expansion)** | Hard Gate Open | Serverless backend proxy + affirmative consent modal mapped in W8 |
| **O-07 (Multiplayer Challenge Races)**| Hard Gate Open | Real WebRTC DataChannel races + signalling relay (0 bots) mapped in W9 |
| **O-14 (Live W3C HTML Validation)** | Hard Gate Open | Nu Checker API integration + opt-in disclosure mapped in W7 |

---

## 3. Recommended Technical Approach for the Five Deferred Features

1. **O-04 — Java & C++ Execution:**
   - **Approach:** Client-side WebAssembly execution hosted in dedicated Web Workers (`clang-wasm` for C++; `TeaVM` headless runtime for Java).
   - **Security Bounds:** 3,000ms execution timeout watchdog, 128 MB memory allocation limit, 64 KB output buffer cap, in-memory virtual filesystem cleared per run, zero network access.
   - **Offline:** Binaries lazily fetched on demand and cached in ServiceWorker cache `codeorbit-compilers-v1`.

2. **O-05 — Angular Practice Execution Lab:**
   - **Approach:** 12 curated standalone interactive challenges with a precompiled standalone component runtime (~155 kB gzip) authored in TypeScript and compiled at build time.
   - **Runtime:** Tested in the sandboxed preview iframe (`sandbox="allow-scripts"`, opaque `null` origin, strict CSP without `unsafe-eval`), with runtime DOM/state assertions returning verification to Code Coach via `postMessage`.
   - **Offline:** 100% offline-ready via standard ServiceWorker precaching.

3. **O-06 — AI-Powered Hints:**
   - **Approach:** Dedicated serverless reverse proxy (Cloudflare Worker / GCP Function) storing master API key (`AI_PROVIDER_API_KEY`) strictly in server environment secrets. Zero client secrets.
   - **Privacy & Consent:** Explicit per-request affirmative consent dialog before code transmission; data minimization (code snippet + prompt only; zero PII or learner notes).
   - **Scoring & Honesty:** Prominent AI-generated disclaimer badge; `hintsRevealed += 1` scoring penalty.
   - **Offline Fallback:** Automatic fallback to CodeOrbit's built-in 3-tier deterministic curriculum hints if offline or on network failure.

4. **O-07 — Real Cross-Device Multiplayer Challenge Races:**
   - **Approach:** Real peer-to-peer data synchronization via WebRTC `RTCDataChannel` with lightweight WebSocket signalling relay (`server/signalling/relay.ts`) and Google STUN servers.
   - **Rule L-08 Anti-Bot Guarantee:** Zero simulated bot opponents. Real connected peers only.
   - **Integrity:** Opponent code never runs on the learner's machine; telemetry limited to fractional progress indices. 15-second reconnect grace period.

5. **O-14 — Live W3C HTML Validation:**
   - **Approach:** HTTPS POST to official W3C Nu HTML Checker API (`https://validator.w3.org/nu/?out=json`) parsing errors/warnings into editor line gutter diagnostics.
   - **Privacy & Consent:** Per-submission opt-in disclosure modal stating exact data transmitted.
   - **Rate Limiting:** 5-second submission throttle to protect against 429 IP bans.
   - **Offline Fallback:** Instant seamless fallback to CodeOrbit's deterministic local AST validator when offline or on network timeout.

---

## 4. Ten-Stage Pass 2 Implementation Order

- **W1:** Design System Foundations, Tokens & Theming (`tokens.css`, `themes.css`, canonical `--c-*` migration).
- **W2:** Visual Components, Charts, Contrast, Icons & Action Alignment (UI-01, 02, 04, 05, 06, 13, 14, 15, 17, 18, 19, 22).
- **W3:** Navigation, Shortcuts, Tour & Desktop Rail Polish (UI-07, 08 [`g h` chord], 11, 12).
- **W4:** Concept Atlas Highlighting Engine & Target Precision (UI-09, 21).
- **W5:** Runner Architecture & In-Browser Java/C++ Execution (O-04).
- **W6:** Angular Interactive Practice Lab & Assertions (O-05).
- **W7:** Live W3C HTML Validation Integration & Consent Modal (O-14).
- **W8:** AI Hint Proxy & Integration (O-06).
- **W9:** Real Cross-Device Multiplayer Races (O-07).
- **W10:** Top-Level CSP Meta Tag, Security Hardening & Release Verification (UI-16, UI-20).

---

## 5. Next Steps

Pass 1 planning is finalized. Upon receipt of owner approval and confirmation of the decision records in §6 of the plan, Pass 2 implementation will commence immediately at Workstream W1.
