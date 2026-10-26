import { describe, expect, it } from 'vitest'
import { deriveNodeState, computeConstellationCounts } from '../../core/orbit/constellation/state'
import type { Topic } from '../../core/orbit/constellation/types'
import type { TopicProgress } from '../../lib/progress'

describe('constellation node state derivation (Stage 10a, §16)', () => {
  const rootTopic: Topic = {
    id: 'root',
    technologyId: 'mock',
    title: 'Root',
    shortTitle: 'Root',
    description: 'Root',
    groupId: 'g1',
    prerequisiteIds: [],
  }

  const childTopic: Topic = {
    id: 'child',
    technologyId: 'mock',
    title: 'Child',
    shortTitle: 'Child',
    description: 'Child',
    groupId: 'g1',
    prerequisiteIds: ['root'],
  }

  it('derives all four states accurately across status combinations', () => {
    // 1. Root not started (no prereqs) -> available
    const rootAvail = deriveNodeState(rootTopic, undefined, new Set())
    expect(rootAvail.state).toBe('available')
    expect(rootAvail.missingPrerequisiteIds).toHaveLength(0)

    // 2. Child not started without completed root -> locked (advisory)
    const childLocked = deriveNodeState(childTopic, undefined, new Set())
    expect(childLocked.state).toBe('locked')
    expect(childLocked.missingPrerequisiteIds).toEqual(['root'])

    // 3. Child not started with completed root -> available
    const childAvail = deriveNodeState(childTopic, undefined, new Set(['root']))
    expect(childAvail.state).toBe('available')
    expect(childAvail.missingPrerequisiteIds).toHaveLength(0)

    // 4. In-progress topic -> in-progress (NEVER locked even if prereqs missing)
    const progressInProgress: TopicProgress = {
      status: 'in-progress',
      lessonDone: true,
      quizPassed: false,
      quizPerfect: false,
      practiceDone: false,
      usedSolution: false,
      touched: true,
      parts: 1,
      partsTotal: 3,
    }
    const childTouched = deriveNodeState(childTopic, progressInProgress, new Set())
    expect(childTouched.state).toBe('in-progress')

    // 5. Completed topic -> completed
    const progressCompleted: TopicProgress = {
      ...progressInProgress,
      status: 'completed',
      lessonDone: true,
      quizPassed: true,
      quizPerfect: false,
      practiceDone: true,
      parts: 3,
    }
    const childDone = deriveNodeState(childTopic, progressCompleted, new Set(['root']))
    expect(childDone.state).toBe('completed')

    // 6. Mastered topic -> completed
    const progressMastered: TopicProgress = {
      ...progressCompleted,
      status: 'mastered',
      quizPerfect: true,
    }
    const childMastered = deriveNodeState(childTopic, progressMastered, new Set(['root']))
    expect(childMastered.state).toBe('completed')
  })

  it('computes counts that strictly sum to n', () => {
    const topics: Topic[] = [rootTopic, childTopic]
    const progressMap: Record<string, TopicProgress> = {
      root: {
        status: 'completed',
        lessonDone: true,
        quizPassed: true,
        quizPerfect: false,
        practiceDone: true,
        usedSolution: false,
        touched: true,
        parts: 3,
        partsTotal: 3,
      },
    }

    const counts = computeConstellationCounts(topics, progressMap)
    expect(counts.total).toBe(2)
    expect(counts.completed).toBe(1) // root
    expect(counts.available).toBe(1) // child has completed root
    expect(counts.locked).toBe(0)
    expect(counts.inProgress).toBe(0)
    expect(counts.completed + counts.inProgress + counts.available + counts.locked).toBe(counts.total)
  })
})
