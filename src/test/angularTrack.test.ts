import { describe, it, expect } from 'vitest'
import { getTrack } from '../core/content/registry'
import { angularTrack } from '../tracks/angular/track'
import { angularTopics, angularGroups } from '../tracks/angular/curriculum'
import { angularLessons } from '../tracks/angular/lessons'
import { angularQuizzes } from '../tracks/angular/quizzes'
import { angularAchievements } from '../tracks/angular/achievements'
import { ANGULAR_SNIPPETS } from '../tracks/angular/snippets'
import { getConcept } from '../core/concepts/concepts'

describe('Pass 2 — Angular Track Definition & Content Integrity (O-05)', () => {
  it('registers the Angular track with available status', () => {
    const track = getTrack('angular')
    expect(track).toBeDefined()
    expect(track?.id).toBe('angular')
    expect(track?.name).toBe('Angular')
    expect(track?.glyph).toBe('A')
    expect(track?.availability).toBe('available')
  })

  it('provides approved capabilities including practice, preview, and diagnostics', () => {
    expect(angularTrack.capabilities).toEqual([
      'lessons',
      'quizzes',
      'practice',
      'preview',
      'diagnostics',
    ])
    expect(angularTrack.capabilities).toContain('practice')
    expect(angularTrack.capabilities).toContain('preview')
    expect(angularTrack.capabilities).toContain('diagnostics')
    expect(angularTrack.capabilities).not.toContain('complexity')
  })

  it('declares 12 interactive standalone practice challenges and runner', () => {
    expect(angularTrack.challenges.length).toBe(12)
    expect(angularTrack.runner).toBeDefined()
  })

  it('defines 4 topic groups and 6 topics forming an acyclic DAG', () => {
    expect(angularGroups.length).toBe(4)
    expect(angularTopics.length).toBe(6)

    const topicIds = new Set(angularTopics.map((t) => t.id))
    expect(topicIds.size).toBe(6)

    // Check that every prerequisite references an existing topic
    for (const topic of angularTopics) {
      for (const prereqId of topic.prerequisiteIds) {
        expect(topicIds.has(prereqId)).toBe(true)
      }
    }

    // Check for acyclicity
    const visited = new Set<string>()
    const visiting = new Set<string>()

    function dfs(id: string) {
      if (visiting.has(id)) throw new Error(`Cycle detected at topic ${id}`)
      if (visited.has(id)) return
      visiting.add(id)
      const topic = angularTopics.find((t) => t.id === id)!
      for (const prereq of topic.prerequisiteIds) {
        dfs(prereq)
      }
      visiting.delete(id)
      visited.add(id)
    }

    for (const topic of angularTopics) {
      dfs(topic.id)
    }
    expect(visited.size).toBe(6)
  })

  it('provides comprehensive lessons for all 6 topics with objectives and terms', () => {
    expect(angularLessons.length).toBe(6)
    for (const topic of angularTopics) {
      const lesson = angularTrack.lessons[topic.id]
      expect(lesson).toBeDefined()
      expect(lesson.objective.length).toBeGreaterThan(15)
      expect(lesson.takeaways?.length).toBeGreaterThanOrEqual(3)
      expect(Object.keys(lesson.terms ?? {}).length).toBeGreaterThanOrEqual(2)
      expect(lesson.sections.length).toBeGreaterThanOrEqual(2)
      for (const sec of lesson.sections) {
        expect(sec.heading).toBeTruthy()
        expect(sec.body.length).toBeGreaterThan(0)
      }
    }
  })

  it('provides deterministic quizzes with 3 questions per topic and valid answer keys', () => {
    expect(angularQuizzes.length).toBe(6)
    let totalQuestions = 0
    for (const topic of angularTopics) {
      const quiz = angularTrack.quizzes[topic.id]
      expect(quiz).toBeDefined()
      expect(quiz.questions.length).toBe(3)
      totalQuestions += quiz.questions.length
      for (const q of quiz.questions) {
        if (q.kind === 'choice') {
          expect(q.options.length).toBe(4)
          expect(q.correctIndex).toBeGreaterThanOrEqual(0)
          expect(q.correctIndex).toBeLessThan(q.options.length)
        }
        expect(q.explanation.length).toBeGreaterThan(10)
      }
    }
    expect(totalQuestions).toBe(18)
  })

  it('provides gamification achievements and read-only code snippets', () => {
    expect(angularAchievements.length).toBe(4)
    expect(ANGULAR_SNIPPETS.length).toBe(4)
    for (const snip of ANGULAR_SNIPPETS) {
      expect(snip.code).toBeTruthy()
      expect(snip.description).toBeTruthy()
    }
  })

  it('maps FC-29 in Concept Atlas as pending-review with no course evidence found and no platform use', () => {
    const fc29 = getConcept('FC-29')
    expect(fc29).toBeDefined()
    expect(fc29?.id).toBe('FC-29')
    expect(fc29?.area).toBe('angular')
    expect(fc29?.courseStatus).toBe('pending-review')
    expect(fc29?.platformUse).toBeUndefined()
    expect(fc29?.assessmentRef).toBe('no course evidence found')
    expect(fc29?.teachIn.length).toBe(6)
    expect(fc29?.teachIn.map((t) => t.topicId)).toEqual([
      'ng-components',
      'ng-templates',
      'ng-data-binding',
      'ng-directives',
      'ng-services',
      'ng-routing',
    ])
  })
})
