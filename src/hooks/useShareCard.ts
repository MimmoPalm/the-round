import { useCallback, useState } from 'react'
import { renderShareCard } from '../lib/shareCard'
import { shareOrDownload } from '../lib/share'
import type { PlayerStats } from '../lib/stats'

export function useShareCard() {
  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  const share = useCallback(async (stats: PlayerStats) => {
    setSharing(true)
    setShareError(null)
    try {
      const blob = await renderShareCard(stats)
      const filename = `the-round-${stats.count}-pubs.png`
      await shareOrDownload(blob, filename, {
        title: 'The Round',
        text: `${stats.player} has ticked ${stats.count} pub${stats.count === 1 ? '' : 's'} on The Round 🍺`,
      })
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'Could not create the share card')
    } finally {
      setSharing(false)
    }
  }, [])

  const clearShareError = useCallback(() => setShareError(null), [])

  return { share, sharing, shareError, clearShareError }
}
