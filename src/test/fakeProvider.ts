/**
 * Fake Analysis Provider for Testing Only.
 * Conforms to STAGE_20 specification §1, §6, §12.
 *
 * CRITICAL SAFETY REQUIREMENT:
 * This provider is for tests exclusively. It must NEVER be registered
 * in production builds or production application runtime code.
 */

import type {
  AnalysisInput,
  AnalysisProvider,
  ComplexityEstimate,
  CorrectnessCheck,
  OptimisationSuggestion,
} from '../core/analysis/types'

export function createValidFakeEstimate(): ComplexityEstimate {
  return {
    time: {
      worst: 'O(n^2)',
      average: 'O(n log n)',
      best: 'O(n)',
    },
    auxiliarySpace: 'O(1)',
    confidence: 'high',
    assumptions: [
      'n is the number of elements in the input collection',
      'Basic arithmetic comparisons execute in O(1) time',
    ],
    limitations: [
      'Does not model dynamic memory allocation overhead',
      'Assumes standard runtime call-stack limits',
    ],
    explanation: {
      summary: 'Outer loop iterates n times while nested loop performs partition operations.',
      steps: [
        {
          text: 'Outer loop scans the array from index 0 to n - 1',
          range: { file: 'index.js', startLine: 2, startCol: 2, endLine: 8, endCol: 4 },
          contributes: 'O(n)',
        },
        {
          text: 'Inner comparison scans remaining elements',
          range: { file: 'index.js', startLine: 4, startCol: 4, endLine: 6, endCol: 6 },
          contributes: 'O(n^2)',
        },
      ],
    },
    bottlenecks: [
      {
        range: { file: 'index.js', startLine: 4, startCol: 4, endLine: 6, endCol: 6 },
        reason: 'Quadratic nested loop dominates execution time on large collections',
        contributes: 'O(n^2)',
        rank: 1,
      },
    ],
    method: 'static-ast',
    isFormalProof: false,
  }
}

export function createFakeSuggestions(): OptimisationSuggestion[] {
  return [
    {
      id: 'opt-hash-map',
      title: 'Use hash lookup instead of nested loop',
      rationale: 'Pre-indexing values in a Map reduces inner search from O(n) to O(1).',
      expected: {
        time: 'O(n)',
        auxiliarySpace: 'O(n)',
      },
      risk: 'low',
      patch: {
        files: [
          {
            name: 'solution-optimised.js',
            language: 'javascript',
            content: '// Optimised solution using Map lookup\nfunction solve(arr) {\n  const seen = new Set();\n  for (const x of arr) seen.add(x);\n  return seen;\n}\n',
          },
        ],
      },
      requiresCorrectnessCheck: true,
    },
  ]
}

export const fakeTestProvider: AnalysisProvider = {
  id: 'fake-test-provider',
  language: 'javascript',
  version: '1.0.0-test',
  supports(_input: AnalysisInput) {
    return { ok: true }
  },
  async analyze(_input: AnalysisInput, _signal: AbortSignal): Promise<ComplexityEstimate> {
    return createValidFakeEstimate()
  },
  async suggest(_input: AnalysisInput, _estimate: ComplexityEstimate): Promise<OptimisationSuggestion[]> {
    return createFakeSuggestions()
  },
  async verifyEquivalence(
    _before: AnalysisInput,
    _after: AnalysisInput
  ): Promise<CorrectnessCheck> {
    return {
      passed: true,
      cases: [
        { name: 'Handles empty array', passed: true },
        { name: 'Handles sorted array', passed: true },
        { name: 'Handles reverse sorted array', passed: true },
        { name: 'Handles duplicate items', passed: true },
      ],
      coverageNote: 'Verified across 4 equivalence test suites',
    }
  },
}
