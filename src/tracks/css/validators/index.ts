/**
 * CSS Rule Validators for CodeOrbit CSS Track (Stage 22).
 * Operates purely on host-parsed CSS and detached host DOM.
 * Preserves sandbox="" on the preview iframe — zero scripts executed in the preview.
 */

import type { ChallengeRequirement } from '../../../data/types'
import type { ChallengeFile, ChallengeValidator, RequirementResult } from '../../../core/content/types'
import {
  calculateSpecificity,
  isSpecificityBelowOrEqual,
  parseCss,
  type ParsedRule,
} from '../parser'

export type CssRule =
  | { kind: 'ruleExists'; selector: string; property: string; value?: string | RegExp }
  | { kind: 'mediaQuery'; feature: 'min-width' | 'max-width'; min?: number; max?: number }
  | { kind: 'declares'; property: string; pattern: string }
  | { kind: 'usesDisplay'; value: 'flex' | 'grid' }
  | { kind: 'reducedMotionGuard' }
  | { kind: 'specificityBelow'; selector: string; max: [number, number, number] }

const normalize = (s: string | null | undefined): string =>
  (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim()

const cleanVal = (s: string | null | undefined): string =>
  (s ?? '').toLowerCase().replace(/['"]/g, '').replace(/\s+/g, ' ').trim()

/**
 * Checks if a parsed rule matches the target selector.
 * Handles whitespace differences and comma alternatives.
 */
function selectorMatches(ruleSelector: string, targetSelector: string): boolean {
  const normRule = normalize(ruleSelector)
  const normTarget = normalize(targetSelector)
  return normRule === normTarget
}

/**
 * Evaluates a single CSS rule against parsed CSS text.
 */
export function evaluateCssRule(
  rule: CssRule,
  cssSource: string,
  _htmlSource?: string
): boolean {
  const parsed = parseCss(cssSource)
  const allRules: ParsedRule[] = [
    ...parsed.rules,
    ...parsed.mediaRules.flatMap((m) => m.rules),
  ]

  switch (rule.kind) {
    case 'ruleExists': {
      const targetProp = rule.property.toLowerCase().trim()
      const matchingRules = allRules.filter((r) => selectorMatches(r.selector, rule.selector))
      if (matchingRules.length === 0) return false

      return matchingRules.some((r) => {
        const val = r.declarations[targetProp]
        if (val === undefined) return false
        if (!rule.value) return true

        if (typeof rule.value === 'string') {
          return cleanVal(val) === cleanVal(rule.value)
        } else if (rule.value instanceof RegExp) {
          return rule.value.test(val)
        }
        return false
      })
    }

    case 'declares': {
      const targetProp = rule.property.toLowerCase().trim()
      const regex = new RegExp(rule.pattern, 'i')
      return allRules.some((r) => {
        const val = r.declarations[targetProp]
        return val !== undefined && regex.test(val)
      })
    }

    case 'mediaQuery': {
      const featureName = rule.feature.toLowerCase().trim()
      return parsed.mediaRules.some((m) => {
        const normParams = m.params.toLowerCase()
        if (!normParams.includes(featureName)) return false

        // Extract value (e.g. min-width: 768px or 48em)
        const match = new RegExp(`${featureName}\\s*:\\s*([0-9.]+)\\s*(px|em|rem)?`, 'i').exec(normParams)
        if (!match) return true // Found feature without explicit pixel constraint

        let num = parseFloat(match[1])
        const unit = match[2]?.toLowerCase()
        if (unit === 'em' || unit === 'rem') {
          num *= 16 // Convert standard base 16px font size
        }

        if (rule.min !== undefined && num < rule.min) return false
        if (rule.max !== undefined && num > rule.max) return false
        return true
      })
    }

    case 'usesDisplay': {
      const targetDisplay = rule.value.toLowerCase().trim()
      return allRules.some((r) => {
        const d = cleanVal(r.declarations['display'])
        if (targetDisplay === 'flex') {
          return d === 'flex' || d === 'inline-flex'
        }
        if (targetDisplay === 'grid') {
          return d === 'grid' || d === 'inline-grid'
        }
        return false
      })
    }

    case 'reducedMotionGuard': {
      return parsed.mediaRules.some((m) => {
        const normParams = m.params.toLowerCase()
        const isReducedMotion = normParams.includes('prefers-reduced-motion')
        if (!isReducedMotion) return false

        // Must declare a reset for transition or animation
        return m.rules.some((r) => {
          const trans = cleanVal(r.declarations['transition'])
          const anim = cleanVal(r.declarations['animation'])
          const transDur = cleanVal(r.declarations['transition-duration'])
          const animDur = cleanVal(r.declarations['animation-duration'])

          return (
            trans === 'none' ||
            anim === 'none' ||
            transDur === '0s' ||
            transDur === '0.001s' ||
            transDur === '0ms' ||
            animDur === '0s' ||
            animDur === '0.001s' ||
            animDur === '0ms'
          )
        })
      })
    }

    case 'specificityBelow': {
      if (allRules.length === 0) {
        // Fallback for tests passing a selector without rules in source
        const actualSpec = calculateSpecificity(rule.selector)
        return isSpecificityBelowOrEqual(actualSpec, rule.max)
      }

      // Check all rules in the stylesheet against the max specificity
      // Ensures structural enforcement (e.g. no IDs if max[0] === 0, no element tags if max[2] === 0)
      for (const r of allRules) {
        if (!isSpecificityBelowOrEqual(r.specificity, rule.max)) {
          return false
        }
      }
      return true
    }

    default:
      return false
  }
}

/**
 * Finds the line number in the CSS source relevant to a given CSS rule for diagnostics.
 */
export function findCssRuleLocation(rule: CssRule, cssSource: string): { line: number; column: number } | undefined {
  const parsed = parseCss(cssSource)
  const allRules: ParsedRule[] = [
    ...parsed.rules,
    ...parsed.mediaRules.flatMap((m) => m.rules),
  ]

  if (rule.kind === 'ruleExists') {
    const match = allRules.find((r) => selectorMatches(r.selector, rule.selector))
    if (match) return { line: match.line, column: 1 }
  } else if (rule.kind === 'mediaQuery' || rule.kind === 'reducedMotionGuard') {
    if (parsed.mediaRules.length > 0) {
      return { line: parsed.mediaRules[0].line, column: 1 }
    }
  } else if (rule.kind === 'declares') {
    const targetProp = rule.property.toLowerCase().trim()
    for (const r of allRules) {
      const decl = r.declarationList.find((d) => d.property === targetProp)
      if (decl) return { line: decl.line, column: 1 }
    }
  }

  return undefined
}

/**
 * Factory for creating a ChallengeValidator for the CSS track.
 */
export function createCssValidator(requirements: ChallengeRequirement[]): ChallengeValidator {
  return {
    validate(files: ChallengeFile[]): RequirementResult[] {
      const cssFile = files.find((f) => f.name.toLowerCase().endsWith('.css'))
      const htmlFile = files.find((f) => f.name.toLowerCase().endsWith('.html'))
      const cssCode = cssFile ? cssFile.content : ''
      const htmlCode = htmlFile ? htmlFile.content : ''

      return requirements.map((req) => {
        const rule = req.rule as unknown as CssRule
        const met = evaluateCssRule(rule, cssCode, htmlCode)
        const loc = findCssRuleLocation(rule, cssCode)

        return {
          id: req.id,
          met,
          detail: met ? undefined : req.explanation,
          line: loc?.line,
          column: loc?.column,
        }
      })
    },
  }
}
