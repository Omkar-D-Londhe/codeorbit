/**
 * Portfolio Export (Stage 18b, Catalog 17.9).
 * Generates an offline, self-contained HTML portfolio showcasing the learner's
 * completed HTML-track challenge solutions with complete sandbox isolation and strict escaping.
 */

import { challenges as allChallenges } from '../../data/challenges'
import type { CodeOrbitState } from '../../state/types'
import { draftKey } from '../../state/reducer'

export interface PortfolioProject {
  challengeId: string
  title: string
  difficulty: string
  objective: string
  code: string
}

export interface PortfolioExportResult {
  ok: boolean
  count: number
  html?: string
  error?: string
  projects?: PortfolioProject[]
}

/**
 * Escapes HTML special characters to prevent markup and script injection in text and attribute contexts.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Generates the self-contained HTML portfolio from the learner's completed work.
 * Strictly excludes uncompleted or unattempted challenges.
 */
export function generatePortfolioHtml(state: CodeOrbitState): PortfolioExportResult {
  const completedProjects: PortfolioProject[] = []

  // 1. Gather completed challenges from HTML track
  for (const ch of allChallenges) {
    const rec = state.challenges?.[ch.id]
    if (rec && rec.completed) {
      const key = draftKey(ch.id, 'index.html', 1)
      const code = state.drafts?.[key] ?? state.drafts?.[ch.id] ?? ch.starterCode
      completedProjects.push({
        challengeId: ch.id,
        title: ch.title,
        difficulty: ch.difficulty,
        objective: ch.objective,
        code,
      })
    }
  }

  // 2. Also check custom completed challenges in custom.challenges if any
  const customList = state.custom?.challenges ?? []
  for (const customCh of customList) {
    const rec = state.challenges?.[customCh.id]
    if (rec && rec.completed) {
      const code = state.drafts?.[customCh.id] ?? customCh.files[0]?.content ?? ''
      completedProjects.push({
        challengeId: customCh.id,
        title: customCh.title,
        difficulty: customCh.difficulty,
        objective: customCh.objective,
        code,
      })
    }
  }

  if (completedProjects.length === 0) {
    return {
      ok: false,
      count: 0,
      error: 'No completed challenges found in your HTML track. Complete at least one challenge to export your portfolio.',
    }
  }

  const learnerName = escapeHtml(state.settings?.userName?.trim() || 'CodeOrbit Learner')
  const dateFormatted = escapeHtml(new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }))

  const projectsHtml = completedProjects
    .map((p, idx) => {
      const escapedTitle = escapeHtml(p.title)
      const escapedDifficulty = escapeHtml(p.difficulty)
      const escapedObjective = escapeHtml(p.objective)
      const escapedCode = escapeHtml(p.code)
      // For iframe srcdoc attribute: the attribute value itself must be escaped
      const srcDocAttr = escapeHtml(p.code)

      return `
      <article class="project-card" id="project-${idx + 1}">
        <div class="project-header">
          <div class="project-meta">
            <span class="badge badge--${escapedDifficulty}">${escapedDifficulty}</span>
            <span class="project-index">Project #${idx + 1}</span>
          </div>
          <h2 class="project-title">${escapedTitle}</h2>
          <p class="project-objective">${escapedObjective}</p>
        </div>

        <div class="project-preview-wrap">
          <div class="preview-header">
            <span class="preview-dot dot--red"></span>
            <span class="preview-dot dot--yellow"></span>
            <span class="preview-dot dot--green"></span>
            <span class="preview-title">Live Preview (Sandboxed)</span>
          </div>
          <iframe
            class="project-preview-frame"
            sandbox="allow-scripts"
            srcdoc="${srcDocAttr}"
            title="${escapedTitle} Preview"
            loading="lazy"
          ></iframe>
        </div>

        <details class="code-details">
          <summary class="code-summary">View Source Code</summary>
          <pre class="code-block"><code>${escapedCode}</code></pre>
        </details>
      </article>
      `
    })
    .join('\n')

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${learnerName} — CodeOrbit Portfolio</title>
  <style>
    :root {
      --bg: #0d0e15;
      --surface: #161822;
      --surface-border: #26293b;
      --text: #e6e8f2;
      --text-muted: #8c90a4;
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.2);
      --font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --mono: "JetBrains Mono", Consolas, Monaco, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font);
      line-height: 1.6;
      padding: 32px 16px 64px;
    }
    .portfolio-container {
      max-width: 960px;
      margin: 0 auto;
    }
    header.portfolio-hero {
      padding: 32px 24px;
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      margin-bottom: 32px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .hero-badge {
      display: inline-block;
      padding: 4px 10px;
      background: var(--accent-glow);
      color: var(--accent);
      border: 1px solid var(--accent);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    h1.hero-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    p.hero-desc {
      color: var(--text-muted);
      font-size: 15px;
      margin-bottom: 16px;
    }
    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--surface-border);
      font-size: 13px;
      color: var(--text-muted);
    }
    .hero-meta strong {
      color: var(--text);
    }
    .notice-box {
      margin-top: 16px;
      padding: 10px 14px;
      background: rgba(139, 92, 246, 0.08);
      border-left: 3px solid var(--accent);
      border-radius: 4px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .notice-box strong { color: var(--text); }
    .project-grid {
      display: grid;
      gap: 32px;
    }
    .project-card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    }
    .project-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge--beginner { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
    .badge--intermediate { background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3); }
    .badge--advanced { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .project-index {
      font-size: 12px;
      color: var(--text-muted);
    }
    .project-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .project-objective {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 18px;
    }
    .project-preview-wrap {
      border: 1px solid var(--surface-border);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 16px;
      background: #000;
    }
    .preview-header {
      background: #1e202e;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1px solid var(--surface-border);
    }
    .preview-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot--red { background: #ff5f56; }
    .dot--yellow { background: #ffbd2e; }
    .dot--green { background: #27c93f; }
    .preview-title {
      margin-left: 8px;
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .project-preview-frame {
      width: 100%;
      height: 240px;
      border: none;
      background: #ffffff;
      display: block;
    }
    .code-details {
      margin-top: 12px;
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      background: #11131c;
      overflow: hidden;
    }
    .code-summary {
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text);
      cursor: pointer;
      user-select: none;
      background: rgba(255, 255, 255, 0.02);
    }
    .code-summary:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .code-block {
      padding: 16px;
      overflow-x: auto;
      font-family: var(--mono);
      font-size: 13px;
      color: #cbd5e1;
      border-top: 1px solid var(--surface-border);
    }
    footer.portfolio-footer {
      text-align: center;
      padding: 40px 16px;
      color: var(--text-muted);
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="portfolio-container">
    <header class="portfolio-hero">
      <div class="hero-badge">Verified Solutions</div>
      <h1 class="hero-title">${learnerName}</h1>
      <p class="hero-desc">Interactive portfolio of completed web development challenges created in CodeOrbit.</p>
      <div class="hero-meta">
        <div><strong>Total Completed:</strong> ${completedProjects.length} challenges</div>
        <div><strong>Exported:</strong> ${dateFormatted}</div>
        <div><strong>Track:</strong> HTML Foundations</div>
      </div>
      <div class="notice-box">
        <strong>Learner Work Only:</strong> Every project shown below was built and passed by the learner in CodeOrbit. Live previews run inside secure sandboxed iframes without network access or parent script privileges.
      </div>
    </header>

    <main class="project-grid">
      ${projectsHtml}
    </main>

    <footer class="portfolio-footer">
      Generated locally by CodeOrbit · Open source learning platform
    </footer>
  </div>
</body>
</html>`

  return {
    ok: true,
    count: completedProjects.length,
    html: fullHtml,
    projects: completedProjects,
  }
}

/**
 * Initiates the client-side download of the self-contained portfolio HTML file.
 */
export function downloadPortfolioFile(
  state: CodeOrbitState,
  filename = 'codeorbit-portfolio.html'
): { success: boolean; count: number; error?: string } {
  const result = generatePortfolioHtml(state)
  if (!result.ok || !result.html) {
    return {
      success: false,
      count: 0,
      error: result.error || 'Failed to generate portfolio.',
    }
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      success: false,
      count: result.count,
      error: 'Download is only supported in a browser environment.',
    }
  }

  const blob = new Blob([result.html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return {
    success: true,
    count: result.count,
  }
}
