import { createDefaultState, MAX_DAYS, MAX_ACTIVITY_EVENTS } from '../lib/storage'
import type { QuizSession } from '../lib/quiz'
import type { Activity, CodeOrbitState, ErrorEntry, ErrorStatus, QuizBest, Settings, ActivityEvent } from './types'
import { addDay, dayKey, streakInfo, nextStreakBest } from '../core/gamification/streak'

export type Action =
  | { type: 'RESET_ALL' }
  | { type: 'SELECT_TOPIC'; topicId: string }
  | { type: 'VISIT'; topicId: string; activity: Activity; challengeId?: string; now?: number }
  | { type: 'SET_LESSON_COMPLETE'; topicId: string; value: boolean; now?: number }
  | { type: 'QUIZ_UPDATE'; topicId: string; session: QuizSession }
  | { type: 'QUIZ_RESET'; topicId: string }
  | { type: 'QUIZ_FINISH'; topicId: string; session: QuizSession; correct: number; total: number; now?: number }
  | { type: 'SET_DRAFT'; challengeId: string; code: string; fileName?: string }
  | { type: 'CLEAR_DRAFT'; challengeId: string }
  | { type: 'RECORD_CHECK'; challengeId: string; passed: number; total: number; failedIds: string[]; now?: number }
  | { type: 'REVEAL_HINT'; challengeId: string; max: number }
  | { type: 'REVEAL_SOLUTION'; challengeId: string }
  | { type: 'SET_NOTE'; topicId: string; text: string; now: number }
  | { type: 'TOGGLE_BOOKMARK'; topicId: string }
  | { type: 'ADD_ERROR'; entry: ErrorEntry }
  | { type: 'SET_ERROR_STATUS'; id: string; status: ErrorStatus }
  | { type: 'DELETE_ERROR'; id: string }
  | { type: 'SET_SETTINGS'; patch: Partial<Settings> }
  | { type: 'IMPORT_STATE'; state: CodeOrbitState }

const emptyChallenge = () => ({ attempts: 0, hintsRevealed: 0, solutionRevealed: false, completed: false, completedWithoutSolution: false })

const better = (a: QuizBest | undefined, b: QuizBest): QuizBest => (!a || b.correct / b.total > a.correct / a.total ? b : a)

function withActivity(
  state: CodeOrbitState,
  now: number | undefined,
  event: Omit<ActivityEvent, 'id' | 'at'> & { id?: string; at?: number }
): CodeOrbitState {
  if (now === undefined) return state

  const key = dayKey(now)
  const newDays = addDay(state.activityDays, key, MAX_DAYS)
  const streak = streakInfo(newDays, key)
  const newStreakBest = nextStreakBest(state.streakBest, streak)

  const fullEvent: ActivityEvent = {
    id: event.id || `act-${now}-${Math.random().toString(36).slice(2, 7)}`,
    type: event.type,
    at: event.at || now,
    ...(event.trackId ? { trackId: event.trackId } : {}),
    ...(event.topicId ? { topicId: event.topicId } : {}),
    ...(event.refId ? { refId: event.refId } : {}),
    ...(event.meta ? { meta: event.meta } : {})
  }

  const newActivity = [...state.activity, fullEvent].slice(-MAX_ACTIVITY_EVENTS)

  return {
    ...state,
    activityDays: newDays,
    activity: newActivity,
    streakBest: newStreakBest
  }
}

export function draftKey(challengeId: string, fileName?: string, fileCount = 1): string {
  return fileCount <= 1 || !fileName ? challengeId : `${challengeId}::${fileName}`
}

export function reducer(state: CodeOrbitState, action: Action): CodeOrbitState {
  switch (action.type) {
    case 'RESET_ALL':
      return createDefaultState()
    case 'SELECT_TOPIC':
      return state.selectedTopicId === action.topicId ? state : { ...state, selectedTopicId: action.topicId }
    case 'VISIT': {
      const atTime = action.now || Date.now()
      const lv = state.lastVisited
      if (lv && lv.topicId === action.topicId && lv.activity === action.activity && lv.challengeId === action.challengeId) return state
      return {
        ...state,
        selectedTopicId: action.topicId,
        lastVisited: { topicId: action.topicId, activity: action.activity, at: atTime, ...(action.challengeId ? { challengeId: action.challengeId } : {}) },
      }
    }
    case 'SET_LESSON_COMPLETE': {
      const prev = state.topics[action.topicId] ?? { lessonComplete: false, quizAttempts: 0 }
      let nextState: CodeOrbitState = {
        ...state,
        topics: { ...state.topics, [action.topicId]: { ...prev, lessonComplete: action.value } }
      }
      if (action.value === true) {
        nextState = withActivity(nextState, action.now, {
          type: 'lesson-complete',
          topicId: action.topicId,
          refId: action.topicId
        })
      }
      return nextState
    }
    case 'QUIZ_UPDATE':
      return { ...state, quizSessions: { ...state.quizSessions, [action.topicId]: action.session } }
    case 'QUIZ_RESET': {
      const { [action.topicId]: _removed, ...rest } = state.quizSessions
      void _removed
      return { ...state, quizSessions: rest }
    }
    case 'QUIZ_FINISH': {
      const prev = state.topics[action.topicId] ?? { lessonComplete: false, quizAttempts: 0 }
      const best = better(prev.quizBest, { correct: action.correct, total: action.total })
      let nextState: CodeOrbitState = {
        ...state,
        quizSessions: { ...state.quizSessions, [action.topicId]: action.session },
        topics: { ...state.topics, [action.topicId]: { ...prev, quizAttempts: prev.quizAttempts + 1, quizBest: best } },
      }
      nextState = withActivity(nextState, action.now, {
        type: 'quiz-finish',
        topicId: action.topicId,
        refId: action.topicId,
        meta: { correct: action.correct, total: action.total }
      })
      return nextState
    }
    case 'SET_DRAFT': {
      const k = draftKey(action.challengeId, action.fileName)
      return state.drafts[k] === action.code ? state : { ...state, drafts: { ...state.drafts, [k]: action.code } }
    }
    case 'CLEAR_DRAFT': {
      const nextDrafts = { ...state.drafts }
      for (const k of Object.keys(nextDrafts)) {
        if (k === action.challengeId || k.startsWith(`${action.challengeId}::`)) {
          delete nextDrafts[k]
        }
      }
      return { ...state, drafts: nextDrafts }
    }
    case 'RECORD_CHECK': {
      const prev = state.challenges[action.challengeId] ?? emptyChallenge()
      const allPassed = action.passed === action.total && action.total > 0
      const nowCompleted = prev.completed || allPassed
      const checkTime = action.now || Date.now()
      let nextState: CodeOrbitState = {
        ...state,
        challenges: {
          ...state.challenges,
          [action.challengeId]: {
            ...prev,
            attempts: prev.attempts + 1,
            completed: nowCompleted,
            completedWithoutSolution: prev.completed ? prev.completedWithoutSolution : allPassed ? !prev.solutionRevealed : false,
            lastCheck: { passed: action.passed, total: action.total, failedIds: action.failedIds, at: checkTime },
          },
        },
      }
      nextState = withActivity(nextState, action.now, {
        type: 'challenge-check',
        refId: action.challengeId,
        meta: { passed: action.passed, total: action.total }
      })
      return nextState
    }
    case 'REVEAL_HINT': {
      const prev = state.challenges[action.challengeId] ?? emptyChallenge()
      if (prev.hintsRevealed >= action.max) return state
      return { ...state, challenges: { ...state.challenges, [action.challengeId]: { ...prev, hintsRevealed: prev.hintsRevealed + 1 } } }
    }
    case 'REVEAL_SOLUTION': {
      const prev = state.challenges[action.challengeId] ?? emptyChallenge()
      if (prev.solutionRevealed) return state
      return { ...state, challenges: { ...state.challenges, [action.challengeId]: { ...prev, solutionRevealed: true } } }
    }
    case 'SET_NOTE': {
      if (action.text.trim() === '') {
        const { [action.topicId]: _n, ...rest } = state.notes
        void _n
        return { ...state, notes: rest }
      }
      return { ...state, notes: { ...state.notes, [action.topicId]: { text: action.text, updatedAt: action.now } } }
    }
    case 'TOGGLE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.includes(action.topicId) ? state.bookmarks.filter((b) => b !== action.topicId) : [...state.bookmarks, action.topicId],
      }
    case 'ADD_ERROR': {
      // One open entry per source+ref: update it rather than piling up duplicates.
      const i = state.errorNotebook.findIndex((e) => e.source === action.entry.source && e.refId === action.entry.refId && e.status === 'open')
      if (i >= 0) {
        const list = state.errorNotebook.slice()
        list[i] = { ...action.entry, id: list[i].id, createdAt: list[i].createdAt }
        return { ...state, errorNotebook: list }
      }
      return { ...state, errorNotebook: [action.entry, ...state.errorNotebook] }
    }
    case 'SET_ERROR_STATUS':
      return { ...state, errorNotebook: state.errorNotebook.map((e) => (e.id === action.id ? { ...e, status: action.status } : e)) }
    case 'DELETE_ERROR':
      return { ...state, errorNotebook: state.errorNotebook.filter((e) => e.id !== action.id) }
    case 'SET_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.patch
        }
      }
    }
    case 'IMPORT_STATE': {
      return { ...action.state }
    }
  }
}
