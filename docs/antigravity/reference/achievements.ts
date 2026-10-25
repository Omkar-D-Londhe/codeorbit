import { challenges } from '../data/challenges'
import { topics } from '../data/curriculum'
import { topicProgress } from './progress'
import { streakInfo } from './streak'
import type { CodeOrbitState } from '../state/types'

export interface Achievement {
  id: string
  title: string
  /** The exact rule, in words. Badge names reflect real completion rules. */
  rule: string
  earned: boolean
  /** Progress toward the rule, when it is countable. */
  progress?: { current: number; total: number }
}

const doneStatus = (state: CodeOrbitState, topicId: string): boolean => {
  const t = topics.find((x) => x.id === topicId)
  if (!t) return false
  const s = topicProgress(state, t).status
  return s === 'completed' || s === 'mastered'
}

const count = (items: boolean[]): { current: number; total: number } => ({ current: items.filter(Boolean).length, total: items.length })

/**
 * Achievements are DERIVED from saved state on every render. Nothing is stored, so they cannot drift
 * from real evidence. No earned-date is claimed because none is recorded.
 */
export function computeAchievements(state: CodeOrbitState, todayKey: string): Achievement[] {
  const completedChallenges = challenges.filter((c) => state.challenges[c.id]?.completed)
  const foundations = ['html-structure', 'elements-attributes', 'headings-paragraphs']
  const foundationsP = count(foundations.map((id) => doneStatus(state, id)))
  const allTopicsP = count(topics.map((t) => doneStatus(state, t.id)))
  const chOf = (topicId: string) => challenges.find((c) => c.topicId === topicId)!
  const challengeDone = (topicId: string) => state.challenges[chOf(topicId).id]?.completed === true
  const independent = challenges.filter((c) => {
    const r = state.challenges[c.id]
    return r?.completed && r.completedWithoutSolution && r.hintsRevealed === 0
  })
  const understood = state.errorNotebook.filter((e) => e.status === 'understood')
  const streak = streakInfo(state.activityDays, todayKey)
  const mastered = topics.filter((t) => topicProgress(state, t).status === 'mastered')

  const list: Array<Omit<Achievement, 'earned'> & { earned?: boolean }> = [
    { id: 'first-challenge', title: 'First Challenge Completed', rule: 'Pass every requirement of any practice challenge.', earned: completedChallenges.length >= 1 },
    { id: 'html-foundations', title: 'HTML Foundations', rule: 'Complete Document structure, Elements and attributes, and Headings and paragraphs (lesson, quiz pass and practice).', progress: foundationsP, earned: foundationsP.current === foundationsP.total },
    { id: 'semantic-structure', title: 'Semantic Structure', rule: 'Pass the Semantic page layout challenge.', earned: challengeDone('semantic-layout') },
    { id: 'accessible-images', title: 'Accessible Images', rule: 'Pass the Images and alt text challenge.', earned: challengeDone('images') },
    { id: 'form-builder', title: 'Form Builder', rule: 'Pass the Forms and inputs challenge.', earned: challengeDone('forms') },
    { id: 'independent-solver', title: 'Independent Solver', rule: 'Pass a challenge without using any hint and without revealing the reference solution.', earned: independent.length >= 1 },
    { id: 'revision-completed', title: 'Revision Completed', rule: 'Mark at least one Error Notebook entry as understood.', earned: understood.length >= 1 },
    { id: 'first-mastery', title: 'First Mastery', rule: 'Master any topic: lesson done, perfect quiz score, and practice passed before revealing the solution.', earned: mastered.length >= 1 },
    { id: 'three-day-streak', title: 'Three-Day Streak', rule: 'Do something meaningful (complete a lesson, finish a quiz or run a check) on 3 consecutive calendar days.', progress: { current: Math.min(streak.longest, 3), total: 3 }, earned: streak.longest >= 3 },
    { id: 'html-complete', title: 'HTML Track Complete', rule: 'Complete all 12 HTML topics.', progress: allTopicsP, earned: allTopicsP.current === allTopicsP.total },
  ]
  return list.map((a) => ({ ...a, earned: a.earned === true }))
}
