import { useMemo, type KeyboardEvent } from 'react'
import type { Topic } from '../../data/types'
import { prerequisiteEdges } from '../../data/curriculum'
import { computeOrbitLayout, edgePath, LABEL_HEIGHT, LABEL_WIDTH, NODE_SIZE, type OrbitMode } from '../../lib/orbitGeometry'
import type { TopicProgress } from '../../lib/progress'
import { STATUS_LABEL } from '../../lib/status'
import { Icon } from '../Icon'
import { ProgressRing } from '../ProgressRing'
import { nextIdForKey } from './topicKeys'

interface Props {
  topics: Topic[]
  width: number
  mode: Exclude<OrbitMode, 'carousel'>
  selectedId: string
  progressOf: (id: string) => TopicProgress
  onSelect: (id: string) => void
  onKeyNav: (id: string) => void
}

/** The upper arch (∩). Positions depend only on the ordered topic IDs and the width — never on selection. */
export function OrbitArch({ topics, width, mode, selectedId, progressOf, onSelect, onKeyNav }: Props) {
  const ids = useMemo(() => topics.map((t) => t.id), [topics])
  const layout = useMemo(() => computeOrbitLayout(ids, width), [ids, width])
  const idSet = useMemo(() => new Set(ids), [ids])

  const edges = useMemo(
    () =>
      prerequisiteEdges
        .filter((e) => idSet.has(e.from) && idSet.has(e.to))
        .map((e) => ({ ...e, d: edgePath(layout, e.from, e.to) }))
        .filter((e): e is { from: string; to: string; d: string } => e.d !== null),
    [idSet, layout],
  )

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
    const next = nextIdForKey(e.key, ids, id)
    if (next) { e.preventDefault(); if (next !== id) onKeyNav(next) }
  }

  return (
    <div className="arch" style={{ height: layout.height }} data-mode={mode}>
      <svg className="arch__svg" viewBox={`0 0 ${layout.width} ${layout.height}`} width={layout.width} height={layout.height} aria-hidden="true" focusable="false">
        {/* Outer hairline and the arc itself: curriculum order, NOT a dependency. */}
        <path d={`M ${layout.cx - layout.rx - 14} ${layout.baseline} A ${layout.rx + 14} ${layout.ry + 14} 0 0 1 ${layout.cx + layout.rx + 14} ${layout.baseline}`} className="arch__rim" />
        <path d={layout.arcPath} className="arch__arc" />
        {edges.map((e) => (
          <path
            key={`${e.from}>${e.to}`}
            d={e.d}
            className={`arch__edge${e.from === selectedId || e.to === selectedId ? ' arch__edge--active' : ''}`}
          />
        ))}
      </svg>
      <ol className="arch__nodes" aria-label="HTML topics on the Learning Orbit, in curriculum order">
        {layout.nodes.map((n, i) => {
          const t = topics[i]
          const p = progressOf(t.id)
          const selected = t.id === selectedId
          const showLabel = mode === 'arch' || selected
          return (
            <li key={t.id} className="arch__node-wrap" style={{ left: n.x - NODE_SIZE / 2, top: n.y - NODE_SIZE / 2, width: NODE_SIZE, height: NODE_SIZE }}>
              <button
                type="button"
                className={`orbit-node orbit-node--${p.status}`}
                data-topic-id={t.id}
                data-nav="arc"
                aria-current={selected ? 'true' : undefined}
                tabIndex={selected ? 0 : -1}
                aria-label={`Topic ${i + 1} of ${topics.length}: ${t.title}. ${STATUS_LABEL[p.status]}.${selected ? ' Selected.' : ''}`}
                title={`${t.title} — ${STATUS_LABEL[p.status]}`}
                onClick={() => onSelect(t.id)}
                onKeyDown={(e) => onKeyDown(e, t.id)}
              >
                {p.status === 'in-progress' && <ProgressRing fraction={p.parts / p.partsTotal} size={NODE_SIZE} stroke={3} className="orbit-node__ring" />}
                <span className="orbit-node__num" aria-hidden="true">{i + 1}</span>
                {p.status === 'completed' && <span className="orbit-node__badge" aria-hidden="true"><Icon name="check" size={12} strokeWidth={3} /></span>}
                {p.status === 'mastered' && <span className="orbit-node__badge orbit-node__badge--star" aria-hidden="true"><Icon name="star" size={12} strokeWidth={2.4} /></span>}
              </button>
              {showLabel && (
                <span className={`orbit-label${selected ? ' orbit-label--active' : ''}`} style={{ width: LABEL_WIDTH, minHeight: LABEL_HEIGHT - 6 }} aria-hidden="true">
                  {t.shortTitle}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
