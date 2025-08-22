import { Icon } from '../components/icon'
import { IconProps } from '../types'

export const X: React.FC<IconProps> = ({
  color = 'currentColor',
  ...props
}) => {
  return (
    <Icon viewBox="0 0 12 12" fill="none" color={color} {...props}>
      <path
        d="M11 1.00004L1 11M0.999958 1L10.9999 11"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Icon>
  )
}
X.displayName = 'X'
