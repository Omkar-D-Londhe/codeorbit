import type { ChallengeFile } from '../core/content/types'
import { buildPreviewDocument, PREVIEW_SANDBOX } from '../lib/preview'

export interface SandboxedPreviewProps {
  html?: string
  files?: ChallengeFile[]
  frame?: 'desktop' | 'tablet' | 'mobile'
}

/**
 * The ONLY place learner HTML is rendered. It goes into an iframe with an EMPTY sandbox attribute
 * (no scripts, no same-origin, no forms, no popups) via srcdoc. Never use dangerouslySetInnerHTML
 * or the parent DOM for learner markup.
 */
export function SandboxedPreview({ html, files, frame = 'desktop' }: SandboxedPreviewProps) {
  const doc = files ? buildPreviewDocument(files) : buildPreviewDocument(html ?? '')

  return (
    <iframe
      className={`preview__frame preview__frame--${frame}`}
      title="Live preview of your HTML"
      sandbox={PREVIEW_SANDBOX}
      srcDoc={doc}
      referrerPolicy="no-referrer"
    />
  )
}
