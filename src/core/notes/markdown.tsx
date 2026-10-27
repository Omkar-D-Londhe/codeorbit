import React from 'react'

/**
 * Validates a link target against the safe protocol allowlist (http, https, relative, anchor).
 * Disallows javascript:, data:, vbscript:, and any arbitrary schemes.
 */
export function isSafeUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false
  const trimmed = rawUrl.trim()
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.startsWith('#')) {
    return true
  }

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Parses inline Markdown tokens:
 * - `code`
 * - **bold**
 * - *italic* or _italic_
 * - [label](url) (strictly validated safe URLs only)
 *
 * All raw HTML tags (e.g. <script>, <img>) remain inert plain text strings.
 * Never uses dangerouslySetInnerHTML.
 */
export function parseInlineMarkdown(text: string, keyPrefix: string = 'inline'): React.ReactNode[] {
  if (!text) return []

  // Token pattern matching inline code, bold, italic, and links
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|\[(?:[^\]]+)\]\((?:[^)]+)\))/g
  const parts = text.split(pattern)
  const nodes: React.ReactNode[] = []

  parts.forEach((part, idx) => {
    if (!part) return
    const key = `${keyPrefix}-${idx}`

    // 1. Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      nodes.push(<code key={key} className="tok-code-inline">{part.slice(1, -1)}</code>)
      return
    }

    // 2. Bold: **bold**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2)
      nodes.push(<strong key={key}>{parseInlineMarkdown(inner, `${key}-b`)}</strong>)
      return
    }

    // 3. Italic: *italic* or _italic_
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
    ) {
      const inner = part.slice(1, -1)
      nodes.push(<em key={key}>{parseInlineMarkdown(inner, `${key}-i`)}</em>)
      return
    }

    // 4. Links: [label](url)
    const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
    if (linkMatch) {
      const [, label, url] = linkMatch
      const cleanUrl = url.trim()
      if (isSafeUrl(cleanUrl)) {
        nodes.push(
          <a
            key={key}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="markdown-link hover-underline"
          >
            {label}
          </a>
        )
        return
      }
      // If unsafe url (e.g. javascript: or data:), render as plain text string
      nodes.push(part)
      return
    }

    // 5. Plain text (React safely escapes all text nodes, rendering raw HTML as inert text)
    nodes.push(part)
  })

  return nodes
}

/**
 * Renders a safe Markdown subset into a hierarchy of React elements:
 * - Fenced code blocks (``` ... ```)
 * - Headings (#, ##, ###)
 * - Lists (unordered -/*, ordered 1.)
 * - Paragraphs
 *
 * Fully resilient against XSS. Never outputs raw HTML strings or dangerouslySetInnerHTML.
 */
export function renderMarkdown(markdown: string): React.ReactNode {
  if (!markdown || typeof markdown !== 'string') return null

  const lines = markdown.split(/\r?\n/)
  const elements: React.ReactNode[] = []

  let inCodeBlock = false
  let codeBuffer: string[] = []
  let codeBlockIndex = 0

  let inList: 'ul' | 'ol' | null = null
  let listItems: React.ReactNode[] = []
  let listIndex = 0

  const flushList = () => {
    if (!inList || listItems.length === 0) {
      inList = null
      listItems = []
      return
    }
    const key = `list-${listIndex++}`
    if (inList === 'ul') {
      elements.push(<ul key={key} className="markdown-list markdown-list--ul">{listItems}</ul>)
    } else {
      elements.push(<ol key={key} className="markdown-list markdown-list--ol">{listItems}</ol>)
    }
    inList = null
    listItems = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // 1. Fenced Code Block handling
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        elements.push(
          <pre key={`codeblock-${codeBlockIndex++}`} className="code-block markdown-pre">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        )
        codeBuffer = []
        inCodeBlock = false
      } else {
        // Open code block
        flushList()
        inCodeBlock = true
        codeBuffer = []
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      continue
    }

    // Empty line flushes active list
    if (trimmed === '') {
      flushList()
      continue
    }

    // 2. Headings
    if (trimmed.startsWith('#')) {
      flushList()
      if (trimmed.startsWith('### ')) {
        elements.push(<h5 key={`h5-${i}`} className="markdown-h5">{parseInlineMarkdown(trimmed.slice(4))}</h5>)
        continue
      }
      if (trimmed.startsWith('## ')) {
        elements.push(<h4 key={`h4-${i}`} className="markdown-h4">{parseInlineMarkdown(trimmed.slice(3))}</h4>)
        continue
      }
      if (trimmed.startsWith('# ')) {
        elements.push(<h3 key={`h3-${i}`} className="markdown-h3">{parseInlineMarkdown(trimmed.slice(2))}</h3>)
        continue
      }
    }

    // 3. Unordered list: - or *
    const ulMatch = /^[-*]\s+(.+)$/.exec(trimmed)
    if (ulMatch) {
      if (inList !== 'ul') {
        flushList()
        inList = 'ul'
      }
      listItems.push(<li key={`li-${i}`}>{parseInlineMarkdown(ulMatch[1])}</li>)
      continue
    }

    // 4. Ordered list: 1. or 2.
    const olMatch = /^\d+\.\s+(.+)$/.exec(trimmed)
    if (olMatch) {
      if (inList !== 'ol') {
        flushList()
        inList = 'ol'
      }
      listItems.push(<li key={`li-${i}`}>{parseInlineMarkdown(olMatch[1])}</li>)
      continue
    }

    // 5. Standard paragraph
    flushList()
    elements.push(<p key={`p-${i}`} className="markdown-p">{parseInlineMarkdown(line)}</p>)
  }

  // Flush any trailing list or unclosed code block
  flushList()
  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <pre key={`codeblock-${codeBlockIndex}`} className="code-block markdown-pre">
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    )
  }

  return <div className="markdown-content">{elements}</div>
}
