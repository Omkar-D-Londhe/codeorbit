import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../state/AppState'
import { getTracks } from '../content/registry'
import { buildCommands } from './commands'
import { buildIndex, searchIndex, type SearchResult } from './index'
import { Highlight } from './Highlight'
import { Kbd } from '../ui/Kbd'
import { Icon } from '../../components/Icon'

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onOpenShortcuts: () => void
}

const KIND_ICONS: Record<string, string> = {
  command: 'play',
  topic: 'book',
  'lesson-section': 'notebook',
  challenge: 'code',
  note: 'pencil',
  bookmark: 'bookmark',
}

/**
 * 9.1 / 9.2 Command Palette: Centred glass dialog with fuzzy search,
 * <mark> highlighted matches, ARIA combobox/listbox with aria-activedescendant,
 * keyboard navigation (↑/↓/Enter/Esc), and focus restoration.
 */
export function CommandPalette({ open, onClose, onOpenShortcuts }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  // Memoised index, rebuilt on tracks or notes/bookmarks change
  const index = useMemo(() => {
    if (!open) return []
    const tracks = getTracks()
    const commands = buildCommands({
      navigate: (p) => {
        navigate(p)
        onClose()
      },
      state,
      dispatch,
      openShortcuts: () => {
        onClose()
        onOpenShortcuts()
      },
    })
    return buildIndex(tracks, state, commands)
  }, [open, state, navigate, dispatch, onClose, onOpenShortcuts])

  // Search results
  const results: SearchResult[] = useMemo(() => {
    if (!open) return []
    return searchIndex(index, query, 50)
  }, [index, query, open])

  // Focus management & Escape handling
  useEffect(() => {
    if (!open) return
    openerRef.current = document.activeElement as HTMLElement | null
    setQuery('')
    setActiveIndex(0)

    // Delay focus slightly to ensure element is rendered
    const t = setTimeout(() => {
      inputRef.current?.focus()
    }, 20)

    return () => {
      clearTimeout(t)
      openerRef.current?.focus?.()
    }
  }, [open])

  // Auto-scroll active option into view
  useEffect(() => {
    if (!open || results.length === 0) return
    const activeEl = listboxRef.current?.querySelector(`[data-index="${activeIndex}"]`)
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, open, results.length])

  if (!open) return null

  const handleSelect = (result: SearchResult) => {
    const doc = result.doc
    if (doc.kind === 'command' && doc.command) {
      doc.command.run()
    } else if (doc.path) {
      navigate(doc.path)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (e.key === 'Tab') {
      const helpBtn = dialogRef.current?.querySelector<HTMLElement>('.palette-footer__help')
      if (e.shiftKey && document.activeElement === inputRef.current && helpBtn) {
        e.preventDefault()
        helpBtn.focus()
        return
      } else if (!e.shiftKey && document.activeElement === helpBtn && inputRef.current) {
        e.preventDefault()
        inputRef.current.focus()
        return
      }
    }

    if (results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = results[activeIndex]
      if (selected) {
        handleSelect(selected)
      }
    }
  }

  const activeResult = results[activeIndex]

  return (
    <div
      className="dialog-backdrop palette-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="palette-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette and search"
      >
        <div className="palette-input-wrapper">
          <Icon name="compass" size={20} className="palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="palette-listbox"
            aria-activedescendant={activeResult ? `palette-opt-${activeResult.doc.id}` : undefined}
            aria-autocomplete="list"
            className="palette-input"
            placeholder="Search topics, lessons, challenges, commands..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
          />
          <Kbd className="palette-kbd-esc">Esc</Kbd>
        </div>

        <div
          id="palette-listbox"
          ref={listboxRef}
          role="listbox"
          className="palette-results"
          aria-label="Search suggestions"
        >
          {results.length > 0 ? (
            results.map((res, idx) => {
              const doc = res.doc
              const isSelected = idx === activeIndex
              const iconName = (doc.kind && KIND_ICONS[doc.kind]) || 'play'

              return (
                <div
                  key={doc.id}
                  id={`palette-opt-${doc.id}`}
                  data-index={idx}
                  role="option"
                  aria-selected={isSelected}
                  className={`palette-option ${isSelected ? 'palette-option--selected' : ''}`}
                  onClick={() => handleSelect(res)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className="palette-option__icon">
                    <Icon name={iconName} size={18} />
                  </div>
                  <div className="palette-option__body">
                    <div className="palette-option__title">
                      <Highlight text={doc.title} ranges={res.titleMatch?.ranges} />
                    </div>
                    {doc.body && (
                      <div className="palette-option__desc muted small">
                        <Highlight
                          text={doc.body.slice(0, 90) + (doc.body.length > 90 ? '…' : '')}
                          ranges={res.bodyMatch?.ranges}
                        />
                      </div>
                    )}
                  </div>
                  <div className="palette-option__meta">
                    <span className="badge badge--pill badge--subtle palette-option__kind">
                      {doc.kind}
                    </span>
                    {doc.command?.shortcut && <Kbd>{doc.command.shortcut}</Kbd>}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="palette-empty">
              <p className="palette-empty__title">No matches for “{query}”</p>
              <p className="muted small">
                Try searching for topics like “headings”, “lists”, or commands like “settings”.
              </p>
            </div>
          )}
        </div>

        <div className="palette-footer">
          <div className="palette-footer__shortcuts">
            <span>
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> to navigate
            </span>
            <span>
              <Kbd>Enter</Kbd> to select
            </span>
            <span>
              <Kbd>Esc</Kbd> to close
            </span>
          </div>
          <button
            type="button"
            className="palette-footer__help"
            onClick={() => {
              onClose()
              onOpenShortcuts()
            }}
          >
            <Icon name="help-circle" size={14} />
            <span>Shortcuts (?)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
