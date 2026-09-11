import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import type { Pub } from '../lib/types'
import { HOME } from '../lib/geo'
import { pintIconSvg } from '../lib/pintIcon'
import { BottomSheet } from '../components/BottomSheet'
import { PubDetail } from '../components/PubDetail'

function pinDivIcon(visited: boolean) {
  return L.divIcon({
    html: pintIconSvg({ visited, size: 26 }),
    className: 'pint-marker',
    iconSize: [26, 26 * 1.3],
    iconAnchor: [13, 26 * 1.3],
    popupAnchor: [0, -26],
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

  // init map + markers once pubs are loaded
  useEffect(() => {
    if (!containerRef.current || mapRef.current || pubs.length === 0) return

    const map = L.map(containerRef.current, {
      zoomControl: true,
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
      const marker = L.marker([pub.lat, pub.lon], { icon: pinDivIcon(visitedIds.has(pub.id)) }) as L.Marker & {
        __visited?: boolean
      }
      marker.__visited = visitedIds.has(pub.id)
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
      const m = marker as L.Marker & { __visited?: boolean }
      if (m.__visited !== isVisited) {
        m.__visited = isVisited
        marker.setIcon(pinDivIcon(isVisited))
      }
    }
    clusterRef.current?.refreshClusters()
  }, [visitedIds])

  return (
    <div className="relative min-h-[100dvh]">
      <div ref={containerRef} className="absolute inset-0" />
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
