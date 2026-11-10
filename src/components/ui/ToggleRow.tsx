import type { ReactNode } from 'react'

type ToggleRowProps = {
  label: string
  description: string
  icon?: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}

/** Full-row switch: 44px+ target, accent track when on. */
export function ToggleRow({ label, description, icon, checked, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="tp-press flex w-full items-center justify-between gap-4 rounded-theme border border-line bg-surf-2 px-4 py-3.5 text-left hover:border-acc/40"
    >
      <span className="flex min-w-0 items-center gap-3">
        {icon ? <span className={checked ? 'text-acc' : 'text-mute'}>{icon}</span> : null}
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">{label}</span>
          <span className="mt-0.5 block text-xs leading-5 text-mute">{description}</span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-theme-btn transition-colors duration-[var(--tp-dur)] ${
          checked ? 'bg-acc' : 'bg-line'
        }`}
      >
        <span
          className={`inline-block h-4.5 w-4.5 rounded-theme-btn bg-bg transition-transform duration-[var(--tp-dur)] ${
            checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
          }`}
        />
      </span>
    </button>
  )
}
