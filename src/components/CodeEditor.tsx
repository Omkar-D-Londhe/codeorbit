import { useMemo } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  label?: string
}

/**
 * Plain textarea with a line-number gutter. Tab is intentionally NOT captured so keyboard users
 * are never trapped in the editor.
 */
export function CodeEditor({ value, onChange, label = 'HTML editor' }: Props) {
  const lines = value.split('\n')
  const maxLen = useMemo(() => lines.reduce((m, l) => Math.max(m, l.length), 0), [lines])
  return (
    <div className="editor">
      <div className="editor__scroll">
        <div className="editor__gutter" aria-hidden="true">
          {lines.map((_, i) => <span key={i}>{i + 1}</span>)}
        </div>
        <textarea
          className="editor__input"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          rows={lines.length}
          style={{ width: `calc(${Math.max(maxLen, 20)}ch + 32px)` }}
        />
      </div>
    </div>
  )
}
