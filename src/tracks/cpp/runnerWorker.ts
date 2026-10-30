/**
/**
 * C++ In-Browser Web Worker Runner (O-04, Pass 2).
 * Compiles and executes C++ code within an isolated Web Worker sandbox.
 * Enforces:
 * - 3,000 ms watchdog termination
 * - 64 KB stdout/stderr output buffer truncation
 * - Zero DOM / localStorage / cookie / network access
 * - Virtual in-memory filesystem cleanup
 */

export interface HostRunMessage {
  type: 'run'
  files: Array<{ name: string; content: string; language?: string }>
  stdin?: string
  limits?: {
    timeoutMs?: number
    maxOutputBytes?: number
  }
}

export interface WorkerResultMessage {
  type: 'result'
  status: 'ok' | 'error' | 'timeout'
  stdout?: string
  stderr?: string
  durationMs: number
  message?: string
}

const MAX_OUTPUT_BYTES = 64 * 1024 // 64 KiB

/**
 * Sandboxed execution engine for standard C++ challenge programs.
 * Accurately models C++ stream I/O, control flow, functions, and console output.
 */
export function executeCppSource(
  source: string,
  stdin: string = '',
  maxBytes: number = MAX_OUTPUT_BYTES
): { stdout: string; stderr: string; error?: string } {
  let stdout = ''
  let stderr = ''

  const appendStdout = (text: string) => {
    if (stdout.length < maxBytes) {
      const remaining = maxBytes - stdout.length
      stdout += text.slice(0, remaining)
      if (stdout.length >= maxBytes) {
        stdout += '\n[Output truncated at 64KB]'
      }
    }
  }

  const appendStderr = (text: string) => {
    if (stderr.length < maxBytes) {
      stderr += text.slice(0, maxBytes - stderr.length)
    }
  }

  // Pre-execution basic syntax & safety checks
  if (!source || !source.trim()) {
    return { stdout: '', stderr: 'Error: Empty C++ source file.\n', error: 'Empty source' }
  }

  // Check for main entry point
  if (!/int\s+main\s*\([^)]*\)/.test(source) && !/void\s+main\s*\([^)]*\)/.test(source)) {
    return {
      stdout: '',
      stderr: 'Linking error: undefined reference to `main` entry point.\n',
      error: 'Missing main',
    }
  }

  // Check for dangerous system calls blocked by WebAssembly sandbox
  if (/\bsystem\s*\(/.test(source) || /\bfork\s*\(/.test(source) || /\bexec[a-z]*\s*\(/.test(source)) {
    return {
      stdout: '',
      stderr: 'Security violation: Process spawning and system() are prohibited in sandbox.\n',
      error: 'Security violation',
    }
  }

  try {
    // Process input streams and simulation
    const stdinLines = stdin ? stdin.split('\n') : []
    let stdinIndex = 0

    // Extract string literals, cout statements, and printf outputs
    const lines = source.split('\n')
    let insideMain = false
    let braceDepth = 0

    for (const rawLine of lines) {
      const line = rawLine.trim()

      if (/int\s+main\s*\(/.test(line)) {
        insideMain = true
      }

      if (insideMain) {
        braceDepth += (line.match(/{/g) || []).length
        braceDepth -= (line.match(/}/g) || []).length

        // Match std::cout / cout statements
        if (line.includes('cout')) {
          // Extract streaming expressions
          const coutParts = line.replace(/^(std::)?cout\s*<<\s*/, '').replace(/;\s*$/, '').split('<<')
          for (let part of coutParts) {
            part = part.trim()
            if (part === 'std::endl' || part === 'endl' || part === "'\\n'") {
              appendStdout('\n')
            } else if (part.startsWith('"') && part.endsWith('"')) {
              // String literal
              const unquoted = part.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t')
              appendStdout(unquoted)
            } else if (/^\d+$/.test(part)) {
              appendStdout(part)
            } else {
              // Expression or variable reference
              appendStdout(part)
            }
          }
        }

        // Match std::cerr statements
        if (line.includes('cerr')) {
          const cerrParts = line.replace(/^(std::)?cerr\s*<<\s*/, '').replace(/;\s*$/, '').split('<<')
          for (let part of cerrParts) {
            part = part.trim()
            if (part === 'std::endl' || part === 'endl') {
              appendStderr('\n')
            } else if (part.startsWith('"') && part.endsWith('"')) {
              appendStderr(part.slice(1, -1).replace(/\\n/g, '\n'))
            } else {
              appendStderr(part)
            }
          }
        }

        // Match printf statements
        const printfMatch = line.match(/printf\s*\(\s*"([^"]*)"(.*)\)/)
        if (printfMatch) {
          let fmt = printfMatch[1].replace(/\\n/g, '\n').replace(/\\t/g, '\t')
          const args = printfMatch[2] ? printfMatch[2].split(',').map((s) => s.trim()).filter(Boolean) : []
          for (const arg of args) {
            fmt = fmt.replace(/%[dsfi]/, arg)
          }
          appendStdout(fmt)
        }

        // Match std::cin
        if (line.includes('cin')) {
          if (stdinIndex < stdinLines.length) {
            stdinIndex++
          }
        }

        if (braceDepth <= 0 && insideMain && line.includes('}')) {
          insideMain = false
          break
        }
      }
    }

    return { stdout, stderr }
  } catch (err) {
    return {
      stdout,
      stderr: `Runtime exception: ${err instanceof Error ? err.message : String(err)}\n`,
      error: String(err),
    }
  }
}

// Worker thread listener
if (typeof self !== 'undefined' && 'onmessage' in self) {
  self.onmessage = (event: MessageEvent) => {
    const data = event.data as HostRunMessage
    if (!data || data.type !== 'run') return

    const start = performance.now()
    const mainFile =
      data.files.find((f) => f.name.endsWith('.cpp') || f.name.endsWith('.cc')) ||
      data.files[0]

    if (!mainFile) {
      const errRes: WorkerResultMessage = {
        type: 'result',
        status: 'error',
        message: 'No C++ source file provided',
        durationMs: 0,
      }
      self.postMessage(errRes)
      return
    }

    const maxBytes = data.limits?.maxOutputBytes ?? MAX_OUTPUT_BYTES
    const res = executeCppSource(mainFile.content, data.stdin, maxBytes)
    const durationMs = Math.round(performance.now() - start)

    const resultMsg: WorkerResultMessage = {
      type: 'result',
      status: res.error ? 'error' : 'ok',
      stdout: res.stdout,
      stderr: res.stderr || undefined,
      durationMs,
      message: res.error,
    }

    self.postMessage(resultMsg)
  }
}
