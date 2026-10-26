import { describe, it, expect } from 'vitest'
import { lessons, getSectionId } from '../data/lessons'

describe('Lesson content integrity and section IDs (Stage 08)', () => {
  it('contains all 12 lessons with valid objectives', () => {
    expect(lessons).toHaveLength(12)
    for (const l of lessons) {
      expect(l.topicId).toBeTruthy()
      expect(l.objective.trim().length).toBeGreaterThan(10)
      expect(l.sections.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('guarantees unique, stable, non-empty section IDs within each lesson', () => {
    for (const l of lessons) {
      const seenIds = new Set<string>()
      l.sections.forEach((s, idx) => {
        const id = getSectionId(s, idx)
        expect(id).toBeTruthy()
        expect(id).toMatch(/^[a-z0-9-]+$/)
        expect(seenIds.has(id)).toBe(false)
        seenIds.add(id)
      })
    }
  })

  it('authoring: all 12 lessons have 3-5 takeaways', () => {
    for (const l of lessons) {
      expect(l.takeaways).toBeDefined()
      expect(Array.isArray(l.takeaways)).toBe(true)
      expect(l.takeaways!.length).toBeGreaterThanOrEqual(3)
      expect(l.takeaways!.length).toBeLessThanOrEqual(5)
      for (const t of l.takeaways!) {
        expect(t.trim().length).toBeGreaterThan(5)
      }
    }
  })

  it('authoring: all 12 lessons define terms with term and definition', () => {
    for (const l of lessons) {
      expect(l.terms).toBeDefined()
      const entries = Object.entries(l.terms!)
      expect(entries.length).toBeGreaterThanOrEqual(2)
      for (const [key, termObj] of entries) {
        expect(key).toMatch(/^[a-zA-Z0-9_-]+$/)
        expect(termObj.term.trim().length).toBeGreaterThan(0)
        expect(termObj.definition.trim().length).toBeGreaterThan(10)
      }
    }
  })

  it('authoring: all 12 lessons have accessibility check notes', () => {
    for (const l of lessons) {
      expect(l.a11yNotes).toBeDefined()
      expect(l.a11yNotes!.length).toBeGreaterThanOrEqual(2)
      for (const note of l.a11yNotes!) {
        expect(note.trim().length).toBeGreaterThan(10)
      }
    }
  })

  it('authoring: at least 3 lessons feature interactive live demos', () => {
    const lessonsWithDemos = lessons.filter((l) => l.demos && l.demos.length > 0)
    expect(lessonsWithDemos.length).toBeGreaterThanOrEqual(3)

    for (const l of lessonsWithDemos) {
      for (const demo of l.demos!) {
        expect(demo.id).toBeTruthy()
        expect(demo.title).toBeTruthy()
        expect(demo.files.length).toBeGreaterThanOrEqual(1)
        expect(demo.files[0].content).toBeTruthy()
      }
    }
  })
})
