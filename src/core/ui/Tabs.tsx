import React, { useRef } from 'react'

export interface TabItem {
  id: string
  label: React.ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  ariaLabel?: string
  className?: string
}

export function Tabs({
  tabs,
  activeId,
  onChange,
  ariaLabel = 'Navigation tabs',
  className = ''
}: TabsProps) {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const enabledTabs = tabs.filter((t) => !t.disabled)
  const currentIndex = enabledTabs.findIndex((t) => t.id === activeId)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (enabledTabs.length === 0) return

    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % enabledTabs.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length
    } else if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = enabledTabs.length - 1
    }

    if (nextIndex >= 0) {
      e.preventDefault()
      const nextTab = enabledTabs[nextIndex]
      onChange(nextTab.id)
      const el = tabRefs.current.get(nextTab.id)
      el?.focus()
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`tabs ${className}`.trim()}
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el)
              else tabRefs.current.delete(tab.id)
            }}
            role="tab"
            type="button"
            className={`tab ${isActive ? 'is-active' : ''}`.trim()}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
