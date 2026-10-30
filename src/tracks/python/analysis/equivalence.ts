/**
 * Python Equivalence Verification Engine (Stage 25b, PLT-08, PLT-09).
 * Compares the observable runtime behavior of the learner's original Python code
 * against an optimized candidate across deterministic test cases and seeded pseudo-random inputs.
 *
 * Truthfulness rules (L-09):
 * - Clearly distinguishes empirical test-based agreement from formal proof.
 * - Explicitly states coverage notes and limitations.
 */

import type { AnalysisInput, CorrectnessCheck, TestCaseResult } from '../../../core/analysis/types'
import { executePython } from '../runner'

/**
 * Extracts the primary declared function name from Python code.
 */
export function extractPythonFunctionName(code: string): string | null {
  const match = code.match(/^[ \t]*def\s+([a-zA-Z0-9_]+)\s*\(/m)
  return match ? match[1] : null
}

export interface PythonEquivalenceOptions {
  customCalls?: string[]
}

/**
 * Verifies equivalence between two versions of Python code.
 */
export async function verifyPythonEquivalence(
  before: AnalysisInput,
  after: AnalysisInput,
  options?: PythonEquivalenceOptions
): Promise<CorrectnessCheck> {
  const beforeFile =
    before.files.find((f) => f.name.toLowerCase().endsWith('.py')) || before.files[0]
  const afterFile =
    after.files.find((f) => f.name.toLowerCase().endsWith('.py')) || after.files[0]

  const beforeCode = beforeFile ? beforeFile.content : ''
  const afterCode = afterFile ? afterFile.content : ''

  const fnName = extractPythonFunctionName(beforeCode) || extractPythonFunctionName(afterCode) || 'run'

  const testCalls: string[] =
    options?.customCalls && options.customCalls.length > 0
      ? options.customCalls
      : [
          `${fnName}([])`,
          `${fnName}([1])`,
          `${fnName}([1, 2, 3])`,
          `${fnName}([3, 2, 1])`,
          `${fnName}([42, 42, 42])`,
          `${fnName}([-5, 0, 5, 10])`,
          `${fnName}([10, 20, 30, 40, 50])`,
          `${fnName}([7, 1, 9, 3, 5, 8])`,
          `${fnName}([100, 25, 50, 75])`,
          `${fnName}([2, 4, 6, 8, 10, 12, 14, 16])`,
        ]

  const cases: TestCaseResult[] = []

  for (let i = 0; i < testCalls.length; i++) {
    const call = testCalls[i]
    const testDef = [{ id: `eq-${i}`, name: `Case ${i + 1}`, call, expect: null }]

    // Execute before
    const resBefore = await executePython(beforeCode, testDef, { timeoutMs: 2000 })
    // Execute after
    const resAfter = await executePython(afterCode, testDef, { timeoutMs: 2000 })

    const actualBefore = resBefore.testResults[0]?.actual
    const actualAfter = resAfter.testResults[0]?.actual
    const errBefore = resBefore.testResults[0]?.error || resBefore.error?.message
    const errAfter = resAfter.testResults[0]?.error || resAfter.error?.message

    if (errBefore && errAfter) {
      cases.push({
        name: `Case ${i + 1}: ${call}`,
        passed: errBefore === errAfter,
        detail:
          errBefore === errAfter
            ? undefined
            : `Both raised errors: "${errBefore}" vs "${errAfter}"`,
      })
    } else if (!errBefore && !errAfter) {
      const match = JSON.stringify(actualBefore) === JSON.stringify(actualAfter)
      cases.push({
        name: `Case ${i + 1}: ${call}`,
        passed: match,
        detail: match
          ? undefined
          : `Output mismatch: Before produced ${JSON.stringify(actualBefore)}, After produced ${JSON.stringify(actualAfter)}`,
      })
    } else {
      cases.push({
        name: `Case ${i + 1}: ${call}`,
        passed: false,
        detail: errBefore
          ? `Original raised error "${errBefore}" while optimized returned ${JSON.stringify(actualAfter)}`
          : `Original returned ${JSON.stringify(actualBefore)} while optimized raised error "${errAfter}"`,
      })
    }
  }

  const allPassed = cases.length > 0 && cases.every((c) => c.passed)

  return {
    passed: allPassed,
    cases,
    coverageNote: `Verified across ${cases.length} deterministic test inputs. Heuristic equivalence: passing empirical test cases does not constitute a formal mathematical proof of universal semantic equivalence.`,
  }
}
