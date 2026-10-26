import type { Topic, NodeState } from './types'
import type { TopicProgress } from '../../../lib/progress'

export interface DerivedNodeStateResult {
  state: NodeState
  missingPrerequisiteIds: string[]
}

/**
 * Derives presentation NodeState (completed | in-progress | available | locked)
 * strictly from TopicProgress and declared prerequisite completion.
 * O-16 confirmed: "locked" is an advisory status; learners are not blocked.
 */
export function deriveNodeState(
  topic: Topic,
  progress: TopicProgress | undefined,
  completedIds: ReadonlySet<string>
): DerivedNodeStateResult {
  const missingPrerequisiteIds = (topic.prerequisiteIds || []).filter(
    (id) => !completedIds.has(id)
  )

  const status = progress?.status ?? 'not-started'

  if (status === 'completed' || status === 'mastered') {
    return { state: 'completed', missingPrerequisiteIds }
  }

  // A topic with real progress is never locked
  if (status === 'in-progress') {
    return { state: 'in-progress', missingPrerequisiteIds }
  }

  // Not started: available if all prerequisites completed (or none declared), else locked
  if (missingPrerequisiteIds.length === 0) {
    return { state: 'available', missingPrerequisiteIds }
  }

  return { state: 'locked', missingPrerequisiteIds }
}

export interface ConstellationStateCounts {
  completed: number
  inProgress: number
  available: number
  locked: number
  total: number
}

export function computeConstellationCounts(
  topics: Topic[],
  progressMap: Record<string, TopicProgress | undefined>
): ConstellationStateCounts {
  // Collect completed topic IDs first
  const completedIds = new Set<string>()
  for (const t of topics) {
    const s = progressMap[t.id]?.status
    if (s === 'completed' || s === 'mastered') {
      completedIds.add(t.id)
    }
  }

  let completed = 0
  let inProgress = 0
  let available = 0
  let locked = 0

  for (const t of topics) {
    const { state } = deriveNodeState(t, progressMap[t.id], completedIds)
    switch (state) {
      case 'completed':
        completed++
        break
      case 'in-progress':
        inProgress++
        break
      case 'available':
        available++
        break
      case 'locked':
        locked++
        break
    }
  }

  return {
    completed,
    inProgress,
    available,
    locked,
    total: topics.length,
  }
}
