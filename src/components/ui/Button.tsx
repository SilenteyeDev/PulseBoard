import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'solid'
export type ButtonSize = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-acc text-acc-ink hover:bg-acc-2',
  secondary: 'border-line bg-transparent text-ink hover:border-acc/50 hover:bg-surf-2',
  ghost: 'border-transparent bg-transparent text-mute hover:bg-surf-2 hover:text-ink',
  solid: 'border-transparent bg-surf-2 text-ink hover:bg-line',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`tp-press inline-flex min-h-9 items-center justify-center gap-2 rounded-theme-btn border font-medium disabled:pointer-events-none disabled:opacity-50 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
