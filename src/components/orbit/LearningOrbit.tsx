import { useEffect, useMemo, useRef } from 'react'
import type { Topic } from '../../data/types'
import { chooseOrbitMode } from '../../lib/orbitGeometry'
import { useElementWidth } from '../../lib/hooks'
import type { TopicProgress } from '../../lib/progress'
import { Icon } from '../Icon'
import { OrbitArch } from './OrbitArch'
import { TopicStrip } from './TopicStrip'

interface Props {
  topics: Topic[]
  selectedId: string
  progressOf: (id: string) => TopicProgress
  onSelect: (id: string) => void
}

/**
 * Strip + arc share ONE selection (the stable topic ID) held by the parent, so selecting in either
 * updates the other. Neither navigator writes selection from scroll or layout events.
 */
export function LearningOrbit({ topics, selectedId, progressOf, onSelect }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const width = useElementWidth(wrap)
  const ids = useMemo(() => topics.map((t) => t.id), [topics])
  const mode = width > 0 ? chooseOrbitMode(ids, width) : 'arch'

  // Keyboard navigation: after selection changes via arrows, keep DOM focus on the same navigator.
  const pendingFocus = useRef<'strip' | 'arc' | null>(null)
  useEffect(() => {
    if (!pendingFocus.current) return
    const which = pendingFocus.current
    pendingFocus.current = null
    wrap.current?.querySelector<HTMLElement>(`[data-nav="${which}"][data-topic-id="${selectedId}"]`)?.focus({ preventScroll: true })
  }, [selectedId])

  const keyNav = (source: 'strip' | 'arc') => (id: string) => { pendingFocus.current = source; onSelect(id) }

  return (
    <div className="orbit" ref={wrap} data-mode={mode}>
      <TopicStrip
        topics={topics}
        selectedId={selectedId}
        variant={mode === 'carousel' ? 'cards' : 'chips'}
        progressOf={progressOf}
        onSelect={onSelect}
        onKeyNav={keyNav('strip')}
      />
      {mode !== 'carousel' && width > 0 && (
        <OrbitArch topics={topics} width={width} mode={mode} selectedId={selectedId} progressOf={progressOf} onSelect={onSelect} onKeyNav={keyNav('arc')} />
      )}
      <ul className="orbit-legend" aria-label="How to read the Learning Orbit">
        <li><span className="legend-dot legend-dot--idle" aria-hidden="true" />Not started</li>
        <li><span className="legend-dot legend-dot--progress" aria-hidden="true" />In progress (ring shows steps done)</li>
        <li><span className="legend-dot legend-dot--done" aria-hidden="true"><Icon name="check" size={10} strokeWidth={3} /></span>Completed</li>
        <li><span className="legend-dot legend-dot--mastered" aria-hidden="true"><Icon name="star" size={10} strokeWidth={2.4} /></span>Mastered</li>
        {mode !== 'carousel' && <li className="orbit-legend__note">Order follows the curriculum. Faint curves are real prerequisites; the one you select is highlighted.</li>}
      </ul>
    </div>
  )
}
