import { describe, it, expect } from 'vitest'
import { createDefaultState } from '../../lib/storage'
import { reducer } from '../../state/reducer'
import { dailyChallengeFor, resolveDailyChallenge, getDailyPool } from '../../core/gamification/daily'
import { dayKey } from '../../core/gamification/streak'
import { challenges } from '../../data/challenges'
import type { Challenge } from '../../data/types'
import type { CodeOrbitState } from '../../state/types'

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime()

const pass = (s: CodeOrbitState, id: string, now: number) => {
  const c = challenges.find((x) => x.id === id)!
  return reducer(s, {
    type: 'RECORD_CHECK',
    challengeId: id,
    passed: c.requirements.length,
    total: c.requirements.length,
    failedIds: [],
    now,
  })
}

describe('Daily challenge (Catalog 8.6, REF-04, Adaptation D4)', () => {
  const pool = challenges

  it('is deterministic for a date and independent of progress', () => {
    const a = dailyChallengeFor('2026-10-24', pool)
    expect(a).toBeDefined()
    expect(dailyChallengeFor('2026-10-24', pool)?.id).toBe(a?.id)

    const s = pass(createDefaultState(), pool[0].id, at(2026, 10, 24))
    expect(s).toBeTruthy()
    expect(dailyChallengeFor('2026-10-24', pool)?.id).toBe(a?.id)
  })

  it('cycles through every challenge in order, one per consecutive day, and repeats after a full cycle', () => {
    const n = pool.length
    const ids = Array.from(
      { length: n },
      (_, i) => dailyChallengeFor(`2026-11-${String(i + 1).padStart(2, '0')}`, pool)!.id
    )
    expect(new Set(ids).size).toBe(n)
    const start = pool.findIndex((c) => c.id === ids[0])
    ids.forEach((id, i) => expect(id).toBe(pool[(start + i) % n].id))

    // Cycles cleanly on consecutive days
    const nextCycle = dailyChallengeFor(`2026-11-${String(n + 1).padStart(2, '0')}`, pool)!.id
    expect(nextCycle).toBe(ids[0])
  })

  it('works for dates before 1970', () => {
    const pick = dailyChallengeFor('1969-12-31', pool)
    expect(pool.map((c) => c.id)).toContain(pick?.id)
  })

  it('handles empty pool honestly without throwing', () => {
    expect(dailyChallengeFor('2026-10-24', [])).toBeUndefined()
    const { challenge, isFrozen } = resolveDailyChallenge(createDefaultState(), '2026-10-24', [])
    expect(challenge).toBeUndefined()
    expect(isFrozen).toBe(false)
  })

  it('FROZEN ASSIGNMENT: once assigned, mid-day challenge additions never alter today’s pick', () => {
    const today = '2026-10-24'
    const initialPool: Challenge[] = [pool[0], pool[1], pool[2]]
    const pick = dailyChallengeFor(today, initialPool)!

    // Freeze assignment in state
    let state = createDefaultState()
    state = reducer(state, { type: 'ASSIGN_DAILY', dayKey: today, challengeId: pick.id })
    expect(state.dailyAssigned?.[today]).toBe(pick.id)

    // Mid-day: pool expands with 5 new challenges inserted at the beginning
    const expandedPool: Challenge[] = [pool[3], pool[4], pool[5], ...initialPool]

    // Without freezing, the pick would change because pool.length changed
    const unconstrainedPick = dailyChallengeFor(today, expandedPool)!
    // With resolveDailyChallenge, the frozen assignment survives
    const resolved = resolveDailyChallenge(state, today, expandedPool)
    expect(resolved.isFrozen).toBe(true)
    expect(resolved.challenge?.id).toBe(pick.id)
    expect(resolved.challenge?.id).not.toBe(unconstrainedPick.id)
  })

  it('is marked done only when TODAY’S assigned challenge is fully passed, once per day', () => {
    const nowMs = at(2026, 10, 24)
    const today = dayKey(nowMs)
    const todayPick = dailyChallengeFor(today, pool)!
    const other = pool.find((c) => c.id !== todayPick.id)!

    // State with today's challenge frozen
    let s = reducer(createDefaultState(), {
      type: 'ASSIGN_DAILY',
      dayKey: today,
      challengeId: todayPick.id,
    })

    // Passing a different challenge does NOT mark today's daily done
    s = pass(s, other.id, nowMs)
    expect(s.dailyDone).toEqual([])

    // Incomplete check on today's challenge does NOT mark done
    s = reducer(s, {
      type: 'RECORD_CHECK',
      challengeId: todayPick.id,
      passed: todayPick.requirements.length - 1,
      total: todayPick.requirements.length,
      failedIds: ['f1'],
      now: nowMs,
    })
    expect(s.dailyDone).toEqual([])

    // Fully passing today's challenge marks daily done
    s = pass(s, todayPick.id, nowMs)
    expect(s.dailyDone).toEqual([today])

    // Repeated pass on same day keeps array unique
    s = pass(s, todayPick.id, nowMs)
    expect(s.dailyDone).toEqual([today])
  })

  it('getDailyPool returns available challenges across tracks', () => {
    const globalPool = getDailyPool()
    expect(globalPool.length).toBeGreaterThanOrEqual(12)
    expect(globalPool.map((c) => c.id)).toContain('ch-html-structure')
  })
})
