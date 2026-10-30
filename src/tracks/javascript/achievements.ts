import type { AchievementDef, EngagementContext } from '../../core/gamification/achievements'
import type { CodeOrbitState } from '../../state/types'
import { JS_TECH_ID } from './curriculum'

const FOUNDATION_TOPICS = ['variables-types', 'control-flow', 'functions']
const ALL_JS_TOPICS = [
  'variables-types',
  'control-flow',
  'functions',
  'arrays-objects',
  'events',
  'dom',
  'validation',
  'gallery',
  'web-storage',
  'testing-basics',
  'data-structures-basics',
  'algorithms-basics',
]

const isTopicDone = (ctx: EngagementContext, topicId: string): boolean => {
  const p = ctx.progressOf(topicId)
  return p.status === 'completed' || p.status === 'mastered'
}

const isChallengeDoneForTopic = (ctx: EngagementContext, state: CodeOrbitState, topicId: string): boolean => {
  const jsTrack = ctx.tracks.find((t) => t.id === JS_TECH_ID)
  const challenge = jsTrack?.challenges.find((c) => c.topicId === topicId)
  if (!challenge) {
    return Boolean(state.challenges[`ch-js-${topicId}`]?.completed)
  }
  return state.challenges[challenge.id]?.completed === true
}

export const jsAchievements: AchievementDef[] = [
  {
    id: 'js-foundations',
    title: 'JavaScript Foundations',
    rule: 'Complete Variables & Types, Control Flow, and Functions topics.',
    scope: { trackId: JS_TECH_ID },
    evaluate: (_state, ctx) => {
      const completed = FOUNDATION_TOPICS.filter((id) => isTopicDone(ctx, id)).length
      return {
        earned: completed === FOUNDATION_TOPICS.length,
        progress: { current: completed, total: FOUNDATION_TOPICS.length },
      }
    },
  },
  {
    id: 'dom-navigator',
    title: 'DOM Navigator',
    rule: 'Pass the Dynamic Task List Item Renderer practice challenge.',
    scope: { trackId: JS_TECH_ID },
    evaluate: (state, ctx) => ({
      earned: isChallengeDoneForTopic(ctx, state, 'dom'),
    }),
  },
  {
    id: 'form-guardian',
    title: 'Form Guardian',
    rule: 'Pass the Registration Form Validator practice challenge.',
    scope: { trackId: JS_TECH_ID },
    evaluate: (state, ctx) => ({
      earned: isChallengeDoneForTopic(ctx, state, 'validation'),
    }),
  },
  {
    id: 'gallery-craftsman',
    title: 'Gallery Craftsman',
    rule: 'Pass the Image Carousel Navigation Controller practice challenge.',
    scope: { trackId: JS_TECH_ID },
    evaluate: (state, ctx) => ({
      earned: isChallengeDoneForTopic(ctx, state, 'gallery'),
    }),
  },
  {
    id: 'algorithm-ace',
    title: 'Logarithmic Ace',
    rule: 'Pass the Logarithmic Binary Search practice challenge.',
    scope: { trackId: JS_TECH_ID },
    evaluate: (state, ctx) => ({
      earned: isChallengeDoneForTopic(ctx, state, 'algorithms-basics'),
    }),
  },
  {
    id: 'js-master',
    title: 'JavaScript Master',
    rule: 'Complete all 12 topics in the JavaScript track.',
    scope: { trackId: JS_TECH_ID },
    evaluate: (_state, ctx) => {
      const completed = ALL_JS_TOPICS.filter((id) => isTopicDone(ctx, id)).length
      return {
        earned: completed === ALL_JS_TOPICS.length,
        progress: { current: completed, total: ALL_JS_TOPICS.length },
      }
    },
  },
]
