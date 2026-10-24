import { createDefaultState } from '../lib/storage'
import type { QuizSession } from '../lib/quiz'
import type { Activity, CodeOrbitState, ErrorEntry, ErrorStatus, QuizBest } from './types'

export type Action =
  | { type: 'RESET_ALL' }
  | { type: 'SELECT_TOPIC'; topicId: string }
  | { type: 'VISIT'; topicId: string; activity: Activity; challengeId?: string; now: number }
  | { type: 'SET_LESSON_COMPLETE'; topicId: string; value: boolean }
  | { type: 'QUIZ_UPDATE'; topicId: string; session: QuizSession }
  | { type: 'QUIZ_RESET'; topicId: string }
  | { type: 'QUIZ_FINISH'; topicId: string; session: QuizSession; correct: number; total: number }
  | { type: 'SET_DRAFT'; challengeId: string; code: string }
  | { type: 'CLEAR_DRAFT'; challengeId: string }
  | { type: 'RECORD_CHECK'; challengeId: string; passed: number; total: number; failedIds: string[]; now: number }
  | { type: 'REVEAL_HINT'; challengeId: string; max: number }
  | { type: 'REVEAL_SOLUTION'; challengeId: string }
  | { type: 'SET_NOTE'; topicId: string; text: string; now: number }
  | { type: 'TOGGLE_BOOKMARK'; topicId: string }
  | { type: 'ADD_ERROR'; entry: ErrorEntry }
  | { type: 'SET_ERROR_STATUS'; id: string; status: ErrorStatus }
  | { type: 'DELETE_ERROR'; id: string }

const emptyChallenge = () => ({ attempts: 0, hintsRevealed: 0, solutionRevealed: false, completed: false, completedWithoutSolution: false })

const better = (a: QuizBest | undefined, b: QuizBest): QuizBest => (!a || b.correct / b.total > a.correct / a.total ? b : a)

export function reducer(state: CodeOrbitState, action: Action): CodeOrbitState {
  switch (action.type) {
    case 'RESET_ALL':
      return createDefaultState()
    case 'SELECT_TOPIC':
      return state.selectedTopicId === action.topicId ? state : { ...state, selectedTopicId: action.topicId }
    case 'VISIT': {
      const lv = state.lastVisited
      if (lv && lv.topicId === action.topicId && lv.activity === action.activity && lv.challengeId === action.challengeId) return state
      return {
        ...state,
        selectedTopicId: action.topicId,
        lastVisited: { topicId: action.topicId, activity: action.activity, at: action.now, ...(action.challengeId ? { challengeId: action.challengeId } : {}) },
      }
    }
    case 'SET_LESSON_COMPLETE': {
      const prev = state.topics[action.topicId] ?? { lessonComplete: false, quizAttempts: 0 }
      return { ...state, topics: { ...state.topics, [action.topicId]: { ...prev, lessonComplete: action.value } } }
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
      return {
        ...state,
        quizSessions: { ...state.quizSessions, [action.topicId]: action.session },
        topics: { ...state.topics, [action.topicId]: { ...prev, quizAttempts: prev.quizAttempts + 1, quizBest: best } },
      }
    }
    case 'SET_DRAFT':
      return state.drafts[action.challengeId] === action.code ? state : { ...state, drafts: { ...state.drafts, [action.challengeId]: action.code } }
    case 'CLEAR_DRAFT': {
      const { [action.challengeId]: _d, ...rest } = state.drafts
      void _d
      return { ...state, drafts: rest }
    }
    case 'RECORD_CHECK': {
      const prev = state.challenges[action.challengeId] ?? emptyChallenge()
      const allPassed = action.passed === action.total && action.total > 0
      const nowCompleted = prev.completed || allPassed
      return {
        ...state,
        challenges: {
          ...state.challenges,
          [action.challengeId]: {
            ...prev,
            attempts: prev.attempts + 1,
            completed: nowCompleted,
            completedWithoutSolution: prev.completed ? prev.completedWithoutSolution : allPassed ? !prev.solutionRevealed : false,
            lastCheck: { passed: action.passed, total: action.total, failedIds: action.failedIds, at: action.now },
          },
        },
      }
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
  }
}
