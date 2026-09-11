import { type ReactNode, useEffect } from 'react'
import { CloseIcon } from './icons'

export function BottomSheet({
  open,
  onClose,
  children,
  fullScreen = false,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  fullScreen?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-ink/35"
        onClick={onClose}
      />
      <div
        className={`animate-sheet-up relative w-full max-w-xl overflow-y-auto rounded-t-2xl border-t border-border bg-surface shadow-[0_-8px_30px_rgba(22,19,14,0.18)] ${
          fullScreen ? 'min-h-[85dvh]' : 'max-h-[80dvh]'
        }`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        <div className="sticky top-0 flex justify-center bg-surface pt-2.5 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-ink-secondary"
        >
          <CloseIcon width={20} height={20} />
        </button>
        {children}
      </div>
    </div>
  )
}
