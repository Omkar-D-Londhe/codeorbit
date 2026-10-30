/**
 * Preview security boundary.
 *
 * Learner HTML is rendered ONLY inside an <iframe sandbox=""> via srcdoc. The sandbox attribute is
 * empty: no scripts, no same-origin, no forms, no popups, no top navigation. We never inject
 * learner markup into the trusted DOM, and we never combine allow-scripts with allow-same-origin.
 */
import type { ChallengeFile } from '../core/content/types'
import { createPreviewHarnessScript } from '../tracks/javascript/previewHarness'

export const PREVIEW_SANDBOX = ''

/** A restrictive CSP as defence in depth: no scripts, no network, inline styles and data: images only. */
export const CSP = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:"

/** Script-enabled CSP for JavaScript DOM/event challenges (PLT-11, C-05). Strictly no network. */
export const SCRIPT_PREVIEW_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:"

export const BASE_STYLES = `
  :root { color-scheme: light; }
  body { font: 16px/1.5 system-ui, sans-serif; margin: 16px; color: #1b1b22; background: #fff; }
  img { max-width: 100%; height: auto; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #b9b9c6; padding: 4px 8px; }
  label { display: inline-block; margin-top: 8px; }
  input, select, textarea, button { font: inherit; margin: 4px 0; }
  blockquote { border-left: 3px solid #9a8bff; margin-left: 0; padding-left: 12px; }
`

/**
 * Escapes closing style tags in learner CSS to prevent escaping from <style> blocks.
 */
export function escapeStyleTag(css: string): string {
  return css.replace(/<\/style/gi, '<\\/style')
}

/**
 * Escapes closing script tags in learner JS to prevent escaping from <script> blocks.
 */
export function escapeScriptTag(js: string): string {
  return js.replace(/<\/script/gi, '<\\/script')
}

export interface PreviewOptions {
  needsMedia?: boolean
  stylesheets?: string[]
}

export interface ScriptPreviewOptions {
  needsMedia?: boolean
  stylesheets?: string[]
}

/**
 * Builds a sandboxed HTML document from a raw HTML string or a set of multi-file tabs.
 * In multi-file mode, CSS files are stitched into <style> tags in <head>.
 * When options.needsMedia is true, extends CSP with media-src data:.
 * When options.stylesheets is provided, injects them as <style> tags in <head>.
 */
export function buildPreviewDocument(input: string | ChallengeFile[], options?: PreviewOptions): string {
  const activeCsp = options?.needsMedia ? `${CSP}; media-src data:` : CSP

  const trackStyles =
    options?.stylesheets && options.stylesheets.length > 0
      ? '\n' +
        options.stylesheets
          .map((sheet) => `<style data-track-stylesheet="true">${escapeStyleTag(sheet)}</style>`)
          .join('\n')
      : ''

  if (typeof input === 'string') {
    const head = `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${activeCsp}"><style>${BASE_STYLES}</style>${trackStyles}`
    return `<!DOCTYPE html><html><head>${head}</head><body>${input}</body></html>`
  }

  const files = input
  // Find primary HTML file: index.html or first .html file
  const htmlFile = files.find((f) => f.name.toLowerCase() === 'index.html') ||
    files.find((f) => f.name.toLowerCase().endsWith('.html')) ||
    files[0]

  const bodyContent = htmlFile ? htmlFile.content : ''

  // Collect and stitch all CSS files
  const cssStyles = files
    .filter((f) => f.name.toLowerCase().endsWith('.css'))
    .map((f) => `<style data-filename="${f.name}">${escapeStyleTag(f.content)}</style>`)
    .join('\n')

  const head = `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${activeCsp}"><style>${BASE_STYLES}</style>${trackStyles}${cssStyles ? '\n' + cssStyles : ''}`
  return `<!DOCTYPE html><html><head>${head}</head><body>${bodyContent}</body></html>`
}

/**
 * Builds a script-enabled sandboxed HTML document (PLT-11, C-05).
 * - Enforces SCRIPT_PREVIEW_CSP.
 * - Injects the preview harness script with a unique run nonce.
 * - Stitches CSS into <style> and JS into <script> tags.
 * - Must be rendered ONLY in an iframe with sandbox="allow-scripts" (never allow-same-origin).
 */
export function buildScriptPreviewDocument(
  input: string | ChallengeFile[],
  nonce: string,
  options?: ScriptPreviewOptions
): string {
  const activeCsp = options?.needsMedia
    ? `${SCRIPT_PREVIEW_CSP}; media-src data:`
    : SCRIPT_PREVIEW_CSP

  const harnessScript = `<script data-codeorbit-harness="true">${createPreviewHarnessScript(nonce)}</script>`

  const trackStyles =
    options?.stylesheets && options.stylesheets.length > 0
      ? '\n' +
        options.stylesheets
          .map((sheet) => `<style data-track-stylesheet="true">${escapeStyleTag(sheet)}</style>`)
          .join('\n')
      : ''

  if (typeof input === 'string') {
    const head = `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${activeCsp}"><style>${BASE_STYLES}</style>${trackStyles}${harnessScript}`
    return `<!DOCTYPE html><html><head>${head}</head><body>${input}</body></html>`
  }

  const files = input
  const htmlFile =
    files.find((f) => f.name.toLowerCase() === 'index.html') ||
    files.find((f) => f.name.toLowerCase().endsWith('.html')) ||
    files[0]

  const bodyContent = htmlFile ? htmlFile.content : ''

  const cssStyles = files
    .filter((f) => f.name.toLowerCase().endsWith('.css'))
    .map((f) => `<style data-filename="${f.name}">${escapeStyleTag(f.content)}</style>`)
    .join('\n')

  const jsScripts = files
    .filter((f) => f.name.toLowerCase().endsWith('.js') || f.name.toLowerCase().endsWith('.ts'))
    .map((f) => `<script data-filename="${f.name}">${escapeScriptTag(f.content)}</script>`)
    .join('\n')

  const head = `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${activeCsp}"><style>${BASE_STYLES}</style>${trackStyles}${cssStyles ? '\n' + cssStyles : ''}\n${harnessScript}\n${jsScripts}`
  return `<!DOCTYPE html><html><head>${head}</head><body>${bodyContent}</body></html>`
}
