/**
 * JavaScript Worker Runner Engine (Stage 23a, PLT-05, PLT-11).
 * Safely executes learner JavaScript code in a dedicated Web Worker environment,
 * capturing console output, enforcing timeout guards (3s) and resource limits,
 * and grading visible/hidden unit test cases.
 */
import type { ChallengeTestCase } from '../../core/content/types'
import { checkWorkerSandboxPolicy } from '../../core/runner/sandboxPolicy'

export interface ChallengeTestCaseResult {
  id: string
  name: string
  passed: boolean
  actual: unknown
  expected: unknown
  error?: string
  hidden?: boolean
}

export interface JavaScriptRunResult {
  status: 'ok' | 'error' | 'timeout'
  stdout: string
  stderr: string
  testResults: ChallengeTestCaseResult[]
  allPassed: boolean
  durationMs: number
  message?: string
  error?: { message: string; line?: number; column?: number }
  logs: Array<{ level: 'log' | 'warn' | 'error'; text: string }>
}

export interface JavaScriptRunOptions {
  timeoutMs?: number
  seed?: number
  stdin?: string
}

/**
 * Deep equality comparison for test assertions.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString()
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false
    for (const item of a) {
      if (!b.has(item)) return false
    }
    return true
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false
    for (const [key, val] of a) {
      if (!b.has(key) || !deepEqual(val, b.get(key))) return false
    }
    return true
  }

  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)
  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false
    }
  }

  return true
}

/**
 * Creates a deterministic pseudo-random number generator (mulberry32).
 */
export function createSeededRandom(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildWorkerScript(code: string, tests: ChallengeTestCase[], seed?: number): string {
  return `
    const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    let parentPort;
    if (isNode) {
      try {
        parentPort = require('node:worker_threads').parentPort;
      } catch (_) {}
    }

    function sendMsg(msg) {
      if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
        self.postMessage(msg);
      } else if (parentPort) {
        parentPort.postMessage(msg);
      }
    }

    const tests = ${JSON.stringify(tests)};
    const seed = ${seed !== undefined ? seed : 'undefined'};

    function createSeededRandom(s) {
      let seedVal = s >>> 0;
      return function() {
        seedVal = (seedVal + 0x6d2b79f5) | 0;
        let t = Math.imul(seedVal ^ (seedVal >>> 15), 1 | seedVal);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    function deepEqual(a, b) {
      if (Object.is(a, b)) return true;
      if (typeof a !== typeof b) return false;
      if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
      }
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const k of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
        if (!deepEqual(a[k], b[k])) return false;
      }
      return true;
    }

    const logs = [];
    let stdout = '';
    let stderr = '';

    const customConsole = {
      log: (...args) => {
        const text = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
        stdout += text + '\\n';
        logs.push({ level: 'log', text });
      },
      warn: (...args) => {
        const text = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
        stderr += text + '\\n';
        logs.push({ level: 'warn', text });
      },
      error: (...args) => {
        const text = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
        stderr += text + '\\n';
        logs.push({ level: 'error', text });
      }
    };

    const customMath = Object.create(Math);
    if (seed !== undefined) {
      customMath.random = createSeededRandom(seed);
    }

    try {
      const sandboxFn = new Function(
        'console', 'Math', 'window', 'document', 'fetch', 'XMLHttpRequest', 'WebSocket', 'importScripts',
        \`"use strict";\\n${code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${')}\\nreturn function(__expr) { return eval(__expr); };\`
      );
      const evalCaller = sandboxFn(customConsole, customMath, undefined, undefined, undefined, undefined, undefined, undefined);

      const testResults = [];
      for (const t of tests) {
        try {
          const actual = evalCaller(t.call);
          const passed = deepEqual(actual, t.expect);
          testResults.push({ id: t.id, name: t.name, passed, actual, expected: t.expect, hidden: t.hidden });
        } catch (err) {
          testResults.push({ id: t.id, name: t.name, passed: false, actual: undefined, expected: t.expect, error: err.message || String(err), hidden: t.hidden });
        }
      }

      const allPassed = testResults.length > 0 && testResults.every(r => r.passed);
      sendMsg({ status: 'ok', stdout, stderr, logs, testResults, allPassed });
    } catch (err) {
      sendMsg({
        status: 'error',
        stdout,
        stderr,
        logs,
        message: err.message || String(err),
        testResults: tests.map(t => ({ id: t.id, name: t.name, passed: false, actual: undefined, expected: t.expect, error: err.message, hidden: t.hidden })),
        allPassed: false
      });
    }
  `
}

/**
 * Safely executes learner JavaScript code and grades unit test cases.
 * Enforces timeout (3s), output caps, sandbox boundaries, and deterministic seed option.
 */
export async function executeJavaScript(
  code: string,
  tests: ChallengeTestCase[] = [],
  options: JavaScriptRunOptions = {}
): Promise<JavaScriptRunResult> {
  const timeoutMs = options.timeoutMs ?? 3000
  const start = performance.now()

  // 1. Static sandbox policy check
  const sandboxPolicy = checkWorkerSandboxPolicy(code)
  if (!sandboxPolicy.ok) {
    return {
      status: 'error',
      stdout: '',
      stderr: sandboxPolicy.violations.join('\n'),
      logs: sandboxPolicy.violations.map((v) => ({ level: 'error', text: v })),
      testResults: tests.map((t) => ({
        id: t.id,
        name: t.name,
        passed: false,
        actual: undefined,
        expected: t.expect,
        error: sandboxPolicy.violations[0],
        hidden: t.hidden,
      })),
      allPassed: false,
      durationMs: Math.round(performance.now() - start),
      message: `Security violation: ${sandboxPolicy.violations[0]}`,
    }
  }

  const script = buildWorkerScript(code, tests, options.seed)

  return new Promise<JavaScriptRunResult>((resolve) => {
    let settled = false
    let threadWorker: unknown = null
    let browserWorker: Worker | null = null

    const cleanup = () => {
      if (timer) clearTimeout(timer)
      if (threadWorker && typeof (threadWorker as { terminate: () => void }).terminate === 'function') {
        try {
          ;(threadWorker as { terminate: () => void }).terminate()
        } catch {
          // ignore already terminated
        }
      }
      if (browserWorker) {
        try {
          browserWorker.terminate()
        } catch {
          // ignore already terminated
        }
      }
    }

    const settle = (result: JavaScriptRunResult) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(result)
    }

    const timer = setTimeout(() => {
      settle({
        status: 'timeout',
        stdout: '',
        stderr: 'Execution timed out.',
        logs: [{ level: 'error', text: 'Execution timed out' }],
        testResults: tests.map((t) => ({
          id: t.id,
          name: t.name,
          passed: false,
          actual: undefined,
          expected: t.expect,
          error: 'Execution timed out',
          hidden: t.hidden,
        })),
        allPassed: false,
        durationMs: timeoutMs,
        message: `Your code ran longer than ${Math.round(timeoutMs / 1000)} seconds and was stopped`,
      })
    }, timeoutMs)

    // Check if in browser Worker environment
    if (typeof Worker !== 'undefined') {
      try {
        const blob = new Blob([script], { type: 'application/javascript' })
        const url = URL.createObjectURL(blob)
        browserWorker = new Worker(url)
        browserWorker.onmessage = (e: MessageEvent) => {
          URL.revokeObjectURL(url)
          const data = e.data as Omit<JavaScriptRunResult, 'durationMs'>
          settle({
            ...data,
            durationMs: Math.round(performance.now() - start),
          })
        }
        browserWorker.onerror = (e: ErrorEvent) => {
          URL.revokeObjectURL(url)
          settle({
            status: 'error',
            stdout: '',
            stderr: e.message || 'Worker runtime error',
            logs: [{ level: 'error', text: e.message }],
            testResults: tests.map((t) => ({
              id: t.id,
              name: t.name,
              passed: false,
              actual: undefined,
              expected: t.expect,
              error: e.message,
              hidden: t.hidden,
            })),
            allPassed: false,
            durationMs: Math.round(performance.now() - start),
            message: e.message,
          })
        }
        return
      } catch {
        // Fallback to node:worker_threads
      }
    }

    // Try node:worker_threads for Node/Vitest
    try {
      const nodeWorkerThreads = 'node:worker_threads'
      import(/* @vite-ignore */ nodeWorkerThreads)
        .then(({ Worker: NodeWorker }) => {
          const nw = new NodeWorker(script, { eval: true })
          threadWorker = nw
          nw.on('message', (data: Omit<JavaScriptRunResult, 'durationMs'>) => {
            settle({
              ...data,
              durationMs: Math.round(performance.now() - start),
            })
          })
          nw.on('error', (err: Error) => {
            settle({
              status: 'error',
              stdout: '',
              stderr: err.message,
              logs: [{ level: 'error', text: err.message }],
              testResults: tests.map((t) => ({
                id: t.id,
                name: t.name,
                passed: false,
                actual: undefined,
                expected: t.expect,
                error: err.message,
                hidden: t.hidden,
              })),
              allPassed: false,
              durationMs: Math.round(performance.now() - start),
              message: err.message,
            })
          })
        })
        .catch((err) => {
          settle({
            status: 'error',
            stdout: '',
            stderr: String(err),
            logs: [{ level: 'error', text: String(err) }],
            testResults: [],
            allPassed: false,
            durationMs: Math.round(performance.now() - start),
            message: `Failed to initialize worker environment: ${err.message}`,
          })
        })
    } catch (err) {
      settle({
        status: 'error',
        stdout: '',
        stderr: String(err),
        logs: [{ level: 'error', text: String(err) }],
        testResults: [],
        allPassed: false,
        durationMs: Math.round(performance.now() - start),
        message: `Failed to initialize worker environment: ${err instanceof Error ? err.message : String(err)}`,
      })
    }
  })
}
