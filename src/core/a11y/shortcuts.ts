export interface ShortcutDef {
  id: string
  keys: string[]
  description: string
  scope: 'global' | 'palette' | 'orbit' | 'editor'
}

/**
 * 13.5 Keyboard Shortcut Reference Registry: Single source of truth
 * for shortcuts across CodeOrbit, powering both the palette hints and the modal.
 */
export const SHORTCUTS: ShortcutDef[] = [
  {
    id: 'open-palette',
    keys: ['Ctrl+K', '⌘K', '/'],
    description: 'Open command palette and search',
    scope: 'global',
  },
  {
    id: 'open-shortcuts',
    keys: ['?'],
    description: 'Show keyboard shortcuts reference',
    scope: 'global',
  },
  {
    id: 'nav-home',
    keys: ['g h'],
    description: 'Go to Home / Dashboard',
    scope: 'global',
  },
  {
    id: 'nav-explore',
    keys: ['g e'],
    description: 'Go to Explore technologies',
    scope: 'global',
  },
  {
    id: 'nav-progress',
    keys: ['g p'],
    description: 'Go to My Progress & analytics',
    scope: 'global',
  },
  {
    id: 'nav-concepts',
    keys: ['g c'],
    description: 'Go to Concept Atlas',
    scope: 'global',
  },
  {
    id: 'close-modal',
    keys: ['Esc'],
    description: 'Close dialog, modal, or palette',
    scope: 'global',
  },
  {
    id: 'palette-navigate',
    keys: ['↑', '↓'],
    description: 'Navigate search results',
    scope: 'palette',
  },
  {
    id: 'palette-select',
    keys: ['Enter'],
    description: 'Execute selected command or open result',
    scope: 'palette',
  },
  {
    id: 'orbit-select-next',
    keys: ['ArrowRight', 'ArrowDown'],
    description: 'Select next topic in orbit',
    scope: 'orbit',
  },
  {
    id: 'orbit-select-prev',
    keys: ['ArrowLeft', 'ArrowUp'],
    description: 'Select previous topic in orbit',
    scope: 'orbit',
  },
  {
    id: 'orbit-zoom-in',
    keys: ['+'],
    description: 'Zoom into constellation map',
    scope: 'orbit',
  },
  {
    id: 'orbit-zoom-out',
    keys: ['-'],
    description: 'Zoom out of constellation map',
    scope: 'orbit',
  },
  {
    id: 'orbit-fit',
    keys: ['0'],
    description: 'Reset zoom and fit map to viewport',
    scope: 'orbit',
  },
  {
    id: 'editor-run-check',
    keys: ['Ctrl+Enter', '⌘Enter'],
    description: 'Run code and check requirements',
    scope: 'editor',
  },
  {
    id: 'editor-save',
    keys: ['Ctrl+S', '⌘S'],
    description: 'Save current draft',
    scope: 'editor',
  },
  {
    id: 'editor-exit-fullscreen',
    keys: ['Esc'],
    description: 'Exit fullscreen editor mode',
    scope: 'editor',
  },
]

export const SCOPE_LABELS: Record<ShortcutDef['scope'], string> = {
  global: 'Global navigation',
  palette: 'Command palette',
  orbit: 'Learning Orbit (Constellation)',
  editor: 'Practice workspace & editor',
}
