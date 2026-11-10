import type { ButtonHTMLAttributes, ReactNode } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  children: ReactNode
  active?: boolean
}

export function IconButton({ label, children, active = false, className = '', type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`tp-press grid h-9 w-9 shrink-0 place-items-center rounded-theme-btn border ${
        active
          ? 'border-acc/60 bg-acc/12 text-acc'
          : 'border-line bg-transparent text-mute hover:border-acc/40 hover:text-ink'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
