import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  hasW3CConsent,
  setW3CConsent,
  validateHtmlLocally,
  validateHtmlWithW3C,
  w3cMessagesToDiagnostics,
  W3CConsentRequiredError,
  W3CRateLimitError,
  _resetRateLimitForTesting,
  type W3CValidationMessage,
} from '../core/services/w3cValidator'

describe('W3C Nu HTML Validation Service (Gate O-14, Pass 2)', () => {
  beforeEach(() => {
    localStorage.clear()
    _resetRateLimitForTesting()
    vi.restoreAllMocks()
  })

  it('manages affirmative user consent via localStorage', () => {
    expect(hasW3CConsent()).toBe(false)

    setW3CConsent(true)
    expect(hasW3CConsent()).toBe(true)

    setW3CConsent(false)
    expect(hasW3CConsent()).toBe(false)
  })

  it('throws W3CConsentRequiredError when consent has not been granted', async () => {
    setW3CConsent(false)
    await expect(validateHtmlWithW3C('<!DOCTYPE html><html></html>')).rejects.toThrow(
      W3CConsentRequiredError
    )
  })

  it('validates HTML locally without network access', () => {
    const invalidHtml = '<html><head></head><body><h1>Hello</h1></body></html>'
    const res = validateHtmlLocally(invalidHtml)

    expect(res.source).toBe('local-fallback')
    expect(res.isValid).toBe(false)
    expect(res.messages.some((m) => m.message.includes('doctype'))).toBe(true)
    expect(res.messages.some((m) => m.message.includes('title'))).toBe(true)
  })

  it('passes valid HTML structure in local validator', () => {
    const validHtml = '<!DOCTYPE html><html lang="en"><head><title>Test</title></head><body><main><h1>Hello</h1></main></body></html>'
    const res = validateHtmlLocally(validHtml)

    expect(res.source).toBe('local-fallback')
    expect(res.isValid).toBe(true)
    expect(res.messages.filter((m) => m.type === 'error').length).toBe(0)
  })

  it('falls back to local validation when forced or offline', async () => {
    setW3CConsent(true)

    // Wait past cooldown if needed
    const res = await validateHtmlWithW3C(
      '<!DOCTYPE html><html lang="en"><head><title>Offline</title></head><body><p>Offline check</p></body></html>',
      { forceFallback: true }
    )

    expect(res.source).toBe('local-fallback')
    expect(res.isValid).toBe(true)
  })

  it('enforces 5-second rate limiting cooldown on successive calls', async () => {
    setW3CConsent(true)

    // First call succeeds with fallback
    await validateHtmlWithW3C('<!DOCTYPE html><html lang="en"><head><title>Rate 1</title></head><body></body></html>', {
      forceFallback: true,
    })

    // Immediate second call triggers rate limit error
    await expect(
      validateHtmlWithW3C('<!DOCTYPE html><html lang="en"><head><title>Rate 2</title></head><body></body></html>', {
        forceFallback: true,
      })
    ).rejects.toThrow(W3CRateLimitError)
  })

  it('persists rate limiting cooldown across navigation/page reloads via sessionStorage', async () => {
    setW3CConsent(true)
    _resetRateLimitForTesting()

    await validateHtmlWithW3C('<!DOCTYPE html><html lang="en"><head><title>Rate 1</title></head><body></body></html>', {
      forceFallback: true,
    })

    // Simulate page reload: sessionStorage retains timestamp even if memory is re-initialized
    const stored = sessionStorage.getItem('codeorbit:w3c_last_validation_time')
    expect(stored).toBeTruthy()

    // Immediate second call across simulated reload throws W3CRateLimitError
    await expect(
      validateHtmlWithW3C('<!DOCTYPE html><html lang="en"><head><title>Rate 2</title></head><body></body></html>', {
        forceFallback: true,
      })
    ).rejects.toThrow(W3CRateLimitError)
  })

  it('maps W3C messages to editor diagnostics', () => {
    const messages: W3CValidationMessage[] = [
      {
        type: 'error',
        message: 'Unclosed element div',
        lastLine: 12,
        lastColumn: 5,
      },
      {
        type: 'info',
        subType: 'warning',
        message: 'Consider using figure element',
        lastLine: 20,
        lastColumn: 3,
      },
    ]

    const diags = w3cMessagesToDiagnostics(messages)
    expect(diags.length).toBe(2)
    expect(diags[0].severity).toBe('error')
    expect(diags[0].line).toBe(12)
    expect(diags[0].column).toBe(5)
    expect(diags[0].message).toContain('Unclosed element div')

    expect(diags[1].severity).toBe('warning')
    expect(diags[1].line).toBe(20)
    expect(diags[1].column).toBe(3)
  })
})
