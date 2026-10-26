import type { QuizSession } from '../lib/quiz'
import type { ThemeId, AccentId, ContrastMode, MotionPreference } from '../core/settings/appearance'

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

export interface CheckHistoryEntry {
  at: number
  passed: number
  total: number
  failedIds: string[]
}

export interface ChallengeRecord {
  attempts: number
  hintsRevealed: number
  solutionRevealed: boolean
  completed: boolean
  /** True only when every requirement passed before the reference solution was revealed. */
  completedWithoutSolution: boolean
  lastCheck?: { passed: number; total: number; failedIds: string[]; at: number }
  history?: CheckHistoryEntry[]
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

export interface AtmosphereSettings {
  nebula: boolean
  grid: boolean
  cursorGlow: boolean
  particles: boolean
}

export const DEFAULT_ATMOSPHERE_SETTINGS: AtmosphereSettings = {
  nebula: true,
  grid: true,
  cursorGlow: false,
  particles: false,
}

export type EditorEngine = 'codemirror' | 'plain'

export interface EditorSettings {
  engine: EditorEngine
  fontSize: number
  tabSize: number
  lineNumbers: boolean
  wrap: boolean
  tabCapturesFocus: boolean
  autoClose: boolean
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  engine: 'codemirror',
  fontSize: 14.4,
  tabSize: 2,
  lineNumbers: true,
  wrap: false,
  tabCapturesFocus: false,
  autoClose: true,
}

export interface Settings {
  userName?: string
  pace: 'casual' | 'regular' | 'intensive'
  theme: ThemeId
  accent: AccentId
  contrast: ContrastMode
  motion: MotionPreference
  soundEnabled?: boolean
  streakReminders?: boolean
  dailyGoal?: number
  atmosphere?: AtmosphereSettings
  editor?: EditorSettings
}

export const DEFAULT_SETTINGS: Settings = {
  userName: '',
  pace: 'regular',
  theme: 'obsidian',
  accent: 'violet',
  contrast: 'normal',
  motion: 'system',
  atmosphere: { ...DEFAULT_ATMOSPHERE_SETTINGS },
  editor: { ...DEFAULT_EDITOR_SETTINGS }
}

export interface ActivityEvent {
  id: string
  type: 'lesson-complete' | 'quiz-finish' | 'challenge-check'
  at: number
  trackId?: string
  topicId?: string
  refId?: string
  meta?: Record<string, string | number | boolean>
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
  sectionBookmarks?: string[]
  errorNotebook: ErrorEntry[]
  settings: Settings
  activity: ActivityEvent[]
  activityDays: string[]
  dailyDone: string[]
  dailyAssigned?: Record<string, string>
  streakBest: number
}

/** Helper to generate composite section bookmark ID (8.2) */
export const sectionBookmarkId = (topicId: string, sectionId: string): string => `${topicId}#${sectionId}`

