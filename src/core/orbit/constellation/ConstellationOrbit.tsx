import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Topic, TopicGroup, NodeState, NodeView, ConstellationTrackMeta } from './types'
import { computeConstellationLayout } from './layout'
import { deriveNodeState, computeConstellationCounts } from './state'
import { ConstellationMap } from './ConstellationMap'
import { TopicListView } from './TopicListView'
import { TopicDetailsPanel } from './TopicDetailsPanel'
import { ProgressCard } from './ProgressCard'
import { useApp } from '../../../state/AppState'
import { nextAction, topicProgress, type TopicProgress } from '../../../lib/progress'
import { lessonPath, quizPath, practicePath } from '../../../lib/routes'
import { challengesForTopic } from '../../../data/challenges'
import { Icon } from '../../../components/Icon'
import { usePulse } from './usePulse'
import './constellation.css'

export interface ConstellationOrbitProps {
  technologyId: string
  technologyName: string
  technologyGlyph: string
  technologyDescription: string
  topics: Topic[]
  groups: TopicGroup[]
  meta?: ConstellationTrackMeta
  injectedProgress?: Record<string, TopicProgress>
}

const ORBIT_VIEW_STORAGE_KEY = 'codeorbit:ui:orbit-view'

export function ConstellationOrbit({
  technologyId,
  technologyName,
  technologyGlyph,
  technologyDescription,
  topics,
  groups,
  meta,
  injectedProgress,
}: ConstellationOrbitProps) {
  const { state, dispatch } = useApp()
  const selectedTopicId = state.selectedTopicId

  // View mode preference (Map vs List)
  const [viewMode, setViewMode] = useState<'map' | 'list'>(() => {
    try {
      const stored = localStorage.getItem(ORBIT_VIEW_STORAGE_KEY)
      if (stored === 'list' || stored === 'map') return stored
    } catch {
      // ignore
    }
    // Default to list if n > 14 on narrow screen (P-12)
    if (typeof window !== 'undefined' && window.innerWidth < 480 && topics.length > 14) {
      return 'list'
    }
    return 'map'
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  // Determine aspect bucket (landscape for desktop and mobile map container; portrait for tablet portrait)
  const [aspect, setAspect] = useState<'landscape' | 'portrait'>('landscape')
  useEffect(() => {
    const updateAspect = () => {
      const isMobile = window.innerWidth < 640
      const isTabletPortrait = window.innerWidth >= 640 && window.innerHeight / window.innerWidth > 1.15
      setAspect(isTabletPortrait && !isMobile ? 'portrait' : 'landscape')
    }
    updateAspect()
    window.addEventListener('resize', updateAspect)
    return () => window.removeEventListener('resize', updateAspect)
  }, [])

  // Compute deterministic layout
  const layout = useMemo(
    () => computeConstellationLayout(topics, aspect, meta),
    [topics, aspect, meta]
  )

  // Compute real TopicProgress per topic (or use injectedProgress in fixture mode)
  const topicProgressMap = useMemo(() => {
    if (injectedProgress) return injectedProgress
    const map: Record<string, TopicProgress> = {}
    for (const t of topics) {
      map[t.id] = topicProgress(state, t)
    }
    return map
  }, [topics, state, injectedProgress])

  // Catalog 2.1: Star Pulse on genuine progress save
  const pulsingTopicIds = usePulse(topicProgressMap)

  // Compute completed topic IDs set
  const completedTopicIds = useMemo(() => {
    const set = new Set<string>()
    for (const t of topics) {
      const p = topicProgressMap[t.id]
      if (p && (p.status === 'completed' || p.status === 'mastered')) {
        set.add(t.id)
      }
    }
    return set
  }, [topics, topicProgressMap])

  // Derive node views & states
  const { nodeViews, nodeStates } = useMemo(() => {
    const views = new Map<string, NodeView>()
    const states: Record<string, NodeState> = {}

    for (const t of topics) {
      const prog = topicProgressMap[t.id]
      const { state: nState, missingPrerequisiteIds } = deriveNodeState(
        t,
        prog,
        completedTopicIds
      )
      states[t.id] = nState
      views.set(t.id, {
        topicId: t.id,
        state: nState,
        status: prog?.status ?? 'not-started',
        parts: prog?.parts ?? (nState === 'completed' ? 3 : 0),
        partsTotal: prog?.partsTotal ?? 3,
        missingPrerequisiteIds,
        selected: t.id === selectedTopicId,
      })
    }

    return { nodeViews: views, nodeStates: states }
  }, [topics, topicProgressMap, completedTopicIds, selectedTopicId])

  // Compute counts
  const counts = useMemo(
    () => computeConstellationCounts(topics, topicProgressMap),
    [topics, topicProgressMap]
  )

  // Handle topic selection
  const handleSelectTopic = (topicId: string) => {
    dispatch({ type: 'SELECT_TOPIC', topicId })
  }

  // Handle Hub selection (clear topic selection to show track overview)
  const handleSelectHub = () => {
    // Setting selected topic to null / empty to show track overview
    dispatch({ type: 'SELECT_TOPIC', topicId: '' })
  }

  // Esc key exits expanded view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  // Update localStorage view preference
  const toggleViewMode = (mode: 'map' | 'list') => {
    setViewMode(mode)
    try {
      localStorage.setItem(ORBIT_VIEW_STORAGE_KEY, mode)
    } catch {
      // ignore
    }
  }

  // Live region announcement on selection change
  useEffect(() => {
    if (!selectedTopicId) {
      setAnnouncement(`Selected: ${technologyName} track overview`)
      return
    }
    const topic = topics.find((t) => t.id === selectedTopicId)
    if (!topic) return

    const st = nodeStates[topic.id] ?? 'available'
    setAnnouncement(`Selected: ${topic.title}, ${st}`)
  }, [selectedTopicId, topics, nodeStates, technologyName])

  // Selected topic object & details
  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || null
  const selectedIndex = selectedTopic ? topics.indexOf(selectedTopic) : -1

  const prereqTopics = useMemo(() => {
    if (!selectedTopic?.prerequisiteIds) return []
    return selectedTopic.prerequisiteIds
      .map((id) => topics.find((t) => t.id === id))
      .filter(Boolean) as Topic[]
  }, [selectedTopic, topics])

  const dependentTopics = useMemo(() => {
    if (!selectedTopic) return []
    return topics.filter((t) => t.prerequisiteIds?.includes(selectedTopic.id))
  }, [selectedTopic, topics])

  const nextActionItem = useMemo(() => {
    return nextAction(state, technologyId)
  }, [state, technologyId])

  return (
    <div className={`constellation-root ${isExpanded ? 'constellation-root--expanded' : ''}`}>
      {/* Polite live region for screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      {/* Track Header */}
      <header className="constellation-header">
        <div className="constellation-header__left">
          <div className="constellation-header__title">
            <h2>{technologyName}</h2>
            <span className="small muted">
              {topics.length} topics · Constellation Map
            </span>
          </div>
        </div>

        <div className="constellation-header__right">
          {/* Map / List toggle */}
          <div className="segmented-control" role="group" aria-label="View mode">
            <button
              type="button"
              className={`btn btn--sm ${viewMode === 'map' ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => toggleViewMode('map')}
              aria-pressed={viewMode === 'map'}
            >
              <Icon name="orbit" size={14} />
              <span style={{ marginLeft: '4px' }}>Map</span>
            </button>
            <button
              type="button"
              className={`btn btn--sm ${viewMode === 'list' ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => toggleViewMode('list')}
              aria-pressed={viewMode === 'list'}
            >
              <Icon name="menu" size={14} />
              <span style={{ marginLeft: '4px' }}>List</span>
            </button>
          </div>

          {/* Expand toggle */}
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Exit expanded view' : 'Expand constellation view'}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <Icon name={isExpanded ? 'minimize' : 'maximize'} size={16} />
          </button>
        </div>
      </header>

      {/* Main interactive area */}
      <div className="constellation-body">
        {viewMode === 'map' ? (
          <ConstellationMap
            layout={layout}
            topics={topics}
            groups={groups}
            trackTitle={technologyName}
            trackGlyph={technologyGlyph}
            selectedTopicId={selectedTopicId}
            lastVisitedTopicId={state.lastVisited?.topicId}
            pulsingTopicIds={pulsingTopicIds}
            nodeViews={nodeViews}
            nodeStates={nodeStates}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            onSelectTopic={handleSelectTopic}
            onSelectHub={handleSelectHub}
            onRelationsChange={(msg) => setAnnouncement(msg)}
          />
        ) : (
          <TopicListView
            topics={topics}
            groups={groups}
            selectedTopicId={selectedTopicId}
            nodeStates={nodeStates}
            progressMap={topicProgressMap}
            onSelectTopic={handleSelectTopic}
          />
        )}

        {/* Details & Progress panel: side-by-side in normal mode, floating drawer in expanded mode (Issue 8) */}
        {!isExpanded ? (
          <div className="constellation-side-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TopicDetailsPanel
              topic={selectedTopic}
              index={selectedIndex >= 0 ? selectedIndex : 0}
              totalTopics={topics.length}
              nodeState={selectedTopic ? nodeStates[selectedTopic.id] : undefined}
              progress={selectedTopic ? topicProgressMap[selectedTopic.id] : undefined}
              prerequisiteTopics={prereqTopics}
              dependentTopics={dependentTopics}
              trackTitle={technologyName}
              trackGlyph={technologyGlyph}
              trackDescription={technologyDescription}
              nextActionPath={nextActionItem?.topicId ? lessonPath(nextActionItem.topicId) : undefined}
              onSelectTopic={handleSelectTopic}
            />

            <ProgressCard counts={counts} />
          </div>
        ) : (
          selectedTopic && (
            <aside
              className="constellation-expanded-card"
              aria-label={`Details for ${selectedTopic.title}`}
            >
              <div className="constellation-expanded-card__header">
                <div>
                  <span className="constellation-expanded-card__badge">
                    Topic {selectedIndex + 1} of {topics.length}
                  </span>
                  <h4 className="constellation-expanded-card__title">{selectedTopic.title}</h4>
                </div>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setIsExpanded(false)}
                  aria-label="Exit expanded view"
                  title="Collapse view (Esc)"
                >
                  <Icon name="minimize" size={14} />
                </button>
              </div>

              <p className="constellation-expanded-card__desc">
                {selectedTopic.description}
              </p>

              <div className="constellation-expanded-card__actions">
                <Link
                  to={lessonPath(selectedTopic.id)}
                  className="btn btn--primary btn--sm"
                >
                  <Icon name="book" size={14} />
                  <span>Lesson</span>
                </Link>
                <Link
                  to={quizPath(selectedTopic.id)}
                  className="btn btn--ghost btn--sm"
                >
                  <Icon name="help" size={14} />
                  <span>Quiz</span>
                </Link>
                {(() => {
                  const challenge = challengesForTopic(selectedTopic.id)[0]
                  const pPath = challenge ? practicePath(challenge.id) : lessonPath(selectedTopic.id)
                  return (
                    <Link
                      to={pPath}
                      className="btn btn--ghost btn--sm"
                    >
                      <Icon name="code" size={14} />
                      <span>Practice</span>
                    </Link>
                  )
                })()}
              </div>
            </aside>
          )
        )}
      </div>
    </div>
  )
}
