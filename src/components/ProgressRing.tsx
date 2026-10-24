interface Props {
  /** 0..1 derived from real saved data. */
  fraction: number
  size?: number
  stroke?: number
  className?: string
}

/** Decorative ring; the surrounding control must carry the accessible text. */
export function ProgressRing({ fraction, size = 44, stroke = 3, className }: Props) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const f = Math.min(1, Math.max(0, fraction))
  return (
    <svg className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-strong)" strokeWidth={stroke} />
      {f > 0 && (
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${c * f} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  )
}
