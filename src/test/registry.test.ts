import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearTracks,
  defaultTrackId,
  getAvailableTracks,
  getTrack,
  getTracks,
  registerTrack,
  unregisterTrack,
} from '../core/content/registry'
import type { TrackModule } from '../core/content/types'

function makeMockTrack(id: string, availability: TrackModule['availability'] = 'available'): TrackModule {
  return {
    id,
    name: `Track ${id.toUpperCase()}`,
    glyph: '</>',
    description: `Description for ${id}`,
    availability,
    tint: '#9a8bff',
    language: {
      id,
      displayName: id.toUpperCase(),
      fileExtension: `.${id}`,
      editorLanguageId: id,
    },
    capabilities: ['lessons', 'quizzes', 'practice'],
    groups: [],
    topics: [],
    lessons: {},
    quizzes: {},
    challenges: [],
  }
}

describe('TrackRegistry', () => {
  beforeEach(() => {
    clearTracks()
  })

  it('registers and retrieves tracks in registration order', () => {
    const trackA = makeMockTrack('track-a')
    const trackB = makeMockTrack('track-b')

    registerTrack(trackA)
    registerTrack(trackB)

    expect(getTrack('track-a')).toBe(trackA)
    expect(getTrack('track-b')).toBe(trackB)
    expect(getTrack('unknown')).toBeUndefined()

    const all = getTracks()
    expect(all).toHaveLength(2)
    expect(all[0].id).toBe('track-a')
    expect(all[1].id).toBe('track-b')
  })

  it('throws an error when registering a duplicate track id', () => {
    const track1 = makeMockTrack('track-x')
    const track2 = makeMockTrack('track-x')

    registerTrack(track1)
    expect(() => registerTrack(track2)).toThrow(/already registered/)
  })

  it('filters available tracks correctly with getAvailableTracks', () => {
    const available1 = makeMockTrack('avail-1', 'available')
    const planned = makeMockTrack('planned-1', 'planned')
    const preview = makeMockTrack('preview-1', 'preview')
    const available2 = makeMockTrack('avail-2', 'available')

    registerTrack(available1)
    registerTrack(planned)
    registerTrack(preview)
    registerTrack(available2)

    const available = getAvailableTracks()
    expect(available).toHaveLength(2)
    expect(available.map((t) => t.id)).toEqual(['avail-1', 'avail-2'])
  })

  it('returns the first available track ID as defaultTrackId', () => {
    expect(defaultTrackId()).toBeUndefined()

    const planned = makeMockTrack('planned-first', 'planned')
    registerTrack(planned)
    expect(defaultTrackId()).toBeUndefined()

    const available = makeMockTrack('avail-first', 'available')
    registerTrack(available)
    expect(defaultTrackId()).toBe('avail-first')
  })

  it('supports unregisterTrack for test manipulation', () => {
    const track = makeMockTrack('temp', 'available')
    registerTrack(track)
    expect(getTrack('temp')).toBeDefined()

    const removed = unregisterTrack('temp')
    expect(removed).toBe(true)
    expect(getTrack('temp')).toBeUndefined()
    expect(defaultTrackId()).toBeUndefined()
  })
})
