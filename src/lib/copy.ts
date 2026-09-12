import type { DrunkFilter } from './types'

// Dry, British, affectionate progress copy — never memes.
export function progressLine(visited: number, total: number): string {
  const remaining = total - visited
  if (visited === 0) {
    return `${total} pubs, not one of them drunk yet. Islington and Hackney aren't going to drink themselves.`
  }
  if (remaining === 0) {
    return `All ${total} drunk. There is, technically, nothing left to do here.`
  }
  return `${visited} drunk, ${remaining} not drunk yet. Islington and Hackney aren't going to drink themselves.`
}

export function notDrunkCountLine(n: number): string {
  return `${n} pub${n === 1 ? '' : 's'} still waiting to be drunk at.`
}

/** The "visited/unvisited" pair, everywhere — labels only, the underlying
 * filter state stays 'all' | 'drunk' | 'not' (see lib/types.ts). */
export const DRUNK_FILTER_LABELS: Record<DrunkFilter, string> = {
  all: 'All',
  drunk: 'Drunk',
  not: 'Not drunk',
}

const DRUNK_FILTER_ORDER: DrunkFilter[] = ['all', 'drunk', 'not']

export function cycleDrunkFilter(current: DrunkFilter): DrunkFilter {
  return DRUNK_FILTER_ORDER[(DRUNK_FILTER_ORDER.indexOf(current) + 1) % DRUNK_FILTER_ORDER.length]
}

export const INVITE_LINE = (count: number, total: number) =>
  `I've drunk at ${count} of the ${total} pubs on The Round. Come and beat me.`

export const APP_URL = 'https://the-round-brown.vercel.app'
