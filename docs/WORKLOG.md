# Worklog

## 2026-10-24 — full build
- **A Audit:** unpacked both uploads. Spec zip read (README_APPLY_UPDATE, blueprint, UI spec, decisions, compliance, test plan, AGENTS). Second zip contained no repository (see D-101) — 41 lab-submission PDFs, OCR’d at cover level. No Git history existed → `git init`.
- **B Design system:** `DESIGN.md`, tokens, base, components CSS, shell (sidebar / rail / bottom nav), buttons, dialogs, toasts, code blocks.
- **C Learning Orbit:** pure geometry module + tests; arch, strip, carousel fallback, details, keyboard, reduced motion.
- **D/E Dashboard, catalog, lessons, quizzes:** Home (first-run / resume / all-complete), Explore (HTML available, others Preview), lessons with notes/bookmarks, quiz engine with persisted sessions.
- **F Practice/Coach:** sandboxed preview, editor, Run/Check/Reset/Hint, solution reveal behind confirmation, focus mode, rule-based requirement feedback, Error Notebook save.
- **G Progress/review:** progress rules, recommendations, Progress page, Review (Error Notebook, Journal, Bookmarks), clear-data.
- **H/I Integration & QA:** see `docs/TEST_PLAN.md`. Browser pass found and fixed: noisy connectors (opacity/curvature), mobile carousel card layout and peek, redundant first-run card. A test-harness issue (Chromium launched with `--disable-web-security`) briefly made the iframe look readable from the parent; re-tested with web security on → `SecurityError`, as expected.
