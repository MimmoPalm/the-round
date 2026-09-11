/**
 * Bespoke pint-of-beer icon, shared by the Leaflet markers (as a raw SVG
 * string for L.divIcon), the React <PintIcon> used in list rows / the
 * bottom sheet / start screen, and the homepage <Logo> crest — one
 * geometry, reused everywhere so the map and the rest of the UI never
 * drift apart visually.
 *
 * Geometry is a classic English straight pint glass: a gentle taper from
 * a wide rim to a narrower foot, no nonic bulge, no handle. Unticked =
 * empty ink outline. Ticked = the same glass filled with amber beer and
 * a small foam head.
 */

const VIEW_W = 32
const VIEW_H = 34 // trimmed tight to the glass itself — shadow bleeds outside via the filter region, not extra viewBox padding
export const PINT_ASPECT = VIEW_H / VIEW_W

export const INK = '#16130E'
export const AMBER = '#E8A33D'
export const FOAM = '#FFF8E9'

/** Rounded-trapezoid outline: wide rim, gentle taper, narrow foot. */
export const GLASS_PATH =
  'M7.10,4.60 Q7.00,3.00 8.60,3.00 L23.40,3.00 Q25.00,3.00 24.90,4.60 L23.10,32.40 Q23.00,34.00 21.40,34.00 L10.60,34.00 Q9.00,34.00 8.90,32.40 Z'

/** Wavy foam cap, clipped to the glass outline above the beer line. */
const FOAM_PATH =
  'M6.7,3 L25.3,3 L25.0,9.4 C22.8,8.1 21.2,10.3 18.6,9.2 C16.1,8.1 14.3,10.4 11.8,9.3 C9.7,8.3 8.2,9.9 6.9,9.0 Z'

export function pintIconSvg(opts: { visited: boolean; size?: number }): string {
  const { visited, size = 40 } = opts
  const h = size * PINT_ASPECT
  const shadowId = `pint-shadow-${visited ? 'v' : 'u'}`
  const clipId = `pint-clip-${visited ? 'v' : 'u'}`

  const beer = visited
    ? `<g clip-path="url(#${clipId})">
        <rect x="5" y="8" width="22" height="27" fill="${AMBER}"/>
        <path d="${FOAM_PATH}" fill="${FOAM}"/>
        <circle cx="12" cy="7" r="0.55" fill="${FOAM}" opacity="0.9"/>
        <circle cx="19" cy="6.2" r="0.4" fill="${FOAM}" opacity="0.8"/>
      </g>`
    : ''

  return `
<svg width="${size}" height="${h}" viewBox="0 0 ${VIEW_W} ${VIEW_H}" fill="none" overflow="visible" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="${clipId}"><path d="${GLASS_PATH}"/></clipPath>
    <filter id="${shadowId}" x="-40%" y="-25%" width="180%" height="160%">
      <feDropShadow dx="0" dy="0.6" stdDeviation="0.7" flood-color="${INK}" flood-opacity="0.3"/>
    </filter>
  </defs>
  <g filter="url(#${shadowId})">
    ${beer}
    <path d="${GLASS_PATH}" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
  </g>
</svg>`.trim()
}

/**
 * Pixel geometry for the Leaflet divIcon: pads the artwork out to at
 * least a 44px touch target (Apple/Material minimum) without inflating
 * the glass itself past a sensible marker size, and keeps the anchor
 * pinned to the true bottom-centre of the glass rather than the padded
 * hit box.
 */
const MIN_HIT_SIZE = 44

export function pintMarkerLayout(size = 40) {
  const w = size
  const h = size * PINT_ASPECT
  const boxW = Math.max(MIN_HIT_SIZE, w)
  const boxH = Math.max(MIN_HIT_SIZE, h)
  return { w, h, boxW, boxH }
}

export function pintMarkerHtml(opts: { visited: boolean; size?: number }): string {
  const { visited, size = 40 } = opts
  const { boxW, boxH } = pintMarkerLayout(size)
  // Bottom-align + centre the glass inside the (possibly larger) hit box
  // so its foot stays flush with the box's bottom edge — that edge is
  // what we anchor the marker to.
  return `<div style="width:${boxW}px;height:${boxH}px;display:flex;align-items:flex-end;justify-content:center;">${pintIconSvg({ visited, size })}</div>`
}
