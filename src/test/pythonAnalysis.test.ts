import { describe, it, expect } from 'vitest'
import { pyAstProvider } from '../tracks/python/analysis/provider'
import { verifyPythonEquivalence } from '../tracks/python/analysis/equivalence'

interface AnalysisFixture {
  name: string
  code: string
  expectedTime: string
  expectedSpace: string
  expectedConfidence: 'high' | 'medium' | 'low'
  category: 'constant' | 'linear' | 'quadratic' | 'cubic' | 'logarithmic' | 'exponential' | 'sort' | 'comprehension' | 'unsupported'
}

const FIXTURES: AnalysisFixture[] = [
  // Constant Time & Space
  {
    name: '01_constant_return_literal',
    code: 'def f(x):\n    return 42',
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'constant',
  },
  {
    name: '02_constant_arithmetic',
    code: 'def f(a, b):\n    return (a + b) * 2 - 5',
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'constant',
  },
  {
    name: '03_constant_indexing',
    code: 'def f(items):\n    return items[0]',
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'constant',
  },

  // Linear Time
  {
    name: '04_single_for_loop',
    code: 'def f(arr):\n    total = 0\n    for x in arr:\n        total += x\n    return total',
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'linear',
  },
  {
    name: '05_while_loop_linear',
    code: 'def f(n):\n    i = 0\n    while i < n:\n        i += 1\n    return i',
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'linear',
  },
  {
    name: '06_two_sequential_loops',
    code: 'def f(arr):\n    for x in arr:\n        pass\n    for y in arr:\n        pass',
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'linear',
  },
  {
    name: '07_built_in_sum',
    code: 'def f(arr):\n    return sum(arr)',
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'linear',
  },
  {
    name: '08_built_in_min_max',
    code: 'def f(arr):\n    return min(arr) + max(arr)',
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'linear',
  },
  {
    name: '09_built_in_index_search',
    code: 'def f(arr, target):\n    return arr.index(target)',
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'linear',
  },
  {
    name: '10_linear_recursion_factorial',
    code: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)',
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    category: 'linear',
  },
  {
    name: '11_list_append_accumulation',
    code: 'def f(arr):\n    res = []\n    for x in arr:\n        res.append(x * 2)\n    return res',
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    category: 'linear',
  },

  // Quadratic Time
  {
    name: '12_nested_for_loops',
    code: 'def f(matrix):\n    total = 0\n    for row in matrix:\n        for val in row:\n            total += val\n    return total',
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'quadratic',
  },
  {
    name: '13_nested_while_loops',
    code: 'def f(n):\n    i = 0\n    while i < n:\n        j = 0\n        while j < n:\n            j += 1\n        i += 1',
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'quadratic',
  },
  {
    name: '14_linear_search_inside_loop',
    code: 'def find_common(list1, list2):\n    common = []\n    for x in list1:\n        if x in list2:\n            common.append(x)\n    return common',
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    category: 'quadratic',
  },
  {
    name: '15_nested_loop_with_break',
    code: 'def f(arr):\n    for x in arr:\n        for y in arr:\n            if x == y:\n                break',
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'quadratic',
  },

  // Cubic Time
  {
    name: '16_triple_nested_loops',
    code: 'def f(n):\n    for i in range(n):\n        for j in range(n):\n            for k in range(n):\n                pass',
    expectedTime: 'O(n^3)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'cubic',
  },

  // Logarithmic Time
  {
    name: '17_binary_halving_while_loop',
    code: 'def f(n):\n    while n > 1:\n        n //= 2\n    return n',
    expectedTime: 'O(log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'logarithmic',
  },
  {
    name: '18_recursive_binary_halving',
    code: 'def binary_dive(n):\n    if n <= 1:\n        return n\n    return binary_dive(n // 2)',
    expectedTime: 'O(log n)',
    expectedSpace: 'O(log n)',
    expectedConfidence: 'high',
    category: 'logarithmic',
  },

  // Sorting
  {
    name: '19_built_in_sorted',
    code: 'def f(arr):\n    return sorted(arr)',
    expectedTime: 'O(n log n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    category: 'sort',
  },
  {
    name: '20_built_in_sort_method',
    code: 'def f(arr):\n    arr.sort()\n    return arr',
    expectedTime: 'O(n log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'sort',
  },
  {
    name: '21_sort_and_linear_scan',
    code: 'def f(arr):\n    s = sorted(arr)\n    for x in s:\n        pass\n    return s',
    expectedTime: 'O(n log n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    category: 'sort',
  },

  // Comprehensions
  {
    name: '22_list_comprehension_single',
    code: 'def f(arr):\n    return [x * 2 for x in arr]',
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    category: 'comprehension',
  },
  {
    name: '23_dict_comprehension',
    code: 'def f(keys):\n    return {k: 0 for k in keys}',
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    category: 'comprehension',
  },
  {
    name: '24_set_comprehension',
    code: 'def f(items):\n    return {x for x in items}',
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    category: 'comprehension',
  },
  {
    name: '25_nested_list_comprehension',
    code: 'def f(n):\n    return [i * j for i in range(n) for j in range(n)]',
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(n^2)',
    expectedConfidence: 'high',
    category: 'comprehension',
  },

  // Space Allocations
  {
    name: '26_list_multiplication_allocation',
    code: 'def f(n):\n    return [0] * n',
    expectedTime: 'O(1)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    category: 'constant',
  },
  {
    name: '27_matrix_zero_allocation',
    code: 'def f(n):\n    return [[0] * n for _ in range(n)]',
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(n^2)',
    expectedConfidence: 'high',
    category: 'comprehension',
  },

  // Branching / Exponential Recursion
  {
    name: '28_branching_fibonacci_recursion',
    code: 'def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)',
    expectedTime: 'O(2^n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    category: 'exponential',
  },

  // Set lookup in loop (Linear total)
  {
    name: '29_set_lookup_in_loop',
    code: 'def f(queries, target_set):\n    count = 0\n    for q in queries:\n        if q in target_set:\n            count += 1\n    return count',
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    category: 'linear',
  },

  // Unsupported / Low Confidence constructs (Honesty contract L-09)
  {
    name: '30_unsupported_eval',
    code: 'def f(code_str):\n    return eval(code_str)',
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'low',
    category: 'unsupported',
  },
  {
    name: '31_unsupported_exec',
    code: 'def f(code_str):\n    exec(code_str)',
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'low',
    category: 'unsupported',
  },
  {
    name: '32_syntax_error_recovery',
    code: 'def f(incomplete_syntax:\n    pass',
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'low',
    category: 'unsupported',
  },
]

describe('Stage 25b: Python AST Analysis Provider (PLT-09, L-09)', () => {
  describe('1. 32 Labelled Complexity Fixtures & Measured Precision', () => {
    let supportedCount = 0
    let supportedMatches = 0

    for (const fixture of FIXTURES) {
      it(`analyzes ${fixture.name} -> expected time: ${fixture.expectedTime}, space: ${fixture.expectedSpace}`, async () => {
        const input = {
          language: 'python',
          files: [{ name: 'solution.py', language: 'python', content: fixture.code }],
        }

        const estimate = await pyAstProvider.analyze(input, new AbortController().signal)

        // Verify honesty contract
        expect(estimate.isFormalProof).toBe(false)
        expect(estimate.method).toBe('static-ast')
        expect(estimate.assumptions.length).toBeGreaterThan(0)
        expect(estimate.limitations.length).toBeGreaterThan(0)
        expect(estimate.confidence).toBe(fixture.expectedConfidence)

        if (fixture.expectedConfidence === 'high') {
          supportedCount++
          const timeMatches = estimate.time.worst === fixture.expectedTime
          const spaceMatches = estimate.auxiliarySpace === fixture.expectedSpace
          if (timeMatches && spaceMatches) {
            supportedMatches++
          }
          expect(estimate.time.worst).toBe(fixture.expectedTime)
          expect(estimate.auxiliarySpace).toBe(fixture.expectedSpace)
        } else {
          // Unsupported / low confidence fixtures
          expect(estimate.confidence).toBe('low')
        }
      })
    }

    it('achieves >= 90% precision on supported Python AST fixtures', () => {
      const precision = (supportedMatches / supportedCount) * 100
      expect(supportedCount).toBe(29)
      expect(precision).toBeGreaterThanOrEqual(90)
    })
  })

  describe('2. Explanations and Ranked Bottlenecks', () => {
    it('generates ranked bottlenecks for nested loops', async () => {
      const code = `
for i in range(10):
    for j in range(10):
        print(i, j)
`
      const estimate = await pyAstProvider.analyze({
        language: 'python',
        files: [{ name: 'solution.py', language: 'python', content: code }],
      }, new AbortController().signal)

      expect(estimate.bottlenecks.length).toBeGreaterThan(0)
      expect(estimate.bottlenecks[0].contributes).toBe('O(n^2)')
      expect(estimate.explanation.steps.length).toBeGreaterThan(0)
    })
  })

  describe('3. Curated Optimisation Suggestions & Equivalence', () => {
    it('suggests converting list membership to set lookup for quadratic search', async () => {
      const code = `
def find_matches(items, pool):
    matches = []
    for item in items:
        if item in pool:
            matches.append(item)
    return matches
`
      const estimate = await pyAstProvider.analyze({
        language: 'python',
        files: [{ name: 'solution.py', language: 'python', content: code }],
      }, new AbortController().signal)

      const suggestions = await pyAstProvider.suggest!({
        language: 'python',
        files: [{ name: 'solution.py', language: 'python', content: code }],
      }, estimate)

      expect(suggestions.length).toBe(1)
      expect(suggestions[0].id).toBe('sugg-py-set-lookup')
      expect(suggestions[0].expected.time).toBe('O(n)')
      expect(suggestions[0].patch?.files[0].content).toContain('lookup_set = set(pool)')
    })

    it('verifies equivalence between before and after implementations', async () => {
      const beforeCode = `
def double_values(arr):
    res = []
    for x in arr:
        res.append(x * 2)
    return res
`
      const afterCode = `
def double_values(arr):
    return [x * 2 for x in arr]
`
      const check = await verifyPythonEquivalence(
        { language: 'python', files: [{ name: 'solution.py', language: 'python', content: beforeCode }] },
        { language: 'python', files: [{ name: 'solution.py', language: 'python', content: afterCode }] }
      )

      expect(check.passed).toBe(true)
      expect(check.cases.length).toBe(10)
      expect(check.coverageNote).toContain('Heuristic equivalence')
    })
  })
})
