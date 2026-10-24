import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getTopic } from '../data/curriculum'
import { ConfirmDialog } from '../components/Dialog'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useDocumentTitle } from '../lib/hooks'
import { lessonPath, practicePath, quizPath, trackPath } from '../lib/routes'
import { formatDateTime } from '../lib/status'
import { useApp } from '../state/AppState'

export default function Review() {
  useDocumentTitle('Review')
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState<'errors' | 'journal'>('errors')
  const [del, setDel] = useState<string | null>(null)
  const notes = Object.entries(state.notes)
  const delEntry = state.errorNotebook.find((e) => e.id === del)

  return (
    <div className="page">
      <PageHeader title="Review" lede="Revisit mistakes you saved, and everything you wrote down." />
      <div role="tablist" aria-label="Review tools" className="tabs">
        <button role="tab" type="button" id="rtab-errors" aria-selected={tab === 'errors'} aria-controls="rpanel-errors" className={`tab${tab === 'errors' ? ' is-active' : ''}`} onClick={() => setTab('errors')}>Error Notebook ({state.errorNotebook.length})</button>
        <button role="tab" type="button" id="rtab-journal" aria-selected={tab === 'journal'} aria-controls="rpanel-journal" className={`tab${tab === 'journal' ? ' is-active' : ''}`} onClick={() => setTab('journal')}>Journal &amp; bookmarks</button>
      </div>

      <div role="tabpanel" id="rpanel-errors" aria-labelledby="rtab-errors" hidden={tab !== 'errors'}>
        {state.errorNotebook.length === 0 ? (
          <EmptyState icon="notebook" title="Your Error Notebook is empty"
            action={<Link className="btn btn--secondary" to={trackPath()}>Open the Learning Orbit</Link>}>
            When a practice check fails or you miss a quiz question, choose “Save to Error Notebook” and it will appear here for review.
          </EmptyState>
        ) : (
          <ul className="entries">
            {state.errorNotebook.map((e) => {
              const t = getTopic(e.topicId)
              return (
                <li key={e.id} className={`card entry entry--${e.status}`}>
                  <div className="entry__head">
                    <span className={`status-chip ${e.status === 'understood' ? 'status-chip--completed' : 'status-chip--in-progress'}`}>
                      <Icon name={e.status === 'understood' ? 'check' : 'dot'} size={14} />{e.status === 'understood' ? 'Understood' : 'To review'}
                    </span>
                    <span className="muted small">{e.source === 'quiz' ? 'Quiz question' : 'Practice challenge'} · {t?.title} · {formatDateTime(e.createdAt)}</span>
                  </div>
                  <h3 className="entry__title">{e.title}</h3>
                  <p className="muted">{e.detail}</p>
                  {e.code && (
                    <details><summary>Your code at the time</summary><pre className="entry__code" tabIndex={0}><code>{e.code}</code></pre></details>
                  )}
                  <div className="btn-row">
                    <Link className="btn btn--secondary btn--sm" to={lessonPath(e.topicId)}>Review lesson</Link>
                    <Link className="btn btn--secondary btn--sm" to={e.source === 'challenge' ? practicePath(e.refId) : quizPath(e.topicId)}>{e.source === 'challenge' ? 'Try the challenge again' : 'Retake the quiz'}</Link>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'SET_ERROR_STATUS', id: e.id, status: e.status === 'open' ? 'understood' : 'open' })}>
                      {e.status === 'open' ? 'Mark as understood' : 'Reopen'}
                    </button>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDel(e.id)}><Icon name="trash" size={16} />Delete</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div role="tabpanel" id="rpanel-journal" aria-labelledby="rtab-journal" hidden={tab !== 'journal'}>
        <h2 className="section-title">Notes</h2>
        {notes.length === 0 ? (
          <EmptyState icon="pencil" title="No notes yet" action={<Link className="btn btn--secondary" to={lessonPath('html-structure')}>Open the first lesson</Link>}>
            Write notes in the study panel of any lesson and they will be collected here.
          </EmptyState>
        ) : (
          <ul className="entries">
            {notes.map(([id, n]) => (
              <li key={id} className="card entry">
                <div className="entry__head"><span className="muted small">{getTopic(id)?.title} · updated {formatDateTime(n.updatedAt)}</span></div>
                <p className="entry__note">{n.text}</p>
                <div className="btn-row">
                  <Link className="btn btn--secondary btn--sm" to={lessonPath(id)}><Icon name="pencil" size={16} />Edit in lesson</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        <h2 className="section-title">Bookmarks</h2>
        {state.bookmarks.length === 0 ? (
          <EmptyState icon="bookmark" title="No bookmarks yet">Use “Bookmark this topic” in a lesson to keep a shortcut here.</EmptyState>
        ) : (
          <ul className="bookmark-list">
            {state.bookmarks.map((id) => (
              <li key={id}><Icon name="bookmark" size={16} /><Link to={lessonPath(id)}>{getTopic(id)?.title}</Link>
                <button type="button" className="icon-btn" aria-label={`Remove bookmark: ${getTopic(id)?.title}`} onClick={() => dispatch({ type: 'TOGGLE_BOOKMARK', topicId: id })}><Icon name="close" size={16} /></button></li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog open={!!del} title="Delete this entry?" confirmLabel="Delete entry" danger onCancel={() => setDel(null)}
        onConfirm={() => { if (del) dispatch({ type: 'DELETE_ERROR', id: del }); setDel(null) }}>
        <p>“{delEntry?.title}” will be removed from your Error Notebook.</p>
      </ConfirmDialog>
    </div>
  )
}
