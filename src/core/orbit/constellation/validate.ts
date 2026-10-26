import type { Topic, TopicGroup, ConstellationTrackMeta, ValidationIssue } from './types'

export function validateConstellation(
  track: { topics: Topic[]; groups?: TopicGroup[] },
  meta?: ConstellationTrackMeta
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const { topics } = track

  // 1. Unique topic IDs
  const topicIdSet = new Set<string>()
  for (const t of topics) {
    if (topicIdSet.has(t.id)) {
      issues.push({
        kind: 'duplicate-id',
        message: `Duplicate topic id found: "${t.id}"`,
        topicId: t.id,
      })
    }
    topicIdSet.add(t.id)
  }

  // 2. Capacity check (<= 42 topics)
  if (topics.length > 42) {
    issues.push({
      kind: 'capacity-exceeded',
      message: `Constellation map exceeds maximum capacity of 42 topics (found ${topics.length})`,
    })
  }

  // 3. Every prerequisiteId exists in the track
  for (const t of topics) {
    for (const prereqId of t.prerequisiteIds || []) {
      if (!topicIdSet.has(prereqId)) {
        issues.push({
          kind: 'unknown-prereq',
          message: `Topic "${t.id}" declares unknown prerequisite "${prereqId}"`,
          topicId: t.id,
        })
      }
    }
  }

  // 4. Prerequisites form a DAG (cycle detection via Kahn's / in-degree)
  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()
  for (const t of topics) {
    inDegree.set(t.id, 0)
    adj.set(t.id, [])
  }

  for (const t of topics) {
    for (const prereqId of t.prerequisiteIds || []) {
      if (topicIdSet.has(prereqId)) {
        adj.get(prereqId)?.push(t.id)
        inDegree.set(t.id, (inDegree.get(t.id) ?? 0) + 1)
      }
    }
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id)
  }

  let visitedCount = 0
  while (queue.length > 0) {
    const u = queue.shift()!
    visitedCount++
    for (const v of adj.get(u) || []) {
      const nextDeg = (inDegree.get(v) ?? 1) - 1
      inDegree.set(v, nextDeg)
      if (nextDeg === 0) queue.push(v)
    }
  }

  if (visitedCount < topics.length) {
    issues.push({
      kind: 'cycle',
      message: 'Prerequisite dependencies contain one or more cycles',
    })
  }

  // 5. Authored meta checks
  if (meta?.topics && meta.topics.length > 0) {
    for (const mt of meta.topics) {
      if (!topicIdSet.has(mt.topicId)) {
        issues.push({
          kind: 'missing-topic',
          message: `Authored meta refers to unknown topic id "${mt.topicId}"`,
          topicId: mt.topicId,
        })
      }
    }

    const topicsWithCoords = meta.topics.filter(
      (m) => typeof m.x === 'number' && typeof m.y === 'number'
    )
    if (topicsWithCoords.length > 0 && topicsWithCoords.length < topics.length) {
      issues.push({
        kind: 'incomplete-authored-coords',
        message: `Authored coordinates must be all-or-nothing (found ${topicsWithCoords.length} of ${topics.length} topics)`,
      })
    }

    for (const m of topicsWithCoords) {
      if (m.x! < 0 || m.x! > 1200 || m.y! < 0 || m.y! > 1100) {
        issues.push({
          kind: 'invalid-coord',
          message: `Authored coordinates (${m.x}, ${m.y}) for topic "${m.topicId}" out of virtual bounds`,
          topicId: m.topicId,
        })
      }
    }
  }

  return issues
}
