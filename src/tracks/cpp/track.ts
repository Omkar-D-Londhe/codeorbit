import type { TrackModule } from '../../core/content/types'
import { CPP_TECH_ID, cppGroups, cppTopics } from './curriculum'
import { cppLessons } from './lessons'
import { cppQuizzes } from './quizzes'
import { cppChallenges } from './challenges'
import { cppAchievements } from './achievements'
import { CPP_SNIPPETS } from './snippets'
import { createCppValidator } from './validators'
import { cppStaticProvider } from './analysis/provider'
import { cppRunner } from './runner'

export const cppTrack: TrackModule = {
  id: CPP_TECH_ID,
  name: 'C++',
  glyph: 'C+',
  description: 'High-performance systems programming, pointers and memory management, object-oriented design, and the STL.',
  availability: 'available',
  tint: '#00599c',
  language: {
    id: CPP_TECH_ID,
    displayName: 'C++',
    fileExtension: '.cpp',
    editorLanguageId: 'cpp',
    defaultFiles: [
      {
        name: 'main.cpp',
        language: 'cpp',
        content: '// CodeOrbit C++ Practice\n#include <iostream>\n\nint main() {\n    return 0;\n}\n',
      },
    ],
  },
  capabilities: [
    'lessons',
    'quizzes',
    'practice',
    'execution',
    'diagnostics',
    'snippets',
    'complexity',
    'optimisation',
  ],
  runner: cppRunner,
  groups: cppGroups,
  topics: cppTopics,
  lessons: Object.fromEntries(cppLessons.map((l) => [l.topicId, l])),
  quizzes: Object.fromEntries(cppQuizzes.map((q) => [q.topicId, q])),
  challenges: cppChallenges,
  achievements: cppAchievements,
  snippets: CPP_SNIPPETS,
  analysisProvider: cppStaticProvider,
  validatorFactory: (challenge) => createCppValidator(challenge.requirements),
}
