/**
 * Web Worker Runner Entry Point (PLT-05, Stage 20a).
 * Runs inside dedicated worker thread without DOM or network access.
 */
import { isHostRunMessage, type WorkerMessage } from './types'

// Worker message handler
if (typeof self !== 'undefined') {
  self.onmessage = async (event: MessageEvent) => {
    const data = event.data

    if (!isHostRunMessage(data)) {
      const err: WorkerMessage = {
        type: 'error',
        message: 'Malformed runner request message',
        durationMs: 0,
      }
      self.postMessage(err)
      return
    }

    const start = performance.now()
    try {
      const mainFile =
        data.files.find((f) => f.name.endsWith('.js') || f.name.endsWith('.ts')) ??
        data.files[0]

      if (!mainFile) {
        const err: WorkerMessage = {
          type: 'error',
          message: 'No executable files provided',
          durationMs: 0,
        }
        self.postMessage(err)
        return
      }

      let stdout = ''
      let stderr = ''

      const workerConsole = {
        log: (...args: unknown[]) => {
          const line =
            args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n'
          stdout += line
          const logMsg: WorkerMessage = { type: 'log', stream: 'stdout', data: line }
          self.postMessage(logMsg)
        },
        error: (...args: unknown[]) => {
          const line =
            args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n'
          stderr += line
          const logMsg: WorkerMessage = { type: 'log', stream: 'stderr', data: line }
          self.postMessage(logMsg)
        },
        warn: (...args: unknown[]) => {
          const line =
            args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n'
          stderr += line
          const logMsg: WorkerMessage = { type: 'log', stream: 'stderr', data: line }
          self.postMessage(logMsg)
        },
      }

      // Execute in isolated function context
      const runnerFn = new Function('console', 'stdin', mainFile.content)
      runnerFn(workerConsole, data.stdin || '')

      const durationMs = Math.round(performance.now() - start)
      const res: WorkerMessage = {
        type: 'result',
        status: 'ok',
        stdout,
        stderr: stderr || undefined,
        durationMs,
      }
      self.postMessage(res)
    } catch (err) {
      const durationMs = Math.round(performance.now() - start)
      const errRes: WorkerMessage = {
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
        durationMs,
      }
      self.postMessage(errRes)
    }
  }
}
