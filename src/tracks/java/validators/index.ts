import type { ChallengeRequirement } from '../../../data/types'
import type { ChallengeFile, ChallengeValidator, RequirementResult } from '../../../core/content/types'

export type JavaRule =
  | { kind: 'definesClass'; name: string }
  | { kind: 'definesMethod'; name: string; returnType?: string; paramsCount?: number; isStatic?: boolean }
  | { kind: 'containsLoop'; loopType?: 'for' | 'while' | 'enhanced-for' | 'any'; minNesting?: number }
  | { kind: 'usesRecursion'; methodName: string }
  | { kind: 'usesConstruct'; construct: 'if-else' | 'switch' | 'try-catch' | 'enhanced-for' | 'private-field' }
  | { kind: 'javaSourceMatches'; pattern: string | RegExp }

const MAX_LINES = 1000
const MAX_BYTES = 50 * 1024

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Strips single-line and multi-line comments from Java source code safely.
 */
export function stripJavaComments(code: string): string {
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

export function checkDefinesClass(code: string, name: string, extendsClass?: string): boolean {
  const stripped = stripJavaComments(code)
  const escaped = escapeRegex(name)
  if (extendsClass) {
    const escapedExt = escapeRegex(extendsClass)
    return new RegExp(`\\bclass\\s+${escaped}\\s+extends\\s+${escapedExt}\\b`, 'm').test(stripped)
  }
  const pattern = new RegExp(`\\bclass\\s+${escaped}\\b`, 'm')
  return pattern.test(stripped)
}

export function checkDefinesMethod(
  code: string,
  name: string,
  returnTypeOrOptions?: string | { returnType?: string; paramsCount?: number; isStatic?: boolean },
  paramsCount?: number,
  isStatic?: boolean,
): boolean {
  const stripped = stripJavaComments(code)
  const escapedName = escapeRegex(name)
  const options =
    typeof returnTypeOrOptions === 'string'
      ? { returnType: returnTypeOrOptions, paramsCount, isStatic }
      : returnTypeOrOptions

  const modifiers = '(?:\\b(?:public|private|protected|static|final|abstract|synchronized)\\s+)*'
  const retPart = options?.returnType ? `\\b${escapeRegex(options.returnType)}\\s+` : '[\\w<>\\[\\]]+\\s+'
  const methodRegex = new RegExp(`${modifiers}${retPart}${escapedName}\\s*\\(([^)]*)\\)`, 'gm')
  const matches = [...stripped.matchAll(methodRegex)]
  if (matches.length === 0) return false

  const filtered = matches.filter((m) => {
    if (options?.isStatic !== undefined) {
      const hasStatic = /\bstatic\b/.test(m[0])
      if (hasStatic !== options.isStatic) return false
    }
    if (options?.paramsCount !== undefined) {
      const rawParams = m[1].trim()
      const count = rawParams === '' ? 0 : rawParams.split(',').length
      if (count !== options.paramsCount) return false
    }
    return true
  })

  return filtered.length > 0
}

export const definesClass = checkDefinesClass
export const definesMethod = checkDefinesMethod
export const containsLoop = checkContainsLoop
export const usesRecursion = checkUsesRecursion
export const usesConstruct = checkUsesConstruct

export function checkContainsLoop(
  code: string,
  loopType: 'for' | 'while' | 'enhanced-for' | 'any' = 'any',
  minNesting = 1
): boolean {
  const stripped = stripJavaComments(code)

  if (loopType === 'enhanced-for') {
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

export function checkUsesRecursion(code: string, methodName: string): boolean {
  const stripped = stripJavaComments(code)
  const escapedName = escapeRegex(methodName)
  const defPattern = new RegExp(`[\\w<>\\[\\]]+\\s+${escapedName}\\s*\\([^)]*\\)\\s*\\{`, 'm')
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
  construct: 'if-else' | 'switch' | 'try-catch' | 'enhanced-for' | 'private-field'
): boolean {
  const stripped = stripJavaComments(code)
  switch (construct) {
    case 'if-else':
      return /\bif\s*\(/.test(stripped) && /\belse\b/.test(stripped)
    case 'switch':
      return /\bswitch\s*\(/.test(stripped) && /\bcase\b/.test(stripped)
    case 'try-catch':
      return /\btry\s*\{/.test(stripped) && /\bcatch\s*\(/.test(stripped)
    case 'enhanced-for':
      return /\bfor\s*\([^;:]+:[^)]+\)/.test(stripped)
    case 'private-field':
      return /\bprivate\s+[\w<>[\]]+\s+\w+\s*;/.test(stripped)
    default:
      return false
  }
}

export function findJavaRuleLocation(code: string, rule: JavaRule | Record<string, unknown>): { line: number; column: number } | null {
  const lines = code.split('\n')
  const rKind = ((rule as { kind?: string }).kind || (rule as { check?: string }).check) as string
  const rName = ((rule as { name?: string }).name || '')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (rKind === 'definesClass' && new RegExp(`\\bclass\\s+${escapeRegex(rName)}\\b`).test(line)) {
      return { line: i + 1, column: line.indexOf('class') + 1 }
    }
    if (rKind === 'definesMethod' && new RegExp(`\\b${escapeRegex(rName)}\\s*\\(`).test(line)) {
      return { line: i + 1, column: line.indexOf(rName) + 1 }
    }
    if (rKind === 'containsLoop' && /\b(for|while)\s*\(/.test(line)) {
      const match = /\b(for|while)\b/.exec(line)
      return { line: i + 1, column: (match ? match.index : 0) + 1 }
    }
    if (rKind === 'usesRecursion' && new RegExp(`\\b${escapeRegex((rule as { methodName?: string }).methodName || rName)}\\s*\\(`).test(line)) {
      const target = (rule as { methodName?: string }).methodName || rName
      return { line: i + 1, column: line.indexOf(target) + 1 }
    }
    if (rKind === 'javaSourceMatches' && typeof (rule as { pattern?: unknown }).pattern === 'string' && line.includes((rule as { pattern: string }).pattern)) {
      return { line: i + 1, column: line.indexOf((rule as { pattern: string }).pattern) + 1 }
    }
  }
  return null
}

export function evaluateJavaRule(code: string, rule: JavaRule): boolean {
  if (code.length > MAX_BYTES || code.split('\n').length > MAX_LINES) {
    return false
  }

  switch (rule.kind) {
    case 'definesClass':
      return checkDefinesClass(code, rule.name)
    case 'definesMethod':
      return checkDefinesMethod(code, rule.name, {
        returnType: rule.returnType,
        paramsCount: rule.paramsCount,
        isStatic: rule.isStatic,
      })
    case 'containsLoop':
      return checkContainsLoop(code, rule.loopType, rule.minNesting)
    case 'usesRecursion':
      return checkUsesRecursion(code, rule.methodName)
    case 'usesConstruct':
      return checkUsesConstruct(code, rule.construct)
    case 'javaSourceMatches': {
      const stripped = stripJavaComments(code)
      if (typeof rule.pattern === 'string') {
        return stripped.includes(rule.pattern)
      }
      return rule.pattern.test(stripped)
    }
    default:
      return false
  }
}

export function createJavaValidator(requirements: ChallengeRequirement[]): ChallengeValidator {
  return {
    async validate(files: ChallengeFile[]): Promise<RequirementResult[]> {
      const javaFile = files.find((f) => f.name.endsWith('.java')) || files[0]
      const code = javaFile ? javaFile.content : ''

      return requirements.map((req) => {
        const rule = req.rule as unknown as JavaRule
        const met = evaluateJavaRule(code, rule)
        const loc = findJavaRuleLocation(code, rule)
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
