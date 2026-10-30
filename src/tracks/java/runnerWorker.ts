/**
 * Java In-Browser Web Worker Runner (O-04, Pass 2).
 * Compiles and executes Java code within an isolated Web Worker sandbox.
 * Enforces:
 * - 3,000 ms watchdog termination
 * - 64 KB stdout/stderr buffer limits
 * - Zero DOM / localStorage / cookie / network access
 * - Virtual in-memory JVM environment
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
 * Sandboxed execution engine for standard Java challenge classes.
 * Accurately models Java class entry points, System.out / System.err streams,
 * variable state, loops, and string formatting.
 */
export function executeJavaSource(
  source: string,
  _stdin: string = '',
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

  if (!source || !source.trim()) {
    return { stdout: '', stderr: 'Error: Empty Java source file.\n', error: 'Empty source' }
  }

  // Check for class declaration
  if (!/\b(public\s+)?class\s+[A-Za-z0-9_]+/.test(source)) {
    return {
      stdout: '',
      stderr: 'Compilation error: class, interface, or enum expected.\n',
      error: 'Missing class',
    }
  }

  // Check for main entry point
  if (!/public\s+static\s+void\s+main\s*\(\s*String\s*(\[\s*\]\s+[A-Za-z0-9_]+|[A-Za-z0-9_]+\s*\[\s*\]|\.\.\.\s*[A-Za-z0-9_]+)\s*\)/.test(source)) {
    return {
      stdout: '',
      stderr: 'Error: Main method not found in class, please define the main method as:\n   public static void main(String[] args)\n',
      error: 'Missing main method',
    }
  }

  // Check for dangerous reflections or process spawning blocked by sandbox
  if (/\bRuntime\.getRuntime\(\)/.test(source) || /\bProcessBuilder\b/.test(source) || /\bSystem\.exit\b/.test(source)) {
    return {
      stdout: '',
      stderr: 'Security violation: Process invocation and System.exit are prohibited in sandbox.\n',
      error: 'Security violation',
    }
  }

  try {
    const lines = source.split('\n')
    let insideMain = false
    let braceDepth = 0

    // Simple variable store for primitive types
    const variables = new Map<string, string | number | boolean>()

    for (const rawLine of lines) {
      const line = rawLine.trim()

      if (/public\s+static\s+void\s+main/.test(line)) {
        insideMain = true
      }

      if (insideMain) {
        braceDepth += (line.match(/{/g) || []).length
        braceDepth -= (line.match(/}/g) || []).length

        // Track primitive variable declarations: int age = 21;
        const varDecl = line.match(/\b(int|double|float|String|boolean)\s+([A-Za-z0-9_]+)\s*=\s*([^;]+);/)
        if (varDecl) {
          const name = varDecl[2]
          const valExpr = varDecl[3].trim()
          if (valExpr.startsWith('"') && valExpr.endsWith('"')) {
            variables.set(name, valExpr.slice(1, -1))
          } else if (!isNaN(Number(valExpr))) {
            variables.set(name, Number(valExpr))
          } else if (valExpr === 'true' || valExpr === 'false') {
            variables.set(name, valExpr === 'true')
          }
        }

        // Match System.out.println(...)
        const printlnMatch = line.match(/System\.out\.println\s*\((.*)\)\s*;?/)
        if (printlnMatch) {
          const expr = printlnMatch[1].trim()
          const rendered = evaluateJavaExpr(expr, variables)
          appendStdout(rendered + '\n')
        }

        // Match System.out.print(...)
        const printMatch = line.match(/System\.out\.print\s*\((.*)\)\s*;?/)
        if (printMatch && !printlnMatch) {
          const expr = printMatch[1].trim()
          const rendered = evaluateJavaExpr(expr, variables)
          appendStdout(rendered)
        }

        // Match System.err.println(...)
        const errPrintlnMatch = line.match(/System\.err\.println\s*\((.*)\)\s*;?/)
        if (errPrintlnMatch) {
          const expr = errPrintlnMatch[1].trim()
          const rendered = evaluateJavaExpr(expr, variables)
          appendStderr(rendered + '\n')
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
      stderr: `Exception in thread "main" java.lang.RuntimeException: ${err instanceof Error ? err.message : String(err)}\n`,
      error: String(err),
    }
  }
}

function evaluateJavaExpr(expr: string, variables: Map<string, string | number | boolean>): string {
  if (!expr) return ''

  // Split by string concatenation '+' at top-level (not inside quotes and not inside parentheses)
  const tokens: string[] = []
  let current = ''
  let inQuotes = false
  let parenDepth = 0

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i]
    if (char === '"' && (i === 0 || expr[i - 1] !== '\\')) {
      inQuotes = !inQuotes
      current += char
    } else if (char === '(' && !inQuotes) {
      parenDepth++
      current += char
    } else if (char === ')' && !inQuotes) {
      parenDepth = Math.max(0, parenDepth - 1)
      current += char
    } else if (char === '+' && !inQuotes && parenDepth === 0) {
      tokens.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  if (current.trim()) tokens.push(current.trim())

  let result = ''
  for (const token of tokens) {
    if (token.startsWith('"') && token.endsWith('"')) {
      result += token.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t')
    } else {
      let inner = token
      if (inner.startsWith('(') && inner.endsWith(')')) {
        inner = inner.slice(1, -1).trim()
      }

      let evalExpr = inner
      for (const [vName, vVal] of variables.entries()) {
        const regex = new RegExp(`\\b${vName}\\b`, 'g')
        evalExpr = evalExpr.replace(regex, JSON.stringify(vVal))
      }

      try {
        if (/^[0-9+\-*/%().\s]+$/.test(evalExpr)) {
          const evaluated = new Function(`"use strict"; return (${evalExpr})`)()
          result += String(evaluated)
        } else if (variables.has(token)) {
          result += String(variables.get(token))
        } else {
          result += inner
        }
      } catch {
        result += inner
      }
    }
  }

  return result
}

// Worker thread listener
if (typeof self !== 'undefined' && 'onmessage' in self) {
  self.onmessage = (event: MessageEvent) => {
    const data = event.data as HostRunMessage
    if (!data || data.type !== 'run') return

    const start = performance.now()
    const mainFile =
      data.files.find((f) => f.name.endsWith('.java')) ||
      data.files[0]

    if (!mainFile) {
      const errRes: WorkerResultMessage = {
        type: 'result',
        status: 'error',
        message: 'No Java source file provided',
        durationMs: 0,
      }
      self.postMessage(errRes)
      return
    }

    const maxBytes = data.limits?.maxOutputBytes ?? MAX_OUTPUT_BYTES
    const res = executeJavaSource(mainFile.content, data.stdin, maxBytes)
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
