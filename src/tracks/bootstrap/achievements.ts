import type { AchievementDef, EngagementContext } from '../../core/gamification/achievements'
import type { CodeOrbitState } from '../../state/types'
import { BOOTSTRAP_TECH_ID } from './curriculum'

const isChallengeDone = (state: CodeOrbitState, challengeId: string): boolean => {
  return state.challenges?.[challengeId]?.completed === true
}

const isTopicDone = (ctx: EngagementContext, topicId: string): boolean => {
  const p = ctx.progressOf(topicId)
  return p.status === 'completed' || p.status === 'mastered'
}

export const bootstrapAchievements: AchievementDef[] = [
  {
    id: 'bs-grid-architect',
    title: 'Grid Architect',
    rule: 'Construct a responsive 12-column grid using Bootstrap container, row, and column breakpoints.',
    scope: { trackId: BOOTSTRAP_TECH_ID },
    evaluate: (state) => ({
      earned: isChallengeDone(state, 'bs-ch-grid-system'),
    }),
  },
  {
    id: 'bs-component-master',
    title: 'Component Craftsman',
    rule: 'Compose Bootstrap core components including cards, buttons, and accessible alerts.',
    scope: { trackId: BOOTSTRAP_TECH_ID },
    evaluate: (state) => ({
      earned: isChallengeDone(state, 'bs-ch-components'),
    }),
  },
  {
    id: 'bs-navbar-navigator',
    title: 'Navbar Navigator',
    rule: 'Implement an accessible responsive navbar meeting the Bootstrap toggler contract (FC-26).',
    scope: { trackId: BOOTSTRAP_TECH_ID },
    evaluate: (state) => ({
      earned: isChallengeDone(state, 'bs-ch-navbar'),
    }),
  },
  {
    id: 'bs-auth-craftsman',
    title: 'Auth Form Artisan',
    rule: 'Build a styled authentication layout with validation states and feedback (FC-27).',
    scope: { trackId: BOOTSTRAP_TECH_ID },
    evaluate: (state) => ({
      earned: isChallengeDone(state, 'bs-ch-auth-forms'),
    }),
  },
  {
    id: 'bs-track-complete',
    title: 'Bootstrap Vanguard',
    rule: 'Complete all topics in the Bootstrap Track (lesson, quiz pass and practice).',
    scope: { trackId: BOOTSTRAP_TECH_ID },
    evaluate: (_state, ctx) => {
      const bsTrack = ctx.tracks.find((t) => t.id === BOOTSTRAP_TECH_ID)
      const topics = bsTrack?.topics ?? []
      const completedCount = topics.filter((t) => isTopicDone(ctx, t.id)).length
      return {
        earned: topics.length > 0 && completedCount === topics.length,
        progress: { current: completedCount, total: topics.length },
      }
    },
  },
]
