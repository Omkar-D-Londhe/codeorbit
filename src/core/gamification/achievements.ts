import type { CodeOrbitState, BadgeRecord } from '../../state/types'
import { isPerfect } from '../../lib/quiz'
import { topicProgress, type TopicProgress } from '../../lib/progress'
import { getTopic } from '../../data/curriculum'
import { streakInfo, dayKey } from './streak'
import { getAvailableTracks } from '../content/registry'
import type { TrackModule } from '../content/types'

export interface AchievementProgress {
  current: number
  total: number
}

export interface AchievementEvaluation {
  earned: boolean
  progress?: AchievementProgress
}

export interface AchievementDef {
  id: string
  title: string
  rule: string
  scope: 'platform' | { trackId: string }
  evaluate: (state: CodeOrbitState, ctx: EngagementContext) => AchievementEvaluation
}

export interface EngagementContext {
  todayKey: string
  tracks: readonly TrackModule[]
  progressOf: (topicId: string) => TopicProgress
}

export interface EvaluatedAchievement {
  id: string
  title: string
  rule: string
  scope: 'platform' | { trackId: string }
  earned: boolean
  progress?: AchievementProgress
  firstSeenAt: number | null
  backfilled: boolean
}

export const platformAchievements: AchievementDef[] = [
  {
    id: 'first-challenge',
    title: 'First Challenge Completed',
    rule: 'Pass every requirement of any practice challenge.',
    scope: 'platform',
    evaluate: (state) => ({
      earned: Object.values(state.challenges).some((c) => c?.completed === true),
    }),
  },
  {
    id: 'independent-solver',
    title: 'Independent Solver',
    rule: 'Pass a challenge without using any hint and without revealing the reference solution.',
    scope: 'platform',
    evaluate: (state) => ({
      earned: Object.values(state.challenges).some(
        (c) => c?.completed === true && c.completedWithoutSolution === true && c.hintsRevealed === 0
      ),
    }),
  },
  {
    id: 'revision-completed',
    title: 'Revision Completed',
    rule: 'Mark at least one Error Notebook entry as understood.',
    scope: 'platform',
    evaluate: (state) => ({
      earned: state.errorNotebook.some((e) => e.status === 'understood'),
    }),
  },
  {
    id: 'first-mastery',
    title: 'First Mastery',
    rule: 'Master any topic: lesson done, perfect quiz score, and practice passed before revealing the solution.',
    scope: 'platform',
    evaluate: (_state, ctx) => {
      for (const track of ctx.tracks) {
        for (const topic of track.topics) {
          if (ctx.progressOf(topic.id).status === 'mastered') {
            return { earned: true }
          }
        }
      }
      return { earned: false }
    },
  },
  {
    id: 'three-day-streak',
    title: 'Three-Day Streak',
    rule: 'Do something meaningful (complete a lesson, finish a quiz or run a check) on 3 consecutive calendar days.',
    scope: 'platform',
    evaluate: (state, ctx) => {
      const streak = streakInfo(state.activityDays, ctx.todayKey)
      const best = Math.max(streak.longest, state.streakBest || 0)
      return {
        earned: best >= 3,
        progress: { current: Math.min(best, 3), total: 3 },
      }
    },
  },
  {
    id: 'seven-day-streak',
    title: 'Seven-Day Streak',
    rule: 'Do something meaningful on 7 consecutive calendar days.',
    scope: 'platform',
    evaluate: (state, ctx) => {
      const streak = streakInfo(state.activityDays, ctx.todayKey)
      const best = Math.max(streak.longest, state.streakBest || 0)
      return {
        earned: best >= 7,
        progress: { current: Math.min(best, 7), total: 7 },
      }
    },
  },
  {
    id: 'quiz-ace',
    title: 'Quiz Ace',
    rule: 'Achieve a perfect score on any quiz.',
    scope: 'platform',
    evaluate: (state) => ({
      earned: Object.values(state.topics).some((t) => Boolean(t?.quizBest && isPerfect(t.quizBest))),
    }),
  },
]

export function buildEngagementContext(
  state: CodeOrbitState,
  overrides?: Partial<EngagementContext>
): EngagementContext {
  const tracks = overrides?.tracks ?? getAvailableTracks()
  const todayKey = overrides?.todayKey ?? dayKey(Date.now())

  const topicCache = new Map<string, TopicProgress>()

  const progressOf =
    overrides?.progressOf ??
    ((topicId: string): TopicProgress => {
      const cached = topicCache.get(topicId)
      if (cached) return cached

      // Find topic in tracks
      let topicObj = getTopic(topicId)
      if (!topicObj) {
        for (const t of tracks) {
          const found = t.topics.find((x) => x.id === topicId)
          if (found) {
            topicObj = found
            break
          }
        }
      }

      if (!topicObj) {
        return {
          lessonDone: false,
          quizPassed: false,
          quizPerfect: false,
          practiceDone: false,
          usedSolution: false,
          touched: false,
          parts: 0,
          partsTotal: 3,
          status: 'not-started',
        }
      }

      const p = topicProgress(state, topicObj)
      topicCache.set(topicId, p)
      return p
    })

  return {
    todayKey,
    tracks,
    progressOf,
  }
}

/**
 * Returns all registered achievement definitions (platform + all available track achievements).
 */
export function getAllAchievementDefs(tracks: readonly TrackModule[] = getAvailableTracks()): AchievementDef[] {
  const defs: AchievementDef[] = [...platformAchievements]
  for (const track of tracks) {
    if (Array.isArray(track.achievements)) {
      defs.push(...(track.achievements as AchievementDef[]))
    }
  }
  return defs
}

/**
 * Evaluates all achievements purely from state.
 * Never invents dates; uses state.badges records where present.
 */
export function evaluateAchievements(
  state: CodeOrbitState,
  ctxOverrides?: Partial<EngagementContext>
): EvaluatedAchievement[] {
  const ctx = buildEngagementContext(state, ctxOverrides)
  const defs = getAllAchievementDefs(ctx.tracks)

  return defs.map((def) => {
    const res = def.evaluate(state, ctx)
    const stored = state.badges?.[def.id]

    let firstSeenAt: number | null = null
    let backfilled = false

    if (stored) {
      firstSeenAt = stored.firstSeenAt
      backfilled = stored.backfilled
    } else if (res.earned) {
      // Not yet persisted in state.badges: marked backfilled until explicit live sync
      firstSeenAt = null
      backfilled = true
    }

    return {
      id: def.id,
      title: def.title,
      rule: def.rule,
      scope: def.scope,
      earned: res.earned,
      ...(res.progress ? { progress: res.progress } : {}),
      firstSeenAt,
      backfilled,
    }
  })
}

/**
 * Synchronizes newly earned badges into a BadgesState object.
 * If `now` is provided, newly discovered badges are marked with `firstSeenAt: now, backfilled: false`.
 * If `now` is omitted, newly discovered badges are marked with `firstSeenAt: null, backfilled: true` (silent backfill).
 */
export function syncBadges(
  state: CodeOrbitState,
  now?: number,
  ctxOverrides?: Partial<EngagementContext>
): { badges: Record<string, BadgeRecord>; newlyEarnedIds: string[] } {
  const evaluated = evaluateAchievements(state, ctxOverrides)
  const badges: Record<string, BadgeRecord> = { ...(state.badges ?? {}) }
  const newlyEarnedIds: string[] = []

  for (const a of evaluated) {
    if (a.earned && !badges[a.id]) {
      newlyEarnedIds.push(a.id)
      badges[a.id] = {
        firstSeenAt: now !== undefined ? now : null,
        backfilled: now === undefined,
      }
    }
  }

  return { badges, newlyEarnedIds }
}
