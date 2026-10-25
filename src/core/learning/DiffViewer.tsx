import { useMemo } from 'react'
import { diffLines, type DiffLine } from './diff'

export interface DiffViewerProps {
  myCode: string
  referenceCode: string
  solutionRevealed: boolean
  className?: string
}

/**
 * Diff Viewer (6.4)
 * Shows line-by-line comparison between learner draft and reference solution.
 * Uses '+' / '−' gutter glyph markers and distinct styling (not color-only).
 * Disabled with helpful message if solution has not been revealed yet.
 */
export function DiffViewer({
  myCode,
  referenceCode,
  solutionRevealed,
  className = '',
}: DiffViewerProps) {
  const diff = useMemo(() => {
    if (!solutionRevealed) return null
    return diffLines(myCode, referenceCode)
  }, [myCode, referenceCode, solutionRevealed])

  if (!solutionRevealed) {
    return (
      <div
        className={`diff-viewer diff-viewer--locked ${className}`}
        style={{
          padding: '24px',
          textAlign: 'center',
          background: 'var(--c-surface-1, #0f0e1a)',
          border: '1px dashed var(--c-border-strong, #2c2942)',
          borderRadius: 'var(--r-md, 8px)',
          color: 'var(--c-text-muted, #85839b)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 500 }}>
          Diff viewer is locked.
        </p>
        <p className="small muted" style={{ marginTop: '6px' }}>
          Reveal the reference solution first to compare your draft line-by-line.
        </p>
      </div>
    )
  }

  if (diff?.tooLarge) {
    return (
      <div
        className={`diff-viewer diff-viewer--warning ${className}`}
        style={{
          padding: '20px',
          background: 'var(--c-surface-1, #0f0e1a)',
          border: '1px solid var(--c-warning, #f59e0b)',
          borderRadius: 'var(--r-md, 8px)',
          color: 'var(--c-text, #f1f0f7)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>File too large to compare</p>
        <p className="small muted" style={{ marginTop: '4px' }}>
          Code exceeds 2,000 lines limit for line-by-line comparison.
        </p>
      </div>
    )
  }

  if (diff?.identical) {
    return (
      <div
        className={`diff-viewer diff-viewer--identical ${className}`}
        style={{
          padding: '20px',
          background: 'var(--c-surface-1, #0f0e1a)',
          border: '1px solid var(--c-success, #10b981)',
          borderRadius: 'var(--r-md, 8px)',
          color: 'var(--c-success, #10b981)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>Identical to reference solution</p>
        <p className="small" style={{ marginTop: '4px', color: 'var(--c-text-muted, #85839b)' }}>
          Your draft matches the reference solution line-for-line.
        </p>
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-label="Code comparison with reference solution"
      className={`diff-viewer ${className}`}
      style={{
        border: '1px solid var(--c-border, #1f1d2e)',
        borderRadius: 'var(--r-md, 8px)',
        overflow: 'hidden',
        background: 'var(--c-bg, #08080e)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 'var(--fs-code, 13px)',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          background: 'var(--c-surface-1, #0f0e1a)',
          borderBottom: '1px solid var(--c-border, #1f1d2e)',
          fontSize: 'var(--fs-small, 12px)',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--c-text, #f1f0f7)' }}>
          My Code vs Reference Solution
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ color: 'var(--c-success, #10b981)', fontWeight: 600 }}>
            +{diff?.additions} added
          </span>
          <span style={{ color: 'var(--c-danger, #ef4444)', fontWeight: 600 }}>
            −{diff?.deletions} removed
          </span>
        </div>
      </div>

      {/* Diff line table */}
      <div
        style={{
          maxHeight: '380px',
          overflowY: 'auto',
          lineHeight: '1.6',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <tbody>
            {diff?.lines.map((line: DiffLine, idx: number) => {
              const isAdd = line.kind === 'add'
              const isDel = line.kind === 'del'
              const bg = isAdd
                ? 'rgba(16, 185, 129, 0.12)'
                : isDel
                ? 'rgba(239, 68, 68, 0.12)'
                : 'transparent'
              const color = isAdd
                ? 'var(--c-success, #10b981)'
                : isDel
                ? 'var(--c-danger, #ef4444)'
                : 'var(--c-text, #f1f0f7)'
              const marker = isAdd ? '+' : isDel ? '−' : ' '

              return (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: bg,
                  }}
                >
                  <td
                    style={{
                      width: '42px',
                      padding: '0 8px',
                      textAlign: 'right',
                      userSelect: 'none',
                      color: 'var(--c-text-quiet, #535166)',
                      borderRight: '1px solid var(--c-border, #1f1d2e)',
                    }}
                  >
                    {line.aLine ?? ''}
                  </td>
                  <td
                    style={{
                      width: '42px',
                      padding: '0 8px',
                      textAlign: 'right',
                      userSelect: 'none',
                      color: 'var(--c-text-quiet, #535166)',
                      borderRight: '1px solid var(--c-border, #1f1d2e)',
                    }}
                  >
                    {line.bLine ?? ''}
                  </td>
                  <td
                    style={{
                      width: '24px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      userSelect: 'none',
                      color,
                    }}
                  >
                    {marker}
                  </td>
                  <td
                    style={{
                      padding: '0 8px',
                      whiteSpace: 'pre',
                      color,
                      overflowX: 'auto',
                    }}
                  >
                    {line.text}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
