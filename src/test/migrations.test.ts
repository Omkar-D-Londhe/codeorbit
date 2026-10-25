import { describe, it, expect } from 'vitest'
import { migrate, migrations, sanitizeState, SCHEMA_VERSION } from '../lib/storage'
import originalV1 from './fixtures/state.v1.original.json'
import referenceV1 from './fixtures/state.v1.reference.json'
import malformedV1 from './fixtures/state.v1.malformed.json'

describe('Schema migrations and fixtures (v1 -> v2)', () => {
  it('SCHEMA_VERSION is 2 and migration index 0 is untouched', () => {
    expect(SCHEMA_VERSION).toBe(2)
    expect(migrations.length).toBe(2)

    // Test migration 0 directly with v0 shape
    const v0Obj = { schemaVersion: 0, progress: { 'html-structure': { lessonComplete: true } } }
    const v1Result = migrations[0](v0Obj)
    expect(v1Result.schemaVersion).toBe(1)
    expect(v1Result.topics).toEqual({ 'html-structure': { lessonComplete: true } })
  })

  it('migrates original v1 state into complete v2 state without data loss', () => {
    const migrated = migrate(originalV1 as Record<string, unknown>)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(2)
    expect(migrated!.settings).toBeDefined()
    expect(migrated!.activityDays).toEqual([])
    expect(migrated!.dailyDone).toEqual([])
    expect(migrated!.activity).toEqual([])
    expect(migrated!.streakBest).toBe(0)

    // Verify existing v1 fields are completely preserved
    expect(migrated!.topics).toEqual(originalV1.topics)
    expect(migrated!.challenges).toEqual(originalV1.challenges)
    expect(migrated!.notes).toEqual(originalV1.notes)
    expect(migrated!.bookmarks).toEqual(originalV1.bookmarks)

    const { state, repaired } = sanitizeState(migrated!)
    expect(repaired).toBe(false)
    expect(state.schemaVersion).toBe(2)
  })

  it('migrates reference-style v1 state, preserving activityDays and dailyDone', () => {
    const migrated = migrate(referenceV1 as Record<string, unknown>)
    expect(migrated).not.toBeNull()
    expect(migrated!.schemaVersion).toBe(2)
    expect(migrated!.activityDays).toEqual(['2026-10-22', '2026-10-23', '2026-10-24'])
    expect(migrated!.dailyDone).toEqual(['2026-10-24'])
    expect(migrated!.streakBest).toBe(3)

    const { state, repaired } = sanitizeState(migrated!)
    expect(repaired).toBe(false)
    expect(state.activityDays).toEqual(['2026-10-22', '2026-10-23', '2026-10-24'])
    expect(state.streakBest).toBe(3)
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
    const newer = { schemaVersion: 3, topics: {} }
    expect(migrate(newer)).toBeNull()
  })
})
