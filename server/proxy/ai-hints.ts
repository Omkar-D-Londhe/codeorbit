/**
 * Server-Side AI Hint Proxy (Gate O-06, Pass 2 & Pass 3 Remediation).
 * Server-enforced rate limiting, CORS restriction, schema validation, and secret isolation.
 *
 * Architecture Note on Rate Limiting:
 * - This implementation uses an in-memory sliding-window store suitable for single-instance Node/serverless runtimes.
 * - In distributed production environments with multiple instances, rate-limit state should be backed by
 *   a distributed key-value store (e.g. Redis/Memcached) to prevent per-instance limit multiplication.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'

export interface AiHintRequestBody {
  challengeId: string
  title: string
  prompt: string
  code: string
  failedRequirements: string[]
}

export interface AiHintResponseBody {
  status: 'ok' | 'fallback' | 'error'
  hint: string
  source: 'ai-proxy' | 'curriculum-fallback'
  model?: string
  disclaimer: string
}

export interface ServerRateLimitEntry {
  hourlyRequests: number[]
  dailyRequests: number[]
}

export interface ProxyConfig {
  maxHourlyRequests: number
  maxDailyRequests: number
  maxConcurrentRequests: number
  maxPayloadBytes: number
  allowedOrigins: string[]
  upstreamTimeoutMs: number
}

export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  maxHourlyRequests: 5,
  maxDailyRequests: 20,
  maxConcurrentRequests: 5,
  maxPayloadBytes: 32 * 1024, // 32 KiB
  allowedOrigins: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  upstreamTimeoutMs: 8000,
}

// In-memory rate limit store: client IP -> timestamps
const ipRateLimits = new Map<string, ServerRateLimitEntry>()
let activeConcurrentRequests = 0

export function _resetServerRateLimitsForTesting(): void {
  ipRateLimits.clear()
  activeConcurrentRequests = 0
}

function getClientIp(req: IncomingMessage): string {
  // Use remoteAddress; avoid spoofable X-Forwarded-For unless explicitly behind trusted reverse proxy
  return req.socket?.remoteAddress || '127.0.0.1'
}

function checkAndRecordRateLimit(
  ip: string,
  config: ProxyConfig
): { allowed: boolean; retryAfterSeconds?: number; reason?: string } {
  const now = Date.now()
  const oneHourAgo = now - 60 * 60 * 1000
  const oneDayAgo = now - 24 * 60 * 60 * 1000

  let entry = ipRateLimits.get(ip)
  if (!entry) {
    entry = { hourlyRequests: [], dailyRequests: [] }
    ipRateLimits.set(ip, entry)
  }

  // Prune expired timestamps
  entry.hourlyRequests = entry.hourlyRequests.filter((ts) => ts > oneHourAgo)
  entry.dailyRequests = entry.dailyRequests.filter((ts) => ts > oneDayAgo)

  if (entry.hourlyRequests.length >= config.maxHourlyRequests) {
    const oldestInHour = entry.hourlyRequests[0]
    const retryAfter = Math.ceil((oldestInHour + 60 * 60 * 1000 - now) / 1000)
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, retryAfter),
      reason: `Hourly rate limit exceeded (${config.maxHourlyRequests}/hour)`,
    }
  }

  if (entry.dailyRequests.length >= config.maxDailyRequests) {
    const oldestInDay = entry.dailyRequests[0]
    const retryAfter = Math.ceil((oldestInDay + 24 * 60 * 60 * 1000 - now) / 1000)
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, retryAfter),
      reason: `Daily rate limit exceeded (${config.maxDailyRequests}/day)`,
    }
  }

  entry.hourlyRequests.push(now)
  entry.dailyRequests.push(now)
  return { allowed: true }
}

export function validateRequestBody(raw: unknown): { valid: boolean; body?: AiHintRequestBody; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Request body must be a non-null JSON object' }
  }

  const b = raw as Record<string, unknown>
  if (typeof b.challengeId !== 'string' || b.challengeId.length === 0 || b.challengeId.length > 64) {
    return { valid: false, error: 'challengeId must be a non-empty string under 64 characters' }
  }
  if (typeof b.title !== 'string' || b.title.length === 0 || b.title.length > 128) {
    return { valid: false, error: 'title must be a non-empty string under 128 characters' }
  }
  if (typeof b.prompt !== 'string' || b.prompt.length > 2000) {
    return { valid: false, error: 'prompt exceeds maximum length (2000 characters)' }
  }
  if (typeof b.code !== 'string' || b.code.length > 10000) {
    return { valid: false, error: 'code exceeds maximum length (10000 characters)' }
  }
  if (!Array.isArray(b.failedRequirements) || b.failedRequirements.length > 20) {
    return { valid: false, error: 'failedRequirements must be an array of at most 20 strings' }
  }
  for (const req of b.failedRequirements) {
    if (typeof req !== 'string' || req.length > 256) {
      return { valid: false, error: 'Individual requirement item must be a string under 256 characters' }
    }
  }

  return { valid: true, body: b as unknown as AiHintRequestBody }
}

export async function handleAiHintRequest(
  req: IncomingMessage,
  res: ServerResponse,
  customConfig?: Partial<ProxyConfig>
): Promise<void> {
  const config: ProxyConfig = { ...DEFAULT_PROXY_CONFIG, ...customConfig }

  // 1. CORS Validation
  const origin = req.headers?.origin as string | undefined
  const allowedOrigins = process.env.AI_HINTS_ALLOWED_ORIGINS
    ? process.env.AI_HINTS_ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : config.allowedOrigins

  let effectiveOrigin = '*'
  if (origin) {
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      effectiveOrigin = origin
    } else {
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Origin not allowed by CORS policy' }))
      return
    }
  }

  res.setHeader('Access-Control-Allow-Origin', effectiveOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }

  // 2. Concurrency Control
  if (activeConcurrentRequests >= config.maxConcurrentRequests) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Retry-After', '2')
    res.end(JSON.stringify({ error: 'AI hint proxy is currently at peak capacity. Please retry shortly.' }))
    return
  }

  // 3. Server-Side Rate Limiting
  const clientIp = getClientIp(req)
  const rateLimit = checkAndRecordRateLimit(clientIp, config)
  if (!rateLimit.allowed) {
    res.statusCode = 429
    res.setHeader('Content-Type', 'application/json')
    if (rateLimit.retryAfterSeconds) {
      res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds))
    }
    res.end(JSON.stringify({
      error: 'Rate limit exceeded',
      message: rateLimit.reason,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    }))
    return
  }

  activeConcurrentRequests++

  try {
    // 4. Read & Validate Body Stream with Size Ceiling
    const chunks: Buffer[] = []
    let totalBytes = 0

    const bodyStr = await new Promise<string>((resolve, reject) => {
      req.on('data', (chunk: Buffer | string) => {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
        totalBytes += buf.length
        if (totalBytes > config.maxPayloadBytes) {
          reject(new Error('PAYLOAD_TOO_LARGE'))
          return
        }
        chunks.push(buf)
      })
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      req.on('error', reject)
    })

    let rawJson: unknown
    try {
      rawJson = JSON.parse(bodyStr)
    } catch {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Invalid JSON payload' }))
      return
    }

    const validation = validateRequestBody(rawJson)
    if (!validation.valid || !validation.body) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: validation.error || 'Invalid request schema' }))
      return
    }

    const body = validation.body
    const apiKey = process.env.AI_HINTS_API_KEY || process.env.GEMINI_API_KEY

    // 5. Offline / Unconfigured Pedagogical Fallback
    if (!apiKey) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      const fallbackResponse: AiHintResponseBody = {
        status: 'fallback',
        hint: `Coach tip for "${body.title}": Focus on addressing the first failing requirement: "${body.failedRequirements[0] || 'check requirements'}". Review the challenge prompt and check variable names.`,
        source: 'curriculum-fallback',
        disclaimer: 'AI proxy not configured on server; generated by pedagogical rule fallback.',
      }
      res.end(JSON.stringify(fallbackResponse))
      return
    }

    // 6. Upstream AI Provider Dispatch with Strict Timeout & Safeguards
    const systemPrompt = `You are an expert coding tutor in CodeOrbit.
The learner is attempting challenge "${body.title}".
Challenge Prompt: ${body.prompt}
Failing Requirements: ${body.failedRequirements.join('; ')}
Learner Code:
${body.code.slice(0, 2000)}

Provide a concise, 1-2 sentence hint pointing them in the right direction without writing the complete solution.`

    const remoteRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { maxOutputTokens: 120, temperature: 0.3 },
        }),
        signal: AbortSignal.timeout(config.upstreamTimeoutMs),
      }
    )

    if (!remoteRes.ok) {
      throw new Error(`Upstream LLM status ${remoteRes.status}`)
    }

    const data = (await remoteRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    const okResponse: AiHintResponseBody = {
      status: 'ok',
      hint: aiText || `Review requirement: ${body.failedRequirements[0]}`,
      source: 'ai-proxy',
      model: 'gemini-1.5-flash',
      disclaimer: 'AI-generated hint — verify before applying.',
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(okResponse))
  } catch (err) {
    if (err instanceof Error && err.message === 'PAYLOAD_TOO_LARGE') {
      res.statusCode = 413
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Payload exceeds 32 KiB maximum limit' }))
      return
    }

    // Safe error fallback without leaking sensitive API credentials or stack traces
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    const errFallback: AiHintResponseBody = {
      status: 'fallback',
      hint: 'Inspect your syntax and failing requirements carefully.',
      source: 'curriculum-fallback',
      disclaimer: 'Upstream AI provider unavailable; returned curriculum fallback.',
    }
    res.end(JSON.stringify(errFallback))
  } finally {
    activeConcurrentRequests--
  }
}
