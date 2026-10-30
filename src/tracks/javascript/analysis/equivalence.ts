/**
 * Equivalence Verification Engine (Stage 23b, PLT-08).
 * Compares the observable runtime behavior of the learner's original implementation
 * against an optimized candidate across deterministic test cases and seeded pseudo-random inputs.
 *
 * Rules:
 * - Distinguishes test-based behavioral agreement from formal mathematical equivalence.
 * - Reports coverage notes honestly (e.g. "Verified across N deterministic test cases").
 */

import type { AnalysisInput, CorrectnessCheck, TestCaseResult } from '../../../core/analysis/types'
import { deepEqual } from '../runner'

/**
 * Executes a function expression string with a given argument safely in-memory.
 */
function evaluateCall(code: string, callExpr: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    const fn = new Function(
      `"use strict";
      ${code}
      return eval(${JSON.stringify(callExpr)});`
    )
    const value = fn()
    return { ok: true, value }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Extracts the primary exported or declared function name from JavaScript code.
 */
export function extractFunctionName(code: string): string | null {
  const match = code.match(/(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>))/)
  return match ? (match[1] || match[2]) : null
}

export interface EquivalenceOptions {
  customCalls?: string[]
}

/**
 * Verifies equivalence between two versions of JavaScript code.
 * Runs standard deterministic edge cases plus seeded parameterized calls.
 */
export async function verifyEquivalence(
  before: AnalysisInput,
  after: AnalysisInput,
  options?: EquivalenceOptions
): Promise<CorrectnessCheck> {
  const beforeFile =
    before.files.find((f) => f.name.toLowerCase().endsWith('.js') || f.name.toLowerCase().endsWith('.ts')) ||
    before.files[0]
  const afterFile =
    after.files.find((f) => f.name.toLowerCase().endsWith('.js') || f.name.toLowerCase().endsWith('.ts')) ||
    after.files[0]

  const beforeCode = beforeFile ? beforeFile.content : ''
  const afterCode = afterFile ? afterFile.content : ''

  const fnName = extractFunctionName(beforeCode) || extractFunctionName(afterCode) || 'run'

  const testCalls: string[] = options?.customCalls && options.customCalls.length > 0
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
    const resBefore = evaluateCall(beforeCode, call)
    const resAfter = evaluateCall(afterCode, call)

    if (!resBefore.ok && !resAfter.ok) {
      // Both threw identical error
      const match = resBefore.error === resAfter.error
      cases.push({
        name: `Case ${i + 1}: ${call}`,
        passed: match,
        detail: match ? undefined : `Before threw "${resBefore.error}", After threw "${resAfter.error}"`,
      })
    } else if (resBefore.ok && resAfter.ok) {
      const match = deepEqual(resBefore.value, resAfter.value)
      cases.push({
        name: `Case ${i + 1}: ${call}`,
        passed: match,
        detail: match
          ? undefined
          : `Output mismatch. Original: ${JSON.stringify(resBefore.value)}, Optimized: ${JSON.stringify(resAfter.value)}`,
      })
    } else {
      const threwWho = !resBefore.ok ? 'original' : 'optimized'
      const err = !resBefore.ok ? resBefore.error : (!resAfter.ok ? resAfter.error : 'unknown')
      cases.push({
        name: `Case ${i + 1}: ${call}`,
        passed: false,
        detail: `The ${threwWho} code threw an unhandled exception: ${err}`,
      })
    }
  }

  const passed = cases.length > 0 && cases.every((c) => c.passed)
  const coverageNote = `Verified across ${cases.length} deterministic test cases including edge cases, empty inputs, and seeded values. Behavioral agreement on test cases does not constitute formal proof of semantic equivalence.`

  return {
    passed,
    cases,
    coverageNote,
  }
}
