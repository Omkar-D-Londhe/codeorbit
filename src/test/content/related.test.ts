import { describe, it, expect } from 'vitest'
import { getRelatedTopics } from '../../core/content/related'
import type { Topic } from '../../data/types'

describe('getRelatedTopics', () => {
  const sampleTopics: Topic[] = [
    {
      id: 'doc-structure',
      technologyId: 'html',
      title: 'Document Structure',
      shortTitle: 'Structure',
      description: 'Foundations',
      groupId: 'foundations',
      prerequisiteIds: [],
      tags: ['basics', 'document'],
    },
    {
      id: 'elements-attrs',
      technologyId: 'html',
      title: 'Elements and Attributes',
      shortTitle: 'Elements',
      description: 'Tags and attributes',
      groupId: 'foundations',
      prerequisiteIds: ['doc-structure'],
      tags: ['basics', 'tags'],
    },
    {
      id: 'headings-paras',
      technologyId: 'html',
      title: 'Headings and Paragraphs',
      shortTitle: 'Headings',
      description: 'Headings outline',
      groupId: 'foundations',
      prerequisiteIds: ['doc-structure'],
      tags: ['text', 'typography'],
    },
    {
      id: 'lists',
      technologyId: 'html',
      title: 'Lists',
      shortTitle: 'Lists',
      description: 'Lists of items',
      groupId: 'text',
      prerequisiteIds: ['headings-paras'],
      tags: ['text', 'lists'],
    },
    {
      id: 'forms',
      technologyId: 'html',
      title: 'Forms and Inputs',
      shortTitle: 'Forms',
      description: 'Form elements',
      groupId: 'forms',
      prerequisiteIds: ['elements-attrs'],
      tags: ['forms', 'inputs'],
    },
    {
      id: 'advanced-forms',
      technologyId: 'html',
      title: 'Advanced Form Validation',
      shortTitle: 'Adv Forms',
      description: 'Form validation and controls',
      groupId: 'forms',
      prerequisiteIds: ['forms'],
      tags: ['forms', 'validation'],
    },
  ]

  it('returns empty array when no topics provided', () => {
    expect(getRelatedTopics(sampleTopics[0], [])).toEqual([])
  })

  it('identifies direct prerequisites', () => {
    const target = sampleTopics.find((t) => t.id === 'elements-attrs')!
    const related = getRelatedTopics(target, sampleTopics)
    const prereq = related.find((r) => r.topic.id === 'doc-structure')
    expect(prereq).toBeDefined()
    expect(prereq?.reason).toBe('Prerequisite')
    expect(prereq?.relationType).toBe('prerequisite')
  })

  it('identifies dependent topics that require target', () => {
    const target = sampleTopics.find((t) => t.id === 'doc-structure')!
    const related = getRelatedTopics(target, sampleTopics)
    const elementsAttrs = related.find((r) => r.topic.id === 'elements-attrs')
    expect(elementsAttrs).toBeDefined()
    expect(elementsAttrs?.relationType).toBe('dependent')
  })

  it('identifies peer topics from the same group', () => {
    const target = sampleTopics.find((t) => t.id === 'headings-paras')!
    const related = getRelatedTopics(target, sampleTopics)
    // Same group 'foundations': elements-attrs is in foundations (and doc-structure is prerequisite)
    const elementsAttrs = related.find((r) => r.topic.id === 'elements-attrs')
    expect(elementsAttrs).toBeDefined()
    expect(elementsAttrs?.relationType).toBe('group')
  })

  it('identifies tag overlap when neither prereq nor group match', () => {
    const topicA: Topic = {
      id: 'topic-a',
      technologyId: 'web',
      title: 'Topic A',
      shortTitle: 'A',
      description: '',
      groupId: 'group-1',
      prerequisiteIds: [],
      tags: ['special-tag'],
    }
    const topicB: Topic = {
      id: 'topic-b',
      technologyId: 'web',
      title: 'Topic B',
      shortTitle: 'B',
      description: '',
      groupId: 'group-2',
      prerequisiteIds: [],
      tags: ['special-tag'],
    }
    const related = getRelatedTopics(topicA, [topicA, topicB])
    expect(related).toHaveLength(1)
    expect(related[0].topic.id).toBe('topic-b')
    expect(related[0].relationType).toBe('tag')
  })

  it('never includes the target topic itself', () => {
    const target = sampleTopics[0]
    const related = getRelatedTopics(target, sampleTopics)
    expect(related.some((r) => r.topic.id === target.id)).toBe(false)
  })

  it('respects maxCount limit', () => {
    const target = sampleTopics[0]
    const related = getRelatedTopics(target, sampleTopics, 2)
    expect(related.length).toBeLessThanOrEqual(2)
  })
})
