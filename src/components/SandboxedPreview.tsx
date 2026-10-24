import { buildPreviewDocument, PREVIEW_SANDBOX } from '../lib/preview'

/**
 * The ONLY place learner HTML is rendered. It goes into an iframe with an EMPTY sandbox attribute
 * (no scripts, no same-origin, no forms, no popups) via srcdoc. Never use dangerouslySetInnerHTML
 * or the parent DOM for learner markup.
 */
export function SandboxedPreview({ html }: { html: string }) {
  return (
    <iframe
      className="preview__frame"
      title="Live preview of your HTML"
      sandbox={PREVIEW_SANDBOX}
      srcDoc={buildPreviewDocument(html)}
      referrerPolicy="no-referrer"
    />
  )
}
