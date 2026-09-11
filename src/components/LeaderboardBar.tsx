import type { LeaderboardRow } from '../lib/types'

export function LeaderboardBar({
  leaderboard,
  player,
  totalPubs,
  onExpand,
}: {
  leaderboard: LeaderboardRow[]
  player: string
  totalPubs: number
  onExpand: () => void
}) {
  const me = leaderboard.find((r) => r.player === player)
  const rank = me?.rank
  const count = me?.count ?? 0
  const pct = ((count / totalPubs) * 100).toFixed(1)

  return (
    <button
      type="button"
      onClick={onExpand}
      className="fixed inset-x-0 z-20 flex h-9 items-center justify-center gap-3 border-t border-border bg-ink px-4 text-bg"
      style={{ bottom: 'calc(56px + env(safe-area-inset-bottom))' }}
    >
      <span className="font-mono text-[12px]">{rank ? `#${rank}` : '—'}</span>
      <span className="text-[12.5px] font-medium">
        {count} ticked <span className="text-bg/60">· {pct}% of N1</span>
      </span>
      <span className="text-[11px] text-bg/60">tap for leaderboard ↑</span>
    </button>
  )
}
