import { useState, type FormEvent } from 'react'
import { setPlayer } from '../lib/player'
import { Logo } from '../components/Logo'

export function StartScreen({ onStart, totalPubs }: { onStart: (name: string) => void; totalPubs: number }) {
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const canSubmit = firstName.trim().length > 0 && surname.trim().length > 0

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const name = setPlayer(firstName, surname)
    onStart(name)
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="mt-3 text-center text-[15px] leading-snug text-ink-secondary">
          {totalPubs > 0 ? `${totalPubs} pubs across Islington and Hackney.` : 'Every pub across Islington and Hackney.'}{' '}
          Tick them off, one round at a time.
        </p>

        <form onSubmit={handleSubmit} className="mt-9 space-y-3.5">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
              Name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Name"
              className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[16px] text-ink placeholder:text-ink-muted focus:border-brass focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="surname" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
              Surname
            </label>
            <input
              id="surname"
              type="text"
              autoComplete="family-name"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Surname"
              className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[16px] text-ink placeholder:text-ink-muted focus:border-brass focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-2 h-12 w-full rounded-xl bg-ink text-[16px] font-medium text-bg transition-transform active:scale-[0.98] disabled:opacity-35"
          >
            Start the crawl
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] leading-snug text-ink-muted">
          No password, no login. Anyone can enter any name — it's the honour system, same as
          buying your round.
        </p>
      </div>
    </div>
  )
}
