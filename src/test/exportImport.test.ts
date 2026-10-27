import { describe, it, expect } from 'vitest'
import { buildExport, parseImport } from '../core/storage/exportImport'
import { createDefaultState, SCHEMA_VERSION } from '../lib/storage'
import type { CodeOrbitState } from '../state/types'

describe('Data export and import (14.4)', () => {
  it('buildExport formats JSON with metadata and schema version', () => {
    const s = createDefaultState()
    s.topics['html-structure'] = { lessonComplete: true, quizAttempts: 1 }
    const json = buildExport(s, 1729700000000)
    const parsed = JSON.parse(json)

    expect(parsed.app).toBe('codeorbit')
    expect(parsed.exportVersion).toBe(1)
    expect(parsed.schemaVersion).toBe(SCHEMA_VERSION)
    expect(parsed.exportedAt).toBe(1729700000000)
    expect(parsed.state.topics['html-structure'].lessonComplete).toBe(true)
  })

  it('parseImport validates structure and extracts truthful summary', () => {
    const s = createDefaultState()
    s.topics['html-structure'] = { lessonComplete: true, quizAttempts: 1 }
    s.notes['html-structure'] = { text: 'Some note', format: 'markdown', tags: [], updatedAt: 1729700000000 }
    s.bookmarks = ['html-structure']
    s.activityDays = ['2026-10-24']
    s.challenges['ch-html-structure'] = {
      attempts: 1,
      hintsRevealed: 0,
      solutionRevealed: false,
      completed: true,
      completedWithoutSolution: true
    }

    const exported = buildExport(s)
    const result = parseImport(exported)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.summary.topicsTouched).toBe(1)
      expect(result.summary.notesCount).toBe(1)
      expect(result.summary.bookmarksCount).toBe(1)
      expect(result.summary.activityDaysCount).toBe(1)
      expect(result.summary.challengesCompleted).toBe(1)
    }
  })

  it('rejects invalid JSON, wrong app and oversized files', () => {
    expect(parseImport('not json')).toEqual({ ok: false, error: 'File is not valid JSON' })
    expect(parseImport(JSON.stringify({ app: 'other-app', state: {} }))).toEqual({
      ok: false,
      error: 'File was not created by CodeOrbit'
    })
    expect(parseImport('')).toEqual({ ok: false, error: 'Import file is empty' })
  })

  it('Export -> Reset -> Import restores an identical state (deep equality round-trip)', () => {
    const original: CodeOrbitState = createDefaultState()
    original.settings.userName = 'Orbit Pilot'
    original.settings.pace = 'intensive'
    original.settings.theme = 'aurora'
    original.topics['html-structure'] = { lessonComplete: true, quizAttempts: 2, quizBest: { correct: 3, total: 3 } }
    original.notes['html-structure'] = { text: 'Valid note', format: 'markdown', tags: [], updatedAt: 1729700000000 }
    original.bookmarks = ['html-structure']
    original.bookmarkFolders = [{ id: 'unsorted', name: 'Unsorted', itemIds: ['html-structure'] }]
    original.activityDays = ['2026-10-24', '2026-10-25']
    original.streakBest = 2

    const exported = buildExport(original)
    // Simulate reset
    const reset = createDefaultState()
    expect(reset.topics).toEqual({})

    // Import back
    const imported = parseImport(exported)
    expect(imported.ok).toBe(true)
    if (imported.ok) {
      expect(imported.state).toEqual(original)
    }
  })
})
