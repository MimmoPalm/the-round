import type { LeaderboardRow } from '../lib/types'
import { tierProgress } from '../lib/tiers'
import { progressLine } from '../lib/copy'

export function LeaderboardScreen({
  leaderboard,
  totalPubs,
  player,
}: {
  leaderboard: LeaderboardRow[]
  totalPubs: number
  player: string
}) {
  const me = leaderboard.find((r) => r.player === player)
  const { tier, next, toGo } = tierProgress(me?.count ?? 0)

  return (
    <div className="min-h-[100dvh] bg-bg pb-32">
      <header className="px-5 pb-4 pt-6">
        <h1 className="font-display text-[28px] font-semibold text-ink">Leaderboard</h1>
        <p className="mt-1 text-[13.5px] text-ink-secondary">
          Ranked on pubs ticked out of {totalPubs}.
        </p>
        <div className="mt-4 rounded-xl border border-border bg-surface p-4">
          <p className="text-[13px] text-ink-secondary">You're currently</p>
          <p className="mt-0.5 font-display text-[20px] font-semibold text-brass">
            {tier ? tier.name : 'Unranked — go tick one'}
          </p>
          {next ? (
            <p className="mt-1 text-[13px] text-ink-muted">
              {toGo} more to reach <span className="text-ink-secondary">{next.name}</span>.
            </p>
          ) : (
            <p className="mt-1 text-[13px] text-ink-muted">Top tier reached. Islington and Hackney salute you.</p>
          )}
          <p className="mt-2.5 border-t border-border pt-2.5 text-[13px] italic text-ink-secondary">
            {progressLine(me?.count ?? 0, totalPubs)}
          </p>
        </div>
      </header>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-y border-border">
            <th className="w-14 px-4 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">
              Rank
            </th>
            <th className="px-2 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">
              Player
            </th>
            <th className="w-16 px-2 py-2 text-right font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">
              Pubs
            </th>
            <th className="w-16 px-4 py-2 text-right font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-[14px] text-ink-muted">
                No rounds ticked yet. Be the first.
              </td>
            </tr>
          ) : (
            leaderboard.map((row) => {
              const isMe = row.player === player
              return (
                <tr
                  key={row.player}
                  className={`border-b border-border ${isMe ? 'bg-brass-wash' : ''}`}
                >
                  <td className="px-4 py-2.5 font-mono text-[14px] text-ink-muted">
                    {String(row.rank).padStart(2, '0')}
                  </td>
                  <td className="px-2 py-2.5 text-[14.5px] text-ink">
                    {row.player}
                    {isMe ? <span className="ml-1.5 text-[11px] text-brass">you</span> : null}
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono text-[14px] text-ink">{row.count}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[13px] text-ink-muted">
                    {((row.count / totalPubs) * 100).toFixed(1)}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
