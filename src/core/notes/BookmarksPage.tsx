import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../state/AppState'
import { getTopic } from '../../data/curriculum'
import { lessons } from '../../data/lessons'
import { lessonPath } from '../../lib/routes'
import { parseSectionBookmarkId, DEFAULT_BOOKMARK_FOLDER_ID } from '../../state/types'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState } from '../../components/EmptyState'
import { ConfirmDialog } from '../../components/Dialog'
import { useDocumentTitle } from '../../lib/hooks'
import { exportBackupAsJsonFile } from '../storage/exportNotes'

function getBookmarkDetails(itemId: string) {
  const parsed = parseSectionBookmarkId(itemId)
  if (parsed) {
    const topic = getTopic(parsed.topicId)
    const lesson = lessons.find((l) => l.topicId === parsed.topicId)
    const section = lesson?.sections.find((s, idx) => {
      const sId = s.heading ? s.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `section-${idx}`
      return sId === parsed.sectionId || `section-${idx}` === parsed.sectionId
    })
    return {
      isSection: true,
      topicId: parsed.topicId,
      sectionId: parsed.sectionId,
      topicTitle: topic?.title || parsed.topicId,
      title: section ? `${topic?.title || parsed.topicId} › ${section.heading}` : `${topic?.title || parsed.topicId} › Section`,
      url: `${lessonPath(parsed.topicId)}#section-${parsed.sectionId}`,
    }
  }

  const topic = getTopic(itemId)
  return {
    isSection: false,
    topicId: itemId,
    topicTitle: topic?.title || itemId,
    title: topic?.title || itemId,
    url: lessonPath(itemId),
  }
}

export default function BookmarksPage() {
  useDocumentTitle('Bookmarks & Folders')
  const { state, dispatch } = useApp()

  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderError, setFolderError] = useState<string | null>(null)

  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null)
  const [renameFolderName, setRenameFolderName] = useState('')
  const [renameError, setRenameError] = useState<string | null>(null)

  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null)

  const folders = state.bookmarkFolders || [
    { id: DEFAULT_BOOKMARK_FOLDER_ID, name: 'Unsorted', itemIds: state.bookmarks || [] },
  ]

  const totalBookmarks = folders.reduce((sum, f) => sum + f.itemIds.length, 0)

  const handleCreateFolder = () => {
    const name = newFolderName.trim()
    if (!name) {
      setFolderError('Folder name cannot be empty')
      return
    }
    if (name.length > 30) {
      setFolderError('Folder name must be 30 characters or less')
      return
    }
    if (folders.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      setFolderError('A folder with this name already exists')
      return
    }

    const folderId = 'folder-' + Date.now().toString(36)
    dispatch({ type: 'CREATE_BOOKMARK_FOLDER', id: folderId, name })
    setNewFolderName('')
    setFolderError(null)
    setCreatingFolder(false)
  }

  const handleRenameFolder = () => {
    if (!renamingFolderId) return
    const name = renameFolderName.trim()
    if (!name) {
      setRenameError('Folder name cannot be empty')
      return
    }
    if (name.length > 30) {
      setRenameError('Folder name must be 30 characters or less')
      return
    }
    if (folders.some((f) => f.id !== renamingFolderId && f.name.toLowerCase() === name.toLowerCase())) {
      setRenameError('A folder with this name already exists')
      return
    }

    dispatch({ type: 'RENAME_BOOKMARK_FOLDER', folderId: renamingFolderId, name })
    setRenamingFolderId(null)
    setRenameFolderName('')
    setRenameError(null)
  }

  const handleDeleteFolder = () => {
    if (!deletingFolderId) return
    dispatch({ type: 'DELETE_BOOKMARK_FOLDER', folderId: deletingFolderId })
    setDeletingFolderId(null)
  }

  const handleRemoveItem = (itemId: string) => {
    const parsed = parseSectionBookmarkId(itemId)
    if (parsed) {
      dispatch({ type: 'TOGGLE_SECTION_BOOKMARK', topicId: parsed.topicId, sectionId: parsed.sectionId })
    } else {
      dispatch({ type: 'TOGGLE_BOOKMARK', topicId: itemId })
    }
  }

  const handleMoveItem = (itemId: string, fromFolderId: string, toFolderId: string) => {
    if (fromFolderId === toFolderId) return
    dispatch({ type: 'MOVE_BOOKMARK_ITEM', itemId, targetFolderId: toFolderId })
  }

  const deletingFolder = folders.find((f) => f.id === deletingFolderId)

  return (
    <div className="page">
      <PageHeader
        title="Bookmarks"
        lede="Organize lessons and sections with custom folders and quick shortcuts."
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                setCreatingFolder(true)
                setFolderError(null)
                setNewFolderName('')
              }}
            >
              <Icon name="plus" size={14} /> New Folder
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={totalBookmarks === 0}
              title={totalBookmarks > 0 ? 'Export bookmarks backup' : 'No bookmarks to export'}
              onClick={() => exportBackupAsJsonFile(state)}
            >
              <Icon name="download" size={14} /> Backup (.json)
            </button>
          </div>
        }
      />

      {/* New Folder Modal / Form Card */}
      {creatingFolder && (
        <div
          className="card"
          style={{
            padding: '16px',
            marginBottom: '20px',
            background: 'var(--surface, #1e1e2e)',
            border: '1px solid var(--accent, #9a8bff)',
          }}
        >
          <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>Create New Bookmark Folder</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => {
                setNewFolderName(e.target.value)
                setFolderError(null)
              }}
              placeholder="Folder name (e.g., CSS Styling, Quick Review)"
              className="input input--sm"
              style={{ flex: '1 1 200px' }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder()
                if (e.key === 'Escape') setCreatingFolder(false)
              }}
            />
            <button type="button" className="btn btn--primary btn--sm" onClick={handleCreateFolder}>
              Create
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setCreatingFolder(false)
                setFolderError(null)
              }}
            >
              Cancel
            </button>
          </div>
          {folderError && (
            <p role="alert" className="small" style={{ color: 'var(--fail, #f87171)', margin: '6px 0 0' }}>
              {folderError}
            </p>
          )}
        </div>
      )}

      {/* Rename Folder Modal / Form Card */}
      {renamingFolderId && (
        <div
          className="card"
          style={{
            padding: '16px',
            marginBottom: '20px',
            background: 'var(--surface, #1e1e2e)',
            border: '1px solid var(--accent, #9a8bff)',
          }}
        >
          <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>Rename Folder</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={renameFolderName}
              onChange={(e) => {
                setRenameFolderName(e.target.value)
                setRenameError(null)
              }}
              placeholder="New folder name"
              className="input input--sm"
              style={{ flex: '1 1 200px' }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameFolder()
                if (e.key === 'Escape') setRenamingFolderId(null)
              }}
            />
            <button type="button" className="btn btn--primary btn--sm" onClick={handleRenameFolder}>
              Save
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setRenamingFolderId(null)
                setRenameError(null)
              }}
            >
              Cancel
            </button>
          </div>
          {renameError && (
            <p role="alert" className="small" style={{ color: 'var(--fail, #f87171)', margin: '6px 0 0' }}>
              {renameError}
            </p>
          )}
        </div>
      )}

      {totalBookmarks === 0 && folders.length === 1 && folders[0].itemIds.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="No bookmarks yet"
          action={
            <Link className="btn btn--secondary" to={lessonPath('html-structure')}>
              Explore first lesson
            </Link>
          }
        >
          Bookmark any lesson topic or section to build your reference collection.
        </EmptyState>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {folders.map((folder) => {
            const isDefault = folder.id === DEFAULT_BOOKMARK_FOLDER_ID

            return (
              <div key={folder.id} className="card" style={{ padding: '20px' }}>
                {/* Folder Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
                    paddingBottom: '10px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon name="bookmark" size={18} />
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                      {folder.name}
                    </h2>
                    <span className="small muted">({folder.itemIds.length})</span>
                  </div>

                  {!isDefault && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => {
                          setRenamingFolderId(folder.id)
                          setRenameFolderName(folder.name)
                          setRenameError(null)
                        }}
                        aria-label={`Rename folder ${folder.name}`}
                      >
                        <Icon name="pencil" size={14} /> Rename
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setDeletingFolderId(folder.id)}
                        aria-label={`Delete folder ${folder.name}`}
                      >
                        <Icon name="trash" size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Items list */}
                {folder.itemIds.length === 0 ? (
                  <p className="muted small" style={{ fontStyle: 'italic', margin: '10px 0' }}>
                    No bookmarks in this folder. Move items here using the menu below each bookmark.
                  </p>
                ) : (
                  <ul className="bookmark-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
                    {folder.itemIds.map((itemId) => {
                      const details = getBookmarkDetails(itemId)

                      return (
                        <li
                          key={itemId}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '10px 14px',
                            borderRadius: 'var(--r-md, 8px)',
                            border: '1px solid var(--border, rgba(255, 255, 255, 0.06))',
                            flexWrap: 'wrap',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px' }}>
                            <Icon name={details.isSection ? 'bookmark' : 'book'} size={16} />
                            <div>
                              <Link
                                to={details.url}
                                style={{
                                  fontWeight: 600,
                                  color: 'var(--text, #f0eff7)',
                                  textDecoration: 'none',
                                  fontSize: '14px',
                                }}
                              >
                                {details.title}
                              </Link>
                              {details.isSection && (
                                <span className="small muted" style={{ display: 'block', fontSize: '11px' }}>
                                  Section bookmark
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {folders.length > 1 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <label htmlFor={`move-${folder.id}-${itemId}`} className="sr-only">
                                  Move to folder
                                </label>
                                <select
                                  id={`move-${folder.id}-${itemId}`}
                                  value={folder.id}
                                  onChange={(e) => handleMoveItem(itemId, folder.id, e.target.value)}
                                  className="select select--sm"
                                  style={{ fontSize: '11px', padding: '3px 8px' }}
                                >
                                  {folders.map((f) => (
                                    <option key={f.id} value={f.id}>
                                      {f.id === folder.id ? `In: ${f.name}` : `Move to: ${f.name}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <button
                              type="button"
                              className="icon-btn"
                              aria-label={`Remove bookmark: ${details.title}`}
                              onClick={() => handleRemoveItem(itemId)}
                            >
                              <Icon name="close" size={14} />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Folder Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingFolderId}
        title="Delete this folder?"
        confirmLabel="Delete folder"
        danger
        onCancel={() => setDeletingFolderId(null)}
        onConfirm={handleDeleteFolder}
      >
        <p>
          Are you sure you want to delete the folder <strong>“{deletingFolder?.name}”</strong>?
        </p>
        <p className="muted small">
          Any bookmarks currently inside this folder will automatically be moved to your <strong>Unsorted</strong>{' '}
          folder. No bookmarks will be deleted.
        </p>
      </ConfirmDialog>
    </div>
  )
}
