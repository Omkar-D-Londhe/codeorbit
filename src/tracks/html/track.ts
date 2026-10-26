import type { TrackModule } from '../../core/content/types'
import { HTML_TECH_ID, groups, topics } from '../../data/curriculum'
import { lessons } from '../../data/lessons'
import { quizzes } from '../../data/quizzes'
import { challenges } from '../../data/challenges'
import { htmlAchievements } from './achievements'

export const htmlTrack: TrackModule = {
  id: HTML_TECH_ID,
  name: 'HTML',
  glyph: '</>',
  description:
    'Structure and meaning for every web page. The complete CodeOrbit track: lessons, knowledge checks and practice challenges.',
  availability: 'available',
  tint: '#9a8bff',
  language: {
    id: HTML_TECH_ID,
    displayName: 'HTML',
    fileExtension: '.html',
    editorLanguageId: HTML_TECH_ID,
    defaultFiles: [
      {
        name: 'index.html',
        language: HTML_TECH_ID,
        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Document</title>\n</head>\n<body>\n</body>\n</html>',
      },
    ],
  },
  capabilities: ['lessons', 'quizzes', 'practice', 'preview', 'diagnostics'],
  groups,
  topics,
  lessons: Object.fromEntries(lessons.map((l) => [l.topicId, l])),
  quizzes: Object.fromEntries(quizzes.map((q) => [q.topicId, q])),
  challenges,
  achievements: htmlAchievements,
}
