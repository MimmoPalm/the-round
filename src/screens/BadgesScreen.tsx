import { useMemo } from 'react'
import type { EarnedBadge } from '../lib/badges'
import { CompassIcon, CrownIcon, ShareIcon, TrophyIcon } from '../components/icons'

const CATEGORY_META: Record<EarnedBadge['category'], { title: string; blurb: string; Icon: typeof TrophyIcon }> = {
  milestone: { title: 'Milestones', blurb: 'Every pub count that matters.', Icon: TrophyIcon },
  crown: { title: 'Crowns', blurb: 'Clear every pub in a borough.', Icon: CrownIcon },
  challenge: { title: 'Challenges', blurb: 'The odd ones. Earned, not given.', Icon: CompassIcon },
}

export function BadgesScreen({
  badges,
  onShare,
  sharing,
}: {
  badges: EarnedBadge[]
  onShare: () => void
  sharing?: boolean
}) {
  const earnedCount = badges.filter((b) => b.earned).length
  const byCategory = useMemo(() => {
    const groups = new Map<EarnedBadge['category'], EarnedBadge[]>()
    for (const b of badges) {
      if (!groups.has(b.category)) groups.set(b.category, [])
      groups.get(b.category)!.push(b)
    }
    return groups
  }, [badges])

  return (
    <div className="min-h-[100dvh] bg-bg pb-32">
      <header className="px-5 pb-4 pt-6">
        <h1 className="font-display text-[28px] font-semibold text-ink">Badges</h1>
        <p className="mt-1 text-[13.5px] text-ink-secondary">Your trophy case. Earn them by drinking.</p>

        <div className="mt-4 rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
          <p className="font-mono text-[16px] font-semibold text-ink">
            {earnedCount}/{badges.length}
          </p>
          <p className="mt-0.5 text-[10.5px] uppercase tracking-wide text-ink-muted">Badges earned</p>
        </div>

        <button
          type="button"
          onClick={onShare}
          disabled={sharing}
          className="mt-3.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[14px] font-medium text-bg transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          <ShareIcon width={16} height={16} />
          {sharing ? 'Preparing card…' : 'Share your progress'}
        </button>
      </header>

      {(['milestone', 'crown', 'challenge'] as const).map((category) => {
        const list = byCategory.get(category)
        if (!list || list.length === 0) return null
        const meta = CATEGORY_META[category]
        return (
          <section key={category} className="px-5 pb-6">
            <h2 className="font-display text-[17px] font-semibold text-ink">{meta.title}</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-secondary">{meta.blurb}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {list.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} Icon={meta.Icon} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function BadgeCard({ badge, Icon }: { badge: EarnedBadge; Icon: typeof TrophyIcon }) {
  const pct = badge.progress && badge.progress.target > 0 ? Math.round((badge.progress.current / badge.progress.target) * 100) : null

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center ${
        badge.earned ? 'border-brass bg-brass-wash' : 'border-border bg-surface'
      }`}
    >
      <Icon
        width={30}
        height={30}
        className={badge.earned ? 'text-brass' : 'text-ink-muted'}
        style={badge.earned ? { fill: 'var(--color-brass)', fillOpacity: 0.18 } : undefined}
      />
      <span className="font-display text-[15px] font-semibold leading-snug text-ink">{badge.name}</span>
      <span className="text-[11.5px] leading-snug text-ink-secondary">
        {badge.earned ? badge.flavour : badge.requirement}
      </span>
      {!badge.earned && pct !== null ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-brass transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      ) : null}
      {!badge.earned && badge.progress ? (
        <span className="font-mono text-[10.5px] text-ink-muted">
          {badge.progress.current}/{badge.progress.target}
        </span>
      ) : null}
    </div>
  )
}
