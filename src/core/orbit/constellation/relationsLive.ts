import type { Topic } from './types'

export interface TopicRelations {
  topic: Topic | null
  prerequisites: Topic[]
  dependents: Topic[]
  liveAnnouncement: string
}

/**
 * Catalog 2.3: Prerequisite Constellation Lines & Relations Text
 * Formats polite screen reader announcements and text relations for
 * hovered, focused, or selected stars.
 */
export function getTopicRelations(topicId: string, topics: Topic[]): TopicRelations {
  const topic = topics.find((t) => t.id === topicId) || null
  if (!topic) {
    return {
      topic: null,
      prerequisites: [],
      dependents: [],
      liveAnnouncement: '',
    }
  }

  const prerequisites = (topic.prerequisiteIds || [])
    .map((id) => topics.find((t) => t.id === id))
    .filter(Boolean) as Topic[]

  const dependents = topics.filter((t) => t.prerequisiteIds?.includes(topic.id))

  const prereqTitles = prerequisites.map((p) => p.title).join(', ')
  const depTitles = dependents.map((d) => d.title).join(', ')

  let liveAnnouncement: string
  if (prereqTitles && depTitles) {
    liveAnnouncement = `${topic.title}. Requires: ${prereqTitles}. Unlocks: ${depTitles}.`
  } else if (prereqTitles) {
    liveAnnouncement = `${topic.title}. Requires: ${prereqTitles}.`
  } else if (depTitles) {
    liveAnnouncement = `${topic.title}. Unlocks: ${depTitles}.`
  } else {
    liveAnnouncement = `${topic.title}. No prerequisites required.`
  }

  return {
    topic,
    prerequisites,
    dependents,
    liveAnnouncement,
  }
}
