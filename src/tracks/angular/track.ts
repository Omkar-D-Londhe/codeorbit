import type { TrackModule } from '../../core/content/types'
import { ANGULAR_TECH_ID, angularGroups, angularTopics } from './curriculum'
import { angularLessons } from './lessons'
import { angularQuizzes } from './quizzes'
import { angularAchievements } from './achievements'
import { ANGULAR_SNIPPETS } from './snippets'
import { angularConcepts } from './concepts'
import { angularChallenges } from './challenges'
import { angularRunner } from './runner'

export const angularTrack: TrackModule = {
  id: ANGULAR_TECH_ID,
  name: 'Angular',
  glyph: 'A',
  description: 'Component-based single-page applications.',
  availability: 'available',
  tint: '#dd0031',
  language: {
    id: ANGULAR_TECH_ID,
    displayName: 'Angular (TypeScript)',
    fileExtension: '.ts',
    editorLanguageId: 'typescript',
  },
  capabilities: [
    'lessons',
    'quizzes',
    'practice',
    'preview',
    'diagnostics',
  ],
  groups: angularGroups,
  topics: angularTopics,
  lessons: Object.fromEntries(angularLessons.map((l) => [l.topicId, l])),
  quizzes: Object.fromEntries(angularQuizzes.map((q) => [q.topicId, q])),
  challenges: angularChallenges,
  runner: angularRunner,
  achievements: angularAchievements,
  snippets: ANGULAR_SNIPPETS,
  concepts: angularConcepts,
}
