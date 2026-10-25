import { challenges } from '../data/challenges'
import { getTopic } from '../data/curriculum'
import { getQuiz } from '../data/quizzes'
import type { CodeOrbitState, ErrorEntry, ChallengeRecord, NoteRecord, TopicRecord, ActivityEvent, Settings, CheckHistoryEntry } from '../state/types'
import { DEFAULT_SETTINGS, DEFAULT_ATMOSPHERE_SETTINGS, DEFAULT_EDITOR_SETTINGS } from '../state/types'
import { sanitizeSession } from './quiz'
import { migrateV1toV2, migrateV2toV3 } from '../core/storage/migrations'
import { isValidTheme, isValidAccent, isValidContrast, isValidMotion, readEarlyAppearance } from '../core/settings/appearance'

export const STORAGE_KEY = 'codeorbit:state'
export const BACKUP_KEY = 'codeorbit:state:backup'
export const SCHEMA_VERSION = 3
export const MAX_DAYS = 400
export const MAX_ACTIVITY_EVENTS = 5000

export type RecoveryReason = 'none' | 'corrupt' | 'newer-version' | 'unavailable' | 'repaired'

export interface LoadResult {
  state: CodeOrbitState
  recovery: RecoveryReason
}

export const createDefaultState = (): CodeOrbitState => {
  const early = typeof window !== 'undefined' ? readEarlyAppearance() : null
  return {
    schemaVersion: SCHEMA_VERSION,
    topics: {},
    quizSessions: {},
    drafts: {},
    challenges: {},
    notes: {},
    bookmarks: [],
    errorNotebook: [],
    settings: {
      ...DEFAULT_SETTINGS,
      ...(early
        ? {
            theme: early.theme,
            accent: early.accent,
            contrast: early.contrast,
            ...(early.motion ? { motion: early.motion } : {})
          }
        : {})
    },
    activity: [],
    activityDays: [],
    dailyDone: [],
    dailyAssigned: {},
    streakBest: 0
  }
}

type Json = Record<string, unknown>
const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const nonNegInt = (v: unknown): v is number => isNum(v) && Number.isInteger(v) && v >= 0

/**
 * Ordered migrations. migrations[n] upgrades a version-n object to version n+1.
 * Version 0 is the (hypothetical) pre-release shape that used `progress` instead of `topics`.
 * Version 1 is the original schema with topics, challenges, drafts, notes, bookmarks, errorNotebook.
 */
export const migrations: Array<(old: Json) => Json> = [
  (old) => {
    const { progress, ...rest } = old
    return { ...rest, topics: isObj(old.topics) ? old.topics : isObj(progress) ? progress : {}, schemaVersion: 1 }
  },
  migrateV1toV2,
  migrateV2toV3,
]

export function migrate(raw: Json): Json | null {
  let version = nonNegInt(raw.schemaVersion) ? (raw.schemaVersion as number) : 0
  if (version > SCHEMA_VERSION) return null
  let cur = raw
  while (version < SCHEMA_VERSION) {
    cur = migrations[version](cur)
    version++
  }
  return cur
}

/** Field-by-field validation: malformed entries are dropped, valid ones are kept. */
export function sanitizeState(raw: Json): { state: CodeOrbitState; repaired: boolean } {
  const s = createDefaultState()
  let repaired = false
  const drop = () => { repaired = true }

  if (isObj(raw.lastVisited)) {
    const lv = raw.lastVisited
    if (typeof lv.topicId === 'string' && getTopic(lv.topicId) && ['lesson', 'quiz', 'practice'].includes(lv.activity as string) && isNum(lv.at)) {
      s.lastVisited = {
        topicId: lv.topicId, activity: lv.activity as 'lesson' | 'quiz' | 'practice', at: lv.at,
        ...(typeof lv.challengeId === 'string' && challenges.some((c) => c.id === lv.challengeId) ? { challengeId: lv.challengeId } : {}),
      }
    } else drop()
  }
  if (typeof raw.selectedTopicId === 'string') {
    if (getTopic(raw.selectedTopicId)) s.selectedTopicId = raw.selectedTopicId
    else drop()
  }

  if (isObj(raw.topics)) {
    for (const [id, v] of Object.entries(raw.topics)) {
      if (!getTopic(id) || !isObj(v)) { drop(); continue }
      const rec: TopicRecord = { lessonComplete: v.lessonComplete === true, quizAttempts: nonNegInt(v.quizAttempts) ? v.quizAttempts : 0 }
      if (isObj(v.quizBest) && nonNegInt(v.quizBest.correct) && nonNegInt(v.quizBest.total) && v.quizBest.total > 0 && v.quizBest.correct <= v.quizBest.total)
        rec.quizBest = { correct: v.quizBest.correct, total: v.quizBest.total }
      else if (v.quizBest !== undefined) drop()
      s.topics[id] = rec
    }
  } else if (raw.topics !== undefined) drop()

  if (isObj(raw.quizSessions)) {
    for (const [id, v] of Object.entries(raw.quizSessions)) {
      const quiz = getQuiz(id)
      const sess = quiz ? sanitizeSession(v, quiz.questions.length) : null
      if (sess) s.quizSessions[id] = sess
      else drop()
    }
  }

  if (isObj(raw.drafts)) {
    for (const [id, v] of Object.entries(raw.drafts)) {
      if (challenges.some((c) => c.id === id) && typeof v === 'string') s.drafts[id] = v
      else drop()
    }
  }

  if (isObj(raw.challenges)) {
    for (const [id, v] of Object.entries(raw.challenges)) {
      const ch = challenges.find((c) => c.id === id)
      if (!ch || !isObj(v)) { drop(); continue }
      const rec: ChallengeRecord = {
        attempts: nonNegInt(v.attempts) ? v.attempts : 0,
        hintsRevealed: nonNegInt(v.hintsRevealed) ? Math.min(v.hintsRevealed, ch.hints.length) : 0,
        solutionRevealed: v.solutionRevealed === true,
        completed: v.completed === true,
        completedWithoutSolution: v.completed === true && v.completedWithoutSolution === true,
        ...(v.history !== undefined
          ? {
              history: Array.isArray(v.history)
                ? v.history
                    .filter(
                      (h): h is CheckHistoryEntry =>
                        isObj(h) &&
                        nonNegInt(h.passed) &&
                        nonNegInt(h.total) &&
                        isNum(h.at) &&
                        Array.isArray(h.failedIds) &&
                        h.failedIds.every((fid) => typeof fid === 'string')
                    )
                    .slice(-20)
                : [],
            }
          : {}),
      }
      if (isObj(v.lastCheck) && nonNegInt(v.lastCheck.passed) && nonNegInt(v.lastCheck.total) && Array.isArray(v.lastCheck.failedIds) && isNum(v.lastCheck.at))
        rec.lastCheck = { passed: v.lastCheck.passed, total: v.lastCheck.total, at: v.lastCheck.at, failedIds: v.lastCheck.failedIds.filter((x): x is string => typeof x === 'string') }
      if (v.history !== undefined && (!Array.isArray(v.history) || rec.history?.length !== v.history.length)) drop()
      s.challenges[id] = rec
    }
  }

  if (isObj(raw.notes)) {
    for (const [id, v] of Object.entries(raw.notes)) {
      if (getTopic(id) && isObj(v) && typeof v.text === 'string' && isNum(v.updatedAt)) s.notes[id] = { text: v.text, updatedAt: v.updatedAt } as NoteRecord
      else drop()
    }
  }

  if (Array.isArray(raw.bookmarks)) {
    s.bookmarks = Array.from(new Set(raw.bookmarks.filter((b): b is string => typeof b === 'string' && !!getTopic(b))))
    if (s.bookmarks.length !== raw.bookmarks.length) drop()
  }

  if (Array.isArray(raw.errorNotebook)) {
    for (const e of raw.errorNotebook) {
      if (isObj(e) && typeof e.id === 'string' && (e.source === 'challenge' || e.source === 'quiz') && typeof e.topicId === 'string' && getTopic(e.topicId)
        && typeof e.refId === 'string' && typeof e.title === 'string' && typeof e.detail === 'string' && isNum(e.createdAt)) {
        const entry: ErrorEntry = {
          id: e.id, source: e.source, topicId: e.topicId, refId: e.refId, title: e.title, detail: e.detail,
          status: e.status === 'understood' ? 'understood' : 'open', createdAt: e.createdAt,
          ...(typeof e.code === 'string' ? { code: e.code } : {}),
        }
        s.errorNotebook.push(entry)
      } else drop()
    }
  }

  // Sanitize activityDays and dailyDone (with regex, uniqueness, sort and cap)
  const dayList = (v: unknown): string[] | null =>
    Array.isArray(v)
      ? Array.from(
          new Set(
            v.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
          )
        )
          .sort()
          .slice(-MAX_DAYS)
      : null

  const ad = dayList(raw.activityDays)
  if (ad) {
    s.activityDays = ad
    if (ad.length !== (raw.activityDays as unknown[]).length) drop()
  } else if (raw.activityDays !== undefined) drop()

  const dd = dayList(raw.dailyDone)
  if (dd) {
    s.dailyDone = dd
    if (dd.length !== (raw.dailyDone as unknown[]).length) drop()
  } else if (raw.dailyDone !== undefined) drop()

  // Sanitize dailyAssigned
  if (isObj(raw.dailyAssigned)) {
    s.dailyAssigned = {}
    for (const [dateKey, chId] of Object.entries(raw.dailyAssigned)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey) && typeof chId === 'string') {
        s.dailyAssigned[dateKey] = chId
      } else drop()
    }
  }

  // Sanitize streakBest
  if (nonNegInt(raw.streakBest)) {
    s.streakBest = raw.streakBest
  } else if (raw.streakBest !== undefined) drop()

  // Sanitize settings
  if (isObj(raw.settings)) {
    const rawSet = raw.settings
    const set: Settings = { ...DEFAULT_SETTINGS }

    if (typeof rawSet.userName === 'string') {
      set.userName = rawSet.userName.trim().slice(0, 40)
      if (set.userName !== rawSet.userName) drop()
    }
    if (rawSet.pace === 'casual' || rawSet.pace === 'regular' || rawSet.pace === 'intensive') {
      set.pace = rawSet.pace
    } else if (rawSet.pace !== undefined) drop()

    if (isValidTheme(rawSet.theme)) {
      set.theme = rawSet.theme
    } else if (rawSet.theme !== undefined) drop()

    if (isValidAccent(rawSet.accent)) {
      set.accent = rawSet.accent
    } else if (rawSet.accent !== undefined) drop()

    if (isValidContrast(rawSet.contrast)) {
      set.contrast = rawSet.contrast
    } else if (rawSet.contrast !== undefined) drop()

    if (rawSet.motion === 'reduce') {
      set.motion = 'reduced'
    } else if (isValidMotion(rawSet.motion)) {
      set.motion = rawSet.motion
    } else if (rawSet.motion !== undefined) drop()

    if (isObj(rawSet.atmosphere)) {
      set.atmosphere = {
        nebula: typeof rawSet.atmosphere.nebula === 'boolean' ? rawSet.atmosphere.nebula : DEFAULT_ATMOSPHERE_SETTINGS.nebula,
        grid: typeof rawSet.atmosphere.grid === 'boolean' ? rawSet.atmosphere.grid : DEFAULT_ATMOSPHERE_SETTINGS.grid,
        cursorGlow: typeof rawSet.atmosphere.cursorGlow === 'boolean' ? rawSet.atmosphere.cursorGlow : DEFAULT_ATMOSPHERE_SETTINGS.cursorGlow,
        particles: typeof rawSet.atmosphere.particles === 'boolean' ? rawSet.atmosphere.particles : DEFAULT_ATMOSPHERE_SETTINGS.particles,
      }
    } else if (rawSet.atmosphere !== undefined) {
      drop()
      set.atmosphere = { ...DEFAULT_ATMOSPHERE_SETTINGS }
    } else {
      set.atmosphere = { ...DEFAULT_ATMOSPHERE_SETTINGS }
    }

    if (isObj(rawSet.editor)) {
      set.editor = {
        engine: rawSet.editor.engine === 'plain' ? 'plain' : 'codemirror',
        fontSize: typeof rawSet.editor.fontSize === 'number' && rawSet.editor.fontSize >= 10 && rawSet.editor.fontSize <= 24 ? rawSet.editor.fontSize : DEFAULT_EDITOR_SETTINGS.fontSize,
        tabSize: typeof rawSet.editor.tabSize === 'number' && [2, 4, 8].includes(rawSet.editor.tabSize) ? rawSet.editor.tabSize : DEFAULT_EDITOR_SETTINGS.tabSize,
        lineNumbers: typeof rawSet.editor.lineNumbers === 'boolean' ? rawSet.editor.lineNumbers : DEFAULT_EDITOR_SETTINGS.lineNumbers,
        wrap: typeof rawSet.editor.wrap === 'boolean' ? rawSet.editor.wrap : DEFAULT_EDITOR_SETTINGS.wrap,
        tabCapturesFocus: typeof rawSet.editor.tabCapturesFocus === 'boolean' ? rawSet.editor.tabCapturesFocus : DEFAULT_EDITOR_SETTINGS.tabCapturesFocus,
        autoClose: typeof rawSet.editor.autoClose === 'boolean' ? rawSet.editor.autoClose : DEFAULT_EDITOR_SETTINGS.autoClose,
      }
    } else if (rawSet.editor !== undefined) {
      drop()
      set.editor = { ...DEFAULT_EDITOR_SETTINGS }
    } else {
      set.editor = { ...DEFAULT_EDITOR_SETTINGS }
    }

    if (typeof rawSet.soundEnabled === 'boolean') set.soundEnabled = rawSet.soundEnabled
    if (typeof rawSet.streakReminders === 'boolean') set.streakReminders = rawSet.streakReminders
    if (nonNegInt(rawSet.dailyGoal)) set.dailyGoal = rawSet.dailyGoal

    s.settings = set
  } else if (raw.settings !== undefined) drop()

  // Sanitize activity events
  if (Array.isArray(raw.activity)) {
    const validEvents: ActivityEvent[] = []
    for (const item of raw.activity) {
      if (
        isObj(item) &&
        typeof item.id === 'string' &&
        (item.type === 'lesson-complete' || item.type === 'quiz-finish' || item.type === 'challenge-check') &&
        isNum(item.at)
      ) {
        validEvents.push({
          id: item.id,
          type: item.type,
          at: item.at,
          ...(typeof item.trackId === 'string' ? { trackId: item.trackId } : {}),
          ...(typeof item.topicId === 'string' ? { topicId: item.topicId } : {}),
          ...(typeof item.refId === 'string' ? { refId: item.refId } : {}),
          ...(isObj(item.meta) ? { meta: item.meta as Record<string, string | number | boolean> } : {})
        })
      } else drop()
    }
    s.activity = validEvents.slice(-MAX_ACTIVITY_EVENTS)
    if (s.activity.length !== raw.activity.length) drop()
  } else if (raw.activity !== undefined) drop()

  return { state: s, repaired }
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function defaultStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

/** Load persisted state, recovering safely from any failure. Never throws. */
export function loadState(storage: StorageLike | null = defaultStorage()): LoadResult {
  if (!storage) return { state: createDefaultState(), recovery: 'unavailable' }
  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { state: createDefaultState(), recovery: 'unavailable' }
  }
  if (raw === null) return { state: createDefaultState(), recovery: 'none' }

  const backup = () => { try { storage.setItem(BACKUP_KEY, raw as string) } catch { /* best effort */ } }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    backup()
    return { state: createDefaultState(), recovery: 'corrupt' }
  }
  if (!isObj(parsed)) {
    backup()
    return { state: createDefaultState(), recovery: 'corrupt' }
  }
  const migrated = migrate(parsed)
  if (!migrated) {
    backup()
    return { state: createDefaultState(), recovery: 'newer-version' }
  }
  const { state, repaired } = sanitizeState(migrated)
  return { state, recovery: repaired ? 'repaired' : 'none' }
}

export type SaveResult = { ok: true } | { ok: false; reason: 'unavailable' | 'failed' }

/** Persist state. Returns the outcome so the UI only reports "saved" after success. */
export function saveState(state: CodeOrbitState, storage: StorageLike | null = defaultStorage()): SaveResult {
  if (!storage) return { ok: false, reason: 'unavailable' }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return { ok: true }
  } catch {
    return { ok: false, reason: 'failed' }
  }
}

export function clearState(storage: StorageLike | null = defaultStorage()): SaveResult {
  if (!storage) return { ok: false, reason: 'unavailable' }
  try {
    storage.removeItem(STORAGE_KEY)
    storage.removeItem(BACKUP_KEY)
    return { ok: true }
  } catch {
    return { ok: false, reason: 'failed' }
  }
}
