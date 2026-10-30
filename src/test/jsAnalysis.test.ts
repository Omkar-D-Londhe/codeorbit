import { describe, it, expect } from 'vitest'
import { jsProvider } from '../tracks/javascript/analysis/provider'
import { FIXTURES } from '../tracks/javascript/analysis/fixtures'
import { validateEstimate } from '../core/analysis/validate'
import { verifyEquivalence } from '../tracks/javascript/analysis/equivalence'
import { measureFunctionTiming } from '../tracks/javascript/analysis/measure'
import { analysisRegistry } from '../core/analysis/registry'

describe('Stage 23b: JavaScript Analysis Provider & Fixtures (PLT-08)', () => {
  it('registers with correct provider metadata and capabilities', () => {
    expect(jsProvider.id).toBe('js-static-v1')
    expect(jsProvider.language).toBe('javascript')
    expect(jsProvider.version).toBe('1.0.0')

    analysisRegistry.register(jsProvider)
    expect(analysisRegistry.get('javascript')).toBe(jsProvider)
    expect(analysisRegistry.has('javascript')).toBe(true)
  })

  it('correctly reports support status and enforces line-count limits', () => {
    expect(jsProvider.supports({ language: 'python', files: [{ name: 'test.py', language: 'python', content: '' }] }).ok).toBe(false)
    expect(jsProvider.supports({ language: 'javascript', files: [{ name: 'test.js', language: 'javascript', content: 'console.log(1);' }] }).ok).toBe(true)

    const hugeCode = new Array(600).fill('let x = 1;').join('\n')
    const hugeSupport = jsProvider.supports({ language: 'javascript', files: [{ name: 'huge.js', language: 'javascript', content: hugeCode }] })
    expect(hugeSupport.ok).toBe(false)
    if (!hugeSupport.ok) {
      expect(hugeSupport.reason).toContain('exceeds the static analysis limit of 500 lines')
    }
  })

  it('analyzes all >= 30 labelled fixtures with >= 90% precision on supported constructs', async () => {
    expect(FIXTURES.length).toBeGreaterThanOrEqual(30)

    let supportedCount = 0
    let exactTimeMatchCount = 0

    for (const fixture of FIXTURES) {
      const input = {
        language: 'javascript',
        files: [{ name: 'test.js', language: 'javascript', content: fixture.code }],
      }

      const estimate = await jsProvider.analyze(input, new AbortController().signal)

      // Validate through the formal validation gate
      const valResult = validateEstimate(estimate, input)
      expect(
        valResult.ok,
        `Fixture "${fixture.name}" failed validateEstimate: ${!valResult.ok ? valResult.error.message : ''}`
      ).toBe(true)

      // Assert non-proof and non-empty assumptions/limitations
      expect(estimate.isFormalProof).toBe(false)
      expect(estimate.assumptions.length).toBeGreaterThan(0)
      expect(estimate.limitations.length).toBeGreaterThan(0)

      if (fixture.isSupported) {
        supportedCount++
        if (estimate.time.worst === fixture.expectedTime) {
          exactTimeMatchCount++
        } else {
          // If not exact match, must be flagged with lower confidence or limitation (never silently wrong!)
          expect(['medium', 'low']).toContain(estimate.confidence)
        }
      } else {
        // Unsupported constructs must report low confidence or limitations
        expect(['medium', 'low']).toContain(estimate.confidence)
        expect(estimate.limitations.length).toBeGreaterThan(0)
      }
    }

    const precision = exactTimeMatchCount / supportedCount
    expect(precision).toBeGreaterThanOrEqual(0.9)
  })

  it('produces valid source ranges within file bounds for explanations and bottlenecks', async () => {
    const code = `function sample(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      sum += arr[i] * arr[j];
    }
  }
  return sum;
}`

    const input = {
      language: 'javascript',
      files: [{ name: 'sample.js', language: 'javascript', content: code }],
    }

    const estimate = await jsProvider.analyze(input, new AbortController().signal)

    expect(estimate.time.worst).toBe('O(n^2)')
    expect(estimate.explanation.steps.length).toBeGreaterThan(0)
    expect(estimate.bottlenecks.length).toBeGreaterThan(0)

    const lineCount = code.split('\n').length
    for (const step of estimate.explanation.steps) {
      if (step.range) {
        expect(step.range.startLine).toBeGreaterThanOrEqual(1)
        expect(step.range.endLine).toBeLessThanOrEqual(lineCount)
        expect(step.range.endLine).toBeGreaterThanOrEqual(step.range.startLine)
      }
    }

    for (const b of estimate.bottlenecks) {
      expect(b.range.startLine).toBeGreaterThanOrEqual(1)
      expect(b.range.endLine).toBeLessThanOrEqual(lineCount)
      expect(b.contributes).toBe('O(n^2)')
      expect(b.rank).toBe(1)
    }
  })

  it('suggests Set lookup optimization when quadratic nested includes is detected', async () => {
    const quadraticCode = `function hasCommon(a, b) {
  const common = [];
  for (const x of a) {
    if (b.includes(x)) {
      common.push(x);
    }
  }
  return common;
}`

    const input = {
      language: 'javascript',
      files: [{ name: 'solution.js', language: 'javascript', content: quadraticCode }],
    }

    const estimate = await jsProvider.analyze(input, new AbortController().signal)
    expect(estimate.time.worst).toBe('O(n^2)')

    const suggestions = await jsProvider.suggest!(input, estimate)
    expect(suggestions.length).toBeGreaterThanOrEqual(1)

    const sugg = suggestions[0]
    expect(sugg.title).toContain('Use a Set for O(1) lookups')
    expect(sugg.expected.time).toBe('O(n)')
    expect(sugg.requiresCorrectnessCheck).toBe(true)
    expect(sugg.patch).toBeDefined()
    expect(sugg.patch?.files[0].content).toContain('new Set')
  })

  it('verifies equivalence between original and optimized implementations', async () => {
    const original = {
      language: 'javascript',
      files: [
        {
          name: 'solution.js',
          language: 'javascript',
          content: `function contains(arr) {
            return arr.filter((x) => x > 2);
          }`,
        },
      ],
    }

    const equivalent = {
      language: 'javascript',
      files: [
        {
          name: 'solution.js',
          language: 'javascript',
          content: `function contains(arr) {
            const res = [];
            for (let i = 0; i < arr.length; i++) {
              if (arr[i] > 2) res.push(arr[i]);
            }
            return res;
          }`,
        },
      ],
    }

    const nonEquivalent = {
      language: 'javascript',
      files: [
        {
          name: 'solution.js',
          language: 'javascript',
          content: `function contains(arr) {
            return [999]; // Completely different output
          }`,
        },
      ],
    }

    const checkPass = await verifyEquivalence(original, equivalent)
    expect(checkPass.passed).toBe(true)
    expect(checkPass.coverageNote).toContain('Verified across 10 deterministic test cases')

    const checkFail = await verifyEquivalence(original, nonEquivalent)
    expect(checkFail.passed).toBe(false)
    expect(checkFail.cases.some((c) => !c.passed)).toBe(true)
  })

  it('conducts empirical execution timing measurement with environment note', () => {
    const fn = (arr: number[]) => {
      let sum = 0
      for (let i = 0; i < arr.length; i++) sum += arr[i]
      return sum
    }

    const res = measureFunctionTiming(fn, [100, 200, 400], 3)
    expect(res.inputSizes).toEqual([100, 200, 400])
    expect(res.timingsMs.length).toBe(3)
    expect(res.environmentNote).toContain('not an asymptotic proof')
  })
})
