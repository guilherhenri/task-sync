import { Icon } from '../components/icon'
import { IconProps } from '../types'

export const Check: React.FC<IconProps> = ({
  color = 'currentColor',
  ...props
}) => {
  return (
    <Icon viewBox="0 0 14 10" fill="none" color={color} {...props}>
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m1 5 4 4 8-8"
      ></path>
    </Icon>
  )
}
Check.displayName = 'Check'
