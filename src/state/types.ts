import type { QuizSession } from '../lib/quiz'
import type { ReviewCard, Grade } from '../core/learning/spaced'
import type { ChallengeV2 } from '../core/content/types'
import type { AnalysisRecord, AnalysisState } from '../core/analysis/types'

export type { ReviewCard, Grade, ChallengeV2, AnalysisRecord, AnalysisState }
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
  format: 'markdown'
  tags: string[]
  updatedAt: number
}

export interface BookmarkFolder {
  id: string
  name: string
  itemIds: string[]
}

export const DEFAULT_BOOKMARK_FOLDER_ID = 'unsorted'
export const DEFAULT_BOOKMARK_FOLDER_NAME = 'Unsorted'

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

export type FontScale = 0.875 | 1 | 1.125 | 1.25 | 1.5
export const VALID_FONT_SCALES: readonly FontScale[] = [0.875, 1, 1.125, 1.25, 1.5]

export interface ReminderSettings {
  enabled: boolean
  time: string
  days: number[]
  lastShownDate?: string
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  time: '18:00',
  days: [1, 2, 3, 4, 5],
}

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

export interface OnboardingState {
  completed: boolean
  skippedAt?: number
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
  gamificationEnabled?: boolean
  atmosphere?: AtmosphereSettings
  editor?: EditorSettings
  fontScale?: FontScale
  dyslexiaFont?: boolean
  announcements?: boolean
  reminders?: ReminderSettings
  onboarding?: OnboardingState
}

export const DEFAULT_SETTINGS: Settings = {
  userName: '',
  pace: 'regular',
  theme: 'obsidian',
  accent: 'violet',
  contrast: 'normal',
  motion: 'system',
  gamificationEnabled: true,
  atmosphere: { ...DEFAULT_ATMOSPHERE_SETTINGS },
  editor: { ...DEFAULT_EDITOR_SETTINGS },
  fontScale: 1,
  dyslexiaFont: false,
  announcements: true,
  reminders: { ...DEFAULT_REMINDER_SETTINGS },
  onboarding: { completed: false },
}

export interface ActivityEvent {
  id: string
  type: 'lesson-complete' | 'quiz-finish' | 'challenge-check' | 'review-answer'
  at: number
  trackId?: string
  topicId?: string
  refId?: string
  meta?: Record<string, string | number | boolean>
}

export interface BadgeRecord {
  /** Timestamp when first observed earned in live session, or null if backfilled from pre-existing progress. */
  firstSeenAt: number | null
  /** True if the badge was earned prior to schema v5 tracking or backfilled on migration. */
  backfilled: boolean
}

export interface CodeOrbitState {
  schemaVersion: number
  lastVisited?: LastVisited
  lastVisitedByTrack?: Record<string, LastVisited>
  selectedTopicId?: string
  topics: Record<string, TopicRecord>
  quizSessions: Record<string, QuizSession>
  drafts: Record<string, string>
  challenges: Record<string, ChallengeRecord>
  notes: Record<string, NoteRecord>
  bookmarks: string[]
  sectionBookmarks?: string[]
  bookmarkFolders: BookmarkFolder[]
  errorNotebook: ErrorEntry[]
  settings: Settings
  activity: ActivityEvent[]
  activityDays: string[]
  dailyDone: string[]
  dailyAssigned?: Record<string, string>
  streakBest: number
  badges: Record<string, BadgeRecord>
  personalBests: Record<string, number>
  timeSpent: Record<string, number>
  timeSpentSessions: Record<string, number>
  review: Record<string, ReviewCard>
  custom: { challenges: ChallengeV2[] }
  analysis: AnalysisState
}

/** Helper to generate composite section review card ID (18a) */
export const sectionReviewCardId = (topicId: string, sectionId: string): string => `section:${topicId}#${sectionId}`

/** Helper to generate composite section bookmark ID (8.2) */
export const sectionBookmarkId = (topicId: string, sectionId: string): string => `${topicId}#${sectionId}`

/** Helper to parse composite section bookmark ID */
export const parseSectionBookmarkId = (id: string): { topicId: string; sectionId: string } | null => {
  const hashIdx = id.indexOf('#')
  if (hashIdx === -1) return null
  return {
    topicId: id.slice(0, hashIdx),
    sectionId: id.slice(hashIdx + 1),
  }
}


