import type { CodeOrbitState } from '../../state/types'
import { isPass, isPerfect } from '../../lib/quiz'
import { topicProgress } from '../../lib/progress'
import { getAvailableTracks } from '../content/registry'
import type { TrackModule } from '../content/types'

export const XP_TABLE = {
  lessonComplete: 10,
  quizPass: 15,
  quizPerfect: 10, /* bonus */
  challengePass: 25,
  independentSolve: 15, /* bonus: no hints, no solution */
  topicMastered: 50,
  errorUnderstood: 5,
  dailyChallenge: 20,
} as const

export interface XpBreakdown {
  total: number
  level: number
  currentLevelXp: number
  nextLevelXp: number
  progressXp: number
  neededXp: number
  byCategory: {
    lessons: number
    quizzes: number
    challenges: number
    mastery: number
    errors: number
    daily: number
  }
}

/**
 * Cumulative XP required to reach level n.
 * Level curve: xpForLevel(n) = 100 * n * (n + 1) / 2
 * Monotonic and strictly increasing for n >= 0.
 */
export function xpForLevel(n: number): number {
  if (n <= 0) return 0
  return Math.floor((100 * n * (n + 1)) / 2)
}

/**
 * Determines current level from cumulative XP.
 * level = max n with cumulative XP >= xpForLevel(n).
 */
export function levelFor(xp: number): number {
  if (xp <= 0) return 0
  const n = Math.floor((-1 + Math.sqrt(1 + (8 * xp) / 100)) / 2)
  return Math.max(0, n)
}

export interface XpContext {
  tracks?: readonly TrackModule[]
}

/**
 * Pure, deterministic computation of XP and level derived strictly from saved state (L-20).
 * Never reads or writes stored counters; replay/hints/revisits add zero XP (anti-farming).
 * Un-completing an activity consistently decreases XP.
 */
export function computeXp(state: CodeOrbitState, ctx?: XpContext): XpBreakdown {
  // 1. Lessons
  let lessonsXp = 0
  for (const topicRec of Object.values(state.topics)) {
    if (topicRec?.lessonComplete === true) {
      lessonsXp += XP_TABLE.lessonComplete
    }
  }

  // 2. Quizzes
  let quizzesXp = 0
  for (const topicRec of Object.values(state.topics)) {
    if (topicRec?.quizBest) {
      if (isPass(topicRec.quizBest)) {
        quizzesXp += XP_TABLE.quizPass
      }
      if (isPerfect(topicRec.quizBest)) {
        quizzesXp += XP_TABLE.quizPerfect
      }
    }
  }

  // 3. Practice Challenges
  let challengesXp = 0
  for (const challengeRec of Object.values(state.challenges)) {
    if (challengeRec?.completed === true) {
      challengesXp += XP_TABLE.challengePass
      if (challengeRec.completedWithoutSolution && challengeRec.hintsRevealed === 0) {
        challengesXp += XP_TABLE.independentSolve
      }
    }
  }

  // 4. Topic Mastery
  let masteryXp = 0
  const tracks = ctx?.tracks ?? getAvailableTracks()
  for (const track of tracks) {
    for (const topic of track.topics) {
      const prog = topicProgress(state, topic)
      if (prog.status === 'mastered') {
        masteryXp += XP_TABLE.topicMastered
      }
    }
  }

  // 5. Error Notebook Understood
  let errorsXp = 0
  for (const entry of state.errorNotebook) {
    if (entry.status === 'understood') {
      errorsXp += XP_TABLE.errorUnderstood
    }
  }

  // 6. Daily Challenges Done
  const dailyCount = Array.isArray(state.dailyDone) ? new Set(state.dailyDone).size : 0
  const dailyXp = dailyCount * XP_TABLE.dailyChallenge

  const total = lessonsXp + quizzesXp + challengesXp + masteryXp + errorsXp + dailyXp
  const level = levelFor(total)
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const progressXp = total - currentLevelXp
  const neededXp = Math.max(0, nextLevelXp - total)

  return {
    total,
    level,
    currentLevelXp,
    nextLevelXp,
    progressXp,
    neededXp,
    byCategory: {
      lessons: lessonsXp,
      quizzes: quizzesXp,
      challenges: challengesXp,
      mastery: masteryXp,
      errors: errorsXp,
      daily: dailyXp,
    },
  }
}
