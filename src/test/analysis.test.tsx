import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import {
  CANONICAL_COMPLEXITY_ORDER,
  compareComplexity,
  formatComplexityAriaLabel,
  isValidComplexityClass,
  normalizeComplexityClass,
} from '../core/analysis/complexityOrder'
import { ComplexityDisplay } from '../core/analysis/ComplexityDisplay'
import { validateEstimate } from '../core/analysis/validate'
import { analysisRegistry } from '../core/analysis/registry'
import { AnalysisPanel } from '../core/analysis/AnalysisPanel'
import { OptimisationPanel } from '../core/analysis/OptimisationPanel'
import { ComparisonView } from '../core/analysis/ComparisonView'
import {
  createFakeSuggestions,
  createValidFakeEstimate,
  fakeTestProvider,
} from './fakeProvider'
import type { Comparison, OptimisationSuggestion } from '../core/analysis/types'
import { buildExport } from '../core/storage/exportImport'
import { createDefaultState, saveState } from '../lib/storage'

describe('Stage 20b: Complexity Analysis and Optimisation Framework', () => {
  beforeEach(() => {
    analysisRegistry.clear()
  })

  afterEach(() => {
    analysisRegistry.clear()
  })

  describe('1. Big-O Complexity Ordering and Normalisation', () => {
    it('maintains the strict canonical Big-O ordering sequence', () => {
      expect(CANONICAL_COMPLEXITY_ORDER).toEqual([
        'O(1)',
        'O(log n)',
        'O(n)',
        'O(n log n)',
        'O(n^2)',
        'O(n^3)',
        'O(2^n)',
        'O(n!)',
      ])

      for (let i = 0; i < CANONICAL_COMPLEXITY_ORDER.length - 1; i++) {
        const lower = CANONICAL_COMPLEXITY_ORDER[i]
        const higher = CANONICAL_COMPLEXITY_ORDER[i + 1]
        const cmp = compareComplexity(lower, higher)
        expect(cmp).toBeDefined()
        expect(cmp!).toBeLessThan(0) // lower order is faster/better
      }
    })

    it('normalises varied representations into canonical forms', () => {
      expect(normalizeComplexityClass('O(1)')).toBe('O(1)' )
      expect(normalizeComplexityClass('O(logn)')).toBe('O(log n)')
      expect(normalizeComplexityClass('o(log(n))')).toBe('O(log n)')
      expect(normalizeComplexityClass('O(N)')).toBe('O(n)')
      expect(normalizeComplexityClass('O(nlogn)')).toBe('O(n log n)')
      expect(normalizeComplexityClass('O(n * log(n))')).toBe('O(n log n)')
      expect(normalizeComplexityClass('o(n^2)')).toBe('O(n^2)')
      expect(normalizeComplexityClass('O(n2)')).toBe('O(n^2)')
      expect(normalizeComplexityClass('O(n**2)')).toBe('O(n^2)')
      expect(normalizeComplexityClass('O(n^3)')).toBe('O(n^3)')
      expect(normalizeComplexityClass('O(2^n)')).toBe('O(2^n)')
      expect(normalizeComplexityClass('O(2**n)')).toBe('O(2^n)')
      expect(normalizeComplexityClass('O(n!)')).toBe('O(n!)')
    })

    it('returns undefined for unknown or unrecognised classes and never guesses', () => {
      expect(normalizeComplexityClass('O(fast)')).toBeUndefined()
      expect(normalizeComplexityClass('linear')).toBeUndefined()
      expect(normalizeComplexityClass('')).toBeUndefined()
      expect(normalizeComplexityClass(undefined)).toBeUndefined()
      expect(isValidComplexityClass('O(foo)')).toBe(false)
      expect(compareComplexity('O(n)', 'O(unknown)')).toBeUndefined()
    })

    it('provides spoken accessibility labels for screen readers', () => {
      expect(formatComplexityAriaLabel('O(1)')).toBe('O of 1')
      expect(formatComplexityAriaLabel('O(log n)')).toBe('O of log n')
      expect(formatComplexityAriaLabel('O(n)')).toBe('O of n')
      expect(formatComplexityAriaLabel('O(n log n)')).toBe('O of n log n')
      expect(formatComplexityAriaLabel('O(n^2)')).toBe('O of n squared')
      expect(formatComplexityAriaLabel('O(n^3)')).toBe('O of n cubed')
      expect(formatComplexityAriaLabel('O(2^n)')).toBe('O of 2 to the n')
      expect(formatComplexityAriaLabel('O(n!)')).toBe('O of n factorial')
    })

    it('renders complexity classes with <sup> and spoken aria-label (§13 acceptance criterion)', () => {
      const { container } = render(<ComplexityDisplay value="O(n^2)" />)
      const span = container.querySelector('span')
      expect(span).toBeTruthy()
      expect(span?.getAttribute('aria-label')).toBe('O of n squared')
      expect(span?.querySelector('sup')?.textContent).toBe('2')
      expect(span?.textContent).toBe('O(n2)')
    })

    it('renders O(2^n) with <sup>n</sup> and aria-label', () => {
      const { container } = render(<ComplexityDisplay value="O(2^n)" />)
      const span = container.querySelector('span')
      expect(span?.getAttribute('aria-label')).toBe('O of 2 to the n')
      expect(span?.querySelector('sup')?.textContent).toBe('n')
    })
  })

  describe('2. Complexity Estimate Validation (validateEstimate)', () => {
    it('accepts a fully valid estimate', () => {
      const valid = createValidFakeEstimate()
      const res = validateEstimate(valid, {
        language: 'javascript',
        files: [{ name: 'index.js', language: 'javascript', content: 'line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\n' }],
      })
      expect(res.ok).toBe(true)
      if (res.ok) {
        expect(res.value.time.worst).toBe('O(n^2)')
        expect(res.value.auxiliarySpace).toBe('O(1)')
        expect(res.value.isFormalProof).toBe(false)
      }
    })

    it('rejects estimates claiming to be formal proofs (§13 acceptance criterion)', () => {
      const invalid = { ...createValidFakeEstimate(), isFormalProof: true }
      const res = validateEstimate(invalid)
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.error.code).toBe('invalid-result')
        expect(res.error.message).toContain('formal proof')
      }
    })

    it('rejects assumption-free or empty-limitation estimates (§13 acceptance criterion)', () => {
      const noAssumptions = { ...createValidFakeEstimate(), assumptions: [] }
      const res1 = validateEstimate(noAssumptions)
      expect(res1.ok).toBe(false)
      if (!res1.ok) {
        expect(res1.error.code).toBe('invalid-result')
        expect(res1.error.message).toContain('Assumptions')
      }

      const noLimitations = { ...createValidFakeEstimate(), limitations: [] }
      const res2 = validateEstimate(noLimitations)
      expect(res2.ok).toBe(false)
      if (!res2.ok) {
        expect(res2.error.code).toBe('invalid-result')
        expect(res2.error.message).toContain('Limitations')
      }
    })

    it('rejects unrecognised complexity classes', () => {
      const badTime = { ...createValidFakeEstimate(), time: { worst: 'O(magic)' } }
      const res = validateEstimate(badTime)
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.error.code).toBe('invalid-result')
        expect(res.error.message).toContain('Unrecognised')
      }
    })

    it('rejects source ranges that exceed file bounds', () => {
      const badRangeEstimate = {
        ...createValidFakeEstimate(),
        bottlenecks: [
          {
            range: { file: 'index.js', startLine: 1, startCol: 0, endLine: 50, endCol: 10 },
            reason: 'Excessive loop',
            contributes: 'O(n)',
            rank: 1,
          },
        ],
      }
      const res = validateEstimate(badRangeEstimate, {
        language: 'javascript',
        files: [{ name: 'index.js', language: 'javascript', content: 'line 1\nline 2\nline 3\n' }],
      })
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.error.message).toContain('exceeds file')
      }
    })

    it('caps confidence when provider specifies maxConfidence', () => {
      const highEstimate = { ...createValidFakeEstimate(), confidence: 'high' as const }
      const res = validateEstimate(highEstimate, undefined, 'medium')
      expect(res.ok).toBe(true)
      if (res.ok) {
        expect(res.value.confidence).toBe('medium')
      }
    })
  })

  describe('3. Truthful Provider Registry & No Numbers at Stage 20', () => {
    it('production registry has zero providers registered at Stage 20 (§12, §13)', () => {
      expect(analysisRegistry.list()).toEqual([])
      expect(analysisRegistry.get('html')).toBeUndefined()
      expect(analysisRegistry.get('javascript')).toBeUndefined()
      expect(analysisRegistry.has('python')).toBe(false)
      // Test-only provider is available for test harness without polluting production
      expect(fakeTestProvider.id).toBe('fake-test-provider')
      expect(fakeTestProvider.language).toBe('javascript')
    })

    it('AnalysisPanel shows honest unavailable state and NO numbers when no provider is registered', () => {
      render(
        <AnalysisPanel
          language="html"
          hasCapability={false}
          providerAvailable={false}
          estimate={null}
        />
      )

      expect(screen.getByTestId('analysis-no-capability')).toBeTruthy()
      expect(screen.getByText(/Complexity analysis not available/i)).toBeTruthy()
      // Truthfulness assertion: no numbers appear anywhere
      expect(screen.queryByText(/O\(/i)).toBeNull()
    })

    it('AnalysisPanel shows language unavailable message with no numbers when capability exists but no provider', () => {
      render(
        <AnalysisPanel
          language="javascript"
          hasCapability={true}
          providerAvailable={false}
          estimate={null}
        />
      )

      expect(screen.getByTestId('analysis-no-provider')).toBeTruthy()
      expect(screen.getByText(/Complexity analysis is not available for JAVASCRIPT yet/i)).toBeTruthy()
      expect(screen.queryByText(/O\(/i)).toBeNull()
    })

    it('shows error state when analysis fails without partial numbers', () => {
      render(
        <AnalysisPanel
          language="javascript"
          hasCapability={true}
          providerAvailable={true}
          error={{ code: 'timeout', message: 'Analysis timed out after 3000ms' }}
        />
      )

      expect(screen.getByTestId('analysis-error')).toBeTruthy()
      expect(screen.getByText(/Analysis timed out after 3000ms/i)).toBeTruthy()
      expect(screen.queryByText(/O\(/i)).toBeNull()
    })
  })

  describe('4. Analysis UI Display with Test Provider', () => {
    it('displays method, confidence, assumptions, limitations and mandatory heuristic disclaimer (§13)', () => {
      const estimate = createValidFakeEstimate()
      render(
        <AnalysisPanel
          language="javascript"
          hasCapability={true}
          providerAvailable={true}
          estimate={estimate}
        />
      )

      // Time and space
      expect(screen.getByText('Time Complexity (Worst)')).toBeTruthy()
      expect(screen.getByText('Auxiliary Space')).toBeTruthy()

      // Confidence and Method
      expect(screen.getByText(/High confidence/i)).toBeTruthy()
      expect(screen.getByText(/Method: Static AST analysis/i)).toBeTruthy()

      // Assumptions & Limitations
      expect(screen.getByText('Assumptions')).toBeTruthy()
      expect(screen.getByText(/Basic arithmetic comparisons execute in O\(1\) time/i)).toBeTruthy()
      expect(screen.getByText('Limitations')).toBeTruthy()
      expect(screen.getByText(/Does not model dynamic memory allocation overhead/i)).toBeTruthy()

      // Bottleneck list
      expect(screen.getByText(/Rank #1/i)).toBeTruthy()
      expect(screen.getByText(/Quadratic nested loop dominates execution time/i)).toBeTruthy()

      // Mandatory Heuristic Disclaimer
      expect(screen.getByText(/Heuristic estimate, not a formal proof/i)).toBeTruthy()
    })

    it('triggers highlight callback when clicking bottleneck or explanation step', () => {
      const estimate = createValidFakeEstimate()
      let highlightedRange: unknown = null
      render(
        <AnalysisPanel
          language="javascript"
          hasCapability={true}
          providerAvailable={true}
          estimate={estimate}
          onHighlightRange={(r) => {
            highlightedRange = r
          }}
        />
      )

      const chip = screen.getByRole('button', { name: /Highlight line 4 to 6 in index\.js/i })
      fireEvent.click(chip)
      expect(highlightedRange).toEqual({
        file: 'index.js',
        startLine: 4,
        startCol: 4,
        endLine: 6,
        endCol: 6,
      })
    })
  })

  describe('5. Optimisation Panel & Preservation of Learner Code (§13)', () => {
    it('displays unverified badge when equivalence test has not run', () => {
      const suggestions = createFakeSuggestions()
      render(
        <OptimisationPanel
          suggestions={suggestions}
          onApplySuggestion={() => {}}
        />
      )

      expect(screen.getByText(/Unverified suggestion/i)).toBeTruthy()
      expect(screen.getByText(/Use hash lookup instead of nested loop/i)).toBeTruthy()
      expect(screen.getByText(/Apply as new draft/i)).toBeTruthy()
    })

    it('displays verified badge only after equivalence check succeeds', () => {
      const suggestions = createFakeSuggestions()
      render(
        <OptimisationPanel
          suggestions={suggestions}
          onApplySuggestion={() => {}}
          verificationStatus={{
            'opt-hash-map': {
              passed: true,
              cases: [{ name: 'test 1', passed: true }, { name: 'test 2', passed: true }],
              coverageNote: 'Verified across 2 test suites',
            },
          }}
        />
      )

      expect(screen.getByText(/Verified on 2 cases/i)).toBeTruthy()
    })

    it('applying a suggestion preserves learner code by creating new draft (§13 acceptance criterion)', () => {
      const suggestions = createFakeSuggestions()
      let appliedSuggestion: OptimisationSuggestion | null = null
      render(
        <OptimisationPanel
          suggestions={suggestions}
          onApplySuggestion={(sug) => {
            appliedSuggestion = sug
          }}
        />
      )

      const applyBtn = screen.getByText(/Apply as new draft/i)
      fireEvent.click(applyBtn)

      expect(appliedSuggestion).not.toBeNull()
      expect(appliedSuggestion!.patch?.files?.[0].name).toBe('solution-optimised.js')
      // Original code is not modified; patch proposes a distinct draft file
    })
  })

  describe('6. Comparison View', () => {
    it('renders Before/After complexity table with text delta indicators', () => {
      const comparison: Comparison = {
        before: createValidFakeEstimate(),
        after: {
          ...createValidFakeEstimate(),
          time: { worst: 'O(n)' },
          auxiliarySpace: 'O(n)',
        },
        correctness: {
          passed: true,
          cases: [{ name: 'case 1', passed: true }],
          coverageNote: 'Passed all verification cases',
        },
        measurement: {
          inputSizes: [100, 1000, 10000],
          beforeMs: [0.5, 4.2, 380.0],
          afterMs: [0.4, 0.9, 8.5],
          environmentNote: 'Node v22 / Chrome V8 isolated thread',
        },
      }

      render(<ComparisonView comparison={comparison} />)

      expect(screen.getByText(/Before vs After Comparison/i)).toBeTruthy()
      expect(screen.getByText(/▲ Improved/i)).toBeTruthy() // Time went from O(n^2) to O(n)
      expect(screen.getByText(/▼ Regressed/i)).toBeTruthy() // Space went from O(1) to O(n)

      // Equivalence verification details
      expect(screen.getByText(/All Equivalence Checks Passed/i)).toBeTruthy()

      // Benchmark measurement & disclaimer
      expect(screen.getByText(/Node v22 \/ Chrome V8 isolated thread/i)).toBeTruthy()
      expect(
        screen.getByText(/Measured timings are dependent on the test environment and are not an asymptotic proof/i)
      ).toBeTruthy()
    })
  })

  describe('7. Truthfulness and Copy Rules (G9)', () => {
    it('forbids proof-like claims ("optimal", "guaranteed", "proven") across analysis source code', () => {
      const analysisDir = path.resolve(__dirname, '../core/analysis')
      const files = fs.readdirSync(analysisDir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))

      const forbiddenRegex = /\b(optimal|guaranteed|proven)\b/i

      for (const file of files) {
        const content = fs.readFileSync(path.join(analysisDir, file), 'utf-8')
        const lines = content.split('\n')
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          // Exclude comments or variable names like 'optimisation'
          if (forbiddenRegex.test(line)) {
            // Check if it's just 'optimise' / 'optimisation'
            const match = line.match(forbiddenRegex)
            expect(match).toBeNull()
          }
        }
      }
    })
  })

  describe('8. Schema v9 & Storage Quota Drop', () => {
    it('excludes analysis history from default export to save space unless opted in (§11)', () => {
      const state = createDefaultState()
      state.analysis = {
        history: [
          {
            id: 'rec-1',
            at: Date.now(),
            language: 'javascript',
          },
        ],
      }

      // Default export: excluded
      const defaultExportStr = buildExport(state)
      const parsedDefault = JSON.parse(defaultExportStr)
      expect(parsedDefault.state.analysis.history).toEqual([])

      // Opted in export: included
      const optInExportStr = buildExport(state, Date.now(), { includeAnalysisHistory: true })
      const parsedOptIn = JSON.parse(optInExportStr)
      expect(parsedOptIn.state.analysis.history.length).toBe(1)
    })

    it('safely drops derived analysis history under quota pressure to preserve learner progress', () => {
      const state = createDefaultState()
      state.analysis = {
        history: [
          { id: '1', at: 1000, language: 'javascript' },
          { id: '2', at: 2000, language: 'javascript' },
        ],
      }

      let attemptCount = 0
      const mockStorage = {
        getItem: () => null,
        setItem: (_k: string, v: string) => {
          attemptCount++
          if (attemptCount === 1) {
            // First attempt throws quota error
            throw new DOMException('QuotaExceededError', 'QuotaExceededError')
          }
          // Second attempt (with dropped analysis history) succeeds
          const parsed = JSON.parse(v)
          expect(parsed.analysis.history).toEqual([])
        },
        removeItem: () => {},
      }

      const res = saveState(state, mockStorage)
      expect(res.ok).toBe(true)
      expect(attemptCount).toBe(2)
    })
  })
})
