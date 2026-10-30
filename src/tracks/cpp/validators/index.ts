import type { ChallengeRequirement } from '../../../data/types'
import type { ChallengeFile, ChallengeValidator, RequirementResult } from '../../../core/content/types'

export type CppRule =
  | { kind: 'definesFunction'; name: string; returnType?: string; paramsCount?: number }
  | { kind: 'definesClass'; name: string }
  | { kind: 'containsLoop'; loopType?: 'for' | 'while' | 'range-for' | 'any'; minNesting?: number }
  | { kind: 'usesPointerOrReference'; type?: 'pointer' | 'reference' | 'any' }
  | { kind: 'usesRecursion'; functionName: string }
  | { kind: 'usesConstruct'; construct: 'iostream' | 'cout' | 'nullptr' | 'vector' | 'access-specifier' | 'if-else' | 'if' }
  | { kind: 'cppSourceMatches'; pattern: string | RegExp }

const MAX_LINES = 1000
const MAX_BYTES = 50 * 1024

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Strips single-line and multi-line comments from C++ source code safely.
 */
export function stripCppComments(code: string): string {
  let inBlock = false
  const lines = code.split('\n')
  return lines
    .map((line) => {
      let result = ''
      let inString = false
      let inChar = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const next = line[i + 1]

        if (inBlock) {
          if (char === '*' && next === '/') {
            inBlock = false
            i++ // skip /
          }
          continue
        }

        if (char === '"' && !inChar && line[i - 1] !== '\\') {
          inString = !inString
          result += char
          continue
        }

        if (char === '\'' && !inString && line[i - 1] !== '\\') {
          inChar = !inChar
          result += char
          continue
        }

        if (!inString && !inChar) {
          if (char === '/' && next === '/') {
            break // rest of line is comment
          }
          if (char === '/' && next === '*') {
            inBlock = true
            i++ // skip *
            continue
          }
        }

        result += char
      }
      return result
    })
    .join('\n')
}

export function checkDefinesFunction(
  code: string,
  name: string,
  returnTypeOrOptions?: string | { returnType?: string; paramsCount?: number },
  paramsCount?: number,
): boolean {
  const stripped = stripCppComments(code)
  const escapedName = escapeRegex(name)
  const options =
    typeof returnTypeOrOptions === 'string'
      ? { returnType: returnTypeOrOptions, paramsCount }
      : returnTypeOrOptions

  const modifiers = '(?:\\b(?:inline|static|virtual|constexpr|explicit|friend)\\s+)*'
  const retPart = options?.returnType ? `\\b${escapeRegex(options.returnType)}\\s+` : '[\\w:<>\\[\\]*&]+\\s+'
  const fnRegex = new RegExp(`${modifiers}${retPart}${escapedName}\\s*\\(([^)]*)\\)`, 'gm')
  const matches = [...stripped.matchAll(fnRegex)]
  if (matches.length === 0) return false

  if (options?.paramsCount !== undefined) {
    for (const match of matches) {
      const rawParams = match[1].trim()
      const count = rawParams === '' ? 0 : rawParams.split(',').length
      if (count === options.paramsCount) return true
    }
    return false
  }

  return true
}

export const definesFunction = checkDefinesFunction
export const definesClass = checkDefinesClass
export const containsLoop = checkContainsLoop
export const usesPointerOrReference = checkUsesPointerOrReference
export const usesRecursion = checkUsesRecursion
export const usesConstruct = checkUsesConstruct

export function checkDefinesClass(code: string, name: string): boolean {
  const stripped = stripCppComments(code)
  const escaped = escapeRegex(name)
  const pattern = new RegExp(`\\b(class|struct)\\s+${escaped}\\b`, 'm')
  return pattern.test(stripped)
}

export function checkContainsLoop(
  code: string,
  loopType: 'for' | 'while' | 'range-for' | 'any' = 'any',
  minNesting = 1
): boolean {
  const stripped = stripCppComments(code)

  if (loopType === 'range-for') {
    return /\bfor\s*\([^;:]+:[^)]+\)/.test(stripped)
  }

  if (loopType === 'for') {
    return /\bfor\s*\([^;]+;[^;]+;[^)]*\)/.test(stripped)
  }

  if (loopType === 'while') {
    return /\bwhile\s*\([^)]+\)/.test(stripped)
  }

  if (minNesting > 1) {
    const lines = stripped.split('\n')
    let currentDepth = 0
    let maxLoopNesting = 0
    const loopDepths: number[] = []

    for (const line of lines) {
      if (/\b(for|while)\s*\(/.test(line)) {
        loopDepths.push(currentDepth)
        if (loopDepths.length > maxLoopNesting) {
          maxLoopNesting = loopDepths.length
        }
      }
      for (const char of line) {
        if (char === '{') currentDepth++
        if (char === '}') {
          currentDepth--
          while (loopDepths.length > 0 && loopDepths[loopDepths.length - 1] >= currentDepth) {
            loopDepths.pop()
          }
        }
      }
    }
    return maxLoopNesting >= minNesting
  }

  return /\b(for|while)\s*\(/.test(stripped)
}

export function checkUsesPointerOrReference(
  code: string,
  type: 'pointer' | 'reference' | 'any' = 'any'
): boolean {
  const stripped = stripCppComments(code)
  const hasPointer = /\b[\w:]+\s*\*\s*\w+/.test(stripped) || /\*\s*\w+\s*=/.test(stripped)
  const hasReference = /\b[\w:]+\s*&\s*\w+/.test(stripped)

  if (type === 'pointer') return hasPointer
  if (type === 'reference') return hasReference
  return hasPointer || hasReference
}

export function checkUsesRecursion(code: string, functionName: string): boolean {
  const stripped = stripCppComments(code)
  const escapedName = escapeRegex(functionName)
  const defPattern = new RegExp(`[\\w:<>\\[\\]*&]+\\s+${escapedName}\\s*\\([^)]*\\)\\s*\\{`, 'm')
  const match = defPattern.exec(stripped)
  if (!match) return false

  const startIdx = match.index + match[0].length - 1
  let braceCount = 0
  let bodyEndIdx = -1

  for (let i = startIdx; i < stripped.length; i++) {
    if (stripped[i] === '{') braceCount++
    if (stripped[i] === '}') {
      braceCount--
      if (braceCount === 0) {
        bodyEndIdx = i
        break
      }
    }
  }

  if (bodyEndIdx === -1) return false
  const body = stripped.slice(startIdx + 1, bodyEndIdx)
  const callPattern = new RegExp(`\\b${escapedName}\\s*\\(`, 'm')
  return callPattern.test(body)
}

export function checkUsesConstruct(
  code: string,
  construct: 'iostream' | 'cout' | 'nullptr' | 'vector' | 'access-specifier' | 'if-else' | 'if'
): boolean {
  const stripped = stripCppComments(code)
  switch (construct) {
    case 'if-else':
    case 'if':
      return /\bif\s*\(/.test(stripped)
    case 'iostream':
      return /#include\s*<iostream>/.test(stripped)
    case 'cout':
      return /\b(std::)?cout\s*<</.test(stripped)
    case 'nullptr':
      return /\bnullptr\b/.test(stripped)
    case 'vector':
      return /#include\s*<vector>|\b(std::)?vector\s*<[^>]+>/.test(stripped)
    case 'access-specifier':
      return /\b(public|private|protected)\s*:/.test(stripped)
    default:
      return false
  }
}

export function findCppRuleLocation(code: string, rule: CppRule | Record<string, unknown>): { line: number; column: number } | null {
  const lines = code.split('\n')
  const rKind = ((rule as { kind?: string }).kind || (rule as { check?: string }).check) as string
  const rName = ((rule as { name?: string }).name || '')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (rKind === 'definesFunction' && new RegExp(`\\b${escapeRegex(rName)}\\s*\\(`).test(line)) {
      return { line: i + 1, column: line.indexOf(rName) + 1 }
    }
    if (rKind === 'definesClass' && new RegExp(`\\b(class|struct)\\s+${escapeRegex(rName)}\\b`).test(line)) {
      return { line: i + 1, column: line.indexOf(rName) + 1 }
    }
    if (rKind === 'containsLoop' && /\b(for|while)\s*\(/.test(line)) {
      const match = /\b(for|while)\b/.exec(line)
      return { line: i + 1, column: (match ? match.index : 0) + 1 }
    }
    if (rKind === 'usesRecursion' && new RegExp(`\\b${escapeRegex((rule as { functionName?: string }).functionName || rName)}\\s*\\(`).test(line)) {
      const target = (rule as { functionName?: string }).functionName || rName
      return { line: i + 1, column: line.indexOf(target) + 1 }
    }
    if (rKind === 'cppSourceMatches' && typeof (rule as { pattern?: unknown }).pattern === 'string' && line.includes((rule as { pattern: string }).pattern)) {
      return { line: i + 1, column: line.indexOf((rule as { pattern: string }).pattern) + 1 }
    }
  }
  return null
}

export function evaluateCppRule(code: string, rule: CppRule): boolean {
  if (code.length > MAX_BYTES || code.split('\n').length > MAX_LINES) {
    return false
  }

  switch (rule.kind) {
    case 'definesFunction':
      return checkDefinesFunction(code, rule.name, {
        returnType: rule.returnType,
        paramsCount: rule.paramsCount,
      })
    case 'definesClass':
      return checkDefinesClass(code, rule.name)
    case 'containsLoop':
      return checkContainsLoop(code, rule.loopType, rule.minNesting)
    case 'usesPointerOrReference':
      return checkUsesPointerOrReference(code, rule.type)
    case 'usesRecursion':
      return checkUsesRecursion(code, rule.functionName)
    case 'usesConstruct':
      return checkUsesConstruct(code, rule.construct)
    case 'cppSourceMatches': {
      const stripped = stripCppComments(code)
      if (typeof rule.pattern === 'string') {
        return stripped.includes(rule.pattern)
      }
      return rule.pattern.test(stripped)
    }
    default:
      return false
  }
}

export function createCppValidator(requirements: ChallengeRequirement[]): ChallengeValidator {
  return {
    async validate(files: ChallengeFile[]): Promise<RequirementResult[]> {
      const cppFile = files.find((f) => f.name.endsWith('.cpp') || f.name.endsWith('.h')) || files[0]
      const code = cppFile ? cppFile.content : ''

      return requirements.map((req) => {
        const rule = req.rule as unknown as CppRule
        const met = evaluateCppRule(code, rule)
        const loc = findCppRuleLocation(code, rule)
        return {
          id: req.id,
          met,
          detail: req.description,
          line: loc?.line,
          column: loc?.column,
        }
      })
    },
  }
}
