import { useEffect } from 'react'

const COPY: Record<string, string> = {
  Local: 'Local. You know where the good stool is now.',
  Regular: 'Regular. The bar staff are starting to recognise you.',
  'Legend of N1': 'Legend of N1. Buy yourself one on the house.',
  Governor: 'Governor. Islington answers to you now.',
}

export function MilestoneBanner({ tier, onDone }: { tier: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 950)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[max(env(safe-area-inset-top),16px)]">
      <div className="animate-banner-in pointer-events-auto rounded-full border border-border bg-surface px-5 py-2.5 shadow-[0_6px_24px_rgba(22,19,14,0.18)]">
        <p className="font-display text-[15px] leading-tight text-ink">
          <span className="font-semibold text-brass">{tier}</span>
          {' — '}
          {COPY[tier] ?? 'New tier unlocked.'}
        </p>
      </div>
    </div>
  )
}
