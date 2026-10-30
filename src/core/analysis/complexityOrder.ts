/**
 * Big-O complexity class ordering, parsing, normalisation and speech labels.
 * Conforms to STAGE_20 specification §6, §13.
 *
 * Ordering: O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!)
 * Unknown or unrecognised classes return undefined and are NEVER guessed.
 */

import type { ComplexityClass } from './types'

export const CANONICAL_COMPLEXITY_ORDER: readonly ComplexityClass[] = [
  'O(1)',
  'O(log n)',
  'O(n)',
  'O(n log n)',
  'O(n^2)',
  'O(n^3)',
  'O(2^n)',
  'O(n!)',
] as const

const ORDER_INDEX = new Map<ComplexityClass, number>(
  CANONICAL_COMPLEXITY_ORDER.map((c, i) => [c, i])
)

/**
 * Normalises a complexity class string to its canonical representation.
 * Returns undefined for unknown/unsupported expressions; never guesses.
 */
export function normalizeComplexityClass(raw: string | undefined | null): ComplexityClass | undefined {
  if (typeof raw !== 'string') return undefined
  const cleaned = raw.trim()
  if (!cleaned) return undefined

  // Canonical exact match
  if (ORDER_INDEX.has(cleaned)) {
    return cleaned
  }

  // Canonical case-insensitive & whitespace-flexible normalisation
  const compact = cleaned.toLowerCase().replace(/\s+/g, '')

  if (compact === 'o(1)') return 'O(1)'
  if (compact === 'o(logn)' || compact === 'o(log(n))') return 'O(log n)'
  if (compact === 'o(n)') return 'O(n)'
  if (
    compact === 'o(nlogn)' ||
    compact === 'o(n*logn)' ||
    compact === 'o(nlog(n))' ||
    compact === 'o(n*log(n))'
  ) {
    return 'O(n log n)'
  }
  if (compact === 'o(n^2)' || compact === 'o(n2)' || compact === 'o(n**2)') return 'O(n^2)'
  if (compact === 'o(n^3)' || compact === 'o(n3)' || compact === 'o(n**3)') return 'O(n^3)'
  if (compact === 'o(2^n)' || compact === 'o(2**n)') return 'O(2^n)'
  if (compact === 'o(n!)') return 'O(n!)'

  return undefined
}

/**
 * Checks whether a given string is a recognised canonical or normalisable Big-O class.
 */
export function isValidComplexityClass(raw: string | undefined | null): boolean {
  return normalizeComplexityClass(raw) !== undefined
}

/**
 * Pure ordering comparison of two Big-O classes.
 * Returns:
 *   negative (< 0) if `a` is lower order than `b` (asymptotically faster / more efficient)
 *   zero (=== 0) if `a` and `b` have the same order
 *   positive (> 0) if `a` is higher order than `b` (asymptotically slower / less efficient)
 *   undefined if either class is unknown/unrecognised (never guesses)
 */
export function compareComplexity(
  a: string | undefined | null,
  b: string | undefined | null
): number | undefined {
  const normA = normalizeComplexityClass(a)
  const normB = normalizeComplexityClass(b)

  if (!normA || !normB) return undefined

  const idxA = ORDER_INDEX.get(normA)
  const idxB = ORDER_INDEX.get(normB)

  if (idxA === undefined || idxB === undefined) return undefined

  return idxA - idxB
}

/**
 * Returns a spoken accessibility description for screen readers.
 * e.g. "O(n^2)" -> "O of n squared"
 */
export function formatComplexityAriaLabel(raw: string | undefined | null): string {
  const norm = normalizeComplexityClass(raw)
  if (!norm) return raw ? `Complexity ${raw}` : 'Complexity not specified'

  switch (norm) {
    case 'O(1)':
      return 'O of 1'
    case 'O(log n)':
      return 'O of log n'
    case 'O(n)':
      return 'O of n'
    case 'O(n log n)':
      return 'O of n log n'
    case 'O(n^2)':
      return 'O of n squared'
    case 'O(n^3)':
      return 'O of n cubed'
    case 'O(2^n)':
      return 'O of 2 to the n'
    case 'O(n!)':
      return 'O of n factorial'
    default:
      return norm
  }
}

export interface ComplexityDisplayParts {
  prefix: string
  sup?: string
  suffix?: string
}

/**
 * Splits a complexity class into prefix, superscript, and suffix for <sup> rendering.
 */
export function splitComplexityForDisplay(raw: string | undefined | null): ComplexityDisplayParts {
  const norm = normalizeComplexityClass(raw) ?? (raw?.trim() || '—')

  if (norm === 'O(n^2)') return { prefix: 'O(n', sup: '2', suffix: ')' }
  if (norm === 'O(n^3)') return { prefix: 'O(n', sup: '3', suffix: ')' }
  if (norm === 'O(2^n)') return { prefix: 'O(2', sup: 'n', suffix: ')' }

  return { prefix: norm }
}
