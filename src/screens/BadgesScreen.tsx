import { useMemo } from 'react'
import type { Pub } from '../lib/types'
import { CrownIcon } from '../components/icons'

export function BadgesScreen({ pubs, visitedIds }: { pubs: Pub[]; visitedIds: Set<string> }) {
  const districts = useMemo(() => {
    const map = new Map<string, Pub[]>()
    for (const p of pubs) {
      if (!p.postcode) continue
      const key = p.postcode.split(' ')[0]
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    return [...map.entries()]
      .map(([postcode, list]) => {
        const visited = list.filter((p) => visitedIds.has(p.id)).length
        return { postcode, total: list.length, visited, earned: visited === list.length }
      })
      .sort((a, b) => a.postcode.localeCompare(b.postcode))
  }, [pubs, visitedIds])

  const earnedCount = districts.filter((d) => d.earned).length
  const totalVisited = visitedIds.size
  const pctConquered = pubs.length ? ((totalVisited / pubs.length) * 100).toFixed(1) : '0.0'
  const favourite = useMemo(() => {
    let best: { postcode: string; visited: number } | null = null
    for (const d of districts) {
      if (d.visited > 0 && (!best || d.visited > best.visited)) best = { postcode: d.postcode, visited: d.visited }
    }
    return best
  }, [districts])

  return (
    <div className="min-h-[100dvh] bg-bg pb-32">
      <header className="px-5 pb-4 pt-6">
        <h1 className="font-display text-[28px] font-semibold text-ink">Badges</h1>
        <p className="mt-1 text-[13.5px] text-ink-secondary">
          Earn a crown by ticking off every pub in a postcode.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <Stat label="Crowns" value={`${earnedCount}/${districts.length}`} />
          <Stat label="Conquered" value={`${pctConquered}%`} />
          <Stat label="Favourite" value={favourite ? favourite.postcode : '—'} />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3 px-5 sm:grid-cols-4">
        {districts.map((d) => (
          <div
            key={d.postcode}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3.5 ${
              d.earned ? 'border-brass bg-brass-wash' : 'border-border bg-surface'
            }`}
          >
            <CrownIcon
              width={26}
              height={26}
              className={d.earned ? 'text-brass' : 'text-ink-muted'}
              style={d.earned ? { fill: 'var(--color-brass)', fillOpacity: 0.18 } : undefined}
            />
            <span className="font-mono text-[13px] font-medium text-ink">{d.postcode}</span>
            <span className="font-mono text-[10.5px] text-ink-muted">
              {d.visited}/{d.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
      <p className="font-mono text-[16px] font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-[10.5px] uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  )
}
