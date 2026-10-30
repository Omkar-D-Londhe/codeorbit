import type { TrackModule } from '../../core/content/types'
import { JAVA_TECH_ID, javaGroups, javaTopics } from './curriculum'
import { javaLessons } from './lessons'
import { javaQuizzes } from './quizzes'
import { javaChallenges } from './challenges'
import { javaAchievements } from './achievements'
import { JAVA_SNIPPETS } from './snippets'
import { createJavaValidator } from './validators'
import { javaStaticProvider } from './analysis/provider'
import { javaRunner } from './runner'

export const javaTrack: TrackModule = {
  id: JAVA_TECH_ID,
  name: 'Java',
  glyph: 'JA',
  description: 'Object-oriented programming, strong static typing, robust control structures, collections, and algorithms.',
  availability: 'available',
  tint: '#f89820',
  language: {
    id: JAVA_TECH_ID,
    displayName: 'Java',
    fileExtension: '.java',
    editorLanguageId: 'java',
    defaultFiles: [
      {
        name: 'Main.java',
        language: 'java',
        content: '// CodeOrbit Java Practice\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n',
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
  runner: javaRunner,
  groups: javaGroups,
  topics: javaTopics,
  lessons: Object.fromEntries(javaLessons.map((l) => [l.topicId, l])),
  quizzes: Object.fromEntries(javaQuizzes.map((q) => [q.topicId, q])),
  challenges: javaChallenges,
  achievements: javaAchievements,
  snippets: JAVA_SNIPPETS,
  analysisProvider: javaStaticProvider,
  validatorFactory: (challenge) => createJavaValidator(challenge.requirements),
}
