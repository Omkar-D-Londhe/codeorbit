import { useState } from 'react'
import { Icon } from './Icon'
import { useToast } from './Toast'

type Token = { text: string; cls?: string }

/** Tiny HTML tokenizer for display only. Output is rendered as React text nodes (never as markup). */
export function tokenizeHtml(src: string): Token[] {
  const tokens: Token[] = []
  const re = /(<!--[\s\S]*?-->)|(<!DOCTYPE[^>]*>)|(<\/?[A-Za-z][^\s>/]*)((?:[^>"']|"[^"]*"|'[^']*')*)(\/?>)/gi
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) {
    if (m.index > last) tokens.push({ text: src.slice(last, m.index) })
    if (m[1]) tokens.push({ text: m[1], cls: 'tok-comment' })
    else if (m[2]) tokens.push({ text: m[2], cls: 'tok-doctype' })
    else {
      tokens.push({ text: m[3], cls: 'tok-tag' })
      const attrs = m[4] ?? ''
      const ar = /(\s+)([^\s=]+)(?:(=)("[^"]*"|'[^']*'|[^\s"'>]+))?/g
      let a: RegExpExecArray | null
      let al = 0
      while ((a = ar.exec(attrs))) {
        if (a.index > al) tokens.push({ text: attrs.slice(al, a.index) })
        tokens.push({ text: a[1] })
        tokens.push({ text: a[2], cls: 'tok-attr' })
        if (a[3]) { tokens.push({ text: a[3] }); tokens.push({ text: a[4], cls: 'tok-string' }) }
        al = ar.lastIndex
      }
      if (al < attrs.length) tokens.push({ text: attrs.slice(al) })
      tokens.push({ text: m[5], cls: 'tok-tag' })
    }
    last = re.lastIndex
  }
  if (last < src.length) tokens.push({ text: src.slice(last) })
  return tokens
}

interface Props {
  code: string
  label?: string
  /** Show a working Copy button. */
  copyable?: boolean
}

export function CodeBlock({ code, label, copyable = true }: Props) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.show('Code copied to the clipboard.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.show('Copying is not available in this browser. Select the code and copy it manually.', 'warning')
    }
  }

  return (
    <figure className="code-block">
      {(label || copyable) && (
        <figcaption className="code-block__bar">
          <span className="code-block__label">{label ?? 'HTML'}</span>
          {copyable && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={copy} aria-live="polite">
              <Icon name={copied ? 'check' : 'copy'} size={16} />
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </figcaption>
      )}
      <pre tabIndex={0} aria-label={label ? `${label} code` : 'Code'}>
        <code>
          {tokenizeHtml(code).map((t, i) => (t.cls ? <span key={i} className={t.cls}>{t.text}</span> : <span key={i}>{t.text}</span>))}
        </code>
      </pre>
    </figure>
  )
}
