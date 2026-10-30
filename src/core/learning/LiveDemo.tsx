import { useState, useEffect, useCallback } from 'react'
import type { LessonDemo } from '../../data/types'
import { SandboxedPreview } from '../../components/SandboxedPreview'
import { Icon } from '../../components/Icon'
import { executePython } from '../../tracks/python/runner'

export interface LiveDemoProps {
  demo: LessonDemo
  className?: string
  trackId?: string
}

/**
 * Live Interactive Demo (4.4, G2, Catalog 4.6).
 * - Runs demo code strictly through the sandboxed iframe preview or isolated Web Worker runner.
 * - Editable mini-editor allowing learners to tweak code live.
 * - Live output reacts immediately to learner edits.
 * - 'Reset demo' button restoring original authored code.
 * - Local component state only: demo edits are NEVER saved to user drafts.
 */
export function LiveDemo({ demo, className = '', trackId }: LiveDemoProps) {
  const initialCode = demo.files[0]?.content ?? ''
  const [code, setCode] = useState<string>(initialCode)
  const [hasError, setHasError] = useState<boolean>(false)
  const [bootstrapCss, setBootstrapCss] = useState<string | null>(null)
  const [pythonOutput, setPythonOutput] = useState<string | null>(null)
  const [isExecutingPython, setIsExecutingPython] = useState<boolean>(false)

  const isPython = trackId === 'python' || demo.id.startsWith('demo-py-') || Boolean(demo.files[0]?.name.endsWith('.py'))
  const isBootstrap = trackId === 'bootstrap' || demo.id.startsWith('demo-bs-')
  const isJavaScript = trackId === 'javascript' || demo.id.startsWith('demo-js-') || /<script[\s>]/i.test(code)

  useEffect(() => {
    setCode(demo.files[0]?.content ?? '')
    setHasError(false)
    setPythonOutput(null)
  }, [demo.id, demo.files])

  useEffect(() => {
    if (isBootstrap && !bootstrapCss) {
      import('../../tracks/bootstrap/vendor/bootstrap.min.css?raw')
        .then((m) => setBootstrapCss(m.default))
        .catch(() => {})
    }
  }, [isBootstrap, bootstrapCss])

  const runPythonCode = useCallback(async (srcToRun: string) => {
    setIsExecutingPython(true)
    try {
      const res = await executePython(srcToRun, [], { timeoutMs: 3000 })
      const out = res.stdout || res.stderr || (res.status === 'ok' ? '(Executed with no printed output)' : 'Execution error')
      setPythonOutput(out)
    } catch (err) {
      setPythonOutput(`Execution error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsExecutingPython(false)
    }
  }, [])

  const handleReset = () => {
    setCode(initialCode)
    setHasError(false)
    setPythonOutput(null)
  }

  return (
    <figure className={`live-demo ${className}`} aria-labelledby={`demo-title-${demo.id}`}>
      <figcaption className="live-demo__header">
        <div className="live-demo__title-group">
          <Icon name="code" size={18} />
          <span id={`demo-title-${demo.id}`} className="live-demo__title">
            Interactive Demo: {demo.title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isPython && (
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => runPythonCode(code)}
              disabled={isExecutingPython}
              aria-label={`Run ${demo.title}`}
            >
              <Icon name="play" size={14} />
              <span>{isExecutingPython ? 'Running...' : 'Run code'}</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={handleReset}
            aria-label={`Reset ${demo.title} to original`}
          >
            <Icon name="reset" size={14} />
            <span>Reset demo</span>
          </button>
        </div>
      </figcaption>

      {hasError ? (
        <div className="live-demo__error" role="alert">
          <p>The preview could not be displayed.</p>
          <button type="button" className="btn btn--secondary btn--sm" onClick={handleReset}>
            Reset demo
          </button>
        </div>
      ) : (
        <div className="live-demo__body">
          <div className="live-demo__editor-pane">
            <label htmlFor={`demo-editor-${demo.id}`} className="sr-only">
              Edit code for {demo.title}
            </label>
            <textarea
              id={`demo-editor-${demo.id}`}
              className="live-demo__editor"
              value={code}
              onChange={(e) => {
                const newCode = e.target.value
                setCode(newCode)
              }}
              rows={Math.min(12, Math.max(4, code.split('\n').length + 1))}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              aria-label={`Code editor for ${demo.title}`}
            />
          </div>
          <div className="live-demo__preview-pane">
            <div className="live-demo__preview-label muted small">
              {isPython ? 'Live Python Output' : 'Live Sandboxed Preview'}
            </div>
            {isPython ? (
              <div className="live-demo__terminal-wrapper">
                <pre
                  className="live-demo__terminal"
                  data-testid="python-demo-output"
                  style={{
                    margin: 0,
                    padding: '10px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.8125rem',
                    lineHeight: '1.5',
                    background: 'var(--c-surface-1, #0f0e1a)',
                    color: 'var(--c-text, #f0eff7)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    minHeight: '140px',
                    maxHeight: '240px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {pythonOutput ?? 'Click "Run code" to execute Python in isolated Web Worker.'}
                </pre>
              </div>
            ) : (
              <div className="live-demo__frame-wrapper">
                <SandboxedPreview
                  html={code}
                  mode={isJavaScript ? 'script' : 'static'}
                  stylesheets={isBootstrap && bootstrapCss ? [bootstrapCss] : undefined}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </figure>
  )
}
