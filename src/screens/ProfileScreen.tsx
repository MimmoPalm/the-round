import { useState } from 'react'
import type { EarnedBadge } from '../lib/badges'
import type { LeaderboardRow, Pub } from '../lib/types'
import type { PlayerStats } from '../lib/stats'
import { favouritePostcode } from '../lib/stats'
import { groupByPostcode } from '../lib/pubGroups'
import { APP_URL, INVITE_LINE } from '../lib/copy'
import { shareInviteLink } from '../lib/share'
import { PintIcon } from '../components/PintIcon'
import { BottomSheet } from '../components/BottomSheet'
import { PubDetail } from '../components/PubDetail'
import { CrownIcon, ShareIcon, TrophyIcon } from '../components/icons'

export function ProfileScreen({
  player,
  pubs,
  visitedIds,
  pending,
  onToggle,
  leaderboard,
  stats,
  badges,
}: {
  player: string
  pubs: Pub[]
  visitedIds: Set<string>
  pending: Set<string>
  onToggle: (pubId: string) => void
  leaderboard: LeaderboardRow[]
  stats: PlayerStats
  badges: EarnedBadge[]
}) {
  const [selected, setSelected] = useState<Pub | null>(null)
  const [inviteNote, setInviteNote] = useState<string | null>(null)

  const me = leaderboard.find((r) => r.player === player)
  const pct = stats.totalPubs ? ((stats.count / stats.totalPubs) * 100).toFixed(1) : '0.0'
  const favourite = favouritePostcode(pubs, visitedIds)
  const earnedBadges = badges.filter((b) => b.earned)
  const myPubs = groupByPostcode(pubs.filter((p) => visitedIds.has(p.id)))

  const handleInvite = async () => {
    setInviteNote(null)
    const text = INVITE_LINE(stats.count, stats.totalPubs)
    const result = await shareInviteLink(text, APP_URL)
    if (result === 'copied') setInviteNote('Copied to your clipboard.')
    if (result === 'unsupported') setInviteNote(`${text} ${APP_URL}`)
  }

  return (
    <div className="min-h-[100dvh] bg-bg pb-32">
      <header className="px-5 pb-4 pt-6">
        <h1 className="font-display text-[28px] font-semibold text-ink">My Round</h1>
        <p className="mt-1 text-[13.5px] text-ink-secondary">{player}</p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Stat label="Rank" value={me ? `#${me.rank}` : '—'} />
          <Stat label="Drunk" value={`${stats.count}/${stats.totalPubs}`} />
          <Stat label="Conquered" value={`${pct}%`} />
          <Stat label="Favourite spot" value={favourite ? favourite.code : '—'} />
        </div>

        <button
          type="button"
          onClick={handleInvite}
          className="mt-3.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[14px] font-medium text-bg transition-transform active:scale-[0.98]"
        >
          <ShareIcon width={16} height={16} />
          Invite a friend
        </button>
        {inviteNote ? <p className="mt-2 text-center text-[12px] text-ink-muted">{inviteNote}</p> : null}
      </header>

      <section className="px-5 pb-5">
        <h2 className="flex items-center gap-1.5 font-display text-[17px] font-semibold text-ink">
          <TrophyIcon width={18} height={18} className="text-brass" />
          Badges &amp; crowns
        </h2>
        {earnedBadges.length === 0 ? (
          <p className="mt-1.5 text-[13px] text-ink-muted">None yet — go and earn one.</p>
        ) : (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {earnedBadges.map((b) => (
              <li
                key={b.id}
                className="flex items-center gap-1.5 rounded-full border border-brass bg-brass-wash px-3 py-1.5 text-[12.5px] font-medium text-brass"
              >
                {b.category === 'crown' ? <CrownIcon width={13} height={13} /> : <TrophyIcon width={13} height={13} />}
                {b.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="px-5 font-display text-[17px] font-semibold text-ink">Pubs I've drunk at</h2>
        {myPubs.length === 0 ? (
          <p className="px-5 py-6 text-[13.5px] text-ink-muted">Nothing yet. The round starts with one pint.</p>
        ) : (
          myPubs.map(([postcode, list]) => (
            <section key={postcode} className="mt-3">
              <h3 className="border-y border-border bg-bg/95 px-5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                {postcode} <span className="text-ink-muted/70">· {list.length}</span>
              </h3>
              <ul className="divide-y divide-border">
                {list.map((pub) => (
                  <li key={pub.id} className="flex items-stretch">
                    <span className="flex w-14 flex-shrink-0 items-center justify-center">
                      <PintIcon visited size={22} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelected(pub)}
                      className="flex min-h-11 flex-1 flex-col justify-center py-2 pr-5 text-left"
                    >
                      <span className="text-[15px] leading-tight text-ink">{pub.name}</span>
                      <span className="mt-0.5 text-[12.5px] leading-tight text-ink-secondary">
                        {pub.address || 'address unknown'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </section>

      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected ? (
          <PubDetail
            pub={selected}
            visited={visitedIds.has(selected.id)}
            pending={pending.has(selected.id)}
            onToggle={() => onToggle(selected.id)}
          />
        ) : null}
      </BottomSheet>
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
