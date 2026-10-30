/**
 * Complexity analysis and optimisation contracts (Stage 20+)
 * Conforms to 01_PRODUCT_AND_ARCHITECTURE.md §B5 and STAGE_20 specification §8.
 */

import type { ChallengeFile } from '../content/types'

export type Confidence = 'low' | 'medium' | 'high'
export type ComplexityClass = string

export interface SourceRange {
  file: string
  startLine: number
  startCol: number
  endLine: number
  endCol: number
}

export interface ExplanationStep {
  text: string
  range?: SourceRange
  contributes?: ComplexityClass
}

export interface Explanation {
  summary: string
  steps: ExplanationStep[]
}

export interface Bottleneck {
  range: SourceRange
  reason: string
  contributes: ComplexityClass
  rank: number
}

export interface ComplexityEstimate {
  time: {
    worst?: ComplexityClass
    average?: ComplexityClass
    best?: ComplexityClass
  }
  auxiliarySpace: ComplexityClass
  confidence: Confidence
  /** Required, non-empty list of assumptions (e.g. "n is the length of arr", "built-in sort is O(n log n)") */
  assumptions: string[]
  /** Required, non-empty list of limitations: what the analyzer could not model */
  limitations: string[]
  /** Stepwise explanation referencing source ranges */
  explanation: Explanation
  /** Source ranges ranked by contribution to complexity */
  bottlenecks: Bottleneck[]
  /** Analysis technique */
  method: 'static-ast' | 'instrumented-measurement' | 'hybrid'
  /** Literal false; heuristic estimates are never formal proofs */
  isFormalProof: false
}

export interface OptimisationSuggestion {
  id: string
  title: string
  rationale: string
  expected: {
    time?: ComplexityClass
    auxiliarySpace?: ComplexityClass
  }
  risk: 'none' | 'low' | 'medium'
  patch?: {
    files: ChallengeFile[]
  }
  requiresCorrectnessCheck: true
}

export interface TestCaseResult {
  name: string
  passed: boolean
  detail?: string
}

export interface CorrectnessCheck {
  passed: boolean
  cases: TestCaseResult[]
  coverageNote: string
}

export interface Comparison {
  before: ComplexityEstimate
  after: ComplexityEstimate
  correctness: CorrectnessCheck
  measurement?: {
    inputSizes: number[]
    beforeMs: number[]
    afterMs: number[]
    environmentNote: string
  }
}

export interface AnalysisInput {
  language: string
  files: ChallengeFile[]
  entryPoint?: string
  inputSizeSymbol?: string
}

export interface AnalysisProvider {
  id: string
  language: string
  version: string
  supports(input: AnalysisInput): { ok: true } | { ok: false; reason: string }
  analyze(input: AnalysisInput, signal?: AbortSignal): Promise<ComplexityEstimate>
  suggest?(input: AnalysisInput, estimate: ComplexityEstimate): Promise<OptimisationSuggestion[]>
  verifyEquivalence?(before: AnalysisInput, after: AnalysisInput): Promise<CorrectnessCheck>
  worker?: { scriptUrl: string }
  maxConfidence?: Confidence
}

export type AnalysisErrorCode = 'unsupported' | 'timeout' | 'invalid-result' | 'internal'

export interface AnalysisError {
  code: AnalysisErrorCode
  message: string
}

export interface AnalysisRecord {
  id: string
  at: number
  language: string
  filesHash?: string
  estimate?: ComplexityEstimate
  error?: AnalysisError
}

export interface AnalysisState {
  history: AnalysisRecord[]
}
