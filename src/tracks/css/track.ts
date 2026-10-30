import type { TrackModule } from '../../core/content/types'
import { CSS_TECH_ID, cssGroups, cssTopics } from './curriculum'
import { cssLessons } from './lessons'
import { cssQuizzes } from './quizzes'
import { cssChallenges } from './challenges'
import { cssAchievements } from './achievements'
import { CSS_SNIPPETS } from './snippets'
import { createCssValidator } from './validators'

export const cssTrack: TrackModule = {
  id: CSS_TECH_ID,
  name: 'CSS',
  glyph: '{ }',
  description:
    'Selectors, the box model, responsive layouts with flexbox and grid, and accessible motion.',
  availability: 'available',
  tint: '#f59e0b',
  language: {
    id: CSS_TECH_ID,
    displayName: 'CSS',
    fileExtension: '.css',
    editorLanguageId: 'css',
    defaultFiles: [
      {
        name: 'styles.css',
        language: 'css',
        content: '/* CodeOrbit CSS Track */\nbody {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n',
      },
    ],
  },
  capabilities: ['lessons', 'quizzes', 'practice', 'preview', 'diagnostics', 'snippets'],
  groups: cssGroups,
  topics: cssTopics,
  lessons: Object.fromEntries(cssLessons.map((l) => [l.topicId, l])),
  quizzes: Object.fromEntries(cssQuizzes.map((q) => [q.topicId, q])),
  challenges: cssChallenges,
  achievements: cssAchievements,
  snippets: CSS_SNIPPETS,
  validatorFactory: (challenge) => createCssValidator(challenge.requirements),
}
