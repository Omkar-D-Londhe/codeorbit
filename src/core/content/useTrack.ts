import { useParams } from 'react-router-dom'
import { getTrack, getTracks, defaultTrackId } from './registry'
import type { TrackModule } from './types'
import { useApp } from '../../state/AppState'

/**
 * Resolves the active track:
 * 1. explicitTrackId argument (if provided and valid)
 * 2. Route param (:technologyId or :trackId, if present and valid)
 * 3. Track containing state.selectedTopicId
 * 4. defaultTrackId() (first 'available' track)
 */
export function useTrack(explicitTrackId?: string): TrackModule | undefined {
  const params = useParams<{ technologyId?: string; trackId?: string }>()
  const app = useApp()

  if (explicitTrackId) {
    const track = getTrack(explicitTrackId)
    if (track) return track
  }

  const paramId = params.technologyId || params.trackId
  if (paramId) {
    const track = getTrack(paramId)
    if (track) return track
  }

  const selectedTopicId = app.state.selectedTopicId
  if (selectedTopicId) {
    const track = getTracks().find((t) => t.topics.some((tp) => tp.id === selectedTopicId))
    if (track) return track
  }

  const defId = defaultTrackId()
  return defId ? getTrack(defId) : undefined
}
