import { challenges } from '../data/challenges'
import { getTopic } from '../data/curriculum'
import { getQuiz } from '../data/quizzes'
import type { CodeOrbitState, ErrorEntry, ChallengeRecord, NoteRecord, TopicRecord } from '../state/types'
import { sanitizeSession } from './quiz'

export const STORAGE_KEY = 'codeorbit:state'
export const BACKUP_KEY = 'codeorbit:state:backup'
export const SCHEMA_VERSION = 1

export type RecoveryReason = 'none' | 'corrupt' | 'newer-version' | 'unavailable' | 'repaired'

export interface LoadResult {
  state: CodeOrbitState
  recovery: RecoveryReason
}

export const createDefaultState = (): CodeOrbitState => ({
  schemaVersion: SCHEMA_VERSION,
  topics: {},
  quizSessions: {},
  drafts: {},
  challenges: {},
  notes: {},
  bookmarks: [],
  errorNotebook: [],
})

type Json = Record<string, unknown>
const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const nonNegInt = (v: unknown): v is number => isNum(v) && Number.isInteger(v) && v >= 0

/**
 * Ordered migrations. migrations[n] upgrades a version-n object to version n+1.
 * Version 0 is the (hypothetical) pre-release shape that used `progress` instead of `topics`.
 */
export const migrations: Array<(old: Json) => Json> = [
  (old) => {
    const { progress, ...rest } = old
    return { ...rest, topics: isObj(old.topics) ? old.topics : isObj(progress) ? progress : {}, schemaVersion: 1 }
  },
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
      }
      if (isObj(v.lastCheck) && nonNegInt(v.lastCheck.passed) && nonNegInt(v.lastCheck.total) && Array.isArray(v.lastCheck.failedIds) && isNum(v.lastCheck.at))
        rec.lastCheck = { passed: v.lastCheck.passed, total: v.lastCheck.total, at: v.lastCheck.at, failedIds: v.lastCheck.failedIds.filter((x): x is string => typeof x === 'string') }
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
