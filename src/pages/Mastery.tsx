import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { challengesForTopic } from '../data/challenges'
import { getTechnology, getTopic, topicsFor, dependentsOf, topics as allTopics } from '../data/curriculum'
import { defaultTrackId } from '../core/content/registry'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useDocumentTitle, useElementWidth } from '../lib/hooks'
import { computeMasteryLayout, topicDepths, type MasteryLayout } from '../core/orbit/masteryLayout'
import { topicProgress, type TopicProgress } from '../lib/progress'
import { lessonPath, practicePath, quizPath, trackPath } from '../lib/routes'
import { STATUS_ICON, STATUS_LABEL } from '../lib/status'
import { useApp } from '../state/AppState'

const GRAPH_MIN_WIDTH = 720

export default function Mastery() {
  useDocumentTitle('Mastery map')
  const defTrack = defaultTrackId() ?? ''
  const { technologyId = defTrack } = useParams()
  const track = (technologyId ? getTechnology(technologyId) : undefined) || (defTrack ? getTechnology(defTrack) : undefined)
  if (!track) {
    return <Navigate to="/explore" replace />
  }

  return <MasteryInner track={track} technologyId={track.id} />
}

function MasteryInner({ track, technologyId }: { track: ReturnType<typeof getTechnology> & {}; technologyId: string }) {
  const { state } = useApp()
  const trackTopics = useMemo(() => {
    const ts = topicsFor(technologyId)
    return ts.length > 0 ? ts : allTopics
  }, [technologyId])

  const wrap = useRef<HTMLDivElement>(null)
  const width = useElementWidth(wrap)
  const [selectedId, setSelectedId] = useState(trackTopics[0]?.id || '')
  const [viewMode, setViewMode] = useState<'layers' | 'heatmap' | 'list'>('layers')

  // Keep selectedId valid if topics change
  useEffect(() => {
    if (!trackTopics.some((t) => t.id === selectedId) && trackTopics.length > 0) {
      setSelectedId(trackTopics[0].id)
    }
  }, [trackTopics, selectedId])

  const layout: MasteryLayout = useMemo(
    () => computeMasteryLayout(trackTopics, Math.max(width, GRAPH_MIN_WIDTH)),
    [trackTopics, width]
  )
  const depths = useMemo(() => topicDepths(trackTopics), [trackTopics])

  const showGraph = width >= GRAPH_MIN_WIDTH
  const progressOf = useCallback(
    (id: string): TopicProgress => {
      const t = getTopic(id)
      return t ? topicProgress(state, t) : ({ status: 'not-started', parts: 0, partsTotal: 3, lessonDone: false, quizPassed: false, quizPerfect: false, practiceDone: false, usedSolution: false } as TopicProgress)
    },
    [state]
  )

  const selected = getTopic(selectedId) || trackTopics[0]
  const sp = progressOf(selected.id)
  const best = state.topics[selected.id]?.quizBest
  const prereqs = (selected.prerequisiteIds || [])
    .map((id) => getTopic(id))
    .filter((t): t is NonNullable<typeof t> => t != null)
  const leads = dependentsOf(selected.id)
  const ch = challengesForTopic(selected.id)[0]

  const byLevel = useMemo(() => {
    return Array.from({ length: layout.columns }, (_, d) =>
      trackTopics.filter((t) => depths.get(t.id) === d)
    )
  }, [layout.columns, trackTopics, depths])

  // Roving Tabindex Keyboard Navigation handler for the graph view
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentId: string) => {
      const currentNode = layout.nodes.find((n) => n.id === currentId)
      if (!currentNode) return

      let targetId: string | null = null

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const sameDepth = layout.nodes.filter((n) => n.depth === currentNode.depth)
        const currentIdx = sameDepth.findIndex((n) => n.id === currentId)
        if (currentIdx < sameDepth.length - 1) {
          targetId = sameDepth[currentIdx + 1].id
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const sameDepth = layout.nodes.filter((n) => n.depth === currentNode.depth)
        const currentIdx = sameDepth.findIndex((n) => n.id === currentId)
        if (currentIdx > 0) {
          targetId = sameDepth[currentIdx - 1].id
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (currentNode.depth < layout.columns - 1) {
          const nextDepthNodes = layout.nodes.filter((n) => n.depth === currentNode.depth + 1)
          if (nextDepthNodes.length > 0) {
            // Find closest row or clamp
            const closest = nextDepthNodes.reduce((prev, curr) =>
              Math.abs(curr.row - currentNode.row) < Math.abs(prev.row - currentNode.row) ? curr : prev
            )
            targetId = closest.id
          }
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentNode.depth > 0) {
          const prevDepthNodes = layout.nodes.filter((n) => n.depth === currentNode.depth - 1)
          if (prevDepthNodes.length > 0) {
            const closest = prevDepthNodes.reduce((prev, curr) =>
              Math.abs(curr.row - currentNode.row) < Math.abs(prev.row - currentNode.row) ? curr : prev
            )
            targetId = closest.id
          }
        }
      } else if (e.key === 'Home') {
        e.preventDefault()
        const sameDepth = layout.nodes.filter((n) => n.depth === currentNode.depth)
        if (sameDepth.length > 0) targetId = sameDepth[0].id
      } else if (e.key === 'End') {
        e.preventDefault()
        const sameDepth = layout.nodes.filter((n) => n.depth === currentNode.depth)
        if (sameDepth.length > 0) targetId = sameDepth[sameDepth.length - 1].id
      }

      if (targetId) {
        setSelectedId(targetId)
        const targetEl = document.querySelector(`[data-topic-id="${targetId}"]`) as HTMLElement
        if (targetEl) targetEl.focus()
      }
    },
    [layout]
  )

  const list = (
    <ol className="mastery-list" aria-label="Topics grouped by prerequisite level">
      {byLevel.map((ts, d) => (
        <li key={d}>
          <h3 className="mastery-list__h">
            Level {d + 1}
            {d === 0 ? ' · starting points' : ''}
          </h3>
          <ul>
            {ts.map((t) => {
              const p = progressOf(t.id)
              return (
                <li key={t.id} className="mastery-list__row">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setSelectedId(t.id)}
                    aria-current={t.id === selectedId ? 'true' : undefined}
                  >
                    {t.title}
                  </button>
                  <span className={`status-chip status-chip--${p.status}`}>
                    <Icon name={STATUS_ICON[p.status]} size={14} />
                    {STATUS_LABEL[p.status]}
                  </span>
                  <span className="muted small">
                    {t.prerequisiteIds && t.prerequisiteIds.length > 0
                      ? `Builds on: ${t.prerequisiteIds.map((id) => getTopic(id)?.title).filter(Boolean).join(', ')}`
                      : 'No prerequisites'}
                  </span>
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ol>
  )

  const heatmap = (
    <div className="mastery-heatmap" aria-label="Mastery heatmap">
      <div className="mastery-heatmap__legend">
        <span className="small muted" style={{ fontWeight: 600 }}>Legend:</span>
        {(['not-started', 'in-progress', 'completed', 'mastered'] as const).map((s) => (
          <span key={s} className={`status-chip status-chip--${s}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
            <Icon name={STATUS_ICON[s]} size={12} /> {STATUS_LABEL[s]}
          </span>
        ))}
      </div>
      <div style={{ display: 'grid', gap: '16px' }}>
        {byLevel.map((levelTopics, d) => (
          <div key={d}>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-text-muted)', margin: '0 0 8px' }}>
              Level {d + 1} {d === 0 ? '· Fundamentals' : ''}
            </h4>
            <div className="mastery-heatmap__grid">
              {levelTopics.map((t) => {
                const p = progressOf(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`mastery-heatmap__item status-chip--${p.status}`}
                    aria-current={t.id === selectedId ? 'true' : undefined}
                    onClick={() => setSelectedId(t.id)}
                  >
                    <span style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{t.title}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--c-text-muted)' }}>
                      <Icon name={STATUS_ICON[p.status]} size={12} /> {STATUS_LABEL[p.status]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const activeMode = showGraph ? viewMode : 'list'

  return (
    <div className="page page--wide">
      <PageHeader
        crumbs={[
          { label: 'Explore', to: '/explore' },
          { label: track?.name || 'Track', to: trackPath(technologyId) },
          { label: 'Mastery map' },
        ]}
        title="Mastery map"
        lede={`How the ${track?.name || 'track'} topics build on each other, and where you stand on each. Every line is a real prerequisite; a level is the longest chain of prerequisites before a topic.`}
        actions={
          <Link className="btn btn--ghost" to={trackPath(technologyId)}>
            <Icon name="compass" size={18} /> Learning Orbit
          </Link>
        }
      />

      <section className="card mastery-card" aria-label="Prerequisite map">
        {showGraph && (
          <div className="mastery__toolbar">
            <div
              role="tablist"
              aria-label="Mastery map display view"
              className="segmented-tabs"
              style={{
                display: 'inline-flex',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '3px',
              }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'layers'}
                className={`btn btn--ghost btn--sm ${activeMode === 'layers' ? 'is-active' : ''}`}
                onClick={() => setViewMode('layers')}
              >
                <Icon name="progress" size={14} /> Layers
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'heatmap'}
                className={`btn btn--ghost btn--sm ${activeMode === 'heatmap' ? 'is-active' : ''}`}
                onClick={() => setViewMode('heatmap')}
              >
                <Icon name="star" size={14} /> Heatmap
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'list'}
                className={`btn btn--ghost btn--sm ${activeMode === 'list' ? 'is-active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <Icon name="notebook" size={14} /> List
              </button>
            </div>

            <span className="small muted">
              {trackTopics.length} topics across {layout.columns} levels
            </span>
          </div>
        )}

        <div ref={wrap} className="mastery">
          {!showGraph ? (
            <div>
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--c-border)', fontSize: '12px', color: 'var(--c-text-muted)' }}>
                Viewing structured list for compact screens (diagram requires ≥ 720px width).
              </div>
              {list}
            </div>
          ) : activeMode === 'heatmap' ? (
            heatmap
          ) : activeMode === 'list' ? (
            list
          ) : (
            /* Layers view wrapped in inner scroll container to prevent parent page horizontal scroll */
            <div className="mastery__graph-scroll">
              <div className="mastery__graph" style={{ width: layout.width, height: layout.height + 28 }}>
                <div className="mastery__levels" aria-hidden="true">
                  {Array.from({ length: layout.columns }, (_, d) => {
                    const nodeAtDepth = layout.nodes.find((n) => n.depth === d)
                    const xPos = nodeAtDepth ? nodeAtDepth.x : 0
                    return (
                      <span key={d} style={{ left: xPos, width: layout.nodeW }}>
                        Level {d + 1}
                      </span>
                    )
                  })}
                </div>

                <svg
                  className="mastery__svg"
                  width={layout.width}
                  height={layout.height + 28}
                  viewBox={`0 0 ${layout.width} ${layout.height + 28}`}
                  aria-hidden="true"
                  focusable="false"
                >
                  <g transform="translate(0 28)">
                    {layout.edges.map((e) => (
                      <path
                        key={`${e.from}>${e.to}`}
                        d={e.d}
                        className={`mastery__edge${
                          e.from === selectedId || e.to === selectedId ? ' mastery__edge--active' : ''
                        }`}
                      />
                    ))}
                  </g>
                </svg>

                <ul className="mastery__nodes">
                  {layout.nodes.map((n) => {
                    const t = getTopic(n.id)!
                    const p = progressOf(n.id)
                    const isSelected = n.id === selectedId

                    return (
                      <li key={n.id} style={{ left: n.x, top: n.y + 28, width: layout.nodeW, height: layout.nodeH }}>
                        <button
                          type="button"
                          className={`mastery-node mastery-node--${p.status}`}
                          data-topic-id={n.id}
                          tabIndex={isSelected ? 0 : -1}
                          aria-current={isSelected ? 'true' : undefined}
                          aria-label={`${t.title}. Level ${n.depth + 1}. ${STATUS_LABEL[p.status]}.${isSelected ? ' Selected.' : ''}`}
                          onClick={() => setSelectedId(n.id)}
                          onKeyDown={(e) => handleKeyDown(e, n.id)}
                        >
                          <span className="mastery-node__title">{t.shortTitle}</span>
                          <span className="mastery-node__status">
                            <Icon name={STATUS_ICON[p.status]} size={14} />
                            {STATUS_LABEL[p.status]}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {showGraph && activeMode === 'layers' && (
          <details className="mastery-alt">
            <summary>Show as a list</summary>
            {list}
          </details>
        )}
      </section>

      {/* Criteria & Details Panel */}
      <section className="detail mastery-detail-grid card" aria-labelledby="m-detail" aria-live="polite">
        <div className="detail__main">
          <p className="eyebrow">Level {(depths.get(selected.id) ?? 0) + 1}</p>
          <h2 id="m-detail" className="detail__title" style={{ margin: '0 0 10px' }}>
            {selected.title}
          </h2>
          <div className="detail__chips" style={{ marginBottom: '16px' }}>
            <span className={`status-chip status-chip--${sp.status}`}>
              <Icon name={STATUS_ICON[sp.status]} size={14} />
              {STATUS_LABEL[sp.status]}
            </span>
          </div>

          <dl className="detail__rel" style={{ display: 'grid', gap: '12px', margin: 0 }}>
            <div>
              <dt style={{ fontWeight: 600, fontSize: '13px', color: 'var(--c-text-muted)' }}>Builds on</dt>
              <dd style={{ margin: '4px 0 0' }}>
                {prereqs.length === 0 ? (
                  <span className="muted small">Nothing — a starting point.</span>
                ) : (
                  <ul className="inline-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {prereqs.map((p) => (
                      <li key={p.id}>
                        <button type="button" className="link-btn" onClick={() => setSelectedId(p.id)}>
                          {p.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
            <div>
              <dt style={{ fontWeight: 600, fontSize: '13px', color: 'var(--c-text-muted)' }}>Leads to</dt>
              <dd style={{ margin: '4px 0 0' }}>
                {leads.length === 0 ? (
                  <span className="muted small">No later topic depends on this one.</span>
                ) : (
                  <ul className="inline-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {leads.map((p) => (
                      <li key={p.id}>
                        <button type="button" className="link-btn" onClick={() => setSelectedId(p.id)}>
                          {p.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="detail__side">
          <h3 className="detail__sub" style={{ margin: '0 0 12px', fontSize: '1rem' }}>
            Why this status
          </h3>
          <ul className="steps" aria-label="Mastery criteria" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
            <li
              className={sp.lessonDone ? 'is-done' : ''}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name={sp.lessonDone ? 'check' : 'circle'} size={16} />
                <span>Lesson marked complete</span>
              </span>
              <span className="muted">{sp.lessonDone ? 'Yes' : 'No'}</span>
            </li>
            <li
              className={sp.quizPassed ? 'is-done' : ''}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name={sp.quizPassed ? 'check' : 'circle'} size={16} />
                <span>Quiz best score (pass = at least two thirds correct)</span>
              </span>
              <span className="muted">{best ? `${best.correct} of ${best.total}` : 'Not taken'}</span>
            </li>
            <li
              className={sp.practiceDone ? 'is-done' : ''}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name={sp.practiceDone ? 'check' : 'circle'} size={16} />
                <span>Practice challenge passed</span>
              </span>
              <span className="muted">{sp.practiceDone ? 'Yes' : 'No'}</span>
            </li>
            <li
              className={sp.status === 'mastered' ? 'is-done' : ''}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name={sp.status === 'mastered' ? 'star' : 'circle'} size={16} />
                <span>Mastered (perfect quiz, no early solution reveal)</span>
              </span>
              <span className="muted">
                {sp.status === 'mastered' ? 'Yes' : sp.usedSolution ? 'Not possible: solution revealed first' : 'Not yet'}
              </span>
            </li>
          </ul>

          <p className="muted small" style={{ marginTop: '14px', lineHeight: 1.4 }}>
            A learning aid, not an exam grade. Later review results are not part of the criteria.
          </p>

          <div className="detail__actions btn-row" style={{ marginTop: '16px' }}>
            <Link className="btn btn--primary btn--sm" to={lessonPath(selected.id)}>
              <Icon name="book" size={16} /> Learn
            </Link>
            <Link className="btn btn--secondary btn--sm" to={quizPath(selected.id)}>
              <Icon name="help" size={16} /> Quick quiz
            </Link>
            {ch && (
              <Link className="btn btn--secondary btn--sm" to={practicePath(ch.id)}>
                <Icon name="code" size={16} /> Practice
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
