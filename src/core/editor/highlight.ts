/**
 * Static syntax highlighter producing token spans for CodeBlock and read-only code presentation.
 * Supports HTML tokens: tags, attributes, string values, and comments.
 */

export interface HighlightToken {
  text: string
  type?: 'tag' | 'attr' | 'string' | 'comment' | 'punctuation' | 'text'
}

export function highlightHtml(code: string): HighlightToken[] {
  const tokens: HighlightToken[] = []
  let i = 0
  const len = code.length

  while (i < len) {
    // 1. Comments: <!-- ... -->
    if (code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i + 4)
      const text = end === -1 ? code.slice(i) : code.slice(i, end + 3)
      tokens.push({ text, type: 'comment' })
      i += text.length
      continue
    }

    // 2. Tags: <tag or </tag
    if (code[i] === '<') {
      const match = code.slice(i).match(/^<\/?([a-zA-Z0-9-]+)/)
      if (match) {
        tokens.push({ text: match[0], type: 'tag' })
        i += match[0].length

        // Inside tag until '>'
        while (i < len && code[i] !== '>') {
          // Attribute string: "..." or '...'
          if (code[i] === '"' || code[i] === "'") {
            const quote = code[i]
            let j = i + 1
            while (j < len && code[j] !== quote) {
              if (code[j] === '\\' && j + 1 < len) j += 2
              else j++
            }
            const str = code.slice(i, Math.min(len, j + 1))
            tokens.push({ text: str, type: 'string' })
            i += str.length
            continue
          }

          // Attribute name
          const attrMatch = code.slice(i).match(/^([a-zA-Z0-9-:]+)=?/)
          if (attrMatch) {
            tokens.push({ text: attrMatch[0], type: 'attr' })
            i += attrMatch[0].length
            continue
          }

          // Punctuation / spaces
          tokens.push({ text: code[i], type: 'punctuation' })
          i++
        }

        if (i < len && code[i] === '>') {
          tokens.push({ text: '>', type: 'tag' })
          i++
        }
        continue
      }
    }

    // 3. Regular text content
    let nextTag = code.indexOf('<', i)
    if (nextTag === -1) nextTag = len
    const text = code.slice(i, nextTag)
    if (text) {
      tokens.push({ text, type: 'text' })
      i += text.length
    } else {
      tokens.push({ text: code[i], type: 'text' })
      i++
    }
  }

  return tokens
}

export { tokenizeHtml } from '../../components/CodeBlock'
