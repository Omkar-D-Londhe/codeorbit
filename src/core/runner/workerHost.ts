/**
 * Worker Runner Host (PLT-05, Stage 20a).
 * Manages module Web Worker lifecycle, timeout kills, output limits and AbortSignal.
 */
import type {
  CodeRunner,
  HostRunMessage,
  RunInput,
  RunResult,
  RunnerKind,
} from './types'
import {
  DEFAULT_MAX_OUTPUT_BYTES,
  DEFAULT_TIMEOUT_MS,
  isWorkerMessage,
} from './types'

export interface WorkerLike {
  postMessage(message: unknown): void
  terminate(): void
  onmessage: ((ev: MessageEvent) => unknown) | null
  onerror: ((ev: ErrorEvent) => unknown) | null
  addEventListener?(type: string, listener: EventListenerOrEventListenerObject): void
  removeEventListener?(type: string, listener: EventListenerOrEventListenerObject): void
}

export type WorkerFactory = () => WorkerLike

function defaultWorkerFactory(): WorkerLike {
  if (typeof Worker !== 'undefined') {
    return new Worker(new URL('./workerEntry.ts', import.meta.url), { type: 'module' })
  }
  throw new Error('Web Worker is not supported in this environment')
}

export class WorkerRunnerHost implements CodeRunner {
  readonly kind: RunnerKind = 'worker-exec'
  private workerFactory: WorkerFactory

  constructor(workerFactory?: WorkerFactory) {
    this.workerFactory = workerFactory || defaultWorkerFactory
  }

  async run(input: RunInput, signal?: AbortSignal): Promise<RunResult> {
    const start = performance.now()

    // Immediate abort check
    if (signal?.aborted) {
      return {
        status: 'error',
        message: 'Execution aborted',
        durationMs: 0,
      }
    }

    // Input schema validation
    if (!input || !Array.isArray(input.files)) {
      return {
        status: 'error',
        message: 'Invalid run input: files array is required',
        durationMs: 0,
      }
    }

    const timeoutMs = input.limits?.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const maxOutputBytes = input.limits?.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES

    let worker: WorkerLike
    try {
      worker = this.workerFactory()
    } catch (err) {
      return {
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to instantiate worker',
        durationMs: Math.round(performance.now() - start),
      }
    }

    return new Promise<RunResult>((resolve) => {
      let isSettled = false
      let stdoutAcc = ''
      let stderrAcc = ''
      let totalOutputBytes = 0

      const cleanup = () => {
        if (timeoutTimer) clearTimeout(timeoutTimer)
        if (signal && onAbort) signal.removeEventListener('abort', onAbort)
        try {
          worker.terminate()
        } catch {
          // ignore already terminated
        }
      }

      const settle = (result: RunResult) => {
        if (isSettled) return
        isSettled = true
        cleanup()
        resolve(result)
      }

      // Hard timeout enforcement
      const timeoutTimer = setTimeout(() => {
        settle({
          status: 'timeout',
          message: `Execution timed out after ${timeoutMs}ms`,
          stderr: stderrAcc.trim() || undefined,
          durationMs: timeoutMs,
        })
      }, timeoutMs)

      // AbortSignal enforcement
      const onAbort = () => {
        settle({
          status: 'error',
          message: 'Execution aborted',
          stderr: stderrAcc.trim() || undefined,
          durationMs: Math.round(performance.now() - start),
        })
      }

      if (signal) {
        signal.addEventListener('abort', onAbort, { once: true })
      }

      // Worker error event
      worker.onerror = (ev: unknown) => {
        const errorEvent = ev as { message?: string } | Error
        const msg =
          errorEvent instanceof Error
            ? errorEvent.message
            : errorEvent?.message || 'Worker execution error'

        settle({
          status: 'error',
          message: msg,
          stderr: stderrAcc.trim() || undefined,
          durationMs: Math.round(performance.now() - start),
        })
      }

      // Worker message listener
      worker.onmessage = (event: MessageEvent) => {
        const data = event.data

        // Validate incoming schema
        if (!isWorkerMessage(data)) {
          settle({
            status: 'error',
            message: 'Malformed message received from worker',
            stderr: stderrAcc.trim() || undefined,
            durationMs: Math.round(performance.now() - start),
          })
          return
        }

        if (data.type === 'log') {
          const byteLength = new TextEncoder().encode(data.data).length
          totalOutputBytes += byteLength

          if (totalOutputBytes > maxOutputBytes) {
            settle({
              status: 'memory',
              message: `Output limit of ${maxOutputBytes} bytes exceeded`,
              stderr: stderrAcc.trim() || undefined,
              durationMs: Math.round(performance.now() - start),
            })
            return
          }

          if (data.stream === 'stdout') {
            stdoutAcc += data.data
          } else {
            stderrAcc += data.data
          }
          return
        }

        if (data.type === 'error') {
          settle({
            status: 'error',
            message: data.message,
            stderr: (stderrAcc + (data.stderr || '')).trim() || undefined,
            durationMs: data.durationMs ?? Math.round(performance.now() - start),
          })
          return
        }

        if (data.type === 'result') {
          const finalStdout = stdoutAcc + (data.stdout || '')
          const finalStderr = stderrAcc + (data.stderr || '')
          const finalBytes = new TextEncoder().encode(finalStdout + finalStderr).length

          if (finalBytes > maxOutputBytes) {
            settle({
              status: 'memory',
              message: `Output limit of ${maxOutputBytes} bytes exceeded`,
              stderr: finalStderr.trim() || undefined,
              durationMs: Math.round(performance.now() - start),
            })
            return
          }

          settle({
            status: 'ok',
            stdout: finalStdout || undefined,
            stderr: finalStderr.trim() || undefined,
            durationMs: data.durationMs,
          })
        }
      }

      // Send run command
      const message: HostRunMessage = {
        type: 'run',
        files: input.files,
        stdin: input.stdin,
        limits: {
          timeoutMs,
          maxOutputBytes,
        },
      }

      try {
        worker.postMessage(message)
      } catch (err) {
        settle({
          status: 'error',
          message: err instanceof Error ? err.message : 'Failed to post message to worker',
          durationMs: Math.round(performance.now() - start),
        })
      }
    })
  }
}
