/**
 * Quota guard and storage byte estimation (16.4).
 * Soft budget: 4 MiB (4,194,304 bytes).
 */

export const SOFT_BUDGET_BYTES = 4 * 1024 * 1024 // 4 MiB
export const WARN_THRESHOLD_BYTES = Math.round(SOFT_BUDGET_BYTES * 0.8) // 3,355,443 bytes (80%)

export type QuotaLevel = 'ok' | 'warn' | 'full'

export interface QuotaInfo {
  bytes: number
  budget: number
  percent: number
  level: QuotaLevel
  formatted: string
}

/**
 * Accurately estimates storage size in UTF-8 bytes for a given state object.
 */
export function estimateBytes(data: unknown): number {
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data)
    if (!str) return 0
    if (typeof Blob !== 'undefined') {
      return new Blob([str]).size
    }
    // Fallback UTF-8 byte length computation
    return new TextEncoder().encode(str).length
  } catch {
    return 0
  }
}

export function quotaStatus(bytes: number): QuotaLevel {
  if (bytes >= SOFT_BUDGET_BYTES) return 'full'
  if (bytes >= WARN_THRESHOLD_BYTES) return 'warn'
  return 'ok'
}

export function getQuotaInfo(data: unknown): QuotaInfo {
  const bytes = estimateBytes(data)
  const percent = Math.min(100, Math.round((bytes / SOFT_BUDGET_BYTES) * 100))
  const level = quotaStatus(bytes)
  const mbUsed = (bytes / (1024 * 1024)).toFixed(1)
  const mbBudget = (SOFT_BUDGET_BYTES / (1024 * 1024)).toFixed(0)

  return {
    bytes,
    budget: SOFT_BUDGET_BYTES,
    percent,
    level,
    formatted: `${mbUsed} MB of about ${mbBudget} MB`
  }
}
