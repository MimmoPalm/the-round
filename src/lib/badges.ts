import type { Council, Pub, Visit } from './types'

export type BadgeCategory = 'milestone' | 'crown' | 'challenge'

export interface EarnedBadge {
  id: string
  name: string
  /** Shown while locked — what unlocks it. */
  requirement: string
  /** Shown once earned — the celebratory line (banner + trophy case). */
  flavour: string
  category: BadgeCategory
  earned: boolean
  progress?: { current: number; target: number }
}

const COUNCILS: Council[] = ['Islington', 'Hackney']

/** Pub-count thresholds below the "clean sweep" one, named with dry pub
 * humour — the last badge is always the full pub count, whatever that is,
 * so this never drifts if pubs.json grows or shrinks. */
const MILESTONE_STEPS: { threshold: number; name: string; flavour: string }[] = [
  { threshold: 1, name: 'First to the Bar', flavour: 'One down. The bar has officially been set (and cleared).' },
  { threshold: 5, name: 'Getting a Round In', flavour: "Five in. You've got a system now." },
  { threshold: 10, name: 'Double Figures', flavour: 'Into double figures. The bar staff are starting to notice.' },
  { threshold: 25, name: 'Quarter Century', flavour: 'Twenty-five down. A very respectable quarter-century.' },
  { threshold: 50, name: 'Half Century', flavour: 'Fifty pubs. Time for a sit down.' },
  { threshold: 100, name: 'Centurion', flavour: 'A century. Retire to the pavilion and have a lie down.' },
  { threshold: 150, name: "The Landlord's Nod", flavour: "150 in. Landlords across two boroughs now nod when you walk in." },
  { threshold: 200, name: 'Legend of N1', flavour: "200 pubs. They'll be naming a bar stool after you." },
  { threshold: 250, name: 'Last Orders', flavour: "250 down. The bell's gone — but not for you." },
]

function milestoneBadges(count: number, totalPubs: number): EarnedBadge[] {
  const steps = MILESTONE_STEPS.filter((s) => s.threshold < totalPubs)
  const badges = steps.map((s) => ({
    id: `milestone-${s.threshold}`,
    name: s.name,
    requirement: `Tick ${s.threshold} pubs.`,
    flavour: s.flavour,
    category: 'milestone' as const,
    earned: count >= s.threshold,
    progress: { current: Math.min(count, s.threshold), target: s.threshold },
  }))

  badges.push({
    id: `milestone-${totalPubs}`,
    name: 'The Full Round',
    requirement: `Tick all ${totalPubs} pubs.`,
    flavour: 'Every pub. Islington and Hackney have nothing left to give you.',
    category: 'milestone',
    earned: totalPubs > 0 && count >= totalPubs,
    progress: { current: Math.min(count, totalPubs), target: totalPubs },
  })

  return badges
}

function crownBadges(pubs: Pub[], visitedIds: Set<string>): EarnedBadge[] {
  return COUNCILS.map((council) => {
    const list = pubs.filter((p) => p.council === council)
    const visited = list.filter((p) => visitedIds.has(p.id)).length
    return {
      id: `crown-${council}`,
      name: `${council} Crown`,
      requirement: `Tick every pub in ${council}.`,
      flavour: `${council}, conquered. Wear the crown.`,
      category: 'crown' as const,
      earned: list.length > 0 && visited === list.length,
      progress: { current: visited, target: list.length },
    }
  })
}

function hasFivePubsInOneDay(mine: Visit[]): boolean {
  const byDay = new Map<string, Set<string>>()
  for (const v of mine) {
    if (!v.created_at) continue
    const day = new Date(v.created_at).toDateString()
    if (!byDay.has(day)) byDay.set(day, new Set())
    byDay.get(day)!.add(v.pub_id)
  }
  return [...byDay.values()].some((pubIds) => pubIds.size >= 5)
}

function hasBothBoroughs(mine: Visit[], councilById: Map<string, Council>): boolean {
  const seen = new Set<Council>()
  for (const v of mine) {
    const council = councilById.get(v.pub_id)
    if (council) seen.add(council)
  }
  return seen.size >= COUNCILS.length
}

function firstTickWasEarly(mine: Visit[]): boolean {
  const timed = mine.filter((v) => v.created_at)
  if (timed.length === 0) return false
  const earliest = timed.reduce((a, b) => (new Date(a.created_at!) < new Date(b.created_at!) ? a : b))
  return new Date(earliest.created_at!).getHours() < 18
}

function challengeBadges(pubs: Pub[], visits: Visit[], player: string): EarnedBadge[] {
  const mine = visits.filter((v) => v.player === player)
  const councilById = new Map(pubs.map((p) => [p.id, p.council] as const))

  return [
    {
      id: 'challenge-one-night-stand',
      name: 'One Night Stand',
      requirement: 'Tick 5 pubs in a single day.',
      flavour: 'Five pubs, one day. Hydrate.',
      category: 'challenge' as const,
      earned: hasFivePubsInOneDay(mine),
    },
    {
      id: 'challenge-two-boroughs',
      name: 'Two Boroughs',
      requirement: 'Tick at least one pub in both Islington and Hackney.',
      flavour: "Crossed the border and back. Both boroughs, a little worse for wear.",
      category: 'challenge' as const,
      earned: hasBothBoroughs(mine, councilById),
    },
    {
      id: 'challenge-early-doors',
      name: 'Early Doors',
      requirement: 'Log your very first tick before 6pm.',
      flavour: 'In before six. Early doors, as promised.',
      category: 'challenge' as const,
      earned: firstTickWasEarly(mine),
    },
  ]
}

/** All badges for one player — milestones, council crowns and the fun
 * challenge badges — each flagged earned/locked from data already on
 * hand (pubs.json + fetched visits), no extra network calls. */
export function buildBadges(pubs: Pub[], visits: Visit[], player: string, visitedIds: Set<string>): EarnedBadge[] {
  if (!player) return []
  return [
    ...milestoneBadges(visitedIds.size, pubs.length),
    ...crownBadges(pubs, visitedIds),
    ...challengeBadges(pubs, visits, player),
  ]
}
