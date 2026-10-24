/**
 * Preview security boundary.
 *
 * Learner HTML is rendered ONLY inside an <iframe sandbox=""> via srcdoc. The sandbox attribute is
 * empty: no scripts, no same-origin, no forms, no popups, no top navigation. We never inject
 * learner markup into the trusted DOM, and we never combine allow-scripts with allow-same-origin.
 */
export const PREVIEW_SANDBOX = ''

/** A restrictive CSP as defence in depth: no scripts, no network, inline styles and data: images only. */
const CSP = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:"

const BASE_STYLES = `
  :root { color-scheme: light; }
  body { font: 16px/1.5 system-ui, sans-serif; margin: 16px; color: #1b1b22; background: #fff; }
  img { max-width: 100%; height: auto; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #b9b9c6; padding: 4px 8px; }
  label { display: inline-block; margin-top: 8px; }
  input, select, textarea, button { font: inherit; margin: 4px 0; }
  blockquote { border-left: 3px solid #9a8bff; margin-left: 0; padding-left: 12px; }
`

export function buildPreviewDocument(learnerHtml: string): string {
  const head = `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${CSP}"><style>${BASE_STYLES}</style>`
  return `<!DOCTYPE html><html><head>${head}</head><body>${learnerHtml}</body></html>`
}
