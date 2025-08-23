import { colors, fontSizes } from '@task-sync/design-tokens'
import { clsx } from 'clsx'
import { createElement } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export const textElements = [
  'p',
  'span',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'em',
  'small',
  'mark',
  'del',
  'ins',
  'sub',
  'sup',
] as const

export interface TextProps {
  as?: (typeof textElements)[number]
  className?: string
  size?: keyof typeof fontSizes
  color?: string
  children: React.ReactNode
}

export function Text({
  as = 'p',
  className,
  children,
  size = 'base',
  color = colors.foreground,
  ...props
}: TextProps & React.HTMLAttributes<HTMLElement>) {
  const ariaLabel =
    props['aria-label'] ??
    (typeof children === 'string' && children.length > 0 ? children : undefined)

  return createElement(
    as,
    {
      className: clsx('text', className),
      style: { fontSize: fontSizes[size], color },
      'aria-label': ariaLabel,
      ...props,
    },
    children,
  )
}
