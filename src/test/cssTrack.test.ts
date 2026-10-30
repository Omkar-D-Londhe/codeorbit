import { describe, expect, it } from 'vitest'
import { cssTrack } from '../tracks/css/track'
import { getTrack, getTracks } from '../core/content/registry'
import { validateConstellation } from '../core/orbit/constellation/validate'
import { checkRequirements } from '../lib/validators'
import { trackProgress } from '../lib/progress'
import { createDefaultState } from '../lib/storage'
import { CSS_SNIPPETS } from '../tracks/css/snippets'

describe('Stage 22: CSS Track Implementation & Quality Gates', () => {
  it('registers the CSS track as available with truthful capabilities and amber tint', () => {
    const track = getTrack('css')
    expect(track).toBeDefined()
    expect(track?.id).toBe('css')
    expect(track?.name).toBe('CSS')
    expect(track?.glyph).toBe('{ }')
    expect(track?.availability).toBe('available')
    expect(track?.tint).toBe('#f59e0b')
    expect(track?.capabilities).toEqual([
      'lessons',
      'quizzes',
      'practice',
      'preview',
      'diagnostics',
      'snippets',
    ])

    // Honest capabilities: does NOT claim server execution, complexity analysis, or optimisation
    expect(track?.capabilities).not.toContain('execution')
    expect(track?.capabilities).not.toContain('complexity')
    expect(track?.capabilities).not.toContain('optimisation')
  })

  it('verifies prerequisites form a strict directed acyclic graph (DAG) via validateConstellation', () => {
    const issues = validateConstellation({
      topics: cssTrack.topics,
      groups: cssTrack.groups,
    })
    expect(issues).toEqual([])
  })

  it('contains exactly 11 topics and 4 groups spanning CSS layout, box model, and motion', () => {
    expect(cssTrack.topics).toHaveLength(11)
    expect(cssTrack.groups).toHaveLength(4)

    const topicIds = cssTrack.topics.map((t) => t.id)
    const uniqueIds = new Set(topicIds)
    expect(uniqueIds.size).toBe(11)

    // Expected canonical topic IDs
    expect(topicIds).toEqual([
      'selectors',
      'cascade-specificity',
      'pseudo-classes',
      'box-model',
      'colour-typography',
      'float-and-clear',
      'flexbox',
      'grid',
      'positioning',
      'responsive-design',
      'transitions-animations',
    ])
  })

  it('ensures every topic has a complete lesson, a quiz (>= 3 questions), and a challenge', () => {
    for (const topic of cssTrack.topics) {
      // Lesson check
      const lesson = cssTrack.lessons[topic.id]
      expect(lesson, `Lesson missing for topic ${topic.id}`).toBeDefined()
      expect(lesson.sections.length).toBeGreaterThanOrEqual(2)
      expect(lesson.takeaways?.length).toBeGreaterThanOrEqual(3)
      expect(Object.keys(lesson.terms ?? {}).length).toBeGreaterThanOrEqual(1)
      expect(lesson.demos?.length).toBeGreaterThanOrEqual(1)

      // Quiz check
      const quiz = cssTrack.quizzes[topic.id]
      expect(quiz, `Quiz missing for topic ${topic.id}`).toBeDefined()
      expect(quiz.questions.length).toBeGreaterThanOrEqual(3)

      // Challenge check
      const matching = cssTrack.challenges.filter((c) => c.topicId === topic.id)
      expect(matching.length, `Challenge missing for topic ${topic.id}`).toBeGreaterThanOrEqual(1)
      const ch = matching[0]
      expect(ch.hints).toHaveLength(3)
      expect(ch.requirements.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('includes at least 3 intermediate or advanced difficulty challenges', () => {
    const higherDiff = cssTrack.challenges.filter(
      (c) => c.difficulty === 'intermediate' || c.difficulty === 'advanced'
    )
    expect(higherDiff.length).toBeGreaterThanOrEqual(3)
  })

  it('verifies that every challenge reference solution PASSES all requirements', () => {
    for (const ch of cssTrack.challenges) {
      const htmlFile = ch.files?.find((f) => f.name.endsWith('.html'))
      const cssFile = ch.solutionFiles?.find((f) => f.name.endsWith('.css'))
      const htmlCode = htmlFile?.content ?? '<!DOCTYPE html><html><body></body></html>'
      const cssCode = cssFile?.content ?? ch.solutionCode

      const result = checkRequirements(ch.requirements, htmlCode, cssCode)
      expect(
        result.allPassed,
        `Challenge ${ch.id} (${ch.title}) solution failed! Passed: ${result.passed}/${result.total}`
      ).toBe(true)
    }
  })

  it('verifies that every challenge starter code FAILS at least one requirement', () => {
    for (const ch of cssTrack.challenges) {
      const htmlFile = ch.files?.find((f) => f.name.endsWith('.html'))
      const cssFile = ch.files?.find((f) => f.name.endsWith('.css'))
      const htmlCode = htmlFile?.content ?? '<!DOCTYPE html><html><body></body></html>'
      const cssCode = cssFile?.content ?? ch.starterCode

      const result = checkRequirements(ch.requirements, htmlCode, cssCode)
      expect(
        result.allPassed,
        `Challenge ${ch.id} (${ch.title}) starter unexpectedly passed all requirements!`
      ).toBe(false)
    }
  })

  it('provides accessible CSS snippets including border-box, flex-center, and reduced-motion guard', () => {
    expect(CSS_SNIPPETS.length).toBeGreaterThanOrEqual(4)
    const snippetIds = CSS_SNIPPETS.map((s) => s.id)
    expect(snippetIds).toContain('snip-css-border-box')
    expect(snippetIds).toContain('snip-css-flex-center')
    expect(snippetIds).toContain('snip-css-reduced-motion')
  })

  it('maintains independent progress and mastery between HTML and CSS tracks', () => {
    const state = createDefaultState()

    // Complete a CSS topic
    state.topics['selectors'] = { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } }
    state.challenges['ch-css-selectors'] = {
      attempts: 1,
      hintsRevealed: 0,
      solutionRevealed: false,
      completed: true,
      completedWithoutSolution: true,
    }

    const cssProg = trackProgress(state, 'css')
    const htmlProg = trackProgress(state, 'html')

    expect(cssProg.completedTopics).toBe(1)
    expect(cssProg.totalTopics).toBe(11)

    // HTML track progress remains completely unaffected
    expect(htmlProg.completedTopics).toBe(0)
    expect(htmlProg.totalTopics).toBe(13)
  })

  it('confirms both HTML and CSS tracks are available simultaneously in track registry', () => {
    const allTracks = getTracks()
    const available = allTracks.filter((t) => t.availability === 'available')
    const availableIds = available.map((t) => t.id)

    expect(availableIds).toContain('html')
    expect(availableIds).toContain('css')
    expect(available.length).toBeGreaterThanOrEqual(2)
  })
})
