import { pintIconSvg } from '../lib/pintIcon'

export function PintIcon({
  visited,
  size = 22,
  className,
}: {
  visited: boolean
  size?: number
  className?: string
}) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', width: size, height: size * 1.3 }}
      dangerouslySetInnerHTML={{ __html: pintIconSvg({ visited, size }) }}
      aria-hidden="true"
    />
  )
}
