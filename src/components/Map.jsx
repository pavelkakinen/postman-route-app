import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Center on Pärnu, Estonia
const PARNU = [58.385, 24.5]

function numberedIcon(n, state) {
  // state: 'active' | 'done' | 'pending'
  const bg = state === 'done' ? '#9ca3af' : state === 'active' ? '#16a34a' : '#3b82f6'
  return L.divIcon({
    className: 'marker-num-icon',
    html: `<div class="marker-num" style="background:${bg}"><span>${n}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

function MapController({ currentStep, geocoded, navigating }) {
  const map = useMap()
  useEffect(() => {
    if (currentStep != null && geocoded[currentStep]) {
      const s = geocoded[currentStep]
      if (navigating && window.innerWidth <= 640) {
        // On mobile the bottom sheet covers ~45% of the screen.
        // Use flyToBounds with padding so the marker lands in the visible top area.
        const bounds = L.latLngBounds([[s.lat, s.lng]]).pad(0.005)
        map.flyToBounds(bounds, {
          paddingTopLeft: [20, 60],
          paddingBottomRight: [20, Math.round(window.innerHeight * 0.48)],
          maxZoom: 16,
          duration: 1,
        })
      } else {
        map.flyTo([s.lat, s.lng], 16, { duration: 1 })
      }
    }
  }, [currentStep, map]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function Map({ stops, routeLine, currentStep, navigating }) {
  const geocoded = stops.filter(s => s.lat != null && s.lng != null)

  return (
    <MapContainer center={PARNU} zoom={13} className="leaflet-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {currentStep != null && (
        <MapController currentStep={currentStep} geocoded={geocoded} navigating={navigating} />
      )}
      {routeLine && (
        <Polyline positions={routeLine} color="#2563eb" weight={4} opacity={0.7} />
      )}
      {geocoded.map((stop, i) => {
        const state =
          currentStep == null ? 'pending'
          : i < currentStep ? 'done'
          : i === currentStep ? 'active'
          : 'pending'
        return (
          <Marker key={i} position={[stop.lat, stop.lng]} icon={numberedIcon(i + 1, state)}>
            <Popup>
              <strong>{i + 1}. {stop.address}</strong>
              {stop.newspaper && <><br />{stop.newspaper}</>}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
