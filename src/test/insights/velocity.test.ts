import { describe, it, expect } from 'vitest'
import { calculateVelocity, VELOCITY_EMPTY_MESSAGE } from '../../core/insights/velocity'
import { createDefaultState } from '../../lib/storage'
import type { CodeOrbitState } from '../../state/types'

describe('Learning Velocity Derivation (Stage 15c, Enhancement 12.1)', () => {
  it('returns hasActivity=false when no activity is recorded (spec §10 empty state)', () => {
    const state = createDefaultState()
    const result = calculateVelocity(state)

    expect(result.hasActivity).toBe(false)
    expect(result.points).toHaveLength(0)
    expect(result.totalEvents).toBe(0)
    expect(result.averagePerDay).toBe(0)
    expect(VELOCITY_EMPTY_MESSAGE).toBe('Complete a lesson to see your pace')
  })

  it('aggregates activity events accurately across 14-day rolling window', () => {
    const fixedNow = new Date('2026-10-27T12:00:00Z').getTime()
    const today = fixedNow
    const yesterday = fixedNow - 86_400_000
    const threeDaysAgo = fixedNow - 3 * 86_400_000

    const state: CodeOrbitState = {
      ...createDefaultState(),
      activity: [
        { id: 'act-1', type: 'lesson-complete', at: today, topicId: 'html-structure' },
        { id: 'act-2', type: 'quiz-finish', at: today, topicId: 'html-structure' },
        { id: 'act-3', type: 'challenge-check', at: yesterday, topicId: 'html-structure' },
        { id: 'act-4', type: 'lesson-complete', at: threeDaysAgo, topicId: 'elements-attributes' },
      ],
      activityDays: ['2026-10-24', '2026-10-26', '2026-10-27'],
    }

    const result = calculateVelocity(state, 14, fixedNow)

    expect(result.hasActivity).toBe(true)
    expect(result.points).toHaveLength(14)
    expect(result.totalEvents).toBe(4)
    expect(result.averagePerDay).toBe(0.3) // 4 / 14 = 0.285... -> 0.3

    const todayPoint = result.points[13]
    expect(todayPoint.count).toBe(2)

    const yestPoint = result.points[12]
    expect(yestPoint.count).toBe(1)
  })
})
