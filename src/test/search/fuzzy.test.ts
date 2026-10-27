import { describe, it, expect } from 'vitest'
import { fuzzy } from '../../core/search/fuzzy'

describe('fuzzy matcher (Catalog 9.2, FC-02)', () => {
  it('handles empty queries and empty texts', () => {
    expect(fuzzy('', 'Document structure')).toEqual({ score: 0, ranges: [] })
    expect(fuzzy('doc', '')).toBeNull()
  })

  it('matches exact subsequences and returns consolidated ranges', () => {
    const res = fuzzy('doc', 'Document structure')
    expect(res).not.toBeNull()
    expect(res?.ranges).toEqual([[0, 3]])
  })

  it('supports case-insensitive matching with case bonus', () => {
    const lowerRes = fuzzy('doc', 'Document')
    const caseRes = fuzzy('Doc', 'Document')
    expect(lowerRes).not.toBeNull()
    expect(caseRes).not.toBeNull()
    expect(caseRes!.score).toBeGreaterThan(lowerRes!.score)
  })

  it('awards bonuses for consecutive characters and word boundaries', () => {
    // "ds" in "Document structure" matches D and s (both word starts)
    const boundaryMatch = fuzzy('ds', 'Document structure')
    // "dc" in "Document structure" matches D and c (c is inside Document)
    const nonBoundaryMatch = fuzzy('dc', 'Document structure')

    expect(boundaryMatch).not.toBeNull()
    expect(nonBoundaryMatch).not.toBeNull()
    expect(boundaryMatch!.score).toBeGreaterThan(nonBoundaryMatch!.score)
  })

  it('returns null when characters are out of order', () => {
    // "struct doc" is out of order in "Document structure"
    expect(fuzzy('structdoc', 'Document structure')).toBeNull()
    expect(fuzzy('ba', 'ab')).toBeNull()
  })

  it('merges multiple separated match ranges correctly', () => {
    // "doc str" in "Document structure"
    const res = fuzzy('doc str', 'Document structure')
    expect(res).not.toBeNull()
    expect(res?.ranges).toEqual([[0, 3], [8, 12]])
  })

  it('handles unicode characters and special punctuation', () => {
    const res = fuzzy('café', 'Welcome to Café de Paris')
    expect(res).not.toBeNull()
    expect(res?.ranges).toHaveLength(1)

    const emojiRes = fuzzy('star', '🌟 Starfield navigation')
    expect(emojiRes).not.toBeNull()
  })

  it('handles very long target strings efficiently', () => {
    const longText = 'a'.repeat(5000) + ' target ' + 'b'.repeat(5000)
    const res = fuzzy('target', longText)
    expect(res).not.toBeNull()
    expect(res?.ranges).toEqual([[5001, 5007]])
  })
})
