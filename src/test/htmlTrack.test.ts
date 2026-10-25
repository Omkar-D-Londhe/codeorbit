import { describe, expect, it } from 'vitest'
import { getTrack, getTracks } from '../core/content/registry'
import { htmlTrack } from '../tracks/html/track'

describe('HTML Track Module and Registry Integration', () => {
  it('has valid metadata, unique ID, and truthful capabilities', () => {
    expect(htmlTrack.id).toBe('html')
    expect(htmlTrack.name).toBe('HTML')
    expect(htmlTrack.availability).toBe('available')
    expect(htmlTrack.capabilities).toEqual(['lessons', 'quizzes', 'practice', 'preview', 'diagnostics'])

    // Truthful capabilities: does not claim execution, complexity analysis or optimisation
    expect(htmlTrack.capabilities).not.toContain('execution')
    expect(htmlTrack.capabilities).not.toContain('complexity')
    expect(htmlTrack.capabilities).not.toContain('optimisation')
  })

  it('has unique topic IDs', () => {
    const topicIds = htmlTrack.topics.map((t) => t.id)
    const uniqueIds = new Set(topicIds)
    expect(uniqueIds.size).toBe(topicIds.length)
    expect(topicIds.length).toBe(12)
  })

  it('ensures every topic has a lesson, a 3+ question quiz, and a challenge', () => {
    for (const topic of htmlTrack.topics) {
      // Lesson check
      const lesson = htmlTrack.lessons[topic.id]
      expect(lesson, `Lesson missing for topic ${topic.id}`).toBeDefined()
      expect(lesson.sections.length).toBeGreaterThan(0)

      // Quiz check
      const quiz = htmlTrack.quizzes[topic.id]
      expect(quiz, `Quiz missing for topic ${topic.id}`).toBeDefined()
      expect(quiz.questions.length).toBeGreaterThanOrEqual(3)

      // Challenge check
      const matchingChallenges = htmlTrack.challenges.filter((c) => c.topicId === topic.id)
      expect(matchingChallenges.length, `Challenge missing for topic ${topic.id}`).toBeGreaterThanOrEqual(1)
    }
  })

  it('registers HTML and planned tracks with unique IDs', () => {
    const tracks = getTracks()
    expect(tracks.length).toBeGreaterThanOrEqual(5)

    const ids = tracks.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)

    const registeredHtml = getTrack('html')
    expect(registeredHtml).toBeDefined()
    expect(registeredHtml?.availability).toBe('available')

    const plannedIds = ['css', 'javascript', 'bootstrap', 'angular']
    for (const pid of plannedIds) {
      const track = getTrack(pid)
      expect(track, `Track ${pid} should be registered`).toBeDefined()
      expect(track?.availability).toBe('planned')
      expect(track?.capabilities).toEqual([])
    }
  })
})
