import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  hasAiConsent,
  setAiConsent,
  checkAiRateLimit,
  recordAiHintUsage,
  fetchAiHint,
  AiConsentRequiredError,
  _resetAiUsageForTesting,
} from '../core/services/aiHints'
import { handleAiHintRequest, _resetServerRateLimitsForTesting } from '../../server/proxy/ai-hints'
import { EventEmitter } from 'node:events'
import type { IncomingMessage, ServerResponse } from 'node:http'

describe('AI-Powered Hint Expansion & Proxy (Gate O-06, Pass 2)', () => {
  beforeEach(() => {
    localStorage.clear()
    _resetAiUsageForTesting()
    _resetServerRateLimitsForTesting()
    vi.restoreAllMocks()
  })

  it('manages affirmative user consent in localStorage', () => {
    expect(hasAiConsent()).toBe(false)

    setAiConsent(true)
    expect(hasAiConsent()).toBe(true)

    setAiConsent(false)
    expect(hasAiConsent()).toBe(false)
  })

  it('throws AiConsentRequiredError when consent is missing', async () => {
    setAiConsent(false)

    await expect(
      fetchAiHint({
        challengeId: 'ch-test',
        title: 'Test',
        prompt: 'Prompt',
        code: 'const x = 1;',
        failedRequirements: ['req-1'],
        fallbackHints: ['Static fallback'],
      })
    ).rejects.toThrow(AiConsentRequiredError)
  })

  it('enforces client rate limits (5 hourly, 20 daily)', () => {
    const initial = checkAiRateLimit()
    expect(initial.allowed).toBe(true)
    expect(initial.remainingHourly).toBe(5)
    expect(initial.remainingDaily).toBe(20)

    for (let i = 0; i < 5; i++) {
      recordAiHintUsage()
    }

    const afterFive = checkAiRateLimit()
    expect(afterFive.allowed).toBe(false)
    expect(afterFive.remainingHourly).toBe(0)
    expect(afterFive.remainingDaily).toBe(15)
  })

  it('gracefully returns curriculum fallback hint when rate limited', async () => {
    setAiConsent(true)

    // Exhaust hourly limit
    for (let i = 0; i < 5; i++) {
      recordAiHintUsage()
    }

    const res = await fetchAiHint({
      challengeId: 'ch-rate',
      title: 'Rate Limit Test',
      prompt: 'Do something',
      code: 'code()',
      failedRequirements: ['Requirement A'],
      fallbackHints: ['Curriculum hint A'],
    })

    expect(res.source).toBe('curriculum-fallback')
    expect(res.hint).toBe('Curriculum hint A')
    expect(res.disclaimer).toContain('rate limit')
  })

  it('server proxy handles requests and returns pedagogical fallback when no API key is set', async () => {
    const req = new EventEmitter() as unknown as IncomingMessage & EventEmitter
    req.method = 'POST'

    const headers: Record<string, string> = {}
    let statusCode = 200
    let body = ''

    const res = {
      setHeader: (name: string, value: string) => {
        headers[name.toLowerCase()] = value
      },
      end: (data?: string) => {
        if (data) body = data
      },
      get statusCode() {
        return statusCode
      },
      set statusCode(val: number) {
        statusCode = val
      },
    } as unknown as ServerResponse

    const promise = handleAiHintRequest(req, res)

    // Emit request payload
    req.emit(
      'data',
      JSON.stringify({
        challengeId: 'ch-proxy',
        title: 'Proxy Test',
        prompt: 'Build a form',
        code: '<form></form>',
        failedRequirements: ['Label required'],
      })
    )
    req.emit('end')

    await promise

    expect(statusCode).toBe(200)
    expect(headers['content-type']).toBe('application/json')
    const parsed = JSON.parse(body)
    expect(parsed.source).toBe('curriculum-fallback')
    expect(parsed.hint).toContain('Proxy Test')
    expect(parsed.disclaimer).toBeDefined()
  })

  it('server proxy enforces server-side rate limits returning HTTP 429', async () => {
    const config = { maxHourlyRequests: 2 }

    const makeCall = async () => {
      const req = new EventEmitter() as unknown as IncomingMessage & EventEmitter
      req.method = 'POST'
      const headers: Record<string, string> = {}
      let statusCode = 200
      let body = ''
      const res = {
        setHeader: (k: string, v: string) => { headers[k.toLowerCase()] = v },
        end: (d?: string) => { if (d) body = d },
        get statusCode() { return statusCode },
        set statusCode(v: number) { statusCode = v },
      } as unknown as ServerResponse

      const promise = handleAiHintRequest(req, res, config)
      req.emit('data', JSON.stringify({
        challengeId: 'c1',
        title: 'T1',
        prompt: 'P1',
        code: 'C1',
        failedRequirements: ['R1'],
      }))
      req.emit('end')
      await promise
      return { statusCode, body, headers }
    }

    const r1 = await makeCall()
    expect(r1.statusCode).toBe(200)

    const r2 = await makeCall()
    expect(r2.statusCode).toBe(200)

    // 3rd call exceeds maxHourlyRequests = 2
    const r3 = await makeCall()
    expect(r3.statusCode).toBe(429)
    expect(r3.headers['retry-after']).toBeDefined()
    expect(r3.body).toContain('Rate limit exceeded')
  })

  it('server proxy rejects unauthorized CORS origins with HTTP 403', async () => {
    const req = new EventEmitter() as unknown as IncomingMessage & EventEmitter
    req.method = 'POST'
    req.headers = { origin: 'https://malicious-attacker.com' }

    let statusCode = 200
    let body = ''
    const res = {
      setHeader: () => {},
      end: (d?: string) => { if (d) body = d },
      get statusCode() { return statusCode },
      set statusCode(v: number) { statusCode = v },
    } as unknown as ServerResponse

    await handleAiHintRequest(req, res)
    expect(statusCode).toBe(403)
    expect(body).toContain('Origin not allowed')
  })

  it('server proxy rejects oversized payload with HTTP 413', async () => {
    const req = new EventEmitter() as unknown as IncomingMessage & EventEmitter
    req.method = 'POST'
    let statusCode = 200
    let body = ''
    const res = {
      setHeader: () => {},
      end: (d?: string) => { if (d) body = d },
      get statusCode() { return statusCode },
      set statusCode(v: number) { statusCode = v },
    } as unknown as ServerResponse

    const promise = handleAiHintRequest(req, res, { maxPayloadBytes: 100 })
    req.emit('data', Buffer.alloc(200, 'x'))
    req.emit('end')

    await promise
    expect(statusCode).toBe(413)
    expect(body).toContain('Payload exceeds')
  })
})
