import '../styles/components/_checkbox.scss'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from '@task-sync/icons'
import { clsx } from 'clsx'

export function Checkbox({
  className,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={clsx('checkbox', className)}
      id={id}
      aria-label={ariaLabel || 'Checkbox'}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="checkbox__indicator"
      >
        <Check
          className="checkbox__indicator__icon"
          role="img"
          aria-hidden="true"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
