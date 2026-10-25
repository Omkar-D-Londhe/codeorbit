export interface Star {
  id: number
  x: number // percentage 0 - 100
  y: number // percentage 0 - 100
  size: number // px 0.8 - 2.2
  opacity: number // 0.25 - 0.90
  twinkle: boolean
  twinkleDelay?: number // seconds
  twinkleDuration?: number // seconds
}

export type StarDensity = 'sparse' | 'normal' | 'dense'

export const DENSITY_COUNTS: Record<StarDensity, number> = {
  sparse: 40,
  normal: 80,
  dense: 140, // hard cap <= 150
}

export const MAX_STARS = 150
export const MAX_TWINKLE = 12

function hashSeed(seed: string | number): number {
  if (typeof seed === 'number') return seed >>> 0
  let h = 2166136261 >>> 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0
  }
  return h
}

function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Pure deterministic star generator.
 * Always produces the exact same stars for a given seed and count/density.
 * Hard-capped at 150 stars and at most 12 twinkling stars.
 */
export function starPositions(
  seed: string | number = 'codeorbit',
  countOrDensity: number | StarDensity = 'normal'
): Star[] {
  const rawCount = typeof countOrDensity === 'number'
    ? countOrDensity
    : (DENSITY_COUNTS[countOrDensity] ?? DENSITY_COUNTS.normal)

  const count = Math.min(Math.max(0, Math.floor(rawCount)), MAX_STARS)
  const rng = mulberry32(hashSeed(seed))
  const stars: Star[] = []
  const maxTwinkle = Math.min(MAX_TWINKLE, Math.floor(count * 0.15))
  let twinkleCount = 0

  for (let i = 0; i < count; i++) {
    const x = Math.round(rng() * 10000) / 100
    const y = Math.round(rng() * 10000) / 100
    const size = Math.round((0.8 + rng() * 1.4) * 10) / 10
    const opacity = Math.round((0.25 + rng() * 0.65) * 100) / 100
    const shouldTwinkle = twinkleCount < maxTwinkle && rng() > 0.4
    if (shouldTwinkle) twinkleCount++

    stars.push({
      id: i,
      x,
      y,
      size,
      opacity,
      twinkle: shouldTwinkle,
      twinkleDelay: shouldTwinkle ? Math.round(rng() * 40) / 10 : undefined,
      twinkleDuration: shouldTwinkle ? Math.round((2 + rng() * 3) * 10) / 10 : undefined,
    })
  }

  return stars
}
