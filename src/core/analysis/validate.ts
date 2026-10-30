/**
 * Complexity estimate validation.
 * Conforms to STAGE_20 specification §6, §13 and 01_PRODUCT_AND_ARCHITECTURE.md §B5.
 *
 * Rules:
 * - isFormalProof must be strictly false.
 * - assumptions and limitations must be non-empty arrays of strings.
 * - Big-O classes must be normalised and recognised canonical classes.
 * - If input files are provided, source ranges must reference existing files within valid line bounds.
 * - Enforces maxConfidence cap when defined.
 * - Malformed estimates return an AnalysisError; never guesses or fabricates.
 */

import type {
  AnalysisError,
  AnalysisInput,
  Bottleneck,
  ComplexityEstimate,
  Confidence,
  Explanation,
  SourceRange,
} from './types'
import { normalizeComplexityClass } from './complexityOrder'

const CONFIDENCE_LEVELS: Record<Confidence, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

const CONFIDENCE_FROM_LEVEL: Confidence[] = ['low', 'medium', 'high']

function isNonEmptyStringArray(val: unknown): val is string[] {
  return (
    Array.isArray(val) &&
    val.length > 0 &&
    val.every((item) => typeof item === 'string' && item.trim().length > 0)
  )
}

function validateSourceRange(
  range: unknown,
  filesMap?: Map<string, number>
): { ok: true; value: SourceRange } | { ok: false; message: string } {
  if (typeof range !== 'object' || range === null) {
    return { ok: false, message: 'SourceRange must be an object' }
  }

  const r = range as Record<string, unknown>
  if (typeof r.file !== 'string' || !r.file.trim()) {
    return { ok: false, message: 'SourceRange.file must be a non-empty string' }
  }
  if (typeof r.startLine !== 'number' || !Number.isInteger(r.startLine) || r.startLine < 1) {
    return { ok: false, message: 'SourceRange.startLine must be an integer >= 1' }
  }
  if (typeof r.endLine !== 'number' || !Number.isInteger(r.endLine) || r.endLine < r.startLine) {
    return { ok: false, message: 'SourceRange.endLine must be >= startLine' }
  }
  if (typeof r.startCol !== 'number' || !Number.isInteger(r.startCol) || r.startCol < 0) {
    return { ok: false, message: 'SourceRange.startCol must be an integer >= 0' }
  }
  if (typeof r.endCol !== 'number' || !Number.isInteger(r.endCol) || r.endCol < 0) {
    return { ok: false, message: 'SourceRange.endCol must be an integer >= 0' }
  }

  if (filesMap) {
    const lineCount = filesMap.get(r.file)
    if (lineCount === undefined) {
      return { ok: false, message: `SourceRange references non-existent file: "${r.file}"` }
    }
    if (r.endLine > lineCount) {
      return {
        ok: false,
        message: `SourceRange line ${r.endLine} exceeds file "${r.file}" line count (${lineCount})`,
      }
    }
  }

  return {
    ok: true,
    value: {
      file: r.file,
      startLine: r.startLine,
      startCol: r.startCol,
      endLine: r.endLine,
      endCol: r.endCol,
    },
  }
}

export type ValidateEstimateResult =
  | { ok: true; value: ComplexityEstimate }
  | { ok: false; error: AnalysisError }

export function validateEstimate(
  estimate: unknown,
  input?: AnalysisInput,
  maxConfidence?: Confidence
): ValidateEstimateResult {
  if (typeof estimate !== 'object' || estimate === null || Array.isArray(estimate)) {
    return {
      ok: false,
      error: { code: 'invalid-result', message: 'Estimate must be a non-null object' },
    }
  }

  const raw = estimate as Record<string, unknown>

  // Rule 1: isFormalProof === false (literal false; heuristics are never proofs)
  if (raw.isFormalProof !== false) {
    return {
      ok: false,
      error: {
        code: 'invalid-result',
        message: 'Heuristic estimates must declare isFormalProof: false; formal proofs are not supported',
      },
    }
  }

  // Rule 2: assumptions non-empty
  if (!isNonEmptyStringArray(raw.assumptions)) {
    return {
      ok: false,
      error: {
        code: 'invalid-result',
        message: 'Assumptions must be a non-empty array of explanatory strings',
      },
    }
  }

  // Rule 3: limitations non-empty
  if (!isNonEmptyStringArray(raw.limitations)) {
    return {
      ok: false,
      error: {
        code: 'invalid-result',
        message: 'Limitations must be a non-empty array of explanatory strings',
      },
    }
  }

  // Rule 4: method validation
  if (
    raw.method !== 'static-ast' &&
    raw.method !== 'instrumented-measurement' &&
    raw.method !== 'hybrid'
  ) {
    return {
      ok: false,
      error: {
        code: 'invalid-result',
        message: 'Method must be one of: "static-ast", "instrumented-measurement", or "hybrid"',
      },
    }
  }

  // Rule 5: confidence validation and capping
  if (raw.confidence !== 'low' && raw.confidence !== 'medium' && raw.confidence !== 'high') {
    return {
      ok: false,
      error: {
        code: 'invalid-result',
        message: 'Confidence must be "low", "medium", or "high"',
      },
    }
  }

  let finalConfidence: Confidence = raw.confidence
  if (maxConfidence) {
    const rawLevel = CONFIDENCE_LEVELS[raw.confidence]
    const capLevel = CONFIDENCE_LEVELS[maxConfidence]
    if (rawLevel > capLevel) {
      finalConfidence = CONFIDENCE_FROM_LEVEL[capLevel - 1]
    }
  }

  // Rule 6: time complexity validation
  if (typeof raw.time !== 'object' || raw.time === null) {
    return {
      ok: false,
      error: {
        code: 'invalid-result',
        message: 'Estimate.time must be an object with at least one complexity class',
      },
    }
  }

  const rawTime = raw.time as Record<string, unknown>
  const normWorst = rawTime.worst !== undefined ? normalizeComplexityClass(rawTime.worst as string) : undefined
  const normAverage = rawTime.average !== undefined ? normalizeComplexityClass(rawTime.average as string) : undefined
  const normBest = rawTime.best !== undefined ? normalizeComplexityClass(rawTime.best as string) : undefined

  if (rawTime.worst !== undefined && normWorst === undefined) {
    return {
      ok: false,
      error: { code: 'invalid-result', message: `Unrecognised worst-case time complexity: "${String(rawTime.worst)}"` },
    }
  }
  if (rawTime.average !== undefined && normAverage === undefined) {
    return {
      ok: false,
      error: { code: 'invalid-result', message: `Unrecognised average-case time complexity: "${String(rawTime.average)}"` },
    }
  }
  if (rawTime.best !== undefined && normBest === undefined) {
    return {
      ok: false,
      error: { code: 'invalid-result', message: `Unrecognised best-case time complexity: "${String(rawTime.best)}"` },
    }
  }

  if (!normWorst && !normAverage && !normBest) {
    return {
      ok: false,
      error: { code: 'invalid-result', message: 'Estimate.time must specify at least one of worst, average, or best' },
    }
  }

  // Rule 7: auxiliarySpace validation
  const normAux = normalizeComplexityClass(raw.auxiliarySpace as string)
  if (!normAux) {
    return {
      ok: false,
      error: {
        code: 'invalid-result',
        message: `Unrecognised auxiliary space complexity: "${String(raw.auxiliarySpace)}"`,
      },
    }
  }

  // Build files line-count map if input provided
  let filesMap: Map<string, number> | undefined
  if (input?.files && Array.isArray(input.files)) {
    filesMap = new Map()
    for (const f of input.files) {
      filesMap.set(f.name, (f.content || '').split('\n').length)
    }
  }

  // Rule 8: explanation validation
  if (typeof raw.explanation !== 'object' || raw.explanation === null) {
    return {
      ok: false,
      error: { code: 'invalid-result', message: 'Estimate.explanation must be an object' },
    }
  }

  const rawExp = raw.explanation as Record<string, unknown>
  if (typeof rawExp.summary !== 'string' || !rawExp.summary.trim()) {
    return {
      ok: false,
      error: { code: 'invalid-result', message: 'Explanation.summary must be a non-empty string' },
    }
  }
  if (!Array.isArray(rawExp.steps)) {
    return {
      ok: false,
      error: { code: 'invalid-result', message: 'Explanation.steps must be an array' },
    }
  }

  const validatedSteps = []
  for (const s of rawExp.steps) {
    if (typeof s !== 'object' || s === null) {
      return { ok: false, error: { code: 'invalid-result', message: 'Explanation step must be an object' } }
    }
    const stepObj = s as Record<string, unknown>
    if (typeof stepObj.text !== 'string' || !stepObj.text.trim()) {
      return { ok: false, error: { code: 'invalid-result', message: 'Explanation step text must be non-empty' } }
    }
    let range: SourceRange | undefined
    if (stepObj.range !== undefined) {
      const rangeCheck = validateSourceRange(stepObj.range, filesMap)
      if (!rangeCheck.ok) {
        return { ok: false, error: { code: 'invalid-result', message: rangeCheck.message } }
      }
      range = rangeCheck.value
    }
    const contributes =
      stepObj.contributes !== undefined
        ? normalizeComplexityClass(stepObj.contributes as string)
        : undefined

    validatedSteps.push({
      text: stepObj.text,
      ...(range ? { range } : {}),
      ...(contributes ? { contributes } : {}),
    })
  }

  const validatedExplanation: Explanation = {
    summary: rawExp.summary,
    steps: validatedSteps,
  }

  // Rule 9: bottlenecks validation
  if (!Array.isArray(raw.bottlenecks)) {
    return {
      ok: false,
      error: { code: 'invalid-result', message: 'Estimate.bottlenecks must be an array' },
    }
  }

  const validatedBottlenecks: Bottleneck[] = []
  for (const b of raw.bottlenecks) {
    if (typeof b !== 'object' || b === null) {
      return { ok: false, error: { code: 'invalid-result', message: 'Bottleneck must be an object' } }
    }
    const bObj = b as Record<string, unknown>
    const rangeCheck = validateSourceRange(bObj.range, filesMap)
    if (!rangeCheck.ok) {
      return { ok: false, error: { code: 'invalid-result', message: rangeCheck.message } }
    }
    if (typeof bObj.reason !== 'string' || !bObj.reason.trim()) {
      return { ok: false, error: { code: 'invalid-result', message: 'Bottleneck.reason must be non-empty' } }
    }
    const contributes = normalizeComplexityClass(bObj.contributes as string)
    if (!contributes) {
      return {
        ok: false,
        error: { code: 'invalid-result', message: `Bottleneck.contributes has invalid complexity: "${String(bObj.contributes)}"` },
      }
    }
    if (typeof bObj.rank !== 'number' || !Number.isInteger(bObj.rank) || bObj.rank < 1) {
      return { ok: false, error: { code: 'invalid-result', message: 'Bottleneck.rank must be an integer >= 1' } }
    }

    validatedBottlenecks.push({
      range: rangeCheck.value,
      reason: bObj.reason,
      contributes,
      rank: bObj.rank,
    })
  }

  const value: ComplexityEstimate = {
    time: {
      ...(normWorst ? { worst: normWorst } : {}),
      ...(normAverage ? { average: normAverage } : {}),
      ...(normBest ? { best: normBest } : {}),
    },
    auxiliarySpace: normAux,
    confidence: finalConfidence,
    assumptions: raw.assumptions as string[],
    limitations: raw.limitations as string[],
    explanation: validatedExplanation,
    bottlenecks: validatedBottlenecks,
    method: raw.method,
    isFormalProof: false,
  }

  return { ok: true, value }
}
