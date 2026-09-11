import { useState } from 'react'
import { getPlayer } from './lib/player'
import { usePubs } from './hooks/usePubs'
import { useVisits } from './hooks/useVisits'
import { StartScreen } from './screens/StartScreen'
import { MapScreen } from './screens/MapScreen'
import { ListScreen } from './screens/ListScreen'
import { LeaderboardScreen } from './screens/LeaderboardScreen'
import { RouletteScreen } from './screens/RouletteScreen'
import { BadgesScreen } from './screens/BadgesScreen'
import { BottomNav } from './components/BottomNav'
import { LeaderboardBar } from './components/LeaderboardBar'
import { MilestoneBanner } from './components/MilestoneBanner'
import { BottomSheet } from './components/BottomSheet'
import { PubDetail } from './components/PubDetail'
import type { Pub } from './lib/types'

export type Screen = 'map' | 'list' | 'leaderboard' | 'roulette' | 'badges'

export default function App() {
  const [player, setPlayerState] = useState<string | null>(() => getPlayer())
  const [screen, setScreen] = useState<Screen>('map')
  const [roulettePick, setRoulettePick] = useState<Pub | null>(null)

  const { pubs, loading: pubsLoading, error: pubsError } = usePubs()
  const {
    leaderboard,
    myVisitedIds,
    pending,
    toggleVisit,
    milestone,
    clearMilestone,
    error: visitsError,
  } = useVisits(player)

  if (!player) {
    return <StartScreen onStart={setPlayerState} totalPubs={pubs.length} />
  }

  if (pubsLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-bg">
        <p className="font-display text-[16px] text-ink-secondary">Pulling your pint…</p>
      </div>
    )
  }

  if (pubsError) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-bg px-6 text-center">
        <p className="text-[14px] text-ink-secondary">Couldn't load the pub list: {pubsError}</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-bg">
      {milestone ? <MilestoneBanner tier={milestone} onDone={clearMilestone} /> : null}

      {visitsError ? (
        <div className="fixed inset-x-0 top-0 z-40 bg-ink px-4 py-1.5 text-center text-[12px] text-bg">
          {visitsError}
        </div>
      ) : null}

      {screen === 'map' && (
        <MapScreen pubs={pubs} visitedIds={myVisitedIds} pending={pending} onToggle={toggleVisit} />
      )}
      {screen === 'list' && (
        <ListScreen pubs={pubs} visitedIds={myVisitedIds} pending={pending} onToggle={toggleVisit} />
      )}
      {screen === 'leaderboard' && (
        <LeaderboardScreen leaderboard={leaderboard} totalPubs={pubs.length} player={player} />
      )}
      {screen === 'roulette' && (
        <RouletteScreen pubs={pubs} visitedIds={myVisitedIds} onOpenPub={setRoulettePick} />
      )}
      {screen === 'badges' && <BadgesScreen pubs={pubs} visitedIds={myVisitedIds} />}

      <BottomSheet open={!!roulettePick} onClose={() => setRoulettePick(null)}>
        {roulettePick ? (
          <PubDetail
            pub={roulettePick}
            visited={myVisitedIds.has(roulettePick.id)}
            pending={pending.has(roulettePick.id)}
            onToggle={() => toggleVisit(roulettePick.id)}
          />
        ) : null}
      </BottomSheet>

      {screen !== 'leaderboard' && (
        <LeaderboardBar
          leaderboard={leaderboard}
          player={player}
          totalPubs={pubs.length}
          onExpand={() => setScreen('leaderboard')}
        />
      )}

      <BottomNav active={screen} onChange={setScreen} />
    </div>
  )
}
