import type { SVGProps } from 'react'

export type EmptyIllustrationVariant = 'notes' | 'bookmarks' | 'review' | 'activity' | 'tracks'

interface IllustrationProps extends SVGProps<SVGSVGElement> {
  size?: number
}

/**
 * 96x96 Animated SVG Empty State Illustrations (Stage 17a, 15.2)
 * Designed for Obsidian/Starlight/Aurora palettes with strict reduced-motion and high-contrast compliance.
 */

export function EmptyNotesIllustration({ size = 96, className = '', ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`empty-illustration empty-illustration--notes ${className}`}
      aria-hidden="true"
      {...props}
    >
      <rect x="20" y="16" width="56" height="64" rx="8" className="empty-ill__base" />
      <rect x="24" y="20" width="48" height="56" rx="6" className="empty-ill__sheet" />
      {/* Notebook Lines */}
      <line x1="32" y1="32" x2="64" y2="32" className="empty-ill__line" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="42" x2="58" y2="42" className="empty-ill__line" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="52" x2="62" y2="52" className="empty-ill__line" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="62" x2="48" y2="62" className="empty-ill__line" strokeWidth="2" strokeLinecap="round" />
      {/* Floating Star / Quill Indicator */}
      <g className="empty-ill__floating">
        <circle cx="68" cy="24" r="10" className="empty-ill__badge-bg" />
        <path
          d="M68 18L69.5 22.5L74 24L69.5 25.5L68 30L66.5 25.5L62 24L66.5 22.5Z"
          className="empty-ill__accent"
        />
      </g>
    </svg>
  )
}

export function EmptyBookmarksIllustration({ size = 96, className = '', ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`empty-illustration empty-illustration--bookmarks ${className}`}
      aria-hidden="true"
      {...props}
    >
      <circle cx="48" cy="48" r="38" className="empty-ill__ring" strokeWidth="1.5" strokeDasharray="4 4" />
      {/* Hanging Bookmark Ribbon */}
      <path
        d="M36 20C36 17.7909 37.7909 16 40 16H56C58.2091 16 60 17.7909 60 20V76L48 66L36 76V20Z"
        className="empty-ill__ribbon"
      />
      {/* Central Star Icon on ribbon */}
      <g className="empty-ill__pulsing">
        <path
          d="M48 34L50.5 41.5L58 44L50.5 46.5L48 54L45.5 46.5L38 44L45.5 41.5Z"
          className="empty-ill__accent"
        />
      </g>
    </svg>
  )
}

export function EmptyReviewIllustration({ size = 96, className = '', ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`empty-illustration empty-illustration--review ${className}`}
      aria-hidden="true"
      {...props}
    >
      <circle cx="48" cy="48" r="38" className="empty-ill__ring" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="26" className="empty-ill__ring" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="48" cy="48" r="14" className="empty-ill__ring" strokeWidth="1" />
      {/* Scanning Radar Arm */}
      <g className="empty-ill__rotating">
        <line x1="48" y1="48" x2="48" y2="10" className="empty-ill__radar-arm" strokeWidth="2" strokeLinecap="round" />
        <circle cx="48" cy="10" r="4" className="empty-ill__accent-node" />
      </g>
      {/* Center Target */}
      <circle cx="48" cy="48" r="5" className="empty-ill__center-node" />
    </svg>
  )
}

export function EmptyActivityIllustration({ size = 96, className = '', ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`empty-illustration empty-illustration--activity ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Outer Orbit Path */}
      <ellipse cx="48" cy="50" rx="38" ry="24" className="empty-ill__ring" strokeWidth="1.5" strokeDasharray="5 5" />
      {/* Resting Star Flame in center */}
      <g className="empty-ill__breathing">
        <circle cx="48" cy="46" r="18" className="empty-ill__flame-glow" />
        <path
          d="M48 28C48 28 54 36 54 44C54 47.3137 51.3137 50 48 50C44.6863 50 42 47.3137 42 44C42 36 48 28 48 28Z"
          className="empty-ill__flame-core"
        />
        <circle cx="48" cy="45" r="3" className="empty-ill__flame-spark" />
      </g>
    </svg>
  )
}

export function EmptyTracksIllustration({ size = 96, className = '', ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`empty-illustration empty-illustration--tracks ${className}`}
      aria-hidden="true"
      {...props}
    >
      <circle cx="48" cy="48" r="38" className="empty-ill__compass-dial" strokeWidth="2" />
      <circle cx="48" cy="48" r="30" className="empty-ill__ring" strokeWidth="1" strokeDasharray="2 4" />
      {/* Compass Needle */}
      <g className="empty-ill__compass-needle">
        <polygon points="48,16 54,48 48,44" className="empty-ill__needle-north" />
        <polygon points="48,80 54,48 48,44" className="empty-ill__needle-south" />
        <polygon points="48,16 42,48 48,44" className="empty-ill__needle-north-dark" />
        <polygon points="48,80 42,48 48,44" className="empty-ill__needle-south-dark" />
        <circle cx="48" cy="48" r="4" className="empty-ill__needle-pivot" />
      </g>
    </svg>
  )
}

export function ContextualEmptyIllustration({
  variant,
  size = 96,
  className = '',
}: {
  variant: EmptyIllustrationVariant
  size?: number
  className?: string
}) {
  switch (variant) {
    case 'notes':
      return <EmptyNotesIllustration size={size} className={className} />
    case 'bookmarks':
      return <EmptyBookmarksIllustration size={size} className={className} />
    case 'review':
      return <EmptyReviewIllustration size={size} className={className} />
    case 'activity':
      return <EmptyActivityIllustration size={size} className={className} />
    case 'tracks':
      return <EmptyTracksIllustration size={size} className={className} />
  }
}
