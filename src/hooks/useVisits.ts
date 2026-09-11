import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LeaderboardRow, Visit } from '../lib/types'
import { fetchVisits, postVisit } from '../lib/supabase'
import { getHiddenPubIds, setHidden } from '../lib/localOverrides'
import { currentTier } from '../lib/tiers'

export function useVisits(player: string | null) {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hidden, setHiddenState] = useState<Set<string>>(() => (player ? getHiddenPubIds(player) : new Set()))
  const [pending, setPending] = useState<Set<string>>(new Set())
  const [milestone, setMilestone] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const rows = await fetchVisits()
      setVisits(rows)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the leaderboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    setHiddenState(player ? getHiddenPubIds(player) : new Set())
  }, [player])

  // distinct pub_ids per player, de-duplicated (append-only backend can
  // contain repeat rows for the same pub — count each pub once)
  const visitedByPlayer = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const v of visits) {
      if (!map.has(v.player)) map.set(v.player, new Set())
      map.get(v.player)!.add(v.pub_id)
    }
    return map
  }, [visits])

  const myVisitedIds = useMemo(() => {
    if (!player) return new Set<string>()
    const remote = visitedByPlayer.get(player) ?? new Set<string>()
    const result = new Set(remote)
    for (const id of hidden) result.delete(id)
    return result
  }, [player, visitedByPlayer, hidden])

  const leaderboard = useMemo<LeaderboardRow[]>(() => {
    const rows = [...visitedByPlayer.entries()]
      .map(([p, ids]) => ({ player: p, count: ids.size }))
      .sort((a, b) => b.count - a.count || a.player.localeCompare(b.player))
    return rows.map((r, i) => ({ ...r, rank: i + 1 }))
  }, [visitedByPlayer])

  const toggleVisit = useCallback(
    async (pubId: string) => {
      if (!player) return
      const isVisited = myVisitedIds.has(pubId)

      if (isVisited) {
        const next = setHidden(player, pubId, true)
        setHiddenState(next)
        return
      }

      // unhide if it was a remote visit we'd hidden
      if (hidden.has(pubId)) {
        const next = setHidden(player, pubId, false)
        setHiddenState(next)
        return
      }

      const beforeCount = myVisitedIds.size
      setPending((p) => new Set(p).add(pubId))
      // optimistic row so the UI ticks instantly
      setVisits((v) => [...v, { player, pub_id: pubId, created_at: new Date().toISOString() }])
      try {
        await postVisit(player, pubId)
        const afterTier = currentTier(beforeCount + 1)
        const beforeTier = currentTier(beforeCount)
        if (afterTier && afterTier.name !== beforeTier?.name) {
          setMilestone(afterTier.name)
        }
      } catch (err) {
        // roll back optimistic tick on failure
        setVisits((v) => {
          const idx = v.findIndex((r) => r.player === player && r.pub_id === pubId)
          if (idx === -1) return v
          const copy = [...v]
          copy.splice(idx, 1)
          return copy
        })
        setError(err instanceof Error ? err.message : 'Could not save that tick — try again')
      } finally {
        setPending((p) => {
          const copy = new Set(p)
          copy.delete(pubId)
          return copy
        })
      }
    },
    [player, myVisitedIds, hidden],
  )

  const clearMilestone = useCallback(() => setMilestone(null), [])

  return {
    loading,
    error,
    leaderboard,
    myVisitedIds,
    pending,
    toggleVisit,
    milestone,
    clearMilestone,
    refresh,
  }
}
