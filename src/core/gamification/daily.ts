import type { Challenge } from '../../data/types'
import { epochDay } from './streak'
import type { CodeOrbitState } from '../../state/types'
import { getAvailableTracks } from '../content/registry'
import type { TrackModule } from '../content/types'

/**
 * Returns the global challenge pool across all available tracks in registry order (Soft gate O-10).
 */
export function getDailyPool(tracks: readonly TrackModule[] = getAvailableTracks()): Challenge[] {
  return tracks.flatMap((t) => t.challenges)
}

/**
 * Stable, date-based pick over an injected pool of challenges.
 * Pure and deterministic: depends strictly on calendar dayKey and pool length.
 */
export function dailyChallengeFor(key: string, pool: readonly Challenge[]): Challenge | undefined {
  if (!pool || pool.length === 0) return undefined
  const n = pool.length
  const i = ((epochDay(key) % n) + n) % n
  return pool[i]
}

/**
 * Resolves today's assigned challenge, respecting frozen assignment.
 * If already assigned for dayKey in state.dailyAssigned, returns the frozen challenge.
 * Otherwise picks from the current pool.
 */
export function resolveDailyChallenge(
  state: CodeOrbitState,
  dayKey: string,
  pool: readonly Challenge[]
): { challenge?: Challenge; isFrozen: boolean } {
  const frozenId = state.dailyAssigned?.[dayKey]
  if (frozenId) {
    // Locate the frozen challenge across the pool
    const found = pool.find((c) => c.id === frozenId)
    if (found) {
      return { challenge: found, isFrozen: true }
    }
  }

  // Not frozen or not found: compute pick
  const picked = dailyChallengeFor(dayKey, pool)
  return { challenge: picked, isFrozen: false }
}
