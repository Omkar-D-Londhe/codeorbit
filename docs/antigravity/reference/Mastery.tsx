import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { challengesForTopic } from '../data/challenges'
import { dependentsOf, getTopic, topics } from '../data/curriculum'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useDocumentTitle, useElementWidth } from '../lib/hooks'
import { computeMasteryLayout, topicDepths } from '../lib/masteryLayout'
import { topicProgress, type TopicProgress } from '../lib/progress'
import { lessonPath, practicePath, quizPath, trackPath } from '../lib/routes'
import { STATUS_ICON, STATUS_LABEL } from '../lib/status'
import { useApp } from '../state/AppState'

const GRAPH_MIN_WIDTH = 720

export default function Mastery() {
  useDocumentTitle('Mastery map')
  const { state } = useApp()
  const wrap = useRef<HTMLDivElement>(null)
  const width = useElementWidth(wrap)
  const [selectedId, setSelectedId] = useState(topics[0].id)
  const layout = useMemo(() => computeMasteryLayout(topics, Math.max(width, GRAPH_MIN_WIDTH)), [width])
  const depths = useMemo(() => topicDepths(topics), [])
  const showGraph = width >= GRAPH_MIN_WIDTH
  const progressOf = (id: string): TopicProgress => topicProgress(state, getTopic(id)!)
  const selected = getTopic(selectedId)!
  const sp = progressOf(selectedId)
  const best = state.topics[selectedId]?.quizBest
  const prereqs = selected.prerequisiteIds.map((id) => getTopic(id)!)
  const leads = dependentsOf(selectedId)
  const ch = challengesForTopic(selectedId)[0]
  const byLevel = Array.from({ length: layout.columns }, (_, d) => topics.filter((t) => depths.get(t.id) === d))

  const list = (
    <ol className="mastery-list" aria-label="Topics grouped by prerequisite level">
      {byLevel.map((ts, d) => (
        <li key={d}>
          <h3 className="mastery-list__h">Level {d + 1}{d === 0 ? ' · starting points' : ''}</h3>
          <ul>
            {ts.map((t) => {
              const p = progressOf(t.id)
              return (
                <li key={t.id} className="mastery-list__row">
                  <button type="button" className="link-btn" onClick={() => setSelectedId(t.id)} aria-current={t.id === selectedId ? 'true' : undefined}>{t.title}</button>
                  <span className={`status-chip status-chip--${p.status}`}><Icon name={STATUS_ICON[p.status]} size={14} />{STATUS_LABEL[p.status]}</span>
                  <span className="muted small">{t.prerequisiteIds.length ? `Builds on: ${t.prerequisiteIds.map((id) => getTopic(id)?.title).join(', ')}` : 'No prerequisites'}</span>
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ol>
  )

  return (
    <div className="page page--wide">
      <PageHeader
        crumbs={[{ label: 'Explore', to: '/explore' }, { label: 'HTML', to: trackPath() }, { label: 'Mastery map' }]}
        title="Mastery map"
        lede="How the HTML topics build on each other, and where you stand on each. Every line is a real prerequisite; a level is the longest chain of prerequisites before a topic."
        actions={<Link className="btn btn--ghost" to={trackPath()}><Icon name="compass" size={18} />Learning Orbit</Link>}
      />
      <section className="card mastery-card" aria-label="Prerequisite map">
        <div ref={wrap} className="mastery">
          {showGraph ? (
            <div className="mastery__graph" style={{ height: layout.height + 28 }}>
              <div className="mastery__levels" aria-hidden="true">
                {Array.from({ length: layout.columns }, (_, d) => (
                  <span key={d} style={{ left: layout.nodes.find((n) => n.depth === d)!.x, width: layout.nodeW }}>Level {d + 1}</span>
                ))}
              </div>
              <svg className="mastery__svg" width={layout.width} height={layout.height + 28} viewBox={`0 0 ${layout.width} ${layout.height + 28}`} aria-hidden="true" focusable="false">
                <g transform="translate(0 28)">
                  {layout.edges.map((e) => (
                    <path key={`${e.from}>${e.to}`} d={e.d} className={`mastery__edge${e.from === selectedId || e.to === selectedId ? ' mastery__edge--active' : ''}`} />
                  ))}
                </g>
              </svg>
              <ul className="mastery__nodes">
                {layout.nodes.map((n) => {
                  const t = getTopic(n.id)!
                  const p = progressOf(n.id)
                  return (
                    <li key={n.id} style={{ left: n.x, top: n.y + 28, width: layout.nodeW, height: layout.nodeH }}>
                      <button
                        type="button"
                        className={`mastery-node mastery-node--${p.status}`}
                        data-topic-id={n.id}
                        aria-current={n.id === selectedId ? 'true' : undefined}
                        aria-label={`${t.title}. Level ${n.depth + 1}. ${STATUS_LABEL[p.status]}.${n.id === selectedId ? ' Selected.' : ''}`}
                        onClick={() => setSelectedId(n.id)}
                      >
                        <span className="mastery-node__title">{t.shortTitle}</span>
                        <span className="mastery-node__status"><Icon name={STATUS_ICON[p.status]} size={14} />{STATUS_LABEL[p.status]}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : list}
        </div>
        {showGraph && <details className="mastery-alt"><summary>Show as a list</summary>{list}</details>}
      </section>

      <section className="detail" aria-labelledby="m-detail" aria-live="polite">
        <div className="detail__main">
          <p className="eyebrow">Level {(depths.get(selectedId) ?? 0) + 1}</p>
          <h2 id="m-detail" className="detail__title">{selected.title}</h2>
          <div className="detail__chips">
            <span className={`status-chip status-chip--${sp.status}`}><Icon name={STATUS_ICON[sp.status]} size={14} />{STATUS_LABEL[sp.status]}</span>
          </div>
          <dl className="detail__rel">
            <div><dt>Builds on</dt><dd>{prereqs.length === 0 ? <span className="muted">Nothing — a starting point.</span> : <ul className="inline-list">{prereqs.map((p) => <li key={p.id}><button type="button" className="link-btn" onClick={() => setSelectedId(p.id)}>{p.title}</button></li>)}</ul>}</dd></div>
            <div><dt>Leads to</dt><dd>{leads.length === 0 ? <span className="muted">No later topic depends on this one.</span> : <ul className="inline-list">{leads.map((p) => <li key={p.id}><button type="button" className="link-btn" onClick={() => setSelectedId(p.id)}>{p.title}</button></li>)}</ul>}</dd></div>
          </dl>
        </div>
        <div className="detail__side">
          <h3 className="detail__sub">Why this status</h3>
          <ul className="steps" aria-label="Mastery criteria">
            <li className={sp.lessonDone ? 'is-done' : ''}><Icon name={sp.lessonDone ? 'check' : 'circle'} size={16} /><span>Lesson marked complete</span><span className="muted">{sp.lessonDone ? 'Yes' : 'No'}</span></li>
            <li className={sp.quizPassed ? 'is-done' : ''}><Icon name={sp.quizPassed ? 'check' : 'circle'} size={16} /><span>Quiz best score (pass = 2 of 3)</span><span className="muted">{best ? `${best.correct} of ${best.total}` : 'Not taken'}</span></li>
            <li className={sp.practiceDone ? 'is-done' : ''}><Icon name={sp.practiceDone ? 'check' : 'circle'} size={16} /><span>Practice challenge passed</span><span className="muted">{sp.practiceDone ? 'Yes' : 'No'}</span></li>
            <li className={sp.status === 'mastered' ? 'is-done' : ''}><Icon name={sp.status === 'mastered' ? 'star' : 'circle'} size={16} /><span>Mastered (perfect quiz, no early solution reveal)</span><span className="muted">{sp.status === 'mastered' ? 'Yes' : sp.usedSolution ? 'Not possible: solution revealed first' : 'Not yet'}</span></li>
          </ul>
          <p className="muted small">A learning aid, not an exam grade. Later review results are not part of the criteria.</p>
          <div className="detail__actions">
            <Link className="btn btn--primary" to={lessonPath(selectedId)}><Icon name="book" size={18} />Learn</Link>
            <Link className="btn btn--secondary" to={quizPath(selectedId)}><Icon name="quiz" size={18} />Quick quiz</Link>
            {ch && <Link className="btn btn--secondary" to={practicePath(ch.id)}><Icon name="code" size={18} />Practice</Link>}
          </div>
        </div>
      </section>
    </div>
  )
}
