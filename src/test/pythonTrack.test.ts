import { describe, expect, it } from 'vitest'
import { getTrack, getTracks } from '../core/content/registry'
import { pythonTrack } from '../tracks/python/track'
import { pythonTopics } from '../tracks/python/curriculum'
import { pythonAchievements } from '../tracks/python/achievements'
import { PYTHON_SNIPPETS } from '../tracks/python/snippets'
import { checkChallenge } from '../lib/validators'
import { getConcept } from '../core/concepts/concepts'
import type { ChoiceQuizQuestion } from '../data/types'

describe('Python Track Module and Content Verification (Stage 25a)', () => {
  it('has valid metadata, unique ID, and full Stage 25b capabilities', () => {
    expect(pythonTrack.id).toBe('python')
    expect(pythonTrack.name).toBe('Python')
    expect(pythonTrack.glyph).toBe('PY')
    expect(pythonTrack.availability).toBe('available')
    expect(pythonTrack.capabilities).toEqual([
      'lessons',
      'quizzes',
      'practice',
      'preview',
      'execution',
      'diagnostics',
      'snippets',
      'complexity',
      'optimisation',
    ])
    expect(pythonTrack.runner).toBeDefined()
    expect(pythonTrack.analysisProvider).toBeDefined()
  })

  it('has unique topic IDs and strict acyclic DAG topology', () => {
    const topicIds = pythonTrack.topics.map((t) => t.id)
    const uniqueIds = new Set(topicIds)
    expect(uniqueIds.size).toBe(topicIds.length)
    expect(topicIds.length).toBe(8)

    // Verify acyclicity
    const visited = new Set<string>()
    const inStack = new Set<string>()

    function hasCycle(id: string): boolean {
      visited.add(id)
      inStack.add(id)
      const topic = pythonTopics.find((t) => t.id === id)
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

  it('ensures every topic has a complete lesson with 3-5 takeaways, terms and demos', () => {
    for (const topic of pythonTrack.topics) {
      const lesson = pythonTrack.lessons[topic.id]
      expect(lesson, `Lesson missing for ${topic.id}`).toBeDefined()
      expect(lesson.objective.length).toBeGreaterThan(10)
      expect(lesson.takeaways?.length).toBeGreaterThanOrEqual(3)
      expect(lesson.takeaways?.length).toBeLessThanOrEqual(5)
      expect(Object.keys(lesson.terms ?? {}).length).toBeGreaterThanOrEqual(2)
      expect(lesson.sections.length).toBeGreaterThanOrEqual(2)
      expect(lesson.demos?.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('ensures every topic has a quiz with at least 3 choice questions', () => {
    let totalQuestions = 0
    for (const topic of pythonTrack.topics) {
      const quiz = pythonTrack.quizzes[topic.id]
      expect(quiz, `Quiz missing for ${topic.id}`).toBeDefined()
      expect(quiz.questions.length).toBeGreaterThanOrEqual(3)
      totalQuestions += quiz.questions.length

      for (const q of quiz.questions) {
        const choiceQ = q as ChoiceQuizQuestion
        expect(choiceQ.prompt.length).toBeGreaterThan(5)
        expect(choiceQ.options.length).toBeGreaterThanOrEqual(3)
        expect(choiceQ.correctIndex).toBeGreaterThanOrEqual(0)
        expect(choiceQ.correctIndex).toBeLessThan(choiceQ.options.length)
        expect(choiceQ.explanation.length).toBeGreaterThan(10)
      }
    }
    expect(totalQuestions).toBe(24)
  })

  it('verifies all 8 challenges have structure check notice and exactly 3 hints', () => {
    expect(pythonTrack.challenges.length).toBe(8)
    for (const ch of pythonTrack.challenges) {
      expect(ch.notice).toBe('Structure check — your code is not run')
      expect(ch.hints.length).toBe(3)
      expect(ch.requirements.length).toBeGreaterThanOrEqual(2)
      expect(ch.starterCode.length).toBeGreaterThan(0)
      expect(ch.solutionCode.length).toBeGreaterThan(0)
      expect(ch.solutionExplanation.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('verifies 100% of challenge starters fail and 100% of solutions pass', () => {
    for (const ch of pythonTrack.challenges) {
      // Starter must fail at least one requirement
      const starterResult = checkChallenge(ch, ch.starterCode)
      expect(
        starterResult.allPassed,
        `Starter for ${ch.id} should not pass all requirements`
      ).toBe(false)

      // Solution must pass all requirements
      const solutionResult = checkChallenge(ch, ch.solutionCode)
      expect(
        solutionResult.allPassed,
        `Solution for ${ch.id} failed: ${solutionResult.results.filter((r) => r.status === 'fail').map((r) => r.description).join(', ')}`
      ).toBe(true)
      expect(solutionResult.passed).toBe(ch.requirements.length)
    }
  })

  it('registers 5 Python achievements and 5 snippets', () => {
    expect(pythonAchievements.length).toBe(5)
    for (const ach of pythonAchievements) {
      expect(ach.id).toMatch(/^py-/)
      expect(ach.scope).toEqual({ trackId: 'python' })
    }

    expect(PYTHON_SNIPPETS.length).toBe(5)
    for (const snip of PYTHON_SNIPPETS) {
      expect(snip.id).toMatch(/^snip-py-/)
      expect(snip.language).toBe('python')
    }
  })

  it('registers Python track in TrackRegistry with available status', () => {
    const reg = getTrack('python')
    expect(reg).toBeDefined()
    expect(reg?.availability).toBe('available')
    expect(getTracks().some((t) => t.id === 'python')).toBe(true)
  })

  it('maps language-neutral concepts FC-21, FC-22, FC-23, FC-30 to Python topics', () => {
    const fc21 = getConcept('FC-21')
    expect(fc21?.teachIn?.some((t) => typeof t === 'object' && t.trackId === 'python' && t.topicId === 'py-data-structures')).toBe(true)

    const fc22 = getConcept('FC-22')
    expect(fc22?.teachIn?.some((t) => typeof t === 'object' && t.trackId === 'python' && t.topicId === 'py-functions')).toBe(true)

    const fc23 = getConcept('FC-23')
    expect(fc23?.teachIn?.some((t) => typeof t === 'object' && t.trackId === 'python' && t.topicId === 'py-control-flow')).toBe(true)

    const fc30 = getConcept('FC-30')
    expect(fc30?.teachIn?.some((t) => typeof t === 'object' && t.trackId === 'python' && t.topicId === 'py-testing-basics')).toBe(true)
  })
})
