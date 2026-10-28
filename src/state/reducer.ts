import { createDefaultState, MAX_DAYS, MAX_ACTIVITY_EVENTS } from '../lib/storage'
import { getQuiz } from '../data/quizzes'
import { scoreQuestion, type QuizSession } from '../lib/quiz'
import type { Activity, CodeOrbitState, ErrorEntry, ErrorStatus, QuizBest, Settings, ActivityEvent, ChallengeRecord, CheckHistoryEntry, NoteRecord, OnboardingState, ReviewCard, Grade } from './types'
import { addDay, dayKey, streakInfo, nextStreakBest } from '../core/gamification/streak'
import { createReviewCard, schedule, toDayKey } from '../core/learning/spaced'

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
  | { type: 'SET_NOTE'; topicId: string; text: string; now: number; tags?: string[]; format?: 'markdown' }
  | { type: 'SET_NOTE_TAGS'; topicId: string; tags: string[]; now: number }
  | { type: 'RESTORE_NOTE'; topicId: string; note: NoteRecord }
  | { type: 'TOGGLE_BOOKMARK'; topicId: string }
  | { type: 'TOGGLE_SECTION_BOOKMARK'; topicId: string; sectionId: string }
  | { type: 'CREATE_BOOKMARK_FOLDER'; name: string; id?: string }
  | { type: 'RENAME_BOOKMARK_FOLDER'; folderId: string; name: string }
  | { type: 'DELETE_BOOKMARK_FOLDER'; folderId: string }
  | { type: 'MOVE_BOOKMARK_ITEM'; itemId: string; targetFolderId: string }
  | { type: 'ADD_ERROR'; entry: ErrorEntry }
  | { type: 'SET_ERROR_STATUS'; id: string; status: ErrorStatus }
  | { type: 'DELETE_ERROR'; id: string }
  | { type: 'RESTORE_ERROR'; entry: ErrorEntry }
  | { type: 'SET_SETTINGS'; patch: Partial<Settings> }
  | { type: 'SET_ONBOARDING'; patch?: Partial<OnboardingState>; onboarding?: OnboardingState }
  | { type: 'IMPORT_STATE'; state: CodeOrbitState }
  | { type: 'AWARD_BADGE'; id: string; now?: number; backfilled?: boolean }
  | { type: 'RECORD_PERSONAL_BEST'; key: string; value: number }
  | { type: 'ASSIGN_DAILY'; dayKey: string; challengeId: string }
  | { type: 'RECORD_ACTIVE_TIME'; topicId: string; seconds: number; isNewSession?: boolean }
  | { type: 'ADD_REVIEW_CARD'; card: ReviewCard }
  | { type: 'REMOVE_REVIEW_CARD'; cardId: string }
  | { type: 'ANSWER_REVIEW_CARD'; cardId: string; grade: Grade; now?: number }

const emptyChallenge = (): ChallengeRecord => ({
  attempts: 0,
  hintsRevealed: 0,
  solutionRevealed: false,
  completed: false,
  completedWithoutSolution: false,
  history: [],
})

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

      // Stage 18a: Populate review cards for any incorrect or skipped quiz questions
      const quiz = getQuiz(action.topicId)
      if (quiz) {
        const today = toDayKey(action.now || Date.now())
        const nextReview = { ...nextState.review }
        for (let i = 0; i < quiz.questions.length; i++) {
          const q = quiz.questions[i]
          const chosen = action.session.answers[i]
          const isCorrect = scoreQuestion(q, chosen) === 1
          if (!isCorrect || action.session.skipped[i]) {
            const cardId = `quiz:${action.topicId}:${q.id}`
            if (!nextReview[cardId]) {
              nextReview[cardId] = createReviewCard({
                id: cardId,
                source: { kind: 'quiz', refId: `${action.topicId}:${q.id}` },
                topicId: action.topicId,
                prompt: q.prompt,
                answer: q.explanation || 'See lesson for full concept explanation.',
                due: today,
              })
            }
          }
        }
        nextState = { ...nextState, review: nextReview }
      }

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
      const newEntry: CheckHistoryEntry = {
        at: checkTime,
        passed: action.passed,
        total: action.total,
        failedIds: action.failedIds,
      }
      const prevHistory = prev.history ?? []
      const nextHistory = [...prevHistory, newEntry].slice(-20)

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
            history: nextHistory,
          },
        },
      }
      nextState = withActivity(nextState, action.now, {
        type: 'challenge-check',
        refId: action.challengeId,
        meta: { passed: action.passed, total: action.total }
      })

      if (allPassed && action.now !== undefined) {
        const today = dayKey(action.now)
        if (state.dailyAssigned?.[today] === action.challengeId && !nextState.dailyDone.includes(today)) {
          nextState = {
            ...nextState,
            dailyDone: [...nextState.dailyDone, today]
          }
        }
      }

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
      const existing = state.notes[action.topicId]
      const text = action.text.slice(0, 20000)
      const tags = action.tags ?? existing?.tags ?? []
      const format = 'markdown'
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.topicId]: { text, format, tags, updatedAt: action.now },
        },
      }
    }
    case 'SET_NOTE_TAGS': {
      const existing = state.notes[action.topicId]
      if (!existing) return state
      const tags = action.tags
        .map((t) => t.toLowerCase().trim())
        .filter((t) => /^[a-z0-9-]{1,24}$/.test(t))
        .slice(0, 8)
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.topicId]: { ...existing, tags, updatedAt: action.now },
        },
      }
    }
    case 'RESTORE_NOTE': {
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.topicId]: { ...action.note },
        },
      }
    }
    case 'CREATE_BOOKMARK_FOLDER': {
      const name = action.name.trim().slice(0, 50)
      if (!name) return state
      const id = action.id || name.toLowerCase().replace(/[^a-z0-9-]/g, '-') || `folder-${Date.now()}`
      const folders = state.bookmarkFolders ?? [{ id: 'unsorted', name: 'Unsorted', itemIds: [] }]
      if (folders.some((f) => f.id === id)) return state
      return {
        ...state,
        bookmarkFolders: [...folders, { id, name, itemIds: [] }],
      }
    }
    case 'RENAME_BOOKMARK_FOLDER': {
      const name = action.name.trim().slice(0, 50)
      if (!name || action.folderId === 'unsorted') return state
      const folders = state.bookmarkFolders ?? [{ id: 'unsorted', name: 'Unsorted', itemIds: [] }]
      return {
        ...state,
        bookmarkFolders: folders.map((f) => (f.id === action.folderId ? { ...f, name } : f)),
      }
    }
    case 'DELETE_BOOKMARK_FOLDER': {
      if (action.folderId === 'unsorted') return state
      const folders = state.bookmarkFolders ?? [{ id: 'unsorted', name: 'Unsorted', itemIds: [] }]
      const toDelete = folders.find((f) => f.id === action.folderId)
      if (!toDelete) return state
      return {
        ...state,
        bookmarkFolders: folders
          .filter((f) => f.id !== action.folderId)
          .map((f) =>
            f.id === 'unsorted'
              ? { ...f, itemIds: Array.from(new Set([...f.itemIds, ...toDelete.itemIds])) }
              : f
          ),
      }
    }
    case 'MOVE_BOOKMARK_ITEM': {
      const { itemId, targetFolderId } = action
      const folders = state.bookmarkFolders ?? [{ id: 'unsorted', name: 'Unsorted', itemIds: [] }]
      if (!folders.some((f) => f.id === targetFolderId)) return state
      return {
        ...state,
        bookmarkFolders: folders.map((f) => {
          if (f.id === targetFolderId) {
            return { ...f, itemIds: Array.from(new Set([...f.itemIds, itemId])) }
          }
          return { ...f, itemIds: f.itemIds.filter((id) => id !== itemId) }
        }),
      }
    }
    case 'TOGGLE_BOOKMARK': {
      const isBookmarked = state.bookmarks.includes(action.topicId)
      const nextBookmarks = isBookmarked
        ? state.bookmarks.filter((b) => b !== action.topicId)
        : [...state.bookmarks, action.topicId]
      const folders = state.bookmarkFolders ?? [{ id: 'unsorted', name: 'Unsorted', itemIds: [] }]
      const nextFolders = isBookmarked
        ? folders.map((f) => ({ ...f, itemIds: f.itemIds.filter((id) => id !== action.topicId) }))
        : folders.map((f) =>
            f.id === 'unsorted'
              ? { ...f, itemIds: Array.from(new Set([...f.itemIds, action.topicId])) }
              : f
          )
      return {
        ...state,
        bookmarks: nextBookmarks,
        bookmarkFolders: nextFolders,
      }
    }
    case 'TOGGLE_SECTION_BOOKMARK': {
      const key = `${action.topicId}#${action.sectionId}`
      const existing = state.sectionBookmarks ?? []
      const isBookmarked = existing.includes(key)
      const nextSectionBookmarks = isBookmarked
        ? existing.filter((b) => b !== key)
        : [...existing, key]
      const folders = state.bookmarkFolders ?? [{ id: 'unsorted', name: 'Unsorted', itemIds: [] }]
      const nextFolders = isBookmarked
        ? folders.map((f) => ({ ...f, itemIds: f.itemIds.filter((id) => id !== key) }))
        : folders.map((f) =>
            f.id === 'unsorted'
              ? { ...f, itemIds: Array.from(new Set([...f.itemIds, key])) }
              : f
          )
      return {
        ...state,
        sectionBookmarks: nextSectionBookmarks,
        bookmarkFolders: nextFolders,
      }
    }
    case 'ADD_ERROR': {
      // One open entry per source+ref: update it rather than piling up duplicates.
      const i = state.errorNotebook.findIndex((e) => e.source === action.entry.source && e.refId === action.entry.refId && e.status === 'open')
      let nextErrorNotebook: ErrorEntry[]
      if (i >= 0) {
        const list = state.errorNotebook.slice()
        list[i] = { ...action.entry, id: list[i].id, createdAt: list[i].createdAt }
        nextErrorNotebook = list
      } else {
        nextErrorNotebook = [action.entry, ...state.errorNotebook]
      }

      // Stage 18a: Generate review card from Error Notebook entry
      const errCardId = `error:${action.entry.id}`
      const nextReview = { ...state.review }
      if (!nextReview[errCardId]) {
        nextReview[errCardId] = createReviewCard({
          id: errCardId,
          source: { kind: 'error', refId: action.entry.id },
          topicId: action.entry.topicId,
          prompt: `Fix mistake: ${action.entry.title}`,
          answer: action.entry.detail,
          due: toDayKey(action.entry.createdAt || Date.now()),
        })
      }

      return { ...state, errorNotebook: nextErrorNotebook, review: nextReview }
    }
    case 'SET_ERROR_STATUS':
      return { ...state, errorNotebook: state.errorNotebook.map((e) => (e.id === action.id ? { ...e, status: action.status } : e)) }
    case 'DELETE_ERROR':
      return { ...state, errorNotebook: state.errorNotebook.filter((e) => e.id !== action.id) }
    case 'RESTORE_ERROR': {
      if (state.errorNotebook.some((e) => e.id === action.entry.id)) {
        return state
      }
      return { ...state, errorNotebook: [action.entry, ...state.errorNotebook] }
    }
    case 'SET_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.patch
        }
      }
    }
    case 'SET_ONBOARDING': {
      const patch = action.patch ?? action.onboarding ?? {}
      const current = state.settings.onboarding ?? { completed: false }
      return {
        ...state,
        settings: {
          ...state.settings,
          onboarding: {
            ...current,
            ...patch,
          },
        },
      }
    }
    case 'IMPORT_STATE': {
      return { ...action.state }
    }
    case 'AWARD_BADGE': {
      if (state.badges[action.id]) return state
      return {
        ...state,
        badges: {
          ...state.badges,
          [action.id]: {
            firstSeenAt: action.backfilled ? null : (action.now ?? Date.now()),
            backfilled: action.backfilled ?? false,
          }
        }
      }
    }
    case 'RECORD_PERSONAL_BEST': {
      return {
        ...state,
        personalBests: {
          ...state.personalBests,
          [action.key]: action.value,
        }
      }
    }
    case 'ASSIGN_DAILY': {
      if (state.dailyAssigned?.[action.dayKey]) return state
      return {
        ...state,
        dailyAssigned: {
          ...state.dailyAssigned,
          [action.dayKey]: action.challengeId,
        }
      }
    }
    case 'RECORD_ACTIVE_TIME': {
      if (!action.topicId || typeof action.seconds !== 'number' || action.seconds <= 0) return state
      const current = state.timeSpent?.[action.topicId] || 0
      const updatedSeconds = Math.round(current + action.seconds)
      const currentSessions = state.timeSpentSessions?.[action.topicId] || 0
      const updatedSessions = action.isNewSession ? currentSessions + 1 : currentSessions
      return {
        ...state,
        timeSpent: {
          ...state.timeSpent,
          [action.topicId]: updatedSeconds,
        },
        timeSpentSessions: {
          ...state.timeSpentSessions,
          [action.topicId]: updatedSessions,
        },
      }
    }
    case 'ADD_REVIEW_CARD': {
      return {
        ...state,
        review: {
          ...state.review,
          [action.card.id]: action.card,
        },
      }
    }
    case 'REMOVE_REVIEW_CARD': {
      const { [action.cardId]: _removed, ...rest } = state.review
      void _removed
      return {
        ...state,
        review: rest,
      }
    }
    case 'ANSWER_REVIEW_CARD': {
      const card = state.review[action.cardId]
      if (!card) return state
      const atTime = action.now || Date.now()
      const updated = schedule(card, action.grade, atTime)
      const nextReview = { ...state.review, [action.cardId]: updated }
      const nextState = { ...state, review: nextReview }
      return withActivity(nextState, atTime, {
        type: 'review-answer',
        topicId: card.topicId,
        refId: card.id,
        meta: { grade: action.grade, intervalDays: updated.intervalDays },
      })
    }
  }
}
