import type { Council, Pub } from './types'
import { currentTier } from './tiers'

export interface CouncilStat {
  name: Council
  visited: number
  total: number
}

export interface PlayerStats {
  player: string
  count: number
  totalPubs: number
  tierName: string | null
  councils: CouncilStat[]
}

const COUNCILS: Council[] = ['Islington', 'Hackney']

/** Snapshot of one player's progress — shared by the leaderboard, badges
 * screen and share card, so they never disagree on the numbers. */
export function buildPlayerStats(pubs: Pub[], visitedIds: Set<string>, player: string): PlayerStats {
  const councils = COUNCILS.map((name) => {
    const list = pubs.filter((p) => p.council === name)
    const visited = list.filter((p) => visitedIds.has(p.id)).length
    return { name, visited, total: list.length }
  })
  const tier = currentTier(visitedIds.size)
  return {
    player,
    count: visitedIds.size,
    totalPubs: pubs.length,
    tierName: tier ? tier.name : null,
    councils,
  }
}
