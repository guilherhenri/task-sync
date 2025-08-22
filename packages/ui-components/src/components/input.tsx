import '../styles/components/_input.scss'

import { clsx } from 'clsx'

export interface InputProps {
  hasError?: boolean
  hasIcon?: boolean
  isFilled?: boolean
}

export function Input({
  hasError = false,
  hasIcon = false,
  type = 'text',
  isFilled = false,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: React.ComponentProps<'input'> & InputProps) {
  return (
    <input
      type={type}
      className={clsx(
        'input',
        { 'input--error': hasError },
        { 'input--icon': hasIcon },
        { 'input--filled': isFilled },
        className,
      )}
      id={id}
      aria-label={ariaLabel}
      aria-describedby={
        hasError ? ariaDescribedBy || 'error-message' : ariaDescribedBy
      }
      aria-invalid={hasError}
      {...props}
    />
  )
}
