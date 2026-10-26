import React, { useRef, useState } from 'react'
import type { Topic, ConstellationLayout, NodeState, NodeView } from './types'
import { usePanZoom } from './usePanZoom'
import { nextNodeInDirection } from './viewport'
import { Star } from './Star'
import { Hub } from './Hub'
import { Edges } from './Edges'
import { TopicStepper } from './TopicStepper'
import { Starfield } from '../../atmosphere'
import { Icon } from '../../../components/Icon'

export interface ConstellationMapProps {
  layout: ConstellationLayout
  topics: Topic[]
  trackTitle: string
  trackGlyph: string
  selectedTopicId?: string | null
  nodeViews: Map<string, NodeView>
  nodeStates: Record<string, NodeState>
  isExpanded: boolean
  onToggleExpand: () => void
  onSelectTopic: (topicId: string) => void
  onSelectHub: () => void
}

export function ConstellationMap({
  layout,
  topics,
  trackTitle,
  trackGlyph,
  selectedTopicId,
  nodeViews,
  nodeStates,
  isExpanded,
  onToggleExpand,
  onSelectTopic,
  onSelectHub,
}: ConstellationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [activeFocusedId, setActiveFocusedId] = useState<string | null>(
    selectedTopicId || (topics[0]?.id ?? null)
  )

  const { transform, zoomIn, zoomOut, resetToFit } = usePanZoom({
    layout,
    containerRef,
    contentRef,
  })

  const selectedIndex = topics.findIndex((t) => t.id === selectedTopicId)

  const handleStarKeyDown = (e: React.KeyboardEvent, currentId: string) => {
    let nextId: string | null = null

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const dir =
        e.key === 'ArrowRight' ? 'right' : e.key === 'ArrowLeft' ? 'left' : e.key === 'ArrowUp' ? 'up' : 'down'
      nextId = nextNodeInDirection(layout, currentId, dir)
      if (nextId) {
        e.preventDefault()
        setActiveFocusedId(nextId)
        const btn = containerRef.current?.querySelector<HTMLButtonElement>(`button[aria-label*="${nextId}"]`)
        btn?.focus()
      }
    } else if (e.key === 'PageDown') {
      e.preventDefault()
      const currIdx = topics.findIndex((t) => t.id === currentId)
      if (currIdx < topics.length - 1) {
        nextId = topics[currIdx + 1].id
      }
    } else if (e.key === 'PageUp') {
      e.preventDefault()
      const currIdx = topics.findIndex((t) => t.id === currentId)
      if (currIdx > 0) {
        nextId = topics[currIdx - 1].id
      }
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextId = topics[0]?.id ?? null
    } else if (e.key === 'End') {
      e.preventDefault()
      nextId = topics[topics.length - 1]?.id ?? null
    }

    if (nextId) {
      setActiveFocusedId(nextId)
      const btn = containerRef.current?.querySelector<HTMLButtonElement>(`button[aria-label*="${nextId}"]`)
      btn?.focus()
    }
  }

  return (
    <div
      ref={containerRef}
      className="constellation-map-wrapper"
      role="group"
      aria-label={`Learning Orbit map for ${trackTitle}, ${topics.length} topics`}
      tabIndex={-1}
    >
      {/* Decorative starfield backdrop */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} aria-hidden="true">
        <Starfield density="normal" seed="constellation" />
      </div>

      {/* Pannable & zoomable transformed field */}
      <div
        ref={contentRef}
        className="constellation-map-content"
        style={{
          width: `${layout.width}px`,
          height: `${layout.height}px`,
        }}
      >
        {/* SVG connection lines & rings */}
        <Edges layout={layout} activeTopicId={selectedTopicId} />

        {/* Central Hub button */}
        <Hub
          x={layout.hub.x}
          y={layout.hub.y}
          r={layout.hub.r}
          trackName={trackTitle}
          trackGlyph={trackGlyph}
          selected={!selectedTopicId}
          onClick={onSelectHub}
        />

        {/* Stars */}
        {layout.nodes.map((node) => {
          const topic = topics.find((t) => t.id === node.topicId)
          const view = nodeViews.get(node.topicId) || {
            topicId: node.topicId,
            state: 'available',
            status: 'not-started',
            parts: 0,
            partsTotal: 3,
            missingPrerequisiteIds: [],
            selected: node.topicId === selectedTopicId,
          }

          const isRovingActive =
            node.topicId === activeFocusedId ||
            (!activeFocusedId && node.topicId === selectedTopicId) ||
            (!activeFocusedId && !selectedTopicId && node.index === 0)

          return (
            <Star
              key={node.topicId}
              node={node}
              view={view}
              topicTitle={topic?.title}
              isMastered={view.status === 'mastered'}
              zoom={transform.zoom}
              isRovingActive={isRovingActive}
              onSelect={onSelectTopic}
              onFocus={() => setActiveFocusedId(node.topicId)}
              onKeyDown={(e) => handleStarKeyDown(e, node.topicId)}
            />
          )
        })}
      </div>

      {/* Stepper centered at the bottom of the map */}
      <div className="constellation-stepper-wrap">
        <TopicStepper
          topics={topics}
          selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
          nodeStates={nodeStates}
          onSelectIndex={(idx) => {
            if (topics[idx]) {
              onSelectTopic(topics[idx].id)
              setActiveFocusedId(topics[idx].id)
            }
          }}
        />
      </div>

      {/* Map control toolbar: Zoom in, Zoom out, Fit, Expand */}
      <div className="constellation-toolbar" role="toolbar" aria-label="Map controls">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={zoomIn}
          aria-label="Zoom in (+)"
          title="Zoom in"
        >
          <Icon name="plus" size={16} />
        </button>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={zoomOut}
          aria-label="Zoom out (-)"
          title="Zoom out"
        >
          <Icon name="minus" size={16} />
        </button>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={resetToFit}
          aria-label="Fit to screen (0)"
          title="Fit view"
        >
          <Icon name="rotate-ccw" size={16} />
        </button>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Exit expanded view' : 'Expand map view'}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <Icon name={isExpanded ? 'minimize' : 'maximize'} size={16} />
        </button>
      </div>
    </div>
  )
}
