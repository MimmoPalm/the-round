import type { Tier } from './types'

export const TIERS: Tier[] = [
  { name: 'Local', threshold: 1 },
  { name: 'Regular', threshold: 10 },
  { name: 'Legend', threshold: 50 },
  { name: 'Governor', threshold: 150 },
]

export function currentTier(visited: number): Tier | null {
  let current: Tier | null = null
  for (const tier of TIERS) {
    if (visited >= tier.threshold) current = tier
  }
  return current
}

export function nextTier(visited: number): Tier | null {
  return TIERS.find((t) => visited < t.threshold) ?? null
}

export function tierProgress(visited: number): { tier: Tier | null; next: Tier | null; toGo: number } {
  const tier = currentTier(visited)
  const next = nextTier(visited)
  return { tier, next, toGo: next ? next.threshold - visited : 0 }
}
