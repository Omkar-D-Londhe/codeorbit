import { describe, it, expect, beforeEach } from 'vitest'
import { jsTrack } from '../tracks/javascript/track'
import { jsTopics, jsGroups } from '../tracks/javascript/curriculum'
import { jsLessons } from '../tracks/javascript/lessons'
import { jsQuizzes } from '../tracks/javascript/quizzes'
import { jsChallenges } from '../tracks/javascript/challenges'
import { getTrack, registerTrack } from '../core/content/registry'
import { registerTracks } from '../app/registerTracks'
import { createJavaScriptValidator } from '../tracks/javascript/validators'

describe('Stage 23a: JavaScript Track Module & Content Integrity', () => {
  beforeEach(() => {
    try {
      if (!getTrack('javascript')) {
        registerTrack(jsTrack)
      }
    } catch {
      // already registered
    }
  })

  it('declares 12 topics forming a strict DAG without cycles', () => {
    expect(jsTopics).toHaveLength(12)
    const topicIds = new Set(jsTopics.map((t) => t.id))

    // Every prerequisite points to a topic that appears earlier in the list
    const seen = new Set<string>()
    for (const topic of jsTopics) {
      for (const prereq of topic.prerequisiteIds) {
        expect(topicIds.has(prereq), `Prereq "${prereq}" in "${topic.id}" must exist`).toBe(true)
        expect(seen.has(prereq), `Prereq "${prereq}" must precede "${topic.id}" in DAG`).toBe(true)
      }
      seen.add(topic.id)
    }

    // 4 groups defined
    expect(jsGroups).toHaveLength(4)
    const groupIds = new Set(jsGroups.map((g) => g.id))
    for (const topic of jsTopics) {
      expect(groupIds.has(topic.groupId), `Topic "${topic.id}" has invalid groupId`).toBe(true)
    }
  })

  it('contains 12 complete lessons matching topic IDs with takeaways and terms', () => {
    expect(jsLessons).toHaveLength(12)
    for (const lesson of jsLessons) {
      expect(lesson.objective.trim().length).toBeGreaterThan(10)
      expect(lesson.takeaways?.length).toBeGreaterThanOrEqual(3)
      expect(Object.keys(lesson.terms || {}).length).toBeGreaterThanOrEqual(2)
      expect(lesson.a11yNotes?.length).toBeGreaterThanOrEqual(2)
      expect(lesson.sections.length).toBeGreaterThanOrEqual(2)
      expect(lesson.demos?.length ?? 0).toBeGreaterThanOrEqual(1)
    }
  })

  it('contains 12 quizzes with at least 3 questions each (>= 36 questions)', () => {
    expect(jsQuizzes).toHaveLength(12)
    let totalQuestions = 0
    for (const quiz of jsQuizzes) {
      expect(quiz.questions.length).toBeGreaterThanOrEqual(3)
      totalQuestions += quiz.questions.length
    }
    expect(totalQuestions).toBeGreaterThanOrEqual(36)
  })

  it('contains 12 challenges with unit tests across difficulties', () => {
    expect(jsChallenges).toHaveLength(12)
    const difficulties = jsChallenges.map((c) => c.difficulty)
    const interOrAdv = difficulties.filter((d) => d === 'intermediate' || d === 'advanced')
    expect(interOrAdv.length).toBeGreaterThanOrEqual(3)

    for (const challenge of jsChallenges) {
      expect(challenge.hints).toHaveLength(3)
      expect(challenge.solutionExplanation.length).toBeGreaterThanOrEqual(2)
      expect(challenge.tests).toBeDefined()
      expect(challenge.tests!.length).toBeGreaterThanOrEqual(4)

      const visible = challenge.tests!.filter((t) => !t.hidden)
      const hidden = challenge.tests!.filter((t) => t.hidden)
      expect(visible.length).toBeGreaterThanOrEqual(3)
      expect(hidden.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('verifies that starter codes fail validation and solution codes pass 100% of tests', async () => {
    for (const challenge of jsChallenges) {
      const validator = createJavaScriptValidator(challenge.requirements, {
        tests: challenge.tests,
      })

      // Starter code must fail at least one requirement
      const starterResults = await validator.validate([
        { name: 'solution.js', language: 'javascript', content: challenge.starterCode },
      ])
      const starterPassed = starterResults.every((r) => r.met)
      expect(starterPassed, `Starter code for ${challenge.id} should fail validation`).toBe(false)

      // Solution code must pass all requirements
      const solutionResults = await validator.validate([
        { name: 'solution.js', language: 'javascript', content: challenge.solutionCode },
      ])
      const solutionPassed = solutionResults.every((r) => r.met)
      expect(solutionPassed, `Solution code for ${challenge.id} must pass all requirements`).toBe(true)
    }
  })

  it('truthfully registers JavaScript track with correct capabilities', () => {
    registerTracks()
    const track = getTrack('javascript')
    expect(track).toBeDefined()
    expect(track?.availability).toBe('available')
    expect(track?.glyph).toBe('JS')
    expect(track?.tint).toBe('#14b8a6')
    expect(track?.capabilities).toEqual([
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
    expect(track?.snippets?.length).toBeGreaterThanOrEqual(3)
    expect(track?.achievements?.length).toBeGreaterThanOrEqual(4)
  })
})
