/**
 * Bespoke two-tone pint-glass icon, shared by the Leaflet markers (as a
 * raw SVG string for L.divIcon) and the React <PintIcon> used in
 * list rows / the bottom sheet. Brass fill = visited, ink outline = unvisited.
 *
 * Geometry is a UK "nonic" pint: the signature outward bulge sits just
 * below the rim and the body tapers to a narrower foot, plus a side
 * handle so the silhouette reads instantly at marker sizes.
 */

const VIEW_W = 32
const VIEW_H = 28 // trimmed tight to the glass itself — the shadow bleeds outside via the filter region, not extra viewBox padding
export const PINT_ASPECT = VIEW_H / VIEW_W

const GLASS_PATH =
  'M8,0 L24,0 C24.9,1.6 25.5,3.1 25.5,5 C25.5,7 23.9,8.4 22.3,9.5 L21.5,28 L10.5,28 L9.7,9.5 C8.1,8.4 6.5,7 6.5,5 C6.5,3.1 7.1,1.6 8,0 Z'
const HANDLE_PATH =
  'M22.4,11.2 C28,10.9 29.6,14.3 29.5,16.8 C29.4,19.3 27.7,22.6 21.2,22.2'

export function pintIconSvg(opts: { visited: boolean; size?: number }): string {
  const { visited, size = 40 } = opts
  const brass = '#A8793E'
  const ink = '#16130E'
  const color = visited ? brass : ink
  const glassFill = visited ? brass : 'none'
  const h = size * PINT_ASPECT
  const shadowId = `pint-shadow-${visited ? 'v' : 'u'}`
  return `
<svg width="${size}" height="${h}" viewBox="0 0 ${VIEW_W} ${VIEW_H}" fill="none" overflow="visible" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#${shadowId})">
    <path d="${GLASS_PATH}" fill="${glassFill}" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="${HANDLE_PATH}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
  </g>
  <defs>
    <filter id="${shadowId}" x="-40%" y="-25%" width="180%" height="160%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="${ink}" flood-opacity="0.32"/>
    </filter>
  </defs>
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
