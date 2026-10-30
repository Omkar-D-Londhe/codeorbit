import { describe, expect, it } from 'vitest'
import { bootstrapTrack } from '../tracks/bootstrap/track'
import { bootstrapTopics } from '../tracks/bootstrap/curriculum'
import { bootstrapLessons } from '../tracks/bootstrap/lessons'
import { bootstrapQuizzes } from '../tracks/bootstrap/quizzes'
import { bootstrapChallenges } from '../tracks/bootstrap/challenges'
import { checkRequirements } from '../lib/validators'
import { getConcept } from '../core/concepts/concepts'

describe('Stage 24: Bootstrap Track Module & Content Integrity', () => {
  it('registers Bootstrap track with truthful availability and capabilities', () => {
    expect(bootstrapTrack.id).toBe('bootstrap')
    expect(bootstrapTrack.name).toBe('Bootstrap')
    expect(bootstrapTrack.glyph).toBe('B')
    expect(bootstrapTrack.availability).toBe('available')
    expect(bootstrapTrack.tint).toBe('#8b5cf6')
    expect(bootstrapTrack.capabilities).toEqual([
      'lessons',
      'quizzes',
      'practice',
      'preview',
      'diagnostics',
      'snippets',
    ])
    expect(bootstrapTrack.previewStylesheets?.length).toBe(1)
  })

  it('forms an acyclic curriculum DAG across all 8 Bootstrap topics', () => {
    expect(bootstrapTopics.length).toBe(8)
    const topicIds = new Set(bootstrapTopics.map((t) => t.id))

    for (const topic of bootstrapTopics) {
      for (const prereq of topic.prerequisiteIds) {
        expect(topicIds.has(prereq), `Topic ${topic.id} has invalid prereq ${prereq}`).toBe(true)
      }
    }

    // Topological sorting / cycle check
    const visited = new Set<string>()
    const visiting = new Set<string>()

    function dfs(nodeId: string) {
      if (visiting.has(nodeId)) {
        throw new Error(`Cycle detected at topic ${nodeId}`)
      }
      if (visited.has(nodeId)) return
      visiting.add(nodeId)

      const topic = bootstrapTopics.find((t) => t.id === nodeId)!
      for (const prereq of topic.prerequisiteIds) {
        dfs(prereq)
      }

      visiting.delete(nodeId)
      visited.add(nodeId)
    }

    for (const topic of bootstrapTopics) {
      dfs(topic.id)
    }
    expect(visited.size).toBe(8)
  })

  it('provides complete lessons with takeaways, terms, and interactive demos', () => {
    expect(bootstrapLessons.length).toBe(8)
    for (const lesson of bootstrapLessons) {
      expect(lesson.objective.length).toBeGreaterThan(5)
      expect(lesson.takeaways?.length).toBeGreaterThanOrEqual(3)
      expect(Object.keys(lesson.terms ?? {}).length).toBeGreaterThanOrEqual(2)
      expect(lesson.demos?.length).toBeGreaterThanOrEqual(1)
      expect(lesson.demos?.[0]?.files[0]?.content.length).toBeGreaterThan(20)
    }
  })

  it('provides comprehensive quizzes with 3 questions per topic (24 questions total)', () => {
    expect(bootstrapQuizzes.length).toBe(8)
    let totalQuestions = 0
    for (const quiz of bootstrapQuizzes) {
      expect(quiz.questions.length).toBeGreaterThanOrEqual(3)
      totalQuestions += quiz.questions.length
      for (const q of quiz.questions) {
        expect(q.prompt.length).toBeGreaterThan(10)
        expect(q.explanation.length).toBeGreaterThan(10)
        if (q.kind === 'choice') {
          expect(q.options.length).toBeGreaterThanOrEqual(3)
        }
      }
    }
    expect(totalQuestions).toBe(24)
  })

  it('includes educational notice on authentication challenges (FC-27)', () => {
    const authChallenge = bootstrapChallenges.find((c) => c.id === 'bs-ch-auth-forms')
    expect(authChallenge).toBeDefined()
    expect(authChallenge?.notice).toBe('Presentation only: nothing is sent or stored.')
  })

  it('verifies that all starter codes fail validation and all solutions pass 100% of requirements', () => {
    expect(bootstrapChallenges.length).toBe(8)

    for (const challenge of bootstrapChallenges) {
      // 1. Starter code verification
      const starterResult = checkRequirements(challenge.requirements, challenge.starterCode)
      expect(
        starterResult.allPassed,
        `Starter for ${challenge.id} should not pass all requirements`,
      ).toBe(false)

      // 2. Solution code verification
      const solutionResult = checkRequirements(challenge.requirements, challenge.solutionCode)
      expect(
        solutionResult.allPassed,
        `Solution for ${challenge.id} must pass all requirements. Failed: ${solutionResult.results
          .filter((r) => r.status === 'fail')
          .map((r) => r.description)
          .join(', ')}`,
      ).toBe(true)

      // 3. Hints integrity
      expect(challenge.hints.length).toBe(3)
      expect(challenge.solutionExplanation.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('validates Concept Atlas entries FC-26, FC-27, FC-28 with teaching-only separation', () => {
    const fc26 = getConcept('FC-26')!
    expect(fc26).toBeDefined()
    expect(fc26.platformUse).toBeUndefined()
    expect(fc26.teachIn[0].trackId).toBe('bootstrap')
    expect(fc26.teachIn[0].topicId).toBe('navbar')

    const fc27 = getConcept('FC-27')!
    expect(fc27).toBeDefined()
    expect(fc27.platformUse).toBeUndefined()
    expect(fc27.teachIn[0].trackId).toBe('bootstrap')
    expect(fc27.teachIn[0].topicId).toBe('auth-forms')

    const fc28 = getConcept('FC-28')!
    expect(fc28).toBeDefined()
    expect(fc28.platformUse).toBeUndefined()
    expect(fc28.teachIn[0].trackId).toBe('bootstrap')
    expect(fc28.teachIn[0].topicId).toBe('grid-system')
  })

  it('provides 5 snippets and 5 track achievements', () => {
    expect(bootstrapTrack.snippets?.length).toBe(5)
    expect(bootstrapTrack.achievements?.length).toBe(5)
  })
})
