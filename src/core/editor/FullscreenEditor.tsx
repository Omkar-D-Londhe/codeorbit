import React, { useEffect, useRef, useState, type ReactNode } from 'react'
import { Drawer, Button } from '../ui'
import { Icon } from '../../components/Icon'
import { AutoSaveIndicator } from './AutoSaveIndicator'

export interface FullscreenEditorProps {
  open: boolean
  onClose: () => void
  title?: string
  editor: ReactNode
  preview: ReactNode
  openerRef?: React.RefObject<HTMLElement | null>
}

/**
 * Fullscreen Editor Mode (6.8)
 * Fixed viewport-filling code editor with slide-out preview drawer.
 * Pressing Esc closes the fullscreen view and restores focus to the opener element.
 */
export function FullscreenEditor({
  open,
  onClose,
  title = 'Challenge Editor',
  editor,
  preview,
  openerRef,
}: FullscreenEditorProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const openerEl = openerRef?.current
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.classList.add('is-fullscreen')

    const container = containerRef.current
    if (container && typeof document !== 'undefined' && document.fullscreenEnabled && !document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {})
    }

    const onFullscreenChange = () => {
      if (!document.fullscreenElement && open) {
        onClose()
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (drawerOpen) {
          setDrawerOpen(false)
        } else {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('fullscreenchange', onFullscreenChange)

    return () => {
      document.body.style.overflow = prevOverflow
      document.documentElement.classList.remove('is-fullscreen')
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {})
      }
      openerEl?.focus()
    }
  }, [open, drawerOpen, onClose, openerRef])

  if (!open) return null

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen code editor"
      className="fullscreen-editor"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'var(--c-bg, #08080e)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top action bar */}
      <header
        className="fullscreen-editor__header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--c-border, #1f1d2e)',
          backgroundColor: 'var(--c-surface-1, #0f0e1a)',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: 'var(--fs-base, 14.4px)', fontWeight: '600', margin: 0 }}>
            {title}
          </h2>
          <AutoSaveIndicator />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Exit Fullscreen (Esc)"
          >
            <Icon name="close" size={16} />Exit
          </Button>
        </div>
      </header>

      {/* Editor Body */}
      <div
        className="fullscreen-editor__body"
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>{editor}</div>

        {/* Slide-out Preview Drawer */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Live Preview"
        >
          <div style={{ height: '100%', padding: '12px', display: 'flex', flexDirection: 'column' }}>
            {preview}
          </div>
        </Drawer>
      </div>
    </div>
  )
}
