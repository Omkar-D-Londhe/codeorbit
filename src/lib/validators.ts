import type { Challenge, ChallengeRequirement, Rule } from '../data/types'

export type RequirementStatus = 'pass' | 'fail'

export interface RequirementResult {
  id: string
  description: string
  explanation: string
  status: RequirementStatus
}

export interface CheckResult {
  results: RequirementResult[]
  passed: number
  total: number
  allPassed: boolean
}

/** Parse learner HTML into a detached document. Never attached to the trusted DOM. */
export function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

const CONTROL_SELECTOR =
  'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea'

const norm = (s: string | null | undefined): string => (s ?? '').trim()

/** A control is labelled via label[for], a wrapping label, aria-label, or aria-labelledby. */
function isLabelled(el: Element, doc: Document): boolean {
  if (norm(el.getAttribute('aria-label'))) return true
  if (norm(el.getAttribute('aria-labelledby'))) return true
  if (el.closest('label')) return true
  const id = el.getAttribute('id')
  if (id) {
    const labels = Array.from(doc.querySelectorAll('label[for]'))
    if (labels.some((l) => l.getAttribute('for') === id && norm(l.textContent).length > 0)) return true
  }
  return false
}

function safeQuery(doc: Document, selector: string): Element[] {
  try {
    return Array.from(doc.querySelectorAll(selector))
  } catch {
    return []
  }
}

/** Evaluate one rule against a parsed document. Pure and deterministic. */
export function evaluateRule(rule: Rule, doc: Document, rawHtml: string): boolean {
  switch (rule.kind) {
    case 'doctype':
      return /^\s*<!doctype\s+html\s*>/i.test(rawHtml)
    case 'selector': {
      const n = safeQuery(doc, rule.selector).length
      if (rule.exactly !== undefined) return n === rule.exactly
      if (rule.min !== undefined && n < rule.min) return false
      if (rule.max !== undefined && n > rule.max) return false
      return rule.min !== undefined || rule.max !== undefined ? true : n > 0
    }
    case 'noMatch':
      return safeQuery(doc, rule.selector).length === 0
    case 'textLength':
      return safeQuery(doc, rule.selector).some((el) => norm(el.textContent).length >= rule.min)
    case 'everyHasAttr': {
      const els = safeQuery(doc, rule.selector)
      if (els.length < (rule.min ?? 0)) return false
      return els.every((el) => (rule.nonEmpty ? norm(el.getAttribute(rule.attr)).length > 0 : el.hasAttribute(rule.attr)))
    }
    case 'everyAttrContains': {
      const els = safeQuery(doc, rule.selector)
      if (els.length === 0) return false
      return els.every((el) => (el.getAttribute(rule.attr) ?? '').toLowerCase().split(/\s+/).includes(rule.token))
    }
    case 'anyHasAttr':
      return safeQuery(doc, rule.selector).some((el) => {
        const v = norm(el.getAttribute(rule.attr))
        if (rule.startsWith) return v.toLowerCase().startsWith(rule.startsWith)
        return rule.nonEmpty ? v.length > 0 : el.hasAttribute(rule.attr)
      })
    case 'controlsLabelled': {
      const controls = safeQuery(doc, CONTROL_SELECTOR)
      return controls.length > 0 && controls.every((c) => isLabelled(c, doc))
    }
    case 'headingOrder': {
      const levels = safeQuery(doc, 'h1,h2,h3,h4,h5,h6').map((h) => Number(h.tagName[1]))
      if (levels.length === 0) return false
      if (levels[0] !== 1) return false
      return levels.every((lvl, i) => i === 0 || lvl - levels[i - 1] <= 1)
    }
    case 'fragmentLinksResolve': {
      const links = safeQuery(doc, 'a[href^="#"]').filter((a) => (a.getAttribute('href') ?? '').length > 1)
      if (links.length === 0) return false
      return links.every((a) => {
        const id = (a.getAttribute('href') ?? '').slice(1)
        return Array.from(doc.querySelectorAll('[id]')).some((el) => el.getAttribute('id') === id)
      })
    }
    case 'noLinkText': {
      const banned = rule.patterns.map((p) => p.toLowerCase())
      const links = safeQuery(doc, 'a')
      return links.every((a) => !banned.includes(norm(a.textContent).toLowerCase().replace(/[.!?:]+$/, '')))
    }
  }
}

export function checkRequirements(requirements: ChallengeRequirement[], html: string): CheckResult {
  const doc = parseHtml(html)
  const results: RequirementResult[] = requirements.map((r) => ({
    id: r.id,
    description: r.description,
    explanation: r.explanation,
    status: evaluateRule(r.rule, doc, html) ? 'pass' : 'fail',
  }))
  const passed = results.filter((r) => r.status === 'pass').length
  return { results, passed, total: results.length, allPassed: passed === results.length }
}

export const checkChallenge = (challenge: Challenge, html: string): CheckResult =>
  checkRequirements(challenge.requirements, html)
