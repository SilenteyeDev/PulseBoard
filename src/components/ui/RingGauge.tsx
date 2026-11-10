type RingGaugeProps = {
  value: number
  label: string
  caption?: string
  size?: number
}

const MAX = 100

export function RingGauge({ value, label, caption, size = 168 }: RingGaugeProps) {
  const clamped = Math.max(0, Math.min(MAX, value))
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (clamped / MAX) * circumference

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={`${label}: ${clamped} of ${MAX}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-line"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className="text-acc tp-press"
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="font-mono text-[32px] font-semibold leading-none tracking-[-0.05em] text-ink">
          {clamped}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">{label}</p>
        {caption ? <p className="mt-1 text-[11px] text-mute">{caption}</p> : null}
      </div>
    </div>
  )
}
