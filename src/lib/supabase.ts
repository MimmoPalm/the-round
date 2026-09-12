import type { Visit } from './types'

// Public anon (publishable) key — safe to ship client-side, RLS governs access.
const SUPABASE_URL = 'https://bqsduvffudeqkgstytjy.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxc2R1dmZmdWRlcWtnc3R5dGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTM5NzYsImV4cCI6MjEwMjI4OTk3Nn0.kcxhI0NiExPBoQzsPqAXLZ96zEf18Y1YXAa6br711i4'
const TABLE = 'the_round_visits'

const baseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
}

export async function fetchVisits(): Promise<Visit[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=player,pub_id,created_at`, {
    headers: baseHeaders,
  })
  if (!res.ok) throw new Error(`Failed to fetch visits (${res.status})`)
  return res.json()
}

/**
 * Append-only tick — posting the same pub twice is harmless (the
 * leaderboard count is de-duplicated per pub_id per player), which keeps
 * re-ticking after an undo simple: no need to check for an existing row
 * first, just post and let the count de-dupe.
 */
export async function postVisit(player: string, pubId: string): Promise<Visit> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      ...baseHeaders,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ player, pub_id: pubId }),
  })
  if (!res.ok) throw new Error(`Failed to post visit (${res.status})`)
  const rows: Visit[] = await res.json()
  return rows[0]
}

/**
 * Untick: deletes every row for this (player, pub) pair server-side via
 * the delete_visit RPC. It only matches rows where both the player name
 * and pub id agree, so a player can only ever undo their own ticks.
 * Returns the number of rows deleted (0 if there was nothing to delete).
 */
export async function deleteVisit(player: string, pubId: string): Promise<number> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/delete_visit`, {
    method: 'POST',
    headers: {
      ...baseHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_player: player, p_pub_id: pubId }),
  })
  if (!res.ok) throw new Error(`Failed to undo visit (${res.status})`)
  const rows = await res.json()
  if (typeof rows === 'number') return rows
  if (Array.isArray(rows)) return Number(rows[0]) || 0
  return Number(rows) || 0
}
