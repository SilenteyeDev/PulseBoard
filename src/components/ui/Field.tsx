import type { InputHTMLAttributes, ReactNode } from 'react'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon?: ReactNode
  trailing?: ReactNode
}

/** Input row: label, themed well, optional leading icon and trailing control. */
export function Field({ label, icon, trailing, className = '', id, ...rest }: FieldProps) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  return (
    <label htmlFor={inputId} className="block text-[12px] font-medium text-mute">
      {label}
      <span className="relative mt-2 block">
        {icon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute">{icon}</span>
        ) : null}
        <input
          id={inputId}
          className={`min-h-11 w-full rounded-theme-sm border border-line bg-surf-2 py-3 pr-3 text-sm text-ink outline-none transition placeholder:text-mute/70 focus:border-acc/60 focus:ring-2 focus:ring-acc/20 ${
            icon ? 'pl-10' : 'pl-3.5'
          } ${trailing ? 'pr-11' : ''} ${className}`}
          {...rest}
        />
        {trailing ? <span className="absolute right-2.5 top-1/2 -translate-y-1/2">{trailing}</span> : null}
      </span>
    </label>
  )
}
