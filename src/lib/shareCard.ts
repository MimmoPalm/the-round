import { AMBER, FOAM, GLASS_PATH, FOAM_PATH } from './pintIcon'
import type { PlayerStats } from './stats'

/**
 * Client-side milestone share card — a 1080x1080 PNG rendered on a plain
 * <canvas>, no server round trip and no extra assets: the pint mark reuses
 * the same SVG path data as the rest of the app (lib/pintIcon.ts) drawn
 * straight onto the canvas via Path2D, and text uses the Fraunces/Inter/
 * JetBrains Mono families already loaded by index.html.
 */

const SIZE = 1080
const CREAM = '#F6F1E7'
const BRASS = '#A8793E'
const INK = '#16130E'
const INK_MUTED = 'rgba(22, 19, 14, 0.38)'
const TRACK = 'rgba(22, 19, 14, 0.1)'

const DISPLAY = 'Fraunces, Georgia, serif'
const SANS = 'Inter, ui-sans-serif, sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'

async function loadFonts() {
  const specs = [
    '600 30px Fraunces',
    '700 200px Fraunces',
    'italic 500 34px Fraunces',
    '600 22px Inter',
    '700 26px Inter',
    '500 20px "JetBrains Mono"',
  ]
  try {
    await Promise.all(specs.map((spec) => document.fonts.load(spec)))
    await document.fonts.ready
  } catch {
    // best-effort — canvas falls back to the generic families above if a
    // webfont hasn't finished loading yet
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/** Draws uppercase text with letterspacing (canvas has no tracking API
 * that's reliably supported everywhere), centred on `cx`. */
function fillTracked(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, spacing: number) {
  const chars = [...text]
  const widths = chars.map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  let x = cx - total / 2
  const prevAlign = ctx.textAlign
  ctx.textAlign = 'left'
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y)
    x += widths[i] + spacing
  })
  ctx.textAlign = prevAlign
}

/** The crest: ink + brass rings around the same pint-glass mark used on
 * the map pins, list rows and the homepage logo. */
function drawMark(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save()
  ctx.translate(cx, cy)

  ctx.beginPath()
  ctx.arc(0, 0, 82, 0, Math.PI * 2)
  ctx.strokeStyle = INK
  ctx.globalAlpha = 0.14
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, 0, 68, 0, Math.PI * 2)
  ctx.strokeStyle = BRASS
  ctx.globalAlpha = 0.55
  ctx.stroke()
  ctx.globalAlpha = 1

  // glass geometry is authored in a 32x34 box — centre + scale it into the crest
  const scale = 2.15
  ctx.translate(-16 * scale, -17 * scale)
  ctx.scale(scale, scale)
  const glass = new Path2D(GLASS_PATH)
  ctx.fillStyle = AMBER
  ctx.fill(glass)
  ctx.fillStyle = FOAM
  ctx.fill(new Path2D(FOAM_PATH))
  ctx.strokeStyle = INK
  ctx.lineWidth = 1.3
  ctx.lineJoin = 'round'
  ctx.stroke(glass)

  ctx.restore()
}

export async function renderShareCard(stats: PlayerStats): Promise<Blob> {
  await loadFonts()

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported on this device')

  ctx.fillStyle = CREAM
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  drawMark(ctx, SIZE / 2, 165)

  ctx.fillStyle = INK
  ctx.font = `600 32px ${DISPLAY}`
  fillTracked(ctx, 'THE ROUND', SIZE / 2, 272, 4)

  ctx.fillStyle = INK_MUTED
  ctx.font = `500 15px ${SANS}`
  fillTracked(ctx, 'ISLINGTON & HACKNEY PUB TRACKER', SIZE / 2, 300, 2.5)

  ctx.strokeStyle = BRASS
  ctx.globalAlpha = 0.4
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(SIZE / 2 - 60, 326)
  ctx.lineTo(SIZE / 2 + 60, 326)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.fillStyle = 'rgba(22, 19, 14, 0.6)'
  ctx.font = `italic 500 34px ${DISPLAY}`
  ctx.fillText(stats.player, SIZE / 2, 380)

  ctx.fillStyle = INK
  ctx.font = `700 230px ${DISPLAY}`
  ctx.fillText(String(stats.count), SIZE / 2, 640)

  ctx.fillStyle = INK_MUTED
  ctx.font = `600 24px ${SANS}`
  fillTracked(ctx, 'PUBS TICKED', SIZE / 2, 682, 3)

  if (stats.tierName) {
    const label = stats.tierName.toUpperCase()
    ctx.font = `700 26px ${SANS}`
    const textW = ctx.measureText(label).width + label.length * 3
    const pillW = textW + 60
    const pillH = 56
    const pillX = SIZE / 2 - pillW / 2
    const pillY = 726
    roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2)
    ctx.fillStyle = BRASS
    ctx.fill()
    ctx.fillStyle = CREAM
    fillTracked(ctx, label, SIZE / 2, pillY + pillH / 2 + 9, 3)
  }

  const barW = 760
  const barX = SIZE / 2 - barW / 2
  let y = 852
  for (const council of stats.councils) {
    const pct = council.total ? Math.min(1, council.visited / council.total) : 0

    ctx.textAlign = 'left'
    ctx.fillStyle = INK
    ctx.font = `600 23px ${SANS}`
    ctx.fillText(council.name, barX, y)

    ctx.textAlign = 'right'
    ctx.fillStyle = INK_MUTED
    ctx.font = `500 20px ${MONO}`
    ctx.fillText(`${council.visited}/${council.total}`, barX + barW, y)

    const trackY = y + 16
    const trackH = 14
    roundRect(ctx, barX, trackY, barW, trackH, trackH / 2)
    ctx.fillStyle = TRACK
    ctx.fill()
    if (pct > 0) {
      roundRect(ctx, barX, trackY, Math.max(trackH, barW * pct), trackH, trackH / 2)
      ctx.fillStyle = BRASS
      ctx.fill()
    }
    y += 80
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = INK_MUTED
  ctx.font = `500 19px ${MONO}`
  ctx.fillText('the-round-brown.vercel.app', SIZE / 2, SIZE - 56)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Could not generate the share card'))
    }, 'image/png')
  })
}
