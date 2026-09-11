/**
 * Bespoke two-tone pint-glass pin, shared by the Leaflet markers (as a
 * raw SVG string for L.divIcon) and the React <PintIcon> used in
 * list rows / the bottom sheet. Brass fill = visited, ink outline = unvisited.
 */
export function pintIconSvg(opts: { visited: boolean; size?: number }): string {
  const { visited, size = 28 } = opts
  const brass = '#A8793E'
  const ink = '#16130E'
  const fill = visited ? brass : 'none'
  const stroke = visited ? brass : ink
  return `
<svg width="${size}" height="${size * 1.3}" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 31c5.5-6.3 8.5-11.4 8.5-15.7C20.5 8.2 16.8 3 12 3S3.5 8.2 3.5 15.3C3.5 19.6 6.5 24.7 12 31Z" fill="${visited ? brass : '#FFFFFF'}" stroke="${ink}" stroke-width="1.3"/>
  <path d="M8.3 10.2h7.4l-0.85 9.6a1.3 1.3 0 0 1-1.3 1.2h-3.1a1.3 1.3 0 0 1-1.3-1.2l-0.85-9.6Z" fill="${fill === 'none' ? 'none' : '#F6F1E7'}" stroke="${stroke}" stroke-width="1.1" stroke-linejoin="round"/>
  <path d="M15.5 12h1.3a1.3 1.3 0 0 1 1.29 1.45l-0.32 2.9a1.3 1.3 0 0 1-1.29 1.15h-1.2" fill="none" stroke="${stroke}" stroke-width="1" stroke-linecap="round"/>
</svg>`.trim()
}
