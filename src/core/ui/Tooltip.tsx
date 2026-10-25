import React, { useState, useId, useEffect } from 'react'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>
  delayMs?: number
}

export function Tooltip({ content, children, delayMs = 400 }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [timer, setTimer] = useState<number | null>(null)
  const id = useId()

  const show = () => {
    const t = window.setTimeout(() => setVisible(true), delayMs)
    setTimer(t)
  }

  const hide = () => {
    if (timer) clearTimeout(timer)
    setVisible(false)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        if (timer) clearTimeout(timer)
        setVisible(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [visible, timer])

  return (
    <span className="tooltip-trigger" onMouseEnter={show} onMouseLeave={hide}>
      {React.cloneElement(children, {
        onFocus: (e: React.FocusEvent<HTMLElement>) => {
          show()
          children.props.onFocus?.(e)
        },
        onBlur: (e: React.FocusEvent<HTMLElement>) => {
          hide()
          children.props.onBlur?.(e)
        },
        'aria-describedby': visible ? id : undefined
      })}
      {visible && (
        <span id={id} role="tooltip" className="tooltip-bubble">
          {content}
        </span>
      )}
    </span>
  )
}
