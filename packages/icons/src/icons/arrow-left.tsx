import { Icon } from '../components/icon'
import { IconProps } from '../types'

export const ArrowLeft: React.FC<IconProps> = ({
  color = 'currentColor',
  ...props
}) => {
  return (
    <Icon viewBox="0 0 12 12" fill="none" color={color} {...props}>
      <path
        d="M11 6H1M1 6L6 1M1 6L6 11"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  )
}
ArrowLeft.displayName = 'ArrowLeft'
