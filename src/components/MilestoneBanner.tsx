import { useEffect, useState } from 'react'
import { CloseIcon, ShareIcon } from './icons'

const COPY: Record<string, string> = {
  Local: 'Local. You know where the good stool is now.',
  Regular: 'Regular. The bar staff are starting to recognise you.',
  Legend: 'Legend. Buy yourself one on the house.',
  Governor: 'Governor. Islington and Hackney answer to you now.',
}

export function MilestoneBanner({
  tier,
  onDone,
  onShare,
}: {
  tier: string
  onDone: () => void
  onShare: () => Promise<void>
}) {
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    const t = setTimeout(onDone, 5600)
    return () => clearTimeout(t)
  }, [onDone])

  const handleShare = async () => {
    setSharing(true)
    try {
      await onShare()
    } finally {
      setSharing(false)
      onDone()
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[max(env(safe-area-inset-top),16px)]">
      <div className="animate-banner-in pointer-events-auto w-[min(92vw,380px)] rounded-2xl border border-border bg-surface p-3.5 shadow-[0_6px_24px_rgba(22,19,14,0.18)]">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-[14px] leading-snug text-ink">
            <span className="font-semibold text-brass">{tier}</span>
            {' — '}
            {COPY[tier] ?? 'New tier unlocked.'}
          </p>
          <button
            type="button"
            onClick={onDone}
            aria-label="Dismiss"
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-ink-muted"
          >
            <CloseIcon width={13} height={13} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleShare}
          disabled={sharing}
          className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-ink text-[13px] font-medium text-bg transition-opacity active:scale-[0.98] disabled:opacity-60"
        >
          <ShareIcon width={14} height={14} />
          {sharing ? 'Preparing card…' : 'Share this milestone'}
        </button>
      </div>
    </div>
  )
}
