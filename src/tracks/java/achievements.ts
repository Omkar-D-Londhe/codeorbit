import type { AchievementDef, EngagementContext } from '../../core/gamification/achievements'
import type { CodeOrbitState } from '../../state/types'
import { JAVA_TECH_ID, javaTopics } from './curriculum'

const isChallengeDone = (state: CodeOrbitState, challengeId: string): boolean => {
  return state.challenges?.[challengeId]?.completed === true
}

const isTopicDone = (ctx: EngagementContext, topicId: string): boolean => {
  const p = ctx.progressOf(topicId)
  return p.status === 'completed' || p.status === 'mastered'
}

export const javaAchievements: AchievementDef[] = [
  {
    id: 'java-first-class',
    title: 'Java Initiate',
    rule: 'Complete your first Java syntax and primitive types topic.',
    scope: { trackId: JAVA_TECH_ID },
    evaluate: (_state, ctx) => ({
      earned: isTopicDone(ctx, 'java-syntax-types'),
    }),
  },
  {
    id: 'java-oop-architect',
    title: 'OOP Architect',
    rule: 'Design an encapsulated Java class with constructors and accessors.',
    scope: { trackId: JAVA_TECH_ID },
    evaluate: (state) => ({
      earned: isChallengeDone(state, 'java-ch-classes'),
    }),
  },
  {
    id: 'java-recursion-master',
    title: 'JVM Stack Navigator',
    rule: 'Solve recursive mathematical problems with safe base cases in Java.',
    scope: { trackId: JAVA_TECH_ID },
    evaluate: (state) => ({
      earned: isChallengeDone(state, 'java-ch-recursion'),
    }),
  },
  {
    id: 'java-track-complete',
    title: 'Java Pioneer',
    rule: 'Complete all topics in the Java Learning Orbit.',
    scope: { trackId: JAVA_TECH_ID },
    evaluate: (_state, ctx) => {
      const allDone = javaTopics.every((t) => isTopicDone(ctx, t.id))
      return { earned: allDone }
    },
  },
]
