import '../styles/components/_button.scss'

import { clsx } from 'clsx'

export interface ButtonProps {
  variant?: 'primary'
  size?: 'default'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  className,
  'aria-label': ariaLabel,
  children,
  ...props
}: React.ComponentProps<'button'> & ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'btn',
        { 'btn--primary': variant === 'primary' },
        { 'btn--full': fullWidth },
        className,
      )}
      aria-label={
        ariaLabel || (typeof children === 'string' ? children : undefined)
      }
      {...props}
    >
      {children}
    </button>
  )
}
