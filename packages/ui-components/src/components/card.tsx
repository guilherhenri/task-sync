import '../styles/components/_card.scss'

import clsx from 'clsx'

export function Card({
  className,
  role = 'region',
  'aria-label': ariaLabel,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx('card', className)}
      role={role}
      aria-label={
        ariaLabel ?? (props['aria-labelledby'] ? undefined : 'Card content')
      }
      {...props}
    />
  )
}
