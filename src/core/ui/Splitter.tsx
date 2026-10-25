import React, { useCallback, useRef } from 'react'

export interface SplitterProps {
  ratio: number // 25 to 75 (%)
  onChange: (ratio: number) => void
  orientation?: 'horizontal' | 'vertical'
  onReset?: () => void
  ariaLabel?: string
  className?: string
  style?: React.CSSProperties
}

export const MIN_SPLIT_RATIO = 25
export const MAX_SPLIT_RATIO = 75
export const DEFAULT_SPLIT_RATIO = 50

/**
 * Split-View Resizer (6.2, FC-18)
 * Accessible separator operable via pointer drag and keyboard (Arrow keys ±2%, double-click reset to 50%).
 * 8px visual width with 24px hit area.
 */
export function Splitter({
  ratio,
  onChange,
  orientation = 'horizontal',
  onReset,
  ariaLabel = 'Resize editor and preview panels',
  className = '',
  style,
}: SplitterProps) {
  const splitterRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const clamp = (val: number) => Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, val))

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    e.preventDefault()
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const parent = splitterRef.current?.parentElement
    if (!parent) return

    const rect = parent.getBoundingClientRect()
    let newRatio: number

    if (orientation === 'horizontal') {
      const offsetX = e.clientX - rect.left
      newRatio = (offsetX / rect.width) * 100
    } else {
      const offsetY = e.clientY - rect.top
      newRatio = (offsetY / rect.height) * 100
    }

    onChange(clamp(Math.round(newRatio * 10) / 10))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const target = e.currentTarget as HTMLElement
    try {
      target.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore
    }
  }

  const handleDoubleClick = () => {
    if (onReset) onReset()
    else onChange(DEFAULT_SPLIT_RATIO)
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let delta = 0
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        delta = -2
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        delta = 2
      } else if (e.key === 'Home') {
        onChange(MIN_SPLIT_RATIO)
        e.preventDefault()
        return
      } else if (e.key === 'End') {
        onChange(MAX_SPLIT_RATIO)
        e.preventDefault()
        return
      } else if (e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'r') {
        if (onReset) onReset()
        else onChange(DEFAULT_SPLIT_RATIO)
        e.preventDefault()
        return
      }

      if (delta !== 0) {
        e.preventDefault()
        onChange(clamp(Math.round((ratio + delta) * 10) / 10))
      }
    },
    [ratio, onChange, onReset]
  )

  const isHoriz = orientation === 'horizontal'

  return (
    <div
      ref={splitterRef}
      role="separator"
      tabIndex={0}
      aria-orientation={orientation}
      aria-label={ariaLabel}
      aria-valuenow={Math.round(ratio)}
      aria-valuemin={MIN_SPLIT_RATIO}
      aria-valuemax={MAX_SPLIT_RATIO}
      className={`splitter splitter--${orientation} ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        userSelect: 'none',
        cursor: isHoriz ? 'col-resize' : 'row-resize',
        width: isHoriz ? '16px' : '100%',
        height: isHoriz ? '100%' : '16px',
        margin: isHoriz ? '0 -4px' : '-4px 0',
        zIndex: 5,
        ...style,
      }}
    >
      {/* Visual 8px bar */}
      <div
        className="splitter__bar"
        style={{
          width: isHoriz ? '8px' : '100%',
          height: isHoriz ? '100%' : '8px',
          background: 'var(--c-surface-2, #161524)',
          border: '1px solid var(--c-border, #1f1d2e)',
          borderRadius: 'var(--r-sm, 4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Grip dots */}
        <div
          className="splitter__grip"
          style={{
            display: 'flex',
            flexDirection: isHoriz ? 'column' : 'row',
            gap: '3px',
          }}
        >
          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--c-text-muted, #85839b)' }} />
          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--c-text-muted, #85839b)' }} />
          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--c-text-muted, #85839b)' }} />
        </div>
      </div>
    </div>
  )
}
