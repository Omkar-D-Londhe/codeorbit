import type { CodeOrbitState } from '../../state/types'
import type { Action } from '../../state/reducer'
import { resumePath } from '../../lib/routes'

export interface Command {
  id: string
  title: string
  keywords: string[]
  group: 'Navigate' | 'Learn' | 'Practice' | 'Settings' | 'Data' | 'Help'
  shortcut?: string
  enabled(): boolean
  run(): void
}

export interface CommandContext {
  navigate: (path: string) => void
  state: CodeOrbitState
  dispatch: (action: Action) => void
  openShortcuts: () => void
}

export function buildCommands({
  navigate,
  state,
  dispatch,
  openShortcuts,
}: CommandContext): Command[] {
  return [
    // Navigate
    {
      id: 'cmd-nav-home',
      title: 'Go to Home / Dashboard',
      keywords: ['home', 'dashboard', 'start', 'overview'],
      group: 'Navigate',
      shortcut: 'g h',
      enabled: () => true,
      run: () => navigate('/'),
    },
    {
      id: 'cmd-nav-orbit',
      title: 'Go to Learning Orbit',
      keywords: ['orbit', 'constellation', 'map', 'topics', 'learn'],
      group: 'Navigate',
      enabled: () => true,
      run: () => navigate('/learn/html'),
    },
    {
      id: 'cmd-nav-explore',
      title: 'Explore Technologies',
      keywords: ['explore', 'tracks', 'technologies', 'browse'],
      group: 'Navigate',
      enabled: () => true,
      run: () => navigate('/explore'),
    },
    {
      id: 'cmd-nav-progress',
      title: 'My Progress & Achievements',
      keywords: ['progress', 'xp', 'badges', 'level', 'achievements', 'stats'],
      group: 'Navigate',
      enabled: () => true,
      run: () => navigate('/progress'),
    },
    {
      id: 'cmd-nav-review',
      title: 'Error Notebook & Review',
      keywords: ['review', 'errors', 'notebook', 'flashcards'],
      group: 'Navigate',
      enabled: () => true,
      run: () => navigate('/review'),
    },
    {
      id: 'cmd-nav-notes',
      title: 'Go to Study Notes',
      keywords: ['notes', 'study notes', 'journal', 'markdown', 'tags'],
      group: 'Navigate',
      enabled: () => true,
      run: () => navigate('/notes'),
    },
    {
      id: 'cmd-nav-bookmarks',
      title: 'Go to Bookmarks & Folders',
      keywords: ['bookmarks', 'folders', 'saved', 'shortcuts'],
      group: 'Navigate',
      enabled: () => true,
      run: () => navigate('/bookmarks'),
    },
    {
      id: 'cmd-nav-settings',
      title: 'Settings & Appearance',
      keywords: ['settings', 'preferences', 'theme', 'appearance', 'reset'],
      group: 'Navigate',
      enabled: () => true,
      run: () => navigate('/settings'),
    },

    // Learn
    {
      id: 'cmd-learn-resume',
      title: 'Resume last activity',
      keywords: ['resume', 'continue', 'last', 'pick up'],
      group: 'Learn',
      enabled: () => !!state.lastVisited,
      run: () => {
        if (state.lastVisited) {
          navigate(resumePath(state.lastVisited))
        }
      },
    },
    {
      id: 'cmd-learn-daily',
      title: "Today's Daily Challenge",
      keywords: ['daily', 'challenge', 'today', 'daily challenge'],
      group: 'Learn',
      enabled: () => true,
      run: () => navigate('/#daily-challenge'),
    },

    // Practice
    {
      id: 'cmd-practice-lab',
      title: 'Open Practice Lab',
      keywords: ['practice', 'code', 'lab', 'editor', 'sandbox'],
      group: 'Practice',
      enabled: () => true,
      run: () => navigate('/practice/ch-html-structure'),
    },

    // Settings
    {
      id: 'cmd-theme-obsidian',
      title: 'Set Theme: Obsidian (Dark)',
      keywords: ['theme', 'dark', 'obsidian', 'night'],
      group: 'Settings',
      enabled: () => state.settings.theme !== 'obsidian',
      run: () => dispatch({ type: 'SET_SETTINGS', patch: { theme: 'obsidian' } }),
    },
    {
      id: 'cmd-theme-starlight',
      title: 'Set Theme: Starlight (Light)',
      keywords: ['theme', 'light', 'starlight', 'white', 'day'],
      group: 'Settings',
      enabled: () => state.settings.theme !== 'starlight',
      run: () => dispatch({ type: 'SET_SETTINGS', patch: { theme: 'starlight' } }),
    },
    {
      id: 'cmd-theme-aurora',
      title: 'Set Theme: Aurora (Teal Dark)',
      keywords: ['theme', 'aurora', 'teal', 'green'],
      group: 'Settings',
      enabled: () => state.settings.theme !== 'aurora',
      run: () => dispatch({ type: 'SET_SETTINGS', patch: { theme: 'aurora' } }),
    },
    {
      id: 'cmd-toggle-contrast',
      title: `Toggle High Contrast Mode (currently ${state.settings.contrast === 'high' ? 'ON' : 'OFF'})`,
      keywords: ['contrast', 'high contrast', 'accessibility', 'a11y'],
      group: 'Settings',
      enabled: () => true,
      run: () =>
        dispatch({
          type: 'SET_SETTINGS',
          patch: { contrast: state.settings.contrast === 'high' ? 'normal' : 'high' },
        }),
    },
    {
      id: 'cmd-toggle-motion',
      title: `Toggle Reduced Motion (currently ${state.settings.motion === 'reduced' ? 'ON' : 'OFF'})`,
      keywords: ['motion', 'reduced motion', 'animation', 'effects'],
      group: 'Settings',
      enabled: () => true,
      run: () =>
        dispatch({
          type: 'SET_SETTINGS',
          patch: { motion: state.settings.motion === 'reduced' ? 'full' : 'reduced' },
        }),
    },

    // Data
    {
      id: 'cmd-data-export',
      title: 'Export progress backup (JSON)',
      keywords: ['export', 'backup', 'download', 'save json'],
      group: 'Data',
      enabled: () => true,
      run: () => navigate('/settings'),
    },
    {
      id: 'cmd-data-reset',
      title: 'Reset all progress data',
      keywords: ['reset', 'clear', 'erase', 'danger', 'delete data'],
      group: 'Data',
      enabled: () => true,
      run: () => navigate('/settings'),
    },

    // Help
    {
      id: 'cmd-help-shortcuts',
      title: 'Keyboard shortcuts reference',
      keywords: ['keyboard', 'shortcuts', 'help', 'hotkeys', '?'],
      group: 'Help',
      shortcut: '?',
      enabled: () => true,
      run: openShortcuts,
    },
  ]
}
