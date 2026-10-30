import type { AchievementDef, EngagementContext } from '../../core/gamification/achievements'
import { ANGULAR_TECH_ID, angularTopics } from './curriculum'

const isTopicDone = (ctx: EngagementContext, topicId: string): boolean => {
  const p = ctx.progressOf(topicId)
  return p.status === 'completed' || p.status === 'mastered'
}

export const angularAchievements: AchievementDef[] = [
  {
    id: 'ng-first-component',
    title: 'Angular Initiate',
    rule: 'Complete your first Angular component architecture topic.',
    scope: { trackId: ANGULAR_TECH_ID },
    evaluate: (_state, ctx) => ({
      earned: isTopicDone(ctx, 'ng-components'),
    }),
  },
  {
    id: 'ng-binding-master',
    title: 'Template Architect',
    rule: 'Complete property, event, and two-way data binding in Angular.',
    scope: { trackId: ANGULAR_TECH_ID },
    evaluate: (_state, ctx) => ({
      earned: isTopicDone(ctx, 'ng-data-binding'),
    }),
  },
  {
    id: 'ng-di-architect',
    title: 'DI Specialist',
    rule: 'Master Angular services and hierarchical dependency injection.',
    scope: { trackId: ANGULAR_TECH_ID },
    evaluate: (_state, ctx) => ({
      earned: isTopicDone(ctx, 'ng-services'),
    }),
  },
  {
    id: 'ng-track-complete',
    title: 'Angular Pioneer',
    rule: 'Complete all topics in the Angular Learning Orbit.',
    scope: { trackId: ANGULAR_TECH_ID },
    evaluate: (_state, ctx) => {
      const allDone = angularTopics.every((t) => isTopicDone(ctx, t.id))
      return { earned: allDone }
    },
  },
]
