import { useState } from 'react'
import type { LessonDemo } from '../../data/types'
import { SandboxedPreview } from '../../components/SandboxedPreview'
import { Icon } from '../../components/Icon'

export interface LiveDemoProps {
  demo: LessonDemo
  className?: string
}

/**
 * Live Interactive Demo (4.4).
 * - Runs demo code strictly through the sandboxed iframe preview (empty sandbox="").
 * - Editable mini-editor allowing learners to tweak code live.
 * - 'Reset demo' button restoring original authored code.
 * - Local component state only: demo edits are NEVER saved to user drafts.
 */
export function LiveDemo({ demo, className = '' }: LiveDemoProps) {
  const initialCode = demo.files[0]?.content ?? ''
  const [code, setCode] = useState<string>(initialCode)
  const [hasError, setHasError] = useState<boolean>(false)

  const handleReset = () => {
    setCode(initialCode)
    setHasError(false)
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
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={handleReset}
          aria-label={`Reset ${demo.title} to original`}
        >
          <Icon name="reset" size={14} />
          <span>Reset demo</span>
        </button>
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
              onChange={(e) => setCode(e.target.value)}
              rows={Math.min(12, Math.max(4, code.split('\n').length + 1))}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              aria-label={`Code editor for ${demo.title}`}
            />
          </div>
          <div className="live-demo__preview-pane">
            <div className="live-demo__preview-label muted small">Live Sandboxed Preview</div>
            <div className="live-demo__frame-wrapper">
              <SandboxedPreview html={code} />
            </div>
          </div>
        </div>
      )}
    </figure>
  )
}
