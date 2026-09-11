/**
 * Stable pub id scheme: `slug(name)-lat5-lon5`.
 *
 * Derived from the pub's name and coordinates (rounded to 5dp, ~1.1m
 * precision) rather than array index, so ids stay stable even if
 * pubs.json is ever re-ordered or filtered. Never re-derive this from
 * a re-fetched/re-geocoded dataset — it must keep mapping to the same
 * rows already written in Supabase.
 */
const DIACRITICS = /[\u0300-\u036f]/g

export function makePubId(pub: { name: string; lat: number; lon: number }): string {
  const slug = pub.name
    .toLowerCase()
    .normalize('NFKD')
    .replace(DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
    .slice(0, 48)
  const lat = pub.lat.toFixed(5)
  const lon = pub.lon.toFixed(5)
  return `${slug}-${lat}-${lon}`
}
