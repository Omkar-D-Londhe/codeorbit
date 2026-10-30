import type { AchievementDef, EngagementContext } from '../../core/gamification/achievements'
import type { CodeOrbitState } from '../../state/types'
import { PYTHON_TECH_ID, pythonTopics } from './curriculum'

const isChallengeDone = (state: CodeOrbitState, challengeId: string): boolean => {
  return state.challenges?.[challengeId]?.completed === true
}

const isTopicDone = (ctx: EngagementContext, topicId: string): boolean => {
  const p = ctx.progressOf(topicId)
  return p.status === 'completed' || p.status === 'mastered'
}

export const pythonAchievements: AchievementDef[] = [
  {
    id: 'py-first-script',
    title: 'Python Initiate',
    rule: 'Complete your first Python foundation topic.',
    scope: { trackId: PYTHON_TECH_ID },
    evaluate: (_state, ctx) => ({
      earned: isTopicDone(ctx, 'py-basics'),
    }),
  },
  {
    id: 'py-collections-master',
    title: 'Data Wrangler',
    rule: 'Master Python lists, dictionaries, tuples, and sets in data structures practice.',
    scope: { trackId: PYTHON_TECH_ID },
    evaluate: (state) => ({
      earned: isChallengeDone(state, 'py-ch-data-structures'),
    }),
  },
  {
    id: 'py-comprehension-wizard',
    title: 'Idiomatic Pythonista',
    rule: 'Author concise and filtered transformations using list comprehensions.',
    scope: { trackId: PYTHON_TECH_ID },
    evaluate: (state) => ({
      earned: isChallengeDone(state, 'py-ch-comprehensions'),
    }),
  },
  {
    id: 'py-recursion-ace',
    title: 'Stack Climber',
    rule: 'Implement recursive problem decomposition with verified base case handling.',
    scope: { trackId: PYTHON_TECH_ID },
    evaluate: (state) => ({
      earned: isChallengeDone(state, 'py-ch-recursion'),
    }),
  },
  {
    id: 'py-track-complete',
    title: 'Python Orbit Master',
    rule: 'Complete all topics across the entire Python track curriculum.',
    scope: { trackId: PYTHON_TECH_ID },
    evaluate: (_state, ctx) => {
      const completedCount = pythonTopics.filter((t) => isTopicDone(ctx, t.id)).length
      return {
        earned: completedCount === pythonTopics.length,
        progress: completedCount / pythonTopics.length,
      }
    },
  },
]
