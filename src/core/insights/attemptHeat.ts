import type { CodeOrbitState } from '../../state/types'
import { challenges } from '../../data/challenges'

export interface AttemptEntry {
  passed: boolean
  label: string // "✓ (3/3)" or "✗ (2/3)"
  passedCount: number
  totalCount: number
}

export interface ChallengeAttemptRow {
  challengeId: string
  challengeTitle: string
  attemptsCount: number
  passedFirstTry: boolean
  hintsUsed: number
  solutionRevealed: boolean
  completed: boolean
  completedWithoutSolution: boolean
  status: 'passed' | 'mastered' | 'in-progress' | 'not-started'
  recentAttempts: AttemptEntry[] // Last up to 10 checks
}

export interface AttemptHeatData {
  totalChallenges: number
  completedCount: number
  masteredCount: number
  rows: ChallengeAttemptRow[]
}

/**
 * Derives challenge attempt heat table data (Catalog 12.4).
 * Lists challenges with their last 10 check attempts as accessible ✓ / ✗ indicators.
 */
export function calculateAttemptHeat(state: CodeOrbitState): AttemptHeatData {
  let completedCount = 0
  let masteredCount = 0

  const rows: ChallengeAttemptRow[] = challenges.map((ch) => {
    const rec = state.challenges?.[ch.id]
    const attemptsCount = rec?.attempts ?? 0
    const hintsUsed = rec?.hintsRevealed ?? 0
    const solutionRevealed = rec?.solutionRevealed ?? false
    const completed = rec?.completed ?? false
    const completedWithoutSolution = rec?.completedWithoutSolution ?? false

    let status: ChallengeAttemptRow['status'] = 'not-started'
    if (completed) {
      completedCount += 1
      if (completedWithoutSolution) {
        status = 'mastered'
        masteredCount += 1
      } else {
        status = 'passed'
      }
    } else if (attemptsCount > 0) {
      status = 'in-progress'
    }

    // Build history of recent checks (last 10)
    const rawHistory = rec?.history || []
    let entries = rawHistory.slice(-10)

    // Fallback to lastCheck if history was empty
    if (entries.length === 0 && rec?.lastCheck) {
      entries = [rec.lastCheck]
    }

    const recentAttempts: AttemptEntry[] = entries.map((h) => {
      const passed = h.passed === h.total && (h.failedIds || []).length === 0
      return {
        passed,
        label: passed ? `✓ (${h.passed}/${h.total})` : `✗ (${h.passed}/${h.total})`,
        passedCount: h.passed,
        totalCount: h.total,
      }
    })

    const passedFirstTry = (rec?.history?.[0]?.passed === rec?.history?.[0]?.total && rec?.history?.[0]?.failedIds.length === 0)
      || (attemptsCount === 1 && completed)

    return {
      challengeId: ch.id,
      challengeTitle: ch.title,
      attemptsCount,
      passedFirstTry: !!passedFirstTry,
      hintsUsed,
      solutionRevealed,
      completed,
      completedWithoutSolution,
      status,
      recentAttempts,
    }
  })

  return {
    totalChallenges: challenges.length,
    completedCount,
    masteredCount,
    rows,
  }
}

/**
 * Exports challenge attempt data to CSV string (Catalog 12.4).
 */
export function exportAttemptsToCsv(rows: ChallengeAttemptRow[]): string {
  const headers = ['Challenge ID', 'Challenge Title', 'Attempts', 'Passed First Try', 'Hints Used', 'Solution Revealed', 'Status']
  const escapeCell = (s: string | number | boolean) => `"${String(s).replace(/"/g, '""')}"`

  const lines = [headers.map(escapeCell).join(',')]

  for (const r of rows) {
    lines.push([
      escapeCell(r.challengeId),
      escapeCell(r.challengeTitle),
      escapeCell(r.attemptsCount),
      escapeCell(r.passedFirstTry ? 'Yes' : 'No'),
      escapeCell(r.hintsUsed),
      escapeCell(r.solutionRevealed ? 'Yes' : 'No'),
      escapeCell(r.status),
    ].join(','))
  }

  return lines.join('\n')
}
