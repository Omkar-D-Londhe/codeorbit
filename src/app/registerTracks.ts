import { getTrack, registerTrack } from '../core/content/registry'
import type { TrackModule } from '../core/content/types'
import { technologies } from '../data/curriculum'
import { htmlTrack } from '../tracks/html/track'
import { cssTrack } from '../tracks/css/track'
import { jsTrack } from '../tracks/javascript/track'
import { bootstrapTrack } from '../tracks/bootstrap/track'
import { pythonTrack } from '../tracks/python/track'
import { javaTrack } from '../tracks/java/track'
import { cppTrack } from '../tracks/cpp/track'
import { angularTrack } from '../tracks/angular/track'
import { analysisRegistry } from '../core/analysis/registry'
import { jsProvider } from '../tracks/javascript/analysis/provider'
import { pyAstProvider } from '../tracks/python/analysis/provider'
import { javaStaticProvider } from '../tracks/java/analysis/provider'
import { cppStaticProvider } from '../tracks/cpp/analysis/provider'

export function registerTracks(): void {
  // Register HTML track if not already registered
  if (!getTrack(htmlTrack.id)) {
    registerTrack(htmlTrack)
  }

  // Register CSS track if not already registered
  if (!getTrack(cssTrack.id)) {
    registerTrack(cssTrack)
  }

  // Register JavaScript track if not already registered
  if (!getTrack(jsTrack.id)) {
    registerTrack(jsTrack)
  }

  // Register Bootstrap track if not already registered (Stage 24)
  if (!getTrack(bootstrapTrack.id)) {
    registerTrack(bootstrapTrack)
  }

  // Register Python track if not already registered (Stage 25a, preview status)
  if (!getTrack(pythonTrack.id)) {
    registerTrack(pythonTrack)
  }

  // Register Java track if not already registered (Stage 26, preview status)
  if (!getTrack(javaTrack.id)) {
    registerTrack(javaTrack)
  }

  // Register C++ track if not already registered (Stage 26, preview status)
  if (!getTrack(cppTrack.id)) {
    registerTrack(cppTrack)
  }

  // Register Angular track if not already registered (Stage 27, decision-gated status, O-05)
  if (!getTrack(angularTrack.id)) {
    registerTrack(angularTrack)
  }

  // Register JavaScript Analysis Provider (Stage 23b, PLT-08)
  if (!analysisRegistry.has('javascript')) {
    analysisRegistry.register(jsProvider)
  }

  // Register Python Analysis Provider (Stage 25b, PLT-09, O-03)
  if (!analysisRegistry.has('python')) {
    analysisRegistry.register(pyAstProvider)
  }

  // Register Java Static Analysis Provider (Stage 26, PLT-10, O-04)
  if (!analysisRegistry.has('java')) {
    analysisRegistry.register(javaStaticProvider)
  }

  // Register C++ Static Analysis Provider (Stage 26, PLT-10, O-04)
  if (!analysisRegistry.has('cpp')) {
    analysisRegistry.register(cppStaticProvider)
  }

  // Register planned tracks from existing curriculum definitions
  const trackTints: Record<string, string> = {
    javascript: '#14b8a6', // teal
    bootstrap: '#8b5cf6',
    python: '#38bdf8',
    java: '#f89820',
    cpp: '#00599c',
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
