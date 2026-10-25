import React from 'react'

export type DeviceFrameMode = 'desktop' | 'tablet' | 'mobile'

export interface DeviceFrameProps {
  mode: DeviceFrameMode
  onModeChange: (mode: DeviceFrameMode) => void
  children: React.ReactNode
  className?: string
}

const FRAME_DIMENSIONS: Record<DeviceFrameMode, { width: string; caption: string }> = {
  desktop: { width: '100%', caption: 'Responsive' },
  tablet: { width: '768px', caption: 'Tablet · 768 × 1024' },
  mobile: { width: '375px', caption: 'Mobile · 375 × 667' },
}

/**
 * Preview Device Frames (6.6, FC-16)
 * Wraps sandboxed preview in realistic responsive device viewports without reloading drafts.
 */
export function DeviceFrame({
  mode,
  onModeChange,
  children,
  className = '',
}: DeviceFrameProps) {
  const current = FRAME_DIMENSIONS[mode]

  return (
    <div className={`device-frame-wrapper ${className}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Device Frame Toolbar */}
      <div
        className="device-frame-toolbar"
        role="toolbar"
        aria-label="Preview viewport frame"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          background: 'var(--c-surface-1, #0f0e1a)',
          borderBottom: '1px solid var(--c-border, #1f1d2e)',
          fontSize: 'var(--fs-meta, 12px)',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['desktop', 'tablet', 'mobile'] as const).map((m) => {
            const isSelected = mode === m
            const label = m[0].toUpperCase() + m.slice(1)
            return (
              <button
                key={m}
                type="button"
                className={`btn btn--sm ${isSelected ? 'btn--secondary' : 'btn--ghost'}`}
                aria-pressed={isSelected}
                style={{
                  minHeight: '28px',
                  padding: '2px 10px',
                  fontSize: 'var(--fs-meta, 12px)',
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? 'var(--c-surface-3, #222036)' : 'transparent',
                }}
                onClick={() => onModeChange(m)}
              >
                {label}
              </button>
            )
          })}
        </div>

        <span
          className="device-frame-caption muted small"
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--c-text-quiet, #85839b)',
          }}
          aria-live="polite"
        >
          {current.caption}
        </span>
      </div>

      {/* Frame Container */}
      <div
        className="device-frame-viewport-container"
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: mode === 'desktop' ? 'stretch' : 'center',
          padding: mode === 'desktop' ? '0' : '16px',
          background: mode === 'desktop' ? 'transparent' : 'var(--c-bg-subtle, rgba(0,0,0,0.3))',
        }}
      >
        <div
          className={`device-frame-bezel device-frame-bezel--${mode}`}
          style={{
            width: current.width,
            maxWidth: '100%',
            height: '100%',
            transition: 'width var(--t-fast, 180ms ease)',
            borderRadius: mode === 'desktop' ? '0' : 'var(--r-md, 8px)',
            boxShadow: mode === 'desktop' ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.45)',
            border: mode === 'desktop' ? 'none' : '1px solid var(--c-border-strong, #2c2942)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
