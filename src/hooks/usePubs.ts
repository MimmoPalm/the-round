import { useEffect, useState } from 'react'
import type { Pub } from '../lib/types'
import { makePubId } from '../lib/pubId'

interface RawPub {
  name: string
  address: string
  postcode: string
  lat: number
  lon: number
  website: string
}

export function usePubs() {
  const [pubs, setPubs] = useState<Pub[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/data/pubs.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load pubs (${res.status})`)
        return res.json()
      })
      .then((raw: RawPub[]) => {
        if (cancelled) return
        const withIds: Pub[] = raw.map((p) => ({ ...p, id: makePubId(p) }))
        setPubs(withIds)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message ?? 'Failed to load pubs')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { pubs, loading, error }
}
