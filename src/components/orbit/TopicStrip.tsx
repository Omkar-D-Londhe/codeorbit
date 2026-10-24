import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Topic } from '../../data/types'
import { getGroup } from '../../data/curriculum'
import type { TopicProgress } from '../../lib/progress'
import { STATUS_ICON, STATUS_LABEL } from '../../lib/status'
import { prefersReducedMotion } from '../../lib/hooks'
import { Icon } from '../Icon'
import { ProgressRing } from '../ProgressRing'
import { nextIdForKey } from './topicKeys'

interface Props {
  topics: Topic[]
  selectedId: string
  variant: 'chips' | 'cards'
  progressOf: (id: string) => TopicProgress
  onSelect: (id: string) => void
  onKeyNav: (id: string) => void
}

/**
 * Horizontal topic strip in canonical order. It is a bounded scroller: scrolling never changes the
 * selection (so strip ⇄ arc cannot loop), and a selection made elsewhere only scrolls the strip
 * (not the page) when the selected item is outside the visible range.
 */
export function TopicStrip({ topics, selectedId, variant, progressOf, onSelect, onKeyNav }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ atStart: true, atEnd: false })
  const ids = topics.map((t) => t.id)

  const measure = useCallback(() => {
    const el = scroller.current
    if (!el) return
    const atStart = el.scrollLeft <= 1
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
    setEdges((p) => (p.atStart === atStart && p.atEnd === atEnd ? p : { atStart, atEnd }))
  }, [])

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    let raf = 0
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure) }
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(onScroll)
    ro.observe(el)
    measure()
    return () => { el.removeEventListener('scroll', onScroll); ro.disconnect(); cancelAnimationFrame(raf) }
  }, [measure, variant])

  // Bring the selected item into view only when it is not already comfortably visible.
  useEffect(() => {
    const el = scroller.current
    const item = el?.querySelector<HTMLElement>(`[data-topic-id="${selectedId}"]`)
    if (!el || !item || typeof el.scrollTo !== 'function') return
    const margin = 24
    const left = item.offsetLeft
    const right = left + item.offsetWidth
    if (left - margin < el.scrollLeft || right + margin > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: Math.max(0, left - (el.clientWidth - item.offsetWidth) / 2), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    }
  }, [selectedId, variant])

  const page = (dir: 1 | -1) => {
    const el = scroller.current
    if (!el || typeof el.scrollBy !== 'function') return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
    const next = nextIdForKey(e.key, ids, id)
    if (next) { e.preventDefault(); if (next !== id) onKeyNav(next) }
  }

  return (
    <div className={`strip strip--${variant}`} data-at-start={edges.atStart} data-at-end={edges.atEnd}>
      <button type="button" className="icon-btn strip__nudge" aria-label="Scroll topics left" onClick={() => page(-1)} disabled={edges.atStart}>
        <Icon name="chevron-left" />
      </button>
      <div className="strip__viewport">
        <div className="strip__scroller" ref={scroller}>
          <ol className="strip__list" aria-label="HTML topics in curriculum order">
            {topics.map((t, i) => {
              const p = progressOf(t.id)
              const selected = t.id === selectedId
              return (
                <li key={t.id} className="strip__item">
                  <button
                    type="button"
                    className={`strip-topic strip-topic--${p.status}`}
                    data-topic-id={t.id}
                    data-nav="strip"
                    aria-current={selected ? 'true' : undefined}
                    tabIndex={selected ? 0 : -1}
                    aria-label={`Topic ${i + 1} of ${topics.length}: ${t.title}. ${STATUS_LABEL[p.status]}.${selected ? ' Selected.' : ''}`}
                    onClick={() => onSelect(t.id)}
                    onKeyDown={(e) => onKeyDown(e, t.id)}
                  >
                    <span className="strip-topic__num" aria-hidden="true">
                      {p.status === 'in-progress' && <ProgressRing fraction={p.parts / p.partsTotal} size={28} stroke={2.5} className="strip-topic__ring" />}
                      <span>{i + 1}</span>
                    </span>
                    <span className="strip-topic__text" aria-hidden="true">
                      <span className="strip-topic__title">{variant === 'cards' ? t.title : t.shortTitle}</span>
                      {variant === 'cards' && <span className="strip-topic__meta">{getGroup(t.groupId)?.title}</span>}
                    </span>
                    <span className="strip-topic__status" aria-hidden="true">
                      <Icon name={STATUS_ICON[p.status]} size={16} />
                      {variant === 'cards' && <span>{STATUS_LABEL[p.status]}</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
        <span className="strip__fade strip__fade--start" aria-hidden="true" />
        <span className="strip__fade strip__fade--end" aria-hidden="true" />
      </div>
      <button type="button" className="icon-btn strip__nudge" aria-label="Scroll topics right" onClick={() => page(1)} disabled={edges.atEnd}>
        <Icon name="chevron-right" />
      </button>
    </div>
  )
}
