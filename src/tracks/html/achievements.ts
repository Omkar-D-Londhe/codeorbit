import type { AchievementDef, EngagementContext } from '../../core/gamification/achievements'
import type { CodeOrbitState } from '../../state/types'
import { HTML_TECH_ID } from '../../data/curriculum'

const FOUNDATION_TOPICS = ['html-structure', 'elements-attributes', 'headings-paragraphs']

const isTopicDone = (ctx: EngagementContext, topicId: string): boolean => {
  const p = ctx.progressOf(topicId)
  return p.status === 'completed' || p.status === 'mastered'
}

const isChallengeDoneForTopic = (ctx: EngagementContext, state: CodeOrbitState, topicId: string): boolean => {
  const htmlTrack = ctx.tracks.find((t) => t.id === HTML_TECH_ID)
  const challenge = htmlTrack?.challenges.find((c) => c.topicId === topicId)
  if (!challenge) {
    // Defensive check if track metadata isn't populated: check direct ID convention
    return Boolean(state.challenges[`ch-${topicId}`]?.completed)
  }
  return state.challenges[challenge.id]?.completed === true
}

export const htmlAchievements: AchievementDef[] = [
  {
    id: 'html-foundations',
    title: 'HTML Foundations',
    rule: 'Complete Document structure, Elements and attributes, and Headings and paragraphs (lesson, quiz pass and practice).',
    scope: { trackId: HTML_TECH_ID },
    evaluate: (_state, ctx) => {
      const completed = FOUNDATION_TOPICS.filter((id) => isTopicDone(ctx, id)).length
      return {
        earned: completed === FOUNDATION_TOPICS.length,
        progress: { current: completed, total: FOUNDATION_TOPICS.length },
      }
    },
  },
  {
    id: 'semantic-structure',
    title: 'Semantic Structure',
    rule: 'Pass the Semantic page layout challenge.',
    scope: { trackId: HTML_TECH_ID },
    evaluate: (state, ctx) => ({
      earned: isChallengeDoneForTopic(ctx, state, 'semantic-layout'),
    }),
  },
  {
    id: 'accessible-images',
    title: 'Accessible Images',
    rule: 'Pass the Images and alt text challenge.',
    scope: { trackId: HTML_TECH_ID },
    evaluate: (state, ctx) => ({
      earned: isChallengeDoneForTopic(ctx, state, 'images'),
    }),
  },
  {
    id: 'form-builder',
    title: 'Form Builder',
    rule: 'Pass the Forms and inputs challenge.',
    scope: { trackId: HTML_TECH_ID },
    evaluate: (state, ctx) => ({
      earned: isChallengeDoneForTopic(ctx, state, 'forms'),
    }),
  },
  {
    id: 'html-complete',
    title: 'HTML Track Complete',
    rule: 'Complete all 12 HTML topics.',
    scope: { trackId: HTML_TECH_ID },
    evaluate: (_state, ctx) => {
      const htmlTrack = ctx.tracks.find((t) => t.id === HTML_TECH_ID)
      const trackTopics = htmlTrack?.topics ?? []
      const total = trackTopics.length || 12
      const completed = trackTopics.filter((t) => isTopicDone(ctx, t.id)).length
      return {
        earned: total > 0 && completed === total,
        progress: { current: completed, total },
      }
    },
  },
]
