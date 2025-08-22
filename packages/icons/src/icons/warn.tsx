import { Icon } from '../components/icon'
import { IconProps } from '../types'

export const Warn: React.FC<IconProps> = ({
  color = 'currentColor',
  ...props
}) => {
  return (
    <Icon viewBox="0 0 2 12" fill="none" color={color} {...props}>
      <path
        d="M2 10.8292C2 11.4758 1.55228 12 1 12C0.447715 12 0 11.4758 0 10.8292C0 10.1826 0.447715 9.65845 1 9.65845C1.55228 9.65845 2 10.1826 2 10.8292Z"
        fill={color}
      />
      <path
        d="M0 0.877652V6.73152C0 7.90283 2 7.90283 2 6.73152V0.877717C2 -0.292536 0 -0.292588 0 0.877652Z"
        fill={color}
      />
    </Icon>
  )
}
Warn.displayName = 'Warn'
