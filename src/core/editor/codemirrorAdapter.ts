import {
  EditorState,
  Compartment,
  type Extension,
} from '@codemirror/state'
import {
  EditorView,
  keymap,
  lineNumbers as cmLineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
} from '@codemirror/view'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands'
import {
  bracketMatching,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language'
import { html } from '@codemirror/lang-html'
import { closeBrackets } from '@codemirror/autocomplete'
import { setDiagnostics as cmSetDiagnostics, type Diagnostic } from '@codemirror/lint'
import { defaultTrackId } from '../content/registry'
import type { EditorAdapter, EditorHandle, EditorOptions, EditorDiagnostic } from './types'

/**
 * CodeMirror 6 adapter implementing EditorAdapter.
 * Uses tokens for theming, respects tabCapturesFocus accessibility rules,
 * and exposes full EditorHandle controls.
 */
export class CodeMirrorEditorAdapter implements EditorAdapter {
  mount(el: HTMLElement, opts: EditorOptions): EditorHandle {
    let currentOpts = { ...opts }

    const readOnlyComp = new Compartment()
    const lineNumbersComp = new Compartment()
    const wrapComp = new Compartment()
    const tabSizeComp = new Compartment()
    const keymapComp = new Compartment()
    const themeComp = new Compartment()

    const createTheme = (fontSize: number) =>
      EditorView.theme({
        '&': {
          height: '100%',
          backgroundColor: 'var(--code-bg, #0d0d17)',
          color: 'var(--c-text, #f4f4f8)',
          fontFamily: 'var(--font-mono)',
          fontSize: `${fontSize}px`,
        },
        '.cm-scroller': {
          overflow: 'auto',
          fontFamily: 'var(--font-mono)',
          lineHeight: '1.65',
        },
        '.cm-content': {
          caretColor: 'var(--c-accent, #9a8bff)',
          padding: '14px 16px',
        },
        '&.cm-focused .cm-cursor': {
          borderLeftColor: 'var(--c-accent, #9a8bff)',
        },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
          backgroundColor: 'var(--c-accent-soft, rgba(154, 139, 255, 0.25))',
        },
        '.cm-gutters': {
          backgroundColor: 'var(--code-bg, #0d0d17)',
          color: 'var(--c-text-muted, #85839b)',
          borderRight: '1px solid var(--c-border, #1f1d2e)',
          padding: '14px 4px 14px 8px',
        },
        '.cm-activeLine': {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'transparent',
          color: 'var(--c-text, #ffffff)',
          fontWeight: '600',
        },
      })

    const getKeymapExtensions = (capturesFocus: boolean): Extension => {
      // If tabCapturesFocus is false (default per a11y), Tab leaves the editor.
      // If true, Tab indents inside the editor.
      const base = [defaultKeymap, historyKeymap]
      if (capturesFocus) {
        return keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap])
      }
      return keymap.of(base.flat())
    }

    const extensions: Extension[] = [
      history(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      readOnlyComp.of(EditorState.readOnly.of(!!currentOpts.readOnly)),
      lineNumbersComp.of(currentOpts.lineNumbers ? cmLineNumbers() : []),
      wrapComp.of(currentOpts.wrap ? EditorView.lineWrapping : []),
      tabSizeComp.of(EditorState.tabSize.of(currentOpts.tabSize || 2)),
      keymapComp.of(getKeymapExtensions(Boolean(currentOpts.tabCapturesFocus))),
      themeComp.of(createTheme(currentOpts.fontSize || 14.4)),
      EditorView.contentAttributes.of({
        role: 'textbox',
        'aria-label': currentOpts.ariaLabel || 'HTML editor',
        spellcheck: 'false',
        autocapitalize: 'off',
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const docStr = update.state.doc.toString()
          currentOpts.onChange?.(docStr)
        }
        if (update.selectionSet && currentOpts.onCursor) {
          const mainSel = update.state.selection.main
          const lineObj = update.state.doc.lineAt(mainSel.head)
          currentOpts.onCursor({
            line: lineObj.number,
            column: mainSel.head - lineObj.from + 1,
          })
        }
      }),
    ]

    // Language extensions
    const defLang = defaultTrackId()
    if (currentOpts.language === defLang || !currentOpts.language) {
      extensions.push(html({ autoCloseTags: currentOpts.autoClose !== false }))
    }
    if (currentOpts.autoClose !== false) {
      extensions.push(closeBrackets())
    }

    const startState = EditorState.create({
      doc: currentOpts.value,
      extensions,
    })

    const view = new EditorView({
      state: startState,
      parent: el,
    })

    return {
      getValue() {
        return view.state.doc.toString()
      },
      setValue(v: string) {
        if (view.state.doc.toString() !== v) {
          view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: v },
          })
        }
      },
      insertAtCursor(text: string) {
        const sel = view.state.selection.main
        view.dispatch({
          changes: { from: sel.from, to: sel.to, insert: text },
          selection: { anchor: sel.from + text.length },
        })
      },
      focus() {
        view.focus()
      },
      setDiagnostics(diagnostics: EditorDiagnostic[]) {
        const cmDiags: Diagnostic[] = []
        for (const d of diagnostics) {
          try {
            const line = Math.max(1, Math.min(d.line, view.state.doc.lines))
            const lineObj = view.state.doc.line(line)
            const from = lineObj.from + Math.max(0, (d.column ?? 1) - 1)
            const to = Math.min(lineObj.to, from + 1)
            cmDiags.push({
              from,
              to: Math.max(from, to),
              severity: d.severity,
              message: d.message,
            })
          } catch {
            // Ignore boundary errors in diagnostics mapping
          }
        }
        view.dispatch(cmSetDiagnostics(view.state, cmDiags))
      },
      setReadOnly(ro: boolean) {
        currentOpts.readOnly = ro
        view.dispatch({
          effects: readOnlyComp.reconfigure(EditorState.readOnly.of(ro)),
        })
      },
      updateOptions(newOpts: Partial<EditorOptions>) {
        currentOpts = { ...currentOpts, ...newOpts }
        const effects = []
        if (newOpts.lineNumbers !== undefined) {
          effects.push(lineNumbersComp.reconfigure(newOpts.lineNumbers ? cmLineNumbers() : []))
        }
        if (newOpts.wrap !== undefined) {
          effects.push(wrapComp.reconfigure(newOpts.wrap ? EditorView.lineWrapping : []))
        }
        if (newOpts.tabSize !== undefined) {
          effects.push(tabSizeComp.reconfigure(EditorState.tabSize.of(newOpts.tabSize)))
        }
        if (newOpts.tabCapturesFocus !== undefined) {
          effects.push(keymapComp.reconfigure(getKeymapExtensions(newOpts.tabCapturesFocus)))
        }
        if (newOpts.fontSize !== undefined) {
          effects.push(themeComp.reconfigure(createTheme(newOpts.fontSize)))
        }
        if (effects.length > 0) {
          view.dispatch({ effects })
        }
      },
      destroy() {
        view.destroy()
      },
    }
  }
}
