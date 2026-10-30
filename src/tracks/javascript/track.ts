import type { TrackModule } from '../../core/content/types'
import { JS_TECH_ID, jsGroups, jsTopics } from './curriculum'
import { jsLessons } from './lessons'
import { jsQuizzes } from './quizzes'
import { jsChallenges } from './challenges'
import { jsAchievements } from './achievements'
import { JS_SNIPPETS } from './snippets'
import { createJavaScriptValidator } from './validators'
import { jsProvider } from './analysis/provider'

export const jsTrack: TrackModule = {
  id: JS_TECH_ID,
  name: 'JavaScript',
  glyph: 'JS',
  description:
    'Variables, modern ES6+, functions, closures, events, DOM manipulation, storage, and algorithms.',
  availability: 'available',
  tint: '#14b8a6',
  language: {
    id: JS_TECH_ID,
    displayName: 'JavaScript',
    fileExtension: '.js',
    editorLanguageId: 'javascript',
    defaultFiles: [
      {
        name: 'solution.js',
        language: 'javascript',
        content: '// CodeOrbit JavaScript Track\n',
      },
    ],
  },
  capabilities: [
    'lessons',
    'quizzes',
    'practice',
    'preview',
    'execution',
    'diagnostics',
    'snippets',
    'complexity',
    'optimisation',
  ],
  groups: jsGroups,
  topics: jsTopics,
  lessons: Object.fromEntries(jsLessons.map((l) => [l.topicId, l])),
  quizzes: Object.fromEntries(jsQuizzes.map((q) => [q.topicId, q])),
  challenges: jsChallenges,
  achievements: jsAchievements,
  snippets: JS_SNIPPETS,
  analysisProvider: jsProvider,
  validatorFactory: (challenge) => createJavaScriptValidator(challenge.requirements, { tests: challenge.tests }),
}
