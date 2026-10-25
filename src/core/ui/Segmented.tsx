import React, { useRef } from 'react'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: React.ReactNode
  disabled?: boolean
}

export interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
}

export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = ''
}: SegmentedProps<T>) {
  const itemRefs = useRef<Map<T, HTMLButtonElement>>(new Map())

  const enabledOptions = options.filter((o) => !o.disabled)
  const currentIndex = enabledOptions.findIndex((o) => o.value === value)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (enabledOptions.length === 0) return

    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % enabledOptions.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length
    } else if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = enabledOptions.length - 1
    }

    if (nextIndex >= 0) {
      e.preventDefault()
      const nextOpt = enabledOptions[nextIndex]
      onChange(nextOpt.value)
      const el = itemRefs.current.get(nextOpt.value)
      el?.focus()
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`segmented ${className}`.trim()}
      onKeyDown={handleKeyDown}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value
        return (
          <button
            key={opt.value}
            ref={(el) => {
              if (el) itemRefs.current.set(opt.value, el)
              else itemRefs.current.delete(opt.value)
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            disabled={opt.disabled}
            className={`segmented__item ${isSelected ? 'is-selected' : ''}`.trim()}
            onClick={() => !opt.disabled && onChange(opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
