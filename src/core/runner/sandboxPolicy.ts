/**
 * Sandbox policy and static isolation verification for worker scripts.
 * Enforces L-07 and 01 §B4: no DOM, no network, strict CSP.
 */

export const FORBIDDEN_WORKER_GLOBALS = [
  'window',
  'document',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'alert',
  'confirm',
  'prompt',
] as const

export const WORKER_CSP =
  "default-src 'none'; script-src 'self' 'unsafe-eval' blob:; connect-src 'none';"

export interface SandboxCheckResult {
  ok: boolean
  violations: string[]
}

/**
 * Statically checks worker source code to ensure no forbidden DOM/network APIs
 * or unauthorized importScripts calls are present.
 */
export function checkWorkerSandboxPolicy(sourceCode: string): SandboxCheckResult {
  const violations: string[] = []

  // Strip block comments and line comments (without stripping :// in URLs)
  const stripped = sourceCode
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')

  // Check forbidden globals/APIs
  for (const forbidden of FORBIDDEN_WORKER_GLOBALS) {
    // Look for identifier boundaries, e.g. window.xxx, fetch(...), new WebSocket
    const regex = new RegExp(`\\b${forbidden}\\b`, 'g')
    if (regex.test(stripped)) {
      violations.push(`Forbidden worker API reference: "${forbidden}"`)
    }
  }

  // Check unauthorized importScripts
  const importScriptsRegex = /\bimportScripts\s*\(([^)]*)\)/g
  let match: RegExpExecArray | null
  while ((match = importScriptsRegex.exec(stripped)) !== null) {
    const args = match[1]
    if (args && (args.includes('http://') || args.includes('https://'))) {
      violations.push(`Unauthorized external importScripts: "${match[0]}"`)
    }
  }

  return {
    ok: violations.length === 0,
    violations,
  }
}
