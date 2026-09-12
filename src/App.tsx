import { useEffect, useMemo, useState } from 'react'
import { getPlayer } from './lib/player'
import { usePubs } from './hooks/usePubs'
import { useVisits } from './hooks/useVisits'
import { useShareCard } from './hooks/useShareCard'
import { useBadgeUnlockToast } from './hooks/useBadgeToast'
import { buildPlayerStats } from './lib/stats'
import { buildBadges } from './lib/badges'
import { StartScreen } from './screens/StartScreen'
import { MapScreen } from './screens/MapScreen'
import { ListScreen } from './screens/ListScreen'
import { LeaderboardScreen } from './screens/LeaderboardScreen'
import { RouletteScreen } from './screens/RouletteScreen'
import { BadgesScreen } from './screens/BadgesScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { BottomNav } from './components/BottomNav'
import { LeaderboardBar } from './components/LeaderboardBar'
import { MilestoneBanner } from './components/MilestoneBanner'
import { BottomSheet } from './components/BottomSheet'
import { PubDetail } from './components/PubDetail'
import type { Pub } from './lib/types'

export type Screen = 'map' | 'list' | 'leaderboard' | 'roulette' | 'badges' | 'profile'

export default function App() {
  const [player, setPlayerState] = useState<string | null>(() => getPlayer())
  const [screen, setScreen] = useState<Screen>('map')
  const [roulettePick, setRoulettePick] = useState<Pub | null>(null)

  const { pubs, loading: pubsLoading, error: pubsError } = usePubs()
  const {
    visits,
    leaderboard,
    myVisitedIds,
    pending,
    toggleVisit,
    error: visitsError,
  } = useVisits(player)
  const { share: shareCard, sharing: cardSharing, shareError, clearShareError } = useShareCard()

  const myStats = useMemo(
    () => buildPlayerStats(pubs, myVisitedIds, player ?? ''),
    [pubs, myVisitedIds, player],
  )

  const myBadges = useMemo(
    () => buildBadges(pubs, visits, player ?? '', myVisitedIds),
    [pubs, visits, player, myVisitedIds],
  )

  const { current: unlockedBadge, dismiss: dismissUnlock } = useBadgeUnlockToast(myBadges, player ?? '')

  useEffect(() => {
    if (!shareError) return
    const t = setTimeout(clearShareError, 4000)
    return () => clearTimeout(t)
  }, [shareError, clearShareError])

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
      {unlockedBadge ? (
        <MilestoneBanner badge={unlockedBadge} onDone={dismissUnlock} onShare={() => shareCard(myStats)} />
      ) : null}

      {visitsError ? (
        <div className="fixed inset-x-0 top-0 z-40 bg-ink px-4 py-1.5 text-center text-[12px] text-bg">
          {visitsError}
        </div>
      ) : shareError ? (
        <div className="fixed inset-x-0 top-0 z-40 bg-ink px-4 py-1.5 text-center text-[12px] text-bg">
          {shareError}
        </div>
      ) : null}

      {screen === 'map' && (
        <MapScreen pubs={pubs} visitedIds={myVisitedIds} pending={pending} onToggle={toggleVisit} />
      )}
      {screen === 'list' && (
        <ListScreen pubs={pubs} visitedIds={myVisitedIds} pending={pending} onToggle={toggleVisit} />
      )}
      {screen === 'leaderboard' && (
        <LeaderboardScreen
          leaderboard={leaderboard}
          totalPubs={pubs.length}
          player={player}
          onShare={() => shareCard(myStats)}
          sharing={cardSharing}
        />
      )}
      {screen === 'roulette' && (
        <RouletteScreen pubs={pubs} visitedIds={myVisitedIds} onOpenPub={setRoulettePick} />
      )}
      {screen === 'badges' && (
        <BadgesScreen badges={myBadges} onShare={() => shareCard(myStats)} sharing={cardSharing} />
      )}
      {screen === 'profile' && (
        <ProfileScreen
          player={player}
          pubs={pubs}
          visitedIds={myVisitedIds}
          pending={pending}
          onToggle={toggleVisit}
          leaderboard={leaderboard}
          stats={myStats}
          badges={myBadges}
        />
      )}

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
