import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'accent' | 'quiet' | 'solid'

type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

const toneClass: Record<BadgeTone, string> = {
  neutral: 'border-line bg-surf-2 text-ink',
  accent: 'border-acc/40 bg-acc/12 text-acc',
  quiet: 'border-line bg-transparent text-mute',
  solid: 'border-transparent bg-acc text-acc-ink',
}

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-theme-btn border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Dot({ className = 'bg-acc' }: { className?: string }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${className}`} aria-hidden="true" />
}
