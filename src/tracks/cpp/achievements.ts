import type { AchievementDef, EngagementContext } from '../../core/gamification/achievements'
import type { CodeOrbitState } from '../../state/types'
import { CPP_TECH_ID, cppTopics } from './curriculum'

const isChallengeDone = (state: CodeOrbitState, challengeId: string): boolean => {
  return state.challenges?.[challengeId]?.completed === true
}

const isTopicDone = (ctx: EngagementContext, topicId: string): boolean => {
  const p = ctx.progressOf(topicId)
  return p.status === 'completed' || p.status === 'mastered'
}

export const cppAchievements: AchievementDef[] = [
  {
    id: 'cpp-first-stream',
    title: 'Stream Pioneer',
    rule: 'Output formatted data through C++ iostream pipelines.',
    scope: { trackId: CPP_TECH_ID },
    evaluate: (_state, ctx) => ({
      earned: isTopicDone(ctx, 'cpp-syntax-io'),
    }),
  },
  {
    id: 'cpp-pointer-pilot',
    title: 'Address Space Pilot',
    rule: 'Master memory pointers, address-of semantics, and nullptr checks in C++.',
    scope: { trackId: CPP_TECH_ID },
    evaluate: (state) => ({
      earned: isChallengeDone(state, 'cpp-ch-pointers'),
    }),
  },
  {
    id: 'cpp-oop-artisan',
    title: 'C++ Class Artisan',
    rule: 'Build an encapsulated class with access specifiers and initializer lists.',
    scope: { trackId: CPP_TECH_ID },
    evaluate: (state) => ({
      earned: isChallengeDone(state, 'cpp-ch-classes'),
    }),
  },
  {
    id: 'cpp-track-complete',
    title: 'Modern C++ Master',
    rule: 'Complete all topics in the C++ Learning Orbit.',
    scope: { trackId: CPP_TECH_ID },
    evaluate: (_state, ctx) => {
      const allDone = cppTopics.every((t) => isTopicDone(ctx, t.id))
      return { earned: allDone }
    },
  },
]
