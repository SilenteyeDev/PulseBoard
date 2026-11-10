const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat('en-US')

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatCompactCurrency(value: number): string {
  return `$${compactFormatter.format(value)}`
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** "$64,200" -> 64200 */
export function parseAmount(formatted: string): number {
  const digits = formatted.replace(/[^0-9.-]/g, '')
  const parsed = Number(digits)
  return Number.isFinite(parsed) ? parsed : 0
}

export function sharePercent(part: number, total: number): number {
  if (total <= 0) {
    return 0
  }
  return Math.round((part / total) * 100)
}

export function sumBy<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((total, item) => total + pick(item), 0)
}

export function formatUpdatedAt(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return 'Just now'
  }
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function greetingFor(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) {
    return 'Good morning'
  }
  if (hour < 18) {
    return 'Good afternoon'
  }
  return 'Good evening'
}

export function firstNameOf(value: string | null | undefined): string {
  const clean = (value ?? '').trim()
  if (!clean) {
    return 'there'
  }
  return clean.split(/[\s@._-]+/)[0] || 'there'
}
