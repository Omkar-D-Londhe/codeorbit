import type { TrackModule } from '../../core/content/types'
import { PYTHON_TECH_ID, pythonGroups, pythonTopics } from './curriculum'
import { pythonLessons } from './lessons'
import { pythonQuizzes } from './quizzes'
import { pythonChallenges } from './challenges'
import { pythonAchievements } from './achievements'
import { PYTHON_SNIPPETS } from './snippets'
import { createPythonValidator } from './validators'
import { pythonRunner } from './runner'
import { pyAstProvider } from './analysis/provider'

export const pythonTrack: TrackModule = {
  id: PYTHON_TECH_ID,
  name: 'Python',
  glyph: 'PY',
  description: 'Clean syntax, dynamic typing, control flow, functions, collections, and algorithms.',
  availability: 'available',
  tint: '#38bdf8',
  language: {
    id: PYTHON_TECH_ID,
    displayName: 'Python 3',
    fileExtension: '.py',
    editorLanguageId: 'python',
    defaultFiles: [
      {
        name: 'solution.py',
        language: 'python',
        content: '# CodeOrbit Python Practice\n',
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
  groups: pythonGroups,
  topics: pythonTopics,
  lessons: Object.fromEntries(pythonLessons.map((l) => [l.topicId, l])),
  quizzes: Object.fromEntries(pythonQuizzes.map((q) => [q.topicId, q])),
  challenges: pythonChallenges,
  achievements: pythonAchievements,
  snippets: PYTHON_SNIPPETS,
  runner: pythonRunner,
  analysisProvider: pyAstProvider,
  validatorFactory: (challenge) =>
    createPythonValidator(challenge.requirements, { tests: challenge.tests }),
}
