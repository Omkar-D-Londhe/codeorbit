import { describe, it, expect } from 'vitest'
import {
  calculateReadingMinutes,
  formatEstimatedTime,
  estimateLessonReadingTime,
} from '../lib/readingTime'
import type { Lesson } from '../data/types'

describe('Reading time calculation (4.6, L-05)', () => {
  it('calculates reading minutes at 200 words per minute, rounded up', () => {
    // 100 words -> 0.5 min -> rounds up to 1 min
    const text100 = 'word '.repeat(100)
    expect(calculateReadingMinutes(text100)).toBe(1)

    // 250 words -> 1.25 min -> rounds up to 2 min
    const text250 = 'word '.repeat(250)
    expect(calculateReadingMinutes(text250)).toBe(2)

    // 0 words -> minimum 1 min
    expect(calculateReadingMinutes('')).toBe(1)
  })

  it('adds 1 minute allowance per interactive demo', () => {
    const text100 = 'word '.repeat(100)
    // 0.5 min + 1 demo (1 min) = 1.5 -> 2 min
    expect(calculateReadingMinutes(text100, 1)).toBe(2)

    // 0.5 min + 2 demos (2 min) = 2.5 -> 3 min
    expect(calculateReadingMinutes(text100, 2)).toBe(3)
  })

  it('formats estimated time with truthful estimate labelling (4.6, L-05)', () => {
    expect(formatEstimatedTime(3)).toBe('about 3 min (estimate)')
    expect(formatEstimatedTime(1)).toBe('about 1 min (estimate)')
    // Must never claim to be an exact duration
    expect(formatEstimatedTime(5)).toContain('(estimate)')
    expect(formatEstimatedTime(5)).toMatch(/^about \d+ min \(estimate\)$/)
  })

  it('estimates reading time for a full Lesson object', () => {
    const sampleLesson: Lesson = {
      topicId: 'sample-topic',
      objective: 'Understand how reading time is computed across sections.',
      sections: [
        {
          id: 'sec-1',
          heading: 'First section',
          body: ['First paragraph with some words here.', 'Second paragraph with more words.'],
          code: { label: 'Sample code', code: '<p>Hello world</p>' },
          callout: { kind: 'why', text: 'Important explanation of why this matters.' },
        },
      ],
      takeaways: ['Takeaway one', 'Takeaway two'],
      a11yNotes: ['Accessibility note one'],
    }

    const estimate = estimateLessonReadingTime(sampleLesson)
    expect(estimate).toMatch(/^about \d+ min \(estimate\)$/)
  })

  it('respects authored estimatedMinutes override when provided', () => {
    const lessonWithOverride: Lesson = {
      topicId: 'sample-override',
      objective: 'Test override',
      sections: [],
      estimatedMinutes: 7,
    }

    expect(estimateLessonReadingTime(lessonWithOverride)).toBe('about 7 min (estimate)')
  })
})
