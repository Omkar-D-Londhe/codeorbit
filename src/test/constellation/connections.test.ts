import { describe, expect, it } from 'vitest'
import { computeConstellationLayout } from '../../core/orbit/constellation/layout'
import { validateConstellation } from '../../core/orbit/constellation/validate'
import { topics as htmlTopics, prerequisiteEdges } from '../../data/curriculum'
import type { Topic } from '../../core/orbit/constellation/types'

describe('constellation connections (Stage 10a, §16)', () => {
  it('has edges matching declared prerequisite edges exactly', () => {
    const layout = computeConstellationLayout(htmlTopics, 'landscape')
    const declaredEdges = prerequisiteEdges

    // Compare edge sets by 'fromId>toId' keys
    const layoutEdgeKeys = layout.edges.map((e) => `${e.fromId}>${e.toId}`).sort()
    const declaredEdgeKeys = declaredEdges.map((e) => `${e.from}>${e.to}`).sort()

    expect(layoutEdgeKeys).toEqual(declaredEdgeKeys)
    expect(layout.edges).toHaveLength(declaredEdges.length)
  })

  it('does NOT create prerequisite edges for mere curriculum order', () => {
    const layout = computeConstellationLayout(htmlTopics, 'landscape')
    const prereqPairs = new Set(layout.edges.map((e) => `${e.fromId}>${e.toId}`))

    // e.g. html-structure is index 0, elements-attributes is index 1.
    // If consecutive topics have no declared prerequisite, no edge must exist.
    for (let i = 0; i < htmlTopics.length - 1; i++) {
      const from = htmlTopics[i]
      const to = htmlTopics[i + 1]
      const isDeclaredPrereq = to.prerequisiteIds?.includes(from.id)
      if (!isDeclaredPrereq) {
        expect(prereqPairs.has(`${from.id}>${to.id}`)).toBe(false)
      }
    }
  })

  it('creates order links strictly for consecutive curriculum pairs', () => {
    const layout = computeConstellationLayout(htmlTopics, 'landscape')
    expect(layout.order).toHaveLength(htmlTopics.length - 1)

    for (let i = 0; i < htmlTopics.length - 1; i++) {
      expect(layout.order[i].fromId).toBe(htmlTopics[i].id)
      expect(layout.order[i].toId).toBe(htmlTopics[i + 1].id)
      expect(layout.order[i].d).toMatch(/^M [0-9.]+ [0-9.]+ Q/)
    }
  })

  it('reports missing prerequisite IDs via validateConstellation', () => {
    const brokenTopics: Topic[] = [
      {
        id: 't1',
        technologyId: 'mock',
        title: 'T1',
        shortTitle: 'T1',
        description: 'D1',
        groupId: 'g1',
        prerequisiteIds: ['non-existent-topic'],
      },
    ]

    const issues = validateConstellation({ topics: brokenTopics })
    expect(issues.some((iss) => iss.kind === 'unknown-prereq')).toBe(true)
  })

  it('detects cyclic dependencies in prerequisites', () => {
    const cyclicTopics: Topic[] = [
      {
        id: 'cycle-a',
        technologyId: 'mock',
        title: 'A',
        shortTitle: 'A',
        description: 'A',
        groupId: 'g1',
        prerequisiteIds: ['cycle-b'],
      },
      {
        id: 'cycle-b',
        technologyId: 'mock',
        title: 'B',
        shortTitle: 'B',
        description: 'B',
        groupId: 'g1',
        prerequisiteIds: ['cycle-a'],
      },
    ]

    const issues = validateConstellation({ topics: cyclicTopics })
    expect(issues.some((iss) => iss.kind === 'cycle')).toBe(true)
  })
})
