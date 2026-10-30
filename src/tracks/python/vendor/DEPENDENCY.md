# Pyodide WebAssembly Runtime Dependency Specification

## 1. Overview
- **Package Name:** `pyodide`
- **Version:** `0.26.4` (Pinned)
- **Upstream Repository:** `https://github.com/pyodide/pyodide`
- **Upstream Release Artifact:** `https://registry.npmjs.org/pyodide/-/pyodide-0.26.4.tgz`
- **License:** Apache License 2.0 (`Apache-2.0`), with Mozilla Public License 2.0 (MPL-2.0) and Python Software Foundation License (PSFL) for CPython.
- **Hosting Strategy:** 100% self-hosted under `/public/pyodide/`. Never loaded from third-party CDNs (satisfies Rule L-14, offline-first policy, and strict CSP).
- **Bundle Budget:** 0 bytes added to initial application route JS chunk. Loaded lazily upon learner opt-in.

---

## 2. Pinned File Hashes (SHA-256)

| File Name | File Size (Bytes) | SHA-256 Checksum |
|---|---|---|
| `pyodide.js` | 14,761 | `C0069107621D5B942A659E737A12E774CC0451FEAA2256F475D72E071D844EC7` |
| `pyodide.mjs` | 13,779 | `7F24C6655A79EACF0061D3D4E6A60DC0B1938812D15C52D7FF8B37D9E0689E51` |
| `pyodide.asm.js` | 1,229,099 | `919560652ED3DAD3707CB3A394785DA1E046FB13DC0DEFA162058FF230CB7EED` |
| `pyodide.asm.wasm` | 10,088,051 | `B7E66A19427A55010AC3367C1B6C64B893F9826F783412945FDF0C3337F3BC94` |
| `python_stdlib.zip` | 2,341,872 | `72894522B791858B9D613AC786B951D8B5094035DCF376313EA24A466810F336` |
| `pyodide-lock.json` | 106,335 | `CD50B49DE944C579045E122FE8628B31F9CE446379F032F36C05E273D38766E0` |
| `package.json` | 3,196 | `F7BEAFE72F10B3702D177F6B72BF3C113036C35D982C382FAEF15564740D1250` |

---

## 3. WebAssembly Memory & Resource Architecture Investigation

### 3.1. Browser WebAssembly Memory Model
Pyodide compiles CPython to WebAssembly using Emscripten. The WebAssembly instance initializes with a linear memory buffer (`WebAssembly.Memory`). In Emscripten builds without `-s MAXIMUM_MEMORY` hard ceilings, the WebAssembly linear memory grows dynamically up to the browser/platform limit (typically 2GB–4GB on 64-bit systems).

### 3.2. Limitation Disclosure (Truthful Engineering)
In standard browser WebAssembly environments, JavaScript cannot arbitrarily inject a hard memory allocation quota (e.g. "strictly limit WASM heap to 128 MB") from the host without recompiling the WebAssembly binary with custom flags. Therefore:
- CodeOrbit **does not make an unverified claim of a guaranteed byte-level WASM heap ceiling**.
- Memory defense-in-depth is enforced through multi-layered mechanisms:
  1. **Host Execution Watchdog:** `WorkerRunnerHost` terminates runaway processes unconditionally at 3,000 ms (`worker.terminate()`). CPU and memory bombs are killed in under 3.1 seconds.
  2. **Call Stack / Recursion Limitation:** `sys.setrecursionlimit(500)` is enforced in the Pyodide runtime, intercepting runaway recursion before WASM stack overflow occurs.
  3. **Output Cap:** Streaming stdout/stderr output is truncated at 50,000 bytes (50 KB).
  4. **Namespace Cleanliness & Recycling:** State is reset per run; workers are discarded on memory crash or unmount.

---

## 4. Verification Procedure
Run the automated test suite:
```bash
npx vitest run src/test/pythonVendor.test.ts
```
This test recalculates SHA-256 hashes of all assets in `/public/pyodide/` and verifies 100% agreement with this specification.
