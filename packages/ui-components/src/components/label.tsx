import '../styles/components/_label.scss'

import { clsx } from 'clsx'

export function Label({
  className,
  htmlFor,
  children,
  ...props
}: React.ComponentProps<'label'>) {
  return (
    <label
      className={clsx('label', className)}
      htmlFor={htmlFor}
      aria-label={
        props['aria-label'] ||
        (typeof children === 'string' ? children : undefined)
      }
      {...props}
    >
      {children}
    </label>
  )
}
