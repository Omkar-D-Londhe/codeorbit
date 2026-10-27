import type { CodeOrbitState, NoteRecord, BookmarkFolder } from '../../state/types'
import { getTopic } from '../../data/curriculum'

export function formatExportDate(d: Date = new Date()): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Generates a clean Markdown export document containing all user notes.
 */
export function generateNotesMarkdown(notes: Record<string, NoteRecord>): string {
  const entries = Object.entries(notes).filter(([, note]) => note && note.text.trim().length > 0)
  if (entries.length === 0) {
    return ''
  }

  const dateStr = formatExportDate()
  const lines: string[] = [
    `# CodeOrbit Notes Export`,
    `Generated on: ${dateStr}`,
    `Total notes: ${entries.length}`,
    '',
    '---',
    '',
  ]

  // Sort notes alphabetically by topic title
  entries.sort(([aId], [bId]) => {
    const titleA = getTopic(aId)?.title || aId
    const titleB = getTopic(bId)?.title || bId
    return titleA.localeCompare(titleB)
  })

  entries.forEach(([topicId, note]) => {
    const topic = getTopic(topicId)
    const title = topic?.title || topicId
    const updated = new Date(note.updatedAt || Date.now()).toISOString().split('T')[0]

    lines.push(`## ${title}`)
    lines.push(`*Topic ID: \`${topicId}\` · Last updated: ${updated}*`)
    if (note.tags && note.tags.length > 0) {
      lines.push(`*Tags:* ${note.tags.map((t) => `\`#${t}\``).join(' ')}`)
    }
    lines.push('')
    lines.push(note.text)
    lines.push('')
    lines.push('---')
    lines.push('')
  })

  return lines.join('\n')
}

export interface BackupExportData {
  version: number
  exportedAt: string
  notes: Record<string, NoteRecord>
  bookmarks: string[]
  bookmarkFolders: BookmarkFolder[]
  sectionBookmarks: string[]
}

/**
 * Generates a clean, portable JSON backup structure of notes and bookmarks.
 */
export function generateBackupJson(state: CodeOrbitState): string {
  const exportData: BackupExportData = {
    version: state.schemaVersion || 6,
    exportedAt: new Date().toISOString(),
    notes: state.notes || {},
    bookmarks: state.bookmarks || [],
    bookmarkFolders: state.bookmarkFolders || [],
    sectionBookmarks: state.sectionBookmarks || [],
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Triggers a browser file download safely.
 */
export function triggerDownload(filename: string, content: string, mimeType: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return true
  } catch (err) {
    console.error('Failed to trigger download:', err)
    return false
  }
}

export function exportNotesAsMarkdownFile(notes: Record<string, NoteRecord>): boolean {
  const content = generateNotesMarkdown(notes)
  if (!content) return false
  const filename = `codeorbit-notes-${formatExportDate()}.md`
  return triggerDownload(filename, content, 'text/markdown;charset=utf-8')
}

export function exportBackupAsJsonFile(state: CodeOrbitState): boolean {
  const content = generateBackupJson(state)
  const filename = `codeorbit-backup-${formatExportDate()}.json`
  return triggerDownload(filename, content, 'application/json;charset=utf-8')
}
