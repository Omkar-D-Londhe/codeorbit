import { describe, expect, it } from 'vitest'
import { toChallenge, toChallengeV2 } from '../core/content/challengeAdapter'
import { challenges } from '../data/challenges'

describe('ChallengeAdapter', () => {
  it('converts every existing challenge to ChallengeV2 correctly', () => {
    expect(challenges.length).toBeGreaterThan(0)

    for (const c of challenges) {
      const v2 = toChallengeV2(c)

      expect(v2.id).toBe(c.id)
      expect(v2.topicId).toBe(c.topicId)
      expect(v2.title).toBe(c.title)
      expect(v2.difficulty).toBe(c.difficulty)
      expect(v2.prompt).toBe(c.prompt)
      expect(v2.objective).toBe(c.objective)

      expect(v2.files).toHaveLength(1)
      expect(v2.files[0].content).toBe(c.starterCode)

      expect(v2.solution.files).toHaveLength(1)
      expect(v2.solution.files[0].content).toBe(c.solutionCode)

      expect(v2.hints).toEqual(c.hints)
      expect(v2.requirements).toEqual(c.requirements)
    }
  })

  it('round-trips every challenge without data loss', () => {
    for (const c of challenges) {
      const v2 = toChallengeV2(c)
      const roundTripped = toChallenge(v2)

      expect(roundTripped.id).toBe(c.id)
      expect(roundTripped.topicId).toBe(c.topicId)
      expect(roundTripped.title).toBe(c.title)
      expect(roundTripped.difficulty).toBe(c.difficulty)
      expect(roundTripped.prompt).toBe(c.prompt)
      expect(roundTripped.objective).toBe(c.objective)
      expect(roundTripped.starterCode).toBe(c.starterCode)
      expect(roundTripped.solutionCode).toBe(c.solutionCode)
      expect(roundTripped.hints).toEqual(c.hints)
      expect(roundTripped.requirements).toEqual(c.requirements)
      expect(roundTripped.solutionExplanation).toEqual(c.solutionExplanation)
    }
  })
})
