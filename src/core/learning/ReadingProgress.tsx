import { useEffect, useState } from 'react'

export interface ReadingProgressProps {
  className?: string
}

/**
 * Reading Progress Bar (4.1).
 * 2px accent progress bar fixed along the top edge, throttled with requestAnimationFrame.
 * Fully accessible with role="progressbar" and dynamic aria values.
 */
export function ReadingProgress({ className = '' }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isShort, setIsShort] = useState(false)

  useEffect(() => {
    let ticking = false

    const updateProgress = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight
      const winHeight = window.innerHeight
      const maxScroll = docHeight - winHeight

      if (maxScroll <= 50) {
        setIsShort(true)
        setProgress(100)
      } else {
        setIsShort(false)
        const pct = Math.min(100, Math.max(0, Math.round((scrollY / maxScroll) * 100)))
        setProgress(pct)
      }
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress)
        ticking = true
      }
    }

    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  if (isShort) return null

  return (
    <div
      className={`reading-progress ${className}`}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        zIndex: 101, // calc(var(--z-nav, 100) + 1)
        backgroundColor: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: 'var(--c-accent, #9a8bff)',
          transition: 'width 80ms ease-out',
        }}
      />
    </div>
  )
}
