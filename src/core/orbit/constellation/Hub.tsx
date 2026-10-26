export interface HubProps {
  x: number
  y: number
  r: number
  trackName: string
  trackGlyph: string
  selected?: boolean
  onClick: () => void
}

export function Hub({
  x,
  y,
  r,
  trackName,
  trackGlyph,
  selected = false,
  onClick,
}: HubProps) {
  const size = r * 2

  return (
    <button
      type="button"
      className={`constellation-hub-btn ${selected ? 'is-selected' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      aria-label={`${trackName} track overview`}
      onClick={onClick}
    >
      <span className="constellation-hub-glyph" aria-hidden="true">
        {trackGlyph}
      </span>
      <span className="constellation-hub-title">{trackName}</span>
      <span className="constellation-hub-subtitle">Overview</span>
    </button>
  )
}
