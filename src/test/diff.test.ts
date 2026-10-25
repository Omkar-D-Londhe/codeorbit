import { describe, it, expect } from 'vitest'
import { diffLines, MAX_DIFF_LINES } from '../core/learning/diff'

describe('diffLines (6.4)', () => {
  it('returns empty result when both strings are empty', () => {
    const res = diffLines('', '')
    expect(res.lines).toEqual([])
    expect(res.identical).toBe(true)
    expect(res.tooLarge).toBe(false)
  })

  it('marks identical multi-line strings as same with matching line numbers', () => {
    const text = '<h1>Title</h1>\n<p>Paragraph</p>\n<footer>End</footer>'
    const res = diffLines(text, text)
    expect(res.identical).toBe(true)
    expect(res.additions).toBe(0)
    expect(res.deletions).toBe(0)
    expect(res.lines).toHaveLength(3)
    expect(res.lines.every((l) => l.kind === 'same')).toBe(true)
    expect(res.lines[0]).toEqual({
      kind: 'same',
      text: '<h1>Title</h1>',
      aLine: 1,
      bLine: 1,
    })
  })

  it('detects single and multiple line additions', () => {
    const a = '<p>Line 1</p>'
    const b = '<p>Line 1</p>\n<p>Line 2</p>\n<p>Line 3</p>'
    const res = diffLines(a, b)
    expect(res.identical).toBe(false)
    expect(res.additions).toBe(2)
    expect(res.deletions).toBe(0)

    const adds = res.lines.filter((l) => l.kind === 'add')
    expect(adds).toHaveLength(2)
    expect(adds[0].text).toBe('<p>Line 2</p>')
    expect(adds[0].bLine).toBe(2)
    expect(adds[1].text).toBe('<p>Line 3</p>')
    expect(adds[1].bLine).toBe(3)
  })

  it('detects line deletions', () => {
    const a = '<p>Keep</p>\n<p>Delete me</p>'
    const b = '<p>Keep</p>'
    const res = diffLines(a, b)
    expect(res.identical).toBe(false)
    expect(res.additions).toBe(0)
    expect(res.deletions).toBe(1)

    const dels = res.lines.filter((l) => l.kind === 'del')
    expect(dels).toHaveLength(1)
    expect(dels[0].text).toBe('<p>Delete me</p>')
    expect(dels[0].aLine).toBe(2)
  })

  it('detects replacements as paired deletions and additions', () => {
    const a = '<div>old content</div>'
    const b = '<div>new content</div>'
    const res = diffLines(a, b)
    expect(res.additions).toBe(1)
    expect(res.deletions).toBe(1)
    expect(res.identical).toBe(false)
  })

  it('handles input exceeding 2,000 lines gracefully with tooLarge flag', () => {
    const largeDoc = new Array(MAX_DIFF_LINES + 50).fill('<p>line</p>').join('\n')
    const res = diffLines(largeDoc, '<p>other</p>')
    expect(res.tooLarge).toBe(true)
    expect(res.lines).toHaveLength(0)
  })
})
