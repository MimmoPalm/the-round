import { useEffect, useRef, useState } from 'react'
import type { EarnedBadge } from '../lib/badges'

function seenKey(player: string) {
  return `the-round:badges-seen:${player}`
}

function loadSeen(player: string): { seen: Set<string>; isFirstRun: boolean } {
  try {
    const raw = localStorage.getItem(seenKey(player))
    if (raw === null) return { seen: new Set(), isFirstRun: true }
    return { seen: new Set(JSON.parse(raw)), isFirstRun: false }
  } catch {
    return { seen: new Set(), isFirstRun: true }
  }
}

function saveSeen(player: string, seen: Set<string>) {
  try {
    localStorage.setItem(seenKey(player), JSON.stringify([...seen]))
  } catch {
    // localStorage unavailable — toasts just won't be de-duplicated across sessions
  }
}

/** Seeds the seen-set for a player: on the very first run (no stored key
 * yet) whatever's already earned is treated as pre-seen, so upgrading to
 * this feature doesn't dump every past achievement on someone at once. */
function initialSeen(player: string, badges: EarnedBadge[]): Set<string> {
  const { seen, isFirstRun } = loadSeen(player)
  if (isFirstRun) {
    for (const b of badges) if (b.earned) seen.add(b.id)
    saveSeen(player, seen)
  }
  return seen
}

/**
 * Strava-style "you just unlocked something" toast queue. Persists which
 * badges a player has already been shown so reloading a page never
 * repeats one.
 */
export function useBadgeUnlockToast(badges: EarnedBadge[], player: string) {
  const [seen, setSeen] = useState<Set<string>>(() => initialSeen(player, badges))
  const [queue, setQueue] = useState<EarnedBadge[]>([])
  const prevPlayer = useRef(player)

  // player identity changed (rare — only happens if someone clears their
  // name and starts again) — reload the seen-set for the new player
  useEffect(() => {
    if (prevPlayer.current === player) return
    prevPlayer.current = player
    setSeen(initialSeen(player, badges))
    setQueue([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player])

  useEffect(() => {
    const fresh = badges.filter((b) => b.earned && !seen.has(b.id))
    if (fresh.length === 0) return
    const next = new Set(seen)
    for (const b of fresh) next.add(b.id)
    saveSeen(player, next)
    setSeen(next)
    setQueue((q) => [...q, ...fresh])
  }, [badges, player, seen])

  const current = queue[0] ?? null
  const dismiss = () => setQueue((q) => q.slice(1))

  return { current, dismiss }
}
