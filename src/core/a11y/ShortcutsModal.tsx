import { useEffect, useRef, useId } from 'react'
import { SHORTCUTS, SCOPE_LABELS, type ShortcutDef } from './shortcuts'
import { Kbd } from '../ui/Kbd'
import { Icon } from '../../components/Icon'

export interface ShortcutsModalProps {
  open: boolean
  onClose: () => void
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    openerRef.current = document.activeElement as HTMLElement | null

    const node = dialogRef.current
    const closeBtn = node?.querySelector<HTMLElement>('.shortcuts-close-btn')
    closeBtn?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== 'Tab' || !node) return
      const els = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      openerRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  // Group shortcuts by scope
  const scopes: Array<ShortcutDef['scope']> = ['global', 'palette', 'orbit', 'editor']

  return (
    <div
      className="dialog-backdrop shortcuts-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="dialog shortcuts-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
      >
        <div className="shortcuts-dialog__header">
          <h2 id={titleId} className="dialog__title">
            Keyboard Shortcuts Reference
          </h2>
          <button
            type="button"
            className="icon-btn shortcuts-close-btn"
            aria-label="Close shortcuts reference"
            onClick={onClose}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="dialog__body shortcuts-dialog__body">
          {scopes.map((scope) => {
            const items = SHORTCUTS.filter((s) => s.scope === scope)
            if (items.length === 0) return null

            return (
              <section key={scope} className="shortcuts-section" aria-labelledby={`scope-${scope}`}>
                <h3 id={`scope-${scope}`} className="shortcuts-section__title">
                  {SCOPE_LABELS[scope]}
                </h3>
                <dl className="shortcuts-list">
                  {items.map((item) => (
                    <div key={item.id} className="shortcuts-row" data-shortcut-id={item.id}>
                      <dt className="shortcuts-desc">{item.description}</dt>
                      <dd className="shortcuts-keys">
                        {item.keys.map((k, i) => (
                          <span key={i} className="shortcuts-key-group">
                            <Kbd>{k}</Kbd>
                            {i < item.keys.length - 1 && <span className="muted small"> or </span>}
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )
          })}
        </div>

        <div className="dialog__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
