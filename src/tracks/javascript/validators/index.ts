/**
 * JavaScript Challenge Validators (Stage 23a, PLT-11, C-05).
 * Validates unit test cases, declared functions, source patterns,
 * and DOM assertions for JavaScript challenges.
 */
import type { ChallengeRequirement } from '../../../data/types'
import type { ChallengeFile, ChallengeValidator, RequirementResult } from '../../../core/content/types'
import { executeJavaScript } from '../runner'

export interface JsValidationOptions {
  tests?: import('../../../core/content/types').ChallengeTestCase[]
}

/**
 * Creates a ChallengeValidator for JavaScript challenges.
 */
export function createJavaScriptValidator(
  requirements: ChallengeRequirement[],
  options?: JsValidationOptions
): ChallengeValidator {
  return {
    async validate(files: ChallengeFile[]): Promise<RequirementResult[]> {
      const jsFile =
        files.find((f) => f.name.toLowerCase().endsWith('.js') || f.name.toLowerCase().endsWith('.ts')) ||
        files[0]
      const htmlFile = files.find((f) => f.name.toLowerCase().endsWith('.html'))

      const jsCode = jsFile ? jsFile.content : ''
      const htmlCode = htmlFile ? htmlFile.content : ''

      // Run unit tests if tests are provided
      const tests = options?.tests || []
      const runResult = await executeJavaScript(jsCode, tests, { timeoutMs: 3000 })

      return requirements.map((req) => {
        const rule = req.rule

        if (rule.kind === 'allTestsPass') {
          const met = runResult.status === 'ok' && runResult.allPassed
          return {
            id: req.id,
            met,
            detail: met
              ? undefined
              : runResult.status === 'timeout'
                ? runResult.message
                : runResult.status === 'error'
                  ? `Runtime error: ${runResult.message}`
                  : `${runResult.testResults.filter((t) => !t.passed).length} test(s) failed`,
          }
        }

        if (rule.kind === 'testPasses') {
          const tr = runResult.testResults.find((t) => t.id === rule.testId)
          const met = tr ? tr.passed : false
          return {
            id: req.id,
            met,
            detail: met ? undefined : tr?.error || `Expected ${JSON.stringify(tr?.expected)}, got ${JSON.stringify(tr?.actual)}`,
          }
        }

        if (rule.kind === 'declaresFunction') {
          const regex = new RegExp(`(?:function\\s+${rule.name}\\b|\\b(?:const|let|var)\\s+${rule.name}\\s*=|\\b${rule.name}\\s*\\()`)
          const met = regex.test(jsCode)
          return {
            id: req.id,
            met,
            detail: met ? undefined : `Function ${rule.name} was not found in source code`,
          }
        }

        if (rule.kind === 'jsSourceMatches') {
          const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern
          const met = regex.test(jsCode)
          return {
            id: req.id,
            met,
            detail: met ? undefined : `Required pattern not found: ${rule.pattern}`,
          }
        }

        if (rule.kind === 'domAssertion') {
          const doc = new DOMParser().parseFromString(htmlCode, 'text/html')
          const el = doc.querySelector(rule.selector)
          if (!el) {
            return {
              id: req.id,
              met: false,
              detail: `Element not found in DOM: ${rule.selector}`,
            }
          }
          if (rule.check === 'exists') {
            return { id: req.id, met: true }
          }
          if (rule.check === 'text') {
            const text = (el.textContent || '').trim()
            const met = rule.expected !== undefined ? text.includes(rule.expected.trim()) : text.length > 0
            return {
              id: req.id,
              met,
              detail: met ? undefined : `Text mismatch: "${text}"`,
            }
          }
          if (rule.check === 'attribute') {
            const val = el.getAttribute(rule.attr || '')
            const met = rule.expected !== undefined ? val === rule.expected : val !== null
            return {
              id: req.id,
              met,
              detail: met ? undefined : `Attribute mismatch: ${val}`,
            }
          }
        }

        // Fallback for standard DOM/HTML rules if any
        return {
          id: req.id,
          met: false,
          detail: req.explanation,
        }
      })
    },
  }
}
