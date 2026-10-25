import { getTrack, registerTrack } from '../core/content/registry'
import type { TrackModule } from '../core/content/types'
import { technologies } from '../data/curriculum'
import { htmlTrack } from '../tracks/html/track'

export function registerTracks(): void {
  // Register HTML track if not already registered
  if (!getTrack(htmlTrack.id)) {
    registerTrack(htmlTrack)
  }

  // Register planned tracks from existing curriculum definitions
  const trackTints: Record<string, string> = {
    css: '#f59e0b', // amber
    javascript: '#14b8a6', // teal
    bootstrap: '#8b5cf6',
    angular: '#ef4444',
  }

  for (const tech of technologies) {
    if (tech.status === 'planned' && !getTrack(tech.id)) {
      const plannedTrack: TrackModule = {
        id: tech.id,
        name: tech.name,
        glyph: tech.glyph,
        description: tech.description,
        availability: 'planned',
        tint: trackTints[tech.id] || '#9a8bff',
        language: {
          id: tech.id,
          displayName: tech.name,
          fileExtension: `.${tech.id}`,
          editorLanguageId: tech.id,
        },
        capabilities: [],
        groups: [],
        topics: [],
        lessons: {},
        quizzes: {},
        challenges: [],
      }
      registerTrack(plannedTrack)
    }
  }
}

// Auto-register on import
registerTracks()
