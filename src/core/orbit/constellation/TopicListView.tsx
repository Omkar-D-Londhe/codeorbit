import { Link } from 'react-router-dom'
import type { Topic, TopicGroup, NodeState } from './types'
import type { TopicProgress } from '../../../lib/progress'
import { lessonPath } from '../../../lib/routes'
import { Icon } from '../../../components/Icon'

export interface TopicListViewProps {
  topics: Topic[]
  groups: TopicGroup[]
  selectedTopicId?: string | null
  nodeStates: Record<string, NodeState>
  progressMap: Record<string, TopicProgress | undefined>
  onSelectTopic: (topicId: string) => void
}

export function TopicListView({
  topics,
  groups,
  selectedTopicId,
  nodeStates,
  progressMap,
  onSelectTopic,
}: TopicListViewProps) {
  // Group topics by groupId
  const groupMap = new Map<string, Topic[]>()
  for (const group of groups) {
    groupMap.set(group.id, [])
  }
  for (const topic of topics) {
    const list = groupMap.get(topic.groupId)
    if (list) {
      list.push(topic)
    } else {
      groupMap.set(topic.groupId, [topic])
    }
  }

  const topicMap = new Map(topics.map((t) => [t.id, t]))

  return (
    <div className="constellation-list-view" aria-label="Curriculum topics list view">
      {groups.map((group) => {
        const groupTopics = groupMap.get(group.id) || []
        if (groupTopics.length === 0) return null

        return (
          <section key={group.id} className="constellation-list-group">
            <h3 className="constellation-list-group__heading">{group.title}</h3>

            <ol
              aria-label={`${group.title} topics`}
              style={{ listStyle: 'none', padding: 0, margin: 0 }}
            >
              {groupTopics.map((t) => {
                const isSelected = t.id === selectedTopicId
                const state = nodeStates[t.id] ?? 'available'
                const prog = progressMap[t.id]
                const parts = prog?.parts ?? (state === 'completed' ? 3 : 0)
                const partsTotal = prog?.partsTotal ?? 3
                const displayNum = String(topics.indexOf(t) + 1).padStart(2, '0')

                let stateText = 'Ready'
                let stateIcon: 'check' | 'play' | 'star' | 'lock' = 'play'
                if (state === 'completed') {
                  stateText = prog?.status === 'mastered' ? 'Mastered' : 'Completed'
                  stateIcon = prog?.status === 'mastered' ? 'star' : 'check'
                } else if (state === 'in-progress') {
                  stateText = `${parts}/${partsTotal}`
                  stateIcon = 'play'
                } else if (state === 'locked') {
                  stateText = 'Locked'
                  stateIcon = 'lock'
                }

                const prereqTitles = (t.prerequisiteIds || [])
                  .map((id) => topicMap.get(id)?.title ?? id)
                  .join(', ')

                return (
                  <li key={t.id}>
                    <div className={`constellation-list-row ${isSelected ? 'is-selected' : ''}`}>
                      <button
                        type="button"
                        className="constellation-list-row__select"
                        onClick={() => onSelectTopic(t.id)}
                        aria-current={isSelected ? 'true' : undefined}
                        aria-label={`Select ${displayNum} ${t.title}. ${stateText}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          cursor: 'pointer',
                          color: 'inherit',
                          font: 'inherit',
                          flex: 1,
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {displayNum}
                        </span>

                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text, #f0eff7)' }}>
                            {t.title}
                          </div>
                          {prereqTitles && (
                            <div className="small muted">
                              Requires: {prereqTitles}
                            </div>
                          )}
                        </div>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          className={`status-pill ${
                            state === 'completed'
                              ? 'status-pill--pass'
                              : state === 'in-progress'
                              ? 'status-pill--neutral'
                              : 'status-pill--fail'
                          }`}
                          style={{ fontSize: '11px' }}
                        >
                          <Icon name={stateIcon} size={12} />
                          <span style={{ marginLeft: '4px' }}>{stateText}</span>
                        </span>

                        <Link
                          to={lessonPath(t.id)}
                          className="btn btn--secondary btn--sm"
                        >
                          View topic
                        </Link>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
