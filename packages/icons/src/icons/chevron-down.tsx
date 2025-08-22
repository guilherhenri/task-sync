import { Icon } from '../components/icon'
import { IconProps } from '../types'

export const ChevronDown: React.FC<IconProps> = ({
  color = 'currentColor',
  ...props
}) => {
  return (
    <Icon viewBox="0 0 14 8" fill="none" color={color} {...props}>
      <path
        d="M1 1L7 7L13 1"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  )
}
ChevronDown.displayName = 'ChevronDown'
