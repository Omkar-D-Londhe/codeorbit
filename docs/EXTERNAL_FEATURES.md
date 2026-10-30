# Decision Memo: External-Dependency Services and Hard Gates (O-06, O-07, O-14)

**Document:** `docs/EXTERNAL_FEATURES.md`  
**Governing Gates:** Hard Gates O-06, O-07, and O-14 (`docs/antigravity/07_CONFLICTS_AND_DECISIONS.md`)  
**Stage:** Stage 28 — External-dependency features (decision-gated)  
**Status:** **GATED / OPEN (NOT APPROVED FOR LIVE CONNECTION)**  
- **Hard Gate O-06 (AI hints):** UNAPPROVED / GATED. No client API keys, no backend proxy, no telemetry dispatched.
- **Hard Gate O-07 (Multiplayer):** UNAPPROVED / GATED. No WebRTC signalling server, no fake peer simulation (Rule L-08).
- **Hard Gate O-14 (W3C HTML Validator):** UNAPPROVED / GATED. No remote W3C API network calls; local deterministic AST validators active.

---

## 1. Executive Summary

CodeOrbit is architected as an offline-first, client-only Progressive Web Application (PWA). All core learning workflows (reading lessons, completing quizzes, authoring practice challenge code, and running static complexity analysis) function completely offline without external network dependencies.

Phase-2 proposals in the product catalog introduced three features requiring external infrastructure or remote network services:
1. **Catalog 17.2: AI-Powered Hint Expansion** (Gate O-06)
2. **Catalog 17.8: Multiplayer Challenge Race** (Gate O-07)
3. **Catalog 17.5: Live HTML Validator (W3C API)** (Gate O-14)

Per architectural rules **L-06** ("no arbitrary code execution outside Web Workers / WebAssembly"), **L-08** ("no fake features or simulated execution — no synthetic peers"), **L-09** ("truthfulness in analysis and capabilities"), and **L-14** ("offline-first PWA without external server requirement"), each of these features is governed by a **Hard Gate**.

This memo documents the architectural risks, privacy implications, operational costs, and connection boundaries for each feature. None of these features are approved for live network activation in Stage 28. In production, each service is registered in `src/core/services/registry.ts` with status `'not-connected'`, and the Settings page renders an honest "Connected services" panel with clear disclosure copy.

---

## 2. Technical Evaluation of External Services

### 2.1 Catalog 17.2: AI-Powered Hint Expansion (Gate O-06)

#### Architectural & Security Analysis
- **Key Management Security Risk:** Modern LLM APIs (e.g. Google Gemini API, OpenAI API, Anthropic API) require authenticated API keys with billing credentials. Storing API keys directly in client-side JavaScript or local storage is an unacceptable security hazard; any user could extract the key and abuse the associated cloud billing account.
- **Required Backend Infrastructure:** Safe deployment strictly requires an owner-hosted backend reverse proxy (e.g. Cloudflare Worker or GCP Cloud Function) that holds the master API secret, authenticates the client, enforces IP rate-limiting, and strips sensitive metadata before forwarding requests to the LLM.
- **Privacy & Data Disclosure:** Sending learner source code, challenge prompt metadata, and user notes to external LLM providers constitutes a remote data transfer. In strict privacy environments (e.g. educational institutions, minors), transmission of unvetted learner code to cloud providers requires explicit, per-action affirmative consent.
- **Mastery Integrity & Scoring:** Under CodeOrbit rules, hints penalize mastery points (revealing reference hints reduces final milestone scores). If AI hints are ever approved, every AI query must increment the challenge's hint counter (`hintsRevealed += 1`) and carry a prominent label: *"AI-generated hint — may be inaccurate or unverified"*.
- **Operating Cost:** Standing cloud proxy hosting and token-based inference pricing create recurring operational expenses that conflict with CodeOrbit's serverless static distribution model.

#### Current Gate Status & Resolution
- **Status:** **HARD GATE O-06: UNAPPROVED / KEEP NOT CONNECTED**.
- **Delivered State:** Registered in service registry with `status: 'not-connected'`. Settings page displays disclosure notice. No external AI API calls or proxy connections exist.
- **Offline Behavior:** 100% offline; curated 3-tier deterministic hints (concept $\to$ structure $\to$ targeted solution) remain active for all challenges.

---

### 2.2 Catalog 17.8: Multiplayer Challenge Race (Gate O-07)

#### Architectural & Security Analysis
- **Transport Limitations:**
  - *Option A: Cross-Tab `BroadcastChannel`.* A `BroadcastChannel` API operates purely across browser tabs on the *exact same browser origin on a single local computer*. It cannot connect two learners on different laptops or devices on a local area network (LAN).
  - *Option B: WebRTC DataChannels.* True LAN or internet peer-to-peer communication requires WebRTC. However, WebRTC fundamentally cannot establish peer connections without a standing **Signalling Server** (WebSocket/HTTP server exchanging SDP offers, answers, and ICE candidate negotiation). Furthermore, symmetric NATs and institutional firewalls require STUN/TURN relay infrastructure.
- **Rule L-08 Prohibition of Synthetic Peers:**
  - Catalog 8.5 and 17.8 explicitly prohibit fabricating peer data or displaying simulated "bots" masquerading as real human opponents. Opponent telemetry must represent a genuine connected peer or be omitted entirely.
- **Security & Integrity Risks:**
  - Peer-to-peer data channels allow arbitrary code exchange. Code received from a peer must never be executed on the recipient's trusted DOM (Rule L-06). If peer code review is enabled, it must be constrained to read-only text inspection or run inside an isolated Web Worker / sandbox iframe.

#### Current Gate Status & Resolution
- **Status:** **HARD GATE O-07: UNAPPROVED / KEEP NOT CONNECTED**.
- **Delivered State:** Registered in service registry with `status: 'not-connected'`. Settings page displays disclosure notice. No WebSocket or WebRTC connections are initiated. No peer progress is simulated.
- **Offline Behavior:** 100% offline; learners compete against their own verified local personal bests (`state.personalBests`) stored privately in local storage.

---

### 2.3 Catalog 17.5: Live HTML Validator (W3C Nu HTML Checker API) (Gate O-14)

#### Architectural & Security Analysis
- **Service Endpoint & Protocol:**
  - The official W3C validator service (`https://validator.w3.org/nu/?out=json`) accepts HTML documents via HTTPS POST.
  - While public and free to use, the W3C infrastructure enforces strict request rate limits (abusive automated traffic results in temporary 429 Too Many Requests IP bans).
- **Privacy & Disclosure:**
  - The learner's authored HTML source code leaves their device and is transmitted across the public internet to third-party W3C servers.
  - Although HTML for starter challenges contains no PII, learners frequently insert personal names, email addresses, or proprietary notes into form practice fields.
  - Therefore, any future network call must be preceded by an explicit, per-action confirmation dialog disclosing the destination URL and the exact payload.
- **Offline Failure & Local Alternatives:**
  - When a learner is offline, traveling, or on restricted institutional Wi-Fi, the external W3C validator is completely unavailable.
  - CodeOrbit's built-in deterministic validation engines (`src/lib/validators.ts`, `src/tracks/html/`, and `src/core/a11y/a11yLint.ts`) perform comprehensive AST validation, tag closure checks, nesting validation, attribute verification, and WCAG accessibility audits in memory in under 2 milliseconds, with 100% offline availability.

#### Current Gate Status & Resolution
- **Status:** **HARD GATE O-14: UNAPPROVED / KEEP NOT CONNECTED**.
- **Delivered State:** Registered in service registry with `status: 'not-connected'`. Settings page displays disclosure notice. No HTTP requests are dispatched to `validator.w3.org`.
- **Offline Behavior:** 100% offline; deterministic local AST validation, requirement checking, and accessibility linting remain fully operational.

---

## 3. Comparison & Decision Matrix

| Evaluation Dimension | AI Hints (Gate O-06) | Multiplayer Race (Gate O-07) | W3C Nu Validator (Gate O-14) |
|---|---|---|---|
| **Gate Classification** | **HARD GATE** | **HARD GATE** | **HARD GATE** |
| **Current Status** | **UNAPPROVED (Not Connected)** | **UNAPPROVED (Not Connected)** | **UNAPPROVED (Not Connected)** |
| **External Dependency** | Remote LLM API + Standing Proxy | WebRTC Signalling Server / STUN | W3C Nu HTML Checker API |
| **Data Transmitted** | Challenge code & prompts | Real-time code edits & completion times | Full HTML challenge document |
| **Privacy Disclosure Required** | Yes (Affirmative opt-in) | Yes (Peer consent) | Yes (Per-request dialog) |
| **Offline Fallback** | 3-stage deterministic hints | Local personal bests & timing | Local deterministic AST linters |
| **Client Secrets Exposure** | High risk (prohibits direct client keys) | None (P2P encryption) | None (Public API) |
| **Rule Compliance** | L-05, L-08, L-14 | L-06, L-08, L-14 | L-08, L-09, L-14 |

---

## 4. Formal Recommendation

1. **Maintain all three Hard Gates (O-06, O-07, and O-14) as UNAPPROVED:**
   - Do not enable network calls, API clients, or peer connections for any external feature in Stage 28.
   - Do not store mock or placeholder API keys in client code or environment variables.
2. **Deliver the Service Registry & Settings UI:**
   - Expose the typed service registry in `src/core/services/registry.ts`.
   - Render the "Connected services" card on `/settings`, displaying each service with a `Not connected` badge, privacy disclosure statement, and offline fallback notice.
3. **Future Activation Prerequisites:**
   - If the repository owner approves O-14 in a future release: implement `src/tracks/html/validatorW3C.ts` with explicit modal consent dialog before each single HTTPS POST request, with graceful offline error handling.
   - If the repository owner approves O-06 in a future release: commission a secure backend proxy service; never store keys in the frontend.
   - If the repository owner approves O-07 in a future release: establish dedicated WebRTC signalling infrastructure and never simulate bot opponents.
