export interface Pub {
  id: string
  name: string
  address: string
  postcode: string
  lat: number
  lon: number
  website: string
}

export interface Visit {
  id?: number
  player: string
  pub_id: string
  created_at?: string
  notes?: string | null
}

export interface LeaderboardRow {
  player: string
  count: number
  rank: number
}

export type TierName = 'Local' | 'Regular' | 'Legend of N1' | 'Governor'

export interface Tier {
  name: TierName
  threshold: number
}
