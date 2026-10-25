import { challenges } from '../data/challenges'
import type { Challenge } from '../data/types'
import { epochDay } from './streak'

/**
 * Daily challenge: a stable, date-based rule over the curated challenge list in canonical order.
 * It depends only on the LOCAL calendar date of this device, not on progress, so it does not change
 * during the day. It is not synchronised between users or devices.
 */
export function dailyChallengeFor(key: string): Challenge {
  const n = challenges.length
  const i = ((epochDay(key) % n) + n) % n
  return challenges[i]
}
