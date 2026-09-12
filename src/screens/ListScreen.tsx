import { useMemo, useState } from 'react'
import type { Council, DrunkFilter, Pub } from '../lib/types'
import { PintIcon } from '../components/PintIcon'
import { BottomSheet } from '../components/BottomSheet'
import { PubDetail } from '../components/PubDetail'
import { SearchIcon } from '../components/icons'
import { DRUNK_FILTER_LABELS } from '../lib/copy'
import { groupByPostcode } from '../lib/pubGroups'

type CouncilFilter = 'all' | Council

const FILTERS: { id: DrunkFilter; label: string }[] = (['all', 'drunk', 'not'] as DrunkFilter[]).map((id) => ({
  id,
  label: DRUNK_FILTER_LABELS[id],
}))

const COUNCIL_FILTERS: { id: CouncilFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Islington', label: 'Islington' },
  { id: 'Hackney', label: 'Hackney' },
]

export function ListScreen({
  pubs,
  visitedIds,
  pending,
  onToggle,
}: {
  pubs: Pub[]
  visitedIds: Set<string>
  pending: Set<string>
  onToggle: (pubId: string) => void
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<DrunkFilter>('all')
  const [council, setCouncil] = useState<CouncilFilter>('all')
  const [selected, setSelected] = useState<Pub | null>(null)

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = pubs.filter((p) => {
      if (council !== 'all' && p.council !== council) return false
      if (filter === 'drunk' && !visitedIds.has(p.id)) return false
      if (filter === 'not' && visitedIds.has(p.id)) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.postcode.toLowerCase().includes(q)
      )
    })

    return groupByPostcode(filtered)
  }, [pubs, query, filter, council, visitedIds])

  const total = pubs.length
  const shown = groups.reduce((n, [, list]) => n + list.length, 0)

  return (
    <div className="min-h-[100dvh] bg-bg pb-32">
      <div className="sticky top-0 z-20 border-b border-border bg-bg/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="relative">
          <SearchIcon
            width={17}
            height={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pubs, streets, postcodes…"
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-brass focus:outline-none"
          />
        </div>
        <div className="mt-2.5 flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors ${
                filter === f.id ? 'bg-ink text-bg' : 'bg-surface text-ink-secondary border border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto flex items-center font-mono text-[12px] text-ink-muted">
            {shown}/{total}
          </span>
        </div>
        <div className="mt-2 flex gap-1.5">
          {COUNCIL_FILTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCouncil(c.id)}
              className={`h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors ${
                council === c.id ? 'bg-brass text-bg' : 'bg-surface text-ink-secondary border border-border'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="px-5 py-10 text-center text-[14px] text-ink-muted">No pubs match that.</p>
      ) : (
        groups.map(([postcode, list]) => (
          <section key={postcode}>
            <h3 className="sticky top-[139px] z-10 border-b border-border bg-bg/95 px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted backdrop-blur">
              {postcode} <span className="text-ink-muted/70">· {list.length}</span>
            </h3>
            <ul className="divide-y divide-border">
              {list.map((pub) => {
                const visited = visitedIds.has(pub.id)
                return (
                  <li key={pub.id} className="flex items-stretch">
                    <button
                      type="button"
                      onClick={() => onToggle(pub.id)}
                      disabled={pending.has(pub.id)}
                      aria-label={visited ? `Mark ${pub.name} as not drunk there` : `Mark ${pub.name} as drunk there`}
                      className="flex w-14 flex-shrink-0 items-center justify-center disabled:opacity-50"
                    >
                      <PintIcon visited={visited} size={24} className={visited ? 'animate-tick-pop' : ''} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelected(pub)}
                      className="flex min-h-11 flex-1 flex-col justify-center py-2 pr-4 text-left"
                    >
                      <span className="text-[15px] leading-tight text-ink">{pub.name}</span>
                      <span className="mt-0.5 text-[12.5px] leading-tight text-ink-secondary">
                        {pub.address || 'address unknown'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}

      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected ? (
          <PubDetail
            pub={selected}
            visited={visitedIds.has(selected.id)}
            pending={pending.has(selected.id)}
            onToggle={() => onToggle(selected.id)}
            pubs={pubs}
            visitedIds={visitedIds}
          />
        ) : null}
      </BottomSheet>
    </div>
  )
}
