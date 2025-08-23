export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
  className?: string
}

export type IconComponent = React.FC<IconProps>
