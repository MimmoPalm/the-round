export type Council = 'Islington' | 'Hackney'

export interface Pub {
  id: string
  name: string
  address: string
  postcode: string
  lat: number
  lon: number
  website: string
  council: Council
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

export type TierName = 'Local' | 'Regular' | 'Legend' | 'Governor'

export interface Tier {
  name: TierName
  threshold: number
}
