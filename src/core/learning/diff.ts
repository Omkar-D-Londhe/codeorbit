/**
 * Pure line diff algorithm (Myers / LCS) for code comparison (Stage 06, 6.4).
 * Compares learner draft (a) against reference solution (b).
 * Returns array of diff lines with gutter line numbers.
 * Hard-capped at 2,000 lines for performance.
 */

export type DiffKind = 'same' | 'add' | 'del'

export interface DiffLine {
  kind: DiffKind
  text: string
  aLine?: number
  bLine?: number
}

export interface DiffResult {
  lines: DiffLine[]
  tooLarge: boolean
  additions: number
  deletions: number
  identical: boolean
}

export const MAX_DIFF_LINES = 2000

/**
 * Computes line-by-line diff between two text documents.
 */
export function diffLines(a: string, b: string): DiffResult {
  if (a === b) {
    if (a.length === 0) {
      return { lines: [], tooLarge: false, additions: 0, deletions: 0, identical: true }
    }
    const lines = a.split('\n').map((text, idx) => ({
      kind: 'same' as DiffKind,
      text,
      aLine: idx + 1,
      bLine: idx + 1,
    }))
    return { lines, tooLarge: false, additions: 0, deletions: 0, identical: true }
  }

  const aLines = a.split('\n')
  const bLines = b.split('\n')

  if (aLines.length > MAX_DIFF_LINES || bLines.length > MAX_DIFF_LINES) {
    return {
      lines: [],
      tooLarge: true,
      additions: 0,
      deletions: 0,
      identical: false,
    }
  }

  const m = aLines.length
  const n = bLines.length

  // Standard LCS Dynamic Programming with Hirschberg/optimised table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (aLines[i] === bLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1])
      }
    }
  }

  // Backtrack to build diff lines
  const lines: DiffLine[] = []
  let i = m
  let j = n
  let additions = 0
  let deletions = 0

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
      lines.unshift({
        kind: 'same',
        text: aLines[i - 1],
        aLine: i,
        bLine: j,
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      lines.unshift({
        kind: 'add',
        text: bLines[j - 1],
        bLine: j,
      })
      additions++
      j--
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      lines.unshift({
        kind: 'del',
        text: aLines[i - 1],
        aLine: i,
      })
      deletions++
      i--
    }
  }

  return {
    lines,
    tooLarge: false,
    additions,
    deletions,
    identical: additions === 0 && deletions === 0,
  }
}
