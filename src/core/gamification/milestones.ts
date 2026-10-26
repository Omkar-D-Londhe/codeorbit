import type { CodeOrbitState } from '../../state/types'
import { computeXp } from './xp'
import { evaluateAchievements } from './achievements'

export interface MilestoneEvent {
  id: string
  title: string
  message: string
  kind: 'info' | 'success'
}

/**
 * Detects newly-true milestone events and rank progressions between previous and next state.
 * Triggers only on genuine newly-observed transitions; silent on backfilled items and initial loads.
 */
export function detectMilestoneEvents(
  prevState: CodeOrbitState,
  nextState: CodeOrbitState
): MilestoneEvent[] {
  // If gamification is disabled, emit nothing
  if (nextState.settings.gamificationEnabled === false) {
    return []
  }

  const events: MilestoneEvent[] = []

  // 1. "First Blood" (Catalog 8.4): First ever passing practice check
  const prevPassedCount = Object.values(prevState.challenges ?? {}).filter((c) => c?.completed).length
  const nextPassedCount = Object.values(nextState.challenges ?? {}).filter((c) => c?.completed).length
  if (prevPassedCount === 0 && nextPassedCount >= 1) {
    events.push({
      id: 'milestone-first-blood',
      title: 'First Blood',
      message: 'First Blood: Passed your very first practice challenge!',
      kind: 'success',
    })
  }

  // 2. Newly earned achievements (only if not backfilled and not previously in badges)
  const prevAchievements = new Set(
    evaluateAchievements(prevState)
      .filter((a) => a.earned)
      .map((a) => a.id)
  )
  const nextEvaluated = evaluateAchievements(nextState)

  for (const a of nextEvaluated) {
    if (a.earned && !prevAchievements.has(a.id)) {
      // Check if this badge is backfilled in nextState
      const badgeRec = nextState.badges?.[a.id]
      if (badgeRec && badgeRec.backfilled) {
        continue // silent for backfilled
      }
      events.push({
        id: `milestone-badge-${a.id}`,
        title: a.title,
        message: `Achievement Unlocked: ${a.title}`,
        kind: 'success',
      })
    }
  }

  // 3. Rank Progression Toast (Catalog 8.7)
  const prevLevel = computeXp(prevState).level
  const nextLevel = computeXp(nextState).level
  if (nextLevel > prevLevel) {
    events.push({
      id: `milestone-rank-level-${nextLevel}`,
      title: `Level ${nextLevel}`,
      message: `Rank Advanced: Reached Level ${nextLevel}!`,
      kind: 'success',
    })
  }

  return events
}
