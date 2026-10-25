/**
 * Language-neutral TrackRegistry.
 * Pure TypeScript module with no React dependencies.
 */

import type { TrackModule } from './types'

const trackRegistry = new Map<string, TrackModule>()

/**
 * Registers a new track.
 * Throws an Error if a track with the same ID is already registered.
 */
export function registerTrack(track: TrackModule): void {
  if (trackRegistry.has(track.id)) {
    throw new Error(`Track with id '${track.id}' is already registered.`)
  }
  trackRegistry.set(track.id, track)
}

/**
 * Returns a registered track by ID, or undefined if not found.
 */
export function getTrack(id: string): TrackModule | undefined {
  return trackRegistry.get(id)
}

/**
 * Returns all registered tracks in registration order.
 */
export function getTracks(): readonly TrackModule[] {
  return Array.from(trackRegistry.values())
}

/**
 * Returns all tracks whose availability is 'available', in registration order.
 */
export function getAvailableTracks(): readonly TrackModule[] {
  return Array.from(trackRegistry.values()).filter((t) => t.availability === 'available')
}

/**
 * Returns the default track ID (the ID of the first 'available' track),
 * or undefined if no tracks are available.
 */
export function defaultTrackId(): string | undefined {
  return getAvailableTracks()[0]?.id
}

/**
 * Unregisters a track by ID. Primarily used in tests to test empty or modified states.
 */
export function unregisterTrack(id: string): boolean {
  return trackRegistry.delete(id)
}

/**
 * Clears all registered tracks. Primarily used in test setups/teardowns.
 */
export function clearTracks(): void {
  trackRegistry.clear()
}
