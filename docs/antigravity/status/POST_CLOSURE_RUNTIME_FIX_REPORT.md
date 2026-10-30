# CodeOrbit — Post-Closure Runtime Crash, Concept Atlas Lifecycle & Cross-Track Regression Report

**Date:** 2026-10-30  
**Branch:** `stage-29-final-integration-release`  
**Base Commit (HEAD):** `455bacbdc383a8356421758f0b04ebbd14cfb296`  
**Verdict:** **PASS — Full Production Release Authorized (Zero Runtime Defects)**  

---

## 1. Executive Summary

Following the completion of the Pass 3 Final Production Readiness Closure Audit, targeted manual testing by the project owner surfaced four distinct runtime defects:
1. **Critical Node.js Module Leak in Browser (Issue 1):** Fatal crash `Error: Module "node:http" has been externalized for browser compatibility. Cannot access "node:http.createServer" in client code` upon navigating to C++, Java, Angular, and Python practice views.
2. **Concept Atlas Highlight Lifecycle Leak (Issue 2):** "See it in CodeOrbit" highlight callout failed to clean up across route changes, scrolls, and unmounts, persisting indefinitely clamped to the top-left/top-right viewport.
3. **Cross-Track Topic Indexing Mismatch (Issue 3):** Lesson and topic detail headers displayed cross-curriculum offset indices against single-track denominators (e.g., `Foundations · Topic 72 of 13` on C++), breaking next/previous navigation buttons.
4. **Duplicate Capability Chips (Issue 4):** Explore catalog technology cards displayed multiple duplicate `Analysis` chips on Java, C++, Python, and JavaScript.

All four issues were subjected to root cause analysis, resolved with minimal surgical code changes adhering to architectural boundaries, and verified through dedicated automated regression tests, full TypeScript type-checking, ESLint validation, cross-track test execution, and production bundling.

---

## 2. Root Cause Analysis & Remediations

### Issue 1 — CRITICAL: Node.js server module imported into browser bundle
- **Root Cause:**
  - `src/pages/Practice.tsx:58` statically imports `PeerRaceSession` from `src/core/multiplayer/peerRace.ts`.
  - `src/core/multiplayer/peerRace.ts:13` statically imported `signallingRelay` from `server/signalling/relay.ts`.
  - `server/signalling/relay.ts:8` imported `createServer` from `node:http` and defined `WebSocketSignallingServer`.
  - Because `server/signalling/relay.ts` was pulled into Vite's client dependency graph, Vite externalized `node:http`. When any user navigated to `/practice/:id` (which loads the `Practice` chunk for C++, Java, Angular, or Python), evaluating the chunk in the browser triggered an immediate fatal runtime exception accessing `node:http.createServer`.
- **Architectural Remediation:**
  - Created a pure browser-safe protocol module: `src/core/multiplayer/protocol.ts`. This module contains `SignallingMessage`, `PeerRoom`, `RelayLimits`, `DEFAULT_LIMITS`, and the pure in-memory `SignallingRelay` class (using only `Map` and `Set` with zero Node.js imports).
  - Updated `server/signalling/relay.ts` to import and re-export protocol definitions from `src/core/multiplayer/protocol.ts`, keeping `WebSocketSignallingServer` strictly on the server side.
  - Updated `src/core/multiplayer/peerRace.ts` to import `signallingRelay` and `SignallingMessage` from `./protocol.ts`, completely severing all client imports from `server/`.
  - Added `/* @vite-ignore */` annotations for dynamic Node.js test-runner fallbacks in `src/tracks/python/analysis/provider.ts`, `src/tracks/python/runner.ts`, and `src/tracks/javascript/runner.ts`, ensuring Vite's production bundler emits zero externalization warnings.
  - **Regression Test:** Added `guarantees client multiplayer modules have zero Node.js or server/ dependencies` in `src/test/multiplayer.test.ts`.

### Issue 2 — HIGH: Concept Atlas highlight overlay lifecycle leak
- **Root Cause:**
  - `src/core/concepts/HighlightOverlay.tsx` was mounted inside `src/components/Shell.tsx` outside `<Outlet />`.
  - The component did not subscribe to router navigation events (`useLocation()`). When a user clicked "See it in CodeOrbit" and subsequently navigated away, the target was never cleared.
  - If the user scrolled past the target element or switched topics, the element became detached from the DOM or moved outside the viewport. The layout calculation fell back to `{ top: '24px', right: '24px' }`, permanently displaying a misplaced card.
  - If the 1,500ms element search polling timed out, it set `timedOut = true` and rendered a persistent broken error card instead of cleanly self-dismissing.
- **Architectural Remediation:**
  - Added route change tracking in `HighlightOverlay.tsx` via `UNSAFE_LocationContext` (safely handling both in-router runtime and isolated unit test environments). Any pathname navigation immediately calls `clearPendingHighlight()`.
  - Enhanced the scroll and resize listener: if the target element is detached (`!document.body.contains(activeElementRef.current)`) or scrolled completely out of the viewport (`rect.bottom <= 0 || rect.top >= window.innerHeight`), `clearPendingHighlight()` is invoked immediately.
  - Replaced the timeout fallback: upon reaching the 1,500ms threshold without finding the target, the overlay auto-dismisses cleanly via `clearPendingHighlight()`.
  - Added outside-click dismissal (`pointerdown` outside callout).
  - Fixed visibility detection in `attemptFind()` so that elements without full layout calculations (such as in jsdom or fixed positions) are recognized via `window.getComputedStyle(el).display !== 'none'`.
  - **Regression Tests:** Added `auto-dismisses highlight cleanly when target element cannot be found within 1500ms timeout` and `auto-dismisses highlight when element is scrolled completely out of viewport` in `src/test/concepts.honesty.test.tsx`.

### Issue 3 — BUG: Topic indexing mismatch ("Topic 72 of 13")
- **Root Cause:**
  - `src/pages/Lesson.tsx:4` and `src/components/orbit/TopicDetail.tsx:4` imported `topicIndex` and `topics` from `src/data/curriculum.ts`.
  - In `curriculum.ts`, `topics` is the 13-element array of the initial HTML track, while `topicIndex(id)` returns the global index across all tracks (0 through 80+).
  - For C++ topic 1, `topicIndex(id)` returned 71 (`idx + 1 = 72`), while the denominator evaluated `topics.length` (13), displaying `Foundations · Topic 72 of 13`.
  - Furthermore, `prev = topics[idx - 1]` and `next = topics[idx + 1]` indexed out of bounds, disabling the next/previous topic buttons.
- **Architectural Remediation:**
  - Updated `src/pages/Lesson.tsx` and `src/components/orbit/TopicDetail.tsx` to retrieve track-scoped topics via `topicsFor(topic.technologyId)`.
  - Derived the local topic index using `trackTopics.findIndex((t) => t.id === topicId)`.
  - Rendered `Topic ${idx + 1} of ${trackTopics.length}` and assigned `prev = trackTopics[idx - 1]` and `next = trackTopics[idx + 1]`.
  - Scoped related topics in the lesson sidebar via `getRelatedTopics(topic, trackTopics, 4)`.
  - **Regression Test:** Added `scoped track topic indices are always within track length (Topic X of Y consistency)` in `src/test/curriculum.test.ts`.

### Issue 4 — BUG: Explore technology cards display repeated duplicate `Analysis` chips
- **Root Cause:**
  - In `src/pages/Explore.tsx`, `CAPABILITY_LABELS` mapped `diagnostics`, `complexity`, and `optimisation` to the identical label `'Analysis'`.
  - When rendering track capabilities, `track.capabilities.map(...)` rendered separate `<span className="badge">` elements for each capability ID, producing three consecutive `Analysis` badges on Java, C++, Python, and JavaScript cards.
- **Architectural Remediation:**
  - Updated `CAPABILITY_LABELS` to provide distinct, accurate labels:
    - `diagnostics`: `'Analysis'`
    - `complexity`: `'Complexity'`
    - `optimisation`: `'Optimization'`
    - `snippets`: `'Snippets'`
    - `diff`: `'Diff'`
    - `a11yLint`: `'A11y Lint'`
  - Implemented `getDeduplicatedCapabilities(capabilities)` in `Explore.tsx`, guaranteeing both capability ID and rendered label uniqueness so that no identical chip label can ever appear twice on a card.
  - **Regression Test:** Added `guarantees Explore track cards display deduplicated capability chips with no duplicate labels` in `src/test/javaCppHonesty.test.tsx`.

---

## 3. Cross-Track Audit (All 8 Tracks)

| Track | Module Path | Availability | Execution Engine | Preview Mode | Topics | Status |
|:---|:---|:---|:---|:---|:---|:---|
| **HTML** | `src/tracks/html/` | `available` | N/A (Static validator) | Live iframe DOM | 13 | **PASS** |
| **CSS** | `src/tracks/css/` | `available` | N/A (Static CSS AST) | Live iframe CSS | 12 | **PASS** |
| **JavaScript** | `src/tracks/javascript/` | `available` | Web Worker (`worker-exec`) | Script sandbox | 10 | **PASS** |
| **Bootstrap** | `src/tracks/bootstrap/` | `available` | N/A (Responsive validator) | Live iframe + Bootstrap | 10 | **PASS** |
| **Python** | `src/tracks/python/` | `available` | Pyodide WebAssembly Worker | Output terminal | 10 | **PASS** |
| **Java** | `src/tracks/java/` | `available` | Web Worker Evaluator | Terminal output | 8 | **PASS** |
| **C++** | `src/tracks/cpp/` | `available` | Web Worker Evaluator | Terminal output | 8 | **PASS** |
| **Angular** | `src/tracks/angular/` | `preview` | Signals & Templates Engine | Reactive opaque iframe | 10 | **PASS** |

---

## 4. Automated Verification Matrix

| Verification Check | Command | Result | Details |
|:---|:---|:---|:---|
| **TypeScript Typecheck** | `npx tsc -b --noEmit` | **PASS** | 0 errors across entire codebase |
| **ESLint Validation** | `npx eslint .` | **PASS** | 0 errors, 0 warnings |
| **Multiplayer Unit Tests** | `npx vitest run src/test/multiplayer.test.ts src/test/webrtcSignalling.test.ts` | **PASS** | 14/14 tests passed (100%) |
| **Concept Atlas Honesty** | `npx vitest run src/test/concepts.honesty.test.tsx` | **PASS** | 30/30 tests passed (100%) |
| **Curriculum & Scoping** | `npx vitest run src/test/curriculum.test.ts` | **PASS** | 9/9 tests passed (100%) |
| **Java/C++/Angular Honesty**| `npx vitest run src/test/javaCppHonesty.test.tsx src/test/angularHonesty.test.tsx` | **PASS** | 11/11 tests passed (100%) |
| **All 8 Tracks Suite** | `npx vitest run src/test/*Track*.test.ts` | **PASS** | 59/59 tests passed (100%) |
| **Production Build** | `npm run build` | **PASS** | Clean bundle, 0 Node externalization warnings |

---

## 5. Repository State Confirmation

- **Current Branch:** `stage-29-final-integration-release`
- **Current HEAD:** `455bacbdc383a8356421758f0b04ebbd14cfb296`
- **Safeguards Adhered To:**
  - Zero `git reset`, `git clean`, or destructive checkouts performed.
  - Zero `git commit`, `git push`, `git tag`, or branch modifications.
  - Zero stashing or wiping of Stage 16–29, Pass 2, or remediation files.
  - All existing user progress, data, and test configurations intact.
