import { DEFAULT_SETTINGS } from '../../state/types'
import { streakInfo } from '../gamification/streak'

type Json = Record<string, unknown>

const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)
const nonNegInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0

/**
 * Migrates a version-1 state object to version-2 (D3, PLT-14).
 * Preserves activityDays and dailyDone if present (reference-era v1).
 * Initializes settings, activity events array, dailyAssigned map, and streakBest.
 */
export function migrateV1toV2(old: Json): Json {
  const activityDays = Array.isArray(old.activityDays)
    ? old.activityDays.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
    : []

  const dailyDone = Array.isArray(old.dailyDone)
    ? old.dailyDone.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
    : []

  const streak = activityDays.length > 0 ? streakInfo(activityDays, activityDays[activityDays.length - 1]) : null
  const computedStreakBest = streak ? streak.longest : 0
  const streakBest = nonNegInt(old.streakBest) ? old.streakBest : computedStreakBest

  const rawSettings = isObj(old.settings) ? old.settings : {}
  const settings = {
    ...DEFAULT_SETTINGS,
    ...rawSettings
  }

  const activity = Array.isArray(old.activity) ? old.activity : []
  const dailyAssigned = isObj(old.dailyAssigned) ? old.dailyAssigned : {}

  return {
    ...old,
    schemaVersion: 2,
    settings,
    activity,
    activityDays,
    dailyDone,
    dailyAssigned,
    streakBest
  }
}

/**
 * Migrates a version-2 state object to version-3 (Stage 07).
 * Ensures ChallengeRecord.history is initialized as an array for each challenge.
 */
export function migrateV2toV3(old: Json): Json {
  const challenges: Record<string, unknown> = {}

  if (isObj(old.challenges)) {
    for (const [id, ch] of Object.entries(old.challenges)) {
      if (isObj(ch)) {
        challenges[id] = {
          ...ch,
          history: Array.isArray(ch.history) ? ch.history.slice(-20) : [],
        }
      } else {
        challenges[id] = ch
      }
    }
  }

  return {
    ...old,
    schemaVersion: 3,
    challenges,
  }
}

/**
 * Migrates a version-3 state object to version-4 (Stage 08).
 * Ensures sectionBookmarks array is initialized.
 */
export function migrateV3toV4(old: Json): Json {
  return {
    ...old,
    schemaVersion: 4,
    sectionBookmarks: Array.isArray(old.sectionBookmarks) ? old.sectionBookmarks : [],
  }
}

/**
 * Migrates a version-4 state object to version-5 (Stage 11).
 * Initializes badges and personalBests records.
 */
export function migrateV4toV5(old: Json): Json {
  const rawBadges = isObj(old.badges) ? old.badges : {}
  const badges: Record<string, { firstSeenAt: number | null; backfilled: boolean }> = {}

  for (const [id, b] of Object.entries(rawBadges)) {
    if (isObj(b)) {
      badges[id] = {
        firstSeenAt: typeof b.firstSeenAt === 'number' ? b.firstSeenAt : null,
        backfilled: typeof b.backfilled === 'boolean' ? b.backfilled : true,
      }
    }
  }

  const rawBests = isObj(old.personalBests) ? old.personalBests : {}
  const personalBests: Record<string, number> = {}

  for (const [key, val] of Object.entries(rawBests)) {
    if (typeof val === 'number' && Number.isFinite(val)) {
      personalBests[key] = val
    }
  }

  return {
    ...old,
    schemaVersion: 5,
    badges,
    personalBests,
  }
}
