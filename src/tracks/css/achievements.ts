import type { AchievementDef, EngagementContext } from '../../core/gamification/achievements'
import type { CodeOrbitState } from '../../state/types'
import { CSS_TECH_ID } from './curriculum'

const FOUNDATION_TOPICS = ['selectors', 'cascade-specificity', 'pseudo-classes']
const ALL_CSS_TOPICS = [
  'selectors',
  'cascade-specificity',
  'pseudo-classes',
  'box-model',
  'colour-typography',
  'float-and-clear',
  'flexbox',
  'grid',
  'positioning',
  'responsive-design',
  'transitions-animations',
]

const isTopicDone = (ctx: EngagementContext, topicId: string): boolean => {
  const p = ctx.progressOf(topicId)
  return p.status === 'completed' || p.status === 'mastered'
}

const isChallengeDoneForTopic = (ctx: EngagementContext, state: CodeOrbitState, topicId: string): boolean => {
  const cssTrack = ctx.tracks.find((t) => t.id === CSS_TECH_ID)
  const challenge = cssTrack?.challenges.find((c) => c.topicId === topicId)
  if (!challenge) {
    return Boolean(state.challenges[`ch-css-${topicId}`]?.completed)
  }
  return state.challenges[challenge.id]?.completed === true
}

export const cssAchievements: AchievementDef[] = [
  {
    id: 'css-foundations',
    title: 'CSS Foundations',
    rule: 'Complete Selectors, Cascade & Specificity, and Pseudo-classes (lesson, quiz pass and practice).',
    scope: { trackId: CSS_TECH_ID },
    evaluate: (_state, ctx) => {
      const completed = FOUNDATION_TOPICS.filter((id) => isTopicDone(ctx, id)).length
      return {
        earned: completed === FOUNDATION_TOPICS.length,
        progress: { current: completed, total: FOUNDATION_TOPICS.length },
      }
    },
  },
  {
    id: 'flexbox-navigator',
    title: 'Flexbox Navigator',
    rule: 'Pass the Flexbox One-Dimensional Layout practice challenge.',
    scope: { trackId: CSS_TECH_ID },
    evaluate: (state, ctx) => ({
      earned: isChallengeDoneForTopic(ctx, state, 'flexbox'),
    }),
  },
  {
    id: 'grid-architect',
    title: 'Grid Architect',
    rule: 'Pass the CSS Grid Two-Dimensional Layout practice challenge.',
    scope: { trackId: CSS_TECH_ID },
    evaluate: (state, ctx) => ({
      earned: isChallengeDoneForTopic(ctx, state, 'grid'),
    }),
  },
  {
    id: 'responsive-by-design',
    title: 'Responsive by Design',
    rule: 'Pass the Responsive Design & Media Queries practice challenge.',
    scope: { trackId: CSS_TECH_ID },
    evaluate: (state, ctx) => ({
      earned: isChallengeDoneForTopic(ctx, state, 'responsive-design'),
    }),
  },
  {
    id: 'motion-master',
    title: 'Motion & Accessibility Guard',
    rule: 'Pass the Transitions, Keyframes and Motion practice challenge.',
    scope: { trackId: CSS_TECH_ID },
    evaluate: (state, ctx) => ({
      earned: isChallengeDoneForTopic(ctx, state, 'transitions-animations'),
    }),
  },
  {
    id: 'css-master',
    title: 'CSS Master',
    rule: 'Complete all 11 topics in the CSS track.',
    scope: { trackId: CSS_TECH_ID },
    evaluate: (_state, ctx) => {
      const completed = ALL_CSS_TOPICS.filter((id) => isTopicDone(ctx, id)).length
      return {
        earned: completed === ALL_CSS_TOPICS.length,
        progress: { current: completed, total: ALL_CSS_TOPICS.length },
      }
    },
  },
]
