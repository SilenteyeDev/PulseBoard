import type { DashboardPayload } from '../types/dashboard'
import { sharePercent, sumBy } from './format'

export type InsightTone = 'positive' | 'watch' | 'review'

export type Insight = {
  label: string
  evidence: string
  tone: InsightTone
  verdict: string
}

export type ChecklistItem = {
  label: string
  detail: string
  done: boolean
}

const CHURN_HEALTHY_LIMIT = 4
const CONCENTRATION_LIMIT = 40

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

export function latestGrowth(data: DashboardPayload) {
  return data.growth[data.growth.length - 1]
}

export function priorGrowth(data: DashboardPayload) {
  return data.growth[data.growth.length - 2]
}

export function mrrMovement(data: DashboardPayload): number {
  const latest = latestGrowth(data)
  const prior = priorGrowth(data)
  if (!latest || !prior) {
    return 0
  }
  return latest.mrr - prior.mrr
}

export function totalSignups(data: DashboardPayload): number {
  return sumBy(data.sources, (source) => source.signups)
}

export function leadingSource(data: DashboardPayload) {
  return [...data.sources].sort((left, right) => right.signups - left.signups)[0]
}

export function sourceShare(data: DashboardPayload): number {
  const leading = leadingSource(data)
  if (!leading) {
    return 0
  }
  return sharePercent(leading.signups, totalSignups(data))
}

/** 0-100 composite: expansion, retention and demand spread. */
export function healthScore(data: DashboardPayload): number {
  const latest = latestGrowth(data)
  const prior = priorGrowth(data)
  const growthRate = latest && prior && prior.mrr > 0 ? ((latest.mrr - prior.mrr) / prior.mrr) * 100 : 0
  const expansion = clamp(50 + growthRate * 4)
  const retention = clamp(100 - (latest?.churn ?? 0) * 10)
  const spread = clamp(120 - sourceShare(data) * 1.6)

  return Math.round(clamp(expansion * 0.4 + retention * 0.35 + spread * 0.25))
}

export function checklistFor(data: DashboardPayload): ChecklistItem[] {
  const latest = latestGrowth(data)
  const share = sourceShare(data)

  return [
    {
      label: 'Expansion is positive',
      detail: `+${mrrMovement(data)}k MRR since last month`,
      done: mrrMovement(data) > 0,
    },
    {
      label: `Churn under ${CHURN_HEALTHY_LIMIT}%`,
      detail: `${latest?.churn ?? 0}% this period`,
      done: (latest?.churn ?? 0) < CHURN_HEALTHY_LIMIT,
    },
    {
      label: `Acquisition under ${CONCENTRATION_LIMIT}%`,
      detail: `${share}% from ${leadingSource(data)?.source ?? 'primary source'}`,
      done: share < CONCENTRATION_LIMIT,
    },
  ]
}

export function insightsFor(data: DashboardPayload): Insight[] {
  const latest = latestGrowth(data)
  const share = sourceShare(data)
  const movement = mrrMovement(data)

  return [
    {
      label: 'Acquisition concentration',
      evidence: `${leadingSource(data)?.source ?? 'Primary source'} drives ${share}% of signups`,
      tone: share >= CONCENTRATION_LIMIT ? 'watch' : 'positive',
      verdict: share >= CONCENTRATION_LIMIT ? 'Watch' : 'Spread',
    },
    {
      label: 'Revenue momentum',
      evidence: `$${latest?.mrr ?? 0}k MRR at the latest snapshot, ${movement >= 0 ? '+' : ''}${movement}k month over month`,
      tone: movement >= 0 ? 'positive' : 'review',
      verdict: movement >= 0 ? 'Positive' : 'Review',
    },
    {
      label: 'Retention pressure',
      evidence: `${latest?.churn ?? 0}% churn in the latest period`,
      tone: (latest?.churn ?? 0) < CHURN_HEALTHY_LIMIT ? 'positive' : 'review',
      verdict: (latest?.churn ?? 0) < CHURN_HEALTHY_LIMIT ? 'Calm' : 'Review',
    },
  ]
}
