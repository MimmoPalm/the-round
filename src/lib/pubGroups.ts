import type { Pub } from './types'

/** Groups pubs by postcode district (the bit before the space, e.g. "N1"),
 * each group sorted by name, groups sorted alphabetically with pubs
 * missing a postcode pushed to the end — shared by the pub list and the
 * profile screen's "pubs I've drunk at" list so they never disagree. */
export function groupByPostcode(pubs: Pub[]): [string, Pub[]][] {
  const byPostcode = new Map<string, Pub[]>()
  for (const p of pubs) {
    const key = p.postcode ? p.postcode.split(' ')[0] : 'Unknown'
    if (!byPostcode.has(key)) byPostcode.set(key, [])
    byPostcode.get(key)!.push(p)
  }
  for (const list of byPostcode.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }
  return [...byPostcode.entries()].sort((a, b) => {
    if (a[0] === 'Unknown') return 1
    if (b[0] === 'Unknown') return -1
    return a[0].localeCompare(b[0])
  })
}
