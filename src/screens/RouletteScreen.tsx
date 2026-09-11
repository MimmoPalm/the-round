import { useState } from 'react'
import type { Pub } from '../lib/types'
import { distanceKm, formatDistance, getCurrentPosition, HOME } from '../lib/geo'
import { PintIcon } from '../components/PintIcon'
import { CompassIcon, DiceIcon } from '../components/icons'

const LINES = [
  "Decision fatigue is real. We've made this one for you.",
  "No thinking required. Just walking.",
  'Your round, chosen by the fickle hand of fate.',
  "Don't overthink it — it's a pub, not a pension.",
  'The house always wins. Tonight, the house is buying.',
]

function pickLine(seed: number) {
  return LINES[seed % LINES.length]
}

export function RouletteScreen({
  pubs,
  visitedIds,
  onOpenPub,
}: {
  pubs: Pub[]
  visitedIds: Set<string>
  onOpenPub: (pub: Pub) => void
}) {
  const [pick, setPick] = useState<Pub | null>(null)
  const [origin, setOrigin] = useState<{ lat: number; lon: number; label: string }>({
    ...HOME,
    label: 'home',
  })
  const [spins, setSpins] = useState(0)
  const [locating, setLocating] = useState(false)

  const unvisited = pubs.filter((p) => !visitedIds.has(p.id))

  const spin = (within?: { lat: number; lon: number; label: string }) => {
    const o = within ?? origin
    if (within) setOrigin(within)
    const pool = unvisited.length > 0 ? unvisited : pubs
    // bias toward nearby pubs: take the 40 closest to origin, then pick randomly among them
    const nearest = [...pool]
      .sort((a, b) => distanceKm(o, a) - distanceKm(o, b))
      .slice(0, Math.min(40, pool.length))
    const choice = nearest[Math.floor(Math.random() * nearest.length)]
    setPick(choice ?? null)
    setSpins((n) => n + 1)
  }

  const useMyLocation = async () => {
    setLocating(true)
    const pos = await getCurrentPosition()
    setLocating(false)
    if (pos) {
      spin({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'you' })
    } else {
      spin({ ...HOME, label: 'home' })
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-bg px-5 pb-32 pt-8">
      <header className="text-center">
        <div className="flex justify-center">
          <DiceIcon width={30} height={30} className="text-brass" />
        </div>
        <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">Pint Roulette</h1>
        <p className="mt-1 text-[13.5px] text-ink-secondary">
          {unvisited.length} unvisited pub{unvisited.length === 1 ? '' : 's'} left to choose from.
        </p>
      </header>

      <div className="mt-8 flex-1">
        {pick ? (
          <div className="animate-banner-in rounded-2xl border border-border bg-surface p-6 text-center">
            <PintIcon visited={false} size={34} className="mx-auto" />
            <h2 className="mt-3 font-display text-[24px] font-semibold text-ink">{pick.name}</h2>
            <p className="mt-1 text-[13.5px] text-ink-secondary">
              {pick.address || 'address unknown'}
              {pick.postcode ? `, ${pick.postcode}` : ''}
            </p>
            <p className="mt-1.5 font-mono text-[12px] text-ink-muted">
              {formatDistance(distanceKm(origin, pick))} from {origin.label}
            </p>
            <p className="mx-auto mt-4 max-w-[26ch] text-[13.5px] italic text-ink-secondary">
              {pickLine(spins)}
            </p>

            <div className="mt-5 flex gap-2.5">
              <a
                href={`https://www.openstreetmap.org/?mlat=${pick.lat}&mlon=${pick.lon}#map=18/${pick.lat}/${pick.lon}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-ink text-[15px] font-medium text-bg"
              >
                Go there
              </a>
              <button
                type="button"
                onClick={() => onOpenPub(pick)}
                className="flex h-12 items-center justify-center rounded-xl border border-border px-4 text-[14px] font-medium text-ink-secondary"
              >
                Details
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-[13.5px] text-ink-muted">
            Spin to get your next round.
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2.5">
        <button
          type="button"
          onClick={() => spin()}
          className="h-12 w-full rounded-xl bg-brass text-[15px] font-medium text-bg transition-transform active:scale-[0.98]"
        >
          {pick ? 'Spin again' : 'Spin'}
        </button>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-border text-[13.5px] font-medium text-ink-secondary disabled:opacity-50"
        >
          <CompassIcon width={16} height={16} />
          {locating ? 'Finding you…' : 'Near me instead'}
        </button>
      </div>
    </div>
  )
}
