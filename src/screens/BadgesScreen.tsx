import { useMemo } from 'react'
import type { Council, Pub } from '../lib/types'
import { CrownIcon } from '../components/icons'

const COUNCILS: Council[] = ['Islington', 'Hackney']

export function BadgesScreen({ pubs, visitedIds }: { pubs: Pub[]; visitedIds: Set<string> }) {
  const councils = useMemo(() => {
    return COUNCILS.map((name) => {
      const list = pubs.filter((p) => p.council === name)
      const visited = list.filter((p) => visitedIds.has(p.id)).length
      return { name, total: list.length, visited, earned: list.length > 0 && visited === list.length }
    })
  }, [pubs, visitedIds])

  const earnedCount = councils.filter((c) => c.earned).length
  const totalVisited = visitedIds.size
  const pctConquered = pubs.length ? ((totalVisited / pubs.length) * 100).toFixed(1) : '0.0'
  const favourite = useMemo(() => {
    let best: { name: Council; visited: number } | null = null
    for (const c of councils) {
      if (c.visited > 0 && (!best || c.visited > best.visited)) best = { name: c.name, visited: c.visited }
    }
    return best
  }, [councils])

  return (
    <div className="min-h-[100dvh] bg-bg pb-32">
      <header className="px-5 pb-4 pt-6">
        <h1 className="font-display text-[28px] font-semibold text-ink">Badges</h1>
        <p className="mt-1 text-[13.5px] text-ink-secondary">
          Earn a crown by ticking off every pub in a council.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <Stat label="Crowns" value={`${earnedCount}/${councils.length}`} />
          <Stat label="Conquered" value={`${pctConquered}%`} />
          <Stat label="Favourite" value={favourite ? favourite.name : '—'} />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 px-5">
        {councils.map((c) => {
          const pct = c.total ? Math.round((c.visited / c.total) * 100) : 0
          return (
            <div
              key={c.name}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-center ${
                c.earned ? 'border-brass bg-brass-wash' : 'border-border bg-surface'
              }`}
            >
              <CrownIcon
                width={32}
                height={32}
                className={c.earned ? 'text-brass' : 'text-ink-muted'}
                style={c.earned ? { fill: 'var(--color-brass)', fillOpacity: 0.18 } : undefined}
              />
              <span className="font-display text-[17px] font-semibold text-ink">{c.name}</span>
              <span className="font-mono text-[12px] text-ink-muted">
                {c.visited}/{c.total}
              </span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-brass transition-[width]" style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-[11.5px] font-medium ${c.earned ? 'text-brass' : 'text-ink-muted'}`}>
                {c.earned ? `${c.name} cleared` : `${pct}% cleared`}
              </span>
            </div>
          )
        })}
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
