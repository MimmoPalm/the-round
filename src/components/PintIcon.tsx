import { pintIconSvg, PINT_ASPECT } from '../lib/pintIcon'

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
      style={{ display: 'inline-flex', width: size, height: size * PINT_ASPECT }}
      dangerouslySetInnerHTML={{ __html: pintIconSvg({ visited, size }) }}
      aria-hidden="true"
    />
  )
}
