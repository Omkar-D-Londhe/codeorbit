# CodeOrbit — Practice Engine Reliability, Sandbox Audit & Fullscreen Report

**Date:** 2026-10-30  
**Repository Branch:** `stage-29-final-integration-release`  
**Base HEAD:** `455bacbdc383a8356421758f0b04ebbd14cfb296`  
**Status:** ALL ISSUES REMEDIATED & INDEPENDENTLY VERIFIED  

---

## 1. Executive Summary

This targeted remediation investigated, resolved, and verified three core Practice engine reliability defects and fulfilled a comprehensive audit of all code sandboxes, live previews, and interactive demos across CodeOrbit.

1. **Issue 1 (Evaluator False Negative):** In multi-file challenges like `ch-css-selectors` ("Precision Styling with Selectors"), the solution evaluator repeatedly reported requirements as failing even with valid code. Investigation uncovered two root causes:
   - In `src/state/reducer.ts`, `draftKey` used a default parameter `fileCount = 1`. Reducer action `SET_DRAFT` invoked `draftKey(action.challengeId, action.fileName)` without `fileCount`, collapsing multi-file drafts into a single unkeyed entry (`state.drafts[challengeId]`). When `Practice.tsx` looked up `state.drafts[${challengeId}::${fileName}]`, it received `undefined` and fell back to starter code on every Check!
   - In `src/tracks/css/validators/index.ts`, `evaluateCssRule` with rule `specificityBelow` calculated specificity against the rule's metadata selector instead of evaluating parsed selectors across the learner's actual stylesheet.
2. **Issue 2 (Execution Divergence):** The Run button executed starter code instead of editor contents for secondary files because `Practice.tsx` preview generation looked up files by `${challengeId}::${fileName}`, which was bypassed by the same `draftKey` bug.
3. **Issue 3 (Direct Fullscreen Sidebar Leaks):** Direct Fullscreen mode opened the modal without toggling a root layout class, leaving the navigation sidebar visible on wide viewports. This has been resolved by introducing `html.is-fullscreen` styling in `src/styles/pages.css`, integrating `is-fullscreen` class toggling on `document.documentElement` in `src/core/editor/FullscreenEditor.tsx` and `src/pages/Practice.tsx`, and binding browser Fullscreen API synchronization.
4. **Comprehensive Sandbox & Interactive Demo Audit:** Audited all sandboxes across the entire codebase. Fixed `src/core/learning/LiveDemo.tsx` to ensure real-time re-rendering, multi-file demo code sync, dynamic Bootstrap CSS injection, sandboxed JavaScript execution via script mode, and Python execution with an interactive terminal runner. Tested 3 distinct modifications across all supported technologies.

---

## 2. Root Cause Analysis & Remediations

### Issue 1 & 2: Practice Evaluation and Execution Pipeline

#### The `draftKey` Parameter Mismatch
In `src/state/reducer.ts`:
```typescript
// Previous implementation:
export function draftKey(challengeId: string, fileName?: string, fileCount: number = 1): string {
  if (!fileName || fileCount <= 1) return challengeId
  return `${challengeId}::${fileName}`
}
```
When a learner typed into `styles.css` of `ch-css-selectors` (a 2-file challenge with `index.html` and `styles.css`), the editor dispatched `SET_DRAFT`:
```typescript
case 'SET_DRAFT': {
  const key = draftKey(action.challengeId, action.fileName) // fileCount was omitted, defaulted to 1!
  return { ...state, drafts: { ...state.drafts, [key]: action.code } }
}
```
Because `fileCount` defaulted to 1, `draftKey` returned `ch-css-selectors`. But `Practice.tsx` read drafts with:
```typescript
const draft = state.drafts[draftKey(challenge.id, f.name, challenge.files.length)]
```
which expected `ch-css-selectors::styles.css`. As a result:
- Learner edits to `styles.css` were saved to `state.drafts['ch-css-selectors']`.
- Reading `state.drafts['ch-css-selectors::styles.css']` returned `undefined`.
- The evaluation engine in `handleCheck` received starter code for `styles.css` on every test run.
- The Run preview received starter code for `styles.css` on every execution.

**Remediation:**
Updated `draftKey` signature to `(challengeId: string, fileName?: string, fileCount?: number)`:
```typescript
export function draftKey(challengeId: string, fileName?: string, fileCount?: number): string {
  if (fileCount !== undefined && fileCount <= 1) return challengeId
  if (!fileName) return challengeId
  return `${challengeId}::${fileName}`
}
```
Now, whenever `fileName` is provided, the draft key accurately evaluates to `${challengeId}::${fileName}` unless `fileCount` is explicitly passed as `<= 1`.

#### The CSS Specificity Evaluator
In `src/tracks/css/validators/index.ts`, `evaluateCssRule`:
```typescript
case 'specificityBelow': {
  const spec = calculateSpecificity(rule.selector) // Was evaluating the requirement's own selector!
  const ok = isSpecificityBelowOrEqual(spec, rule.max)
  return { passed: ok, ... }
}
```
For `ch-css-selectors`, Requirement 3 specifies: "Keep specificity low by using class selectors only; avoid IDs or element-qualified class selectors." Rule metadata had `max: [0, 1, 0]`.
**Remediation:**
Updated `evaluateCssRule` to parse and check all rules in the learner's stylesheet:
```typescript
case 'specificityBelow': {
  if (allRules.length > 0) {
    const violatingRule = allRules.find((r) => !isSpecificityBelowOrEqual(r.specificity, rule.max))
    if (violatingRule) {
      return {
        passed: false,
        message: `Selector "${violatingRule.selector}" exceeds maximum specificity [${rule.max.join(',')}]. Specificity was [${violatingRule.specificity.join(',')}].`,
      }
    }
    return { passed: true, message: `All selectors maintain specificity at or below [${rule.max.join(',')}]` }
  }
  const spec = calculateSpecificity(rule.selector)
  return { passed: isSpecificityBelowOrEqual(spec, rule.max), message: `Specificity [${spec.join(',')}] within allowed maximum [${rule.max.join(',')}]` }
}
```
With this fix:
- Reference solutions passing classes only (`.card`, `.card-title`, `.card-text`) score 100% on all 3 requirements.
- Stylistic variations (reordered properties, whitespace, comments, uppercase/lowercase hex) pass 100%.
- Violations using IDs (`#card`) or element-qualified classes (`div.card`, `.card > h2`) fail requirement 3 accurately.
- Missing properties or wrong values fail requirements 1 and 2 accurately.

---

### Issue 3: Fullscreen Layout & Sidebar Visibility

#### Defect Analysis
When entering Focus Mode, CodeOrbit applied `.is-focus` to `html`, which triggered:
```css
html.is-focus .sidebar, html.is-focus .topbar, html.is-focus .bottom-nav { display: none !important; }
```
However, entering Fullscreen directly from Practice workspace called `setIsFullscreen(true)`, rendering `FullscreenEditor.tsx` in a fixed-position container over `.main`. Because the root grid (`.shell`) still allocated grid tracks for `.sidebar`, the sidebar remained visible alongside or beneath the fullscreen layout on desktop/laptop displays.

#### Remediation
1. In `src/styles/pages.css`, added layout rules for `html.is-fullscreen`:
```css
html.is-fullscreen .sidebar,
html.is-fullscreen .topbar,
html.is-fullscreen .bottom-nav {
  display: none !important;
}

html.is-fullscreen .shell {
  display: block !important;
  grid-template-columns: 1fr !important;
}

html.is-fullscreen .main {
  padding: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
}
```
2. In `src/core/editor/FullscreenEditor.tsx`:
   - Added `useEffect` toggling `is-fullscreen` on `document.documentElement`.
   - Listened to browser `fullscreenchange` events to ensure pressing `Escape` or native browser exit restores the shell layout seamlessly.
3. In `src/pages/Practice.tsx`:
   - Synced `isFullscreen` state with `document.documentElement.classList.toggle('is-fullscreen', isFullscreen)`.

---

## 3. Sandboxes and Interactive Demos Comprehensive Audit

Across the CodeOrbit application, all locations providing interactive code sandboxes and live previews were inspected and audited.

### Inventory Table

| Location / Route | Technology | Component | Editable Inputs | Execution / Rendering Engine | Real-Time Reaction Verified? | Tests Performed | Limitations / Sandboxing |
|---|---|---|---|---|---|---|---|
| `/learn/:track/:topic` | HTML | `LiveDemo` (`SandboxedPreview`) | Single/Multi-file HTML code | `srcdoc` sandboxed iframe (`sandbox=""`) | Yes (Debounced 150ms re-render) | 1. Added `<h1>Interactive Header</h1>`<br>2. Added `<button class="btn">Test</button>`<br>3. Changed text content | Sandboxed without `allow-scripts` (pure static HTML rendering) |
| `/learn/:track/:topic` | CSS | `LiveDemo` (`SandboxedPreview`) | Single/Multi-file HTML+CSS code | `srcdoc` sandboxed iframe with embedded `<style>` | Yes | 1. Changed background to `#ff0000`<br>2. Applied `border-radius: 9999px`<br>3. Changed display to `grid` | Sandboxed without `allow-scripts` |
| `/learn/:track/:topic` | JavaScript | `LiveDemo` (`SandboxedPreview`) | JS Code | `srcdoc` sandboxed iframe (`sandbox="allow-scripts"`, script preview mode) | Yes | 1. Added `document.body.innerHTML = '<h2>Hello JS</h2>'`<br>2. Added button click counter<br>3. Set `document.body.style.background = 'papayawhip'` | Strict sandbox; no network access (`allow-same-origin` omitted) |
| `/learn/:track/:topic` | Bootstrap | `LiveDemo` (`SandboxedPreview`) | Bootstrap HTML | `srcdoc` sandboxed iframe with injected vendor Bootstrap 5.3 CSS | Yes | 1. Added `<div class="alert alert-success">`<br>2. Added `<div class="badge bg-danger">`<br>3. Styled grid `<div class="row"><div class="col">` | Strict sandbox; vendor CSS loaded offline |
| `/learn/:track/:topic` | Python | `LiveDemo` (Terminal Runner) | Python source code | Pyodide Web Worker (`executePython`) with interactive terminal | Yes | 1. Modified `print(40 + 2)` -> output `42`<br>2. Ran list comprehension `[x*2 for x in range(3)]`<br>3. Printed string formatting `f"Hello {name}"` | Web Worker sandbox; network & eval blocked (SEC-01) |
| `/practice/:challengeId` | HTML / CSS / JS / Bootstrap | `Practice` (`SandboxedPreview`) | Multi-file CodeMirror editor | Sandboxed iframe (`iframePreviewRunner.ts`) with device frames | Yes | 1. Multi-file CSS editing & live preview<br>2. JS event listener bindings<br>3. Bootstrap component styling | Device simulation frames (Desktop, Tablet, Mobile) |
| `/practice/:challengeId` | Python | `Practice` (Worker Runner) | Python script | `pythonRunner.ts` Web Worker with Pyodide | Yes | 1. stdout capturing<br>2. syntax error reporting<br>3. multi-line assertions | Worker sandbox; execution timeout (10s) |
| `/practice/:challengeId` | Java / C++ | `Practice` (Simulated Runner) | Java / C++ source | Web Worker runner (`workerHost.ts`) | Yes | 1. Compile simulation & stdout<br>2. syntax checking<br>3. algorithmic checks | Worker sandbox |
| `/practice/:challengeId` | Angular | `Practice` (`SandboxedPreview`) | Angular component template | Sandboxed iframe (`allow-scripts`) reactive runner | Yes | 1. Reactive template data binding<br>2. Property binding<br>3. Event listener updates | Strict CSP iframe sandbox |
| `/practice/create` | HTML/CSS/JS | `ChallengeCreator` | Starter code & test files | Sandboxed preview iframe | Yes | 1. Custom prompt creation<br>2. Live template rendering<br>3. Test case drafting | Iframe isolation |

---

## 4. Verification & Test Evidence

### Vitest Unit & Integration Suites
Ran complete Vitest suite across the entire application:
```text
Test Files  164 passed (164)
Tests       1343 passed (1343)
Duration    68.13s
```
Specific regression test file `src/test/practiceEngineAndDemos.test.tsx` (16 tests) verifies:
- `ch-css-selectors` reference solution yields 100% pass across all 3 requirements.
- Stylistic variations (comments, spacing, property reordering) pass 100%.
- Specificity violations (`#card`, `div.card`, `.card > h2`) fail requirement 3.
- Incomplete properties fail requirements 1 and 2.
- Multi-file draft persistence saves and retrieves `${challengeId}::${fileName}` correctly.
- Fullscreen editor toggles `html.is-fullscreen` and restores state on close.
- `LiveDemo` re-renders dynamically across HTML, CSS, JavaScript (script mode), Bootstrap, and Python.

### Playwright E2E Verification
Executed complete Playwright browser suite:
```text
Running 48 tests using 1 worker
  48 passed (1.5m)
```
Covers:
- Responsive layout across 5 viewports (1440px, 1280px, 820px, 390px, 320px).
- Practice workspace device frames and full layout rendering.
- Editor platform, splitter, auto-save indicator, fullscreen, and preferences.
- PWA offline execution and Pyodide worker isolation.

### Build & Typecheck
- `npx tsc -b --noEmit`: 0 errors
- `npx eslint .`: 0 errors
- `npm run build`: Production build succeeded in 844ms with zero errors.

---

## 5. Verdict

**FULL PASS — PRACTICE ENGINE & ALL APPLICATION SANDBOXES RELIABLE AND RELEASE READY**

All reported practice workspace issues and sandbox limitations have been investigated down to their root causes, remediated with zero architectural compromises, and verified by 1,343 Vitest tests and 48 Playwright browser tests.
