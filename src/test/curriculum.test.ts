import { challenges } from '../data/challenges'
import { groups, topics, prerequisiteEdges, technologies } from '../data/curriculum'
import { lessons } from '../data/lessons'
import { quizzes } from '../data/quizzes'

describe('curriculum data', () => {
  it('has unique, kebab-case, stable topic IDs in canonical order', () => {
    const ids = topics.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/))
    expect(ids[0]).toBe('html-structure')
    expect(ids[ids.length - 1]).toBe('putting-together')
    expect(ids).toHaveLength(12)
  })

  it('only references existing groups and every group has a topic', () => {
    const gids = new Set(groups.map((g) => g.id))
    topics.forEach((t) => expect(gids.has(t.groupId)).toBe(true))
    groups.forEach((g) => expect(topics.some((t) => t.groupId === g.id)).toBe(true))
  })

  it('declares only valid prerequisite edges that point to EARLIER topics (acyclic, no self-edges)', () => {
    const order = new Map(topics.map((t, i) => [t.id, i]))
    prerequisiteEdges.forEach(({ from, to }) => {
      expect(order.has(from)).toBe(true)
      expect(order.has(to)).toBe(true)
      expect(from).not.toBe(to)
      expect(order.get(from)!).toBeLessThan(order.get(to)!)
    })
    topics.forEach((t) => expect(new Set(t.prerequisiteIds).size).toBe(t.prerequisiteIds.length))
  })

  it('does not treat curriculum order as prerequisites (not every topic depends on its predecessor)', () => {
    const chained = topics.slice(1).every((t, i) => t.prerequisiteIds.includes(topics[i].id))
    expect(chained).toBe(false)
  })

  it('gives every topic a lesson, a 3-question quiz and a challenge', () => {
    topics.forEach((t) => {
      expect(lessons.filter((l) => l.topicId === t.id)).toHaveLength(1)
      const quiz = quizzes.find((q) => q.topicId === t.id)
      expect(quiz?.questions.length).toBeGreaterThanOrEqual(3)
      expect(challenges.filter((c) => c.topicId === t.id).length).toBeGreaterThanOrEqual(1)
    })
  })

  it('has well-formed quiz questions', () => {
    quizzes.forEach((quiz) =>
      quiz.questions.forEach((q) => {
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.correctIndex).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex).toBeLessThan(q.options.length)
        expect(q.explanation.length).toBeGreaterThan(10)
      }),
    )
  })

  it('spreads correct answers across more than one position', () => {
    const positions = new Set(quizzes.flatMap((q) => q.questions.map((x) => x.correctIndex)))
    expect(positions.size).toBeGreaterThan(1)
  })

  it('marks only HTML as available, others as planned with no topics', () => {
    expect(technologies.filter((t) => t.status === 'available').map((t) => t.id)).toEqual(['html'])
    technologies.filter((t) => t.status === 'planned').forEach((t) => expect(t.topicIds).toHaveLength(0))
  })
})
