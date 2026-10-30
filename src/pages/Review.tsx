import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getTopic } from '../data/curriculum'
import { ConfirmDialog } from '../components/Dialog'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useDocumentTitle } from '../lib/hooks'
import { lessonPath, practicePath, quizPath, trackPath } from '../lib/routes'
import { formatDateTime } from '../lib/status'
import { useApp } from '../state/AppState'
import { useTrack } from '../core/content/useTrack'
import { Flashcards } from '../core/learning/Flashcards'
import { renderMarkdown } from '../core/notes/markdown'
import { exportNotesAsMarkdownFile, exportBackupAsJsonFile } from '../core/storage/exportNotes'
import { useToast } from '../components/Toast'
import { DueReview } from '../core/learning/DueReview'
import { dueCards, toDayKey } from '../core/learning/spaced'

export default function Review() {
  useDocumentTitle('Review')
  const { state, dispatch } = useApp()
  const toast = useToast()
  const track = useTrack()
  const [searchParams] = useSearchParams()
  const dueList = dueCards(state.review ?? {}, toDayKey())
  const dueCount = dueList.length
  const [tab, setTab] = useState<'due' | 'errors' | 'journal'>(() => {
    const p = searchParams.get('tab')
    if (p === 'due' || p === 'errors' || p === 'journal') return p
    return 'errors'
  })
  const [errorViewMode, setErrorViewMode] = useState<'list' | 'flashcards'>('list')
  const [del, setDel] = useState<string | null>(null)
  
  const notes = Object.entries(state.notes)
  const hasNotes = notes.some(([, n]) => n && n.text.trim().length > 0)
  const hasBookmarks = (state.bookmarks && state.bookmarks.length > 0) || (state.sectionBookmarks && state.sectionBookmarks.length > 0)
  const hasExportableData = hasNotes || hasBookmarks
  const delEntry = state.errorNotebook.find((e) => e.id === del)

  return (
    <div className="page">
      <PageHeader
        title="Review"
        lede="Revisit mistakes you saved, and everything you wrote down."
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link to="/notes" className="btn btn--secondary btn--sm">
              <Icon name="pencil" size={14} /> All Notes
            </Link>
            <Link to="/bookmarks" className="btn btn--secondary btn--sm">
              <Icon name="bookmark" size={14} /> All Bookmarks
            </Link>
          </div>
        }
      />

      <div role="tablist" aria-label="Review tools" className="tabs">
        <button
          role="tab"
          type="button"
          id="rtab-due"
          aria-selected={tab === 'due'}
          aria-controls="rpanel-due"
          className={`tab${tab === 'due' ? ' is-active' : ''}`}
          onClick={() => setTab('due')}
        >
          Due today ({dueCount})
        </button>
        <button
          role="tab"
          type="button"
          id="rtab-errors"
          aria-selected={tab === 'errors'}
          aria-controls="rpanel-errors"
          className={`tab${tab === 'errors' ? ' is-active' : ''}`}
          onClick={() => setTab('errors')}
        >
          Error Notebook ({state.errorNotebook.length})
        </button>
        <button
          role="tab"
          type="button"
          id="rtab-journal"
          aria-selected={tab === 'journal'}
          aria-controls="rpanel-journal"
          className={`tab${tab === 'journal' ? ' is-active' : ''}`}
          onClick={() => setTab('journal')}
        >
          Journal &amp; bookmarks
        </button>
      </div>

      {tab === 'due' && (
        <div role="tabpanel" id="rpanel-due" aria-labelledby="rtab-due">
          <DueReview />
        </div>
      )}

      {tab === 'errors' && (
        <div role="tabpanel" id="rpanel-errors" aria-labelledby="rtab-errors">
        {state.errorNotebook.length === 0 ? (
          <EmptyState
            variant="review"
            icon="notebook"
            title="Your Error Notebook is empty"
            action={<Link className="btn btn--secondary" to={track ? trackPath(track.id) : '/explore'}>Open the Learning Orbit</Link>}
          >
            When a practice check fails or you miss a quiz question, choose “Save to Error Notebook” and it will appear here for review.
          </EmptyState>
        ) : (
          <div>
            {/* View Mode Switcher: List vs Flashcards */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div
                role="tablist"
                aria-label="Error Notebook display mode"
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
                  aria-selected={errorViewMode === 'list'}
                  className={`btn btn--ghost btn--sm ${errorViewMode === 'list' ? 'is-active' : ''}`}
                  onClick={() => setErrorViewMode('list')}
                >
                  <Icon name="progress" size={14} /> List
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={errorViewMode === 'flashcards'}
                  className={`btn btn--ghost btn--sm ${errorViewMode === 'flashcards' ? 'is-active' : ''}`}
                  onClick={() => setErrorViewMode('flashcards')}
                >
                  <Icon name="cards" size={14} /> Flashcards
                </button>
              </div>

              <span className="small muted">
                {state.errorNotebook.filter((e) => e.status === 'open').length} to review ·{' '}
                {state.errorNotebook.filter((e) => e.status === 'understood').length} understood
              </span>
            </div>

            {errorViewMode === 'flashcards' ? (
              <Flashcards
                entries={state.errorNotebook}
                onStatusChange={(id, status) => dispatch({ type: 'SET_ERROR_STATUS', id, status })}
                onDelete={(id) => setDel(id)}
              />
            ) : (
              <ul className="entries">
                {state.errorNotebook.map((e) => {
                  const t = getTopic(e.topicId)
                  return (
                    <li key={e.id} className={`card entry entry--${e.status}`}>
                      <div className="entry__head">
                        <span
                          className={`status-chip ${
                            e.status === 'understood' ? 'status-chip--completed' : 'status-chip--in-progress'
                          }`}
                        >
                          <Icon name={e.status === 'understood' ? 'check' : 'dot'} size={14} />
                          {e.status === 'understood' ? 'Understood' : 'To review'}
                        </span>
                        <span className="muted small">
                          {e.source === 'quiz' ? 'Quiz question' : 'Practice challenge'} · {t?.title} ·{' '}
                          {formatDateTime(e.createdAt)}
                        </span>
                      </div>
                      <h3 className="entry__title">{e.title}</h3>
                      <p className="muted">{e.detail}</p>
                      {e.code && (
                        <details>
                          <summary>Your code at the time</summary>
                          <pre className="entry__code" tabIndex={0}>
                            <code>{e.code}</code>
                          </pre>
                        </details>
                      )}
                      <div className="btn-row">
                        <Link className="btn btn--secondary btn--sm" to={lessonPath(e.topicId)}>
                          Review lesson
                        </Link>
                        <Link
                          className="btn btn--secondary btn--sm"
                          to={e.source === 'challenge' ? practicePath(e.refId) : quizPath(e.topicId)}
                        >
                          {e.source === 'challenge' ? 'Try the challenge again' : 'Retake the quiz'}
                        </Link>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() =>
                            dispatch({
                              type: 'SET_ERROR_STATUS',
                              id: e.id,
                              status: e.status === 'open' ? 'understood' : 'open',
                            })
                          }
                        >
                          {e.status === 'open' ? 'Mark as understood' : 'Reopen'}
                        </button>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDel(e.id)}>
                          <Icon name="trash" size={16} />Delete
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
      )}

      {tab === 'journal' && (
      <div role="tabpanel" id="rpanel-journal" aria-labelledby="rtab-journal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Notes</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={!hasNotes}
              title={hasNotes ? 'Export all notes as Markdown file' : 'No notes written yet to export'}
              onClick={() => exportNotesAsMarkdownFile(state.notes)}
            >
              <Icon name="download" size={14} /> Export notes (.md)
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={!hasExportableData}
              title={hasExportableData ? 'Export notes and bookmarks backup' : 'No data to export'}
              onClick={() => exportBackupAsJsonFile(state)}
            >
              <Icon name="download" size={14} /> Backup (.json)
            </button>
          </div>
        </div>

        {notes.length === 0 ? (
          <EmptyState
            variant="notes"
            icon="pencil"
            title="No notes yet"
            action={<Link className="btn btn--secondary" to={lessonPath('html-structure')}>Open the first lesson</Link>}
          >
            Write notes in the study panel of any lesson and they will be collected here.
          </EmptyState>
        ) : (
          <ul className="entries" style={{ marginBottom: '32px' }}>
            {notes.map(([id, n]) => (
              <li key={id} className="card entry">
                <div className="entry__head">
                  <span className="muted small">
                    {getTopic(id)?.title || id} · updated {formatDateTime(n.updatedAt)}
                  </span>
                  {n.tags && n.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {n.tags.map((tag) => (
                        <span key={tag} className="status-chip" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="entry__note" style={{ fontSize: '13px', lineHeight: 1.6 }}>
                  {renderMarkdown(n.text)}
                </div>
                <div className="btn-row">
                  <Link className="btn btn--secondary btn--sm" to={lessonPath(id)}>
                    <Icon name="pencil" size={16} />Edit in lesson
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Bookmarks</h2>
          <Link to="/bookmarks" className="btn btn--ghost btn--sm">
            Manage bookmark folders <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        {state.bookmarks.length === 0 ? (
          <EmptyState variant="bookmarks" icon="bookmark" title="No bookmarks yet">
            Use “Bookmark this topic” in a lesson to keep a shortcut here.
          </EmptyState>
        ) : (
          <ul className="bookmark-list">
            {state.bookmarks.map((id) => (
              <li key={id}>
                <Icon name="bookmark" size={16} />
                <Link to={lessonPath(id)}>{getTopic(id)?.title || id}</Link>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove bookmark: ${getTopic(id)?.title || id}`}
                  onClick={() => dispatch({ type: 'TOGGLE_BOOKMARK', topicId: id })}
                >
                  <Icon name="close" size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      )}

      <ConfirmDialog
        open={!!del}
        title="Delete this entry?"
        confirmLabel="Delete entry"
        danger
        onCancel={() => setDel(null)}
        onConfirm={() => {
          if (del && delEntry) {
            const entryToRestore = { ...delEntry }
            dispatch({ type: 'DELETE_ERROR', id: del })
            toast.show('Entry removed from Error Notebook', 'info', undefined, {
              label: 'Undo',
              onClick: () => dispatch({ type: 'RESTORE_ERROR', entry: entryToRestore }),
            })
          }
          setDel(null)
        }}
      >
        <p>“{delEntry?.title}” will be removed from your Error Notebook.</p>
      </ConfirmDialog>
    </div>
  )
}
