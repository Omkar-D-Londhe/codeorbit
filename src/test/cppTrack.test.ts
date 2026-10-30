import { describe, expect, it } from 'vitest'
import { cppTrack } from '../tracks/cpp/track'
import { cppTopics } from '../tracks/cpp/curriculum'
import { cppAchievements } from '../tracks/cpp/achievements'
import { CPP_SNIPPETS } from '../tracks/cpp/snippets'
import { checkChallenge } from '../lib/validators'
import { getConcept } from '../core/concepts/concepts'
import type { ChoiceQuizQuestion } from '../data/types'

describe('C++ Track Module and Content Verification (Stage 26)', () => {
  it('has valid metadata, unique ID, and Pass 2 execution capabilities', () => {
    expect(cppTrack.id).toBe('cpp')
    expect(cppTrack.name).toBe('C++')
    expect(cppTrack.glyph).toBe('C+')
    expect(cppTrack.availability).toBe('available')
    expect(cppTrack.capabilities).toEqual([
      'lessons',
      'quizzes',
      'practice',
      'execution',
      'diagnostics',
      'snippets',
      'complexity',
      'optimisation',
    ])
    expect(cppTrack.runner).toBeDefined()
    expect(cppTrack.capabilities).toContain('execution')
    expect(cppTrack.analysisProvider).toBeDefined()
  })

  it('has unique topic IDs and strict acyclic DAG topology', () => {
    const topicIds = cppTrack.topics.map((t) => t.id)
    const uniqueIds = new Set(topicIds)
    expect(uniqueIds.size).toBe(topicIds.length)
    expect(topicIds.length).toBe(6)

    const visited = new Set<string>()
    const inStack = new Set<string>()

    function hasCycle(id: string): boolean {
      visited.add(id)
      inStack.add(id)
      const topic = cppTopics.find((t) => t.id === id)
      if (topic) {
        for (const prereq of topic.prerequisiteIds) {
          if (!visited.has(prereq) && hasCycle(prereq)) return true
          if (inStack.has(prereq)) return true
        }
      }
      inStack.delete(id)
      return false
    }

    for (const id of topicIds) {
      if (!visited.has(id)) {
        expect(hasCycle(id), `Cycle detected involving topic ${id}`).toBe(false)
      }
    }
  })

  it('every topic has an associated comprehensive lesson with learning objectives and terms', () => {
    for (const topic of cppTrack.topics) {
      const lesson = cppTrack.lessons[topic.id]
      expect(lesson, `Lesson missing for topic ${topic.id}`).toBeDefined()
      expect(lesson.objective.length).toBeGreaterThan(10)
      expect(lesson.takeaways?.length).toBeGreaterThanOrEqual(3)
      expect(Object.keys(lesson.terms ?? {}).length).toBeGreaterThanOrEqual(2)
      expect(lesson.sections.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('every topic has an associated quiz with valid questions and deterministic answers', () => {
    for (const topic of cppTrack.topics) {
      const quiz = cppTrack.quizzes[topic.id]
      expect(quiz, `Quiz missing for topic ${topic.id}`).toBeDefined()
      expect(quiz.questions.length).toBe(3)

      for (const question of quiz.questions) {
        expect(question.prompt).toBeTruthy()
        expect(question.explanation).toBeTruthy()

        const choiceQ = question as ChoiceQuizQuestion
        expect(choiceQ.options.length).toBeGreaterThanOrEqual(3)
        expect(choiceQ.correctIndex).toBeGreaterThanOrEqual(0)
        expect(choiceQ.correctIndex).toBeLessThan(choiceQ.options.length)
      }
    }
  })

  it('provides practice challenges with 100% passing solutions and failing starter codes', () => {
    expect(cppTrack.challenges.length).toBe(6)

    for (const challenge of cppTrack.challenges) {
      expect(challenge.hints.length).toBe(3)
      expect(challenge.hints[0]).toBeTruthy()
      expect(challenge.hints[1]).toBeTruthy()
      expect(challenge.hints[2]).toBeTruthy()

      // Starter code must fail at least one requirement
      const starterResult = checkChallenge(challenge, challenge.starterCode)
      expect(
        starterResult.allPassed,
        `Starter code for ${challenge.id} should not pass all checks`,
      ).toBe(false)

      // Official solution must pass 100% of requirements
      const solutionResult = checkChallenge(challenge, challenge.solutionCode)
      expect(
        solutionResult.allPassed,
        `Official solution for ${challenge.id} failed requirements: ${solutionResult.passed} of ${solutionResult.total}`,
      ).toBe(true)
    }
  })

  it('includes achievements and snippets', () => {
    expect(cppAchievements.length).toBe(4)
    expect(CPP_SNIPPETS.length).toBe(4)

    for (const snippet of CPP_SNIPPETS) {
      expect(snippet.code).toBeTruthy()
      expect(snippet.title).toBeTruthy()
    }
  })

  it('maps to Concept Atlas FC-21, FC-22, FC-23', () => {
    const fc21 = getConcept('FC-21')
    expect(fc21?.teachIn.some((t) => t.trackId === 'cpp')).toBe(true)

    const fc22 = getConcept('FC-22')
    expect(fc22?.teachIn.some((t) => t.trackId === 'cpp')).toBe(true)

    const fc23 = getConcept('FC-23')
    expect(fc23?.teachIn.some((t) => t.trackId === 'cpp')).toBe(true)
  })
})
