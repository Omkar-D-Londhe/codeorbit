import React, { useState } from 'react'
import { Icon } from '../../components/Icon'

export interface SorterItem {
  id: string
  text: string
}

export interface SorterProps {
  items: SorterItem[]
  order: string[]
  disabled?: boolean
  checked?: boolean
  correctOrder?: string[]
  onChange: (newOrder: string[]) => void
}

/**
 * Keyboard-first Drag-and-Drop / Reordering Sorter (5.2).
 * - 48px item touch targets with grab handle icon
 * - Move up / Move down accessible button controls
 * - Keyboard navigation: Space to grab, ArrowUp/ArrowDown to reposition, Space/Enter to drop, Esc to cancel
 * - aria-live polite position announcements
 * - Native pointer drag-and-drop support without external dependencies
 */
export function Sorter({
  items,
  order,
  disabled = false,
  checked = false,
  correctOrder,
  onChange,
}: SorterProps) {
  const [grabbedId, setGrabbedId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState<string>('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Map order IDs to full items
  const itemMap = new Map(items.map((it) => [it.id, it]))
  const orderedItems = order.map((id) => itemMap.get(id)).filter(Boolean) as SorterItem[]

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= order.length) return
    const newOrder = [...order]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)
    onChange(newOrder)

    const it = itemMap.get(moved)
    setAnnouncement(`Moved ${it?.text ?? 'item'} to position ${toIndex + 1} of ${order.length}.`)
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number, item: SorterItem) => {
    if (disabled) return

    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
      if (grabbedId === item.id) {
        // Drop
        setGrabbedId(null)
        setAnnouncement(`Dropped ${item.text} at position ${index + 1} of ${order.length}.`)
      } else {
        // Grab
        setGrabbedId(item.id)
        setAnnouncement(
          `Grabbed ${item.text}. Current position ${index + 1} of ${order.length}. Use Arrow Up and Arrow Down to reorder, Space to drop, Escape to cancel.`
        )
      }
    } else if (e.key === 'ArrowUp') {
      if (grabbedId === item.id) {
        e.preventDefault()
        moveItem(index, Math.max(0, index - 1))
      }
    } else if (e.key === 'ArrowDown') {
      if (grabbedId === item.id) {
        e.preventDefault()
        moveItem(index, Math.min(order.length - 1, index + 1))
      }
    } else if (e.key === 'Escape') {
      if (grabbedId) {
        e.preventDefault()
        setGrabbedId(null)
        setAnnouncement('Reordering cancelled.')
      }
    }
  }

  // Pointer drag handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    if (disabled) return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && draggedIndex !== index) {
      moveItem(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const onDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="sorter-container">
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <ul className="sorter-list" role="list" aria-label="Sortable items list">
        {orderedItems.map((item, index) => {
          const isGrabbed = grabbedId === item.id
          const isCorrect = checked && correctOrder ? correctOrder[index] === item.id : undefined

          let statusClass = ''
          if (checked) {
            statusClass = isCorrect ? 'is-correct' : 'is-wrong'
          } else if (isGrabbed) {
            statusClass = 'is-grabbed'
          }

          return (
            <li
              key={item.id}
              className={`sorter-item ${statusClass}`}
              draggable={!disabled}
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnd={onDragEnd}
              tabIndex={disabled ? -1 : 0}
              role="listitem"
              aria-grabbed={isGrabbed}
              aria-label={`${item.text}. Position ${index + 1} of ${order.length}`}
              onKeyDown={(e) => handleKeyDown(e, index, item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '48px',
                padding: '8px 14px',
                marginBottom: '8px',
                background: 'var(--surface, #1e1b2e)',
                border: isGrabbed
                  ? '2px solid var(--accent, #9a8bff)'
                  : '1px solid var(--border, #3a3556)',
                borderRadius: 'var(--r-md, 8px)',
                cursor: disabled ? 'default' : isGrabbed ? 'grabbing' : 'grab',
                outline: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="sorter-handle" aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
                  <Icon name="menu" size={16} />
                </span>
                <span className="sorter-item__position" style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                  {index + 1}.
                </span>
                <code className="sorter-item__text" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                  {item.text}
                </code>
              </div>

              {!disabled && (
                <div className="sorter-actions" style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    disabled={index === 0}
                    onClick={() => moveItem(index, index - 1)}
                    aria-label={`Move ${item.text} up`}
                  >
                    <Icon name="arrow-left" size={14} style={{ transform: 'rotate(90deg)' }} />
                    <span className="sr-only">Up</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    disabled={index === order.length - 1}
                    onClick={() => moveItem(index, index + 1)}
                    aria-label={`Move ${item.text} down`}
                  >
                    <Icon name="arrow-right" size={14} style={{ transform: 'rotate(90deg)' }} />
                    <span className="sr-only">Down</span>
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
