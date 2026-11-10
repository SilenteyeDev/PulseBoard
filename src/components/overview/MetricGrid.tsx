import { ArrowUpRight, CircleDollarSign, CreditCard, ShoppingCart, Sparkles, Users } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Metric } from '../../types/dashboard'
import { TrendBadge } from '../ui/TrendBadge'

type MetricGridProps = {
  metrics: Metric[]
  onSelect: (metric: Metric) => void
}

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  mrr: CircleDollarSign,
  customers: Users,
  conversion: ShoppingCart,
  arpa: CreditCard,
}

export function MetricGrid({ metrics, onSelect }: MetricGridProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
      {metrics.map((metric) => {
        const Icon = ICONS[metric.key] ?? Sparkles
        return (
          <button
            key={metric.key}
            type="button"
            onClick={() => onSelect(metric)}
            className="tp-press group rounded-theme border border-line bg-surf p-4 text-left hover:border-acc/50"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-mute">{metric.label}</p>
              <span className="text-mute transition-colors duration-[var(--tp-dur)] group-hover:text-acc">
                <Icon size={15} />
              </span>
            </div>
            <p className="mt-4 font-mono text-[26px] font-semibold leading-none tracking-[-0.04em] text-ink">
              {metric.value}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <TrendBadge trend={metric.trend} delta={metric.delta} />
              <ArrowUpRight
                size={14}
                className="text-line transition-colors duration-[var(--tp-dur)] group-hover:text-acc"
                aria-hidden="true"
              />
            </div>
          </button>
        )
      })}
    </section>
  )
}
