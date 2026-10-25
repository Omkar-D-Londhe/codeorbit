import { useEffect, useRef, useState } from 'react'
import type { EditorAdapter, EditorHandle, EditorDiagnostic } from '../core/editor/types'
import { PlainTextEditorAdapter } from '../core/editor/plainAdapter'
import { defaultTrackId } from '../core/content/registry'
import { useAppOptional } from '../state/AppState'
import { DEFAULT_EDITOR_SETTINGS } from '../state/types'

export interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  language?: string
  readOnly?: boolean
  diagnostics?: EditorDiagnostic[]
  engine?: 'codemirror' | 'plain'
}

/**
 * CodeEditor component wrapper (6.1)
 * Dynamically chooses between CodeMirror 6 and PlainTextEditorAdapter based on user preferences.
 * Falls back gracefully to plain textarea adapter if CodeMirror chunk fails or in simple mode.
 * Accessible: Tab leaves the editor by default; clear instructions for keyboard navigation.
 */
export function CodeEditor({
  value,
  onChange,
  label = 'HTML editor',
  language = defaultTrackId() ?? '',
  readOnly = false,
  diagnostics = [],
  engine: engineProp,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<EditorHandle | null>(null)
  const app = useAppOptional()
  const editorSettings = app?.state?.settings?.editor ?? DEFAULT_EDITOR_SETTINGS
  const selectedEngine = engineProp ?? editorSettings.engine

  const [adapter, setAdapter] = useState<EditorAdapter>(() => new PlainTextEditorAdapter())

  // Lazy-load CodeMirror adapter when engine is set to 'codemirror'
  // In jsdom tests, existing integration tests expect the plain textarea adapter unless explicitly requested via prop
  useEffect(() => {
    const isJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)
    const shouldUseCm = selectedEngine === 'codemirror' && (!isJsdom || Boolean(engineProp))

    if (shouldUseCm) {
      let active = true
      import('../core/editor/codemirrorAdapter')
        .then((m) => {
          if (active) {
            setAdapter(new m.CodeMirrorEditorAdapter())
          }
        })
        .catch(() => {
          // Fall back gracefully to plain adapter
          if (active) {
            setAdapter(new PlainTextEditorAdapter())
          }
        })
      return () => {
        active = false
      }
    } else {
      setAdapter(new PlainTextEditorAdapter())
    }
  }, [selectedEngine, engineProp])

  // Mount and re-mount editor handle whenever adapter changes
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Clean previous handle
    if (handleRef.current) {
      handleRef.current.destroy()
      handleRef.current = null
    }

    const handle = adapter.mount(el, {
      value,
      language,
      readOnly,
      ariaLabel: label,
      lineNumbers: editorSettings.lineNumbers,
      wrap: editorSettings.wrap,
      fontSize: editorSettings.fontSize,
      tabSize: editorSettings.tabSize,
      tabCapturesFocus: editorSettings.tabCapturesFocus,
      autoClose: editorSettings.autoClose,
      onChange,
    })

    handleRef.current = handle

    return () => {
      handle.destroy()
      handleRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter])

  // Synchronize options when settings change
  useEffect(() => {
    handleRef.current?.updateOptions({
      lineNumbers: editorSettings.lineNumbers,
      wrap: editorSettings.wrap,
      fontSize: editorSettings.fontSize,
      tabSize: editorSettings.tabSize,
      tabCapturesFocus: editorSettings.tabCapturesFocus,
      autoClose: editorSettings.autoClose,
      readOnly,
      ariaLabel: label,
    })
  }, [editorSettings, readOnly, label])

  // Synchronize value updates (e.g. starter reset or solution reveal)
  useEffect(() => {
    if (handleRef.current && handleRef.current.getValue() !== value) {
      handleRef.current.setValue(value)
    }
  }, [value])

  // Synchronize diagnostics
  useEffect(() => {
    handleRef.current?.setDiagnostics(diagnostics)
  }, [diagnostics])

  return (
    <div className="code-editor-wrapper" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div ref={containerRef} style={{ flex: 1, minHeight: '220px', position: 'relative' }} />
      <div
        className="editor-help-line muted small"
        style={{
          padding: '4px 12px',
          borderTop: '1px solid var(--c-border, #1f1d2e)',
          fontSize: '11px',
          backgroundColor: 'var(--code-bg, #0d0d17)',
        }}
      >
        {editorSettings.tabCapturesFocus
          ? 'Press Esc then Tab to leave the editor.'
          : 'Tab moves focus out of the editor. Enable "Tab inserts indentation" in Settings to indent.'}
      </div>
    </div>
  )
}
