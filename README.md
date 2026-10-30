# CodeOrbit

> **An offline-first, browser-based coding studio and interactive learning platform.**

CodeOrbit is a comprehensive educational environment featuring an interactive **Constellation Map**, multi-file practice workspaces with deterministic rule-based feedback, concept lessons, varied quizzes, in-browser execution runtimes, and asymptotic complexity analysis.

Built entirely as an offline-first Progressive Web Application (PWA), CodeOrbit runs 100% client-side with zero mandatory server dependencies or tracking.

---

## 🌟 Key Features

### 1. Celestial Learning Orbit
- **Interactive Constellation Map:** Celestial topic map with pan, zoom, prerequisite connection lines, dynamic pulsing, and topic inspection cards.
- **Accessible Dual Views:** Seamless toggle between the interactive Constellation Map, an accessible List View, and a step-by-step track navigator.

### 2. Eight Technology Tracks
- **HTML:** Rich curriculum, semantic tags, forms, tables, media, and WCAG accessibility audits.
- **CSS:** Modern layouts (Flexbox, Grid), responsive design, animations, and specificity validation.
- **JavaScript:** ES6+, DOM manipulation, async programming, and sandboxed script execution.
- **Bootstrap:** Responsive grid system, utilities, components, and offline-bundled Bootstrap 5.3.
- **Python:** Client-side execution powered by **Pyodide (WebAssembly)** running in dedicated Web Workers with security isolation.
- **Java & C++ (Preview):** Full curriculum, interactive quizzes, CodeMirror language modes, and static Lezer AST structural validation.
- **Angular (Decision-Gated):** Reactive component templates, data-binding lessons, and sandboxed previews.

### 3. Practice Workspace & Code Coach
- **Multi-File CodeMirror 6 Editor:** High-performance, modular code editor with syntax highlighting, auto-close brackets, and auto-indentation.
- **Deterministic Code Coach:** Immediate, rule-based feedback on challenge requirements without fabricated AI assertions or telemetry.
- **Sandboxed Execution:** Multi-layer iframe isolation with empty `sandbox=""` or strict CSP `sandbox="allow-scripts"` to prevent security breakouts.
- **Device Simulation Frames:** Test responsive web pages directly within Desktop, Tablet, and Mobile viewports.
- **Myers / LCS Diff Viewer:** Reveal solution comparisons with side-by-side and inline diffs once gated solutions are unlocked.

### 4. Lesson Studio & Interactive Demos
- In-lesson interactive code sandboxes with real-time reactive previews across HTML, CSS, JavaScript, Bootstrap, and Python.
- Bookmarks, rich personal notes with Markdown support, and reading time estimates.

### 5. Static AST Complexity Analysis
- In-browser asymptotic time and space complexity estimation ($O(1)$, $O(\log n)$, $O(n)$, $O(n \log n)$, $O(n^2)$) using lightweight AST analyzers (`@lezer/java`, `@lezer/cpp`, and Python AST parsers).

### 6. Offline-First PWA & Privacy-First Architecture
- **Offline PWA:** Service Worker (`sw.js`) precaches routes, assets, and Pyodide WebAssembly binaries for complete offline readiness.
- **Local Data Isolation:** Learner progress, bookmarks, notes, and personal bests are stored securely in browser `localStorage` (schema v11) with JSON backup export/import and typed data wipe.

### 7. Inclusive Design System
- **Themes:** Obsidian (dark), Starlight (light), and Aurora (teal dark).
- **Accents:** 5 curated WCAG AA compliant accents (Violet, Teal, Amber, Rose, Azure).
- **Typography:** Atkinson Hyperlegible, Inter, and JetBrains Mono with font scaling and high-contrast modes.

---

## 🛠️ Tech Stack

- **Frontend Core:** React 19, TypeScript, React Router 7, Vite
- **Editor:** CodeMirror 6 (`@codemirror/*`)
- **Execution Runtimes:** Pyodide (WASM Python Web Worker), Sandboxed `srcdoc` iframes
- **AST Parsing:** Acorn, `@lezer/java`, `@lezer/cpp`
- **Testing:** Vitest, Testing Library, `@playwright/test` (real browser E2E)
- **Styling:** Vanilla CSS with custom design tokens (zero heavy CSS frameworks in bundle)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 20+ (Node 22 LTS recommended)
- npm 10+

### Installation
```bash
# Clone the repository
git clone https://github.com/Omkar-D-Londhe/codeorbit.git
cd codeorbit

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development & Quality Commands
```bash
npm run typecheck   # TypeScript check (tsc -b --noEmit)
npm run lint        # ESLint check
npm test            # Run Vitest unit and integration suites
npm run build       # Production build (outputs to dist/)
npm run preview     # Preview production build locally
npm run test:e2e    # Run Playwright E2E browser tests
npm run check       # Complete quality gate (typecheck + lint + test + build)
```

---

## 🌐 Deploying to Render

CodeOrbit can be deployed directly to **Render** as a **Static Site** (100% free with automatic SSL and global CDN).

### Step-by-Step Render Deployment

1. **Push your code to GitHub:**
   Ensure your code is pushed to your GitHub repository:
   `https://github.com/Omkar-D-Londhe/codeorbit.git`

2. **Create Static Site on Render:**
   - Log in to your [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** in the top right and select **Static Site**.
   - Connect your GitHub repository (`Omkar-D-Londhe/codeorbit`).

3. **Configure Build Settings:**
   - **Name:** `codeorbit`
   - **Branch:** `main` (or your active release branch)
   - **Root Directory:** *(leave blank)*
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`

4. **Set Up SPA Route Rewrites (Crucial for Client Routing):**
   - In your Render service, navigate to **Redirects / Rewrites** in the sidebar.
   - Click **Add Rule** and enter:
     - **Type:** `Rewrite`
     - **Source:** `/*`
     - **Destination:** `/index.html`
   *(This ensures refreshing on sub-routes like `/learn/html/intro` or `/practice/ch-css-selectors` loads correctly without a 404 error).*

5. **Deploy:**
   - Click **Create Static Site**. Render will pull the repository, run the build, and publish your site with a free `.onrender.com` URL and automatic HTTPS.

### Automated Blueprint (`render.yaml`)
A `render.yaml` configuration is included at the repository root. You can also deploy instantly by selecting **New +** $\to$ **Blueprint** in Render and pointing to this repository.

---

## 🔒 Security & Privacy Commitments

- **No Remote Code Execution:** Learner code is executed strictly within browser Web Workers or sandboxed iframes. No user code is dispatched to external servers.
- **No Secret Leakage:** No third-party API keys or credentials are required or embedded in the client application.
- **Truthful Status:** Connected external services (AI hint proxy, WebRTC signalling) default to honest `"Not connected"` states until explicitly authorized and configured by the administrator.

---

## 📄 License

Private / Proprietary. All rights reserved.
