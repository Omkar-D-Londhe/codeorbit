import { describe, it, expect } from 'vitest'
import { migrateV5toV6 } from '../../core/storage/migrations'
import { migrate, sanitizeState, SCHEMA_VERSION } from '../../lib/storage'

describe('Schema v5 to v6 migration (Notes & Bookmark Folders)', () => {
  it('converts plain notes to markdown format and empty tags', () => {
    const v5State = {
      schemaVersion: 5,
      notes: {
        'html-structure': {
          text: 'Remember doctype html',
          updatedAt: 1700000000000,
        },
      },
      bookmarks: ['html-structure'],
      sectionBookmarks: ['html-structure#head'],
    }

    const migrated = migrateV5toV6(v5State)
    expect(migrated.schemaVersion).toBe(6)

    const notes = migrated.notes as Record<string, Record<string, unknown>>
    expect(notes['html-structure']).toBeDefined()
    expect(notes['html-structure'].text).toBe('Remember doctype html')
    expect(notes['html-structure'].format).toBe('markdown')
    expect(notes['html-structure'].tags).toEqual([])
    expect(notes['html-structure'].updatedAt).toBe(1700000000000)

    const folders = migrated.bookmarkFolders as Array<{ id: string; name: string; itemIds: string[] }>
    expect(folders).toBeDefined()
    expect(folders.length).toBeGreaterThanOrEqual(1)
    expect(folders[0].id).toBe('unsorted')
    expect(folders[0].itemIds).toContain('html-structure')
    expect(folders[0].itemIds).toContain('html-structure#head')
  })

  it('is idempotent when run on already-migrated v6 state', () => {
    const v6State = {
      schemaVersion: 6,
      notes: {
        'html-structure': {
          text: '# Structure notes\nImportant concepts',
          format: 'markdown',
          tags: ['basics', 'html'],
          updatedAt: 1700000000000,
        },
      },
      bookmarks: ['html-structure'],
      sectionBookmarks: [],
      bookmarkFolders: [
        { id: 'unsorted', name: 'Unsorted', itemIds: [] },
        { id: 'exam-prep', name: 'Exam Prep', itemIds: ['html-structure'] },
      ],
    }

    const result = migrateV5toV6(v6State)
    const folders = result.bookmarkFolders as Array<{ id: string; name: string; itemIds: string[] }>
    expect(folders.find((f) => f.id === 'exam-prep')?.itemIds).toEqual(['html-structure'])
    const notes = result.notes as Record<string, Record<string, unknown>>
    expect(notes['html-structure'].tags).toEqual(['basics', 'html'])
  })

  it('sanitizes invalid tags, trims overlong notes, and restores default unsorted folder', () => {
    const damagedState = {
      schemaVersion: 5,
      notes: {
        'html-structure': {
          text: 'a'.repeat(25000), // over 20,000 chars
          tags: ['VALID-tag', 'INVALID TAG WITH SPACES!', 'toolongtagtoolongtagtoolongtag', 'good'],
          updatedAt: 1700000000000,
        },
      },
      bookmarks: ['html-structure'],
    }

    const migrated = migrate(damagedState)
    expect(migrated).not.toBeNull()

    const { state, repaired } = sanitizeState(migrated!)
    expect(repaired).toBe(false)
    expect(state.schemaVersion).toBe(SCHEMA_VERSION)

    const note = state.notes['html-structure']
    expect(note.text.length).toBeLessThanOrEqual(20000)
    // Only lowercase valid [a-z0-9-] tags kept
    expect(note.tags).toContain('valid-tag')
    expect(note.tags).toContain('good')
    expect(note.tags).not.toContain('INVALID TAG WITH SPACES!')

    expect(state.bookmarkFolders[0].id).toBe('unsorted')
    expect(state.bookmarkFolders[0].itemIds).toContain('html-structure')
  })
})
