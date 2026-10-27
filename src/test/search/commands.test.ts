import { describe, it, expect, vi } from 'vitest'
import { buildCommands } from '../../core/search/commands'
import { createDefaultState } from '../../lib/storage'

describe('command registry', () => {
  it('builds navigation, learn, practice, settings, data, and help commands', () => {
    const navigate = vi.fn()
    const dispatch = vi.fn()
    const openShortcuts = vi.fn()

    const commands = buildCommands({
      navigate,
      state: createDefaultState(),
      dispatch,
      openShortcuts,
    })

    expect(commands.length).toBeGreaterThan(0)

    const groups = new Set(commands.map((c) => c.group))
    expect(groups.has('Navigate')).toBe(true)
    expect(groups.has('Settings')).toBe(true)
    expect(groups.has('Help')).toBe(true)

    // Execute a navigation command
    const homeCmd = commands.find((c) => c.id === 'cmd-nav-home')
    expect(homeCmd).toBeDefined()
    homeCmd?.run()
    expect(navigate).toHaveBeenCalledWith('/')

    // Execute shortcuts help command
    const shortcutsCmd = commands.find((c) => c.id === 'cmd-help-shortcuts')
    expect(shortcutsCmd).toBeDefined()
    shortcutsCmd?.run()
    expect(openShortcuts).toHaveBeenCalled()
  })

  it('respects command enabled status', () => {
    const navigate = vi.fn()
    const dispatch = vi.fn()
    const openShortcuts = vi.fn()

    const commands = buildCommands({
      navigate,
      state: createDefaultState(),
      dispatch,
      openShortcuts,
    })

    for (const cmd of commands) {
      expect(typeof cmd.enabled()).toBe('boolean')
    }
  })
})
