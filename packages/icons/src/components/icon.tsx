import React from 'react'

import { IconProps } from '../types'

export const Icon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  className = '',
  children,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}
