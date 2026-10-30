import { challenges, challengesForTopic } from '../data/challenges'
import { getQuiz } from '../data/quizzes'
import { getTopic, topicsFor } from '../data/curriculum'
import { defaultTrackId } from '../core/content/registry'
import type { Topic } from '../data/types'
import { isPass, isPerfect } from './quiz'
import type { CodeOrbitState } from '../state/types'

export type TopicStatus = 'not-started' | 'in-progress' | 'completed' | 'mastered'

export interface TopicProgress {
  lessonDone: boolean
  quizPassed: boolean
  quizPerfect: boolean
  practiceDone: boolean
  /** True if any challenge of the topic had its reference solution revealed before completion. */
  usedSolution: boolean
  touched: boolean
  /** Components finished: lesson, quiz passed, practice done (0–3). */
  parts: number
  partsTotal: number
  status: TopicStatus
}

/**
 * Progress rules (documented in docs/DECISIONS.md D-018):
 *  - lesson: learner marks the lesson complete
 *  - quiz: best score ≥ 2/3 correct
 *  - practice: every requirement of the topic's challenge(s) passed in a Check
 *  - touched: any real activity recorded (complete lesson, quiz attempt/session, edited draft, check)
 *  - in-progress: touched but not all three parts done
 *  - completed: all three parts done
 *  - mastered: completed + perfect quiz best + practice finished without revealing the solution first
 */
export function topicProgress(state: CodeOrbitState, topic: Topic): TopicProgress {
  const rec = state.topics[topic.id]
  const lessonDone = rec?.lessonComplete === true
  const quizPassed = rec?.quizBest ? isPass(rec.quizBest) : false
  const quizPerfect = rec?.quizBest ? isPerfect(rec.quizBest) : false
  const chs = challengesForTopic(topic.id)
  const primaryCh = chs[0]
  const primaryRec = primaryCh ? state.challenges[primaryCh.id] : undefined
  const practiceDone = chs.length > 0 && (primaryRec?.completed === true || chs.every((c) => state.challenges[c.id]?.completed === true))
  const usedSolution = primaryRec ? primaryRec.solutionRevealed && !primaryRec.completedWithoutSolution : false
  const draftEdited = chs.some((c) => {
    const d = state.drafts?.[c.id]
    return d !== undefined && d !== c.starterCode
  })
  const challengeActivity = chs.some((c) => (state.challenges?.[c.id]?.attempts ?? 0) > 0)
  const sess = state.quizSessions?.[topic.id]
  const quizActivity = (rec?.quizAttempts ?? 0) > 0 || (sess ? sess.answers.some((a) => a !== null) || sess.skipped.some(Boolean) : false)
  const touched = lessonDone || quizActivity || draftEdited || challengeActivity

  const hasQuiz = !!getQuiz(topic.id)
  const partsTotal = 1 + (hasQuiz ? 1 : 0) + (chs.length > 0 ? 1 : 0)
  const parts = (lessonDone ? 1 : 0) + (hasQuiz && quizPassed ? 1 : 0) + (practiceDone ? 1 : 0)
  const allDone = parts === partsTotal
  let status: TopicStatus = 'not-started'
  if (allDone) status = quizPerfect && primaryRec?.completedWithoutSolution === true ? 'mastered' : 'completed'
  else if (touched) status = 'in-progress'
  return { lessonDone, quizPassed, quizPerfect, practiceDone, usedSolution, touched, parts, partsTotal, status }
}

export interface TrackProgress {
  totalTopics: number
  completedTopics: number
  masteredTopics: number
  inProgressTopics: number
  parts: number
  partsTotal: number
}

export function trackProgress(state: CodeOrbitState, technologyId: string): TrackProgress {
  const ts = topicsFor(technologyId)
  const ps = ts.map((t) => topicProgress(state, t))
  return {
    totalTopics: ts.length,
    completedTopics: ps.filter((p) => p.status === 'completed' || p.status === 'mastered').length,
    masteredTopics: ps.filter((p) => p.status === 'mastered').length,
    inProgressTopics: ps.filter((p) => p.status === 'in-progress').length,
    parts: ps.reduce((a, p) => a + p.parts, 0),
    partsTotal: ps.reduce((a, p) => a + p.partsTotal, 0),
  }
}

export interface NextAction {
  kind: 'resume' | 'next' | 'all-complete' | 'start'
  topicId?: string
  reason: string
}

const isDone = (state: CodeOrbitState, t: Topic): boolean => {
  const s = topicProgress(state, t).status
  return s === 'completed' || s === 'mastered'
}

/** Transparent, rule-based recommendation (no hidden scoring). */
export function nextAction(state: CodeOrbitState, technologyId: string = defaultTrackId() ?? ''): NextAction {
  const ts = topicsFor(technologyId)
  const anyActivity = ts.some((t) => topicProgress(state, t).touched)

  // Track-scoped resume target
  const trackLv = state.lastVisitedByTrack?.[technologyId]
  const trackLvTopic = trackLv ? getTopic(trackLv.topicId) : undefined
  if (trackLvTopic && trackLvTopic.technologyId === technologyId && !isDone(state, trackLvTopic)) {
    return { kind: 'resume', topicId: trackLvTopic.id, reason: 'You were last working on this topic in this track and it is not finished yet.' }
  }

  // Fallback to global lastVisited ONLY IF it belongs to this track
  const globalLv = state.lastVisited ? getTopic(state.lastVisited.topicId) : undefined
  if (globalLv && globalLv.technologyId === technologyId && !isDone(state, globalLv)) {
    return { kind: 'resume', topicId: globalLv.id, reason: 'You were last working on this topic and it is not finished yet.' }
  }
  const ready = ts.find((t) => !isDone(state, t) && t.prerequisiteIds.every((p) => { const pt = getTopic(p); return pt ? isDone(state, pt) : true }))
  if (ready) {
    const unmet = ready.prerequisiteIds.length
    return {
      kind: anyActivity ? 'next' : 'start',
      topicId: ready.id,
      reason: anyActivity
        ? unmet === 0 ? 'The first topic you have not completed.' : 'Its prerequisites are complete.'
        : 'The first topic in the track.',
    }
  }
  const firstOpen = ts.find((t) => !isDone(state, t))
  if (firstOpen) return { kind: 'next', topicId: firstOpen.id, reason: 'The earliest topic you have not completed.' }
  return { kind: 'all-complete', reason: 'Every HTML topic is complete.' }
}

export const openErrorCount = (state: CodeOrbitState): number => state.errorNotebook.filter((e) => e.status === 'open').length

export const knownChallengeIds = new Set(challenges.map((c) => c.id))
