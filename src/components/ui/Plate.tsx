import type { ReactNode } from 'react'

export type PlateTone = 'surface' | 'sunken' | 'accent'

type PlateElement = 'div' | 'section' | 'article' | 'aside'

type PlateProps = {
  children: ReactNode
  className?: string
  tone?: PlateTone
  as?: PlateElement
}

const toneClass: Record<PlateTone, string> = {
  surface: 'bg-surf border-line text-ink',
  sunken: 'bg-surf-2 border-line text-ink',
  accent: 'border-transparent text-acc-ink [background-image:var(--tp-grad)]',
}

const baseClass = 'rounded-theme border'

export function Plate({ children, className = '', tone = 'surface', as = 'div' }: PlateProps) {
  const Tag = as
  return <Tag className={`${baseClass} ${toneClass[tone]} ${className}`}>{children}</Tag>
}

type PlateHeaderProps = {
  kicker: string
  title: string
  action?: ReactNode
  className?: string
}

export function PlateHeader({ kicker, title, action, className = '' }: PlateHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">{kicker}</p>
        <h3 className="mt-1.5 truncate text-base font-semibold tracking-tight text-ink">{title}</h3>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
