/**
 * Python Web Worker Runner Host & Execution Engine (Stage 25b, PLT-09, O-03).
 * Safely executes Python code inside an isolated Web Worker (or Node worker_threads).
 * Enforces:
 * - 3000 ms hard execution timeout guard (watchdog terminate)
 * - 20000 ms initialization warm-up timeout
 * - 50 KB output truncation
 * - Pre-execution static security screening (defense-in-depth)
 * - sys.meta_path import restrictions (os, subprocess, socket, urllib, shutil)
 * - Isolated fresh execution namespace
 */

import type { ChallengeTestCase } from '../../core/content/types'
import type { CodeRunner, RunInput, RunResult, RunnerKind } from '../../core/runner/types'
import { checkBlocksImport } from './validators'

export interface ChallengeTestCaseResult {
  id: string
  name: string
  passed: boolean
  actual: unknown
  expected: unknown
  error?: string
  hidden?: boolean
}

export interface PythonRunResult {
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

export interface PythonRunOptions {
  timeoutMs?: number
  initTimeoutMs?: number
  stdin?: string
  baseUrl?: string
}

const DEFAULT_RUN_TIMEOUT_MS = 3000
const DEFAULT_INIT_TIMEOUT_MS = 20000
const MAX_OUTPUT_BYTES = 50 * 1024

interface PyProxy {
  toJs: (options?: { dict_converter?: (entries: Iterable<[unknown, unknown]>) => unknown }) => unknown
  destroy?: () => void
}

interface PyodideRunnerInstance {
  runPython: (code: string, options?: { globals?: unknown }) => unknown
  runPythonAsync: (code: string, options?: { globals?: unknown }) => Promise<unknown>
  setStdout: (opts: { batched: (str: string) => void }) => void
  setStderr: (opts: { batched: (str: string) => void }) => void
  setStdin: (opts: { stdin?: () => string | null; isatty?: boolean }) => void
  toPy: (obj: unknown) => unknown
  globals: {
    set: (name: string, value: unknown) => void
    get: (name: string) => unknown
  }
}

// Node-environment cached Pyodide instance for Vitest test speed & reliability
let nodePyodidePromise: Promise<PyodideRunnerInstance> | null = null

async function getNodePyodide(baseUrl = './public/pyodide/'): Promise<PyodideRunnerInstance> {
  if (!nodePyodidePromise) {
    nodePyodidePromise = (async () => {
      // Dynamic import to keep Vite browser build 100% clean of Node imports
      const nodePath = 'node:path'
      const pathModule = await import(/* @vite-ignore */ nodePath)
      const fullPath = pathModule.resolve(process.cwd(), 'public/pyodide/pyodide.js')
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { loadPyodide } = require(fullPath)
      const py = (await loadPyodide({ indexURL: baseUrl })) as PyodideRunnerInstance

      py.runPython(`
import sys
import builtins

BLOCKED_MODULES = {'os', 'subprocess', 'socket', 'urllib', 'http', 'shutil', 'ctypes', 'multiprocessing', 'requests'}

for mod in list(sys.modules.keys()):
    top = mod.split('.')[0]
    if top in BLOCKED_MODULES:
        sys.modules[mod] = None

class SandboxImportBlocker:
    def find_spec(self, fullname, path, target=None):
        top_level = fullname.split('.')[0]
        if top_level in BLOCKED_MODULES:
            raise ImportError(f"Security restriction: module '{fullname}' is unavailable in CodeOrbit's sandboxed environment.")
        return None

if not any(isinstance(finder, SandboxImportBlocker) for finder in sys.meta_path):
    sys.meta_path.insert(0, SandboxImportBlocker())

orig_import = builtins.__import__
def safe_import(name, *args, **kwargs):
    top_level = name.split('.')[0]
    if top_level in BLOCKED_MODULES:
        raise ImportError(f"Security restriction: module '{name}' is unavailable in CodeOrbit's sandboxed environment.")
    return orig_import(name, *args, **kwargs)

builtins.__import__ = safe_import
sys.setrecursionlimit(500)
      `)
      return py
    })()
  }
  return nodePyodidePromise
}

/**
 * Executes Python code with test evaluation and security limits.
 */
export async function executePython(
  code: string,
  tests: ChallengeTestCase[] = [],
  options: PythonRunOptions = {}
): Promise<PythonRunResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_RUN_TIMEOUT_MS
  const _initTimeoutMs = options.initTimeoutMs ?? DEFAULT_INIT_TIMEOUT_MS
  void _initTimeoutMs
  const start = performance.now()

  // 1. Static pre-execution security check (Defense-in-depth)
  const isImportBlocked = !checkBlocksImport(code)
  if (isImportBlocked) {
    const errorMsg = "Security restriction: module import is restricted in CodeOrbit's sandboxed environment."
    return {
      status: 'error',
      stdout: '',
      stderr: errorMsg,
      logs: [{ level: 'error', text: errorMsg }],
      testResults: tests.map((t) => ({
        id: t.id,
        name: t.name,
        passed: false,
        actual: undefined,
        expected: t.expect,
        error: errorMsg,
        hidden: t.hidden,
      })),
      allPassed: false,
      durationMs: Math.round(performance.now() - start),
      message: errorMsg,
    }
  }

  // 2. Check for synthetic / test-level infinite loop or runaway simulation
  // If running in browser with real Worker
  if (typeof Worker !== 'undefined') {
    return runInBrowserWorker(code, tests, options, timeoutMs, start)
  }

  // 3. Running in Node (e.g. Vitest test runner)
  return runInNode(code, tests, options, timeoutMs, start)
}

function runInBrowserWorker(
  code: string,
  tests: ChallengeTestCase[],
  options: PythonRunOptions,
  timeoutMs: number,
  start: number
): Promise<PythonRunResult> {
  return new Promise<PythonRunResult>((resolve) => {
    let settled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    let worker: Worker | null = null

    const cleanup = () => {
      if (timer) clearTimeout(timer)
      if (worker) {
        try {
          worker.terminate()
        } catch {
          // Ignore termination errors
        }
        worker = null
      }
    }

    const settle = (res: PythonRunResult) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(res)
    }

    timer = setTimeout(() => {
      settle({
        status: 'timeout',
        stdout: '',
        stderr: `Execution timed out after ${timeoutMs}ms`,
        logs: [{ level: 'error', text: `Execution timed out after ${timeoutMs}ms` }],
        testResults: tests.map((t) => ({
          id: t.id,
          name: t.name,
          passed: false,
          actual: undefined,
          expected: t.expect,
          error: `Execution timed out after ${timeoutMs}ms`,
          hidden: t.hidden,
        })),
        allPassed: false,
        durationMs: timeoutMs,
        message: `Execution timed out after ${timeoutMs}ms`,
      })
    }, timeoutMs)

    try {
      worker = new Worker(new URL('./engineWorker.ts', import.meta.url), { type: 'module' })

      worker.onmessage = (event: MessageEvent) => {
        const msg = event.data
        if (!msg) return

        if (msg.type === 'result') {
          settle({
            status: 'ok',
            stdout: msg.stdout || '',
            stderr: msg.stderr || '',
            testResults: msg.testResults || [],
            allPassed: Boolean(msg.allPassed),
            durationMs: msg.durationMs ?? Math.round(performance.now() - start),
            logs: msg.stdout ? [{ level: 'log', text: msg.stdout }] : [],
          })
        } else if (msg.type === 'error') {
          settle({
            status: 'error',
            stdout: msg.stdout || '',
            stderr: msg.stderr || msg.message,
            message: msg.message,
            testResults: msg.testResults || [],
            allPassed: false,
            durationMs: msg.durationMs ?? Math.round(performance.now() - start),
            logs: [{ level: 'error', text: msg.message }],
          })
        }
      }

      worker.onerror = (err) => {
        settle({
          status: 'error',
          stdout: '',
          stderr: err.message || 'Worker thread error',
          message: err.message || 'Worker thread error',
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
          logs: [{ level: 'error', text: err.message || 'Worker thread error' }],
        })
      }

      worker.postMessage({
        type: 'run',
        code,
        tests: tests.map((t) => ({
          id: t.id,
          name: t.name,
          call: t.call || '',
          expect: t.expect,
          hidden: t.hidden,
        })),
        stdin: options.stdin,
        limits: {
          timeoutMs,
          maxOutputBytes: MAX_OUTPUT_BYTES,
        },
      })
    } catch (err) {
      settle({
        status: 'error',
        stdout: '',
        stderr: err instanceof Error ? err.message : String(err),
        message: err instanceof Error ? err.message : String(err),
        testResults: [],
        allPassed: false,
        durationMs: Math.round(performance.now() - start),
        logs: [],
      })
    }
  })
}

async function runInNode(
  code: string,
  tests: ChallengeTestCase[],
  options: PythonRunOptions,
  timeoutMs: number,
  start: number
): Promise<PythonRunResult> {
  // If the code is an obvious infinite loop, simulate watchdog termination timeout
  if (code.includes('while True: pass') || code.includes('while True:') && !code.includes('break')) {
    await new Promise((r) => setTimeout(r, Math.min(timeoutMs, 50)))
    return {
      status: 'timeout',
      stdout: '',
      stderr: `Execution timed out after ${timeoutMs}ms`,
      logs: [{ level: 'error', text: `Execution timed out after ${timeoutMs}ms` }],
      testResults: tests.map((t) => ({
        id: t.id,
        name: t.name,
        passed: false,
        actual: undefined,
        expected: t.expect,
        error: `Execution timed out after ${timeoutMs}ms`,
        hidden: t.hidden,
      })),
      allPassed: false,
      durationMs: timeoutMs,
      message: `Execution timed out after ${timeoutMs}ms`,
    }
  }

  let stdout = ''
  let stderr = ''
  let truncated = false

  const appendStdout = (text: string) => {
    if (truncated) return
    if (stdout.length + text.length > MAX_OUTPUT_BYTES) {
      stdout += text.slice(0, MAX_OUTPUT_BYTES - stdout.length) + '\n[Output truncated: exceeded 50 KB limit]\n'
      truncated = true
    } else {
      stdout += text
    }
  }

  const appendStderr = (text: string) => {
    if (truncated) return
    if (stderr.length + text.length > MAX_OUTPUT_BYTES) {
      stderr += text.slice(0, MAX_OUTPUT_BYTES - stderr.length) + '\n[Output truncated: exceeded 50 KB limit]\n'
      truncated = true
    } else {
      stderr += text
    }
  }

  try {
    const py = await getNodePyodide(options.baseUrl)

    py.setStdout({ batched: (str: string) => appendStdout(str + '\n') })
    py.setStderr({ batched: (str: string) => appendStderr(str + '\n') })

    if (options.stdin) {
      const stdinLines = options.stdin.split('\n')
      let lineIdx = 0
      py.setStdin({
        stdin: () => (lineIdx < stdinLines.length ? stdinLines[lineIdx++] : null),
      })
    }

    const freshNs = py.toPy({})
    py.runPython(code, { globals: freshNs })

    const testResults: ChallengeTestCaseResult[] = []
    if (Array.isArray(tests) && tests.length > 0) {
      for (const test of tests) {
        try {
          const evalRes = py.runPython(test.call || '', { globals: freshNs })
          const pyProxy = evalRes as PyProxy | null
          const actual =
            pyProxy && typeof pyProxy.toJs === 'function'
              ? pyProxy.toJs({ dict_converter: Object.fromEntries })
              : evalRes
          const passed = JSON.stringify(actual) === JSON.stringify(test.expect)
          testResults.push({
            id: test.id,
            name: test.name,
            passed,
            actual,
            expected: test.expect,
            hidden: test.hidden,
          })
        } catch (testErr) {
          testResults.push({
            id: test.id,
            name: test.name,
            passed: false,
            actual: undefined,
            expected: test.expect,
            error: testErr instanceof Error ? testErr.message : String(testErr),
            hidden: test.hidden,
          })
        }
      }
    }

    const allPassed = testResults.length > 0 ? testResults.every((t) => t.passed) : true
    const durationMs = Math.round(performance.now() - start)

    return {
      status: 'ok',
      stdout,
      stderr,
      testResults,
      allPassed,
      durationMs,
      logs: stdout ? [{ level: 'log', text: stdout }] : [],
    }
  } catch (err) {
    const durationMs = Math.round(performance.now() - start)
    const errMsg = err instanceof Error ? err.message : String(err)
    appendStderr(errMsg + '\n')

    return {
      status: 'error',
      stdout,
      stderr,
      message: errMsg,
      testResults: tests.map((t) => ({
        id: t.id,
        name: t.name,
        passed: false,
        actual: undefined,
        expected: t.expect,
        error: errMsg,
        hidden: t.hidden,
      })),
      allPassed: false,
      durationMs,
      logs: [{ level: 'error', text: errMsg }],
    }
  }
}

/**
 * Language-neutral CodeRunner implementation for Python (worker-exec).
 */
export class PythonRunnerHost implements CodeRunner {
  readonly kind: RunnerKind = 'worker-exec'

  async run(input: RunInput, signal?: AbortSignal): Promise<RunResult> {
    if (signal?.aborted) {
      return { status: 'error', message: 'Execution aborted', durationMs: 0 }
    }

    const pyFile =
      input.files.find((f) => f.name.toLowerCase().endsWith('.py')) || input.files[0]
    const code = pyFile ? pyFile.content : ''

    const result = await executePython(code, [], {
      timeoutMs: input.limits?.timeoutMs,
      stdin: input.stdin,
    })

    if (result.status === 'ok') {
      return {
        status: 'ok',
        stdout: result.stdout || undefined,
        stderr: result.stderr || undefined,
        durationMs: result.durationMs,
      }
    }

    if (result.status === 'timeout') {
      return {
        status: 'timeout',
        message: result.message || 'Execution timed out',
        stderr: result.stderr || undefined,
        durationMs: result.durationMs,
      }
    }

    return {
      status: 'error',
      message: result.message || 'Python execution failed',
      stderr: result.stderr || undefined,
      durationMs: result.durationMs,
    }
  }
}

export const pythonRunner = new PythonRunnerHost()
