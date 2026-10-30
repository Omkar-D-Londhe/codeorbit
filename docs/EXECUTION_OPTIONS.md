# Decision Memo: Java and C++ Execution Strategy (Gate O-04)

**Document:** `docs/EXECUTION_OPTIONS.md`  
**Governing Gate:** Hard Gate O-04 (`docs/antigravity/07_CONFLICTS_AND_DECISIONS.md`)  
**Stage:** Stage 26 — Java and C++ tracks (decision-gated execution)  
**Status:** **GATED / OPEN** — Code execution is disabled. Only static analysis and structural validation are active.

---

## 1. Executive Summary

Stage 26 introduces comprehensive Java and C++ learning tracks into CodeOrbit, featuring full curriculum (lessons, quizzes, practice challenges), CodeMirror language support, deterministic structural validation, and static AST-based complexity estimation.

Per architectural rule **L-06** ("no arbitrary code execution outside Web Workers / WebAssembly") and Hard Gate **O-04**, execution of compiled languages (Java and C++) requires explicit architectural authorization from the repository owner. This memo outlines the three available technical options, evaluates their trade-offs, and provides an actionable recommendation.

---

## 2. Technical Evaluation of Execution Strategies

### Option A: In-Browser WebAssembly Toolchains

- **Mechanism:**
  - **Java:** In-browser JVM compiled to WebAssembly (e.g. CheerRP, TeaVM, or DoppioVM) downloading a headless JVM and JRE class library into the browser.
  - **C++:** In-browser Clang/LLVM WebAssembly compiler (e.g. clang.wasm) that compiles C++ to a WebAssembly binary inside a Web Worker, which is then dynamically instantiated and run.
- **Security Profile:**
  - Runs entirely client-side within browser sandbox boundaries and dedicated Web Workers.
  - Inherits standard WebAssembly isolation; zero server attack surface.
- **Resource, Performance & Licensing Impact:**
  - **Bundle & Storage:** Exceptionally heavy. Clang/LLVM WASM typically exceeds 35 MB to 60 MB. A headless JVM/JRE distribution ranges from 25 MB to 50 MB.
  - **Startup Latency:** Cold compilation of even a basic "Hello World" in browser Clang/WASM can take 4–12 seconds on mobile/mid-range hardware.
  - **Licensing:** Complex mixed licenses across LLVM, GNU C++ libstdc++ (GPL with Runtime Exception), and JVM class libraries.
  - **Offline Usability:** Feasible once cached via Service Worker, but requires massive initial client-side cache allocation (>80 MB combined).

---

### Option B: Hosted Remote Sandboxed Execution Service

- **Mechanism:**
  - CodeOrbit frontend dispatches learner source code via HTTPS POST to a backend container execution runner (e.g. Docker / gVisor / Firecracker microVM running OpenJDK and GCC/Clang).
  - Backend compiles, runs against test harnesses with resource limits (CPU/RAM/time), and returns stdout/stderr/results JSON.
- **Security Profile:**
  - Isolates execution entirely from the learner's browser.
  - Introduces substantial server-side attack surface (container breakouts, fork bombs, network exfiltration, denial-of-service).
- **Resource, Architectural & Policy Impact:**
  - **Violates Rule L-08 & L-14:** CodeOrbit is architected as an offline-first, client-only PWA requiring zero external backend services.
  - **Operating Cost & Maintenance:** Requires standing cloud compute infrastructure, authentication, API rate-limiting, and 24/7 server monitoring.
  - **Offline Failure:** Completely non-functional when learner is offline or on airplane mode.

---

### Option C: Editor + Deterministic Structural Validation & Static Complexity Analysis (Recommended Default)

- **Mechanism:**
  - The CodeOrbit frontend provides full CodeMirror syntax highlighting, rich curriculum, and interactive challenges.
  - Challenges are verified via deterministic, multi-layer static AST and token rules (checking class declarations, method signatures, control flow, loops, pointer/reference semantics, and recursion).
  - Asymptotic complexity is estimated using lightweight Lezer AST parsers (`@lezer/java` and `@lezer/cpp`) without attempting compilation or execution.
  - UI displays an honest **Structure Preview** pane explaining: *"Structure check mode — your code is inspected using static structural rules. Code execution is not active."* No misleading "Run" button is presented.
- **Security Profile:**
  - 100% client-side, zero execution risk, zero privilege escalation vectors, zero server-side attack surface.
- **Resource, Architectural & Policy Impact:**
  - **Bundle Impact:** Lightweight (~15–20 kB per grammar, dynamically code-split). Zero impact on initial page load.
  - **Offline Usability:** 100% offline-ready out of the box with zero runtime downloads.
  - **Truthfulness (L-09):** Fully transparent to the learner; avoids deceptive or broken compiler simulations.

---

## 3. Comparison Matrix

| Evaluation Dimension | Option A (In-Browser WASM) | Option B (Hosted Sandbox) | Option C (Static Analysis Only) |
|---|---|---|---|
| **Architectural Alignment (L-08, L-14)** | Partial (offline-capable but massive assets) | **Fails** (requires standing backend) | **Strictly Aligned** (offline-first PWA) |
| **Execution Reality** | Genuine in-browser compilation/execution | Genuine native server execution | Non-executing structural grading |
| **Download / Storage Footprint** | Very High (60–100+ MB combined) | Zero client footprint | **Minimal (< 40 kB code-split)** |
| **Offline Usability** | Yes (after massive precache) | **No** (offline fails completely) | **Yes (100% offline-native)** |
| **Cold Start / Execution Speed** | Slow (4–12 s compilation in browser) | Fast (network latency + 200 ms) | **Instantaneous (< 15 ms AST check)** |
| **Hosting Cost / Complexity** | Zero server cost | Ongoing cloud compute cost | **Zero server cost** |
| **Security Risk Profile** | Low (WASM sandbox) | High (server container isolation) | **Zero (no code executed)** |

---

## 4. Formal Recommendation

**Recommendation:** Maintain **Option C** as the production default for Stage 26.

1. Deliver Java and C++ tracks with availability `preview`, offering lessons, quizzes, practice challenges with structural grading, and static Lezer AST complexity estimation.
2. Clearly distinguish static validation from compiler execution in all learner-facing copy.
3. Keep Hard Gate **O-04** visibly marked as **GATED / PENDING OWNER DECISION** until the repository owner explicitly chooses to commission either Option A (via a dedicated security and bundle review) or Option B (if an external backend architecture is formally introduced).

---

## 5. Angular Execution Strategy (Gate O-05 — Stage 27)

**Governing Gate:** Hard Gate O-05 (`docs/antigravity/07_CONFLICTS_AND_DECISIONS.md`)  
**Status:** **GATED / OPEN** — Practice code execution is disabled pending repository owner approval.  
**Dedicated Memo:** [`docs/ANGULAR_OPTIONS.md`](./ANGULAR_OPTIONS.md)

Stage 27 introduces the Angular track in the honest `availability: 'decision-gated'` state with capabilities `['lessons', 'quizzes']`. Practice execution is gated under Gate O-05.
- Option (a) Precompiled curated component gallery in Stage 23 script-enabled sandbox (~155 kB gzip).
- Option (b) In-browser compile via `@angular/compiler` (5.04 MB unpacked) + `typescript` (2.50 MB unpacked) requiring > 11.75 MB uncompressed and `'unsafe-eval'` CSP relaxation.
- Option (c) Keep planned / decision-gated (zero bundle bloat, 100% offline-ready, no fake compiler).

**Recommendation:** Maintain Option (c) (keep Gate O-05 unapproved) and ship read-only lessons, quizzes, and concept mappings. Refer to `docs/ANGULAR_OPTIONS.md` for complete measured bundle analyses.
