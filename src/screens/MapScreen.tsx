import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import type { Council, Pub } from '../lib/types'
import { HOME } from '../lib/geo'
import { pintMarkerHtml, pintMarkerLayout } from '../lib/pintIcon'
import { BottomSheet } from '../components/BottomSheet'
import { PubDetail } from '../components/PubDetail'

const MARKER_SIZE = 40

type CouncilFilter = 'all' | Council

const COUNCIL_FILTERS: { id: CouncilFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Islington', label: 'Islington' },
  { id: 'Hackney', label: 'Hackney' },
]

type PubMarker = L.Marker & { __visited?: boolean; __council?: Council }

function pinDivIcon(visited: boolean) {
  const { boxW, boxH } = pintMarkerLayout(MARKER_SIZE)
  return L.divIcon({
    html: pintMarkerHtml({ visited, size: MARKER_SIZE }),
    className: 'pint-marker',
    iconSize: [boxW, boxH],
    // anchor sits at the bottom-centre of the glass itself (the hit box
    // is bottom-aligned to it), not the padded touch-target box
    iconAnchor: [boxW / 2, boxH],
    popupAnchor: [0, -boxH],
  })
}

export function MapScreen({
  pubs,
  visitedIds,
  pending,
  onToggle,
}: {
  pubs: Pub[]
  visitedIds: Set<string>
  pending: Set<string>
  onToggle: (pubId: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [selected, setSelected] = useState<Pub | null>(null)
  const [councilFilter, setCouncilFilter] = useState<CouncilFilter>('all')

  // init map + markers once pubs are loaded
  useEffect(() => {
    if (!containerRef.current || mapRef.current || pubs.length === 0) return

    const map = L.map(containerRef.current, {
      // default top-left zoom control is disabled; a thumb-friendly one is
      // added at bottom-right below (was previously duplicated — both rendered)
      zoomControl: false,
      attributionControl: true,
    }).setView([HOME.lat, HOME.lon], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 55,
      iconCreateFunction: (clusterObj) => {
        const children = clusterObj.getAllChildMarkers()
        const count = children.length
        const allVisited = children.every((m) => (m as L.Marker & { __visited?: boolean }).__visited)
        return L.divIcon({
          html: `<div class="pint-cluster${allVisited ? ' is-full' : ''}">${count}</div>`,
          className: '',
          iconSize: [40, 40],
        })
      },
    })

    const markers = markersRef.current
    pubs.forEach((pub) => {
      const marker = L.marker([pub.lat, pub.lon], {
        icon: pinDivIcon(visitedIds.has(pub.id)),
      }) as PubMarker
      marker.__visited = visitedIds.has(pub.id)
      marker.__council = pub.council
      marker.on('click', () => setSelected(pub))
      markers.set(pub.id, marker)
      cluster.addLayer(marker)
    })

    cluster.addTo(map)
    map.addControl(L.control.zoom({ position: 'bottomright' }))

    mapRef.current = map
    clusterRef.current = cluster

    return () => {
      map.remove()
      mapRef.current = null
      clusterRef.current = null
      markers.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubs])

  // keep marker icons in sync with visited state without rebuilding the map
  useEffect(() => {
    for (const [id, marker] of markersRef.current) {
      const isVisited = visitedIds.has(id)
      const m = marker as PubMarker
      if (m.__visited !== isVisited) {
        m.__visited = isVisited
        marker.setIcon(pinDivIcon(isVisited))
      }
    }
    clusterRef.current?.refreshClusters()
  }, [visitedIds])

  // show/hide markers by council without rebuilding the map or losing marker state
  useEffect(() => {
    const cluster = clusterRef.current
    if (!cluster) return
    for (const marker of markersRef.current.values()) {
      const m = marker as PubMarker
      const shouldShow = councilFilter === 'all' || m.__council === councilFilter
      const isShown = cluster.hasLayer(marker)
      if (shouldShow && !isShown) cluster.addLayer(marker)
      if (!shouldShow && isShown) cluster.removeLayer(marker)
    }
  }, [councilFilter, pubs])

  return (
    <div className="relative min-h-[100dvh]">
      <div ref={containerRef} className="absolute inset-0" />
      <div
        className="absolute inset-x-0 top-0 z-20 flex justify-center gap-1.5 px-4"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
      >
        {COUNCIL_FILTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCouncilFilter(c.id)}
            className={`h-8 rounded-full border px-3.5 text-[13px] font-medium shadow-[0_2px_8px_rgba(22,19,14,0.12)] backdrop-blur transition-colors ${
              councilFilter === c.id
                ? 'border-brass bg-brass text-bg'
                : 'border-border bg-surface/95 text-ink-secondary'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected ? (
          <PubDetail
            pub={selected}
            visited={visitedIds.has(selected.id)}
            pending={pending.has(selected.id)}
            onToggle={() => onToggle(selected.id)}
          />
        ) : null}
      </BottomSheet>
    </div>
  )
}
