/**
 * Language-neutral content contracts.
 * Target architecture contracts per 01_PRODUCT_AND_ARCHITECTURE.md §B2.
 */

import type {
  Topic,
  TopicGroup,
  Lesson,
  LessonSection,
  Quiz,
  QuizQuestion,
  Challenge,
  ChallengeRequirement,
  Rule,
  Technology,
  TechnologyStatus,
} from '../../data/types'

import type { ConceptEntry } from '../concepts/concepts'
import type { CodeRunner } from '../runner/types'

// Re-export existing content types
export type {
  Topic,
  TopicGroup,
  Lesson,
  LessonSection,
  Quiz,
  QuizQuestion,
  Challenge,
  ChallengeRequirement,
  Rule,
  Technology,
  TechnologyStatus,
}

export type CapabilityId =
  | 'lessons'
  | 'quizzes'
  | 'practice'
  | 'preview'
  | 'execution'
  | 'diagnostics'
  | 'complexity'
  | 'optimisation'
  | 'diff'
  | 'snippets'
  | 'a11yLint'

export interface LanguageDescriptor {
  id: string
  displayName: string
  fileExtension: string
  editorLanguageId: string
  defaultFiles?: ChallengeFile[]
}

export interface ChallengeFile {
  name: string
  language: string
  content: string
  readOnly?: boolean
}

export interface ChallengeTestCase {
  id: string
  name: string
  call: string
  expect: unknown
  hidden?: boolean
}

export interface ReferenceComplexity {
  time: string
  space: string
  explanation?: string
}

export interface ChallengeV2 {
  id: string
  trackId: string
  topicId: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prompt: string
  objective: string
  notice?: string
  files: ChallengeFile[]
  requirements: ChallengeRequirement[]
  hints: [string, string, string]
  solution: { files: ChallengeFile[]; explanation: string }
  tests?: ChallengeTestCase[]
  referenceComplexity?: ReferenceComplexity
}

export interface RequirementResult {
  id: string
  met: boolean
  detail?: string
  line?: number
  column?: number
}

export interface ChallengeValidator {
  validate(files: ChallengeFile[]): RequirementResult[] | Promise<RequirementResult[]>
}

export type ChallengeValidatorFactory = (challenge: Challenge) => ChallengeValidator

export interface TrackModule {
  id: string
  name: string
  glyph: string
  description: string
  availability: 'available' | 'preview' | 'planned' | 'decision-gated'
  tint: string
  language: LanguageDescriptor
  capabilities: CapabilityId[]
  groups: TopicGroup[]
  topics: Topic[]
  lessons: Record<string, Lesson>
  quizzes: Record<string, Quiz>
  challenges: Challenge[]
  runner?: CodeRunner
  validatorFactory?: ChallengeValidatorFactory
  analysisProvider?: unknown
  snippets?: unknown[]
  achievements?: unknown[]
  concepts?: ConceptEntry[]
  previewStylesheets?: Array<() => Promise<string>>
  constellation?: unknown
}
