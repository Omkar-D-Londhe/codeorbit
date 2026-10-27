import type { Topic } from '../../data/types'

export interface RelatedTopicMatch {
  topic: Topic
  reason: string
  relationType: 'prerequisite' | 'dependent' | 'group' | 'tag'
}

/**
 * Derives 2 to 4 related topics for a given topic based on:
 * 1. Direct prerequisites ('Prerequisite')
 * 2. Dependent topics that require this topic ('Required for this topic')
 * 3. Peer topics in the same group ('In same group')
 * 4. Topics sharing tags ('Shared topic tags')
 *
 * Excludes the target topic itself, deduplicates, and caps at maxCount (default 4).
 */
export function getRelatedTopics(
  targetTopic: Topic,
  allTopics: Topic[],
  maxCount: number = 4
): RelatedTopicMatch[] {
  if (!targetTopic || !allTopics || allTopics.length === 0) {
    return []
  }

  const results: RelatedTopicMatch[] = []
  const seenIds = new Set<string>([targetTopic.id])

  // 1. Prerequisites of target topic
  for (const prereqId of targetTopic.prerequisiteIds) {
    if (seenIds.has(prereqId)) continue
    const match = allTopics.find((t) => t.id === prereqId)
    if (match) {
      results.push({
        topic: match,
        reason: 'Prerequisite',
        relationType: 'prerequisite',
      })
      seenIds.add(match.id)
    }
  }

  // 2. Dependent topics (topics that require targetTopic)
  for (const candidate of allTopics) {
    if (seenIds.has(candidate.id)) continue
    if (candidate.prerequisiteIds?.includes(targetTopic.id)) {
      results.push({
        topic: candidate,
        reason: 'Required for this topic',
        relationType: 'dependent',
      })
      seenIds.add(candidate.id)
    }
  }

  // 3. Same group peers
  for (const candidate of allTopics) {
    if (seenIds.has(candidate.id)) continue
    if (candidate.groupId === targetTopic.groupId) {
      results.push({
        topic: candidate,
        reason: 'In same group',
        relationType: 'group',
      })
      seenIds.add(candidate.id)
    }
  }

  // 4. Shared tags (if tags exist)
  const targetTags = new Set(targetTopic.tags ?? [])
  if (targetTags.size > 0) {
    for (const candidate of allTopics) {
      if (seenIds.has(candidate.id)) continue
      const candidateTags = candidate.tags ?? []
      const sharedTag = candidateTags.find((tag) => targetTags.has(tag))
      if (sharedTag) {
        results.push({
          topic: candidate,
          reason: `Tag: ${sharedTag}`,
          relationType: 'tag',
        })
        seenIds.add(candidate.id)
      }
    }
  }

  return results.slice(0, maxCount)
}
