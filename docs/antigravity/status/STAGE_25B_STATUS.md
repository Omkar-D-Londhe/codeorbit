# Stage 25b — Pyodide Sandbox & Python Analysis Provider — Status Report

Save as `docs/antigravity/status/STAGE_25B_STATUS.md`.

## 1. Header
- **Stage:** 25b · **Slug:** `python-track` · **Branch:** `stage-25b-python-track` · **Commit:** Uncommitted working tree (preserving Stages 16–25a baseline and Stage 25b deliverables per explicit user instructions)
- **Date/time:** 2026-10-29T19:55:00+05:30 · **Agent/tool:** Antigravity 2.0 (Google DeepMind)
- **Started from:** dedicated branch `stage-25b-python-track` branched from `stage-25a-python-track` preserving all uncommitted changes intact.

## 2. Baseline before changes (prior to Stage 25b)
| Command | Result (summary line) |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Clean (0 errors, 0 warnings) |
| `npm test` | Test Files: 136 passed / Tests: 1,111 passed |
| `npm run build` | Built in 775ms |

## 3. Implemented Deliverables

### A. Pinned Self-Hosted Pyodide Distribution (`public/pyodide/`)
- Packaged official Pyodide v0.26.4 distribution assets into `public/pyodide/`:
  - `pyodide.js`, `pyodide.mjs`, `pyodide.asm.js`, `pyodide.asm.wasm`, `python_stdlib.zip`, `pyodide-lock.json`, `package.json`.
- Authored `src/tracks/python/vendor/DEPENDENCY.md` recording:
  - Exact upstream release: Pyodide v0.26.4 (CPython 3.12.1).
  - SHA-256 integrity checksums for all distribution files.
  - Upstream license documentation (Apache-2.0 / MPL-2.0 / PSF) in `src/tracks/python/vendor/LICENSE-pyodide`.
  - Zero CDN dependencies: 100% self-hosted, offline capable.
- Unit verified in `src/test/pythonVendor.test.ts` (4/4 tests passed).

### B. Service Worker Offline Caching (`public/sw.js`)
- Added dedicated cache bucket `PYODIDE_CACHE = 'codeorbit-pyodide-v1'`.
- Implemented cache-first strategy for `/pyodide/` assets ensuring Pyodide is downloaded once and operates completely offline.
- Verified in `src/test/pwa.test.ts` (18/18 tests passed).

### C. Web Worker Sandbox Engine (`src/tracks/python/engineWorker.ts`, `runner.ts`)
- Dedicated Web Worker execution architecture completely isolated from the main thread DOM, cookies, and local storage.
- **Host Watchdog Timer:** 3,000 ms hard limit that invokes `worker.terminate()` on CPU loops or hangs.
- **Output Truncation Guard:** Limits combined stdout/stderr to 50 KB, appending honest truncation notice.
- **Recursion Guard:** Enforces `sys.setrecursionlimit(500)` to prevent WebAssembly stack exhaustion.
- **Import Blocker Hook:** Multi-layer defense with pre-execution static validation plus in-Python `sys.meta_path` `SandboxImportBlocker` poisoning and intercepting sensitive modules (`os`, `subprocess`, `socket`, `urllib`, `requests`, `shutil`, `ctypes`, `multiprocessing`).
- **Namespace Isolation:** Clean per-run execution namespace (`py.toPy({})`) preventing cross-run variable or state leaks.
- Unit verified in `src/test/pythonRunner.test.ts` (26/26 tests passed).

### D. Python AST Static Analysis Provider (`src/tracks/python/analysis/provider.ts`, `equivalence.ts`)
- Implemented `py-ast-v1` provider executing Python's native `ast` module inside Pyodide WebAssembly.
- Analyzes asymptotic complexity:
  - Time complexity (worst, average, best).
  - Auxiliary space complexity.
  - Confidence rating (`high`, `medium`, `low`).
  - Ranked bottlenecks with exact line ranges and actionable explanations.
- **Honest Disclosures (L-09):** Sets `isFormalProof: false` and discloses AST heuristics without making claims of mathematical proof.
- **Equivalence Verification (`equivalence.ts`):** Verifies refactored code against baseline across seeded pseudo-random inputs.
- Unit verified across 32 labelled fixtures in `src/test/pythonAnalysis.test.ts` (36/36 tests passed, 100% precision on supported cases).

### E. Practice Opt-In UI & Structure Fallback (`src/pages/Practice.tsx`)
- **Storage & Download Disclosure Banner:** Learner is shown a clear disclosure explaining the one-time ~10 MB Pyodide download and offline caching before execution is initialized.
- **Progress & Retry UX:** Visual progress indicator during runtime preparation, friendly error banner with Retry action.
- **Decline & Fallback Mode:** Learners can decline execution or switch at any time back to read-only non-executing Structure Preview mode.
- Unit verified in `src/test/pythonExecutionUI.test.tsx` (5/5 tests passed) and `src/test/pythonNoExecution.test.tsx` (3/3 tests passed).

### F. Track Upgraded to Available (`src/tracks/python/track.ts`)
- Upgraded Python track status to `available` with full capabilities:
  - `['lessons', 'quizzes', 'practice', 'preview', 'execution', 'diagnostics', 'snippets', 'complexity', 'optimisation']`.
- Registered `pyAstProvider` in `src/app/registerTracks.ts`.

---

## 4. Quality Gates & Verification Matrix

| Gate | Check | Command / File | Status | Details |
|---|---|---|---|---|
| **Q1** | TypeScript | `npm run typecheck` | **PASS** | 0 errors |
| **Q2** | ESLint | `npm run lint` | **PASS** | 0 errors, 0 warnings; zero forbidden `'html'` occurrences |
| **Q3** | Unit & Integration Tests | `npm test` | **PASS** | **140/140 test files passed (1,182/1,182 tests green)** |
| **Q4** | Production Build | `npm run build` | **PASS** | Built in 1.70s; 0-byte initial bundle impact from Pyodide |
| **Q5** | Regression Smoke | `vitest run src/test/regression.smoke.test.tsx` | **PASS** | 19/19 tests passed; zero axe serious/critical violations |
| **Q6** | O-03 Security Audit | `src/test/pythonRunner.test.ts` | **PASS** | 26/26 security tests passed (SEC-01..06) |
| **Q7** | Fixture Precision | `src/test/pythonAnalysis.test.ts` | **PASS** | 36/36 tests passed (32 labelled fixtures tested) |

---

## 5. Security & Threat Vector Verification (O-03)

| Threat Vector | Defense Mechanism | Test Verification | Status |
|---|---|---|---|
| **SEC-01: Prohibited Imports** | Static AST scanner + runtime `sys.meta_path` import blocker poisoning `os`, `subprocess`, `socket`, `urllib`, `requests`, `shutil`, `ctypes`, `multiprocessing` | `src/test/pythonRunner.test.ts` (19 import tests) | **VERIFIED** |
| **SEC-02: CPU Starvation / Infinite Loops** | 3,000 ms host watchdog timer via `worker.terminate()` | `src/test/pythonRunner.test.ts` | **VERIFIED** |
| **SEC-03: Memory Exhaustion** | `sys.setrecursionlimit(500)` preventing WASM stack blowouts | `src/test/pythonRunner.test.ts` | **VERIFIED** |
| **SEC-04: Output Flooding** | 50 KB output truncation guard for stdout/stderr | `src/test/pythonRunner.test.ts` | **VERIFIED** |
| **SEC-05: State Contamination** | Isolated Worker instance + clean `freshNs = py.toPy({})` per run | `src/test/pythonRunner.test.ts` | **VERIFIED** |
| **SEC-06: DOM / Network Access** | Worker context has no `window`, `document`, and neutralized `XMLHttpRequest`, `WebSocket`, `EventSource`, `indexedDB` | `src/test/pythonRunner.test.ts` | **VERIFIED** |
| **SEC-07: Offline Availability** | Pinned v0.26.4 in `public/pyodide/` + CacheStorage `codeorbit-pyodide-v1` | `src/test/pwa.test.ts`, `pythonVendor.test.ts` | **VERIFIED** |

---

## 6. Truthful Disclosures & Documented Limitations (L-09)
1. **No Formal Proof Claims:** Complexity analysis is performed via static AST pattern recognition and heuristic analysis (`isFormalProof: false`), not formal semantic proof.
2. **Dynamic Behavior Limitations:** Dynamic loop bounds (e.g. `while condition:`) and runtime-dependent control flow are honestly marked with lower confidence or worst-case bounds.
3. **WASM Memory Ceiling Honesty:** Emscripten linear memory growth is dynamically managed by the browser engine; JavaScript cannot impose an unverified hard byte ceiling without custom compilation. CodeOrbit relies on worker termination and recursion limits, never claiming an unverified byte cap.
4. **Bandwidth / Storage Transparency:** Learner is explicitly warned before downloading ~10 MB of assets, with offline caching and structure-only preview available as a choice.

---

## 7. Next Stage Readiness
- Sub-stage 25b is fully complete, self-contained, tested, and documented.
- The entire repository is intact on branch `stage-25b-python-track` with uncommitted changes preserved.
- No work on Stage 26 has begun.
- Ready for owner review and Stage 25 final acceptance.

---

## 8. Final Verification Addendum

### 8.1 Verification Commands and Actual Results

| Check / Requirement | Command Line Executed | Actual Result | Evidence Source |
|---|---|---|---|
| **SEC-07: Asset Integrity** | `npx vitest run src/test/pythonVendor.test.ts` | 4/4 tests passed (30ms) | Automated Vitest test suite reading real file buffers from disk |
| **SEC-07: Direct SHA-256 Hashes** | Node crypto SHA-256 calculation across `public/pyodide/*` | 7/7 assets matched `DEPENDENCY.md` exactly (0 discrepancies) | Real disk file hashes |
| **SEC-08: Offline Browser Execution** | `npx playwright test e2e/pwa-offline.spec.ts` | 4/4 tests passed (12.7s) | Automated Playwright Chromium test running offline with `context.setOffline(true)` |
| **Worker Security & Watchdog** | `npx vitest run src/test/pythonRunner.test.ts` | 26/26 tests passed (2.2s) | Real CPython/Pyodide WebAssembly execution under Node & Worker host |
| **AST Analysis & Fixtures** | `npx vitest run src/test/pythonAnalysis.test.ts` | 36/36 tests passed (4.5s) | 32 labelled fixtures tested with 100% precision on supported cases |
| **Lazy Loading Verification** | Inspection of `dist/index.html` & `dist/assets/` | 0 bytes Pyodide assets in initial route chunks | Rollup/Vite production build output inspection |
| **Full Regression Suite** | `npm test` | **140/140 files passed, 1,182/1,182 tests green** | Complete repository test suite |
| **Typecheck & Lint** | `npm run typecheck && npm run lint` | Clean (0 errors, 0 warnings) | TypeScript compiler & ESLint |

### 8.2 SEC-07: Pyodide Asset Integrity Comparison Table

Automated test `src/test/pythonVendor.test.ts` directly computed SHA-256 hashes against all files in `public/pyodide/` on disk (no mocked values):

| Asset File | Size (Bytes) | Expected SHA-256 (`DEPENDENCY.md`) | Actual Computed SHA-256 | Discrepancy |
|---|---|---|---|---|
| `package.json` | 3,196 | `F7BEAFE72F10B3702D177F6B72BF3C113036C35D982C382FAEF15564740D1250` | `F7BEAFE72F10B3702D177F6B72BF3C113036C35D982C382FAEF15564740D1250` | None (Match) |
| `pyodide-lock.json` | 106,335 | `CD50B49DE944C579045E122FE8628B31F9CE446379F032F36C05E273D38766E0` | `CD50B49DE944C579045E122FE8628B31F9CE446379F032F36C05E273D38766E0` | None (Match) |
| `pyodide.asm.js` | 1,229,099 | `919560652ED3DAD3707CB3A394785DA1E046FB13DC0DEFA162058FF230CB7EED` | `919560652ED3DAD3707CB3A394785DA1E046FB13DC0DEFA162058FF230CB7EED` | None (Match) |
| `pyodide.asm.wasm` | 10,088,051 | `B7E66A19427A55010AC3367C1B6C64B893F9826F783412945FDF0C3337F3BC94` | `B7E66A19427A55010AC3367C1B6C64B893F9826F783412945FDF0C3337F3BC94` | None (Match) |
| `pyodide.js` | 14,761 | `C0069107621D5B942A659E737A12E774CC0451FEAA2256F475D72E071D844EC7` | `C0069107621D5B942A659E737A12E774CC0451FEAA2256F475D72E071D844EC7` | None (Match) |
| `pyodide.mjs` | 13,779 | `7F24C6655A79EACF0061D3D4E6A60DC0B1938812D15C52D7FF8B37D9E0689E51` | `7F24C6655A79EACF0061D3D4E6A60DC0B1938812D15C52D7FF8B37D9E0689E51` | None (Match) |
| `python_stdlib.zip` | 2,341,872 | `72894522B791858B9D613AC786B951D8B5094035DCF376313EA24A466810F336` | `72894522B791858B9D613AC786B951D8B5094035DCF376313EA24A466810F336` | None (Match) |

### 8.3 SEC-08: Offline Operation Verification Status

- **Status:** **PASS (Automated Browser Evidence Verified)**
- **Verification Method:** Implemented and executed automated browser test in Playwright Chromium (`e2e/pwa-offline.spec.ts` test 4):
  1. Opened `/practice/py-ch-basics?enable-sw=1` and activated Service Worker.
  2. Clicked "Download & Enable Python (~10 MB)", populating Service Worker cache bucket `codeorbit-pyodide-v1`.
  3. Disconnected network access via `await context.setOffline(true)`.
  4. Reloaded the application while offline (`await page.reload()`).
  5. Intercepted all network requests, confirming zero outgoing CDN or external calls (`expect(externalRequests).toEqual([])`).
  6. Clicked Run button and verified that Python execution completed successfully offline in the isolated Web Worker with test output rendered into the UI.
- **Manual Verification Procedure (for browser audit):**
  1. Open DevTools $\to$ Application $\to$ Service Workers (ensure SW is active).
  2. Navigate to `/practice/py-ch-basics` and click "Download & Enable Python (~10 MB)".
  3. Verify in CacheStorage that `codeorbit-pyodide-v1` contains `/pyodide/pyodide.mjs`, `/pyodide/pyodide.asm.wasm`, etc.
  4. In Network tab, toggle "Offline" checkbox.
  5. Refresh page (F5).
  6. Click "Run" button in Practice toolbar. Code executes and tests evaluate with zero network failure errors.

### 8.4 Actual Worker Security Behavior & Residual Risks

The security tests in `src/test/pythonRunner.test.ts` exercise real CPython/Pyodide WebAssembly binaries:
- Watchdog terminates real infinite loops (`while True: pass`) at 3,000 ms via `worker.terminate()`.
- Output truncation caps real 100,000-character streams at 50 KB with `[Output truncated: exceeded 50 KB limit]`.
- Recursion defense tests real CPython stack overflow, intercepting it cleanly via `sys.setrecursionlimit(500)`.
- State isolation tests verify that variables and monkey-patched built-ins (`len`) from Run 1 do not exist in Run 2 (`py.toPy({})` fresh namespace).

**Residual Risks & Real-World Boundaries (Honest Disclosure):**
1. **Pyodide JavaScript Bridge (`js` module):** Python code can `import js` to access JavaScript globals in WorkerGlobalScope. While DOM objects (`window`, `document`) do not exist in Workers, and network interfaces (`XMLHttpRequest`, `WebSocket`, `EventSource`, `indexedDB`) are neutralized on `self`, object prototype traversal or future Worker APIs remain accessible inside the Worker thread.
2. **Dynamic WebAssembly Memory:** Emscripten's linear memory grows dynamically. The browser controls linear memory up to platform boundaries; JavaScript cannot inject an arbitrary byte ceiling without custom Pyodide compilation. Host safety depends on watchdog termination and recursion limits.
3. **Cache Tampering:** If a malicious extension or user script modifies local CacheStorage, Pyodide assets in CacheStorage could be altered. Subresource Integrity (SRI) is not currently enforced dynamically by Emscripten's internal asset loader.

### 8.5 Lazy Loading & Bundle Isolation

- `dist/index.html` loads only 7 initial application chunks (`index-*.js`, `rolldown-runtime-*.js`, `registry-*.js`, `jsx-runtime-*.js`, `Icon-*.js`, `preload-helper-*.js`, `AppState-*.js`).
- Pyodide WebAssembly runtime (`pyodide.asm.wasm` 10 MB, `python_stdlib.zip` 2.3 MB) is completely absent from the initial bundle.
- Pyodide is fetched only over the network / CacheStorage after the learner explicitly triggers opt-in by clicking "Download & Enable Python (~10 MB)".

### 8.6 Documentation Consistency Check

- `STAGE_25B_STATUS.md`, `STAGE_25_STATUS.md`, `O03_SECURITY_IMPLEMENTATION_PLAN.md`, `docs/DECISIONS.md` (D-142, D-143), and `docs/WORKLOG.md` were compared and verified for consistency.
- All metrics (140 test files, 1,182 unit tests, 7 vendored files, 32 analysis fixtures, 4 offline e2e tests) match live verification results.

---

### 8.7 Final Verdict

**PASS WITH DOCUMENTED LIMITATIONS**

*Rationale:* All automated verification requirements (SEC-07 asset integrity, SEC-08 offline operation via Playwright, worker security paths, lazy loading, and documentation consistency) are 100% green and verified. The status is marked with documented limitations to maintain strict architectural honesty (L-09) regarding Emscripten dynamic WASM memory limits, heuristic AST complexity analysis (`isFormalProof: false`), and Worker JavaScript interop boundaries.

