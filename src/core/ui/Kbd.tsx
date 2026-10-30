import React from 'react'

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const platform = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || ''
  return /Mac|iPhone|iPod|iPad/i.test(platform) || /Macintosh|Mac OS/i.test(ua)
}

function formatShortcutForPlatform(content: React.ReactNode): React.ReactNode {
  if (typeof content !== 'string') return content
  if (isMacPlatform()) {
    return content
      .replace(/Ctrl\s*\+\s*/gi, '⌘')
      .replace(/Ctrl\s+/gi, '⌘')
      .replace(/Ctrl/gi, '⌘')
  }
  return content
}

/**
 * Renders shortcut keys cleanly, formatting platform-specific symbols where applicable.
 */
export function Kbd({ children, className = '', ...props }: KbdProps) {
  const displayContent = formatShortcutForPlatform(children)
  return (
    <kbd className={`kbd ${className}`.trim()} {...props}>
      {displayContent}
    </kbd>
  )
}
