# Stage 28 — External-Dependency Service Registry & Gated Integrations — Completion Report

Save as `docs/antigravity/status/STAGE_28_STATUS.md`.

## 1. Header
- **Stage:** 28 · **Slug:** `external-dependency-gated` · **Branch:** `stage-28-external-dependency-gated` · **Commit:** Uncommitted working tree (preserving Stages 16–27 baseline and Stage 28 deliverables per explicit user instructions)
- **Date/time:** 2026-10-29T22:08:00+05:30 · **Agent/tool:** Antigravity 2.0 (Google DeepMind)
- **Hard Gates Status:**
  - **O-06 (AI hints):** **GATED / UNAPPROVED**. No external AI network calls, no client keys, no synthetic outputs.
  - **O-07 (Multiplayer):** **GATED / UNAPPROVED**. No WebRTC signalling, no WebSocket connections, zero simulated peer progress (Rule L-08).
  - **O-14 (W3C HTML validator):** **GATED / UNAPPROVED**. No remote validator requests dispatched; local deterministic AST and accessibility validators remain active.
- **Service Registry Status:** All 3 external services registered in `src/core/services/registry.ts` with status `'not-connected'`, `isApproved: false`, explicit privacy disclosures, and offline fallback declarations. Settings page displays the truthful "Connected Services" section with disabled "Not configured" controls.

## 2. Baseline & Verification Summary
| Command | Result (summary line) | Status |
|---|---|---|
| `npm run typecheck` | Clean (0 errors) | **PASS** |
| `npm run lint` | Clean (0 errors, 0 warnings) | **PASS** |
| `npm test` | All 152 test files passed (1,249 tests passed, 0 failed) | **PASS** |
| `npm run build` | Built in 737ms; 0 bundle regression | **PASS** |
| `npx vitest run src/test/regression.smoke.test.tsx` | 19 of 19 passed | **PASS** |
| `npx vitest run src/test/servicesRegistry.test.ts src/test/networkSilence.test.tsx src/test/settingsServices.test.tsx` | 11 of 11 passed | **PASS** |

## 3. Deliverables Summary

### Decision Memo on External Features & Hard Gates (`docs/EXTERNAL_FEATURES.md`)
- Authored comprehensive architectural, security, and privacy decision memo evaluating the three Phase-2 proposals:
  - **17.2 AI-Powered Hint Expansion (Gate O-06):** Evaluated API key exposure hazards in client-side code, requirements for an owner-managed backend proxy, user data disclosure implications, hint penalty counting, and recurring compute costs. Confirmed Gate O-06 remains unapproved.
  - **17.8 Multiplayer Challenge Race (Gate O-07):** Evaluated limitations of single-device `BroadcastChannel` vs WebRTC DataChannels, necessity of standing WebRTC signalling and STUN/TURN servers, privacy of peer code exchange, and strict prohibition against simulated bots (Rule L-08). Confirmed Gate O-07 remains unapproved.
  - **17.5 Live HTML Validator / W3C Nu HTML Checker API (Gate O-14):** Evaluated public API rate limits, learner code transmission across the internet, mandatory per-request confirmation dialog requirements, and complete offline capability of CodeOrbit's built-in deterministic AST validators. Confirmed Gate O-14 remains unapproved.

### External Service Registry (`src/core/services/registry.ts`)
- Defined typed contracts:
  - `ExternalServiceId = 'w3c-validator' | 'ai-hints' | 'multiplayer'`
  - `ExternalServiceStatus = 'not-connected' | 'connected' | 'error'`
  - `ExternalService { id, name, description, status, disclosure, gateId, isApproved, offlineFallback }`
- Initialized registry with all 3 services set to `status: 'not-connected'` and `isApproved: false`.
- Exported typed accessors: `getExternalServices()`, `getExternalService(id)`.

### Settings UI Honesty (`src/pages/Settings.tsx`)
- Added "Connected Services" section under "Integrations & Privacy":
  - Explanatory banner confirming CodeOrbit's 100% offline-first architecture.
  - Card for each registered service displaying title, description, `Not connected` badge (`badge--subtle`), prominent privacy disclosure callout box, offline fallback statement, and gate status indicator.
  - Action buttons are disabled and labelled "Not configured", preventing deceptive interactions or false connection states.
  - Strictly zero API key entry inputs or cloud credential forms.

### Network Silence & Boundary Verification (`src/test/networkSilence.test.tsx`)
- Automated Vitest spy intercepting all `globalThis.fetch` calls:
  - Proves that rendering `/`, `/explore`, `/learn/:technologyId`, and `/settings` makes **zero third-party network requests**.
  - Proves that W3C validator, AI hint expansion, and multiplayer race never make background network calls.
  - Confirms complete offline independence and privacy compliance.

## 4. Acceptance Criteria Verification (§13)

| Criterion | Target | Actual | Status |
|---|---|---|---|
| By default the app performs no third-party requests | `fetch` spy proves zero outbound requests to third-party domains | Verified in `src/test/networkSilence.test.tsx` (0 third-party requests) | **TICKED** |
| Unapproved features do not appear as controls or routes | No live AI hint buttons, no multiplayer race routes, no auto-validator buttons in challenge workspace | Verified in `src/test/settingsServices.test.tsx` and app routing tests | **TICKED** |
| Approved features show disclosure dialog and handle errors gracefully | N/A (all 3 gates O-06, O-07, O-14 remain unapproved; services are Not Connected) | Disclosures rendered on Settings cards; no approved integrations activated | **TICKED** |
| AI hints (if built) count as hint usage and are labelled | N/A (Gate O-06 is unapproved and not built) | Documented in `docs/EXTERNAL_FEATURES.md` as mandatory invariant for any future activation | **TICKED** |

## 5. Exit Gate Checklist (§16)
- [x] Every acceptance box in §13 is ticked with evidence.
- [x] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` pass.
- [x] Regression smoke is green (19/19 passed).
- [x] Test count has increased (152 test files, 1,249 tests passed; +11 tests added).
- [x] Zero new dependencies added.
- [x] No placeholder, fake metric, dead control, or unverified claim remains.
- [x] Uncommitted working tree preserved per explicit user instructions.
