import { describe, it, expect } from 'vitest'
import { migrate, migrations, sanitizeState, SCHEMA_VERSION } from '../lib/storage'
import originalV1 from './fixtures/state.v1.original.json'
import referenceV1 from './fixtures/state.v1.reference.json'
import malformedV1 from './fixtures/state.v1.malformed.json'
import v6Fixture from './fixtures/state.v6.json'

describe('Schema migrations and fixtures (v1 -> v2 -> v3 -> v4 -> v5 -> v6 -> v7 -> v8)', () => {
  it('SCHEMA_VERSION is 8 and migration index 0 is untouched', () => {
    expect(SCHEMA_VERSION).toBe(8)
    expect(migrations.length).toBe(8)

    // Test migration 0 directly with v0 shape
    const v0Obj = { schemaVersion: 0, progress: { 'html-structure': { lessonComplete: true } } }
    const v1Result = migrations[0](v0Obj)
    expect(v1Result.schemaVersion).toBe(1)
    expect(v1Result.topics).toEqual({ 'html-structure': { lessonComplete: true } })
  })

  it('migrates original v1 state into complete v8 state without data loss', () => {
    const migrated = migrate(originalV1 as Record<string, unknown>)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(8)
    expect(migrated!.settings).toBeDefined()
    expect(migrated!.activityDays).toEqual([])
    expect(migrated!.dailyDone).toEqual([])
    expect(migrated!.activity).toEqual([])
    expect(migrated!.streakBest).toBe(0)
    expect(migrated!.sectionBookmarks).toEqual([])
    expect(migrated!.badges).toEqual({})
    expect(migrated!.personalBests).toEqual({})
    expect(migrated!.timeSpent).toEqual({})
    expect(migrated!.timeSpentSessions).toEqual({})
    expect(migrated!.review).toEqual({})
    expect(migrated!.custom).toEqual({ challenges: [] })

    // Verify existing v1 fields are completely preserved
    expect(migrated!.topics).toEqual(originalV1.topics)
    const notes = migrated!.notes as Record<string, Record<string, unknown>>
    expect(notes['html-structure'].text).toEqual(originalV1.notes['html-structure'].text)
    expect(notes['html-structure'].format).toBe('markdown')
    expect(migrated!.bookmarks).toEqual(originalV1.bookmarks)

    const { state, repaired } = sanitizeState(migrated!)
    expect(repaired).toBe(false)
    expect(state.schemaVersion).toBe(8)
    expect(state.sectionBookmarks).toEqual([])
    expect(state.badges).toEqual({})
    expect(state.personalBests).toEqual({})
    expect(state.timeSpent).toEqual({})
    expect(state.timeSpentSessions).toEqual({})
    expect(state.review).toEqual({})
    expect(state.custom).toEqual({ challenges: [] })
  })

  it('migrates reference-style v1 state, preserving activityDays and dailyDone', () => {
    const migrated = migrate(referenceV1 as Record<string, unknown>)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(8)
    expect(migrated!.activityDays).toEqual(['2026-10-22', '2026-10-23', '2026-10-24'])
    expect(migrated!.dailyDone).toEqual(['2026-10-24'])
    expect(migrated!.streakBest).toBe(3)
    expect(migrated!.sectionBookmarks).toEqual([])
    expect(migrated!.badges).toEqual({})
    expect(migrated!.personalBests).toEqual({})
    expect(migrated!.timeSpent).toEqual({})
    expect(migrated!.review).toEqual({})
    expect(migrated!.custom).toEqual({ challenges: [] })

    const { state, repaired } = sanitizeState(migrated!)
    expect(repaired).toBe(false)
    expect(state.activityDays).toEqual(['2026-10-22', '2026-10-23', '2026-10-24'])
    expect(state.streakBest).toBe(3)
  })

  it('migrates v2 state to v8, initializing challenge history, section bookmarks, and badges', () => {
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
    expect(migrated!.schemaVersion).toBe(8)
    const ch = (migrated!.challenges as Record<string, Record<string, unknown>>)['ch-html-structure']
    expect(ch.history).toEqual([])
    expect(migrated!.sectionBookmarks).toEqual([])
    expect(migrated!.badges).toEqual({})
    expect(migrated!.personalBests).toEqual({})
    expect(migrated!.timeSpent).toEqual({})
    expect(migrated!.review).toEqual({})
    expect(migrated!.custom).toEqual({ challenges: [] })
  })

  it('migrates v3 state to v8, adding empty sectionBookmarks, badges, and personalBests', () => {
    const v3State = {
      schemaVersion: 3,
      topics: { 'html-structure': { lessonComplete: true } },
      challenges: {},
      bookmarks: ['html-structure'],
    }
    const migrated = migrate(v3State)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(8)
    expect(migrated!.sectionBookmarks).toEqual([])
    expect(migrated!.bookmarks).toEqual(['html-structure'])
    expect(migrated!.badges).toEqual({})
    expect(migrated!.personalBests).toEqual({})
    expect(migrated!.timeSpent).toEqual({})
    expect(migrated!.review).toEqual({})
    expect(migrated!.custom).toEqual({ challenges: [] })
  })

  it('migrates v4 state to v8, adding badges and personalBests while preserving sectionBookmarks', () => {
    const v4State = {
      schemaVersion: 4,
      topics: { 'html-structure': { lessonComplete: true } },
      challenges: {},
      bookmarks: ['html-structure'],
      sectionBookmarks: ['html-structure#the-skeleton'],
    }
    const migrated = migrate(v4State)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(8)
    expect(migrated!.sectionBookmarks).toEqual(['html-structure#the-skeleton'])
    expect(migrated!.badges).toEqual({})
    expect(migrated!.personalBests).toEqual({})
    expect(migrated!.timeSpent).toEqual({})
    expect(migrated!.review).toEqual({})
    expect(migrated!.custom).toEqual({ challenges: [] })
  })

  it('preserves existing badges and personalBests when present during v4 to v8 migration', () => {
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
    expect(migrated!.schemaVersion).toBe(8)
    expect(migrated!.badges).toEqual({
      'first-challenge': { firstSeenAt: 1700000000000, backfilled: false },
      'html-foundations': { firstSeenAt: null, backfilled: true },
    })
    expect(migrated!.personalBests).toEqual({
      longestStreak: 5,
      'fastestPass:ch-html-structure': 12000,
    })
    expect(migrated!.timeSpent).toEqual({})
    expect(migrated!.review).toEqual({})
    expect(migrated!.custom).toEqual({ challenges: [] })
  })

  it('migrates v6 state into complete v8 state, preserving notes, bookmarks, folders, and initializing timeSpent, review, custom', () => {
    const migrated = migrate(v6Fixture as Record<string, unknown>)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(8)
    expect(migrated!.timeSpent).toEqual({})
    expect(migrated!.timeSpentSessions).toEqual({})
    expect(migrated!.review).toEqual({})
    expect(migrated!.custom).toEqual({ challenges: [] })
    expect(migrated!.topics).toEqual(v6Fixture.topics)
    expect(migrated!.challenges).toEqual(v6Fixture.challenges)
    expect(migrated!.notes).toEqual(v6Fixture.notes)
    expect(migrated!.bookmarks).toEqual(v6Fixture.bookmarks)
    expect(migrated!.sectionBookmarks).toEqual(v6Fixture.sectionBookmarks)
    expect(migrated!.bookmarkFolders).toEqual(v6Fixture.bookmarkFolders)

    const { state, repaired } = sanitizeState(migrated!)
    expect(repaired).toBe(false)
    expect(state.schemaVersion).toBe(8)
    expect(state.timeSpent).toEqual({})
    expect(state.timeSpentSessions).toEqual({})
    expect(state.review).toEqual({})
    expect(state.custom).toEqual({ challenges: [] })
  })

  it('preserves and sanitizes pre-existing timeSpent and timeSpentSessions during migration to v8', () => {
    const v6WithTime = {
      ...v6Fixture,
      timeSpent: {
        'html-structure': 150.4,
        'elements-attributes': 320,
        invalidNegative: -45,
        invalidNaN: 'not-a-number',
      },
      timeSpentSessions: {
        'html-structure': 2.1,
        'elements-attributes': 4,
        invalidNegative: -1,
      },
    }
    const migrated = migrate(v6WithTime as Record<string, unknown>)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(8)
    expect(migrated!.timeSpent).toEqual({
      'html-structure': 150,
      'elements-attributes': 320,
    })
    expect(migrated!.timeSpentSessions).toEqual({
      'html-structure': 2,
      'elements-attributes': 4,
    })
    expect(migrated!.review).toEqual({})
    expect(migrated!.custom).toEqual({ challenges: [] })

    const { state, repaired } = sanitizeState({
      ...migrated!,
      timeSpent: {
        'html-structure': 150,
        malformed: 'bad',
      },
      timeSpentSessions: {
        'html-structure': 2,
        malformed: -5,
      },
    })
    expect(repaired).toBe(true)
    expect(state.timeSpent).toEqual({ 'html-structure': 150 })
    expect(state.timeSpentSessions).toEqual({ 'html-structure': 2 })
    expect(state.review).toEqual({})
    expect(state.custom).toEqual({ challenges: [] })
  })

  it('migrates v7 state to v8: initializes review and custom while preserving existing timeSpent and analytics', () => {
    const v7State = {
      schemaVersion: 7,
      topics: { 'html-structure': { lessonComplete: true } },
      challenges: {
        'ch-html-structure': {
          attempts: 1,
          hintsRevealed: 0,
          solutionRevealed: false,
          completed: true,
          completedWithoutSolution: true,
        },
      },
      notes: {},
      bookmarks: [],
      sectionBookmarks: [],
      activityDays: ['2026-10-25'],
      dailyDone: [],
      activity: [],
      streakBest: 1,
      badges: {},
      personalBests: {},
      timeSpent: { 'html-structure': 120 },
      timeSpentSessions: { 'html-structure': 3 },
    }
    const migrated = migrate(v7State)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(8)
    expect(migrated!.review).toEqual({})
    expect(migrated!.custom).toEqual({ challenges: [] })
    expect(migrated!.timeSpent).toEqual({ 'html-structure': 120 })
    expect(migrated!.timeSpentSessions).toEqual({ 'html-structure': 3 })
    expect(migrated!.topics).toEqual({ 'html-structure': { lessonComplete: true } })

    const { state, repaired } = sanitizeState(migrated!)
    expect(repaired).toBe(false)
    expect(state.schemaVersion).toBe(8)
    expect(state.review).toEqual({})
    expect(state.custom).toEqual({ challenges: [] })
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
