import { describe, expect, it } from 'vitest'
import { javaStaticProvider } from '../tracks/java/analysis/provider'
import { JAVA_FIXTURES } from '../tracks/java/analysis/fixtures/index'

describe('Java Static AST Complexity Provider (Stage 26, PLT-10, O-04)', () => {
  it('supports java source files and enforces 50 kB cap', () => {
    expect(javaStaticProvider.supports({ language: 'java', files: [{ name: 'Test.java', language: 'java', content: 'class A{}' }] }).ok).toBe(true)
    expect(javaStaticProvider.supports({ language: 'python', files: [{ name: 'test.py', language: 'python', content: '' }] }).ok).toBe(false)

    const bigCode = 'a'.repeat(51 * 1024)
    expect(javaStaticProvider.supports({ language: 'java', files: [{ name: 'Big.java', language: 'java', content: bigCode }] }).ok).toBe(false)
  })

  it('accurately estimates complexity across all 22 Java fixtures with maxConfidence <= medium', async () => {
    expect(JAVA_FIXTURES.length).toBe(22)

    for (const fixture of JAVA_FIXTURES) {
      const estimate = await javaStaticProvider.analyze({
        language: 'java',
        files: [{ name: 'Main.java', language: 'java', content: fixture.code }],
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
    const quadCode = `public class Test {
      public static int count(int n) {
        int c = 0;
        for (int i = 0; i < n; i++) {
          for (int j = 0; j < n; j++) { c++; }
        }
        return c;
      }
    }`
    const estimate = await javaStaticProvider.analyze({
      language: 'java',
      files: [{ name: 'Test.java', language: 'java', content: quadCode }],
    })
    expect(estimate.time.worst).toBe('O(n^2)')

    const suggestions = await javaStaticProvider.suggest?.({
      language: 'java',
      files: [{ name: 'Test.java', language: 'java', content: quadCode }],
    }, estimate)

    expect(suggestions).toBeDefined()
    expect(suggestions?.length).toBeGreaterThan(0)
    expect(suggestions?.[0].expected.time).toBe('O(n)')
  })
})
