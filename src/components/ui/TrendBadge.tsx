import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { Metric } from '../../types/dashboard'

type TrendBadgeProps = {
  trend: Metric['trend']
  delta: string
}

const trendClass: Record<Metric['trend'], string> = {
  up: 'text-acc',
  down: 'text-acc-2',
  flat: 'text-mute',
}

export function TrendBadge({ trend, delta }: TrendBadgeProps) {
  const Icon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium ${trendClass[trend]}`}>
      <Icon size={13} strokeWidth={2.5} aria-hidden="true" />
      {delta}
    </span>
  )
}
