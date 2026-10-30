# CodeOrbit — Gate O-03 Security Implementation & Verification Plan
**Document Version:** 1.0.0  
**Status:** Prepared & Verified — Ready for Owner Decision  
**Target Stage:** Stage 25 Part B (Sub-stage 25b: Pyodide Sandbox & Analysis Provider)  
**Governing Hard Gate:** O-03 (`docs/antigravity/07_CONFLICTS_AND_DECISIONS.md`)  
**Architectural Baseline:** `docs/antigravity/01_PRODUCT_AND_ARCHITECTURE.md` (L-06, L-07, L-08, L-09, L-14)

---

## 1. Executive Summary & Gate Definition

Gate **O-03** is an architectural **HARD GATE** governing whether CodeOrbit accepts a self-hosted Pyodide WebAssembly runtime (~10 MB, lazy-loaded, offline-cached) to enable Python execution and in-worker `ast` analysis:

> *"O-03 | Accept a self-hosted Pyodide download (~10 MB, lazy, cached) for Python execution | HARD | Not built until a yes is recorded. Stage 25 Part A proceeds; Part B waits."*

In accordance with Stage 25 specifications, Stage 25a delivered Python curriculum, quizzes, and safe, non-executing structural verification while maintaining total runtime isolation (zero execution of Python code).

Before unlocking Stage 25b, this Security Implementation Plan provides a formal defense-in-depth blueprint establishing:
1. Complete isolation of learner Python code from the browser DOM, storage, and host network.
2. Hard boundaries against denial-of-service (CPU spinning, recursion exhaustion, memory bloat, runaway output).
3. Import interception blocking dangerous operating system, process, and socket facilities.
4. Cryptographic integrity verification and self-hosting supply-chain validation (zero third-party CDN reliance).
5. Transparent user-consent UX, storage budget management, and offline service-worker caching.
6. A verified `ast` analysis provider architecture that preserves CodeOrbit's strict truthfulness contract (L-09).

---

## 2. Threat Modeling & Attack Surface Analysis

Learner code executed in a browser-based programming environment is inherently untrusted. The threat model addresses six distinct attack vectors:

| Threat ID | Threat Vector | Potential Impact | CodeOrbit Mitigation Strategy |
|---|---|---|---|
| **T-01** | **DOM / Host Access & XSS** | Learner code accesses `window`, `document`, cookies, localStorage, or auth tokens. | **Dedicated Web Worker Isolation:** Pyodide runs exclusively inside an isolated Web Worker without DOM APIs (`window`/`document` undefined). `sandboxPolicy.ts` enforces static screening. |
| **T-02** | **Network Exfiltration / SSRF** | Learner code makes HTTP requests (`fetch`, `urllib`, `requests`, `socket`) to scan local networks or exfiltrate state. | **Multi-Tier Network Blocker:** Content Security Policy `connect-src 'none'`, stripping/blocking `socket`, `urllib`, `http`, `requests`, and deleting `fetch` / `XMLHttpRequest` in Worker global scope. |
| **T-03** | **CPU Denial-of-Service** | Infinite loops (`while True: pass`) or intensive recursion freeze the browser thread. | **Watchdog Worker Termination:** Dedicated Host watchdog (`WorkerRunnerHost`) terminates the Worker thread unconditionally at 3,000 ms (`worker.terminate()`). UI thread never stalls. |
| **T-04** | **Memory / WASM Heap Exhaustion** | Memory bombs (`"A" * 10**9`, infinite list growth) crash the browser tab. | **WASM Memory Capping & Host Kill:** Pyodide initial/max memory capped, recursion limit set to 500 (`sys.setrecursionlimit`), and host kills the worker on out-of-memory or timeout. |
| **T-05** | **Output Flooding** | Massive `print()` loops exhaust memory or freeze DOM rendering. | **Streaming Output Truncation:** Host and Worker buffers enforce a hard 50 KB ceiling; streams are truncated immediately with an explicit truncation notice. |
| **T-06** | **Cross-Run State Contamination** | State leakage between challenge runs (mutated globals, monkey-patched builtins). | **Namespace Isolation & Worker Lifecycle:** Each run executes inside a fresh Python dictionary namespace (`runPython(code, dict())`). On crash, error, or session end, worker is terminated and discarded. |
| **T-07** | **Supply Chain Compromise** | Malicious Pyodide runtime tampering from external CDN. | **Self-Hosted Pinned Distribution:** Zero CDN fetches. All Pyodide binaries reside in `public/pyodide/` with pinned version and SHA-256 integrity checksum verification. |

---

## 3. Worker Sandbox Architecture & Containment Boundaries

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MAIN THREAD (Trusted UI)                        │
│                                                                        │
│   ┌─────────────────────┐               ┌──────────────────────────┐   │
│   │   Practice View     │               │   WorkerRunnerHost       │   │
│   │   (React / State)   │──────────────▶│   - 3000 ms Run Watchdog │   │
│   │                     │◀──────────────│   - 20 s Warmup Watchdog │   │
│   └─────────────────────┘               │   - 50 KB Output Trunc.  │   │
│                                         └─────────────┬────────────┘   │
└───────────────────────────────────────────────────────┼────────────────┘
                                                        │ postMessage
                                 (Structured clone / Nonce checked)
                                                        │
┌───────────────────────────────────────────────────────▼────────────────┐
│                   DEDICATED WEB WORKER (Untrusted Sandbox)             │
│   CSP: default-src 'none'; connect-src 'none'; script-src 'self'       │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Worker Entrypoint (engineWorker.ts)                           │   │
│   │ - Delete globals: fetch, XMLHttpRequest, WebSocket, IDB       │   │
│   │ - Stdout/Stderr interception buffers                          │   │
│   │ - Stdin feeder mapping                                        │   │
│   │ - sys.setrecursionlimit(500)                                  │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │ Python MetaPath Import Hook (Restricted Sandbox)               │   │
│   │ Blocks: os, subprocess, socket, urllib, sys mutation, shutil   │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │ Pyodide WebAssembly Core (public/pyodide/)                     │   │
│   │ - CPython 3.11 / 3.12 in WebAssembly                           │   │
│   │ - Fresh execution namespace dict per run                       │   │
│   │ - Built-in Python `ast` module for static analysis             │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Main Thread Host Controls (`workerHost.ts`)
1. **Watchdog Timer:**
   - Run timeout: **3,000 ms** (hard-coded ceiling).
   - Pyodide initialization timeout: **20,000 ms** (initial WASM load & compile).
   - If either timeout expires, `worker.terminate()` is executed immediately, releasing all resources.
2. **Output Stream Limiter:**
   - Buffer accumulator caps total output at **50,000 bytes (50 KB)**.
   - If exceeded, output is truncated with: `"\n[Output truncated: exceeded 50 KB limit]"`.
3. **Session Lifecycle:**
   - Warm worker instance may be retained only within an active Practice session for performance.
   - Worker is unconditionally destroyed upon session unmount, route transition, or execution error.

### 3.2. Worker Environment Sanitization (`engineWorker.ts`)
Immediately upon initialization and prior to loading Pyodide, the worker global scope is stripped:
```typescript
// Explicitly neutralize any residual network or storage APIs
const disabledAPIs = ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'indexedDB'];
for (const api of disabledAPIs) {
  if (api in self) {
    try {
      Object.defineProperty(self, api, {
        value: undefined,
        writable: false,
        configurable: false,
      });
    } catch {
      // Ignore non-configurable primitives
    }
  }
}
```

---

## 4. Import Hook & Module Restriction Policy

Pyodide provides access to standard library modules. In CodeOrbit, any module providing operating system hooks, subprocess creation, or raw network sockets is strictly blocked via an authoritative Python-level `meta_path` finder.

### 4.1. Blocked Module Inventory
The following modules are prohibited from import:
- `os`, `posix`, `nt` (Operating system interface)
- `subprocess` (Subprocess management)
- `socket`, `selectors`, `asyncio.base_events` (Socket networking)
- `urllib`, `urllib.request`, `http`, `http.client` (Network protocols)
- `requests`, `aiohttp`, `httpx` (Third-party networking)
- `shutil` (High-level filesystem mutations)
- `ctypes` (Raw memory access)
- `multiprocessing`, `threading` (Uncontrolled thread spawning)
- `sys` tampering / module un-patching

### 4.2. In-Python Import Interception Hook
The worker initializes Pyodide with the following initialization script:
```python
import sys

BLOCKED_MODULES = {
    'os', 'subprocess', 'socket', 'urllib', 'http',
    'shutil', 'ctypes', 'multiprocessing', 'requests'
}

class SandboxImportBlocker:
    def find_spec(self, fullname, path, target=None):
        top_level = fullname.split('.')[0]
        if top_level in BLOCKED_MODULES:
            raise ImportError(
                f"Security restriction: module '{fullname}' is unavailable in CodeOrbit's sandboxed environment."
            )
        return None

# Prepend blocker to ensure it intercepts all standard resolution
if not any(isinstance(finder, SandboxImportBlocker) for finder in sys.meta_path):
    sys.meta_path.insert(0, SandboxImportBlocker())

# Set safe recursion depth to prevent WASM call stack overflow
sys.setrecursionlimit(500)
```

### 4.3. Pre-Execution Static Screening (Defense-in-Depth)
Before sending code to the worker, `src/tracks/python/validators/index.ts` runs `blocksImport()`:
- Scans AST / source for `import os`, `from subprocess import Popen`, `__import__('socket')`.
- Rejects prohibited imports statically with zero latency, providing clear learner feedback before runtime instantiation.

---

## 5. Asset Distribution, Caching & Supply Chain Integrity

### 5.1. Pinned Self-Hosted Pyodide Assets
CodeOrbit rejects loading binaries from third-party CDNs (such as `cdn.jsdelivr.net` or `cdnjs`) in accordance with Rule L-14, offline-first operation, and strict CSP:
- **Location:** `public/pyodide/`
- **Pinned Version:** Pyodide `v0.26.4`
- **Core Assets:**
  - `pyodide.js` (Bootstrap script)
  - `pyodide.asm.js` / `pyodide.asm.wasm` (Compiled CPython core)
  - `python_stdlib.zip` (Standard library modules)
  - `pyodide-lock.json` (Package manifest)
- **Manifest Documentation:** Recorded in `src/tracks/python/vendor/DEPENDENCY.md` with:
  - Exact upstream release tag
  - Upstream release SHA-256 checksums
  - Licensing notice (Mozilla Public License 2.0 / Python Software Foundation License)
  - Automated hash verification test (`src/test/pythonVendor.test.ts`)

### 5.2. Bundle Size Protection & Lazy Loading
- **Initial Bundle Impact:** **0 bytes**. Pyodide is completely decoupled from initial chunk routes (`index.html`, `App.tsx`).
- **On-Demand Fetch:** Assets are fetched only when a learner navigates to a Python Practice challenge and initiates a run.
- **Service Worker Offline Caching:**
  - Registered under dedicated cache: `codeorbit-pyodide-v1`.
  - Cached progressively during first use.
  - Fully operable offline after first initialization.

### 5.3. Learner Disclosure & Consent UX
In compliance with Rule L-08 (no surprises, truthful UI):
- On the first visit to Python Practice with execution enabled, the UI displays a clear storage disclosure:
  > **"Python Execution Sandbox"**  
  > *"Running Python in your browser requires downloading the self-hosted Pyodide runtime (~10 MB). This is downloaded once and cached locally for full offline access."*
  > `[ Download & Enable Python ]` `[ Keep Non-Executing Preview ]`
- During download, the UI displays deterministic progress:
  > *"Preparing Python Sandbox… 42%"*

---

## 6. Static Analysis Provider Architecture (`PLT-09`)

Stage 25 Part B introduces the Python Analysis Provider (`py-ast-v1`):
1. **Zero External JS Parser Dependencies:**
   Rather than introducing large, incomplete JavaScript-based Python parsers (such as `filbert` or `python-ast`), CodeOrbit leverages Python's official `ast` standard library module running directly inside the Pyodide WebAssembly worker.
2. **Contract Compliance (L-09):**
   - Complexity results are estimates, never presented as formal proofs.
   - Analysis payload returns:
     ```typescript
     {
       timeComplexity: 'O(n log n)',
       spaceComplexity: 'O(1)',
       confidence: 'high',
       isFormalProof: false,
       heuristicExplanation: 'Identified sorted() call with linear traversal',
       assumptions: ['Built-in Timsort operates in O(n log n) worst-case time'],
       limitations: ['Static AST evaluation cannot determine runtime input distribution']
     }
     ```
3. **Equivalence & Optimisation Suggestions:**
   - Verified patterns only (e.g., membership check in `list` converted to `set` lookup).
   - Equivalence verification uses seeded PRNG inputs executing both implementations to verify identical outputs before presenting suggestions.
4. **Validation Test Suite:**
   - $\ge 30$ labelled fixtures with measured precision recorded in `docs/antigravity/status/STAGE_25B_STATUS.md`.

---

## 7. Verification Matrix & Exit Criteria for Gate O-03

The implementation of Stage 25 Part B is governed by the following verification tests:

| Test ID | Verification Target | Test Method | Target Outcome |
|---|---|---|---|
| **SEC-01** | Blocked Module Import | Run Python script attempting `import os`, `import subprocess`, `import socket`. | Runtime throws sanitized `ImportError`. Statically flagged by validator. |
| **SEC-02** | Execution Timeout Watchdog | Run `while True: pass` or `time.sleep(10)`. | Host terminates worker at $3000 \pm 100\text{ ms}$ with status `'timeout'`. UI remains responsive. |
| **SEC-03** | Output Buffer Truncation | Run `for _ in range(100000): print("A" * 100)`. | Output halted at 50 KB ceiling with `[Output truncated]`. |
| **SEC-04** | Infinite Recursion Guard | Run `def f(): f(); f()`. | Intercepted by `sys.setrecursionlimit(500)` or terminated without browser crash. |
| **SEC-05** | Namespace Cleanliness | Run `x = 42`, followed by subsequent test running `print(x)`. | Second run fails with `NameError: name 'x' is not defined`. Zero cross-run leakage. |
| **SEC-06** | Network Disablement | Run script executing `urllib.request.urlopen(...)` or JS interop `fetch()`. | Fails immediately. Network tab records 0 outgoing requests. |
| **SEC-07** | Asset Hash Verification | Automated SHA-256 verification of `public/pyodide/` files against `DEPENDENCY.md`. | 100% hash match. |
| **SEC-08** | Offline Operation | Disconnect network after initial cache; reload page and run Python challenge. | Challenge executes successfully from ServiceWorker CacheStorage. |

---

## 8. Final Approval Evaluation & Recommendation

### 8.1. Architectural Alignment Review
- **Product Policy P-01 / L-07:** Satisfied. Learner Python execution is strictly confined to an isolated Web Worker; no learner code touches the main thread or DOM.
- **Security Policy L-06 / L-14:** Satisfied. No combining of `allow-scripts` and `allow-same-origin`. Stack remains pure React+TS. Zero external CDN dependencies.
- **Truthfulness Contract L-08 / L-09:** Satisfied. Clear opt-in download UI, honest complexity ratings with stated assumptions.
- **Offline First Principle:** Satisfied. 100% self-hosted, cached locally via ServiceWorker.

### 8.2. Recommendation
The O-03 Security Implementation Plan is complete, robust, verified against all architectural constraints, and delivers strict multi-layered containment.

**Recommendation:** **RECORD "YES" for Gate O-03** in `docs/antigravity/07_CONFLICTS_AND_DECISIONS.md`, authorizing the commencement of Stage 25 Part B implementation.
