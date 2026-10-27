import type { TrackModule } from '../content/types'
import type { CodeOrbitState } from '../../state/types'
import { lessons } from '../../data/lessons'
import { challenges } from '../../data/challenges'
import { getTopic } from '../../data/curriculum'
import { lessonPath, practicePath } from '../../lib/routes'
import { fuzzy, type FuzzyMatch } from './fuzzy'
import type { Command } from './commands'

export interface SearchDoc {
  id: string
  kind: 'topic' | 'lesson-section' | 'challenge' | 'note' | 'bookmark' | 'command'
  trackId?: string
  title: string
  body: string
  tags: string[]
  path: string
  command?: Command
}

export interface SearchResult {
  doc: SearchDoc
  titleMatch: FuzzyMatch | null
  bodyMatch: FuzzyMatch | null
  score: number
}

/**
 * 9.1 / 9.2 Search Index: Lazily builds an in-memory search index
 * across topics, lesson sections, challenges, notes, bookmarks, and commands.
 * Never persists index to storage (in-memory only).
 */
export function buildIndex(
  tracks: readonly TrackModule[] | TrackModule[],
  state: CodeOrbitState,
  commands: Command[] = []
): SearchDoc[] {
  const docs: SearchDoc[] = []

  // 1. Commands (omitted if disabled)
  commands.forEach((cmd) => {
    if (cmd.enabled && !cmd.enabled()) return

    docs.push({
      id: `cmd-${cmd.id}`,
      kind: 'command',
      title: cmd.title,
      body: cmd.keywords.join(' '),
      tags: ['command', cmd.group.toLowerCase(), ...cmd.keywords],
      path: '',
      command: cmd,
    })
  })

  // 2. Tracks & Topics
  tracks.forEach((track) => {
    track.topics.forEach((topic) => {
      docs.push({
        id: `topic-${topic.id}`,
        kind: 'topic',
        trackId: track.id,
        title: topic.title,
        body: `${topic.description} ${topic.shortTitle}`,
        tags: ['topic', topic.groupId, track.id],
        path: lessonPath(topic.id),
      })
    })
  })

  // 3. Lesson sections, takeaways, and objectives
  lessons.forEach((lesson) => {
    const topic = getTopic(lesson.topicId)
    const topicTitle = topic?.title || lesson.topicId

    if (lesson.objective) {
      docs.push({
        id: `lesson-obj-${lesson.topicId}`,
        kind: 'lesson-section',
        title: `${topicTitle}: Learning Objective`,
        body: lesson.objective,
        tags: ['lesson', 'objective', lesson.topicId],
        path: lessonPath(lesson.topicId),
      })
    }

    if (lesson.takeaways && lesson.takeaways.length > 0) {
      lesson.takeaways.forEach((takeaway, idx) => {
        docs.push({
          id: `lesson-takeaway-${lesson.topicId}-${idx}`,
          kind: 'lesson-section',
          title: `${topicTitle}: Key Takeaway`,
          body: takeaway,
          tags: ['lesson', 'takeaway', lesson.topicId],
          path: lessonPath(lesson.topicId),
        })
      })
    }
  })

  // 4. Challenges
  challenges.forEach((challenge) => {
    docs.push({
      id: `challenge-${challenge.id}`,
      kind: 'challenge',
      title: challenge.title,
      body: `${challenge.objective || challenge.prompt || ''} ${challenge.difficulty} practice challenge`,
      tags: ['challenge', 'practice', challenge.difficulty, challenge.topicId],
      path: practicePath(challenge.id),
    })
  })

  // 5. User Notes (if any exist)
  Object.entries(state.notes || {}).forEach(([topicId, note]) => {
    if (note && note.text) {
      const topic = getTopic(topicId)
      docs.push({
        id: `note-${topicId}`,
        kind: 'note',
        title: `Note: ${topic?.title || topicId}`,
        body: note.text,
        tags: ['note', 'user-data', topicId],
        path: lessonPath(topicId),
      })
    }
  })

  // 6. User Bookmarks (if any exist)
  ;(state.bookmarks || []).forEach((topicId) => {
    const topic = getTopic(topicId)
    docs.push({
      id: `bookmark-${topicId}`,
      kind: 'bookmark',
      title: `Bookmarked: ${topic?.title || topicId}`,
      body: `Bookmarked topic in ${topic?.groupId || 'curriculum'}`,
      tags: ['bookmark', 'user-data', topicId],
      path: lessonPath(topicId),
    })
  })

  return docs
}

/**
 * Searches the index using the fuzzy scorer.
 * Results are ranked by score descending and capped at limit (default 50).
 */
export function searchIndex(
  index: SearchDoc[],
  query: string,
  limit = 50
): SearchResult[] {
  const q = query.trim()

  if (!q) {
    return index
      .filter((d) => d.kind === 'command' && (!d.command || d.command.enabled()))
      .slice(0, 8)
      .map((doc) => ({
        doc,
        titleMatch: { score: 100, ranges: [] },
        bodyMatch: null,
        score: 100,
      }))
  }

  const results: SearchResult[] = []

  for (const doc of index) {
    if (doc.kind === 'command' && doc.command && !doc.command.enabled()) {
      continue
    }

    const titleMatch = fuzzy(q, doc.title)
    const bodyMatch = fuzzy(q, doc.body)
    const tagMatch = doc.tags.some((t) => fuzzy(q, t) !== null)

    if (titleMatch || bodyMatch || tagMatch) {
      let score = 0
      if (titleMatch) score += titleMatch.score * 2.5
      if (bodyMatch) score += bodyMatch.score
      if (tagMatch) score += 40

      results.push({
        doc,
        titleMatch: titleMatch || { score: 0, ranges: [] },
        bodyMatch,
        score,
      })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, limit)
}
