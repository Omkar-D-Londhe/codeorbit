/**
 * Client AI Hints Service (Gate O-06, Pass 2).
 * Integrates with the server-side AI proxy with affirmative user consent,
 * rate limiting (5/hr, 20/day), scoring penalties, and static fallback.
 */

export interface AiHintRequest {
  challengeId: string
  title: string
  prompt: string
  code: string
  failedRequirements: string[]
  fallbackHints: string[]
}

export interface AiHintResult {
  hint: string
  source: 'ai-proxy' | 'curriculum-fallback'
  disclaimer: string
}

export class AiConsentRequiredError extends Error {
  constructor() {
    super('AI Hint Expansion requires explicit affirmative consent before transmitting code.')
    this.name = 'AiConsentRequiredError'
  }
}

export class AiRateLimitError extends Error {
  readonly resetTimeMs: number
  constructor(message: string, resetTimeMs: number) {
    super(message)
    this.name = 'AiRateLimitError'
    this.resetTimeMs = resetTimeMs
  }
}

const AI_CONSENT_KEY = 'codeorbit:ai_hints_consent'
const AI_USAGE_KEY = 'codeorbit:ai_hints_usage'
const MAX_HOURLY_HINTS = 5
const MAX_DAILY_HINTS = 20
const ONE_HOUR_MS = 60 * 60 * 1000
const ONE_DAY_MS = 24 * ONE_HOUR_MS

export function hasAiConsent(): boolean {
  try {
    return localStorage.getItem(AI_CONSENT_KEY) === 'granted'
  } catch {
    return false
  }
}

export function setAiConsent(granted: boolean): void {
  try {
    localStorage.setItem(AI_CONSENT_KEY, granted ? 'granted' : 'denied')
  } catch {
    // ignore storage error
  }
}

interface StoredUsage {
  timestamps: number[]
}

function getStoredUsage(): StoredUsage {
  try {
    const raw = localStorage.getItem(AI_USAGE_KEY)
    if (!raw) return { timestamps: [] }
    return JSON.parse(raw) as StoredUsage
  } catch {
    return { timestamps: [] }
  }
}

export function checkAiRateLimit(): {
  allowed: boolean
  remainingHourly: number
  remainingDaily: number
  resetTimeMs: number
} {
  const now = Date.now()
  const { timestamps } = getStoredUsage()

  const hourlyCalls = timestamps.filter((t) => now - t < ONE_HOUR_MS)
  const dailyCalls = timestamps.filter((t) => now - t < ONE_DAY_MS)

  const remainingHourly = Math.max(0, MAX_HOURLY_HINTS - hourlyCalls.length)
  const remainingDaily = Math.max(0, MAX_DAILY_HINTS - dailyCalls.length)

  const allowed = remainingHourly > 0 && remainingDaily > 0
  const oldestHourly = hourlyCalls[0] ?? now
  const resetTimeMs = oldestHourly + ONE_HOUR_MS

  return {
    allowed,
    remainingHourly,
    remainingDaily,
    resetTimeMs,
  }
}

export function recordAiHintUsage(): void {
  const now = Date.now()
  const { timestamps } = getStoredUsage()
  // Keep only timestamps within last 24 hours
  const filtered = timestamps.filter((t) => now - t < ONE_DAY_MS)
  filtered.push(now)
  try {
    localStorage.setItem(AI_USAGE_KEY, JSON.stringify({ timestamps: filtered }))
  } catch {
    // ignore storage error
  }
}

export function _resetAiUsageForTesting(): void {
  try {
    localStorage.removeItem(AI_USAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * Requests an AI hint from the serverless proxy, or falls back to curriculum hints.
 */
export async function fetchAiHint(
  request: AiHintRequest,
  options?: { bypassConsentForTesting?: boolean; mockEndpoint?: string }
): Promise<AiHintResult> {
  const bypass = options?.bypassConsentForTesting ?? false
  if (!bypass && !hasAiConsent()) {
    throw new AiConsentRequiredError()
  }

  const limit = checkAiRateLimit()
  if (!limit.allowed) {
    // When rate limited, fall back to curriculum hints
    const fallbackText =
      request.fallbackHints[0] ||
      `Focus on: ${request.failedRequirements[0] || 'challenge requirements'}.`
    return {
      hint: fallbackText,
      source: 'curriculum-fallback',
      disclaimer: 'Hourly AI rate limit reached. Showing curriculum hint.',
    }
  }

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false
  if (!isOnline && !options?.mockEndpoint) {
    const fallbackText =
      request.fallbackHints[0] ||
      `Focus on: ${request.failedRequirements[0] || 'challenge requirements'}.`
    return {
      hint: fallbackText,
      source: 'curriculum-fallback',
      disclaimer: 'Device is offline. Showing curriculum hint.',
    }
  }

  const endpoint = options?.mockEndpoint || '/api/ai-hints'

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId: request.challengeId,
        title: request.title,
        prompt: request.prompt,
        code: request.code,
        failedRequirements: request.failedRequirements,
      }),
      signal: AbortSignal.timeout(6000),
    })

    if (!res.ok) {
      throw new Error(`Proxy returned HTTP ${res.status}`)
    }

    const data = (await res.json()) as {
      hint?: string
      source?: 'ai-proxy' | 'curriculum-fallback'
      disclaimer?: string
    }

    recordAiHintUsage()

    return {
      hint: data.hint || request.fallbackHints[0] || 'Inspect your requirements.',
      source: data.source || 'ai-proxy',
      disclaimer: data.disclaimer || 'AI-generated hint — verify before applying.',
    }
  } catch (err) {
    // Fallback on network/fetch failure
    recordAiHintUsage()
    const fallbackText =
      request.fallbackHints[0] ||
      `Focus on: ${request.failedRequirements[0] || 'challenge requirements'}.`
    return {
      hint: fallbackText,
      source: 'curriculum-fallback',
      disclaimer: `AI proxy unavailable (${err instanceof Error ? err.message : String(err)}). Showing curriculum hint.`,
    }
  }
}
