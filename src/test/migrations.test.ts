import { describe, it, expect } from 'vitest'
import { migrate, migrations, sanitizeState, SCHEMA_VERSION } from '../lib/storage'
import originalV1 from './fixtures/state.v1.original.json'
import referenceV1 from './fixtures/state.v1.reference.json'
import malformedV1 from './fixtures/state.v1.malformed.json'

describe('Schema migrations and fixtures (v1 -> v2 -> v3 -> v4 -> v5 -> v6)', () => {
  it('SCHEMA_VERSION is 6 and migration index 0 is untouched', () => {
    expect(SCHEMA_VERSION).toBe(6)
    expect(migrations.length).toBe(6)

    // Test migration 0 directly with v0 shape
    const v0Obj = { schemaVersion: 0, progress: { 'html-structure': { lessonComplete: true } } }
    const v1Result = migrations[0](v0Obj)
    expect(v1Result.schemaVersion).toBe(1)
    expect(v1Result.topics).toEqual({ 'html-structure': { lessonComplete: true } })
  })

  it('migrates original v1 state into complete v6 state without data loss', () => {
    const migrated = migrate(originalV1 as Record<string, unknown>)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(6)
    expect(migrated!.settings).toBeDefined()
    expect(migrated!.activityDays).toEqual([])
    expect(migrated!.dailyDone).toEqual([])
    expect(migrated!.activity).toEqual([])
    expect(migrated!.streakBest).toBe(0)
    expect(migrated!.sectionBookmarks).toEqual([])
    expect(migrated!.badges).toEqual({})
    expect(migrated!.personalBests).toEqual({})

    // Verify existing v1 fields are completely preserved
    expect(migrated!.topics).toEqual(originalV1.topics)
    const notes = migrated!.notes as Record<string, Record<string, unknown>>
    expect(notes['html-structure'].text).toEqual(originalV1.notes['html-structure'].text)
    expect(notes['html-structure'].format).toBe('markdown')
    expect(migrated!.bookmarks).toEqual(originalV1.bookmarks)

    const { state, repaired } = sanitizeState(migrated!)
    expect(repaired).toBe(false)
    expect(state.schemaVersion).toBe(6)
    expect(state.sectionBookmarks).toEqual([])
    expect(state.badges).toEqual({})
    expect(state.personalBests).toEqual({})
  })

  it('migrates reference-style v1 state, preserving activityDays and dailyDone', () => {
    const migrated = migrate(referenceV1 as Record<string, unknown>)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(6)
    expect(migrated!.activityDays).toEqual(['2026-10-22', '2026-10-23', '2026-10-24'])
    expect(migrated!.dailyDone).toEqual(['2026-10-24'])
    expect(migrated!.streakBest).toBe(3)
    expect(migrated!.sectionBookmarks).toEqual([])
    expect(migrated!.badges).toEqual({})
    expect(migrated!.personalBests).toEqual({})

    const { state, repaired } = sanitizeState(migrated!)
    expect(repaired).toBe(false)
    expect(state.activityDays).toEqual(['2026-10-22', '2026-10-23', '2026-10-24'])
    expect(state.streakBest).toBe(3)
  })

  it('migrates v2 state to v5, initializing challenge history, section bookmarks, and badges', () => {
    const v2State = {
      schemaVersion: 2,
      topics: {},
      challenges: {
        'ch-html-structure': {
          attempts: 2,
          hintsRevealed: 1,
          solutionRevealed: false,
          completed: false,
          completedWithoutSolution: false,
          lastCheck: { passed: 3, total: 5, failedIds: ['doctype', 'title'], at: 1700000000000 },
        },
      },
    }
    const migrated = migrate(v2State)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(6)
    const ch = (migrated!.challenges as Record<string, Record<string, unknown>>)['ch-html-structure']
    expect(ch.history).toEqual([])
    expect(migrated!.sectionBookmarks).toEqual([])
    expect(migrated!.badges).toEqual({})
    expect(migrated!.personalBests).toEqual({})
  })

  it('migrates v3 state to v6, adding empty sectionBookmarks, badges, and personalBests', () => {
    const v3State = {
      schemaVersion: 3,
      topics: { 'html-structure': { lessonComplete: true } },
      challenges: {},
      bookmarks: ['html-structure'],
    }
    const migrated = migrate(v3State)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(6)
    expect(migrated!.sectionBookmarks).toEqual([])
    expect(migrated!.bookmarks).toEqual(['html-structure'])
    expect(migrated!.badges).toEqual({})
    expect(migrated!.personalBests).toEqual({})
  })

  it('migrates v4 state to v6, adding badges and personalBests while preserving sectionBookmarks', () => {
    const v4State = {
      schemaVersion: 4,
      topics: { 'html-structure': { lessonComplete: true } },
      challenges: {},
      bookmarks: ['html-structure'],
      sectionBookmarks: ['html-structure#the-skeleton'],
    }
    const migrated = migrate(v4State)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(6)
    expect(migrated!.sectionBookmarks).toEqual(['html-structure#the-skeleton'])
    expect(migrated!.badges).toEqual({})
    expect(migrated!.personalBests).toEqual({})
  })

  it('preserves existing badges and personalBests when present during v4 to v6 migration', () => {
    const v4StateWithBadges = {
      schemaVersion: 4,
      topics: { 'html-structure': { lessonComplete: true } },
      challenges: {},
      bookmarks: [],
      sectionBookmarks: ['html-structure#the-skeleton'],
      badges: {
        'first-challenge': { firstSeenAt: 1700000000000, backfilled: false },
        'html-foundations': { firstSeenAt: null, backfilled: true },
      },
      personalBests: {
        longestStreak: 5,
        'fastestPass:ch-html-structure': 12000,
      },
    }
    const migrated = migrate(v4StateWithBadges)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(6)
    expect(migrated!.badges).toEqual({
      'first-challenge': { firstSeenAt: 1700000000000, backfilled: false },
      'html-foundations': { firstSeenAt: null, backfilled: true },
    })
    expect(migrated!.personalBests).toEqual({
      longestStreak: 5,
      'fastestPass:ch-html-structure': 12000,
    })
  })

  it('repairs malformed v1 days list and invalid entries', () => {
    const migrated = migrate(malformedV1 as Record<string, unknown>)
    expect(migrated).not.toBeNull()
    const { state, repaired } = sanitizeState(migrated!)
    expect(repaired).toBe(true)
    // Non-dates dropped, duplicates merged, sorted
    expect(state.activityDays).toEqual(['2026-10-22', '2026-10-24'])
    expect(state.dailyDone).toEqual(['2026-10-24'])
  })

  it('refuses states with a newer schema version', () => {
    const newer = { schemaVersion: SCHEMA_VERSION + 1, topics: {} }
    expect(migrate(newer)).toBeNull()
  })
})
