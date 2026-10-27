import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Topic, NodeState } from './types'
import type { TopicProgress } from '../../../lib/progress'
import { lessonPath, quizPath, practicePath } from '../../../lib/routes'
import { challengesForTopic } from '../../../data/challenges'
import { Icon } from '../../../components/Icon'
import { LegendCard } from './LegendCard'
import { getRelatedTopics } from '../../content/related'
import { useAppOptional } from '../../../state/AppState'
import { NoteEditor } from '../../notes/NoteEditor'
import { renderMarkdown } from '../../notes/markdown'
import { DEFAULT_BOOKMARK_FOLDER_ID } from '../../../state/types'

export interface TopicDetailsPanelProps {
  topic?: Topic | null
  index?: number
  totalTopics: number
  allTopics?: Topic[]
  nodeState?: NodeState
  progress?: TopicProgress | null
  prerequisiteTopics?: Topic[]
  dependentTopics?: Topic[]
  trackTitle: string
  trackGlyph: string
  trackDescription: string
  nextActionPath?: string
  onSelectTopic?: (topicId: string) => void
}

export function TopicDetailsPanel({
  topic,
  index = 0,
  totalTopics,
  allTopics = [],
  nodeState = 'available',
  progress,
  prerequisiteTopics = [],
  dependentTopics = [],
  trackTitle,
  trackGlyph,
  trackDescription,
  nextActionPath,
  onSelectTopic,
}: TopicDetailsPanelProps) {
  const app = useAppOptional()
  const state = app?.state
  const dispatch = app?.dispatch ?? (() => {})
  const [showNotesEditor, setShowNotesEditor] = useState(false)

  // Hub / Track overview state
  if (!topic) {
    return (
      <aside className="constellation-panel" aria-label="Track overview">
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <span
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--accent, #9a8bff)',
              }}
              aria-hidden="true"
            >
              {trackGlyph}
            </span>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                {trackTitle} Track Overview
              </h2>
              <span className="small muted">{totalTopics} topics</span>
            </div>
          </div>

          <p className="small muted" style={{ marginBottom: '16px', lineHeight: 1.5 }}>
            {trackDescription}
          </p>

          {nextActionPath && (
            <Link
              to={nextActionPath}
              className="btn btn--primary btn--lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Continue track <Icon name="arrow-right" size={16} />
            </Link>
          )}
        </div>

        <LegendCard />
      </aside>
    )
  }

  const challenge = challengesForTopic(topic.id)[0]
  const isLocked = nodeState === 'locked'

  let stateLabel = 'Ready to start'
  let stateIcon: 'check' | 'play' | 'star' | 'lock' = 'play'

  if (nodeState === 'completed') {
    stateLabel = progress?.status === 'mastered' ? 'Mastered' : 'Completed'
    stateIcon = progress?.status === 'mastered' ? 'star' : 'check'
  } else if (nodeState === 'in-progress') {
    stateLabel = `In Progress (${progress?.parts ?? 1} of ${progress?.partsTotal ?? 3})`
    stateIcon = 'play'
  } else if (nodeState === 'locked') {
    stateLabel = 'Locked (Advisory)'
    stateIcon = 'lock'
  }

  const isBookmarked = (state?.bookmarks || []).includes(topic.id)
  const folders = state?.bookmarkFolders || [
    { id: DEFAULT_BOOKMARK_FOLDER_ID, name: 'Unsorted', itemIds: state?.bookmarks || [] },
  ]
  const currentFolder = folders.find((f) => f.itemIds.includes(topic.id))
  const noteRec = state?.notes[topic.id]

  return (
    <aside className="constellation-panel" aria-label="Selected topic details">
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <span className="small muted constellation-panel__badge" style={{ fontWeight: 600 }}>
            Topic {index + 1} of {totalTopics}
          </span>
          <span
            className={`status-pill ${
              nodeState === 'completed'
                ? 'status-pill--pass'
                : nodeState === 'in-progress'
                ? 'status-pill--neutral'
                : 'status-pill--fail'
            }`}
          >
            <Icon name={stateIcon} size={14} />
            <span style={{ marginLeft: '4px' }}>{stateLabel}</span>
          </span>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text, #f0eff7)' }}>
          {topic.title}
        </h2>

        <p className="small muted" style={{ marginBottom: '16px', lineHeight: 1.5 }}>
          {topic.description}
        </p>

        {isLocked && (
          <div
            className="callout callout--warning"
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--r-md, 8px)',
              background: 'rgba(242, 184, 91, 0.1)',
              border: '1px solid var(--warning, #f2b85b)',
              marginBottom: '16px',
              fontSize: '12px',
            }}
          >
            <strong>Recommended first:</strong> Complete the prerequisite topics for this module. You may still explore this topic now.
          </div>
        )}

        {/* Primary View topic button */}
        <Link
          to={lessonPath(topic.id)}
          className="btn btn--primary btn--lg"
          style={{ width: '100%', justifyContent: 'center', marginBottom: '14px' }}
        >
          View topic <Icon name="arrow-right" size={16} />
        </Link>

        {/* Deep-link action row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '18px' }}>
          <Link
            to={lessonPath(topic.id)}
            className="btn btn--ghost btn--sm"
            style={{ flexDirection: 'column', padding: '8px 4px', fontSize: '11px', textAlign: 'center' }}
          >
            <Icon name="book" size={16} />
            <span style={{ marginTop: '4px' }}>Lesson</span>
            <span className="muted" style={{ fontSize: '10px' }}>
              {progress?.lessonDone ? '✓ Done' : 'Read'}
            </span>
          </Link>

          <Link
            to={quizPath(topic.id)}
            className="btn btn--ghost btn--sm"
            style={{ flexDirection: 'column', padding: '8px 4px', fontSize: '11px', textAlign: 'center' }}
          >
            <Icon name="help" size={16} />
            <span style={{ marginTop: '4px' }}>Quick quiz</span>
            <span className="muted" style={{ fontSize: '10px' }}>
              {progress?.quizPassed ? (progress.quizPerfect ? '✓ Perfect' : '✓ Passed') : 'Take'}
            </span>
          </Link>

          {challenge ? (
            <Link
              to={practicePath(challenge.id)}
              className="btn btn--ghost btn--sm"
              style={{ flexDirection: 'column', padding: '8px 4px', fontSize: '11px', textAlign: 'center' }}
            >
              <Icon name="code" size={16} />
              <span style={{ marginTop: '4px' }}>Practice</span>
              <span className="muted" style={{ fontSize: '10px' }}>
                {progress?.practiceDone ? '✓ Passed' : 'Start'}
              </span>
            </Link>
          ) : (
            <span className="btn btn--ghost btn--sm disabled" style={{ opacity: 0.5, fontSize: '11px' }}>
              <Icon name="code" size={16} />
              <span>Practice</span>
            </span>
          )}
        </div>

        {/* Bookmark & Folder Picker */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <button
            type="button"
            className={`btn btn--ghost btn--sm ${isBookmarked ? 'is-active' : ''}`}
            aria-pressed={isBookmarked}
            onClick={() => dispatch({ type: 'TOGGLE_BOOKMARK', topicId: topic.id })}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Icon name="bookmark" size={14} />
            <span style={{ marginLeft: '4px' }}>{isBookmarked ? 'Bookmarked' : 'Bookmark topic'}</span>
          </button>
          {isBookmarked && folders.length > 1 && (
            <select
              value={currentFolder?.id || DEFAULT_BOOKMARK_FOLDER_ID}
              onChange={(e) =>
                dispatch({
                  type: 'MOVE_BOOKMARK_ITEM',
                  itemId: topic.id,
                  targetFolderId: e.target.value,
                })
              }
              className="select select--sm"
              style={{ fontSize: '11px', maxWidth: '140px' }}
              aria-label="Bookmark folder"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Prerequisites and Unlocks lists */}
        {prerequisiteTopics.length > 0 && (
          <div style={{ marginBottom: '12px', fontSize: '12px' }}>
            <span className="muted" style={{ fontWeight: 600 }}>Requires: </span>
            {prerequisiteTopics.map((pt, idx) => (
              <span key={pt.id}>
                {idx > 0 && ', '}
                {onSelectTopic ? (
                  <button
                    type="button"
                    onClick={() => onSelectTopic(pt.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--accent, #9a8bff)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {pt.title}
                  </button>
                ) : (
                  <Link to={lessonPath(pt.id)} style={{ color: 'var(--accent, #9a8bff)' }}>
                    {pt.title}
                  </Link>
                )}
              </span>
            ))}
          </div>
        )}

        {dependentTopics.length > 0 && (
          <div style={{ marginBottom: '14px', fontSize: '12px' }}>
            <span className="muted" style={{ fontWeight: 600 }}>Unlocks: </span>
            {dependentTopics.map((dt, idx) => (
              <span key={dt.id}>
                {idx > 0 && ', '}
                {onSelectTopic ? (
                  <button
                    type="button"
                    onClick={() => onSelectTopic(dt.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--accent, #9a8bff)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {dt.title}
                  </button>
                ) : (
                  <Link to={lessonPath(dt.id)} style={{ color: 'var(--accent, #9a8bff)' }}>
                    {dt.title}
                  </Link>
                )}
              </span>
            ))}
          </div>
        )}

        {/* 9.4 Related Topics */}
        {(() => {
          const related = allTopics.length > 0 ? getRelatedTopics(topic, allTopics, 4) : []
          if (related.length === 0) return null
          return (
            <div
              className="constellation-related-topics"
              style={{
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
              }}
            >
              <span className="muted" style={{ fontWeight: 600, fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                Related topics:
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {related.map(({ topic: rt, reason }) => (
                  <li
                    key={rt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      gap: '8px',
                    }}
                  >
                    {onSelectTopic ? (
                      <button
                        type="button"
                        onClick={() => onSelectTopic(rt.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: 'var(--accent, #9a8bff)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          textDecoration: 'underline',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {rt.title}
                      </button>
                    ) : (
                      <Link
                        to={lessonPath(rt.id)}
                        style={{
                          color: 'var(--accent, #9a8bff)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {rt.title}
                      </Link>
                    )}
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--muted, #8b949e)',
                        flexShrink: 0,
                      }}
                    >
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })()}

        {/* Notes Preview & Editor */}
        <div
          className="constellation-notes"
          style={{
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="muted" style={{ fontWeight: 600, fontSize: '12px' }}>
              Notes {noteRec?.tags?.length ? `(${noteRec.tags.length} tags)` : ''}:
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              style={{ fontSize: '11px', padding: '2px 8px' }}
              onClick={() => setShowNotesEditor(!showNotesEditor)}
            >
              <Icon name="pencil" size={12} />
              <span style={{ marginLeft: '4px' }}>
                {showNotesEditor ? 'Done' : noteRec?.text ? 'Edit note' : '+ Add note'}
              </span>
            </button>
          </div>

          {showNotesEditor ? (
            <NoteEditor topicId={topic.id} title={topic.title} compact onClose={() => setShowNotesEditor(false)} />
          ) : noteRec?.text ? (
            <div
              className="card"
              style={{
                padding: '10px 12px',
                fontSize: '12px',
                lineHeight: 1.5,
                background: 'rgba(0,0,0,0.25)',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            >
              {renderMarkdown(noteRec.text)}
            </div>
          ) : (
            <p className="muted small" style={{ margin: 0, fontStyle: 'italic', fontSize: '11px' }}>
              No notes written yet. Click "+ Add note" to write Markdown notes.
            </p>
          )}
        </div>
      </div>

      <LegendCard />
    </aside>
  )
}
