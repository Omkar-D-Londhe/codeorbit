import { describe, it, expect } from 'vitest'
import { createDefaultState } from '../../lib/storage'
import { reducer } from '../../state/reducer'
import { detectMilestoneEvents } from '../../core/gamification/milestones'
import { challenges } from '../../data/challenges'
import type { CodeOrbitState } from '../../state/types'

const pass = (s: CodeOrbitState, id: string) => {
  const c = challenges.find((x) => x.id === id)!
  return reducer(s, {
    type: 'RECORD_CHECK',
    challengeId: id,
    passed: c.requirements.length,
    total: c.requirements.length,
    failedIds: [],
    now: 1000,
  })
}

describe('Milestones and Rank Progression Events (Catalog 8.4, 8.7)', () => {
  it('detects First Blood on the very first completed challenge', () => {
    const s0 = createDefaultState()
    const s1 = pass(s0, 'ch-html-structure')

    const events = detectMilestoneEvents(s0, s1)
    const firstBlood = events.find((e) => e.id === 'milestone-first-blood')
    expect(firstBlood).toBeDefined()
    expect(firstBlood?.message).toContain('First Blood')

    // Passing a second challenge does NOT fire First Blood again
    const s2 = pass(s1, 'ch-elements-attributes')
    const events2 = detectMilestoneEvents(s1, s2)
    expect(events2.find((e) => e.id === 'milestone-first-blood')).toBeUndefined()
  })

  it('detects Rank Progression when Level increases', () => {
    const s0 = createDefaultState()
    // Complete 10 lessons (10 * 10 = 100 XP -> Level 1!)
    let s1 = s0
    const topics = [
      'html-structure',
      'elements-attributes',
      'headings-paragraphs',
      'text-semantics',
      'lists',
      'links',
      'images',
      'tables',
      'forms',
      'semantic-layout',
    ]
    topics.forEach((t) => {
      s1 = reducer(s1, { type: 'SET_LESSON_COMPLETE', topicId: t, value: true })
    })

    const events = detectMilestoneEvents(s0, s1)
    const levelUp = events.find((e) => e.id.startsWith('milestone-rank-level-1'))
    expect(levelUp).toBeDefined()
    expect(levelUp?.message).toContain('Rank Advanced: Reached Level 1!')
  })

  it('remains silent on initial load and for backfilled badges (no toast storm)', () => {
    const s = createDefaultState()
    // Simulated state with backfilled badges
    const sWithBackfilled: CodeOrbitState = {
      ...s,
      badges: {
        'first-challenge': { firstSeenAt: null, backfilled: true },
        'html-foundations': { firstSeenAt: null, backfilled: true },
      },
    }

    const events = detectMilestoneEvents(sWithBackfilled, sWithBackfilled)
    expect(events).toEqual([])
  })

  it('emits zero events when gamification is toggled off in settings (Rule P-04)', () => {
    const s0 = createDefaultState()
    const sDisabled = reducer(s0, {
      type: 'SET_SETTINGS',
      patch: { gamificationEnabled: false },
    })

    const sPassed = pass(sDisabled, 'ch-html-structure')
    const events = detectMilestoneEvents(sDisabled, sPassed)
    expect(events).toEqual([])
  })
})
