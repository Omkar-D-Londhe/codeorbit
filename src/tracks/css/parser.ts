/**
 * Lightweight, safe CSS Parser for CodeOrbit CSS Track (Stage 22).
 * Operates purely on text in the host environment — never throws.
 * Caps input size at 50 kB as a security/performance guard.
 */

export interface ParsedDeclaration {
  property: string
  value: string
  line: number
}

export interface ParsedRule {
  selector: string
  declarations: Record<string, string>
  declarationList: ParsedDeclaration[]
  specificity: [number, number, number]
  line: number
}

export interface ParsedMediaRule {
  params: string
  rules: ParsedRule[]
  line: number
}

export interface ParseCssResult {
  rules: ParsedRule[]
  mediaRules: ParsedMediaRule[]
  errors: string[]
}

const MAX_CSS_SIZE = 50 * 1024 // 50 kB

/**
 * Calculates standard CSS specificity tuple: [IDs, Classes/Attributes/Pseudos, Elements/Pseudos].
 * Example: 'nav a:hover' => [0, 1, 2]
 */
export function calculateSpecificity(selector: string): [number, number, number] {
  let ids = 0
  let classes = 0
  let types = 0

  // Remove content of :not(...) or :is(...) to count internal selectors
  const clean = selector.replace(/:not\(([^)]*)\)/gi, ' $1 ')

  // Count IDs: #something
  const idMatches = clean.match(/#[a-zA-Z0-9_-]+/g)
  if (idMatches) ids += idMatches.length

  // Count pseudo-elements first (::before, ::after) to prevent collision with single-colon pseudos
  const pseudoElemMatches = clean.match(/::[a-zA-Z0-9_-]+/g)
  if (pseudoElemMatches) types += pseudoElemMatches.length

  // Count classes: .something
  const classMatches = clean.match(/\.[a-zA-Z0-9_-]+/g)
  if (classMatches) classes += classMatches.length

  // Count attributes: [attr]
  const attrMatches = clean.match(/\[[^\]]+\]/g)
  if (attrMatches) classes += attrMatches.length

  // Count single-colon pseudo-classes: :hover, :focus, etc. (ignoring ::)
  const pseudoClassMatches = clean.replace(/::[a-zA-Z0-9_-]+/g, '').match(/:[a-zA-Z0-9_-]+/g)
  if (pseudoClassMatches) classes += pseudoClassMatches.length

  // Count type selectors: element tags
  // Remove IDs, classes, attributes, pseudo-classes, combinators, and wildcards
  const tagString = clean
    .replace(/#[a-zA-Z0-9_-]+/g, ' ')
    .replace(/\.[a-zA-Z0-9_-]+/g, ' ')
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/::?[a-zA-Z0-9_-]+/g, ' ')
    .replace(/[>+~*|,]/g, ' ')
    .trim()

  const words = tagString.split(/\s+/).filter(Boolean)
  types += words.length

  return [ids, classes, types]
}

/**
 * Compares two specificity tuples: returns true if 'spec' is strictly <= 'max'.
 */
export function isSpecificityBelowOrEqual(
  spec: [number, number, number],
  max: [number, number, number]
): boolean {
  if (spec[0] > max[0]) return false
  if (spec[0] < max[0]) return true

  if (spec[1] > max[1]) return false
  if (spec[1] < max[1]) return true

  return spec[2] <= max[2]
}

/**
 * Parses raw CSS string into rules and media blocks. Never throws.
 */
export function parseCss(source: string): ParseCssResult {
  const result: ParseCssResult = {
    rules: [],
    mediaRules: [],
    errors: [],
  }

  if (!source || typeof source !== 'string') {
    return result
  }

  if (source.length > MAX_CSS_SIZE) {
    result.errors.push(`CSS exceeds maximum permitted size of 50 kB (${source.length} bytes).`)
    return result
  }

  try {
    // 1. Remove comments while preserving newline structure for accurate line counting
    const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      const newlines = match.match(/\n/g)
      return newlines ? newlines.join('') : ' '
    })

    // Helper: calculate 1-based line number from character offset
    const getLine = (offset: number): number => {
      return (withoutComments.slice(0, offset).match(/\n/g) || []).length + 1
    }

    // Parse declaration block inside braces
    const parseDeclarations = (block: string, baseOffset: number): { dict: Record<string, string>; list: ParsedDeclaration[] } => {
      const dict: Record<string, string> = {}
      const list: ParsedDeclaration[] = []
      const parts = block.split(';')

      let currentOffset = baseOffset
      for (const part of parts) {
        const colonIdx = part.indexOf(':')
        if (colonIdx > 0) {
          const prop = part.slice(0, colonIdx).trim().toLowerCase()
          const val = part.slice(colonIdx + 1).trim()
          if (prop && val) {
            dict[prop] = val
            list.push({ property: prop, value: val, line: getLine(currentOffset) })
          }
        }
        currentOffset += part.length + 1
      }
      return { dict, list }
    }

    // Tokenize blocks: handles nested single-level braces (e.g. @media { rule { ... } })
    let cursor = 0
    const len = withoutComments.length

    while (cursor < len) {
      // Skip whitespace
      while (cursor < len && /\s/.test(withoutComments[cursor])) cursor++
      if (cursor >= len) break

      const start = cursor

      // Check for @media at-rule
      if (withoutComments.slice(cursor, cursor + 6).toLowerCase() === '@media') {
        const mediaStartLine = getLine(cursor)
        const openBrace = withoutComments.indexOf('{', cursor)
        if (openBrace === -1) {
          result.errors.push(`Unclosed @media block near line ${mediaStartLine}`)
          break
        }

        const params = withoutComments.slice(cursor + 6, openBrace).trim()
        cursor = openBrace + 1

        // Find matching closing brace for the media block
        let depth = 1
        let mediaEnd = -1
        while (cursor < len && depth > 0) {
          if (withoutComments[cursor] === '{') depth++
          else if (withoutComments[cursor] === '}') {
            depth--
            if (depth === 0) {
              mediaEnd = cursor
              break
            }
          }
          cursor++
        }

        if (mediaEnd === -1) {
          result.errors.push(`Unclosed @media block matching '{' at line ${mediaStartLine}`)
          break
        }

        // Inner CSS rules inside the media query
        const innerCss = withoutComments.slice(openBrace + 1, mediaEnd)
        const innerParsed = parseCss(innerCss)
        result.mediaRules.push({
          params,
          rules: innerParsed.rules,
          line: mediaStartLine,
        })

        cursor = mediaEnd + 1
        continue
      }

      // Other at-rules (like @import, @charset, @keyframes) - ignore safely
      if (withoutComments[cursor] === '@') {
        const semi = withoutComments.indexOf(';', cursor)
        const openBrace = withoutComments.indexOf('{', cursor)
        if (semi !== -1 && (openBrace === -1 || semi < openBrace)) {
          cursor = semi + 1
          continue
        } else if (openBrace !== -1) {
          // Skip nested block
          let depth = 1
          cursor = openBrace + 1
          while (cursor < len && depth > 0) {
            if (withoutComments[cursor] === '{') depth++
            else if (withoutComments[cursor] === '}') depth--
            cursor++
          }
          continue
        }
      }

      // Standard CSS rule: selector { declarations }
      const openBrace = withoutComments.indexOf('{', cursor)
      if (openBrace === -1) {
        // Trailing loose text without a brace
        break
      }

      const selectorText = withoutComments.slice(start, openBrace).trim()
      const ruleLine = getLine(start)
      const closeBrace = withoutComments.indexOf('}', openBrace)
      if (closeBrace === -1) {
        result.errors.push(`Unclosed CSS rule block near line ${ruleLine}`)
        break
      }

      const bodyText = withoutComments.slice(openBrace + 1, closeBrace)
      const { dict, list } = parseDeclarations(bodyText, openBrace + 1)

      // Split comma-separated selectors (e.g. h1, h2, h3)
      const subSelectors = selectorText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      for (const sel of subSelectors) {
        result.rules.push({
          selector: sel,
          declarations: dict,
          declarationList: list,
          specificity: calculateSpecificity(sel),
          line: ruleLine,
        })
      }

      cursor = closeBrace + 1
    }
  } catch (err) {
    result.errors.push(`CSS parsing error: ${String(err)}`)
  }

  return result
}
