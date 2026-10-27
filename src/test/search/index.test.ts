import { describe, it, expect } from 'vitest'
import { buildIndex, searchIndex } from '../../core/search/index'
import { createDefaultState } from '../../lib/storage'
import type { TrackModule } from '../../core/content/types'
import type { Command } from '../../core/search/commands'

describe('search index', () => {
  const dummyTrack = {
    id: 'test-track',
    name: 'Test Track',
    glyph: 'TT',
    description: 'A test track description',
    availability: 'available',
    topics: [
      {
        id: 'topic-1',
        technologyId: 'test-track',
        title: 'HTML Structure and Headings',
        shortTitle: 'Structure',
        description: 'Learn the basic skeleton of pages',
        groupId: 'foundations',
        prerequisiteIds: [],
        tags: ['foundations', 'structure'],
      },
      {
        id: 'topic-2',
        technologyId: 'test-track',
        title: 'Forms and Inputs',
        shortTitle: 'Forms',
        description: 'Input fields and validation',
        groupId: 'forms',
        prerequisiteIds: ['topic-1'],
        tags: ['forms', 'validation'],
      },
    ],
    groups: [
      { id: 'foundations', title: 'Foundations' },
      { id: 'forms', title: 'Forms' },
    ],
  } as unknown as TrackModule

  const dummyCommands: Command[] = [
    {
      id: 'cmd-goto-settings',
      title: 'Open Settings',
      keywords: ['settings', 'preferences', 'theme'],
      group: 'Settings',
      shortcut: 'S',
      enabled: () => true,
      run: () => {},
    },
    {
      id: 'cmd-disabled',
      title: 'Disabled Command',
      keywords: ['disabled'],
      group: 'Data',
      enabled: () => false,
      run: () => {},
    },
  ]

  it('builds search docs across commands, topics, and challenges', () => {
    const state = createDefaultState()
    const index = buildIndex([dummyTrack], state, dummyCommands)

    expect(index.length).toBeGreaterThan(0)

    // Should include enabled commands but exclude disabled commands
    const cmdDoc = index.find((d) => d.id === 'cmd-cmd-goto-settings')
    expect(cmdDoc).toBeDefined()
    expect(cmdDoc?.kind).toBe('command')
    expect(index.find((d) => d.id === 'cmd-cmd-disabled')).toBeUndefined()

    // Should include topics
    const topicDoc = index.find((d) => d.id === 'topic-topic-1')
    expect(topicDoc).toBeDefined()
    expect(topicDoc?.title).toBe('HTML Structure and Headings')
  })

  it('indexes user notes and bookmarks when present', () => {
    const state = {
      ...createDefaultState(),
      notes: {
        'topic-1': {
          text: 'My custom note on page skeleton',
          updatedAt: Date.now(),
        },
      },
      bookmarks: ['topic-2'],
    }

    const index = buildIndex([dummyTrack], state, dummyCommands)
    const noteDoc = index.find((d) => d.id === 'note-topic-1')
    expect(noteDoc).toBeDefined()
    expect(noteDoc?.body).toContain('My custom note on page skeleton')

    const bookmarkDoc = index.find((d) => d.id === 'bookmark-topic-2')
    expect(bookmarkDoc).toBeDefined()
  })

  it('searches index with fuzzy ranking and highlights', () => {
    const state = createDefaultState()
    const index = buildIndex([dummyTrack], state, dummyCommands)

    const results = searchIndex(index, 'forms')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].doc.title).toContain('Forms')
    expect(results[0].titleMatch).toBeDefined()
    expect(results[0].titleMatch?.ranges.length).toBeGreaterThan(0)
  })

  it('caps search results to specified limit', () => {
    const state = createDefaultState()
    const index = buildIndex([dummyTrack], state, dummyCommands)

    const results = searchIndex(index, '', 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })
})
