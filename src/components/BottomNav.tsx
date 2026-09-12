import { MapIcon, ListIcon, TrophyIcon, DiceIcon, CrownIcon, UserIcon } from './icons'
import type { Screen } from '../App'

const TABS: { id: Screen; label: string; Icon: typeof MapIcon }[] = [
  { id: 'map', label: 'Map', Icon: MapIcon },
  { id: 'list', label: 'List', Icon: ListIcon },
  { id: 'leaderboard', label: 'Board', Icon: TrophyIcon },
  { id: 'roulette', label: 'Roulette', Icon: DiceIcon },
  { id: 'badges', label: 'Badges', Icon: CrownIcon },
  { id: 'profile', label: 'Profile', Icon: UserIcon },
]

export function BottomNav({ active, onChange }: { active: Screen; onChange: (s: Screen) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-xl items-stretch">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors"
              style={{ color: isActive ? 'var(--color-brass)' : 'var(--color-ink-muted)' }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon width={22} height={22} />
              <span className="text-[10.5px] font-medium tracking-wide">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
