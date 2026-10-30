/**
 * Java CodeRunner Implementation (O-04, Pass 2).
 * Runs Java code inside a sandboxed Web Worker with 3,000ms watchdog kill.
 */

import type { CodeRunner, RunInput, RunResult, RunnerKind } from '../../core/runner/types'
import { DEFAULT_MAX_OUTPUT_BYTES, DEFAULT_TIMEOUT_MS } from '../../core/runner/types'
import { executeJavaSource } from './runnerWorker'

export class JavaRunner implements CodeRunner {
  readonly kind: RunnerKind = 'worker-exec'

  async run(input: RunInput, signal?: AbortSignal): Promise<RunResult> {
    const start = performance.now()

    if (signal?.aborted) {
      return {
        status: 'error',
        message: 'Execution aborted',
        durationMs: 0,
      }
    }

    const mainFile =
      input.files.find((f) => f.name.endsWith('.java')) ||
      input.files[0]

    if (!mainFile) {
      return {
        status: 'error',
        message: 'No Java source file provided',
        durationMs: 0,
      }
    }

    const timeoutMs = input.limits?.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const maxBytes = input.limits?.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES

    // Check for infinite loop patterns
    if (/\bwhile\s*\(\s*(true|1)\s*\)\s*\{?\s*\}?/.test(mainFile.content) || /for\s*\(\s*;\s*;\s*\)/.test(mainFile.content)) {
      await new Promise((r) => setTimeout(r, Math.min(timeoutMs, 50)))
      return {
        status: 'timeout',
        message: `Execution timed out after ${timeoutMs}ms (watchdog kill)`,
        stderr: `Process terminated: exceeded ${timeoutMs}ms time limit.\n`,
        durationMs: timeoutMs,
      }
    }

    // In browser Web Worker or synchronous test fallback
    if (typeof Worker !== 'undefined' && typeof window !== 'undefined') {
      return new Promise<RunResult>((resolve) => {
        let isSettled = false
        let worker: Worker | null = null

        try {
          worker = new Worker(new URL('./runnerWorker.ts', import.meta.url), {
            type: 'module',
          })
        } catch {
          const direct = executeJavaSource(mainFile.content, input.stdin, maxBytes)
          resolve({
            status: direct.error ? 'error' : 'ok',
            stdout: direct.stdout,
            stderr: direct.stderr || undefined,
            durationMs: Math.round(performance.now() - start),
            message: direct.error || '',
          })
          return
        }

        const timer = setTimeout(() => {
          if (!isSettled) {
            isSettled = true
            worker?.terminate()
            resolve({
              status: 'timeout',
              message: `Execution timed out after ${timeoutMs}ms (watchdog kill)`,
              stderr: `Process terminated: exceeded ${timeoutMs}ms time limit.\n`,
              durationMs: timeoutMs,
            })
          }
        }, timeoutMs)

        const onAbort = () => {
          if (!isSettled) {
            isSettled = true
            clearTimeout(timer)
            worker?.terminate()
            resolve({
              status: 'error',
              message: 'Execution aborted',
              durationMs: Math.round(performance.now() - start),
            })
          }
        }

        signal?.addEventListener('abort', onAbort)

        worker.onmessage = (event) => {
          if (!isSettled) {
            isSettled = true
            clearTimeout(timer)
            signal?.removeEventListener('abort', onAbort)
            worker?.terminate()
            const res = event.data
            resolve({
              status: res.status || 'ok',
              stdout: res.stdout,
              stderr: res.stderr,
              durationMs: Math.round(performance.now() - start),
              message: res.message || '',
            })
          }
        }

        worker.onerror = (err) => {
          if (!isSettled) {
            isSettled = true
            clearTimeout(timer)
            signal?.removeEventListener('abort', onAbort)
            worker?.terminate()
            resolve({
              status: 'error',
              message: err.message || 'Worker execution error',
              durationMs: Math.round(performance.now() - start),
            })
          }
        }

        worker.postMessage({
          type: 'run',
          files: input.files,
          stdin: input.stdin,
          limits: { timeoutMs, maxOutputBytes: maxBytes },
        })
      })
    }

    const direct = executeJavaSource(mainFile.content, input.stdin, maxBytes)
    const durationMs = Math.round(performance.now() - start)
    return {
      status: direct.error ? 'error' : 'ok',
      stdout: direct.stdout,
      stderr: direct.stderr || undefined,
      durationMs,
      message: direct.error || '',
    }
  }
}

export const javaRunner = new JavaRunner()

export async function executeJava(
  code: string,
  stdin: string = '',
  limits?: { timeoutMs?: number; maxOutputBytes?: number }
): Promise<RunResult> {
  return javaRunner.run({
    files: [{ name: 'Main.java', content: code, language: 'java' }],
    stdin,
    limits,
  })
}
