import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../state/AppState'
import { getTopic } from '../../data/curriculum'
import { lessonPath } from '../../lib/routes'
import { formatDateTime } from '../../lib/status'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState } from '../../components/EmptyState'
import { ConfirmDialog } from '../../components/Dialog'
import { useDocumentTitle } from '../../lib/hooks'
import { renderMarkdown } from './markdown'
import { NoteEditor } from './NoteEditor'
import { exportNotesAsMarkdownFile, exportBackupAsJsonFile } from '../storage/exportNotes'
import { useToast } from '../../components/Toast'

export default function NotesPage() {
  useDocumentTitle('All Notes')
  const { state, dispatch } = useApp()
  const toast = useToast()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest')
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null)

  // Collect all notes
  const allNotes = useMemo(() => {
    return Object.entries(state.notes || {})
      .filter(([, note]) => note && typeof note.text === 'string' && note.text.trim().length > 0)
      .map(([topicId, note]) => {
        const topic = getTopic(topicId)
        return {
          topicId,
          topicTitle: topic?.title || topicId,
          groupId: topic?.groupId || 'other',
          text: note.text,
          tags: note.tags || [],
          updatedAt: note.updatedAt || 0,
        }
      })
  }, [state.notes])

  // Extract all unique tags with count
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allNotes.forEach((n) => {
      n.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1
      })
    })
    return counts
  }, [allNotes])

  const uniqueTags = useMemo(() => Object.keys(tagCounts).sort(), [tagCounts])

  // Filter & sort
  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allNotes
      .filter((n) => {
        if (selectedTag && !n.tags.includes(selectedTag)) {
          return false
        }
        if (!q) return true
        return (
          n.topicTitle.toLowerCase().includes(q) ||
          n.text.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.updatedAt - a.updatedAt
        if (sortBy === 'oldest') return a.updatedAt - b.updatedAt
        return a.topicTitle.localeCompare(b.topicTitle)
      })
  }, [allNotes, searchQuery, selectedTag, sortBy])

  const hasNotes = allNotes.length > 0

  return (
    <div className="page">
      <PageHeader
        title="Study Notes"
        lede="All your Markdown notes across lessons and topics, searchable and tagged."
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={!hasNotes}
              title={hasNotes ? 'Export all notes as Markdown' : 'Write your first note from any topic to export'}
              onClick={() => exportNotesAsMarkdownFile(state.notes)}
            >
              <Icon name="download" size={14} /> Export Notes (.md)
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={!hasNotes}
              title={hasNotes ? 'Export backup JSON' : 'Write your first note to export'}
              onClick={() => exportBackupAsJsonFile(state)}
            >
              <Icon name="download" size={14} /> Backup (.json)
            </button>
          </div>
        }
      />

      {!hasNotes ? (
        <EmptyState
          variant="notes"
          icon="pencil"
          title="Write your first note from any topic"
          action={
            <Link className="btn btn--secondary" to={lessonPath('html-structure')}>
              Open first lesson
            </Link>
          }
        >
          You haven't written any notes yet. Open any lesson and jot down thoughts in the study panel to collect them here.
        </EmptyState>
      ) : (
        <div>
          {/* Controls: Search, Tag filter, Sort */}
          <div
            className="card"
            style={{
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '400px' }}>
                <label htmlFor="notes-search-input" className="sr-only">
                  Search notes by text, title or tag
                </label>
                <input
                  id="notes-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes, topics, tags..."
                  className="input input--sm"
                  style={{ width: '100%', paddingLeft: '32px' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted, #8b949e)',
                    pointerEvents: 'none',
                    display: 'flex',
                  }}
                  aria-hidden="true"
                >
                  <Icon name="search" size={14} />
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted, #8b949e)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="notes-sort-select" className="small muted" style={{ fontWeight: 600 }}>
                  Sort:
                </label>
                <select
                  id="notes-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                  className="select select--sm"
                  style={{ fontSize: '12px' }}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Tag Pills */}
            {uniqueTags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span className="small muted" style={{ fontWeight: 600, marginRight: '4px' }}>
                  Tags:
                </span>
                <button
                  type="button"
                  className={`status-chip ${selectedTag === null ? 'status-chip--completed' : ''}`}
                  onClick={() => setSelectedTag(null)}
                  style={{ cursor: 'pointer', fontSize: '11px', padding: '2px 8px' }}
                >
                  All ({allNotes.length})
                </button>
                {uniqueTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`status-chip ${selectedTag === t ? 'status-chip--completed' : ''}`}
                    onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                    style={{ cursor: 'pointer', fontSize: '11px', padding: '2px 8px' }}
                  >
                    #{t} ({tagCounts[t]})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results count */}
          <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--muted, #8b949e)' }}>
            Showing {filteredNotes.length} of {allNotes.length} {allNotes.length === 1 ? 'note' : 'notes'}
            {selectedTag && ` filtered by #${selectedTag}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>

          {filteredNotes.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <p className="muted" style={{ margin: '0 0 12px' }}>
                No notes match your filter or search query.
              </p>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedTag(null)
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredNotes.map((note) => {
                const isEditing = editingTopicId === note.topicId

                return (
                  <div key={note.topicId} className="card entry" style={{ padding: '18px' }}>
                    <div className="entry__head" style={{ justifyContent: 'space-between' }}>
                      <div>
                        <Link
                          to={lessonPath(note.topicId)}
                          style={{
                            fontWeight: 700,
                            fontSize: '1.15rem',
                            color: 'var(--text, #f0eff7)',
                            textDecoration: 'none',
                          }}
                        >
                          {note.topicTitle}
                        </Link>
                        <span className="muted small" style={{ display: 'block', marginTop: '2px' }}>
                          Updated {formatDateTime(note.updatedAt)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setEditingTopicId(isEditing ? null : note.topicId)}
                          aria-label={isEditing ? 'Close editor' : `Edit note for ${note.topicTitle}`}
                        >
                          <Icon name="pencil" size={14} />
                          {isEditing ? 'Done' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setDeletingTopicId(note.topicId)}
                          aria-label={`Delete note for ${note.topicTitle}`}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                        <NoteEditor
                          topicId={note.topicId}
                          title={note.topicTitle}
                          onClose={() => setEditingTopicId(null)}
                        />
                      </div>
                    ) : (
                      <div style={{ marginTop: '12px' }}>
                        {note.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                            {note.tags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                className="status-chip"
                                style={{
                                  fontSize: '10px',
                                  padding: '1px 7px',
                                  cursor: 'pointer',
                                  border: selectedTag === tag ? '1px solid var(--accent, #9a8bff)' : undefined,
                                }}
                                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="entry__note" style={{ fontSize: '13px', lineHeight: 1.6 }}>
                          {renderMarkdown(note.text)}
                        </div>

                        <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                          <Link className="btn btn--secondary btn--sm" to={lessonPath(note.topicId)}>
                            Open lesson <Icon name="arrow-right" size={12} />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingTopicId}
        title="Delete this note?"
        confirmLabel="Delete note"
        danger
        onCancel={() => setDeletingTopicId(null)}
        onConfirm={() => {
          if (deletingTopicId) {
            const noteToRestore = state.notes[deletingTopicId]
            const topicIdToRestore = deletingTopicId
            dispatch({
              type: 'SET_NOTE',
              topicId: deletingTopicId,
              text: '',
              tags: [],
              now: Date.now(),
            })
            if (editingTopicId === deletingTopicId) {
              setEditingTopicId(null)
            }
            if (noteToRestore && (noteToRestore.text.trim() || (noteToRestore.tags && noteToRestore.tags.length > 0))) {
              toast.show('Note deleted', 'info', undefined, {
                label: 'Undo',
                onClick: () => dispatch({ type: 'RESTORE_NOTE', topicId: topicIdToRestore, note: { ...noteToRestore } }),
              })
            }
          }
          setDeletingTopicId(null)
        }}
      >
        <p>
          Are you sure you want to delete your note for{' '}
          <strong>{deletingTopicId ? getTopic(deletingTopicId)?.title || deletingTopicId : ''}</strong>?
        </p>
      </ConfirmDialog>
    </div>
  )
}
