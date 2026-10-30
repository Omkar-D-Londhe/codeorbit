import { describe, it, expect, beforeEach } from 'vitest'
import {
  generatePortfolioHtml,
  escapeHtml,
  downloadPortfolioFile,
} from '../core/portfolio/exportPortfolio'
import { createDefaultState } from '../lib/storage'
import type { CodeOrbitState } from '../state/types'

describe('Stage 18b — Portfolio Export (exportPortfolio.ts)', () => {
  let state: CodeOrbitState

  beforeEach(() => {
    state = createDefaultState()
  })

  it('escapeHtml correctly escapes XML/HTML special characters', () => {
    const raw = `<script>alert("xss" & 'injection')</script>`
    const escaped = escapeHtml(raw)
    expect(escaped).not.toContain('<script>')
    expect(escaped).toContain('&lt;script&gt;')
    expect(escaped).toContain('&quot;xss&quot;')
    expect(escaped).toContain('&amp;')
    expect(escaped).toContain('&#39;injection&#39;')
  })

  it('refuses export when no completed challenges exist', () => {
    const result = generatePortfolioHtml(state)
    expect(result.ok).toBe(false)
    expect(result.count).toBe(0)
    expect(result.error).toContain('No completed challenges found')
    expect(result.html).toBeUndefined()
  })

  it('includes only passed completed challenges and excludes incomplete ones', () => {
    // Mark one challenge as completed
    state.challenges['ch-html-structure'] = {
      attempts: 2,
      hintsRevealed: 0,
      solutionRevealed: false,
      completed: true,
      completedWithoutSolution: true,
    }
    state.drafts['ch-html-structure'] = '<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>'

    // Mark another challenge as incomplete (completed: false)
    state.challenges['ch-meta-tags'] = {
      attempts: 1,
      hintsRevealed: 1,
      solutionRevealed: false,
      completed: false,
      completedWithoutSolution: false,
    }

    const result = generatePortfolioHtml(state)
    expect(result.ok).toBe(true)
    expect(result.count).toBe(1)
    expect(result.projects).toHaveLength(1)
    expect(result.projects![0].challengeId).toBe('ch-html-structure')
    expect(result.html).toContain('Hello World')
    expect(result.html).not.toContain('ch-meta-tags')
  })

  it('sandboxes preview iframe with allow-scripts and srcdoc escaping', () => {
    state.challenges['ch-html-structure'] = {
      attempts: 1,
      hintsRevealed: 0,
      solutionRevealed: false,
      completed: true,
      completedWithoutSolution: true,
    }
    state.drafts['ch-html-structure'] = '<p>Sample Code</p>'

    const result = generatePortfolioHtml(state)
    expect(result.ok).toBe(true)
    // Sandbox contains allow-scripts and strictly not allow-same-origin
    expect(result.html).toContain('sandbox="allow-scripts"')
    expect(result.html).not.toContain('allow-same-origin')
    expect(result.html).toContain('srcdoc=')
  })

  it('escapes malicious HTML in user name and titles', () => {
    state.settings.userName = '<script>alert("hacked")</script>'
    state.challenges['ch-html-structure'] = {
      attempts: 1,
      hintsRevealed: 0,
      solutionRevealed: false,
      completed: true,
      completedWithoutSolution: true,
    }
    state.drafts['ch-html-structure'] = '<h1>Test</h1>'

    const result = generatePortfolioHtml(state)
    expect(result.ok).toBe(true)
    expect(result.html).not.toContain('<script>alert("hacked")</script>')
    expect(result.html).toContain('&lt;script&gt;alert(&quot;hacked&quot;)&lt;/script&gt;')
  })

  it('downloadPortfolioFile returns success: false if no completed challenges', () => {
    const s = createDefaultState()
    const res = downloadPortfolioFile(s)
    expect(res.success).toBe(false)
    expect(res.count).toBe(0)
    expect(res.error).toBeDefined()
  })
})
