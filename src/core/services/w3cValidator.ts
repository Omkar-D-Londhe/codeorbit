/**
 * Live W3C Nu HTML Validation Service (Gate O-14, Pass 2).
 * Sends HTML markup to https://validator.w3.org/nu/?out=json with explicit user consent,
 * 5-second rate-limiting, and local AST validator fallback.
 */

export interface W3CValidationMessage {
  type: 'error' | 'info' | 'non-document-error'
  subType?: 'warning'
  message: string
  lastLine?: number
  firstLine?: number
  lastColumn?: number
  firstColumn?: number
  extract?: string
  hiliteStart?: number
  hiliteLength?: number
}

export interface W3CValidationResult {
  source: 'w3c-remote' | 'local-fallback'
  messages: W3CValidationMessage[]
  isValid: boolean
  timestamp: number
  error?: string
}

export class W3CConsentRequiredError extends Error {
  constructor() {
    super('W3C HTML Validation requires explicit user consent before transmitting code.')
    this.name = 'W3CConsentRequiredError'
  }
}

export class W3CRateLimitError extends Error {
  readonly cooldownRemainingMs: number
  constructor(remainingMs: number) {
    super(`W3C validation rate limit: please wait ${Math.ceil(remainingMs / 1000)}s before re-validating.`)
    this.name = 'W3CRateLimitError'
    this.cooldownRemainingMs = remainingMs
  }
}

const W3C_CONSENT_KEY = 'codeorbit:w3c_validation_consent'
const W3C_LAST_TIME_KEY = 'codeorbit:w3c_last_validation_time'
const W3C_ENDPOINT = 'https://validator.w3.org/nu/?out=json'
const RATE_LIMIT_COOLDOWN_MS = 5000

let inMemoryLastTime = 0

function getLastValidationTime(): number {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const raw = sessionStorage.getItem(W3C_LAST_TIME_KEY)
      if (raw) {
        const parsed = parseInt(raw, 10)
        if (!Number.isNaN(parsed)) return parsed
      }
    }
  } catch {
    // ignore storage errors
  }
  return inMemoryLastTime
}

function setLastValidationTime(t: number): void {
  inMemoryLastTime = t
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(W3C_LAST_TIME_KEY, String(t))
    }
  } catch {
    // ignore storage errors
  }
}

/** Reset rate limit timer for testing */
export function _resetRateLimitForTesting(): void {
  inMemoryLastTime = 0
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(W3C_LAST_TIME_KEY)
    }
  } catch {
    // ignore
  }
}

/** Checks if the user has given affirmative consent to send code to W3C. */
export function hasW3CConsent(): boolean {
  try {
    return localStorage.getItem(W3C_CONSENT_KEY) === 'granted'
  } catch {
    return false
  }
}

/** Sets or revokes affirmative consent. */
export function setW3CConsent(granted: boolean): void {
  try {
    localStorage.setItem(W3C_CONSENT_KEY, granted ? 'granted' : 'denied')
  } catch {
    // ignore storage error
  }
}

/** Local fallback validator using DOMParser and syntactic checks when offline. */
export function validateHtmlLocally(html: string): W3CValidationResult {
  const messages: W3CValidationMessage[] = []

  // Check doctype
  if (!/^\s*<!doctype\s+html\s*>/i.test(html)) {
    messages.push({
      type: 'error',
      message: 'Start tag seen without seeing a doctype first. Expected "<!DOCTYPE html>".',
      lastLine: 1,
      lastColumn: 1,
    })
  }

  // Check html tag and lang attribute
  if (!/<html[^>]*\blang=["'][a-zA-Z-]+["']/i.test(html)) {
    messages.push({
      type: 'info',
      subType: 'warning',
      message: 'This document appears to be written in English but the html element has no lang attribute.',
      lastLine: 1,
      lastColumn: 1,
    })
  }

  // Check for head and title
  if (/<head[\s>]/i.test(html) && !/<title[\s>]/i.test(html)) {
    messages.push({
      type: 'error',
      message: 'Element "head" is missing a required instance of child element "title".',
      lastLine: 2,
      lastColumn: 1,
    })
  }

  // Check for unclosed / malformed tags with DOMParser
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const parserErrors = doc.querySelectorAll('parsererror')
    if (parserErrors.length > 0) {
      messages.push({
        type: 'error',
        message: parserErrors[0].textContent || 'Malformed HTML syntax error.',
        lastLine: 1,
        lastColumn: 1,
      })
    }
  } catch {
    // ignore parser error
  }

  const isValid = !messages.some((m) => m.type === 'error')

  return {
    source: 'local-fallback',
    messages,
    isValid,
    timestamp: Date.now(),
  }
}

/** Validates HTML code via W3C Nu API or fallback. */
export async function validateHtmlWithW3C(
  html: string,
  options?: { bypassConsentForTesting?: boolean; forceFallback?: boolean }
): Promise<W3CValidationResult> {
  const isTestingBypass = options?.bypassConsentForTesting ?? false
  if (!isTestingBypass && !hasW3CConsent()) {
    throw new W3CConsentRequiredError()
  }

  const now = Date.now()
  const timeSinceLast = now - getLastValidationTime()
  if (timeSinceLast < RATE_LIMIT_COOLDOWN_MS) {
    throw new W3CRateLimitError(RATE_LIMIT_COOLDOWN_MS - timeSinceLast)
  }

  // If offline or forced fallback, use local rules
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false
  if (options?.forceFallback || !isOnline) {
    setLastValidationTime(now)
    return validateHtmlLocally(html)
  }

  try {
    setLastValidationTime(now)
    const response = await fetch(W3C_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'User-Agent': 'CodeOrbit-Validator/1.0',
      },
      body: html,
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      // Server returned 4xx or 5xx, fall back gracefully
      const fallback = validateHtmlLocally(html)
      fallback.error = `W3C Validator returned HTTP ${response.status}. Applied local checks.`
      return fallback
    }

    const data = (await response.json()) as { messages?: W3CValidationMessage[] }
    const messages = data.messages || []
    const isValid = !messages.some((m) => m.type === 'error')

    return {
      source: 'w3c-remote',
      messages,
      isValid,
      timestamp: Date.now(),
    }
  } catch (err) {
    // Network failure, timeout, or CORS restriction: fall back to local validator
    const fallback = validateHtmlLocally(html)
    fallback.error = `Network connection to W3C failed: ${err instanceof Error ? err.message : String(err)}. Applied local checks.`
    return fallback
  }
}

/** Maps W3C validation messages to CodeMirror-compatible editor diagnostics. */
export function w3cMessagesToDiagnostics(messages: W3CValidationMessage[]): Array<{
  from: number
  to: number
  severity: 'error' | 'warning' | 'info'
  message: string
  line: number
  column: number
}> {
  return messages.map((m) => {
    const severity: 'error' | 'warning' | 'info' =
      m.type === 'error' ? 'error' : m.subType === 'warning' ? 'warning' : 'info'
    const line = m.lastLine ?? 1
    const column = m.lastColumn ?? 1

    return {
      from: 0,
      to: 0,
      severity,
      message: m.message,
      line,
      column,
    }
  })
}
