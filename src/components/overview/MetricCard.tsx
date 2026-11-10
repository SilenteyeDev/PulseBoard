import { ArrowUpRight, ArrowDownRight, Minus, Maximize2 } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Metric } from '../../types/dashboard'

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  mrr: Maximize2,
  customers: Maximize2,
  conversion: Maximize2,
  arpa: Maximize2,
}

type MetricCardProps = {
  metric: Metric
  onSelect: () => void
}

export function MetricCard({ metric, onSelect }: MetricCardProps) {
  const Icon = ICONS[metric.key]

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`View ${metric.label} detail`}
      className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-400 hover:shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{metric.label}</p>
        {Icon ? <span className="text-slate-400"><Icon size={16} /></span> : null}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
      <div className="mt-2 flex items-center gap-1">
        <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-emerald-600' : metric.trend === 'down' ? 'text-rose-600' : 'text-slate-500'}`}>
          {metric.trend === 'up' ? <ArrowUpRight size={12} /> : metric.trend === 'down' ? <ArrowDownRight size={12} /> : <Minus size={12} />}
          {metric.delta}
        </span>
      </div>
      <Maximize2 size={13} className="mt-4 opacity-0 group-hover:opacity-100 transition text-slate-400" />
    </button>
  )
}
