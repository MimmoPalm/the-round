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
 * Append-only tick. There is no delete endpoint on the backend, so
 * "unticking" is handled entirely client-side (see lib/localVisits.ts) —
 * we simply stop counting the pub locally. If the user re-ticks it later
 * we post a fresh row; the leaderboard count is de-duplicated per pub_id
 * per player, so duplicate rows from re-ticking never inflate the score.
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
