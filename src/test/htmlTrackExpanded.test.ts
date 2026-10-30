import { describe, expect, it } from 'vitest'
import { htmlTrack } from '../tracks/html/track'
import { topics } from '../data/curriculum'
import { validateConstellation } from '../core/orbit/constellation/validate'
import { computeConstellationLayout } from '../core/orbit/constellation/layout'
import { topicProgress, trackProgress } from '../lib/progress'
import { buildPreviewDocument } from '../lib/preview'
import type { CodeOrbitState } from '../state/types'
import { createDefaultState } from '../lib/storage'

describe('Stage 21: Expanded HTML Track & Platform Verification', () => {
  describe('HTML Track Structure and DAG Verification', () => {
    it('has exactly 13 topics with unique IDs and names', () => {
      expect(htmlTrack.topics).toHaveLength(13)
      const ids = htmlTrack.topics.map((t) => t.id)
      expect(new Set(ids).size).toBe(13)
      expect(ids).toContain('media-elements')
    })

    it('verifies prerequisites form a strict directed acyclic graph (DAG) via validateConstellation', () => {
      const issues = validateConstellation({ topics: htmlTrack.topics, groups: htmlTrack.groups })
      expect(issues).toEqual([])
    })

    it('ensures every one of the 13 topics has a valid lesson, 3+ question quiz, and challenge', () => {
      for (const topic of htmlTrack.topics) {
        // Lesson
        const lesson = htmlTrack.lessons[topic.id]
        expect(lesson, `Lesson missing for ${topic.id}`).toBeDefined()
        expect(lesson.objective.length).toBeGreaterThan(0)
        expect(lesson.sections.length).toBeGreaterThan(0)

        // Quiz
        const quiz = htmlTrack.quizzes[topic.id]
        expect(quiz, `Quiz missing for ${topic.id}`).toBeDefined()
        expect(quiz.questions.length).toBeGreaterThanOrEqual(3)

        // Challenge
        const chs = htmlTrack.challenges.filter((c) => c.topicId === topic.id)
        expect(chs.length, `Challenge missing for ${topic.id}`).toBeGreaterThanOrEqual(1)
        for (const ch of chs) {
          expect(ch.requirements.length).toBeGreaterThanOrEqual(1)
          expect(ch.hints).toHaveLength(3)
          expect(ch.solutionCode.length).toBeGreaterThan(0)
        }
      }
    })

    it('media-elements challenge is flagged with needsMedia: true', () => {
      const mediaCh = htmlTrack.challenges.find((c) => c.id === 'ch-media-elements')
      expect(mediaCh).toBeDefined()
      expect(mediaCh?.needsMedia).toBe(true)
    })
  })

  describe('Constellation Layout for 13-Topic Track', () => {
    it('computes collision-free layout for 13 topics in landscape aspect', () => {
      const layout = computeConstellationLayout(htmlTrack.topics, 'landscape')
      expect(layout.nodes).toHaveLength(13)
      expect(layout.aspect).toBe('landscape')

      // Verify no node-to-node collisions
      for (let i = 0; i < layout.nodes.length; i++) {
        for (let j = i + 1; j < layout.nodes.length; j++) {
          const a = layout.nodes[i]
          const b = layout.nodes[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          // Node diameter + clear gap
          expect(dist).toBeGreaterThanOrEqual(40)
        }
      }

      // Verify edges match declared prerequisites
      const declaredEdgesCount = htmlTrack.topics.reduce((acc, t) => acc + t.prerequisiteIds.length, 0)
      expect(layout.edges).toHaveLength(declaredEdgesCount)
    })

    it('computes collision-free layout for 13 topics in portrait aspect', () => {
      const layout = computeConstellationLayout(htmlTrack.topics, 'portrait')
      expect(layout.nodes).toHaveLength(13)
      expect(layout.aspect).toBe('portrait')

      for (let i = 0; i < layout.nodes.length; i++) {
        for (let j = i + 1; j < layout.nodes.length; j++) {
          const a = layout.nodes[i]
          const b = layout.nodes[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          expect(dist).toBeGreaterThanOrEqual(40)
        }
      }
    })
  })

  describe('Learner Progress Compatibility (Original 12 Topics)', () => {
    it('preserves existing learner progress across original 12 topics after adding the 13th topic', () => {
      // Simulate state where learner has completed the original 12 topics
      const state: CodeOrbitState = {
        ...createDefaultState(),
        topics: {
          'html-structure': { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          'elements-attributes': { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          'headings-paragraphs': { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          'text-semantics': { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          lists: { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          links: { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          images: { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          tables: { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          forms: { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          'semantic-layout': { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          accessibility: { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          'putting-together': { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
        },
        challenges: {
          'ch-html-structure': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
          'ch-elements-attributes': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
          'ch-headings-paragraphs': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
          'ch-text-semantics': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
          'ch-lists': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
          'ch-links': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
          'ch-images': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
          'ch-tables': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
          'ch-forms': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
          'ch-semantic-layout': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
          'ch-accessibility': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
          'ch-putting-together': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true },
        },
      }

      // Check all 12 original topics remain 'mastered'
      const originalTopics = topics.filter((t) => t.id !== 'media-elements')
      expect(originalTopics).toHaveLength(12)
      for (const t of originalTopics) {
        const prog = topicProgress(state, t)
        expect(prog.status, `Topic ${t.id} should remain mastered`).toBe('mastered')
      }

      // Track progress reflects 12 completed out of 13 total
      const tp = trackProgress(state, htmlTrack.id)
      expect(tp.totalTopics).toBe(13)
      expect(tp.completedTopics).toBe(12)
      expect(tp.masteredTopics).toBe(12)

      // The new media-elements topic is cleanly 'not-started'
      const mediaTopic = topics.find((t) => t.id === 'media-elements')!
      expect(topicProgress(state, mediaTopic).status).toBe('not-started')
    })
  })

  describe('Preview CSP Scoping for Media', () => {
    it('omits media-src data: when needsMedia is not specified', () => {
      const doc = buildPreviewDocument('<p>Simple content</p>')
      expect(doc).toContain("default-src 'none';")
      expect(doc).not.toContain('media-src data:')
    })

    it('includes media-src data: only when needsMedia is true', () => {
      const doc = buildPreviewDocument('<audio controls></audio>', { needsMedia: true })
      expect(doc).toContain('media-src data:')
    })
  })
})
