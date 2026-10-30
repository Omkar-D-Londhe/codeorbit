import type { TrackModule } from '../../core/content/types'
import { BOOTSTRAP_TECH_ID, bootstrapGroups, bootstrapTopics } from './curriculum'
import { bootstrapLessons } from './lessons'
import { bootstrapQuizzes } from './quizzes'
import { bootstrapChallenges } from './challenges'
import { bootstrapAchievements } from './achievements'
import { BOOTSTRAP_SNIPPETS } from './snippets'
import { createBootstrapValidator } from './validators'

export const bootstrapTrack: TrackModule = {
  id: BOOTSTRAP_TECH_ID,
  name: 'Bootstrap',
  glyph: 'B',
  description: 'Responsive layouts and components with a utility-first framework.',
  availability: 'available',
  tint: '#8b5cf6',
  language: {
    id: 'html',
    displayName: 'HTML & Bootstrap',
    fileExtension: '.html',
    editorLanguageId: 'html',
    defaultFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Bootstrap Practice</title>
</head>
<body>
  <div class="container my-4">
    <h1 class="text-primary">Hello, Bootstrap!</h1>
  </div>
</body>
</html>`,
      },
    ],
  },
  capabilities: ['lessons', 'quizzes', 'practice', 'preview', 'diagnostics', 'snippets'],
  groups: bootstrapGroups,
  topics: bootstrapTopics,
  lessons: Object.fromEntries(bootstrapLessons.map((l) => [l.topicId, l])),
  quizzes: Object.fromEntries(bootstrapQuizzes.map((q) => [q.topicId, q])),
  challenges: bootstrapChallenges,
  achievements: bootstrapAchievements,
  snippets: BOOTSTRAP_SNIPPETS,
  previewStylesheets: [
    () => import('./vendor/bootstrap.min.css?raw').then((m) => m.default),
  ],
  validatorFactory: (challenge) => createBootstrapValidator(challenge.requirements),
}
