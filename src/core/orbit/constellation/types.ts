import type { Topic, TopicGroup } from '../../../data/types'
import type { TopicProgress, TopicStatus } from '../../../lib/progress'

export type NodeState = 'completed' | 'in-progress' | 'available' | 'locked'

export type IconId = string

/** Optional authored presentation hints. Absent hints fall back to the deterministic layout and the topic number. */
export interface ConstellationTopicMeta {
  topicId: string
  icon?: IconId
  x?: number
  y?: number
}

export interface ConstellationTrackMeta {
  trackId: string
  hubIcon?: IconId
  topics?: ConstellationTopicMeta[]
}

export interface LayoutNode {
  topicId: string
  index: number
  x: number
  y: number
  angle: number
  labelSide: 'left' | 'right' | 'top' | 'bottom'
  groupId: string
}

export interface LayoutEdge {
  fromId: string
  toId: string
  d: string
  kind: 'prerequisite'
}

export interface OrderLink {
  fromId: string
  toId: string
  d: string
}

export interface ConstellationLayout {
  aspect: 'landscape' | 'portrait'
  width: number
  height: number
  hub: { x: number; y: number; r: number }
  nodes: LayoutNode[]
  edges: LayoutEdge[]
  order: OrderLink[]
  rings: Array<{ id: string; rx: number; ry: number }>
}

export interface NodeView {
  topicId: string
  state: NodeState
  status: TopicStatus
  parts: number
  partsTotal: number
  missingPrerequisiteIds: string[]
  selected: boolean
}

export interface ViewTransform {
  x: number
  y: number
  zoom: number // relative to fit (1 = fit, range 0.75 to 3.0)
}

export interface ValidationIssue {
  kind: 'missing-topic' | 'unknown-prereq' | 'cycle' | 'capacity-exceeded' | 'duplicate-id' | 'invalid-coord' | 'incomplete-authored-coords'
  message: string
  topicId?: string
}

export type { Topic, TopicGroup, TopicProgress, TopicStatus }
