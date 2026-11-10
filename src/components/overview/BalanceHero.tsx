import { Check, Minus, TrendingUp } from 'lucide-react'
import type { DashboardPayload } from '../../types/dashboard'
import { checklistFor, healthScore, latestGrowth, mrrMovement, priorGrowth } from '../../lib/insights'
import { RingGauge } from '../ui/RingGauge'
import { TrendBadge } from '../ui/TrendBadge'
import { Plate } from '../ui/Plate'

type BalanceHeroProps = {
  data: DashboardPayload
  onOpenMetric: (key: string) => void
}

export function BalanceHero({ data, onOpenMetric }: BalanceHeroProps) {
  const mrrMetric = data.metrics.find((metric) => metric.key === 'mrr') ?? data.metrics[0]
  const score = healthScore(data)
  const checklist = checklistFor(data)
  const movement = mrrMovement(data)
  const latest = latestGrowth(data)
  const prior = priorGrowth(data)
  const growthRate = latest && prior && prior.mrr > 0 ? ((latest.mrr - prior.mrr) / prior.mrr) * 100 : 0
  const peak = Math.max(...data.growth.map((point) => point.mrr), 1)

  return (
    <Plate as="section" className="relative overflow-hidden p-5 lg:p-6">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Balance · this month</p>

          <button
            type="button"
            onClick={() => onOpenMetric(mrrMetric.key)}
            className="tp-press mt-3 block max-w-full text-left"
            aria-label={`Open ${mrrMetric.label} detail`}
          >
            <span className="tp-display block break-words text-[clamp(2.6rem,9vw,5.25rem)] text-ink">
              {mrrMetric.value}
            </span>
          </button>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <TrendBadge trend={mrrMetric.trend} delta={mrrMetric.delta} />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
              {mrrMetric.label}
            </span>
          </div>

          <div className="mt-6 flex items-end gap-1.5" aria-hidden="true">
            {data.growth.map((point, index) => {
              const height = Math.max(8, Math.round((point.mrr / peak) * 64))
              const isLast = index === data.growth.length - 1
              return (
                <span
                  key={point.month}
                  className={`w-full max-w-9 rounded-theme-sm ${
                    isLast ? '[background-image:var(--tp-grad)]' : 'bg-surf-2'
                  }`}
                  style={{ height }}
                />
              )
            })}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-mute">
            <span>{data.growth[0]?.month ?? '—'}</span>
            <span>{latest?.month ?? '—'}</span>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-4">
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-mute">MoM</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-ink">
                {movement >= 0 ? '+' : ''}
                {movement}k
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-mute">Growth</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-ink">{growthRate.toFixed(1)}%</dd>
            </div>
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-mute">Churn</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-ink">{latest?.churn ?? 0}%</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <RingGauge value={score} label="Health" caption={score >= 70 ? 'Steady' : 'Watch'} />
          <ul className="w-full max-w-[16rem] space-y-2">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-theme-btn border ${
                    item.done ? 'border-transparent bg-acc text-acc-ink' : 'border-line text-mute'
                  }`}
                >
                  {item.done ? <Check size={10} strokeWidth={3} /> : <Minus size={10} />}
                </span>
                <span className="min-w-0">
                  <span className={`block text-xs font-medium ${item.done ? 'text-ink' : 'text-mute'}`}>
                    {item.label}
                  </span>
                  <span className="block font-mono text-[10px] tracking-[0.02em] text-mute">{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-mute">
            <TrendingUp size={11} className="text-acc" /> {data.growth.length} periods tracked
          </p>
        </div>
      </div>
    </Plate>
  )
}
