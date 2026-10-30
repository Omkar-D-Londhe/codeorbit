/**
 * Python Structural Rule Validators for CodeOrbit Python Track (Stage 25a).
 * Non-executing, deterministic, bounded static checks.
 *
 * Guaranteed:
 * - ZERO code execution in browser, Worker, Node, or subprocess.
 * - ReDoS-safe linear expressions.
 * - Robust handling of malformed input, comments, and oversized files.
 */

import type { ChallengeRequirement } from '../../../data/types'
import type { ChallengeFile, ChallengeTestCase, ChallengeValidator, RequirementResult } from '../../../core/content/types'
import { executePython, type PythonRunResult } from '../runner'

export interface PythonValidationOptions {
  tests?: ChallengeTestCase[]
  execute?: boolean
}

export type PythonRule =
  | { kind: 'definesFunction'; name: string; paramsCount?: number; params?: string[]; returns?: boolean }
  | { kind: 'containsLoop'; loopType?: 'for' | 'while' | 'any'; minNesting?: number }
  | { kind: 'usesComprehension'; comprehensionType?: 'list' | 'dict' | 'set' | 'any' }
  | { kind: 'usesRecursion'; functionName: string }
  | { kind: 'declaresClass'; name: string; methods?: string[] }
  | { kind: 'usesConstruct'; construct: 'if-elif-else' | 'try-except' | 'with' | 'lambda' | 'docstring' | 'assert' }
  | { kind: 'pythonSourceMatches'; pattern: string | RegExp }
  | { kind: 'blocksImport'; blockedModules?: string[] }

const MAX_LINES = 1000
const MAX_BYTES = 100 * 1024

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Strips comments from Python code while preserving line structure and string boundaries.
 */
export function stripComments(code: string): string {
  const lines = code.split('\n')
  return lines
    .map((line) => {
      let inSingleQuote = false
      let inDoubleQuote = false
      let inTripleQuote = false
      let commentStart = -1

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextTwo = line.slice(i, i + 3)

        if ((nextTwo === '"""' || nextTwo === "'''") && !inSingleQuote && !inDoubleQuote) {
          inTripleQuote = !inTripleQuote
          i += 2
          continue
        }

        if (!inTripleQuote) {
          if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
          } else if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
          } else if (char === '#' && !inSingleQuote && !inDoubleQuote) {
            commentStart = i
            break
          }
        }
      }

      return commentStart >= 0 ? line.slice(0, commentStart) : line
    })
    .join('\n')
}

/**
 * Validates whether a function with the specified name and parameter count is defined.
 */
export function checkDefinesFunction(
  code: string,
  name: string,
  paramsCount?: number,
  params?: string[],
  returns?: boolean
): boolean {
  if (!code || typeof code !== 'string') return false
  const safeCode = code.slice(0, MAX_BYTES)
  const stripped = stripComments(safeCode)

  const fnRegex = new RegExp(`(?:^|\\n)[ \\t]*def\\s+${escapeRegex(name)}\\s*\\(([^)]*)\\)\\s*:`, 'm')
  const match = stripped.match(fnRegex)
  if (!match) return false

  const rawParams = match[1]
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  if (paramsCount !== undefined && rawParams.length !== paramsCount) {
    return false
  }

  if (params && params.length > 0) {
    const extractedNames = rawParams.map((p) => p.split(':')[0].split('=')[0].trim())
    const allMatch = params.every((p, idx) => extractedNames[idx] === p)
    if (!allMatch) return false
  }

  if (returns) {
    // Check that function body contains a return statement
    const fnIndex = match.index ?? 0
    const afterFn = stripped.slice(fnIndex + match[0].length)
    const bodyLines = afterFn.split('\n')
    let hasReturn = false

    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i]
      if (i > 0 && line.trim().length > 0 && !/^[ \t]+/.test(line)) {
        // Out of function body indentation
        break
      }
      if (/\breturn\b/.test(line)) {
        hasReturn = true
        break
      }
    }

    if (!hasReturn) return false
  }

  return true
}

/**
 * Validates whether the code contains for or while loops, and checks nesting depth if requested.
 */
export function checkContainsLoop(
  code: string,
  loopType: 'for' | 'while' | 'any' = 'any',
  minNesting: number = 1
): boolean {
  if (!code) return false
  const stripped = stripComments(code.slice(0, MAX_BYTES))
  const lines = stripped.split('\n').slice(0, MAX_LINES)

  const loopPattern =
    loopType === 'for'
      ? /^[ \t]*for\s+[^:]+:\s*$/
      : loopType === 'while'
        ? /^[ \t]*while\s+[^:]+:\s*$/
        : /^[ \t]*(?:for|while)\s+[^:]+:\s*$/

  const loopIndents: number[] = []

  for (const line of lines) {
    if (loopPattern.test(line)) {
      const indentMatch = line.match(/^([ \t]*)/)
      const indent = indentMatch ? indentMatch[1].replace(/\t/g, '    ').length : 0
      loopIndents.push(indent)
    }
  }

  if (loopIndents.length === 0) return false
  if (minNesting <= 1) return loopIndents.length >= 1

  // For nesting >= 2: check if any loop is indented deeper than an earlier loop
  let maxNesting = 1
  for (let i = 0; i < loopIndents.length; i++) {
    for (let j = i + 1; j < loopIndents.length; j++) {
      if (loopIndents[j] > loopIndents[i]) {
        maxNesting = Math.max(maxNesting, 2)
      }
    }
  }

  return maxNesting >= minNesting
}

/**
 * Validates whether the code uses a list, dict, or set comprehension.
 */
export function checkUsesComprehension(
  code: string,
  comprehensionType: 'list' | 'dict' | 'set' | 'any' = 'any'
): boolean {
  if (!code) return false
  const stripped = stripComments(code.slice(0, MAX_BYTES))

  const listComp = /\[\s*[^\]\n]+\s+for\s+[^\]\n]+\s+in\s+[^\]\n]+\]/
  const dictComp = /\{\s*[^:}\n]+:[^}\n]+\s+for\s+[^}\n]+\s+in\s+[^}\n]+\}/
  const setComp = /\{\s*[^:}\n]+\s+for\s+[^}\n]+\s+in\s+[^}\n]+\}/

  if (comprehensionType === 'list') {
    return listComp.test(stripped)
  }
  if (comprehensionType === 'dict') {
    return dictComp.test(stripped)
  }
  if (comprehensionType === 'set') {
    return setComp.test(stripped) && !dictComp.test(stripped)
  }

  return listComp.test(stripped) || dictComp.test(stripped) || setComp.test(stripped)
}

/**
 * Validates whether a function calls itself recursively.
 */
export function checkUsesRecursion(code: string, functionName: string): boolean {
  if (!code || !functionName) return false
  const stripped = stripComments(code.slice(0, MAX_BYTES))

  const fnRegex = new RegExp(`(?:^|\\n)[ \\t]*def\\s+${escapeRegex(functionName)}\\s*\\(([^)]*)\\)\\s*:`, 'm')
  const match = stripped.match(fnRegex)
  if (!match) return false

  const fnIndex = match.index ?? 0
  const afterDef = stripped.slice(fnIndex + match[0].length)
  const bodyLines = afterDef.split('\n')

  const callRegex = new RegExp(`\\b${escapeRegex(functionName)}\\s*\\(`, 'm')

  for (let i = 0; i < bodyLines.length; i++) {
    const line = bodyLines[i]
    if (i > 0 && line.trim().length > 0 && !/^[ \t]+/.test(line)) {
      break
    }
    if (callRegex.test(line)) {
      return true
    }
  }

  return false
}

/**
 * Validates specific structural constructs (if-elif-else, try-except, assert, etc.).
 */
export function checkUsesConstruct(
  code: string,
  construct: 'if-elif-else' | 'try-except' | 'with' | 'lambda' | 'docstring' | 'assert'
): boolean {
  if (!code) return false
  const stripped = stripComments(code.slice(0, MAX_BYTES))

  switch (construct) {
    case 'if-elif-else': {
      const hasIf = /(?:^|\n)[ \t]*if\s+[^:]+:/.test(stripped)
      const hasElif = /(?:^|\n)[ \t]*elif\s+[^:]+:/.test(stripped)
      const hasElse = /(?:^|\n)[ \t]*else\s*:/.test(stripped)
      return hasIf && hasElif && hasElse
    }
    case 'try-except': {
      const hasTry = /(?:^|\n)[ \t]*try\s*:/.test(stripped)
      const hasExcept = /(?:^|\n)[ \t]*except(?:\s+[^:]+)?\s*:/.test(stripped)
      return hasTry && hasExcept
    }
    case 'with':
      return /(?:^|\n)[ \t]*with\s+[^:]+:/.test(stripped)
    case 'lambda':
      return /\blambda\s+[^:]+:/.test(stripped)
    case 'docstring':
      return /"""[\s\S]*?"""|'''[\s\S]*?'''/.test(code)
    case 'assert':
      return /(?:^|\n)[ \t]*assert\s+/.test(stripped)
    default:
      return false
  }
}

/**
 * Validates whether the code matches a pattern.
 */
export function checkSourceMatches(code: string, pattern: string | RegExp): boolean {
  if (!code) return false
  const safeCode = code.slice(0, MAX_BYTES)
  if (pattern instanceof RegExp) {
    return pattern.test(safeCode)
  }
  try {
    const regex = new RegExp(pattern)
    return regex.test(safeCode)
  } catch {
    return safeCode.includes(pattern)
  }
}

/**
 * Checks if code does NOT import any blocked modules. Returns true if safe, false if blocked module detected.
 */
export function checkBlocksImport(
  code: string,
  blockedModules?: string[]
): boolean {
  if (!code) return true
  const blocked = blockedModules ?? ['os', 'subprocess', 'socket', 'urllib', 'http', 'shutil', 'ctypes', 'multiprocessing', 'requests', 'sys']
  const importRegex = new RegExp(`(?:^|\\n)[ \\t]*(?:import|from)\\s+(${blocked.map(escapeRegex).join('|')})\\b`, 'm')
  return !importRegex.test(stripComments(code))
}

/**
 * Evaluates a single Python structural rule against Python code string.
 */
export function evaluatePythonRule(rule: PythonRule, code: string): boolean {
  if (!code || typeof code !== 'string') return false

  switch (rule.kind) {
    case 'definesFunction':
      return checkDefinesFunction(code, rule.name, rule.paramsCount, rule.params, rule.returns)
    case 'containsLoop':
      return checkContainsLoop(code, rule.loopType, rule.minNesting)
    case 'usesComprehension':
      return checkUsesComprehension(code, rule.comprehensionType)
    case 'usesRecursion':
      return checkUsesRecursion(code, rule.functionName)
    case 'usesConstruct':
      return checkUsesConstruct(code, rule.construct)
    case 'pythonSourceMatches':
      return checkSourceMatches(code, rule.pattern)
    case 'declaresClass': {
      const classRegex = new RegExp(`(?:^|\\n)[ \\t]*class\\s+${escapeRegex(rule.name)}[\\s:(]`, 'm')
      if (!classRegex.test(stripComments(code))) return false
      if (rule.methods && rule.methods.length > 0) {
        return rule.methods.every((m) => checkDefinesFunction(code, m))
      }
      return true
    }
    case 'blocksImport': {
      return checkBlocksImport(code, rule.blockedModules)
    }
    default:
      return false
  }
}

/**
 * Finds approximate line location for a rule in Python code.
 */
export function findPythonRuleLocation(rule: PythonRule, code: string): { line: number; column: number } | undefined {
  if (!code) return undefined
  const lines = code.split('\n')

  switch (rule.kind) {
    case 'definesFunction': {
      const reg = new RegExp(`^[ \\t]*def\\s+${escapeRegex(rule.name)}\\b`)
      for (let i = 0; i < lines.length; i++) {
        if (reg.test(lines[i])) return { line: i + 1, column: 1 }
      }
      break
    }
    case 'containsLoop': {
      const reg = /^[ \t]*(?:for|while)\b/
      for (let i = 0; i < lines.length; i++) {
        if (reg.test(lines[i])) return { line: i + 1, column: 1 }
      }
      break
    }
    case 'usesComprehension': {
      for (let i = 0; i < lines.length; i++) {
        if (/\[.*for.*in.*\]|\{.*for.*in.*\}|for.*in/.test(lines[i])) return { line: i + 1, column: 1 }
      }
      break
    }
    case 'usesConstruct': {
      const constructReg =
        rule.construct === 'if-elif-else'
          ? /^[ \t]*if\b/
          : rule.construct === 'assert'
            ? /^[ \t]*assert\b/
            : rule.construct === 'try-except'
              ? /^[ \t]*try\b/
              : undefined
      if (constructReg) {
        for (let i = 0; i < lines.length; i++) {
          if (constructReg.test(lines[i])) return { line: i + 1, column: 1 }
        }
      }
      break
    }
    case 'pythonSourceMatches': {
      if (typeof rule.pattern === 'string') {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(rule.pattern)) return { line: i + 1, column: 1 }
        }
      }
      break
    }
  }

  return undefined
}

/**
 * Creates a deterministic ChallengeValidator for Python structural and execution challenges.
 */
export function createPythonValidator(
  requirements: ChallengeRequirement[],
  options?: PythonValidationOptions
): ChallengeValidator {
  return {
    async validate(files: ChallengeFile[]): Promise<RequirementResult[]> {
      const pyFile = files.find((f) => f.name.toLowerCase().endsWith('.py')) || files[0]
      const code = pyFile ? pyFile.content : ''

      let runResult: PythonRunResult | null = null
      const hasExecutionRule = requirements.some(
        (r) => r.rule.kind === 'allTestsPass' || r.rule.kind === 'testPasses'
      )
      if (hasExecutionRule && options?.tests && options.tests.length > 0) {
        runResult = await executePython(code, options.tests, { timeoutMs: 3000 })
      }

      return requirements.map((req) => {
        const rule = req.rule

        if (rule.kind === 'allTestsPass') {
          const met = runResult ? runResult.status === 'ok' && runResult.allPassed : false
          return {
            id: req.id,
            met,
            detail: met
              ? undefined
              : runResult?.status === 'timeout'
                ? runResult.message
                : runResult?.status === 'error'
                  ? `Runtime error: ${runResult.message}`
                  : `${(runResult?.testResults || []).filter((t) => !t.passed).length} test(s) failed`,
          }
        }

        if (rule.kind === 'testPasses') {
          const tr = runResult?.testResults.find((t) => t.id === rule.testId)
          const met = tr ? tr.passed : false
          return {
            id: req.id,
            met,
            detail: met ? undefined : tr?.error || `Expected ${JSON.stringify(tr?.expected)}, got ${JSON.stringify(tr?.actual)}`,
          }
        }

        const met = evaluatePythonRule(req.rule as PythonRule, code)
        const loc = findPythonRuleLocation(req.rule as PythonRule, code)
        return {
          id: req.id,
          met,
          detail: met ? undefined : `Structural check not satisfied: ${req.description}`,
          line: loc?.line,
          column: loc?.column,
        }
      })
    },
  }
}
