import type { Pub } from '../lib/types'
import { distanceKm, formatDistance, HOME } from '../lib/geo'
import { PintIcon } from './PintIcon'
import { CheckIcon, UndoIcon } from './icons'

export function PubDetail({
  pub,
  visited,
  pending,
  onToggle,
}: {
  pub: Pub
  visited: boolean
  pending?: boolean
  onToggle: () => void
}) {
  const dist = formatDistance(distanceKm(HOME, pub))

  return (
    <div className="px-5 pb-2 pt-1">
      <div className="flex items-start gap-3">
        <PintIcon visited={visited} size={30} className={visited ? 'animate-tick-pop' : ''} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[21px] font-semibold leading-snug text-ink">{pub.name}</h2>
          <p className="mt-0.5 text-[14px] text-ink-secondary">
            {pub.address ? pub.address : 'address unknown'}
            {pub.postcode ? `, ${pub.postcode}` : ''}
          </p>
          <p className="mt-1 font-mono text-[12px] text-ink-muted">{dist} from home</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={onToggle}
          disabled={pending}
          className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-[15px] font-medium transition-transform active:scale-[0.98] disabled:opacity-50 ${
            visited ? 'bg-brass-wash text-brass' : 'bg-ink text-bg'
          }`}
        >
          {visited ? (
            <>
              <CheckIcon width={18} height={18} /> Ticked
            </>
          ) : (
            'Tick it off'
          )}
        </button>
        {pub.website ? (
          <a
            href={pub.website}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center rounded-xl border border-border px-4 text-[14px] font-medium text-ink-secondary"
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
          Undo tick
        </button>
      ) : null}
    </div>
  )
}
