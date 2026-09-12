import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LeaderboardRow, Visit } from '../lib/types'
import { deleteVisit, fetchVisits, postVisit } from '../lib/supabase'
import { currentTier } from '../lib/tiers'

export function useVisits(player: string | null) {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    return new Set(visitedByPlayer.get(player) ?? new Set<string>())
  }, [player, visitedByPlayer])

  const leaderboard = useMemo<LeaderboardRow[]>(() => {
    const rows = [...visitedByPlayer.entries()]
      .map(([p, ids]) => ({ player: p, count: ids.size }))
      .sort((a, b) => b.count - a.count || a.player.localeCompare(b.player))
    return rows.map((r, i) => ({ ...r, rank: i + 1 }))
  }, [visitedByPlayer])

  const toggleVisit = useCallback(
    async (pubId: string) => {
      if (!player) return
      const actingPlayer = player
      const isVisited = myVisitedIds.has(pubId)

      if (isVisited) {
        // optimistic untick: pull every local row for this player+pub (the
        // backend is append-friendly, so a re-tick earlier could have left
        // more than one row) so the pin flips back instantly
        const removed = visits.filter((v) => v.player === actingPlayer && v.pub_id === pubId)
        setPending((p) => new Set(p).add(pubId))
        setVisits((v) => v.filter((r) => !(r.player === actingPlayer && r.pub_id === pubId)))
        try {
          await deleteVisit(actingPlayer, pubId)
        } catch (err) {
          // only roll back if we're still acting as the same identity —
          // never resurrect a tick into a player it doesn't belong to
          if (player === actingPlayer) {
            setVisits((v) => [...v, ...removed])
            setError(err instanceof Error ? err.message : 'Could not undo that tick — try again')
          }
        } finally {
          setPending((p) => {
            const copy = new Set(p)
            copy.delete(pubId)
            return copy
          })
        }
        return
      }

      const beforeCount = myVisitedIds.size
      setPending((p) => new Set(p).add(pubId))
      // optimistic row so the UI ticks instantly
      setVisits((v) => [...v, { player: actingPlayer, pub_id: pubId, created_at: new Date().toISOString() }])
      try {
        await postVisit(actingPlayer, pubId)
        const afterTier = currentTier(beforeCount + 1)
        const beforeTier = currentTier(beforeCount)
        if (afterTier && afterTier.name !== beforeTier?.name) {
          setMilestone(afterTier.name)
        }
      } catch (err) {
        // roll back optimistic tick on failure
        if (player === actingPlayer) {
          setVisits((v) => {
            const idx = v.findIndex((r) => r.player === actingPlayer && r.pub_id === pubId)
            if (idx === -1) return v
            const copy = [...v]
            copy.splice(idx, 1)
            return copy
          })
          setError(err instanceof Error ? err.message : 'Could not save that tick — try again')
        }
      } finally {
        setPending((p) => {
          const copy = new Set(p)
          copy.delete(pubId)
          return copy
        })
      }
    },
    [player, myVisitedIds, visits],
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
