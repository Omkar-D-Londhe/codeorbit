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

/**
 * Migrates a version-5 state object to version-6 (Stage 14: Notes, bookmarks, review).
 * - Converts each NoteRecord to { text, format: 'markdown', tags: string[], updatedAt }
 * - Initializes/sanitizes bookmarkFolders with a default 'Unsorted' folder holding existing bookmarks
 */
export function migrateV5toV6(old: Json): Json {
  const rawNotes = isObj(old.notes) ? old.notes : {}
  const notes: Record<string, { text: string; format: 'markdown'; tags: string[]; updatedAt: number }> = {}

  for (const [id, note] of Object.entries(rawNotes)) {
    if (isObj(note)) {
      if (typeof note.text !== 'string') {
        notes[id] = note as unknown as { text: string; format: 'markdown'; tags: string[]; updatedAt: number }
        continue
      }
      const text = note.text.slice(0, 20000)
      const format = 'markdown'
      const rawTags = Array.isArray(note.tags) ? note.tags : []
      const tags = rawTags
        .filter((t): t is string => typeof t === 'string')
        .map((t) => t.toLowerCase().trim())
        .filter((t) => /^[a-z0-9-]{1,24}$/.test(t))
        .slice(0, 8)
      const updatedAt = typeof note.updatedAt === 'number' && Number.isFinite(note.updatedAt) ? note.updatedAt : Date.now()

      notes[id] = { text, format, tags, updatedAt }
    }
  }

  const existingBookmarks = Array.isArray(old.bookmarks)
    ? old.bookmarks.filter((b): b is string => typeof b === 'string')
    : []
  const existingSectionBookmarks = Array.isArray(old.sectionBookmarks)
    ? old.sectionBookmarks.filter((b): b is string => typeof b === 'string')
    : []

  const bookmarkFolders: Array<{ id: string; name: string; itemIds: string[] }> = []

  if (Array.isArray(old.bookmarkFolders)) {
    for (const f of old.bookmarkFolders) {
      if (isObj(f) && typeof f.id === 'string' && typeof f.name === 'string') {
        const itemIds = Array.isArray(f.itemIds)
          ? f.itemIds.filter((it): it is string => typeof it === 'string')
          : []
        bookmarkFolders.push({
          id: f.id,
          name: f.name.slice(0, 50),
          itemIds,
        })
      }
    }
  }

  const allInitialItems = Array.from(new Set([...existingBookmarks, ...existingSectionBookmarks]))
  const unsortedIdx = bookmarkFolders.findIndex((f) => f.id === 'unsorted')

  if (unsortedIdx === -1) {
    bookmarkFolders.unshift({
      id: 'unsorted',
      name: 'Unsorted',
      itemIds: allInitialItems,
    })
  } else if (bookmarkFolders[unsortedIdx].itemIds.length === 0 && allInitialItems.length > 0) {
    const assignedElsewhere = new Set(
      bookmarkFolders.filter((f) => f.id !== 'unsorted').flatMap((f) => f.itemIds)
    )
    bookmarkFolders[unsortedIdx].itemIds = allInitialItems.filter((it) => !assignedElsewhere.has(it))
  }

  return {
    ...old,
    schemaVersion: 6,
    notes,
    bookmarkFolders,
  }
}

/**
 * Migrates a version-6 state object to version-7 (Stage 15c: Analytics and active-time tracking).
 * Initializes timeSpent: Record<string, number> (foreground-visible seconds per topic).
 */
export function migrateV6toV7(old: Json): Json {
  const rawTimeSpent = isObj(old.timeSpent) ? old.timeSpent : {}
  const timeSpent: Record<string, number> = {}

  for (const [id, val] of Object.entries(rawTimeSpent)) {
    if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
      timeSpent[id] = Math.round(val)
    }
  }

  const rawSessions = isObj(old.timeSpentSessions) ? old.timeSpentSessions : {}
  const timeSpentSessions: Record<string, number> = {}

  for (const [id, val] of Object.entries(rawSessions)) {
    if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
      timeSpentSessions[id] = Math.round(val)
    }
  }

  return {
    ...old,
    schemaVersion: 7,
    timeSpent,
    timeSpentSessions,
  }
}
