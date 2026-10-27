import { useState, useEffect, useId } from 'react'
import { useApp } from '../../state/AppState'
import { renderMarkdown } from './markdown'
import { Icon } from '../../components/Icon'
import { useMediaQuery } from '../../lib/hooks'
import { formatDateTime } from '../../lib/status'

const MAX_NOTE_LENGTH = 20000
const MAX_TAGS = 8
const MAX_TAG_LENGTH = 24
const TAG_REGEX = /^[a-z0-9-]+$/

export function validateTag(raw: string, currentTags: string[]): { valid: boolean; tag?: string; error?: string } {
  const tag = raw.trim().toLowerCase()
  if (!tag) {
    return { valid: false }
  }
  if (!TAG_REGEX.test(tag)) {
    return { valid: false, error: 'Tags may only contain lowercase letters, numbers, and hyphens' }
  }
  if (tag.length > MAX_TAG_LENGTH) {
    return { valid: false, error: `Tags must be ${MAX_TAG_LENGTH} characters or less` }
  }
  if (currentTags.includes(tag)) {
    return { valid: false, error: 'Tag already added' }
  }
  if (currentTags.length >= MAX_TAGS) {
    return { valid: false, error: `Maximum of ${MAX_TAGS} tags allowed per note` }
  }
  return { valid: true, tag }
}

export interface NoteEditorProps {
  topicId: string
  title?: string
  compact?: boolean
  onClose?: () => void
}

export function NoteEditor({ topicId, title, compact = false, onClose }: NoteEditorProps) {
  const { state, dispatch, saveStatus } = useApp()
  const rec = state.notes[topicId]
  
  const [text, setText] = useState(rec?.text ?? '')
  const [tags, setTags] = useState<string[]>(rec?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [tagError, setTagError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit')
  const [saveIndicator, setSaveIndicator] = useState<'saved' | 'saving' | 'error'>('saved')
  
  const isWide = useMediaQuery('(min-width: 900px)')
  const textId = useId()
  const tagInputId = useId()

  // Sync state if topicId changes
  useEffect(() => {
    setText(rec?.text ?? '')
    setTags(rec?.tags ?? [])
    setTagError(null)
    setSaveIndicator('saved')
  }, [topicId, rec?.text, rec?.tags])

  // Save handler
  const triggerSave = (newText: string, newTags: string[]) => {
    if (newText.length > MAX_NOTE_LENGTH) {
      setSaveIndicator('error')
      return
    }
    dispatch({
      type: 'SET_NOTE',
      topicId,
      text: newText,
      tags: newTags,
      now: Date.now(),
    })
    setSaveIndicator('saved')
  }

  const handleTextChange = (val: string) => {
    setText(val)
    if (val.length <= MAX_NOTE_LENGTH) {
      triggerSave(val, tags)
    }
  }

  const handleAddTag = () => {
    const res = validateTag(tagInput, tags)
    if (!res.valid) {
      if (res.error) setTagError(res.error)
      return
    }
    if (res.tag) {
      const updatedTags = [...tags, res.tag]
      setTags(updatedTags)
      setTagInput('')
      setTagError(null)
      triggerSave(text, updatedTags)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove)
    setTags(updatedTags)
    setTagError(null)
    triggerSave(text, updatedTags)
  }

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const isOverLimit = text.length > MAX_NOTE_LENGTH
  const activeMode = compact ? viewMode : isWide ? 'split' : viewMode

  let statusText = ''
  if (isOverLimit) {
    statusText = 'Warning: Exceeds 20,000 char limit!'
  } else if (saveStatus.kind === 'error') {
    statusText = 'Not saved: this browser’s storage is unavailable.'
  } else if (rec && saveStatus.kind === 'saved' && saveStatus.at >= rec.updatedAt) {
    statusText = `Saved in this browser · ${formatDateTime(rec.updatedAt)}`
  } else if (saveIndicator === 'saving' || (rec && saveStatus.kind === 'idle')) {
    statusText = 'Saving…'
  }

  return (
    <div className={`note-editor ${compact ? 'note-editor--compact' : ''}`}>
      <div className="note-editor__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          {title && <h3 style={{ margin: 0, fontSize: compact ? '0.95rem' : '1.1rem' }}>Notes for {title}</h3>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--muted, #8b949e)', marginTop: '2px' }}>
            {statusText && (
              <>
                <span
                  role="status"
                  aria-live="polite"
                  style={{
                    color: isOverLimit ? 'var(--fail, #f87171)' : statusText.startsWith('Saving') ? 'var(--accent, #9a8bff)' : 'inherit',
                  }}
                >
                  {statusText}
                </span>
                <span>•</span>
              </>
            )}
            <span style={{ color: isOverLimit ? 'var(--fail, #f87171)' : 'inherit' }}>
              {text.length.toLocaleString()} / {MAX_NOTE_LENGTH.toLocaleString()}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(!isWide || compact) && (
            <div className="segmented-tabs" role="tablist" aria-label="Note editor view" style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'edit'}
                className={`btn btn--ghost btn--sm ${activeMode === 'edit' ? 'is-active' : ''}`}
                style={{ padding: '3px 8px', fontSize: '12px' }}
                onClick={() => setViewMode('edit')}
              >
                Edit
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'preview'}
                className={`btn btn--ghost btn--sm ${activeMode === 'preview' ? 'is-active' : ''}`}
                style={{ padding: '3px 8px', fontSize: '12px' }}
                onClick={() => setViewMode('preview')}
              >
                Preview
              </button>
            </div>
          )}
          {onClose && (
            <button type="button" className="icon-btn" aria-label="Close note editor" onClick={onClose}>
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </div>

      {isOverLimit && (
        <div
          role="alert"
          className="callout callout--danger"
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--fail, #ef4444)',
            color: 'var(--fail, #f87171)',
            marginBottom: '10px',
            fontSize: '12px',
          }}
        >
          <strong>Notes cannot exceed 20,000 characters.</strong> Excess characters cannot be saved.
        </div>
      )}

      {/* Editor & Preview Pane */}
      <div
        className="note-editor__body"
        style={{
          display: activeMode === 'split' ? 'grid' : 'block',
          gridTemplateColumns: activeMode === 'split' ? '1fr 1fr' : undefined,
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        {(activeMode === 'edit' || activeMode === 'split') && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={textId} className={compact ? 'sr-only' : 'field-label'}>
              {title ? `Your notes for “${title}”` : 'Your notes'}
            </label>
            <textarea
              id={textId}
              className="textarea"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Write what you want to remember (Markdown supported: # headings, **bold**, *italic*, `code`, lists, links)..."
              rows={compact ? 5 : 8}
              style={{
                width: '100%',
                fontFamily: 'inherit',
                fontSize: '13px',
                lineHeight: 1.5,
                borderColor: isOverLimit ? 'var(--fail, #ef4444)' : undefined,
              }}
            />
          </div>
        )}

        {(activeMode === 'preview' || activeMode === 'split') && (
          <div
            className="note-editor__preview card"
            style={{
              padding: '12px',
              minHeight: compact ? '110px' : '160px',
              maxHeight: compact ? '240px' : '360px',
              overflowY: 'auto',
              background: 'var(--surface, #1e1e2e)',
              border: '1px solid var(--border, rgba(255,255,255,0.1))',
              borderRadius: 'var(--r-md, 8px)',
              fontSize: '13px',
              lineHeight: 1.6,
            }}
          >
            {activeMode === 'split' && (
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted, #8b949e)', marginBottom: '8px', borderBottom: '1px solid var(--border, rgba(255,255,255,0.06))', paddingBottom: '4px' }}>
                Preview
              </div>
            )}
            {text.trim() ? (
              <div className="note-rendered-content">{renderMarkdown(text)}</div>
            ) : (
              <p className="muted small" style={{ fontStyle: 'italic', margin: 0 }}>
                No notes written yet. Switch to Edit mode to write in Markdown.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tags section */}
      <div className="note-editor__tags" style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
          <span className="small muted" style={{ fontWeight: 600, fontSize: '12px' }}>
            Tags ({tags.length}/{MAX_TAGS}):
          </span>
          {tags.map((t) => (
            <span
              key={t}
              className="status-chip"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(154, 139, 255, 0.15)',
                color: 'var(--accent, #9a8bff)',
                border: '1px solid rgba(154, 139, 255, 0.3)',
              }}
            >
              #{t}
              <button
                type="button"
                onClick={() => handleRemoveTag(t)}
                aria-label={`Remove tag ${t}`}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginLeft: '2px',
                }}
              >
                <Icon name="close" size={12} />
              </button>
            </span>
          ))}
        </div>

        {tags.length < MAX_TAGS && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '320px' }}>
            <label htmlFor={tagInputId} className="sr-only">
              Add a tag
            </label>
            <input
              id={tagInputId}
              type="text"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value)
                setTagError(null)
              }}
              onKeyDown={handleKeyDownTag}
              placeholder="Add tag (e.g. css-grid)"
              className="input input--sm"
              style={{ fontSize: '12px', padding: '4px 8px', flex: 1 }}
            />
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              Add
            </button>
          </div>
        )}

        {tagError && (
          <p role="alert" className="small" style={{ color: 'var(--fail, #f87171)', margin: '4px 0 0', fontSize: '11px' }}>
            {tagError}
          </p>
        )}
      </div>
    </div>
  )
}
