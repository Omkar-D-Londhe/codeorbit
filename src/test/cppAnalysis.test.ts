import { describe, expect, it } from 'vitest'
import { cppStaticProvider } from '../tracks/cpp/analysis/provider'
import { CPP_FIXTURES } from '../tracks/cpp/analysis/fixtures/index'

describe('C++ Static AST Complexity Provider (Stage 26, PLT-10, O-04)', () => {
  it('supports cpp source files and enforces 50 kB cap', () => {
    expect(cppStaticProvider.supports({ language: 'cpp', files: [{ name: 'main.cpp', language: 'cpp', content: 'int main(){}' }] }).ok).toBe(true)
    expect(cppStaticProvider.supports({ language: 'python', files: [{ name: 'test.py', language: 'python', content: '' }] }).ok).toBe(false)

    const bigCode = 'a'.repeat(51 * 1024)
    expect(cppStaticProvider.supports({ language: 'cpp', files: [{ name: 'big.cpp', language: 'cpp', content: bigCode }] }).ok).toBe(false)
  })

  it('accurately estimates complexity across all 22 C++ fixtures with maxConfidence <= medium', async () => {
    expect(CPP_FIXTURES.length).toBe(22)

    for (const fixture of CPP_FIXTURES) {
      const estimate = await cppStaticProvider.analyze({
        language: 'cpp',
        files: [{ name: 'main.cpp', language: 'cpp', content: fixture.code }],
      })

      expect(estimate.time.worst).toBe(fixture.expectedTime)
      expect(estimate.auxiliarySpace).toBe(fixture.expectedSpace)
      expect(estimate.confidence).toBe(fixture.expectedConfidence)

      // Strict Stage 26 constraints:
      expect(['low', 'medium']).toContain(estimate.confidence)
      expect(estimate.confidence).not.toBe('high')
      expect(estimate.isFormalProof).toBe(false)
      expect(estimate.method).toBe('static-ast')
      expect(estimate.limitations.length).toBeGreaterThanOrEqual(4)
      expect(estimate.assumptions.length).toBeGreaterThanOrEqual(1)
      expect(estimate.explanation.summary).toBeTruthy()
    }
  })

  it('provides optimisation suggestions for quadratic and exponential code', async () => {
    const quadCode = `int count(int n) {
      int c = 0;
      for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) { c++; }
      }
      return c;
    }`
    const estimate = await cppStaticProvider.analyze({
      language: 'cpp',
      files: [{ name: 'main.cpp', language: 'cpp', content: quadCode }],
    })
    expect(estimate.time.worst).toBe('O(n^2)')

    const suggestions = await cppStaticProvider.suggest?.({
      language: 'cpp',
      files: [{ name: 'main.cpp', language: 'cpp', content: quadCode }],
    }, estimate)

    expect(suggestions).toBeDefined()
    expect(suggestions?.length).toBeGreaterThan(0)
    expect(suggestions?.[0].expected.time).toBe('O(n)')
  })
})
