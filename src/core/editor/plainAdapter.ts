import type { EditorAdapter, EditorHandle, EditorOptions, EditorDiagnostic } from './types'

/**
 * Fallback plaintext editor adapter using textarea and a line gutter.
 * Preserves the original accessible behavior: Tab does not trap focus by default.
 */
export class PlainTextEditorAdapter implements EditorAdapter {
  mount(el: HTMLElement, opts: EditorOptions): EditorHandle {
    let currentOpts = { ...opts }
    let value = currentOpts.value

    const container = document.createElement('div')
    container.className = 'editor editor--plain'

    const scroll = document.createElement('div')
    scroll.className = 'editor__scroll'

    const gutter = document.createElement('div')
    gutter.className = 'editor__gutter'
    gutter.setAttribute('aria-hidden', 'true')
    gutter.style.display = currentOpts.lineNumbers ? 'flex' : 'none'

    const textarea = document.createElement('textarea')
    textarea.className = 'editor__input'
    textarea.setAttribute('role', 'textbox')
    textarea.setAttribute('aria-label', currentOpts.ariaLabel || 'HTML editor')
    textarea.spellcheck = false
    textarea.autocapitalize = 'off'
    textarea.autocomplete = 'off'
    textarea.wrap = currentOpts.wrap ? 'on' : 'off'
    textarea.readOnly = !!currentOpts.readOnly
    if (currentOpts.readOnly) {
      textarea.setAttribute('aria-readonly', 'true')
    }
    textarea.style.fontSize = `${currentOpts.fontSize}px`
    textarea.style.tabSize = `${currentOpts.tabSize}`
    textarea.value = value

    const updateGutter = () => {
      const lineCount = (textarea.value.split('\n') || ['']).length
      gutter.innerHTML = Array.from({ length: lineCount }, (_, i) => `<span>${i + 1}</span>`).join('')
      const lines = textarea.value.split('\n')
      const maxLen = lines.reduce((m, l) => Math.max(m, l.length), 0)
      if (!currentOpts.wrap) {
        textarea.style.width = `calc(${Math.max(maxLen, 20)}ch + 32px)`
      } else {
        textarea.style.width = '100%'
      }
    }

    updateGutter()

    const onInput = () => {
      value = textarea.value
      updateGutter()
      currentOpts.onChange?.(value)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && currentOpts.tabCapturesFocus) {
        e.preventDefault()
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const spaces = ' '.repeat(currentOpts.tabSize || 2)
        textarea.setRangeText(spaces, start, end, 'end')
        onInput()
      }
    }

    const onSelect = () => {
      if (!currentOpts.onCursor) return
      const text = textarea.value.slice(0, textarea.selectionStart)
      const lines = text.split('\n')
      const line = lines.length
      const column = lines[lines.length - 1].length + 1
      currentOpts.onCursor({ line, column })
    }

    textarea.addEventListener('input', onInput)
    textarea.addEventListener('keydown', onKeyDown)
    textarea.addEventListener('click', onSelect)
    textarea.addEventListener('keyup', onSelect)

    scroll.appendChild(gutter)
    scroll.appendChild(textarea)
    container.appendChild(scroll)
    el.appendChild(container)

    return {
      getValue() {
        return textarea.value
      },
      setValue(v: string) {
        if (textarea.value !== v) {
          textarea.value = v
          value = v
          updateGutter()
        }
      },
      insertAtCursor(text: string) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        textarea.setRangeText(text, start, end, 'end')
        onInput()
      },
      focus() {
        textarea.focus()
      },
      setDiagnostics(_d: EditorDiagnostic[]) {
        // Plain adapter does not render inline gutter markers
      },
      setReadOnly(ro: boolean) {
        currentOpts.readOnly = ro
        textarea.readOnly = ro
        if (ro) textarea.setAttribute('aria-readonly', 'true')
        else textarea.removeAttribute('aria-readonly')
      },
      updateOptions(newOpts: Partial<EditorOptions>) {
        currentOpts = { ...currentOpts, ...newOpts }
        gutter.style.display = currentOpts.lineNumbers ? 'flex' : 'none'
        textarea.wrap = currentOpts.wrap ? 'on' : 'off'
        textarea.style.fontSize = `${currentOpts.fontSize}px`
        textarea.style.tabSize = `${currentOpts.tabSize}`
        if (newOpts.ariaLabel) textarea.setAttribute('aria-label', newOpts.ariaLabel)
        updateGutter()
      },
      destroy() {
        textarea.removeEventListener('input', onInput)
        textarea.removeEventListener('keydown', onKeyDown)
        textarea.removeEventListener('click', onSelect)
        textarea.removeEventListener('keyup', onSelect)
        if (container.parentElement === el) {
          el.removeChild(container)
        }
      },
    }
  }
}
