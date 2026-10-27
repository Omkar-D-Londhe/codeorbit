import { describe, it, expect } from 'vitest'
import { calculateAttemptHeat, exportAttemptsToCsv } from '../../core/insights/attemptHeat'
import { createDefaultState } from '../../lib/storage'
import type { CodeOrbitState } from '../../state/types'

describe('Challenge Attempt Heat Derivation & CSV Export (Stage 15c, Enhancement 12.4)', () => {
  it('initializes challenge rows correctly on empty state', () => {
    const state = createDefaultState()
    const heat = calculateAttemptHeat(state)

    expect(heat.totalChallenges).toBeGreaterThan(0)
    expect(heat.completedCount).toBe(0)
    expect(heat.masteredCount).toBe(0)

    const first = heat.rows[0]
    expect(first.status).toBe('not-started')
    expect(first.attemptsCount).toBe(0)
    expect(first.recentAttempts).toEqual([])
  })

  it('correctly maps recent attempt history, hints, solution reveal, and mastery status', () => {
    const state: CodeOrbitState = {
      ...createDefaultState(),
      challenges: {
        'ch-html-structure': {
          attempts: 2,
          hintsRevealed: 1,
          solutionRevealed: false,
          completed: true,
          completedWithoutSolution: true,
          history: [
            { passed: 2, total: 3, failedIds: ['f1'], at: 1700000000000 },
            { passed: 3, total: 3, failedIds: [], at: 1700000050000 },
          ],
        },
      },
    }

    const heat = calculateAttemptHeat(state)
    const struct = heat.rows.find((r) => r.challengeId === 'ch-html-structure')!

    expect(struct.completed).toBe(true)
    expect(struct.completedWithoutSolution).toBe(true)
    expect(struct.status).toBe('mastered')
    expect(struct.hintsUsed).toBe(1)
    expect(struct.solutionRevealed).toBe(false)
    expect(struct.attemptsCount).toBe(2)
    expect(struct.recentAttempts).toHaveLength(2)
    expect(struct.recentAttempts[0].passed).toBe(false)
    expect(struct.recentAttempts[0].label).toBe('✗ (2/3)')
    expect(struct.recentAttempts[1].passed).toBe(true)
    expect(struct.recentAttempts[1].label).toBe('✓ (3/3)')
  })

  it('exports valid, escaped CSV format representing all challenge rows', () => {
    const state: CodeOrbitState = {
      ...createDefaultState(),
      challenges: {
        'ch-html-structure': {
          attempts: 1,
          hintsRevealed: 0,
          solutionRevealed: false,
          completed: true,
          completedWithoutSolution: true,
        },
      },
    }

    const heat = calculateAttemptHeat(state)
    const csv = exportAttemptsToCsv(heat.rows)

    expect(csv).toContain('"Challenge ID","Challenge Title","Attempts","Passed First Try","Hints Used","Solution Revealed","Status"')
    expect(csv).toContain('"ch-html-structure"')
    expect(csv).toContain('"mastered"')
  })
})
