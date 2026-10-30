import type { ChallengeFile } from '../core/content/types'
import {
  buildPreviewDocument,
  buildScriptPreviewDocument,
  PREVIEW_SANDBOX,
} from '../lib/preview'
import { SCRIPT_PREVIEW_SANDBOX } from '../core/runner/iframePreviewRunner'

export interface SandboxedPreviewProps {
  html?: string
  files?: ChallengeFile[]
  frame?: 'desktop' | 'tablet' | 'mobile'
  needsMedia?: boolean
  mode?: 'static' | 'script'
  nonce?: string
  stylesheets?: string[]
}

/**
 * Sandboxed Preview.
 * - 'static' (default): HTML/CSS tracks with empty sandbox="" (no scripts, no same-origin).
 * - 'script': JS track DOM/event challenges with sandbox="allow-scripts" only (strictly NO allow-same-origin).
 * Never use dangerouslySetInnerHTML or the parent DOM for learner markup.
 */
export function SandboxedPreview({
  html,
  files,
  frame = 'desktop',
  needsMedia,
  mode = 'static',
  nonce,
  stylesheets,
}: SandboxedPreviewProps) {
  const isScript = mode === 'script'
  const sandbox = isScript ? SCRIPT_PREVIEW_SANDBOX : PREVIEW_SANDBOX

  const isFullDoc = typeof html === 'string' && (/^\s*<!doctype\s+html/i.test(html) || /^\s*<html/i.test(html))

  const doc = isScript
    ? (isFullDoc ? html! : buildScriptPreviewDocument(files ?? html ?? '', nonce || 'script-preview', { needsMedia, stylesheets }))
    : files
      ? buildPreviewDocument(files, { needsMedia, stylesheets })
      : (isFullDoc ? html! : buildPreviewDocument(html ?? '', { needsMedia, stylesheets }))

  return (
    <iframe
      className={`preview__frame preview__frame--${frame}`}
      title="Live preview"
      sandbox={sandbox}
      srcDoc={doc}
      referrerPolicy="no-referrer"
    />
  )
}
