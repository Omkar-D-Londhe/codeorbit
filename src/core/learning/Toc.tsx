import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icon'

export interface TocSection {
  id: string
  heading: string
}

export interface TocProps {
  sections: TocSection[]
  mobile?: boolean
  className?: string
}

/**
 * Table of Contents (4.7).
 * - Sticky left rail on desktop (>= 1100px)
 * - Collapses to "On this page" disclosure on mobile (< 900px)
 * - Hidden when sections <= 1
 * - IntersectionObserver updates active section with aria-current="true"
 * - Clicks scroll smoothly and move keyboard focus to the target section heading
 */
export function Toc({ sections, mobile = false, className = '' }: TocProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    if (sections.length <= 1 || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible section closest to top
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-60px 0px -50% 0px', threshold: 0 }
    )

    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  if (sections.length <= 1) return null

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setActiveId(id)
    const target = document.getElementById(id)
    if (target) {
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1')
      }
      target.scrollIntoView({ behavior: 'smooth' })
      target.focus()
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState(null, '', `#${id}`)
      }
    }
  }

  const listItems = (
    <ul className="lesson-toc__list" role="list">
      {sections.map((s) => {
        const isActive = activeId === s.id
        return (
          <li key={s.id} className="lesson-toc__item">
            <a
              href={`#${s.id}`}
              className={`lesson-toc__link${isActive ? ' is-active' : ''}`}
              aria-current={isActive ? 'true' : undefined}
              onClick={(e) => handleNavClick(e, s.id)}
            >
              {s.heading}
            </a>
          </li>
        )
      })}
    </ul>
  )

  if (mobile) {
    return (
      <details className={`lesson-toc lesson-toc--mobile ${className}`} aria-label="Table of contents">
        <summary className="lesson-toc__summary">
          <Icon name="list" size={16} />
          <span>On this page</span>
        </summary>
        {listItems}
      </details>
    )
  }

  return (
    <nav className={`lesson-toc lesson-toc--desktop ${className}`} aria-label="Table of contents">
      <h2 className="lesson-toc__heading">On this page</h2>
      {listItems}
    </nav>
  )
}
