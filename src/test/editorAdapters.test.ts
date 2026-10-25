import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PlainTextEditorAdapter } from '../core/editor/plainAdapter'
import { CodeMirrorEditorAdapter } from '../core/editor/codemirrorAdapter'
import type { EditorAdapter } from '../core/editor/types'

describe.each([
  { name: 'PlainTextEditorAdapter', create: () => new PlainTextEditorAdapter() },
  { name: 'CodeMirrorEditorAdapter', create: () => new CodeMirrorEditorAdapter() },
])('$name', ({ create }) => {
  let container: HTMLDivElement
  let adapter: EditorAdapter

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    adapter = create()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('mounts into container and reports initial value', () => {
    const handle = adapter.mount(container, {
      value: '<p>Hello CodeOrbit</p>',
      language: 'html',
    })
    expect(handle.getValue()).toBe('<p>Hello CodeOrbit</p>')
    handle.destroy()
    expect(container.innerHTML).toBe('')
  })

  it('updates value programmatically via setValue', () => {
    let changed = ''
    const handle = adapter.mount(container, {
      value: 'initial',
      onChange: (v) => { changed = v },
    })
    expect(handle.getValue()).toBe('initial')

    handle.setValue('updated code')
    expect(handle.getValue()).toBe('updated code')
    expect(typeof changed).toBe('string')
    handle.destroy()
  })

  it('supports insertAtCursor', () => {
    const handle = adapter.mount(container, {
      value: '<div></div>',
    })
    handle.insertAtCursor('<span />')
    expect(handle.getValue().length).toBeGreaterThanOrEqual('<div></div>'.length)
    handle.destroy()
  })

  it('supports setReadOnly and updateOptions without error', () => {
    const handle = adapter.mount(container, {
      value: 'test',
      readOnly: false,
    })
    expect(() => {
      handle.setReadOnly(true)
      handle.updateOptions({ fontSize: 16, wrap: true, lineNumbers: false, tabCapturesFocus: true })
      handle.setReadOnly(false)
    }).not.toThrow()
    handle.destroy()
  })

  it('cleans up DOM on destroy', () => {
    const handle = adapter.mount(container, {
      value: 'destroy test',
    })
    expect(container.children.length).toBeGreaterThan(0)
    handle.destroy()
    expect(container.children.length).toBe(0)
  })
})
