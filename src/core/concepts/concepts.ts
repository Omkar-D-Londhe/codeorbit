/**
 * Concept Registry Skeleton.
 * Definition per 06_FRONTEND_CONCEPTS_APPLICATION_MAP.md §4.
 * Populated in Stage 19 (Concept Atlas).
 */

export interface ConceptPlatformUse {
  feature: string
  route?: string
  sourceFiles: string[]
  selectors?: string[]
}

export interface ConceptTeachIn {
  trackId: string
  topicId: string
  challengeId?: string
}

export interface ConceptEntry {
  id: string // e.g. 'FC-13'
  title: string
  summary: string
  platformUse?: ConceptPlatformUse
  teachIn: ConceptTeachIn[]
  evidenceTests: string[] // vitest file names
  courseStatus: 'pending-review' | 'verified' | 'not-required'
}

export const concepts: ConceptEntry[] = []
