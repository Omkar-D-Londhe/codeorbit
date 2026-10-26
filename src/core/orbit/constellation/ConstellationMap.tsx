import React, { useEffect, useRef, useState } from 'react'
import type { Topic, TopicGroup, ConstellationLayout, NodeState, NodeView, LayoutNode } from './types'
import { usePanZoom } from './usePanZoom'
import { nextNodeInDirection } from './viewport'
import { Star } from './Star'
import { Hub } from './Hub'
import { Edges } from './Edges'
import { TopicStepper } from './TopicStepper'
import { Starfield } from '../../atmosphere'
import { Icon } from '../../../components/Icon'
import { getTopicRelations } from './relationsLive'

export interface ConstellationMapProps {
  layout: ConstellationLayout
  topics: Topic[]
  groups?: TopicGroup[]
  trackTitle: string
  trackGlyph: string
  selectedTopicId?: string | null
  lastVisitedTopicId?: string | null
  pulsingTopicIds?: Set<string>
  nodeViews: Map<string, NodeView>
  nodeStates: Record<string, NodeState>
  isExpanded: boolean
  onToggleExpand: () => void
  onSelectTopic: (topicId: string) => void
  onSelectHub: () => void
  onRelationsChange?: (announcement: string) => void
}

export function ConstellationMap({
  layout,
  topics,
  groups,
  trackTitle,
  trackGlyph,
  selectedTopicId,
  lastVisitedTopicId,
  pulsingTopicIds,
  nodeViews,
  nodeStates,
  isExpanded,
  onToggleExpand,
  onSelectTopic,
  onSelectHub,
  onRelationsChange,
}: ConstellationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [activeFocusedId, setActiveFocusedId] = useState<string | null>(
    selectedTopicId || (topics[0]?.id ?? null)
  )

  const [hoveredTopicId, setHoveredTopicId] = useState<string | null>(null)

  // Catalog 2.2: Track fromNode and toNode for Orbital Trail on non-adjacent selection
  const prevSelectedIdRef = useRef<string | null>(selectedTopicId ?? null)
  const [fromNode, setFromNode] = useState<LayoutNode | null>(null)
  const [toNode, setToNode] = useState<LayoutNode | null>(null)

  useEffect(() => {
    if (selectedTopicId && prevSelectedIdRef.current && selectedTopicId !== prevSelectedIdRef.current) {
      const fNode = layout.nodes.find((n) => n.topicId === prevSelectedIdRef.current) || null
      const tNode = layout.nodes.find((n) => n.topicId === selectedTopicId) || null
      setFromNode(fNode)
      setToNode(tNode)
    }
    prevSelectedIdRef.current = selectedTopicId ?? null
  }, [selectedTopicId, layout.nodes])

  // Catalog 2.3: Hover/focus relations live text announcement
  useEffect(() => {
    if (hoveredTopicId) {
      const rel = getTopicRelations(hoveredTopicId, topics)
      onRelationsChange?.(rel.liveAnnouncement)
    }
  }, [hoveredTopicId, topics, onRelationsChange])

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

  // Determine which topic's connections to brighten (hover takes priority over selection)
  const activeEdgeTopicId = hoveredTopicId || selectedTopicId

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
        {/* SVG connection lines, group halos (2.4), active emphasis (2.3), and orbital trail (2.2) */}
        <Edges
          layout={layout}
          activeTopicId={activeEdgeTopicId}
          groups={groups}
          fromNode={fromNode}
          toNode={toNode}
          onSelectTopic={onSelectTopic}
        />

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

          const isPulsing = pulsingTopicIds ? pulsingTopicIds.has(node.topicId) : false
          const isLastVisited = lastVisitedTopicId === node.topicId

          return (
            <Star
              key={node.topicId}
              node={node}
              view={view}
              topicTitle={topic?.title}
              isMastered={view.status === 'mastered'}
              isPulsing={isPulsing}
              isLastVisited={isLastVisited}
              zoom={transform.zoom}
              isRovingActive={isRovingActive}
              onSelect={onSelectTopic}
              onHover={(hovered) => setHoveredTopicId(hovered ? node.topicId : null)}
              onFocus={() => {
                setActiveFocusedId(node.topicId)
                setHoveredTopicId(node.topicId)
              }}
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
