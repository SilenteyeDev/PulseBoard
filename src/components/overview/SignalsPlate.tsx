import { Activity } from 'lucide-react'
import type { DashboardPayload } from '../../types/dashboard'
import { insightsFor } from '../../lib/insights'
import type { InsightTone } from '../../lib/insights'
import { Plate, PlateHeader } from '../ui/Plate'

const TONE_CLASS: Record<InsightTone, string> = {
  positive: 'border-acc/40 bg-acc/12 text-acc',
  watch: 'border-acc-2/40 bg-acc-2/12 text-acc-2',
  review: 'border-acc-2/40 bg-acc-2/12 text-acc-2',
}

export function SignalsPlate({ data }: { data: DashboardPayload }) {
  const insights = insightsFor(data)

  return (
    <Plate as="article" className="p-5">
      <PlateHeader
        kicker="What moved"
        title="Signals worth a look"
        action={<Activity size={16} className="text-mute" aria-hidden="true" />}
      />

      <ul className="mt-5 divide-y divide-line">
        {insights.map((insight) => (
          <li key={insight.label} className="grid gap-2 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{insight.label}</p>
              <p className="mt-1 text-xs leading-5 text-mute">{insight.evidence}</p>
            </div>
            <span
              className={`w-fit rounded-theme-btn border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${TONE_CLASS[insight.tone]}`}
            >
              {insight.verdict}
            </span>
          </li>
        ))}
      </ul>
    </Plate>
  )
}
