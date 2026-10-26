import { describe, it, expect } from 'vitest'
import { getTopicRelations } from '../../core/orbit/constellation/relationsLive'
import type { Topic } from '../../core/orbit/constellation/types'

describe('Catalog 2.3: Prerequisite Constellation Lines & Relations Text', () => {
  const mockTopics: Topic[] = [
    {
      id: 'intro',
      title: 'Introduction',
      shortTitle: 'Intro',
      groupId: 'basics-group',
      technologyId: 'mock-tech',
      description: 'Intro topic',
      prerequisiteIds: [],
    },
    {
      id: 'basics',
      title: 'Basics',
      shortTitle: 'Basics',
      groupId: 'basics-group',
      technologyId: 'mock-tech',
      description: 'Basics topic',
      prerequisiteIds: ['intro'],
    },
    {
      id: 'advanced',
      title: 'Advanced',
      shortTitle: 'Adv',
      groupId: 'adv-group',
      technologyId: 'mock-tech',
      description: 'Advanced topic',
      prerequisiteIds: ['basics'],
    },
    {
      id: 'standalone',
      title: 'Standalone',
      shortTitle: 'Stand',
      groupId: 'adv-group',
      technologyId: 'mock-tech',
      description: 'Standalone topic',
      prerequisiteIds: [],
    },
  ]

  it('correctly computes prerequisites and dependents for a middle topic', () => {
    const rel = getTopicRelations('basics', mockTopics)
    expect(rel.topic?.id).toBe('basics')
    expect(rel.prerequisites.map((p) => p.id)).toEqual(['intro'])
    expect(rel.dependents.map((d) => d.id)).toEqual(['advanced'])
    expect(rel.liveAnnouncement).toBe('Basics. Requires: Introduction. Unlocks: Advanced.')
  })

  it('correctly computes root topic with dependents only', () => {
    const rel = getTopicRelations('intro', mockTopics)
    expect(rel.prerequisites).toHaveLength(0)
    expect(rel.dependents.map((d) => d.id)).toEqual(['basics'])
    expect(rel.liveAnnouncement).toBe('Introduction. Unlocks: Basics.')
  })

  it('correctly computes terminal topic with prerequisites only', () => {
    const rel = getTopicRelations('advanced', mockTopics)
    expect(rel.prerequisites.map((p) => p.id)).toEqual(['basics'])
    expect(rel.dependents).toHaveLength(0)
    expect(rel.liveAnnouncement).toBe('Advanced. Requires: Basics.')
  })

  it('handles isolated topic with neither prerequisites nor dependents', () => {
    const rel = getTopicRelations('standalone', mockTopics)
    expect(rel.prerequisites).toHaveLength(0)
    expect(rel.dependents).toHaveLength(0)
    expect(rel.liveAnnouncement).toBe('Standalone. No prerequisites required.')
  })

  it('returns empty safe structure for invalid/unknown topicId', () => {
    const rel = getTopicRelations('nonexistent', mockTopics)
    expect(rel.topic).toBeNull()
    expect(rel.prerequisites).toHaveLength(0)
    expect(rel.dependents).toHaveLength(0)
    expect(rel.liveAnnouncement).toBe('')
  })
})
