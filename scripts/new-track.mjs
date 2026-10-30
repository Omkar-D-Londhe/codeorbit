#!/usr/bin/env node
/**
 * Track Scaffolding Generator (Stage 21, PLT-12)
 * Usage: node scripts/new-track.mjs <trackId>
 * or: npm run new-track -- <trackId>
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const rawArg = process.argv[2]
if (!rawArg || rawArg.startsWith('-')) {
  console.error('Error: Please provide a valid track ID.')
  console.error('Usage: npm run new-track -- <track-id>')
  process.exit(1)
}

const trackId = rawArg.toLowerCase().trim()
if (!/^[a-z0-9-]+$/.test(trackId)) {
  console.error('Error: Track ID must consist only of lowercase letters, numbers, and hyphens.')
  process.exit(1)
}

const trackName = trackId
  .split('-')
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join(' ')

const trackDir = path.join(rootDir, 'src', 'tracks', trackId)
const testDir = path.join(rootDir, 'src', 'test', 'tracks')
const testFile = path.join(testDir, `${trackId}.test.ts`)

if (fs.existsSync(trackDir) && !process.argv.includes('--force')) {
  console.error(`Error: Track directory already exists at ${path.relative(rootDir, trackDir)}`)
  console.error('Use --force to overwrite.')
  process.exit(1)
}

fs.mkdirSync(trackDir, { recursive: true })
fs.mkdirSync(testDir, { recursive: true })

// 1. curriculum.ts
fs.writeFileSync(
  path.join(trackDir, 'curriculum.ts'),
  `import type { Topic, TopicGroup } from '../../core/content/types'

export const groups: TopicGroup[] = [
  { id: '${trackId}-foundations', title: '${trackName} Foundations' },
]

export const topics: Topic[] = [
  {
    id: '${trackId}-intro',
    technologyId: '${trackId}',
    title: 'Introduction to ${trackName}',
    shortTitle: 'Intro',
    groupId: '${trackId}-foundations',
    description: 'Core syntax and fundamentals of ${trackName}.',
    prerequisiteIds: [],
    tags: ['foundations', '${trackId}'],
  },
]
`
)

// 2. lessons.ts
fs.writeFileSync(
  path.join(trackDir, 'lessons.ts'),
  `import type { Lesson } from '../../core/content/types'

export const lessons: Lesson[] = [
  {
    topicId: '${trackId}-intro',
    title: 'Introduction to ${trackName}',
    sections: [
      {
        id: 'getting-started',
        heading: 'Getting Started',
        body: ['Welcome to the ${trackName} learning track in CodeOrbit.'],
      },
    ],
    takeaways: ['Understand fundamental ${trackName} syntax and structure.'],
  },
]
`
)

// 3. quizzes.ts
fs.writeFileSync(
  path.join(trackDir, 'quizzes.ts'),
  `import type { Quiz } from '../../core/content/types'

export const quizzes: Quiz[] = [
  {
    topicId: '${trackId}-intro',
    title: '${trackName} Knowledge Check',
    questions: [
      {
        id: '${trackId}-q1',
        type: 'choices',
        prompt: 'What is the primary role of ${trackName}?',
        options: ['General computing', 'Styles', 'Markup', 'Database'],
        correct: 0,
        explanation: '${trackName} provides structured logic for software systems.',
      },
    ],
  },
]
`
)

// 4. challenges.ts
fs.writeFileSync(
  path.join(trackDir, 'challenges.ts'),
  `import type { Challenge } from '../../core/content/types'

export const challenges: Challenge[] = [
  {
    id: 'ch-${trackId}-intro',
    topicId: '${trackId}-intro',
    title: 'Your First ${trackName} Program',
    prompt: 'Write a basic ${trackName} program to begin your journey.',
    difficulty: 'beginner',
    starterCode: '// Starter code\\n',
    solutionCode: '// Reference solution\\n',
    solutionExplanation: ['Implements basic starter structure.'],
    hints: [
      'Think about basic syntax requirements.',
      'Check structure and file declaration.',
      'Ensure output matches the prompt specification.',
    ],
    requirements: [
      {
        id: 'syntax-valid',
        description: 'Code contains valid ${trackName} syntax',
        explanation: 'The file must define an entry structure.',
        rule: { kind: 'doctype' }, // Replace with language-specific validator
      },
    ],
  },
]
`
)

// 5. achievements.ts
fs.writeFileSync(
  path.join(trackDir, 'achievements.ts'),
  `import type { AchievementDefinition } from '../../core/gamification/achievements'

export const ${trackId.replace(/-/g, '_')}Achievements: AchievementDefinition[] = [
  {
    id: '${trackId}-first-step',
    title: '${trackName} Explorer',
    description: 'Complete your first lesson in the ${trackName} track.',
    icon: 'star',
    category: 'track',
  },
]
`
)

// 6. snippets.ts
fs.writeFileSync(
  path.join(trackDir, 'snippets.ts'),
  `import type { Snippet } from '../../core/content/types'

export const snippets: Snippet[] = [
  {
    id: '${trackId}-starter',
    title: 'Basic Template',
    code: '// ${trackName} template\\n',
    category: 'Templates',
  },
]
`
)

// 7. track.ts
fs.writeFileSync(
  path.join(trackDir, 'track.ts'),
  `import type { TrackModule } from '../../core/content/types'
import { groups, topics } from './curriculum'
import { lessons } from './lessons'
import { quizzes } from './quizzes'
import { challenges } from './challenges'
import { ${trackId.replace(/-/g, '_')}Achievements } from './achievements'

export const ${trackId.replace(/-/g, '_')}Track: TrackModule = {
  id: '${trackId}',
  name: '${trackName}',
  glyph: '${trackId.slice(0, 2).toUpperCase()}',
  description: 'Learn ${trackName} with interactive lessons, quizzes, and practice exercises.',
  availability: 'preview',
  tint: '#9a8bff',
  language: {
    id: '${trackId}',
    displayName: '${trackName}',
    fileExtension: '.${trackId}',
    editorLanguageId: '${trackId}',
    defaultFiles: [
      {
        name: 'main.${trackId}',
        language: '${trackId}',
        content: '// ${trackName} main\\n',
      },
    ],
  },
  capabilities: ['lessons', 'quizzes', 'practice'],
  groups,
  topics,
  lessons: Object.fromEntries(lessons.map((l) => [l.topicId, l])),
  quizzes: Object.fromEntries(quizzes.map((q) => [q.topicId, q])),
  challenges,
  achievements: ${trackId.replace(/-/g, '_')}Achievements,
}
`
)

// 8. index.ts
fs.writeFileSync(
  path.join(trackDir, 'index.ts'),
  `export { ${trackId.replace(/-/g, '_')}Track } from './track'
`
)

// 9. Failing-until-filled test
fs.writeFileSync(
  testFile,
  `import { describe, it, expect } from 'vitest'
import { ${trackId.replace(/-/g, '_')}Track } from '../../tracks/${trackId}'
import { validateConstellation } from '../../core/orbit/constellation/validate'

describe('${trackName} Track Scaffold Verification', () => {
  it('has valid metadata and module structure', () => {
    expect(${trackId.replace(/-/g, '_')}Track.id).toBe('${trackId}')
    expect(${trackId.replace(/-/g, '_')}Track.name).toBe('${trackName}')
    expect(${trackId.replace(/-/g, '_')}Track.topics.length).toBeGreaterThan(0)
  })

  it('forms a valid DAG with zero constellation issues', () => {
    const issues = validateConstellation({
      topics: ${trackId.replace(/-/g, '_')}Track.topics,
      groups: ${trackId.replace(/-/g, '_')}Track.groups,
    })
    expect(issues).toEqual([])
  })

  // FAILING UNTIL FILLED: Author must define full curriculum and replace placeholder
  it('requires track author to complete curriculum content', () => {
    // Scaffold initial state check: this assertion intentionally fails until
    // author adds at least 2 topics and customizes the placeholder starter
    const isScaffoldPlaceholder =
      ${trackId.replace(/-/g, '_')}Track.topics.length === 1 &&
      ${trackId.replace(/-/g, '_')}Track.topics[0].id === '${trackId}-intro'

    if (isScaffoldPlaceholder) {
      expect.fail(
        'Scaffolded track "${trackId}" requires curriculum completion before production inclusion.'
      )
    }
  })
})
`
)

console.log(`Successfully scaffolded new track "${trackName}" (${trackId})!`)
console.log(`- Track files: ${path.relative(rootDir, trackDir)}`)
console.log(`- Test suite: ${path.relative(rootDir, testFile)}`)
