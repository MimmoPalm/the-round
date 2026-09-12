import type { Pub } from '../lib/types'
import { PintIcon } from './PintIcon'
import { CheckIcon, CompassIcon, UndoIcon } from './icons'

export function PubDetail({
  pub,
  visited,
  pending,
  onToggle,
  pubs,
  visitedIds,
}: {
  pub: Pub
  visited: boolean
  pending?: boolean
  onToggle: () => void
  pubs: Pub[]
  visitedIds: Set<string>
}) {
  const councilPubs = pubs.filter((p) => p.council === pub.council)
  const councilVisited = councilPubs.filter((p) => visitedIds.has(p.id)).length
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${pub.lat},${pub.lon}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pub.lat},${pub.lon}`

  return (
    <div className="px-5 pb-2 pt-1">
      <div className="flex items-start gap-3">
        <PintIcon visited={visited} size={30} className={visited ? 'animate-tick-pop' : ''} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[21px] font-semibold leading-snug text-ink">{pub.name}</h2>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 block text-[14px] text-ink-secondary underline decoration-border underline-offset-2"
          >
            {pub.address ? pub.address : 'address unknown'}
            {pub.postcode ? `, ${pub.postcode}` : ''}
          </a>
          <p className="mt-1 font-mono text-[12px] text-ink-muted">
            {pub.council} · {councilVisited} of {councilPubs.length} drunk
          </p>
        </div>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={onToggle}
          disabled={pending}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-medium transition-transform active:scale-[0.98] disabled:opacity-50 ${
            visited ? 'bg-brass-wash text-brass' : 'bg-ink text-bg'
          }`}
        >
          {visited ? (
            <>
              <CheckIcon width={18} height={18} /> Drunk here
            </>
          ) : (
            'Been here? Mark it'
          )}
        </button>
      </div>

      <div className="mt-2.5 flex gap-2.5">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-[14px] font-medium text-ink-secondary"
        >
          <CompassIcon width={16} height={16} />
          Get me there
        </a>
        {pub.website ? (
          <a
            href={pub.website}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center rounded-xl border border-border px-4 text-[14px] font-medium text-ink-secondary"
          >
            Website
          </a>
        ) : null}
      </div>

      {visited ? (
        <button
          type="button"
          onClick={onToggle}
          disabled={pending}
          className="mt-2.5 flex items-center gap-1.5 text-[13px] text-ink-muted disabled:opacity-50"
        >
          <UndoIcon width={14} height={14} />
          Undo — not drunk after all
        </button>
      ) : null}
    </div>
  )
}
