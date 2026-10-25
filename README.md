# CodeOrbit

A browser-based, language-neutral learning studio: a **Learning Orbit** topic map, concept lessons, varied quizzes, a sandboxed practice lab with a deterministic Code Coach, notes/bookmarks, an Error Notebook, and resume-on-refresh persistence. HTML is the first optional track module, with CSS, JavaScript, Bootstrap and Angular registered as planned tracks.

Stack: React 19 + TypeScript + Vite + React Router + custom CSS + versioned `localStorage`. Vitest + Testing Library for unit/component tests, and Playwright for real browser smoke tests.

## Commands
```bash
npm install
npm run dev         # development server
npm run typecheck   # tsc -b --noEmit
npm run lint        # eslint
npm test            # vitest run (unit + component/integration)
npm run build       # tsc -b && vite build  → dist/
npm run preview     # serve dist/ on :4173
npm run test:e2e    # build, run Vite preview and execute Playwright browser smoke
```

## What is real
All progress, drafts, notes, bookmarks and errors come from your own activity and live in this browser only (`localStorage` key `codeorbit:state`, schema v1, migrations + corrupt-data recovery). Nothing is synced or sent anywhere. Code Coach is rule-based per challenge — it is **not** an AI review.

## Docs
`DESIGN.md` (tokens/rules) · `docs/WORKLOG.md` · `docs/DECISIONS.md` · `docs/TEST_PLAN.md` · `docs/ASSESSMENT_COMPLIANCE.md` · `docs/antigravity/` (Antigravity implementation pack, including read-only reference snapshot under `docs/antigravity/reference/`).
