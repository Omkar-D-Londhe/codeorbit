import type { Challenge, ChallengeRequirement, Rule } from '../data/types'
import { findRuleLocation } from './sourcePositions'
import { evaluateCssRule, findCssRuleLocation, type CssRule } from '../tracks/css/validators'
import {
  checkHasClass,
  checkNavbarStructure,
  checkGridStructure,
  checkFormControls,
  checkValidationFeedback,
} from '../tracks/bootstrap/validators'
import {
  evaluatePythonRule,
  findPythonRuleLocation,
  type PythonRule,
} from '../tracks/python/validators'
import {
  evaluateJavaRule,
  findJavaRuleLocation,
  type JavaRule,
} from '../tracks/java/validators'
import {
  evaluateCppRule,
  findCppRuleLocation,
  type CppRule,
} from '../tracks/cpp/validators'
import {
  evaluateAngularRule,
  findAngularRuleLocation,
  type AngularRule,
} from '../tracks/angular/validators'

export type RequirementStatus = 'pass' | 'fail'

export interface RequirementResult {
  id: string
  description: string
  explanation: string
  status: RequirementStatus
  met?: boolean
  detail?: string
  line?: number
  column?: number
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
export function evaluateRule(rule: Rule, doc: Document, rawHtml: string, css?: string): boolean {
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
    case 'hasAttrValue': {
      const els = safeQuery(doc, rule.selector)
      return els.some((el) => {
        const v = norm(el.getAttribute(rule.attr)).toLowerCase()
        return rule.values.some((val) => val.toLowerCase() === v)
      })
    }
    case 'nestedList': {
      return safeQuery(doc, 'li ul, li ol').length > 0
    }
    case 'cellSpan': {
      const cells = safeQuery(doc, 'th, td')
      return cells.some((cell) => {
        const val = parseInt(cell.getAttribute(rule.attr) || '0', 10)
        return !isNaN(val) && val >= rule.min
      })
    }
    case 'inputTypes': {
      const inputs = safeQuery(doc, 'input')
      const presentTypes = new Set(inputs.map((inp) => (inp.getAttribute('type') || 'text').toLowerCase()))
      const matched = rule.types.filter((t) => presentTypes.has(t.toLowerCase()))
      const required = rule.min !== undefined ? rule.min : rule.types.length
      return matched.length >= required
    }
    case 'mediaControls': {
      const els = safeQuery(doc, rule.element)
      return els.length > 0 && els.some((el) => el.hasAttribute('controls'))
    }
    case 'ruleExists':
    case 'declares':
    case 'mediaQuery':
    case 'usesDisplay':
    case 'reducedMotionGuard':
    case 'specificityBelow': {
      const effectiveCss = css ?? Array.from(doc.querySelectorAll('style')).map((s) => s.textContent || '').join('\n')
      return evaluateCssRule(rule as unknown as CssRule, effectiveCss, rawHtml)
    }
    case 'hasClass':
      return checkHasClass(doc, rule.selector, rule.className)
    case 'navbarStructure':
      return checkNavbarStructure(doc)
    case 'gridStructure':
      return checkGridStructure(doc, rule.expectedCols)
    case 'formControls':
      return checkFormControls(doc)
    case 'validationFeedback':
      return checkValidationFeedback(doc)
    case 'definesFunction':
    case 'containsLoop':
    case 'usesComprehension':
    case 'usesRecursion':
    case 'declaresClass':
    case 'usesConstruct':
    case 'pythonSourceMatches':
    case 'blocksImport':
      return evaluatePythonRule(rule as PythonRule, rawHtml)
    default:
      return false
  }
}

export function checkRequirements(
  requirements: ChallengeRequirement[],
  html: string,
  css?: string,
  options?: { language?: string },
): CheckResult {
  const doc = parseHtml(html)
  const effectiveCss = css ?? Array.from(doc.querySelectorAll('style')).map((s) => s.textContent || '').join('\n')
  const results: RequirementResult[] = requirements.map((r) => {
    const isCssKind = [
      'ruleExists',
      'declares',
      'mediaQuery',
      'usesDisplay',
      'reducedMotionGuard',
      'specificityBelow',
    ].includes(r.rule?.kind)

    const isJava = options?.language === 'java' || r.rule?.kind === 'javaSourceMatches' || r.rule?.kind === 'definesMethod'
    const isCpp = options?.language === 'cpp' || r.rule?.kind === 'cppSourceMatches' || r.rule?.kind === 'usesPointerOrReference'
    const isAngular =
      options?.language === 'angular' ||
      r.rule?.kind === 'angularSourceMatches' ||
      r.rule?.kind === 'declaresComponent' ||
      r.rule?.kind === 'usesSignal' ||
      r.rule?.kind === 'usesControlFlow' ||
      r.rule?.kind === 'usesBinding' ||
      r.rule?.kind === 'declaresInjectable' ||
      r.rule?.kind === 'usesRouterLink'

    const isPythonKind = !isJava && !isCpp && !isAngular && [
      'definesFunction',
      'containsLoop',
      'usesComprehension',
      'usesRecursion',
      'declaresClass',
      'usesConstruct',
      'pythonSourceMatches',
      'blocksImport',
    ].includes(r.rule?.kind)

    const met = isCssKind
      ? evaluateCssRule(r.rule as unknown as CssRule, effectiveCss, html)
      : isJava
        ? evaluateJavaRule(html, r.rule as unknown as JavaRule)
        : isCpp
          ? evaluateCppRule(html, r.rule as unknown as CppRule)
          : isAngular
            ? evaluateAngularRule(html, r.rule as unknown as AngularRule)
            : isPythonKind
              ? evaluatePythonRule(r.rule as PythonRule, html)
              : evaluateRule(r.rule, doc, html, effectiveCss)

    const loc = isCssKind
      ? findCssRuleLocation(r.rule as unknown as CssRule, effectiveCss)
      : isJava
        ? findJavaRuleLocation(html, r.rule as unknown as JavaRule)
        : isCpp
          ? findCppRuleLocation(html, r.rule as unknown as CppRule)
          : isAngular
            ? findAngularRuleLocation(html, r.rule as unknown as AngularRule)
            : isPythonKind
              ? findPythonRuleLocation(r.rule as PythonRule, html)
              : findRuleLocation(r.rule, doc, html, met)

    return {
      id: r.id,
      description: r.description,
      explanation: r.explanation,
      status: met ? 'pass' : 'fail',
      met,
      line: loc?.line,
      column: loc?.column,
    }
  })
  const passed = results.filter((r) => r.status === 'pass').length
  return { results, passed, total: results.length, allPassed: passed === results.length }
}

export const checkChallenge = (challenge: Challenge, html: string, css?: string): CheckResult => {
  let effectiveCss = css
  if (effectiveCss === undefined && challenge.files) {
    const cssFile = challenge.files.find((f) => f.name.toLowerCase().endsWith('.css'))
    if (cssFile) effectiveCss = cssFile.content
  }
  const language =
    challenge.id.startsWith('java-') || challenge.topicId.startsWith('java-')
      ? 'java'
      : challenge.id.startsWith('cpp-') || challenge.topicId.startsWith('cpp-')
        ? 'cpp'
        : challenge.id.startsWith('py-') || challenge.topicId.startsWith('py-')
          ? 'python'
          : challenge.id.startsWith('ng-') || challenge.topicId.startsWith('ng-')
            ? 'angular'
            : undefined

  return checkRequirements(challenge.requirements, html, effectiveCss, { language })
}

export const validateChallenge = checkChallenge
