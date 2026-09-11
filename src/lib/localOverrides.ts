/**
 * The backend is append-only (no DELETE endpoint). Unticking a pub is
 * therefore implemented client-side only: we remember "hidden" pub ids
 * per player in localStorage and subtract them from the remote visit
 * set when rendering. The remote row is never removed — if the same
 * pub is ticked again we just drop it from the hidden set (no duplicate
 * POST, since the remote row still exists).
 *
 * Limitation (documented per spec): hiding a tick is local to this
 * device/browser. On a fresh device the pub will show as visited again
 * because the remote row is still there — this is the accepted
 * trade-off for a no-login, no-gate app with an append-only store.
 */
const key = (player: string) => `the-round:hidden:${player}`

export function getHiddenPubIds(player: string): Set<string> {
  try {
    const raw = localStorage.getItem(key(player))
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function setHidden(player: string, pubId: string, hidden: boolean): Set<string> {
  const set = getHiddenPubIds(player)
  if (hidden) set.add(pubId)
  else set.delete(pubId)
  try {
    localStorage.setItem(key(player), JSON.stringify([...set]))
  } catch {
    // ignore
  }
  return set
}
