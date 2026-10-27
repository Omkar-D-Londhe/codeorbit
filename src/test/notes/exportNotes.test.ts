import { describe, it, expect } from 'vitest'
import { generateNotesMarkdown, generateBackupJson, formatExportDate } from '../../core/storage/exportNotes'
import type { CodeOrbitState } from '../../state/types'

describe('Notes & Bookmarks Export Utilities', () => {
  it('formats current export date in YYYY-MM-DD format', () => {
    const d = new Date(2026, 9, 27) // October 27, 2026
    expect(formatExportDate(d)).toBe('2026-10-27')
  })

  it('generates Markdown export from notes with titles, tags, and formatting', () => {
    const notes = {
      'html-structure': {
        text: '# My Heading\nImportant notes on HTML structure.',
        format: 'markdown' as const,
        tags: ['html', 'basics'],
        updatedAt: 1729000000000,
      },
      'css-cascade': {
        text: 'Specificity rules:\n1. Inline\n2. IDs\n3. Classes',
        format: 'markdown' as const,
        tags: ['css', 'cascade'],
        updatedAt: 1729000000000,
      },
    }

    const md = generateNotesMarkdown(notes)
    expect(md).toContain('# CodeOrbit Notes Export')
    expect(md).toContain('Total notes: 2')
    expect(md).toContain('## Document structure')
    expect(md).toContain('`#html`')
    expect(md).toContain('`#basics`')
    expect(md).toContain('# My Heading')
    expect(md).toContain('Specificity rules:')
  })

  it('returns empty string when there are no non-empty notes', () => {
    expect(generateNotesMarkdown({})).toBe('')
    expect(generateNotesMarkdown({
      test: { text: '   ', format: 'markdown', tags: [], updatedAt: 123 },
    })).toBe('')
  })

  it('generates comprehensive backup JSON containing notes, bookmarks, and folders', () => {
    const mockState = {
      schemaVersion: 6,
      notes: {
        'html-structure': {
          text: 'Note 1',
          format: 'markdown',
          tags: ['intro'],
          updatedAt: 1000,
        },
      },
      bookmarks: ['html-structure'],
      sectionBookmarks: ['html-structure#head-elements'],
      bookmarkFolders: [
        { id: 'unsorted', name: 'Unsorted', itemIds: ['html-structure', 'html-structure#head-elements'] },
        { id: 'favs', name: 'Favorites', itemIds: [] },
      ],
    } as unknown as CodeOrbitState

    const jsonStr = generateBackupJson(mockState)
    const parsed = JSON.parse(jsonStr)

    expect(parsed.version).toBe(6)
    expect(parsed.exportedAt).toBeDefined()
    expect(parsed.notes['html-structure'].text).toBe('Note 1')
    expect(parsed.notes['html-structure'].tags).toEqual(['intro'])
    expect(parsed.bookmarks).toEqual(['html-structure'])
    expect(parsed.sectionBookmarks).toEqual(['html-structure#head-elements'])
    expect(parsed.bookmarkFolders).toHaveLength(2)
    expect(parsed.bookmarkFolders[0].name).toBe('Unsorted')
  })
})
