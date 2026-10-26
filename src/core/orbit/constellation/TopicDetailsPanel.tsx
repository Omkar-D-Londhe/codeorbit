import { Link } from 'react-router-dom'
import type { Topic, NodeState } from './types'
import type { TopicProgress } from '../../../lib/progress'
import { lessonPath, quizPath, practicePath } from '../../../lib/routes'
import { challengesForTopic } from '../../../data/challenges'
import { Icon } from '../../../components/Icon'
import { LegendCard } from './LegendCard'

export interface TopicDetailsPanelProps {
  topic?: Topic | null
  index?: number
  totalTopics: number
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

  return (
    <aside className="constellation-panel" aria-label="Selected topic details">
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <span className="small muted" style={{ fontWeight: 600 }}>
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
      </div>

      <LegendCard />
    </aside>
  )
}
