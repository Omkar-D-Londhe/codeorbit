import type { ChallengeTestCase } from '../core/content/types'
import type { AngularRule } from '../tracks/angular/validators'

/** Content + domain types. Everything in src/data is app content (not learner activity). */

export type TechnologyStatus = 'available' | 'preview' | 'planned' | 'decision-gated'

export interface Technology {
  id: string
  name: string
  glyph: string
  description: string
  status: TechnologyStatus
  /** Only populated for available technologies. */
  topicIds: string[]
}

export interface TopicGroup {
  id: string
  title: string
}

export interface Topic {
  id: string
  technologyId: string
  title: string
  /** Short label used in the compact Orbit node. */
  shortTitle: string
  description: string
  groupId: string
  /** Real prerequisite / relationship edges. Curriculum order is NOT an edge. */
  prerequisiteIds: string[]
  /** Optional tags for filtering and discovery (e.g. 'forms', 'semantics', 'accessibility'). */
  tags?: string[]
}

export interface LessonSection {
  id?: string
  heading: string
  body: string[]
  code?: { label: string; code: string }
  callout?: { kind: 'why' | 'mistake'; text: string }
}

export interface LessonFile {
  name: string
  content: string
  readOnly?: boolean
  hidden?: boolean
}

export interface LessonDemo {
  id: string
  title: string
  files: LessonFile[]
}

export interface LessonTerm {
  term: string
  definition: string
}

export interface Lesson {
  topicId: string
  objective: string
  sections: LessonSection[]
  takeaways?: string[]
  terms?: Record<string, LessonTerm>
  demos?: LessonDemo[]
  a11yNotes?: string[]
  estimatedMinutes?: number
}

export type QuizAnswer = number | string | string[] | null

export interface ChoiceQuizQuestion {
  kind?: 'choice'
  id: string
  prompt: string
  options: string[]
  answer?: number
  correctIndex: number
  explanation: string
}

export interface OutputPredictorQuizQuestion {
  kind: 'output'
  id: string
  prompt: string
  code: string
  options: Array<{ id: string; svg: string }>
  answer: string
  explanation: string
}

export interface SorterQuizQuestion {
  kind: 'sort'
  id: string
  prompt: string
  items: Array<{ id: string; text: string }>
  order: string[]
  explanation: string
}

export interface SpotBugQuizQuestion {
  kind: 'bug'
  id: string
  prompt: string
  lines: string[]
  answer: number
  explanation: string
}

export interface BlankQuizQuestion {
  kind: 'blank'
  id: string
  prompt: string
  answers: string[]
  caseInsensitive?: boolean
  explanation: string
}

export type QuizQuestion =
  | ChoiceQuizQuestion
  | OutputPredictorQuizQuestion
  | SorterQuizQuestion
  | SpotBugQuizQuestion
  | BlankQuizQuestion

export interface Quiz {
  topicId: string
  questions: QuizQuestion[]
}

/**
 * Declarative, deterministic checks evaluated against a parsed Document.
 * (See src/lib/validators.ts.)
 */
export type Rule =
  | { kind: 'doctype' }
  | { kind: 'selector'; selector: string; min?: number; max?: number; exactly?: number }
  | { kind: 'noMatch'; selector: string }
  | { kind: 'textLength'; selector: string; min: number }
  | { kind: 'everyHasAttr'; selector: string; attr: string; nonEmpty?: boolean; min?: number }
  | { kind: 'everyAttrContains'; selector: string; attr: string; token: string }
  | { kind: 'anyHasAttr'; selector: string; attr: string; startsWith?: string; nonEmpty?: boolean }
  | { kind: 'controlsLabelled' }
  | { kind: 'headingOrder' }
  | { kind: 'fragmentLinksResolve' }
  | { kind: 'noLinkText'; patterns: string[] }
  | { kind: 'hasAttrValue'; selector: string; attr: string; values: string[] }
  | { kind: 'nestedList' }
  | { kind: 'cellSpan'; attr: 'rowspan' | 'colspan'; min: number }
  | { kind: 'inputTypes'; types: string[]; min?: number }
  | { kind: 'mediaControls'; element: 'audio' | 'video' }
  | { kind: 'ruleExists'; selector: string; property: string; value?: string | RegExp }
  | { kind: 'declares'; property: string; pattern: string }
  | { kind: 'mediaQuery'; feature: 'min-width' | 'max-width'; min?: number; max?: number }
  | { kind: 'usesDisplay'; value: 'flex' | 'grid' }
  | { kind: 'reducedMotionGuard' }
  | { kind: 'specificityBelow'; selector: string; max: [number, number, number] }
  | { kind: 'testPasses'; testId: string }
  | { kind: 'allTestsPass' }
  | { kind: 'declaresFunction'; name: string }
  | { kind: 'jsSourceMatches'; pattern: string | RegExp }
  | { kind: 'domAssertion'; selector: string; check: 'exists' | 'text' | 'attribute'; expected?: string; attr?: string }
  | { kind: 'hasClass'; selector: string; className: string }
  | { kind: 'navbarStructure' }
  | { kind: 'gridStructure'; expectedCols?: number }
  | { kind: 'formControls' }
  | { kind: 'validationFeedback' }
  | { kind: 'definesFunction'; name: string; paramsCount?: number; params?: string[]; returns?: boolean; returnType?: string }
  | { kind: 'containsLoop'; loopType?: 'for' | 'while' | 'range-for' | 'enhanced-for' | 'any'; minNesting?: number }
  | { kind: 'usesComprehension'; comprehensionType?: 'list' | 'dict' | 'set' | 'any' }
  | { kind: 'usesRecursion'; functionName?: string; methodName?: string }
  | { kind: 'declaresClass'; name: string; methods?: string[] }
  | { kind: 'usesConstruct'; construct: 'if-elif-else' | 'try-except' | 'with' | 'lambda' | 'docstring' | 'assert' | 'if-else' | 'switch' | 'enhanced-for' | 'private-field' | 'iostream' | 'cout' | 'nullptr' | 'vector' | 'access-specifier' | 'if' }
  | { kind: 'pythonSourceMatches'; pattern: string | RegExp }
  | { kind: 'blocksImport'; blockedModules?: string[] }
  | { kind: 'definesMethod'; name: string; returnType?: string; paramsCount?: number; isStatic?: boolean }
  | { kind: 'definesClass'; name: string }
  | { kind: 'usesPointerOrReference'; usage?: 'pointer' | 'reference' | 'any' }
  | { kind: 'javaSourceMatches'; pattern: string | RegExp }
  | { kind: 'cppSourceMatches'; pattern: string | RegExp }
  | AngularRule

export interface ChallengeRequirement {
  id: string
  description: string
  /** Why this requirement matters (shown in feedback). */
  explanation: string
  /** Detailed expandable explanation for Code Coach (7.5). */
  explain?: string
  rule: Rule
}

export interface Challenge {
  id: string
  topicId: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prompt: string
  description?: string
  objective: string
  notice?: string
  starterCode: string
  requirements: ChallengeRequirement[]
  /** Exactly three, in order: conceptual → structural → specific. */
  hints: [string, string, string]
  solution?: string
  solutionCode: string
  solutionExplanation: string[]
  needsMedia?: boolean
  files?: Array<{ name: string; language: string; content: string; readOnly?: boolean }>
  solutionFiles?: Array<{ name: string; language: string; content: string; readOnly?: boolean }>
  tests?: ChallengeTestCase[]
}
