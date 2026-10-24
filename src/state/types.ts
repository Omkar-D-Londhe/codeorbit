import type { QuizSession } from '../lib/quiz'

export type Activity = 'lesson' | 'quiz' | 'practice'

export interface LastVisited {
  topicId: string
  activity: Activity
  challengeId?: string
  /** Epoch ms of the real visit. */
  at: number
}

export interface QuizBest {
  correct: number
  total: number
}

export interface TopicRecord {
  lessonComplete: boolean
  quizAttempts: number
  quizBest?: QuizBest
}

export interface ChallengeRecord {
  attempts: number
  hintsRevealed: number
  solutionRevealed: boolean
  completed: boolean
  /** True only when every requirement passed before the reference solution was revealed. */
  completedWithoutSolution: boolean
  lastCheck?: { passed: number; total: number; failedIds: string[]; at: number }
}

export interface NoteRecord {
  text: string
  updatedAt: number
}

export type ErrorStatus = 'open' | 'understood'

export interface ErrorEntry {
  id: string
  source: 'challenge' | 'quiz'
  topicId: string
  /** Challenge id or quiz question id. */
  refId: string
  title: string
  detail: string
  /** Learner's code snapshot (challenge entries only). */
  code?: string
  status: ErrorStatus
  createdAt: number
}

export interface CodeOrbitState {
  schemaVersion: number
  lastVisited?: LastVisited
  selectedTopicId?: string
  topics: Record<string, TopicRecord>
  quizSessions: Record<string, QuizSession>
  drafts: Record<string, string>
  challenges: Record<string, ChallengeRecord>
  notes: Record<string, NoteRecord>
  bookmarks: string[]
  errorNotebook: ErrorEntry[]
}
