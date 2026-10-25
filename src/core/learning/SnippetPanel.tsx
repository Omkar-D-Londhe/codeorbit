import { useState } from 'react'
import type { Snippet } from '../../tracks/html/snippets'

export interface SnippetPanelProps {
  snippets: Snippet[]
  onInsert: (code: string) => void
  onClose?: () => void
  className?: string
}

/**
 * Code Snippet Library Panel (6.9)
 * Surfaces reusable, accessible boilerplate code snippets.
 * Clicking a snippet inserts it directly at the editor's cursor position.
 */
export function SnippetPanel({
  snippets,
  onInsert,
  onClose,
  className = '',
}: SnippetPanelProps) {
  const [filter, setFilter] = useState('')

  const filtered = snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(filter.toLowerCase()) ||
      s.description.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div
      className={`snippet-panel ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        gap: '12px',
        background: 'var(--c-surface-1, #0f0e1a)',
        color: 'var(--c-text, #f1f0f7)',
      }}
    >
      <p className="small muted" style={{ margin: '0 0 4px 0' }}>
        Click to insert at the current cursor position.
      </p>

      <input
        type="search"
        placeholder="Filter snippets..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        aria-label="Filter snippets"
        style={{
          width: '100%',
          padding: '8px 12px',
          background: 'var(--c-bg, #08080e)',
          border: '1px solid var(--c-border, #1f1d2e)',
          borderRadius: 'var(--r-sm, 4px)',
          color: 'var(--c-text, #f1f0f7)',
          fontSize: 'var(--fs-small, 13px)',
        }}
      />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gap: '8px',
          alignContent: 'start',
        }}
      >
        {filtered.length === 0 ? (
          <p className="muted small" style={{ textAlign: 'center', padding: '24px 0' }}>
            No snippets match your filter.
          </p>
        ) : (
          filtered.map((snip) => (
            <div
              key={snip.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '12px',
                borderRadius: 'var(--r-md, 6px)',
                border: '1px solid var(--c-border, #1f1d2e)',
                background: 'var(--c-surface-2, #161524)',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--fs-small, 13px)' }}>
                  {snip.title}
                </span>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  style={{ minHeight: '26px', padding: '2px 10px', fontSize: 'var(--fs-meta, 11px)' }}
                  onClick={() => {
                    onInsert(snip.code)
                    onClose?.()
                  }}
                >
                  Insert
                </button>
              </div>
              <p className="muted small" style={{ margin: 0, fontSize: 'var(--fs-meta, 12px)' }}>
                {snip.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
